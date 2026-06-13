const http = require('http');

http.get('http://127.0.0.1:4000/api/events', (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('BODY:', data.substring(0, 500));
  });
}).on('error', (err) => {
  console.error('ERROR:', err);
});
