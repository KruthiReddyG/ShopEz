const http = require('http');
function get() {
  const opts = { host: '127.0.0.1', port: 5000, path: '/api/products', method: 'GET' };
  const req = http.request(opts, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      console.log('status', res.statusCode);
      console.log('body', d.substring(0, 1000));
    });
  });
  req.on('error', e => { console.error('ERROR', e.message); process.exit(1); });
  req.end();
}
get();
