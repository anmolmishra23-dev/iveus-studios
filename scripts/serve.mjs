import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const args = process.argv.slice(2);
const after = key => args.includes(key) ? args[args.indexOf(key)+1] : undefined;
const port = Number(after('--port') || process.env.PORT || 4173);
const host = after('--host') || process.env.HOST || '0.0.0.0';
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.json':'application/json','.txt':'text/plain; charset=utf-8'};
http.createServer(async (req, res) => {
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let filename = path.resolve(root, `.${pathname}`);
    if (filename !== root && !filename.startsWith(root+path.sep)) {res.writeHead(403);res.end();return;}
    if ((await stat(filename)).isDirectory()) filename = path.join(filename,'index.html');
    const data = await readFile(filename);
    res.writeHead(200, {'Content-Type':types[path.extname(filename)] || 'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {res.writeHead(404, {'Content-Type':'text/plain'});res.end('Not found');}
}).listen(port, host, () => console.log(`Iveus preview is available on port ${port}`));
