/* Tử Vi Thiên Lương — Trang Đặt lịch luận giải
 *
 * Trang tĩnh, KHÔNG có backend: biểu mẫu không gửi đi đâu cả. Sau khi bấm gửi,
 * trang dựng sẵn nội dung yêu cầu để khách sao chép và nhắn thẳng cho Thầy qua
 * Zalo. Khi nào có nơi nhận đơn thật thì thay đúng hàm guiYeuCau() bên dưới.
 */
(function () {
  'use strict';

  var C = TVTLCommon;
  var $ = function (id) { return document.getElementById(id); };
  var form = $('bookForm');

  /* ---------- Tự điền từ lá số vừa lập ---------- */
  // Trang lá số gắn thông số vào sau dấu "#", đúng quy ước dùng chung của site.
  var chart = null;
  var params = C.readParams();
  if (params) {
    try { chart = TVTL.lapLaSo(params); } catch (e) { chart = null; }
  }
  if (!chart) {
    // chưa có link kèm theo -> lấy lá số gần nhất trong lịch sử trên máy
    var ls = C.loadHistory()[0];
    if (ls) {
      var p = C.fromQuery(ls.q);
      if (p) { try { chart = TVTL.lapLaSo(p); params = p; } catch (e2) { chart = null; } }
    }
  }

  if (chart) {
    var i = chart.info, d = i.duong;
    var pad = C.pad;
    $('name').value = i.ten || '';
    $('gender').value = i.gioiTinh === -1 ? 'Nữ' : 'Nam';
    $('dob').value = d.nam + '-' + pad(d.thang) + '-' + pad(d.ngay);
    $('tob').value = pad(i.gio) + ':' + pad(i.phut);
    $('prefillNote').hidden = false;
    $('chartLink').innerHTML = 'Lá số kèm theo: <a href="la-so.html#' + C.escapeHtml(C.toQuery(params)) +
      '">' + C.escapeHtml(i.ten || 'lá số của bạn') + ' · ' + d.ngay + '/' + d.thang + '/' + d.nam + '</a>';
  } else {
    $('chartLink').innerHTML = 'Chưa có lá số kèm theo. <a href="index.html">Lập lá số trước</a> ' +
      'để Thầy xem được ngay khi nhận yêu cầu.';
  }

  $('unknownTime').addEventListener('change', function () {
    var t = $('tob');
    t.disabled = this.checked;
    if (this.checked) t.value = '';
  });

  /* ---------- Nút sao chép ---------- */
  function boiDen(el) {
    var r = document.createRange();
    r.selectNodeContents(el);
    var s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }
  function ganNutSaoChep(btn, text, oEl) {
    var cu = btn.textContent;
    var xong = function () {
      btn.textContent = 'Đã sao chép';
      setTimeout(function () { btn.textContent = cu; }, 1600);
    };
    var du = function () {
      if (oEl) { boiDen(oEl); btn.textContent = 'Đã chọn, nhấn Ctrl+C'; }
      else { window.prompt('Sao chép nội dung:', text); }
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(xong, du);
    } else { du(); }
  }
  document.querySelectorAll('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      ganNutSaoChep(b, b.dataset.copy, b.parentElement.querySelector('.v'));
    });
  });

  /* ---------- Gửi ---------- */
  function guiYeuCau(donHang) {
    // Chưa có nơi nhận đơn. Trả về nội dung để khách tự gửi cho Thầy.
    return donHang;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var ten = $('name').value.trim();
    var ngaySinh = $('dob').value;
    var sdt = $('phone').value.replace(/[\s.]/g, '');
    var sdtOk = /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(sdt);
    $('phoneErr').hidden = sdtOk;

    var thieu = [];
    if (!ten) thieu.push('họ tên');
    if (!ngaySinh) thieu.push('ngày sinh');
    if (!sdtOk) thieu.push('số điện thoại');
    var dongY = $('consent').checked;
    var fe = $('formErr');
    if (thieu.length || !dongY) {
      fe.hidden = false;
      fe.textContent = (thieu.length ? 'Cần bổ sung: ' + thieu.join(', ') + '. ' : '') +
        (dongY ? '' : 'Vui lòng tích ô đồng ý xử lý dữ liệu cá nhân.');
      return;
    }
    fe.hidden = true;

    var now = new Date(), p2 = C.pad;
    var ma = 'TVTL-' + String(now.getFullYear()).slice(2) + p2(now.getMonth() + 1) + p2(now.getDate()) +
      '-' + String(Math.floor(Math.random() * 900) + 100);
    var goi = $('pkg').value;
    var hinhThuc = form.querySelector('input[name=mode]:checked').value;
    var cauHoi = $('qs').value.split('\n').map(function (s) { return s.trim(); })
      .filter(Boolean).slice(0, 3);
    var gioSinh = $('unknownTime').checked ? 'Không rõ' : ($('tob').value || 'Chưa nhập');
    var ngayDep = ngaySinh.split('-').reverse().join('/');
    var linkLaSo = params ? location.origin + location.pathname.replace(/[^/]*$/, '') +
      'la-so.html#' + C.toQuery(params) : '';

    var donHang = [
      'Yêu cầu luận giải ' + ma,
      'Họ tên: ' + ten + ' (' + $('gender').value + ')',
      'Ngày giờ sinh: ' + ngayDep + ' · ' + gioSinh,
      'Gói: ' + goi,
      'Liên hệ: ' + sdt + ($('email').value.trim() ? ' · ' + $('email').value.trim() : '') + ' · ' + hinhThuc,
      'Câu hỏi: ' + (cauHoi.length ? cauHoi.join(' | ') : 'Không có')
    ].concat(linkLaSo ? ['Lá số: ' + linkLaSo] : []).join('\n');

    guiYeuCau(donHang);

    var esc = C.escapeHtml;
    $('formPanel').innerHTML = '<div class="done">' +
      '<span class="eyebrow">Đã ghi nhận</span>' +
      '<h2>Cảm ơn ' + esc(ten) + '</h2>' +
      '<p class="muted">Trang này chưa nối với hệ thống nhận đơn, nên yêu cầu <b>chưa tự gửi đi</b>. ' +
      'Hãy sao chép nội dung dưới đây và nhắn cho Thầy qua Zalo <b>0788 399 599</b>.</p>' +
      '<div class="code">' + esc(ma) + '</div>' +
      '<table class="sum">' +
      '<tr><td>Gói</td><td>' + esc(goi) + '</td></tr>' +
      '<tr><td>Ngày giờ sinh</td><td>' + esc(ngayDep) + ' · ' + esc(gioSinh) + '</td></tr>' +
      '<tr><td>Liên hệ</td><td>' + esc(sdt) + ' · ' + esc(hinhThuc) + '</td></tr>' +
      '<tr><td>Câu hỏi</td><td>' + (cauHoi.length ? cauHoi.map(esc).join('<br>') : 'Không có') + '</td></tr>' +
      (linkLaSo ? '<tr><td>Lá số</td><td style="overflow-wrap:anywhere">' + esc(linkLaSo) + '</td></tr>' : '') +
      '</table>' +
      '<button type="button" class="btn btn-gold" id="copyDon">Sao chép nội dung yêu cầu</button>' +
      '<a class="btn btn-ghost" href="bai-viet.html">Đọc bài viết trong lúc chờ</a>' +
      '</div>';
    $('copyDon').addEventListener('click', function () {
      ganNutSaoChep(this, donHang, null);
      C.toast('Đã sao chép yêu cầu — dán vào Zalo gửi Thầy');
    });
    $('formPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
