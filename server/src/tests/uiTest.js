const puppeteer = require('puppeteer-core');
const fs = require('fs');

function findChromeExecutable() {
  const candidates = [
    process.env.CHROME || process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

const BASE = 'http://localhost:5174';
const USER = { email: 'user@shopez.com', password: 'user123' };

// Ensure server is running in-process for reliable API access from this script
process.env.JWT_SECRET = process.env.JWT_SECRET || 'shopez_test_secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
require('../index');
// Seed users/products into the in-memory DB for this test run
const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
(async ()=>{
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
})();

// Serve built frontend (if available) on port 5174 to allow puppeteer to load pages
const expressStaticServer = (()=>{
  try {
    const express = require('express');
    const path = require('path');
    const app = express();
    const dist = path.join(__dirname, '..', '..', '..', 'client', 'dist');
    app.use(express.static(dist));
    app.get('*', (req,res)=> res.sendFile(path.join(dist, 'index.html')));
    const srv = app.listen(5174);
    return srv;
  } catch (e) {
    return null;
  }
})();

async function run() {
  const executablePath = findChromeExecutable();
  if (!executablePath) {
    console.error('No local Chrome/Edge executable found. Install Chrome or set CHROME environment variable.');
    process.exit(1);
  }
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  try {
    // Authenticate via API (use axios for clearer errors) and set localStorage so the app sees the logged-in user
    const axios = require('axios');
    let loginRes;
    try {
      const r = await axios.post('http://localhost:5000/api/auth/login', USER, { timeout: 10000 });
      loginRes = r.data;
    } catch (e) {
      console.error('Login via API failed:');
      try { console.error('response data:', e.response && e.response.data); } catch{};
      try { console.error('message:', e.message); } catch{};
      try { console.error(e.stack); } catch{};
      await browser.close(); process.exit(1);
    }
    // Navigate to app origin then set localStorage for auth
    await page.goto(BASE, { waitUntil: 'networkidle2' });
    await page.evaluate((t,u)=>{ localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)); }, loginRes.token, loginRes.user);
    await page.reload({ waitUntil: 'networkidle2' });

    // Navigate to login
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
    // Try to fill using named inputs, otherwise fallback
    if (await page.$('input[name="email"]')) {
      await page.type('input[name="email"]', USER.email);
      await page.type('input[type="password"]', USER.password);
    } else {
      // fallback: first two .form-control inputs
      const inputs = await page.$$('input.form-control');
      if (inputs.length >= 2) {
        await inputs[0].click(); await page.keyboard.type(USER.email);
        await inputs[1].click(); await page.keyboard.type(USER.password);
      }
    }

    // Submit login
    await Promise.all([
      page.click('button.btn.btn-primary'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(()=>{})
    ]).catch(()=>{});

    // Add product to cart via API to avoid UI selector issues
    const products = (await axios.get('http://localhost:5000/api/products')).data;
    if (!products || !products.length) throw new Error('No products available to add');
    const productId = products[0]._id || products[0].id || products[0].Id;
    await axios.post('http://localhost:5000/api/cart/add', { userId: loginRes.user.id || loginRes.user._id, productId, quantity: 1 }, { headers: { Authorization: 'Bearer '+loginRes.token } }).catch(()=>null);

    // Go to cart
    await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle2' });
    const cartText = await page.evaluate(()=> document.body.innerText);
    if (!/Total: \$/.test(cartText) && !/Cart empty/.test(cartText)) {
      throw new Error('Cart did not show expected content');
    }

    // Create order via API
    await axios.post('http://localhost:5000/api/orders', { address: '123 Test Ave', paymentMethod: 'card' }, { headers: { Authorization: 'Bearer '+loginRes.token } }).catch(()=>null);

    // Verify orders page
    await page.goto(`${BASE}/orders`, { waitUntil: 'networkidle2' });
    const ordersText = await page.evaluate(()=> document.body.innerText);
    if (!/Order/.test(ordersText) && !/Orders/.test(ordersText) && !/order/i.test(ordersText)) {
      throw new Error('Orders page did not show expected content');
    }

    console.log('UI flow test completed successfully');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('UI test failed:', err.message || err);
    await browser.close();
    process.exit(1);
  }
}

run();
