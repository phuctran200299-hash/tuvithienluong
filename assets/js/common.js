/* Tuvithienluong — tiện ích dùng chung cho trang chủ và trang lá số */
(function (root) {
  'use strict';

  var CONFIG = {
    /**
     * CÔNG TẮC ba trang Chuyên gia · Bài viết · Đặt lịch luận giải.
     *
     * false (đang dùng): mọi liên kết tới ba trang đó bị ẩn trên giao diện, và
     *   `tools/build.js` cũng KHÔNG đóng gói ba file đó vào dist/ (nó đọc thẳng
     *   dòng này để chỉ có đúng MỘT chỗ bật/tắt).
     * true: menu hiện lại đủ bốn mục và dist/ có đủ năm trang.
     *
     * Ba file HTML vẫn nằm trong repo và vẫn mở được khi chạy máy cá nhân, nên
     * đổi đúng chữ này là xem thử được ngay.
     */
    trangMoi: true,

    /** Link Zalo / Messenger của thầy cho nút "Nhờ thầy luận giải". Để trống thì ẩn nút. */
    lienHeThayUrl: '',
    historyKey: 'tvtl_history_v1'
  };

  /** Các trang nằm sau công tắc `trangMoi` */
  var TRANG_MOI = ['chuyen-gia.html', 'bai-viet.html', 'dat-lich.html'];

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- Tham số lá số <-> URL ---------- */
  function toQuery(p) {
    var q = new URLSearchParams();
    if (p.ten) q.set('n', p.ten);
    q.set('d', p.ngay); q.set('m', p.thang); q.set('y', p.nam);
    if (p.amLich) q.set('al', 1);
    if (p.thangNhuan) q.set('nh', 1);
    q.set('h', p.gio); q.set('mi', p.phut);
    if (Number(p.tz) !== 7) q.set('tz', p.tz);
    q.set('g', Number(p.gioiTinh) === -1 ? 'nu' : 'nam');
    q.set('nx', p.namXem); q.set('tx', p.thangXem);
    if (p.tySangNgayMoi === false) q.set('ty', 0);
    if (p.tuHoaCanh === 'dongAm') q.set('hc', 'da');
    if (p.tuHoaNham === 'thienPhu') q.set('hn', 'tf');
    if (p.khoiVietCanh === 'suuMui') q.set('kv', 'sm');
    if (p.thienGiai === 'nhayCung') q.set('tg', 'nc');
    if (p.nhuanTach15) q.set('n15', 1);
    return q.toString();
  }

  function fromQuery(search) {
    var q = new URLSearchParams(search);
    if (!q.has('y') || !q.has('d') || !q.has('m')) return null;
    var num = function (k, def) { var v = Number(q.get(k)); return q.has(k) && q.get(k) !== '' && isFinite(v) ? v : def; };
    return {
      ten: (q.get('n') || '').slice(0, 60),
      ngay: num('d', 1), thang: num('m', 1), nam: num('y', 1990),
      amLich: q.get('al') === '1', thangNhuan: q.get('nh') === '1',
      gio: Math.min(23, Math.max(0, num('h', 0))), phut: Math.min(59, Math.max(0, num('mi', 0))),
      tz: num('tz', 7), gioiTinh: q.get('g') === 'nu' ? -1 : 1,
      namXem: num('nx', new Date().getFullYear()), thangXem: Math.min(12, Math.max(1, num('tx', 1))),
      tySangNgayMoi: q.get('ty') !== '0', tuHoaCanh: q.get('hc') === 'da' ? 'dongAm' : 'amDong',
      // 'tf'/'nc' = tùy chọn khác mặc định; 'tp'/'lt' là mã cũ của các link đã chia sẻ trước đây
      tuHoaNham: q.get('hn') === 'tf' ? 'thienPhu' : 'taPhu',
      khoiVietCanh: q.get('kv') === 'sm' ? 'suuMui' : 'nguDan',
      thienGiai: q.get('tg') === 'nc' ? 'nhayCung' : 'lienTiep',
      nhuanTach15: q.get('n15') === '1'
    };
  }

  /**
   * Link tới trang lá số. Thông số đặt sau dấu "#" vì một số server tĩnh
   * (vd. `npx serve`) chuyển hướng la-so.html -> /la-so và làm mất phần "?...".
   */
  function chartUrl(p) { return 'la-so.html#' + toQuery(p); }

  /** Đọc thông số lá số từ "#..." (ưu tiên) hoặc "?..." (link cũ) */
  function readParams() {
    var h = location.hash.replace(/^#\??/, '');
    return fromQuery(h) || fromQuery(location.search);
  }

  /* ---------- Lịch sử trên trình duyệt ---------- */
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(CONFIG.historyKey)) || []; } catch (e) { return []; }
  }
  function saveHistory(list) {
    try { localStorage.setItem(CONFIG.historyKey, JSON.stringify(list)); } catch (e) { /* bỏ qua */ }
  }
  function pushHistory(p) {
    // bỏ năm xem/tháng xem khỏi khóa để không lưu trùng cùng một người
    var key = toQuery(Object.assign({}, p, { namXem: 0, thangXem: 0 }));
    var list = loadHistory().filter(function (x) { return x.key !== key; });
    list.unshift({ key: key, q: toQuery(p), ten: p.ten, nam: p.nam, ngay: p.ngay, thang: p.thang, amLich: p.amLich, gioiTinh: p.gioiTinh });
    saveHistory(list.slice(0, 12));
  }

  /* ---------- Toast ---------- */
  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ---------- Ẩn ba trang chưa công bố ---------- */
  /* Ẩn chứ không xoá khỏi DOM: chart-page.js còn gán href cho #consult-link và
     #sticky-link, xoá đi là nó lỗi. Khối cha nào chỉ tồn tại để chứa đúng cái
     link đó (thanh luận giải, dải CTA dính đáy) thì ẩn cả khối. */
  (function anTrangMoi() {
    if (CONFIG.trangMoi) return;
    var sel = TRANG_MOI.map(function (f) { return 'a[href^="' + f + '"]'; }).join(', ');
    document.querySelectorAll(sel).forEach(function (a) {
      var khoi = a.closest('.consult-bar, .sticky-cta');
      (khoi || a).hidden = true;
    });
    document.body.classList.remove('has-sticky');
  })();

  /* ---------- Menu thu gọn trên điện thoại ---------- */
  /* Chạy trên cả hai trang vì header dùng chung. Script nằm cuối <body> nên
     header đã có trong DOM, không cần chờ DOMContentLoaded. */
  (function initNav() {
    var btn = document.getElementById('nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!btn || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });
    // Bấm vào một mục -> đóng menu (các mục đều là neo trong cùng trang)
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); btn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    });
  })();

  root.TVTLCommon = {
    CONFIG: CONFIG, escapeHtml: escapeHtml, pad: pad,
    toQuery: toQuery, fromQuery: fromQuery, chartUrl: chartUrl, readParams: readParams,
    loadHistory: loadHistory, saveHistory: saveHistory, pushHistory: pushHistory,
    toast: toast
  };
})(this);
