// proxy.js - serves frontend static files and proxies /api and /whoami in round-robin to backends
const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend'); // serve static files from here
const BACKENDS = ['http://localhost:3000', 'http://localhost:3001'];
let idx = 0;

const proxy = httpProxy.createProxyServer({});
const server = http.createServer((req, res) => {
  // proxy API and whoami requests
  if (req.url.startsWith('/api') || req.url.startsWith('/whoami')) {
    const target = BACKENDS[idx % BACKENDS.length];
    idx++;
    console.log('Proxy ->', target, req.url);
    proxy.web(req, res, { target }, err => {
      console.error('Proxy error', err && err.message ? err.message : err);
      res.writeHead(502, {'Content-Type':'text/plain'});
      res.end('Bad gateway');
    });
    return;
  }

  // serve static frontend files
  const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = path.join(FRONTEND_DIR, decodeURIComponent(urlPath));
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type':'text/plain'});
      res.end('Not found');
    } else {
      // basic content type
      const ext = path.extname(filePath).toLowerCase();
      const contentType = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : 'application/javascript';
      res.writeHead(200, {'Content-Type': contentType});
      res.end(data);
    }
  });
});

const PORT = 8080;
server.listen(PORT, ()=> console.log(`Proxy running on http://localhost:${PORT}`));
