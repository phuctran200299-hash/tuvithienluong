// Chạy: node tests/ui.test.js
//
// Chốt lại 11 lỗi khách báo (TL-01 … TL-11) và bộ nhận diện của bản demo đã
// duyệt, để lần sửa sau không làm hỏng lại. Không cần trình duyệt: soát trực
// tiếp HTML/CSS/JS và kết quả render.js chạy trên một bản DOM giả tối thiểu.
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; }
  catch (e) { fail++; console.log('✗ ' + name + '\n   ' + e.message); }
}

const FILES = ['index.html', 'la-so.html', 'chuyen-gia.html', 'bai-viet.html', 'dat-lich.html'];
const PAGES = {};
for (const f of FILES) PAGES[f] = read(f);
// Trang chủ giữ giao diện của đợt trước (khách yêu cầu); bốn trang kia dựng theo
// bản demo mới. Nhiều phép kiểm vì thế phải tách hai nhóm.
const CU = ['index.html'];
const MOI = FILES.filter((f) => !CU.includes(f));
const COMMON_JS = read('assets/js/common.js');
const TRANG_MOI_BAT = /trangMoi:\s*true/.test(COMMON_JS);
const INDEX = PAGES['index.html'];
const LASO = PAGES['la-so.html'];
const CSS = read('assets/css/style.css');
const POSTS_JS = read('assets/js/posts.js');

// Tên cũ chỉ còn được phép nằm trong TÊN FILE (logo-tuvithienluong-tim-*.png, tên
// file ảnh tải về) và tên miền — đều không phải chữ khách đọc thấy trên trang.
const bỏTênFile = (s) => s
  .replace(/assets\/[\w./-]+/g, '')
  .replace(/'tuvithienluong-'/g, '')
  .replace(/tuvithienluong\.com/g, '');

/* ---------------- TL-01 — họ tên giữ nguyên thứ tự người dùng nhập -------- */

t('TL-01 ô họ tên tắt autocomplete của trình duyệt', () => {
  for (const f of ['index.html', 'dat-lich.html']) {
    const ô = PAGES[f].match(/<input[^>]*type="text"[^>]*>/)[0];
    assert.match(ô, /autocomplete="off"/, f +
      ': autocomplete="name" khiến Chrome điền lại tên theo thứ tự Tây (Tên Đệm Họ)');
    assert.doesNotMatch(ô, /autocomplete="name"/, f);
  }
});

t('TL-01 không chỗ nào tách/ghép lại chuỗi họ tên', () => {
  for (const f of fs.readdirSync(path.join(ROOT, 'assets/js'))) {
    if (!f.endsWith('.js') || f === 'demo.js') continue;
    const js = read('assets/js/' + f);
    assert.doesNotMatch(js, /\bten\b[^;\n]*\.(split|reverse)\s*\(/i, f + ': có xử lý tách tên');
  }
});

/* ---------------- TL-02 — điện thoại không được cuộn ngang ---------------- */

const MQ = CSS.match(/@media \(max-width: 639px\) \{[\s\S]*?\n\}/g)
  .filter((b) => b.includes('.board'))[0];

t('TL-02 dưới 640px lá số bỏ min-width 940px và vừa khung', () => {
  assert.match(MQ, /\.board:not\(\.exporting\) \{[^}]*min-width: 0;[^}]*width: 100%/);
});

