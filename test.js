
var http = require('http')

/*
https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_http_request_options_callback
*/

// 获取列表
var req = http.request({
    method:'POST',
    hostname: 'localhost',
    port: 8081,
    path: '/word/list',
}, (res) => {
    
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
      res.on('end', () => {
        console.log('No more data in response.');
      });
  // Do stuff with response
});

req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
});
req.end();
