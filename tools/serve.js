#!/usr/bin/env node
/**
 * Máy chủ tĩnh để chạy thử trên máy cá nhân — KHÔNG dùng cho production.
 *
 * Lý do phải có file này: Cloudflare Pages (nơi web chạy thật) phục vụ
 * `la-so.html` ở CẢ hai đường dẫn `/la-so.html` và `/la-so`. `python -m
 * http.server` thì không: mở `/la-so` là 404, nên link khách lưu từ bản thật
 * đem về máy chạy thử là hỏng, dù mã nguồn chẳng sai gì.
 *
 * Máy chủ này bắt chước đúng cách Cloudflare Pages phân giải đường dẫn:
 *   /            -> index.html
 *   /la-so       -> la-so.html
 *   /la-so.html  -> la-so.html
 * Nhờ vậy những gì chạy đúng ở máy thì lên web thật cũng đúng, và ngược lại.
 *
 * Chạy:  node tools/serve.js          (cổng 8080)
 *        node tools/serve.js 3000     (đổi cổng)
 *
 * Tham số lá số nằm sau dấu `#` nên trình duyệt không gửi lên máy chủ; máy chủ
 * không cần và KHÔNG được đụng tới phần đó.
 */

'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.argv[2]) || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.pdf': 'application/pdf'
};

/** Đường dẫn URL -> file thật, hoặc null nếu không có/đi ra ngoài thư mục dự án */
function giaiDuongDan(urlPath) {
  let rel;
  try { rel = decodeURIComponent(urlPath.split('?')[0]); } catch (e) { return null; }
  rel = rel.replace(/^\/+/, '');
  if (rel === '') rel = 'index.html';

  const ungVien = [rel];
  if (!path.extname(rel)) {
    ungVien.push(rel + '.html');                 // /la-so      -> la-so.html
    ungVien.push(path.posix.join(rel, 'index.html')); // /thu-muc -> thu-muc/index.html
  }

  for (const ten of ungVien) {
    const full = path.resolve(ROOT, ten);
    // chặn ../../ đi ra ngoài thư mục dự án
    if (full !== ROOT && !full.startsWith(ROOT + path.sep)) continue;
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
}

http.createServer((req, res) => {
  const file = giaiDuongDan(req.url || '/');
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 — không có ' + req.url + '\n');
    console.log('404 ' + req.url);
    return;
  }
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store'   // chạy thử: sửa file là F5 thấy ngay
  });
  fs.createReadStream(file).pipe(res);
  console.log('200 ' + req.url);
}).listen(PORT, '127.0.0.1', () => {
  console.log('Tử Vi Thiên Lương — chạy thử tại http://localhost:' + PORT + '/');
  console.log('Phục vụ cả /la-so lẫn /la-so.html, giống Cloudflare Pages. Ctrl+C để dừng.');
});
