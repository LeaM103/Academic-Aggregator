const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

const proxy = httpProxy.createProxyServer({});
const servers = ['http://localhost:3000', 'http://localhost:3001'];
let counter = 0;

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    // round-robin proxy
    const target = servers[counter % servers.length];
    counter++;
    proxy.web(req, res, { target });
  } else {
    // serve frontend files
    let filePath = path.join(__dirname, 'frontend', req.url === '/' ? 'index.html' : req.url);
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200);
        res.end(content);
      }
    });
  }
});

server.listen(8080, () => console.log('Proxy running on http://localhost:8080'));
