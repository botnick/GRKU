// A small server for render.html: serves the folder, the repository under /repo/, and saves POSTed PNGs to out/.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = process.argv[2]; const extra = process.argv[3];
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.json': 'application/json', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'POST') { const name = path.basename(url.searchParams.get('name')); const chunks = []; req.on('data', (c) => chunks.push(c)); req.on('end', () => { const s = Buffer.concat(chunks).toString(); fs.writeFileSync(path.join(root, 'out', name), Buffer.from(s.split(',')[1], 'base64')); res.end('ok'); }); return; }
  let p = decodeURIComponent(url.pathname);
  const file = p.startsWith('/repo/') ? path.join(extra, p.slice(6)) : path.join(root, p);
  fs.readFile(file, (e, d) => { if (e) { res.statusCode = 404; return res.end(); } res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); res.setHeader('Access-Control-Allow-Origin', '*'); res.end(d); });
}).listen(5288);
