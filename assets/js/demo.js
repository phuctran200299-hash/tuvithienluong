/* Tuvithienluong — kịch bản dùng chung cho 3 bản demo giao diện
   (design-1.html, design-2.html, design-3.html).
   Khác trang thật ở chỗ: form và lá số nằm chung một trang để khách xem nhanh,
   không ghi lịch sử, không đổi URL. Mọi id trùng với trang thật nên CSS dùng lại được. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  function fill(sel, items, value) {
    if (!sel) return;
    sel.innerHTML = items.map(function (it) { return '<option value="' + it[0] + '">' + it[1] + '</option>'; }).join('');
    if (value !== undefined) sel.value = String(value);
  }

  var form = $('form');
  var THU = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  /* ---------- Thẻ "Hôm nay" (nếu bản thiết kế có) ---------- */
  (function () {
    if (!$('t-day')) return;
    var now = new Date();
    var d = now.getDate(), m = now.getMonth() + 1, y = now.getFullYear();
    var t = TVTL.thongTinNgay(d, m, y, 7);
    var set = function (id, v) { if ($(id)) $(id).textContent = v; };
    set('t-dow', THU[now.getDay()]);
    set('t-day', d);
    set('t-my', 'Tháng ' + m + ' năm ' + y);
    set('t-lday', t.am.ngay);
    set('t-lmy', 'Tháng ' + t.am.thang + (t.am.nhuan ? ' nhuận' : '') + ', ' + t.canChiNam);
    set('t-cn-ngay', t.canChiNgay);
    set('t-cn-thang', t.canChiThang);
    set('t-tiet', t.tietKhi);
    if ($('t-hd')) {
      $('t-hd').innerHTML = t.gioHoangDao.map(function (g) {
        return '<li><b>' + g.chi + '</b><small>' + g.tu + '–' + g.den + 'h</small></li>';
      }).join('');
    }
  })();

  /* ---------- Form ---------- */
  fill($('ngay'), range(1, 31).map(function (d) { return [d, d]; }));
  fill($('thang'), range(1, 12).map(function (m) { return [m, 'Th. ' + m]; }));
  fill($('gio'), range(0, 23).map(function (h) { return [h, h + ' giờ']; }));
  fill($('phut'), range(0, 59).map(function (m) { return [m, pad(m) + ' phút']; }));
  fill($('thangXem'), range(1, 12).map(function (m) { return [m, 'Tháng ' + m]; }));

  // Lá số mẫu mở sẵn để khách thấy ngay bản thiết kế
  var MAU = { ten: 'Nguyễn Văn A', ngay: 20, thang: 2, nam: 1999, gio: 5, phut: 30, gioiTinh: 1, namXem: 2026, thangXem: 10 };
  if ($('ten')) $('ten').value = MAU.ten;
  if ($('ngay')) $('ngay').value = MAU.ngay;
  if ($('thang')) $('thang').value = MAU.thang;
  if ($('nam')) $('nam').value = MAU.nam;
  if ($('gio')) $('gio').value = MAU.gio;
  if ($('phut')) $('phut').value = MAU.phut;
  if ($('namXem')) $('namXem').value = MAU.namXem;
  if ($('thangXem')) $('thangXem').value = MAU.thangXem;

  function readForm() {
    var gt = form.querySelector('input[name="gioiTinh"]:checked');
    return {
      ten: $('ten') ? $('ten').value.trim() : '',
      ngay: Number($('ngay').value), thang: Number($('thang').value), nam: Number($('nam').value),
      amLich: $('lich') ? $('lich').value === 'am' : false,
      gio: Number($('gio').value), phut: Number($('phut').value), tz: 7,
      gioiTinh: gt ? Number(gt.value) : 1,
      namXem: Number($('namXem').value), thangXem: Number($('thangXem').value)
    };
  }

  function showError(msg) {
    if (!$('form-error')) { if (msg) window.alert(msg); return; }
    $('form-error').textContent = msg || '';
    $('form-error').hidden = !msg;
  }

  function summaryItem(label, value, sub) {
    return '<li><span class="s-label">' + esc(label) + '</span><strong>' + esc(value) + '</strong>' +
      (sub ? '<small>' + esc(sub) + '</small>' : '') + '</li>';
  }

  function veLaSo(p) {
    var chart;
    try { chart = TVTL.lapLaSo(p); } catch (err) { showError(err.message || 'Thông tin ngày sinh không hợp lệ.'); return; }
    showError('');
    var i = chart.info, d = i.duong, a = i.am;
    var menh = chart.cung[i.cungMenh - 1];
    var chinhMenh = menh.sao.filter(function (s) { return s.chinh; }).map(function (s) { return s.ten; }).join(', ') || 'Vô chính diệu';
    var dv = i.cungDaiVan ? chart.cung[i.cungDaiVan - 1] : null;

    if ($('c-name')) $('c-name').textContent = i.ten || 'Lá số Tử Vi';
    if ($('c-sub')) {
      $('c-sub').textContent = (i.gioiTinh === 1 ? 'Nam' : 'Nữ') + ' · Sinh ' + d.ngay + '/' + d.thang + '/' + d.nam +
        ' (âm lịch ' + a.ngay + '/' + a.thang + (a.nhuan ? ' nhuận' : '') + ' ' + i.canChiNam + ') · ' +
        i.gio + 'h' + pad(i.phut) + ' giờ ' + i.gioChi;
    }
    if ($('c-summary')) {
      $('c-summary').innerHTML = [
        summaryItem('Mệnh tại', menh.chi, chinhMenh),
        summaryItem('Thân cư', i.thanCu, ''),
        summaryItem('Bản mệnh', i.banMenh, 'Hành ' + i.hanhMenh),
        summaryItem('Cục', i.cuc, i.quanHeCucMenh),
        summaryItem('Âm dương', i.amDuongNamNu, i.amDuongLy),
        summaryItem('Mệnh chủ · Thân chủ', i.menhChu + ' · ' + i.thanChu, ''),
        summaryItem('Cân lượng', i.canLuong, ''),
        summaryItem('Đại vận ' + i.namXem, dv ? dv.ten + ' (' + dv.chi + ')' : 'Chưa nhập vận',
          dv ? 'Từ ' + dv.daiHan + ' đến ' + (dv.daiHan + 9) + ' tuổi' : '')
      ].join('');
    }
    TVTLRender.renderBoard(chart, $('board'));
    if ($('result')) $('result').hidden = false;
    return chart;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (veLaSo(readForm()) && $('result')) {
        $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ---------- Công cụ của bản demo ---------- */
  if ($('btn-print')) {
    $('btn-print').addEventListener('click', function () { TVTLRender.clearFocus($('board')); window.print(); });
  }
  if ($('chk-dv')) {
    $('chk-dv').addEventListener('change', function () { $('board').classList.toggle('hide-dv', !this.checked); });
  }

  veLaSo(readForm());
})();
