/* Sinh 2 trang client có đánh số vùng nội dung sửa được, để chụp ảnh đưa vào
   tài liệu. Trang sinh ra đặt tạm ở gốc dự án (để đường dẫn assets/ còn đúng)
   và xóa ngay sau khi chụp xong.
   Chạy: node docs/_annot.js   */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const STYLE = `
<style id="annot-style">
  .annot-num { position: absolute; z-index: 9999; min-width: 30px; height: 30px; padding: 0 7px;
    border-radius: 15px; background: #c7a14e; color: #2a1844; font: 800 16px/30px
    "Be Vietnam Pro", "Segoe UI", Arial, sans-serif; text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,.45); border: 2px solid #fffdf8; }
</style>`;

function script(zones) {
  return `
<script>
(function () {
  var ZONES = ${JSON.stringify(zones)};
  function draw() {
    ZONES.forEach(function (z) {
      var el = document.querySelector(z.sel);
      if (!el) return;
      /* Vẽ khung bằng outline ngay trên phần tử: không phụ thuộc toạ độ, không
         làm xô lệch bố cục (outline không chiếm chỗ). */
      el.style.outline = '2px dashed #c7a14e';
      el.style.outlineOffset = '4px';
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      var n = document.createElement('span');
      n.className = 'annot-num';
      n.textContent = z.n;
      if (z.side === 'in') { n.style.left = '6px'; n.style.top = '6px'; }
      else { n.style[z.side === 'r' ? 'right' : 'left'] = '-16px'; n.style.top = '-15px'; }
      el.appendChild(n);
    });
  }

  /* Chờ bố cục ổn định (font web tải xong làm trang co giãn) rồi mới vẽ khung */
  function whenStable() {
    var last = -1, same = 0, tries = 0;
    var tick = function () {
      var h = document.body.scrollHeight + ':' + document.body.scrollWidth;
      same = (h === last) ? same + 1 : 0;
      last = h;
      if (same >= 4 || ++tries > 60) { draw(); return; }
      setTimeout(tick, 150);
    };
    tick();
  }
  function ready() {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(whenStable);
    else whenStable();
  }
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready);
}());
</script>`;
}

function build(srcFile, outFile, zones, extra) {
  let html = fs.readFileSync(path.join(ROOT, srcFile), 'utf8');
  html = html.replace('</head>', STYLE + '\n</head>');
  html = html.replace('</body>', (extra || '') + script(zones) + '\n</body>');
  fs.writeFileSync(path.join(ROOT, outFile), html, 'utf8');
  console.log('  ' + outFile);
}

/* ---------- Trang chủ ---------- */
build('index.html', '_annot-home.html', [
  { sel: '.site-header .brand', n: 1 },
  { sel: '.site-header .nav', n: 2, side: 'r' },
  { sel: '.brand-hero', n: 3 },
  { sel: '.today', n: 4 },
  { sel: '.hero-copy .eyebrow', n: 5 },
  { sel: '.hero-copy h1', n: 6 },
  { sel: '.hero-copy .lead', n: 7 },
  { sel: '.hero-copy .features', n: 8 },
  { sel: '.form-head', n: 9, side: 'r' },
  { sel: '#form .ifield.multi', n: 10 },
  { sel: '.advanced > summary', n: 11 },
  { sel: '.btn-cta', n: 12, side: 'r' },
  { sel: '#history', n: 13 },
  { sel: '.site-footer', n: 14, side: 'r' },
], `
<script>
/* Hiện sẵn khối "Lá số gần đây" bằng dữ liệu mẫu để chụp ảnh minh họa */
(function () {
  window.addEventListener('load', function () {
    var h = document.getElementById('history');
    var l = document.getElementById('history-list');
    if (!h || !l) return;
    h.hidden = false;
    if (!l.children.length) {
      l.innerHTML = '<li><a href="#"><b>Nguyễn Văn A · 20/2/1999</b><small>Nam</small></a>' +
        '<button type="button" class="h-del">✕</button></li>' +
        '<li><a href="#"><b>Trần Thị B · 7/9/1986 (ÂL)</b><small>Nữ</small></a>' +
        '<button type="button" class="h-del">✕</button></li>';
    }
  });
}());
</script>`);

/* ---------- Trang lá số ---------- */
build('la-so.html', '_annot-chart.html', [
  { sel: '.site-header .nav', n: 15, side: 'r' },
  { sel: '.chart-hero', n: 16 },
  { sel: '.chart-toolbar', n: 17 },
  { sel: '.board-tip', n: 18 },
  { sel: '.trung-cung .tc-body', n: 19, side: 'in' },
  { sel: '.legend', n: 20 },
  { sel: '#cta', n: 21 },
  { sel: '.site-footer', n: 22, side: 'r' },
], `
<script>
/* Hiện sẵn dải "Nhờ thầy luận giải" (thật ra đang bị ẩn vì chưa có link liên hệ) */
(function () {
  window.addEventListener('load', function () {
    var c = document.getElementById('cta');
    if (c) c.hidden = false;
  });
}());
</script>`);

console.log('Đã sinh 2 trang có đánh số ở gốc dự án. Nhớ xóa sau khi chụp.');
