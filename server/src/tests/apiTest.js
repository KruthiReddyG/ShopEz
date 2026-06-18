// Single API test runner
// Ensure JWT secret for in-process server and start it
process.env.JWT_SECRET = process.env.JWT_SECRET || 'shopez_test_secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
// Start the server in-process so tests run reliably
require('../index');
const axios = require('axios');

const api = axios.create({ baseURL: 'http://localhost:5000/api', timeout: 20000 });

const out = (title, ok, data) => console.log(`\n=== ${title} ===\n`, ok ? 'OK' : 'FAIL', '\n', data && typeof data === 'object' ? JSON.stringify(data, null, 2) : data);

async function main() {
  // server started above (in-process)
  // Seed in-memory DB for tests (create admin and demo user + products)
  const User = require('../models/User');
  const Product = require('../models/Product');
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('admin123', salt);
  const userPass = await bcrypt.hash('user123', salt);
  await User.findOneAndUpdate({ email: 'admin@shopez.com' }, { name: 'Admin', email: 'admin@shopez.com', password: adminPass, role: 'admin' }, { upsert: true, new: true });
  await User.findOneAndUpdate({ email: 'user@shopez.com' }, { name: 'Demo User', email: 'user@shopez.com', password: userPass, role: 'user' }, { upsert: true, new: true });
  const productsSeed = [
    { name: 'Wireless Headphones', description: 'High quality sound', category: 'electronics', image: '', price: 99.99, stock: 50, discount: 10 },
    { name: 'Running Shoes', description: 'Comfortable sneakers', category: 'fashion', image: '', price: 79.99, stock: 40, discount: 0 },
    { name: 'Coffee Mug', description: 'Ceramic mug', category: 'home', image: '', price: 12.5, stock: 100, discount: 0 }
  ];
  for (const p of productsSeed) await Product.findOneAndUpdate({ name: p.name }, p, { upsert: true, new: true });
  try {
    // Login admin and user (seeded)
    const adminRes = await api.post('/auth/login', { email: 'admin@shopez.com', password: 'admin123' });
    const adminToken = adminRes.data.token;
    out('Admin login', !!adminToken, adminRes.data.user);

    const userRes = await api.post('/auth/login', { email: 'user@shopez.com', password: 'user123' });
    const userToken = userRes.data.token;
    const userId = userRes.data.user.id;
    out('User login', !!userToken, userRes.data.user);

    const adminApi = axios.create({ baseURL: api.defaults.baseURL, headers: { Authorization: `Bearer ${adminToken}` } });
    const userApi = axios.create({ baseURL: api.defaults.baseURL, headers: { Authorization: `Bearer ${userToken}` } });

    // List products
    const list = await api.get('/products');
    out('GET /products', Array.isArray(list.data), list.data.slice(0,5));

    // Create product as admin
    const newProduct = { name: 'API_TEST_PRODUCT', description: 'Test', category: 'test', price: 5.5, stock: 10, discount: 0 };
    const created = (await adminApi.post('/products', newProduct)).data;
    out('POST /products (admin)', !!created._id, created);

    // Get product
    const p = (await api.get(`/products/${created._id}`)).data;
    out('GET /products/:id', p && p._id === created._id, p);

    // Update product
    const updated = (await adminApi.put(`/products/${created._id}`, { price: 6.0 })).data;
    out('PUT /products/:id (admin)', updated.price === 6.0, updated);

    // Add to cart as user
    const cart = (await userApi.post('/cart/add', { userId, productId: created._id, quantity: 2 })).data;
    out('POST /cart/add', !!cart, cart);

    // Get cart
    const cartGet = (await userApi.get(`/cart/${userId}`)).data;
    out('GET /cart/:userId', !!cartGet, cartGet);

    // Update cart
    const cartUpd = (await userApi.put('/cart/update', { userId, productId: created._id, quantity: 3 })).data;
    out('PUT /cart/update', !!cartUpd, cartUpd);

    // Create order
    const order = (await userApi.post('/orders', { userId, address: '123 Test', paymentMethod: 'card' })).data;
    out('POST /orders', !!order._id, order);

    // Get user orders
    const orders = (await userApi.get(`/orders/${userId}`)).data;
    out('GET /orders/:userId', Array.isArray(orders), orders.slice(0,5));

    // Admin update order status
    const orderUpd = (await adminApi.put(`/orders/status/${order._id}`, { status: 'processing' })).data;
    out('PUT /orders/status/:id (admin)', orderUpd.status === 'processing', orderUpd);

    // Admin get users and orders
    const users = (await adminApi.get('/admin/users')).data;
    out('GET /admin/users', Array.isArray(users), users.slice(0,5));
    const allOrders = (await adminApi.get('/admin/orders')).data;
    out('GET /admin/orders', Array.isArray(allOrders), allOrders.slice(0,5));

    // Cleanup: delete created product
    const del = (await adminApi.delete(`/products/${created._id}`)).data;
    out('DELETE /products/:id (admin)', !!del.message, del);

    console.log('\nAll API tests completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('\nAPI test failed:\n', err && err.response && err.response.data ? err.response.data : err && err.message ? err.message : err);
    console.error('Full error object:', err);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();
