/* Tuvithienluong — Trang chủ: thẻ "Hôm nay", form lập lá số, lịch sử */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var C = TVTLCommon;
  var CHI = TVTL.CHI;
  var form = $('form');

  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  function fillSelect(sel, items, value) {
    sel.innerHTML = items.map(function (it) { return '<option value="' + it[0] + '">' + it[1] + '</option>'; }).join('');
    if (value !== undefined) sel.value = String(value);
  }

  /* ================= Thẻ "Hôm nay" ================= */
  var THU = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  var viewDate = new Date();
  viewDate.setHours(12, 0, 0, 0);

  function renderToday() {
    var d = viewDate.getDate(), m = viewDate.getMonth() + 1, y = viewDate.getFullYear();
    var now = new Date();
    var isToday = d === now.getDate() && m === now.getMonth() + 1 && y === now.getFullYear();
    var t = TVTL.thongTinNgay(d, m, y, 7);
    $('t-dow').textContent = THU[viewDate.getDay()];
    $('t-badge').hidden = !isToday;
    $('t-day').textContent = d;
    $('t-my').textContent = 'Tháng ' + m + ' năm ' + y;
    $('t-lday').textContent = t.am.ngay;
    $('t-lmy').textContent = 'Tháng ' + t.am.thang + (t.am.nhuan ? ' nhuận' : '') + ', ' + t.canChiNam;
    $('t-cn-ngay').textContent = t.canChiNgay;
    $('t-cn-thang').textContent = t.canChiThang;
    $('t-tiet').textContent = t.tietKhi;
    $('t-hd').innerHTML = t.gioHoangDao.map(function (g) {
      return '<li title="' + g.tu + 'h – ' + g.den + 'h"><b>' + g.chi + '</b><small>' + g.tu + '–' + g.den + 'h</small></li>';
    }).join('');
  }
  $('today-prev').addEventListener('click', function () { viewDate.setDate(viewDate.getDate() - 1); renderToday(); });
  $('today-next').addEventListener('click', function () { viewDate.setDate(viewDate.getDate() + 1); renderToday(); });
  renderToday();

  /* ================= Form ================= */
  fillSelect($('ngay'), [['', 'Ngày']].concat(range(1, 31).map(function (d) { return [d, d]; })), '');
  fillSelect($('thang'), [['', 'Tháng']].concat(range(1, 12).map(function (m) { return [m, 'Th. ' + m]; })), '');
  fillSelect($('gio'), [['', 'Giờ sinh']].concat(range(0, 23).map(function (h) { return [h, h + ' giờ']; })), '');
  fillSelect($('phut'), range(0, 59).map(function (m) { return [m, C.pad(m) + ' phút']; }), 0);
  fillSelect($('thangXem'), range(1, 12).map(function (m) { return [m, 'Tháng ' + m]; }));
  $('ngay').required = true; $('thang').required = true; $('gio').required = true;

  (function () {
    var d = new Date();
    var am = TVTL.lunar.solarToLunar(d.getDate(), d.getMonth() + 1, d.getFullYear(), 7);
    $('namXem').value = am[2];
    $('thangXem').value = am[1];
  })();

  function updateGioHint() {
    var v = $('gio').value;
    if (v === '') { $('gio-hint').textContent = 'Chưa rõ giờ sinh? Hãy hỏi lại gia đình, giờ sinh quyết định cung Mệnh.'; return; }
    var h = Number(v);
    var chi = TVTL._internal.chiGio(h);
    var start = (chi * 2 - 3 + 24) % 24, end = (start + 2) % 24;
    $('gio-hint').textContent = 'Giờ ' + CHI[chi] + ' (' + start + 'h – ' + end + 'h)' +
      (h === 23 ? ' · giờ Tý muộn' : '') + ' · theo giờ Việt Nam (GMT+7)';
  }
  $('gio').addEventListener('change', updateGioHint);

  function isAmLich() { return $('lich').value === 'am'; }
  function updateLich() {
    var am = isAmLich();
    form.querySelector('.nhuan').hidden = !am;
    if (!am) $('thangNhuan').checked = false;
    var o31 = $('ngay').querySelector('option[value="31"]');
    o31.hidden = am; o31.disabled = am;
    if (am && $('ngay').value === '31') $('ngay').value = '30';
    updateDoiLich();
  }
  $('lich').addEventListener('change', updateLich);

  /* ---- Đổi lịch hai chiều: nhập dương ra âm, nhập âm ra dương ---- */
  function laNgayDuongCoThat(d, m, y) {
    var dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }

  function updateDoiLich() {
    var el = $('doi-lich');
    el.className = 'doi-lich';
    var d = Number($('ngay').value), m = Number($('thang').value), y = Number($('nam').value);
    if (!d || !m || !y || y < 1900 || y > 2100) { el.textContent = ''; return; }

    try {
      if (isAmLich()) {
        // Âm -> Dương
        var s = TVTL.lunar.lunarToSolar(d, m, y, $('thangNhuan').checked ? 1 : 0, 7);
        if (!s || !s[2]) {
          el.className = 'doi-lich loi';
          el.textContent = 'Năm ' + y + ' không có tháng ' + m + ' nhuận — bỏ dấu tích "tháng nhuận" hoặc chọn tháng khác.';
          return;
        }
        var ts = TVTL.thongTinNgay(s[0], s[1], s[2], 7);
        el.innerHTML = 'Dương lịch: <b>' + s[0] + '/' + s[1] + '/' + s[2] + '</b> · năm ' + C.escapeHtml(ts.canChiNam);
      } else {
        // Dương -> Âm
        if (!laNgayDuongCoThat(d, m, y)) {
          el.className = 'doi-lich loi';
          el.textContent = 'Ngày ' + d + '/' + m + '/' + y + ' không có trên lịch dương.';
          return;
        }
        var t = TVTL.thongTinNgay(d, m, y, 7);
        el.innerHTML = 'Âm lịch: <b>' + t.am.ngay + '/' + t.am.thang + (t.am.nhuan ? ' nhuận' : '') + '/' + t.am.nam +
          '</b> · năm ' + C.escapeHtml(t.canChiNam);
      }
    } catch (e) { el.textContent = ''; }
  }

  $('ngay').addEventListener('change', updateDoiLich);
  $('thang').addEventListener('change', updateDoiLich);
  $('nam').addEventListener('input', updateDoiLich);
  $('thangNhuan').addEventListener('change', updateDoiLich);

  function readForm() {
    return {
      ten: $('ten').value.trim(),
      ngay: Number($('ngay').value), thang: Number($('thang').value), nam: Number($('nam').value),
      amLich: isAmLich(), thangNhuan: $('thangNhuan').checked,
      tz: 7, gio: Number($('gio').value), phut: Number($('phut').value),
      gioiTinh: Number(form.querySelector('input[name="gioiTinh"]:checked').value),
      namXem: Number($('namXem').value), thangXem: Number($('thangXem').value),
      tySangNgayMoi: $('tySangNgayMoi').checked, tuHoaCanh: $('tuHoaCanh').value,
      tuHoaNham: $('tuHoaNham').value, khoiVietCanh: $('khoiVietCanh').value,
      thienGiai: $('thienGiai').value, nhuanTach15: $('nhuanTach15').checked
    };
  }

  function writeForm(p) {
    $('ten').value = p.ten || '';
    $('lich').value = p.amLich ? 'am' : 'duong';
    updateLich();
    $('ngay').value = p.ngay; $('thang').value = p.thang; $('nam').value = p.nam;
    $('thangNhuan').checked = !!p.thangNhuan;
    $('gio').value = p.gio; $('phut').value = p.phut;
    form.querySelector('input[name="gioiTinh"][value="' + (p.gioiTinh === -1 ? '-1' : '1') + '"]').checked = true;
    if (p.namXem) $('namXem').value = p.namXem;
    if (p.thangXem) $('thangXem').value = p.thangXem;
    $('tySangNgayMoi').checked = p.tySangNgayMoi !== false;
    $('tuHoaCanh').value = p.tuHoaCanh === 'dongAm' ? 'dongAm' : 'amDong';
    $('tuHoaNham').value = p.tuHoaNham === 'thienPhu' ? 'thienPhu' : 'taPhu';
    $('khoiVietCanh').value = p.khoiVietCanh === 'suuMui' ? 'suuMui' : 'nguDan';
    $('thienGiai').value = p.thienGiai === 'nhayCung' ? 'nhayCung' : 'lienTiep';
    $('nhuanTach15').checked = !!p.nhuanTach15;
    updateDoiLich();
    // mở sẵn phần nâng cao nếu đang dùng tùy chọn khác mặc định
    if (p.tySangNgayMoi === false || p.tuHoaCanh === 'dongAm' || p.tuHoaNham === 'thienPhu' ||
        p.khoiVietCanh === 'suuMui' || p.thienGiai === 'nhayCung' || p.nhuanTach15) form.querySelector('.advanced').open = true;
    updateGioHint();
  }

  function showError(msg) {
    $('form-error').textContent = msg;
    $('form-error').hidden = !msg;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var p = readForm();
    // kiểm tra trước để báo lỗi ngay tại form (ngày không tồn tại, tháng nhuận sai...)
    try { TVTL.lapLaSo(p); } catch (err) { showError(err.message); return; }
    showError('');
    var btn = form.querySelector('button[type="submit"]');
    btn.classList.add('is-loading');
    btn.disabled = true;
    location.href = C.chartUrl(p);
  });

  /* ================= Lịch sử ================= */
  function renderHistory() {
    var list = C.loadHistory();
    $('history').hidden = !list.length;
    $('history-list').innerHTML = list.map(function (x, i) {
      var label = (x.ten || 'Không tên') + ' · ' + x.ngay + '/' + x.thang + '/' + x.nam + (x.amLich ? ' (ÂL)' : '');
      return '<li><a class="h-open" href="la-so.html#' + C.escapeHtml(x.q) + '"><span>' + C.escapeHtml(label) + '</span>' +
        '<small>' + (x.gioiTinh === -1 ? 'Nữ' : 'Nam') + '</small></a>' +
        '<button type="button" class="h-del" data-del="' + i + '" aria-label="Xóa ' + C.escapeHtml(label) + '">✕</button></li>';
    }).join('');
  }
  $('history-list').addEventListener('click', function (e) {
    var btn = e.target.closest('.h-del');
    if (!btn) return;
    var list = C.loadHistory();
    list.splice(Number(btn.dataset.del), 1);
    C.saveHistory(list);
    renderHistory();
  });

  /* ================= Khởi động ================= */
  // Quay lại từ trang lá số ("Sửa thông tin"): điền sẵn form
  var fromUrl = C.readParams();
  if (fromUrl) {
    writeForm(fromUrl);
    document.getElementById('lap-la-so').scrollIntoView({ block: 'start' });
  } else { updateLich(); updateGioHint(); }
  renderHistory();
  // Khôi phục nút khi quay lại bằng nút Back của trình duyệt
  window.addEventListener('pageshow', function () {
    var btn = form.querySelector('button[type="submit"]');
    btn.classList.remove('is-loading');
    btn.disabled = false;
  });
})();
