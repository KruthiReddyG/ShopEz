// Simple API verification script using global fetch (Node 18+)
const base = 'http://localhost:5000/api';

async function req(path, opts = {}){
  try{
    const res = await fetch(base + path, opts);
    const text = await res.text();
    let data;
    try{ data = JSON.parse(text); } catch(e){ data = text; }
    console.log(path, 'STATUS', res.status);
    console.log(JSON.stringify(data, null, 2));
    return { status: res.status, data };
  }catch(err){ console.error('ERR', path, err); return { err }; }
}

async function run(){
  console.log('=== AUTH LOGIN admin ===');
  const adminLogin = await req('/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email:'admin@shopez.com', password:'admin123' }) });
  const adminToken = adminLogin.data?.token;
  const adminUser = adminLogin.data?.user;

  console.log('=== AUTH LOGIN user ===');
  const userLogin = await req('/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email:'user@shopez.com', password:'user123' }) });
  const userToken = userLogin.data?.token;
  const user = userLogin.data?.user;

  console.log('=== GET PRODUCTS ===');
  const products = await req('/products');
  const firstId = products.data && products.data[0]?._id;

  if(firstId){
    console.log('=== GET PRODUCT BY ID ===');
    await req('/products/' + firstId);
  }

  console.log('=== ADMIN CREATE PRODUCT ===');
  const created = await req('/products', { method:'POST', headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + adminToken}, body: JSON.stringify({ name:'API Test Product', description:'test', category:'test', price:1.23, stock:5, discount:0 }) });
  const createdId = created.data?._id;

  if(createdId){
    console.log('=== ADMIN UPDATE PRODUCT ===');
    await req('/products/' + createdId, { method:'PUT', headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + adminToken}, body: JSON.stringify({ price:2.34 }) });

    console.log('=== ADMIN DELETE PRODUCT ===');
    await req('/products/' + createdId, { method:'DELETE', headers:{ Authorization: 'Bearer ' + adminToken } });
  }

  if(userToken && firstId){
    console.log('=== CART ADD ===');
    await req('/cart/add', { method:'POST', headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + userToken}, body: JSON.stringify({ userId: user.id, productId: firstId, quantity:2 }) });

    console.log('=== GET CART ===');
    await req('/cart/' + user.id, { headers: { Authorization: 'Bearer ' + userToken } });

    console.log('=== CART UPDATE ===');
    await req('/cart/update', { method:'PUT', headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + userToken}, body: JSON.stringify({ userId: user.id, productId: firstId, quantity:3 }) });

    console.log('=== CART REMOVE ===');
    await req('/cart/remove', { method:'DELETE', headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + userToken}, body: JSON.stringify({ userId: user.id, productId: firstId }) });

    console.log('=== ORDER CREATE ===');
    // add to cart again for order
    await req('/cart/add', { method:'POST', headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + userToken}, body: JSON.stringify({ userId: user.id, productId: firstId, quantity:1 }) });
    await req('/orders', { method:'POST', headers:{'Content-Type':'application/json', Authorization: 'Bearer ' + userToken}, body: JSON.stringify({ userId: user.id, address:'123 Test St', paymentMethod:'card' }) });

    console.log('=== GET ORDERS USER ===');
    await req('/orders/' + user.id, { headers:{ Authorization: 'Bearer ' + userToken } });
  }

  if(adminToken){
    console.log('=== ADMIN GET USERS ===');
    await req('/admin/users', { headers:{ Authorization: 'Bearer ' + adminToken } });

    console.log('=== ADMIN GET ORDERS ===');
    await req('/admin/orders', { headers:{ Authorization: 'Bearer ' + adminToken } });
  }

  console.log('=== TESTS COMPLETE ===');
}

run();
