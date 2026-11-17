#!/usr/bin/env node
/**
 * Dựng thư mục `dist/` để đưa lên hosting.
 *
 * Lý do phải có bước này: hosting tĩnh (Cloudflare Pages, Netlify, cPanel...)
 * publish MỌI file trong thư mục được trỏ tới. Trỏ thẳng vào gốc repo thì hai
 * file PDF nội bộ, ba bản demo giao diện chưa chốt, CLAUDE.md và README.md đều
 * thành công khai. `dist/` chỉ chứa đúng những gì được phép công bố.
 *
 * Chạy:  node tools/build.js
 * Rồi trỏ Cloudflare Pages vào thư mục `dist`.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

/* ------------------------------------------------------------------
   TÊN MIỀN — sửa đúng một dòng này, hoặc đặt biến môi trường SITE_URL.
   Dùng để sinh thẻ og:/canonical, robots.txt và sitemap.xml.
   ------------------------------------------------------------------ */
const SITE = (process.env.SITE_URL || 'https://CHUA-DAT-TEN-MIEN').replace(/\/+$/, '');

/** File trong assets/ KHÔNG được publish */
const EXCLUDE = [
  'assets/css/demo.css',          // chỉ phục vụ 3 trang demo
  'assets/css/theme-co-thu.css',
  'assets/css/theme-thien-ha.css',
  'assets/css/theme-thanh-tinh.css',
  'assets/js/demo.js',
  'assets/img/bg-scene.svg',      // tranh nền cũ, đã bỏ dùng
  'assets/img/logo-lockup.png',   // bản lockup nền tím, trang web không dùng
  'assets/img/logo-thien-luong.png'
];

const PAGES = ['index.html', 'la-so.html'];

/** Mô tả cho thẻ og: của từng trang */
const META = {
  'index.html': {
    title: 'Thiên Lương — Lập lá số Tử Vi phái Việt Nam',
    desc: 'An đủ hơn 110 sao, đại vận, tiểu hạn, lưu niên và nguyệt hạn. Lịch âm múi giờ Việt Nam (GMT+7). Miễn phí, dữ liệu chỉ nằm trên máy bạn.',
    canonical: '/'
  },
  'la-so.html': {
    title: 'Lá số Tử Vi — Thiên Lương',
    desc: 'Lá số Tử Vi 12 cung, an sao chuẩn trường phái Việt Nam, kèm đại vận, tiểu hạn, lưu niên và nguyệt hạn.',
    canonical: '/la-so.html',
    // Lá số mang thông tin cá nhân (họ tên, ngày giờ sinh) nên không cho Google
    // lập chỉ mục; mở trang này mà không có tham số cũng chỉ ra màn hình trống.
    noindex: true
  }
};

/* ---------------- tiện ích ---------------- */

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function walk(dir, base = dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, base, out);
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

