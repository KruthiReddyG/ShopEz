const axios = require('axios');
(async ()=>{
  try{
    const p = await axios.get('http://localhost:5000/api/products', {timeout:5000});
    console.log('GET /products', p.status, 'count=', Array.isArray(p.data)?p.data.length:p.data);
  }catch(e){ console.error('GET /products error', e.response? (e.response.status + ' ' + JSON.stringify(e.response.data)) : e.message); }
  try{
    const l = await axios.post('http://localhost:5000/api/auth/login', { email: 'user@shopez.com', password: 'user123' }, { timeout: 5000 });
    console.log('POST /auth/login', l.status, 'tokenPresent=', !!(l.data && l.data.token));
    console.log('login user:', l.data.user);
  }catch(e){ console.error('POST /auth/login error', e.response? (e.response.status + ' ' + JSON.stringify(e.response.data)) : e.message); }
})();