t('TL-02 bản thu gọn không được áp vào lúc xuất ảnh PNG', () => {
  // chỉ xét quy tắc BÊN TRONG lá số; .board-tip / .btn-sao là khung quanh trang
  const dòng = MQ.split('\n').filter((l) => /^\s{2}\.(board[\s:{]|cung|c-|tc-|sao-more|tt-badge)/.test(l));
  assert.ok(dòng.length > 10, 'không tìm thấy khối quy tắc lá số trong media query');
  for (const l of dòng) {
    assert.match(l, /\.board:not\(\.exporting\)/,
      'quy tắc thiếu :not(.exporting), ảnh PNG tải trên điện thoại sẽ ra bản rút gọn:\n   ' + l.trim());
  }
});

t('TL-02 bốn hàng cung cao bằng nhau (nhãn Tuần/Triệt đặt theo % chiều cao)', () => {
  assert.match(MQ, /grid-template-rows: repeat\(4, minmax\(0, 1fr\)\)/);
});

t('TL-02 mọi lưới nhiều cột đều cho cột co lại (minmax(0, …))', () => {
  // `1fr` trần lấy min-content của nội dung làm sàn -> một nhãn dài là cả trang
  // bị đẩy rộng ra và sinh cuộn ngang.
  const xấu = CSS.split('\n').filter((l) => {
    const m = l.match(/grid-template-columns:\s*([^;]+);/);
    return m && /(^|[\s(,])1fr/.test(m[1].replace(/minmax\([^)]*\)/g, 'X'));
  });
  assert.deepStrictEqual(xấu, [], 'còn cột 1fr trần:\n   ' + xấu.join('\n   '));
});

/* ---------------- TL-03 — khối trung tâm nằm trên nền đặc ----------------- */

t('TL-03 khối chữ trung cung có nền đặc, cao hơn lớp đường kẻ', () => {
  assert.match(CSS, /\.tc-panel \{[^}]*background: var\(--tl-paper\)/);
  assert.match(CSS, /\.tc-panel \{[^}]*z-index: 2/);
  assert.match(CSS, /\.tam-hop \{[^}]*z-index: 0/);
});

t('TL-03 nội dung trung cung tự xuống dòng, không tràn', () => {
  assert.match(CSS, /\.tc-info td \{[^}]*overflow-wrap: anywhere/);
  assert.match(CSS, /\.tc-info \{[^}]*max-width: 100%/);
});

t('TL-03 điện thoại có thẻ thông tin riêng thay cho bảng trong trung cung', () => {
  assert.match(LASO, /id="chart-info"/);
  assert.match(read('assets/js/chart-page.js'), /renderInfoCard\(chart, \$\('chart-info'\)\)/);
  assert.match(CSS, /\.info-card \{ display: none/);
  assert.match(MQ, /\.info-card \{ display: block/);
});

/* ---------------- TL-04 — một tên thương hiệu duy nhất ------------------- */

t('TL-04 không còn "Tuvithienluong" trong văn bản hiển thị', () => {
  for (const [f, html] of Object.entries(PAGES)) {
    assert.doesNotMatch(bỏTênFile(html), /Tuvithienluong/i, f);
  }
  for (const f of ['render.js', 'chart-page.js', 'posts.js', 'booking.js']) {
    assert.doesNotMatch(bỏTênFile(read('assets/js/' + f)), /Tuvithienluong/i, f);
  }
});

t('TL-04 header, footer và <title> dùng cùng một tên trên MỌI trang', () => {
  for (const [f, html] of Object.entries(PAGES)) {
    // trang chủ dùng <span class="brand-name">, bốn trang mới dùng <b>
    assert.match(html, /(<b>|<span class="brand-name">)TỬ VI THIÊN LƯƠNG(<\/b>|<\/span>)/, f + ': header');
    assert.match(html, /<(b|strong)>Tử Vi Thiên Lương<\/(b|strong)>/, f + ': footer');
    assert.match(html, /<title>[^<]*Tử Vi Thiên Lương[^<]*<\/title>/, f + ': title');
  }
});

/* ---------------- TL-05 / TL-10 — logo, favicon, ảnh chia sẻ ------------- */

t('TL-05 mọi trang dùng logo chân dung tím kèm srcset 2x', () => {
  for (const [f, html] of Object.entries(PAGES)) {
    const h = html.match(/<header[\s\S]*?<\/header>/)[0];
    assert.match(h, /logo-tuvithienluong-tim-128\.png/, f);
    assert.match(h, /srcset="[^"]*logo-tuvithienluong-tim-256\.png 2x"/, f);
    assert.doesNotMatch(h, /logo-mark/, f + ': vẫn còn biểu tượng la bàn cũ');
    assert.match(h, /TỬ VI THIÊN LƯƠNG/, f + ': logo phải luôn đi kèm chữ');
  }
});

t('TL-05 logo có vành vàng mảnh 1,5px', () => {
  assert.match(CSS, /\.brand img \{[\s\S]*?box-shadow: 0 0 0 1\.5px var\(--tl-gold-500\)/);
  assert.match(CSS, /\.brand img \{[\s\S]*?border-radius: 50%/);
});

t('TL-10 có đủ bộ biểu tượng và file đã tồn tại', () => {
  const files = ['favicon.ico', 'apple-touch-icon.png', 'logo-tuvithienluong-tim-128.png',
    'logo-tuvithienluong-tim-256.png', 'logo-tuvithienluong-tim-512.webp',
    'logo-tuvithienluong-tim-1024.png', 'logo-tuvithienluong-tim-master.png', 'og-image.png'];
  for (const f of files) {
    assert.ok(fs.existsSync(path.join(ROOT, 'assets/img', f)), 'thiếu assets/img/' + f);
  }
  for (const [f, html] of Object.entries(PAGES)) {
    assert.match(html, /rel="icon" href="assets\/img\/favicon\.ico"/, f);
    assert.match(html, /rel="apple-touch-icon" href="assets\/img\/apple-touch-icon\.png"/, f);
  }
});

t('TL-10 build.js publish mọi trang kèm thẻ og: và sitemap', () => {
  const build = read('tools/build.js');
  // PAGES giờ dựng động theo công tắc trangMoi, nên soát cả file thay vì một mảng
  for (const f of FILES) {
    assert.ok(build.includes(`'${f}'`), 'build.js thiếu ' + f);
    assert.ok(build.includes(`'${f}': {`), 'build.js thiếu thẻ META cho ' + f);
  }
  for (const thẻ of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']) {
    assert.ok(build.includes(thẻ), 'thiếu ' + thẻ);
  }
  assert.match(build, /og:site_name" content="Tử Vi Thiên Lương"/);
});

/* ---------------- TL-06 — chú giải không vỡ giữa ký hiệu và lời giải ----- */

t('TL-06 mỗi cặp ký hiệu + lời giải là một khối nowrap', () => {
  const legend = LASO.match(/<div class="legend"[\s\S]*?<\/div>/)[0];
  const items = legend.match(/<span class="lg-item">/g) || [];
  assert.ok(items.length >= 10, 'chú giải phải tách thành nhiều khối, đang có ' + items.length);
  assert.doesNotMatch(legend, /·/, 'còn dấu · nối các cặp trong cùng một khối');
  assert.match(CSS, /\.legend \.lg-item \{[^}]*white-space: nowrap/);
  assert.match(MQ, /\.legend \{[^}]*flex-direction: column/, 'mobile phải xếp 1 cột');
});

t('TL-06 chú giải nằm trên nền ngà nên phải dùng màu mực', () => {
  // .legend ở trong .board-frame (nền ngà). Dùng màu chữ của nền tím là chìm hẳn.
  assert.doesNotMatch(CSS, /\.legend \{[^}]*color: var\(--tl-(text|muted)\)/);
  assert.match(CSS, /\.legend span:has\(\.dot\) \{ color: var\(--tl-ink\)/);
});

/* ---------------- TL-07 / TL-09 — thẻ tóm tắt --------------------------- */

t('TL-07 dưới 640px thẻ tóm tắt xếp 4 cột (8 thẻ = 2 hàng)', () => {
  assert.match(MQ, /\.facts \{[^}]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
});

t('TL-09 thẻ tóm tắt luôn in ra dòng phụ, kể cả khi rỗng', () => {
  const js = read('assets/js/chart-page.js');
  const fn = js.match(/function summaryItem[\s\S]*?\n  \}/)[0].replace(/\s+/g, ' ');
  assert.match(fn, /<span class="s">' \+ \(sub \? esc\(sub\) : ''\) \+ '<\/span>/,
    'dòng phụ rỗng vẫn phải chiếm chỗ, nếu không thẻ 1 dòng lệch thẻ 2 dòng');
  assert.match(CSS, /\.fact \{[\s\S]*?grid-row: span 3; grid-template-rows: subgrid/);
  assert.match(CSS, /\.fact \.s \{[^}]*min-height/);
});

/* ---------------- TL-08 — câu chữ và nút ở chân trang -------------------- */

t('TL-08 chân trang dùng đúng câu khách duyệt, có đường sang luận giải', () => {
  const câu = 'Lá số mang tính tham khảo. Phần luận giải chi tiết do Thầy Thiên Lương trực tiếp thực hiện.';
  for (const [f, html] of Object.entries(PAGES)) {
    const footer = html.match(/<footer[\s\S]*?<\/footer>/)[0];
    assert.ok(footer.includes(câu), f + ': sai câu chân trang');
    assert.match(footer, /class="btn btn-(ghost|cta) footer-cta"/, f + ': thiếu nút ở chân trang');
    assert.doesNotMatch(footer, /thầy của/i, f + ': còn cách gọi cũ');
  }
  // Trang lá số phải có nút nhờ luận giải ngay cạnh lá số
  assert.match(LASO, /id="consult-link"/);
  assert.match(LASO, /Nhờ Thầy luận giải lá số này/);
});

/* ---------------- TL-11 — menu điều hướng ------------------------------- */

t('TL-11 mọi trang có đủ 4 mục menu, kèm nút thu gọn', () => {
  for (const [f, html] of Object.entries(PAGES)) {
    const h = html.match(/<header[\s\S]*?<\/header>/)[0];
    // trang chủ cũ gọi mục đầu là "Lập lá số", bốn trang mới gọi là "Lá số"
    const đầu = h.includes('>Lá số</a>') || h.includes('>Lập lá số</a>');
    assert.ok(đầu, f + ': thiếu mục lá số');
    for (const mục of ['Chuyên gia', 'Bài viết', 'Đặt lịch luận giải']) {
      assert.ok(h.includes('>' + mục + '</a>'), f + ': thiếu mục "' + mục + '"');
    }
    assert.match(h, /class="nav-cta"/, f + ': thiếu nút CTA');
    assert.match(h, /id="nav-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="site-nav"/, f);
    assert.match(h, /aria-current="page"/, f + ': không đánh dấu mục đang xem');
  }
  assert.match(read('assets/js/common.js'), /nav-toggle/, 'common.js phải nối nút menu');
});

t('TL-11 mọi liên kết nội bộ đều tới file/neo có thật', () => {
  for (const [f, html] of Object.entries(PAGES)) {
    for (const m of html.matchAll(/href="(?!https?:|mailto:|tel:)([^"#]*)(#[^"]*)?"/g)) {
      const file = m[1];
      if (file && !PAGES[file]) {
        assert.ok(fs.existsSync(path.join(ROOT, file)), f + ': link tới ' + file + ' nhưng không có file');
      }
      const neo = m[2] && m[2].slice(1);
      // "#bai-<slug>" do posts.js dựng lúc chạy, kiểm riêng ở phần dưới
      if (neo && !neo.startsWith('bai-') && !/[=&]/.test(neo)) {
        const đích = file ? PAGES[file] || read(file) : html;
        assert.match(đích, new RegExp('id="' + neo + '"'), f + ': neo hỏng #' + neo);
      }
    }
  }
});

/* ---------------- Bộ nhận diện của bản demo đã duyệt -------------------- */

t('Nhận diện: bảng màu đúng brief (tím #1c0e30 … #4c286e, vàng #c9a56b/#e8cf9f)', () => {
  const root = CSS.match(/^:root \{[\s\S]*?\n\}/m)[0];
  const cần = {
    '--tl-purple-950': '#1c0e30', '--tl-purple-900': '#2a1546',
    '--tl-purple-800': '#3b1d5d', '--tl-purple-700': '#4c286e',
    '--tl-gold-500': '#c9a56b', '--tl-gold-300': '#e8cf9f', '--tl-ivory': '#fbf7ef'
  };
  for (const [k, v] of Object.entries(cần)) {
    assert.match(root, new RegExp(k.replace(/-/g, '\\-') + ':\\s*' + v), k + ' phải là ' + v);
  }
});

t('Nhận diện: bốn trang mới dùng Cormorant Garamond + Be Vietnam Pro', () => {
  assert.match(CSS, /--f-display: "Cormorant Garamond"/);
  assert.match(CSS, /--f-body: "Be Vietnam Pro"/);
  for (const f of MOI) {
    assert.match(PAGES[f], /family=Cormorant\+Garamond/, f + ': chưa nạp font tiêu đề');
    assert.match(PAGES[f], /family=Be\+Vietnam\+Pro/, f + ': chưa nạp font nội dung');
  }
});

t('Trang chủ giữ bộ chữ cũ và CSS riêng, không đụng bốn trang kia', () => {
  assert.match(PAGES['index.html'], /family=Noto\+Serif/, 'trang chủ phải nạp Noto Serif');
  assert.match(CSS, /\.page-home \{[\s\S]*?--font-serif: "Noto Serif"/,
    'thiếu khối token riêng của trang chủ');
  // Mọi quy tắc của giao diện cũ PHẢI nằm trong .page-home, nếu không nó đè
  // lên bốn trang dựng theo bản demo mới.
  const khoi = CSS.slice(CSS.indexOf('TRANG CHỦ — giao diện của đợt trước'));
  const lạc = khoi.split('\n').filter((l) =>
    /^\.(glass|brand-hero|hero|today|form-card|ifield|btn-cta|history|h-open|site-header|site-footer)/.test(l));
  assert.deepStrictEqual(lạc, [], 'quy tắc cũ chưa được giới hạn trong .page-home:\n   ' + lạc.join('\n   '));
});

t('Nhận diện: BỐN TRANG MỚI không còn class của giao diện cũ', () => {
  // Trang chủ được giữ nguyên giao diện cũ theo yêu cầu nên vẫn dùng các class này.
  const cũ = ['glass-light', 'glass-dark', 'btn-cta', 'btn-soft', 'btn-primary',
    'brand-name', 'brand-sub', 'nav-link', 'ifield', 'band-card', 'post-soon', 'chart-page'];
  for (const f of MOI) {
    for (const c of cũ) {
      assert.doesNotMatch(PAGES[f], new RegExp('class="[^"]*\\b' + c + '\\b'), f + ': còn class cũ .' + c);
    }
  }
});

/* ---------------- Bài viết ---------------------------------------------- */

const slugs = [...POSTS_JS.matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => m[1]);

t('Bài viết: không còn thẻ "Đang biên soạn" nào', () => {
  for (const [f, html] of Object.entries(PAGES)) assert.doesNotMatch(html, /Đang biên soạn/i, f);
  assert.doesNotMatch(POSTS_JS, /Đang biên soạn/i, 'posts.js');
});

t('Bài viết: có đủ bài, slug không trùng, mỗi bài đủ trường', () => {
  assert.ok(slugs.length >= 7, 'đang có ' + slugs.length + ' bài');
  assert.strictEqual(new Set(slugs).size, slugs.length, 'slug bị trùng');
  const P = loadPosts();
  for (const p of P.POSTS) {
    for (const k of ['slug', 'cat', 'title', 'sapo', 'min', 'date', 'body']) {
      assert.ok(p[k], (p.slug || '?') + ': thiếu trường ' + k);
    }
    assert.ok(p.body.length >= 3, p.slug + ': thân bài quá ngắn (' + p.body.length + ' khối)');
  }
});

t('Bài viết: mọi khối thân bài đều thuộc kiểu renderer hiểu được', () => {
  const P = loadPosts();
  const kiểu = ['p', 'h', 'ul', 'ol', 'note', 'hours', 'table'];
  for (const p of P.POSTS) {
    for (const b of p.body) {
      assert.ok(kiểu.includes(b[0]), p.slug + ': khối lạ "' + b[0] + '"');
      assert.ok(P.blockHtml(b).length > 0, p.slug + ': khối "' + b[0] + '" dựng ra chuỗi rỗng');
    }
  }
});

t('Bài viết: link "bài liên quan" chỉ trỏ tới bài có thật', () => {
  const P = loadPosts();
  for (const p of P.POSTS) {
    const html = P.articleHtml(p, 'logo.png');
    for (const m of html.matchAll(/href="#bai-([a-z0-9-]+)"/g)) {
      assert.ok(slugs.includes(m[1]), p.slug + ': trỏ tới bài không tồn tại #bai-' + m[1]);
    }
    assert.ok(!html.includes('#bai-' + p.slug), p.slug + ': tự trỏ về chính nó');
  }
});

function loadPosts() {
  const sandbox = {};
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(POSTS_JS, sandbox);
  return sandbox.TVTLPosts;
}

/* ---------------- render.js chạy trên DOM giả --------------------------- */

function renderThu(chart) {
  const TVTL = require('../assets/js/tuvi-core.js');
  const el = {
    innerHTML: '', classList: { remove() {}, toggle() {}, add() {} },
    addEventListener() {}, querySelector: () => null, querySelectorAll: () => []
  };
  const sandbox = {
    TVTL,
    window: { matchMedia: () => ({ matches: false }) },
    document: { createElement: () => ({ addEventListener() {} }), body: { appendChild() {} } }
  };
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(read('assets/js/render.js'), sandbox);
  sandbox.TVTLRender.renderBoard(chart, el);
  const card = { innerHTML: '' };
  sandbox.TVTLRender.renderInfoCard(chart, card);
  return { board: el.innerHTML, card: card.innerHTML, R: sandbox.TVTLRender };
}

const TVTL = require('../assets/js/tuvi-core.js');
const TEN = 'Nguyễn Ngọc Kiên';
const chart = TVTL.lapLaSo({
  ten: TEN, ngay: 20, thang: 2, nam: 1999, gio: 5, phut: 30,
  gioiTinh: 1, namXem: 2026, thangXem: 10
});
const out = renderThu(chart);

t('TL-01 họ tên in ra nguyên chuỗi ở bảng trung cung và huy hiệu', () => {
  assert.ok(out.board.includes('<strong class="ho-ten">' + TEN + '</strong>'));
  assert.ok(out.board.includes('<span class="tc-crest-ten">' + TEN + '</span>'));
  assert.ok(out.card.includes('<strong class="ho-ten">' + TEN + '</strong>'));
  assert.strictEqual(out.R.infoRows(chart)[0][1], '<strong class="ho-ten">' + TEN + '</strong>');
});

t('TL-03 bảng thông tin ở thẻ điện thoại giống hệt bảng trong trung cung', () => {
  const lấy = (html) => (html.match(/<table class="tc-info">[\s\S]*?<\/table>/) || [''])[0];
  assert.ok(lấy(out.card).length > 200);
  assert.strictEqual(lấy(out.card), lấy(out.board), 'hai bảng phải sinh từ cùng một nguồn');
});

t('TL-02 mỗi cung có đủ tên cung đầy đủ và tên rút gọn', () => {
  assert.strictEqual((out.board.match(/class="c-ten-du"/g) || []).length, 12);
  assert.strictEqual((out.board.match(/class="c-ten-ngan"/g) || []).length, 12);
  for (const c of chart.cung) {
    assert.ok(out.board.includes('>' + c.ten.toUpperCase() + '</span>'), 'thiếu tên cung ' + c.ten);
    assert.ok(c.tenNgan && c.tenNgan.length <= c.ten.length);
  }
});

t('TL-02 chip "+N sao" đếm đúng số sao phụ bị giấu', () => {
  const chips = [...out.board.matchAll(/class="sao-more"[^>]*>\+(\d+) sao</g)].map((m) => Number(m[1]));
  assert.ok(chips.length >= 8, 'quá ít cung có chip: ' + chips.length);
  // CSS giấu từ sao thứ 4 trở đi trong mỗi cột (cát tinh / sát tinh)
  const đúng = chart.cung.map((c) => {
    const phu = c.sao.filter((s) => !s.chinh);
    const trái = phu.filter((s) => s.loai < 10).length;
    const phải = phu.filter((s) => s.loai >= 10).length;
    return Math.max(0, trái - 3) + Math.max(0, phải - 3);
  }).filter((n) => n > 0);
  assert.deepStrictEqual(chips, đúng);
});

t('lá số vẽ ra không còn tên thương hiệu cũ', () => {
  assert.doesNotMatch(bỏTênFile(out.board), /Tuvithienluong/i);
  assert.ok(out.board.includes('TỬ VI THIÊN LƯƠNG'));
});

t('mọi đường dẫn assets trong HTML và JS đều có file thật', () => {
  const nguồn = { ...PAGES };
  for (const f of ['render.js', 'posts.js', 'booking.js', 'chart-page.js', 'home.js', 'common.js']) {
    nguồn['assets/js/' + f] = read('assets/js/' + f);
  }
  nguồn['(lá số vẽ ra)'] = out.board;
  for (const [f, src] of Object.entries(nguồn)) {
    for (const m of src.matchAll(/["'(](assets\/[\w./-]+)["')]/g)) {
      assert.ok(fs.existsSync(path.join(ROOT, m[1])), f + ': thiếu ' + m[1]);
    }
  }
  for (const [f, html] of Object.entries(PAGES)) {
    for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
      for (const phần of m[1].split(',')) {
        const p = phần.trim().split(/\s+/)[0];
        assert.ok(fs.existsSync(path.join(ROOT, p)), f + ': thiếu ' + p);
      }
    }
  }
});

t('mọi biến CSS được dùng đều đã được định nghĩa', () => {
  const dùng = new Set([...CSS.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
  const định = new Set([...CSS.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));
  const thiếu = [...dùng].filter((v) => !định.has(v));
  assert.deepStrictEqual(thiếu, [], 'biến chưa định nghĩa: ' + thiếu.join(', '));
});

console.log(`${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