function write(rel, content) {
  const full = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ---------------- thẻ chia sẻ ---------------- */

function metaTags(file) {
  const m = META[file];
  const url = SITE + m.canonical;
  const img = SITE + '/assets/img/og-image.png';
  const lines = [
    '',
    '  <!-- Sinh bởi tools/build.js — đừng sửa tay trong dist/ -->',
    `  <link rel="canonical" href="${esc(url)}">`,
    m.noindex ? '  <meta name="robots" content="noindex, follow">' : '',
    `  <meta property="og:type" content="website">`,
    `  <meta property="og:site_name" content="Thiên Lương">`,
    `  <meta property="og:locale" content="vi_VN">`,
    `  <meta property="og:url" content="${esc(url)}">`,
    `  <meta property="og:title" content="${esc(m.title)}">`,
    `  <meta property="og:description" content="${esc(m.desc)}">`,
    `  <meta property="og:image" content="${esc(img)}">`,
    `  <meta property="og:image:width" content="1200">`,
    `  <meta property="og:image:height" content="630">`,
    `  <meta property="og:image:alt" content="Thiên Lương — Lập lá số Tử Vi phái Việt Nam">`,
    `  <meta name="twitter:card" content="summary_large_image">`,
    `  <meta name="twitter:title" content="${esc(m.title)}">`,
    `  <meta name="twitter:description" content="${esc(m.desc)}">`,
    `  <meta name="twitter:image" content="${esc(img)}">`,
    ''
  ];
  return lines.filter(l => l !== '').join('\n') + '\n';
}

/* ---------------- dựng ---------------- */

function build() {
  if (SITE.includes('CHUA-DAT-TEN-MIEN')) {
    console.error('Chưa đặt tên miền.\n' +
      'Sửa hằng số SITE ở đầu tools/build.js, hoặc chạy:\n' +
      '  SITE_URL=https://tenmien.com node tools/build.js');
    process.exit(1);
  }

  rmrf(DIST);
  fs.mkdirSync(DIST, { recursive: true });

  // 1. assets (trừ danh sách loại)
  let copied = 0;
  for (const rel of walk(path.join(ROOT, 'assets'))) {
    const key = 'assets/' + rel;
    if (EXCLUDE.includes(key)) continue;
    write(key, fs.readFileSync(path.join(ROOT, 'assets', rel)));
    copied++;
  }

  // 2. hai trang HTML, chèn thẻ chia sẻ ngay trước </head>
  for (const file of PAGES) {
    let html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    if (!html.includes('</head>')) throw new Error(`${file}: không tìm thấy </head>`);
    html = html.replace('</head>', metaTags(file) + '</head>');
    write(file, html);
  }

  // 3. robots.txt — chặn trang lá số vì nó chứa thông tin cá nhân
  write('robots.txt',
    'User-agent: *\n' +
    'Allow: /$\n' +
    'Disallow: /la-so.html\n\n' +
    `Sitemap: ${SITE}/sitemap.xml\n`);

  // 4. sitemap.xml — chỉ trang chủ; trang lá số không có nội dung tĩnh để index
  const today = new Date().toISOString().slice(0, 10);
  write('sitemap.xml',
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `  <url>\n    <loc>${SITE}/</loc>\n    <lastmod>${today}</lastmod>\n` +
    '    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n' +
    '</urlset>\n');

  // 5. _headers (Cloudflare Pages / Netlify đều đọc file này)
  //    KHÔNG đặt cache 1 năm cho assets: tên file không có mã băm nội dung, nên
  //    sửa style.css xong khách vẫn giữ bản cũ tới cả năm. 1 ngày là mức an toàn.
  write('_headers',
    '/assets/*\n' +
    '  Cache-Control: public, max-age=86400\n' +
    '\n' +
    '/*\n' +
    '  X-Content-Type-Options: nosniff\n' +
    '  Referrer-Policy: strict-origin-when-cross-origin\n' +
    '  X-Frame-Options: SAMEORIGIN\n' +
    '\n' +
    '/*.html\n' +
    '  Cache-Control: public, max-age=0, must-revalidate\n');

  verify();

  const files = walk(DIST);
  const bytes = files.reduce((n, f) => n + fs.statSync(path.join(DIST, f)).size, 0);
  console.log(`dist/ — ${files.length} file, ${Math.round(bytes / 1024)} KB, tên miền ${SITE}`);
  console.log(files.map(f => '  ' + f).join('\n'));
}

/**
 * Soát chéo: mọi đường dẫn assets/... được nhắc tới trong dist phải tồn tại.
 * Bước này bắt đúng loại lỗi đã xảy ra khi publish bản xem thử: render.js chèn
 * assets/img/logo.svg vào giữa lá số, nhưng file đó không được đóng gói kèm nên
 * logo giữa lá số hiện thành ảnh vỡ — quét HTML không thấy, vì nó nằm trong JS.
 */
function verify() {
  const present = new Set(walk(DIST));
  const refs = new Map();
  for (const f of walk(DIST)) {
    if (!/\.(html|js|css)$/.test(f)) continue;
    const text = fs.readFileSync(path.join(DIST, f), 'utf8');
    for (const m of text.matchAll(/assets\/[A-Za-z0-9._\/-]+/g)) {
      if (!refs.has(m[0])) refs.set(m[0], f);
    }
  }

  const missing = [...refs].filter(([p]) => !present.has(p));
  if (missing.length) {
    console.error('Thiếu file trong dist/ (có mã trỏ tới nhưng không được copy):');
    for (const [p, from] of missing) console.error(`  ${p}  <- ${from}`);
    process.exit(1);
  }

  const unused = [...present].filter(p => p.startsWith('assets/') && !refs.has(p));
  if (unused.length) {
    console.warn('Cảnh báo — file nằm trong dist/ nhưng không chỗ nào dùng:');
    for (const p of unused) console.warn(`  ${p}`);
  }
}

build();
