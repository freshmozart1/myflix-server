const http = require('http'),
    url = require('url'),
    fs = require('fs');
http.createServer((request, response) => {
    let addr = request.url,
        q = new URL(addr, 'http://' + request.headers.host),
        filePath = '';
    fs.appendFile((__dirname + '/log.txt'), `Timestamp: ${(new Date()).toString()} Request-URL: ${addr}\n`, (err) => {
        if (err) {
            throw err;
        }
    });
    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/min/documentation.min.html');
    } else {
        filePath = (__dirname + '/min/index.min.html');
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();
    });
}).listen(8080);

console.log('My first Node test server is running on Port 8080.');