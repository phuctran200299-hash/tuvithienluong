/* Tử Vi Thiên Lương — Trang lá số */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var C = TVTLCommon;
  var esc = C.escapeHtml;
  var params = C.readParams();
  var chart = null;

  if (!params) { showEmpty('Hãy nhập ngày giờ sinh để lập lá số.'); return; }

  for (var m = 1, opts = ''; m <= 12; m++) opts += '<option value="' + m + '">Tháng ' + m + ' (ÂL)</option>';
  $('month-sel').innerHTML = opts;

  function showEmpty(msg) {
    $('empty-msg').textContent = msg;
    $('empty').hidden = false;
    $('content').hidden = true;
  }

  /** Ẩn/hiện sao đại vận trên lá số (ghi nhớ lựa chọn của người xem) */
  function applyDvToggle() {
    var hien = true;
    try { hien = localStorage.getItem('tvtl_hien_dv') !== '0'; } catch (e) { /* bỏ qua */ }
    $('chk-dv').checked = hien;
    $('board').classList.toggle('hide-dv', !hien);
  }

  /**
   * Một thẻ tóm tắt. Dòng phụ LUÔN được in ra, kể cả khi rỗng: thiếu nó thì thẻ
   * một dòng ("Thân cư", "Mệnh chủ · Thân chủ") cao hơn hàng xóm một nhịp và
   * chữ trong cả hàng lệch nhau (TL-09).
   */
  function summaryItem(label, value, sub) {
    return '<li class="fact"><span class="k">' + label + '</span><span class="v">' + esc(value) + '</span>' +
      '<span class="s">' + (sub ? esc(sub) : '') + '</span></li>';
  }

  function render() {
    try {
      chart = TVTL.lapLaSo(params);
    } catch (err) {
      showEmpty(err.message || 'Thông tin ngày sinh không hợp lệ.');
      return false;
    }
    var i = chart.info, d = i.duong, a = i.am;
    var menh = chart.cung[i.cungMenh - 1];
    var chinhMenh = menh.sao.filter(function (s) { return s.chinh; }).map(function (s) { return s.ten; }).join(', ') || 'Vô chính diệu';
    var dv = i.cungDaiVan ? chart.cung[i.cungDaiVan - 1] : null;

    $('c-name').innerHTML = esc(i.ten || 'Lá số Tử Vi');
    $('c-sub').textContent = (i.gioiTinh === 1 ? 'Nam' : 'Nữ') + ' · Sinh ' + d.ngay + '/' + d.thang + '/' + d.nam +
      ' (âm lịch ' + a.ngay + '/' + a.thang + (a.nhuan ? ' nhuận' : '') + ' ' + i.canChiNam + ') · ' +
      i.gio + 'h' + C.pad(i.phut) + ' giờ ' + i.gioChi;

    $('c-summary').innerHTML = [
      summaryItem('Mệnh tại', menh.chi, chinhMenh),
      summaryItem('Thân cư', i.thanCu, ''),
      summaryItem('Bản mệnh', i.banMenh, 'Hành ' + i.hanhMenh),
      summaryItem('Cục', i.cuc, i.quanHeCucMenh),
      summaryItem('Âm dương', i.amDuongNamNu, i.amDuongLy),
      summaryItem('Mệnh chủ · Thân chủ', i.menhChu + ' · ' + i.thanChu, ''),
      summaryItem('Cân lượng', i.canLuong, ''),
      summaryItem('Đại vận ' + i.namXem, dv ? dv.ten + ' (' + dv.chi + ')' : 'Chưa nhập vận', dv ? 'Từ ' + dv.daiHan + ' đến ' + (dv.daiHan + 9) + ' tuổi' : '')
    ].join('');

    $('year-text').textContent = i.namXem + ' · ' + i.canChiNamXem + ' · ' + i.tuoi + ' tuổi';
    $('month-sel').value = params.thangXem;

    TVTLRender.renderBoard(chart, $('board'));
    // Trên điện thoại khối trung cung chỉ còn đủ chỗ cho huy hiệu, nên bảng
    // thông tin được in lại thành một thẻ riêng ngay dưới lá số (TL-03).
    TVTLRender.renderInfoCard(chart, $('chart-info'));
    applyDvToggle();
    document.title = (i.ten ? i.ten + ' — ' : '') + 'Lá số Tử Vi · Tử Vi Thiên Lương';
    $('btn-edit').href = 'index.html#' + C.toQuery(params);
    capNhatLinkLuanGiai();
    history.replaceState(null, '', location.pathname + '#' + C.toQuery(params));
    return true;
  }

  // Đổi lá số khác ngay trên cùng trang (sửa link / bấm link lá số khác)
  window.addEventListener('hashchange', function () {
    var p = C.readParams();
    if (p && C.toQuery(p) !== C.toQuery(params)) location.reload();
  });

  if (!render()) return;
  $('content').hidden = false;
  C.pushHistory(params);

  // Nút "Nhờ Thầy luận giải": mang theo lá số đang xem sang trang Đặt lịch,
  // nhờ vậy biểu mẫu tự điền sẵn họ tên và ngày giờ sinh.
  function capNhatLinkLuanGiai() {
    if (!C.CONFIG.trangMoi) return;   // trang Đặt lịch đang tạm ẩn
    var href = 'dat-lich.html#' + C.toQuery(params);
    $('consult-link').href = href;
    $('sticky-link').href = href;
  }
  capNhatLinkLuanGiai();
  if (C.CONFIG.trangMoi) {
    $('sticky-cta').hidden = false;
    document.body.classList.add('has-sticky');
  }

  /* ---------- Đổi năm / tháng xem ---------- */
  function changeYear(delta) {
    params.namXem = Number(params.namXem) + delta;
    render();
  }
  $('year-prev').addEventListener('click', function () { changeYear(-1); });
  $('year-next').addEventListener('click', function () { changeYear(1); });
  $('month-sel').addEventListener('change', function () { params.thangXem = Number(this.value); render(); });

  /* ---------- Bật/tắt sao đại vận ---------- */
  $('chk-dv').addEventListener('change', function () {
    try { localStorage.setItem('tvtl_hien_dv', this.checked ? '1' : '0'); } catch (e) { /* bỏ qua */ }
    applyDvToggle();
  });

  /* ---------- Thu gọn / mở rộng sao phụ (điện thoại) ---------- */
  $('btn-sao').addEventListener('click', function () {
    var mo = $('board').classList.toggle('show-all-sao');
    this.setAttribute('aria-pressed', mo ? 'true' : 'false');
    this.querySelector('span').textContent = mo ? 'Thu gọn sao phụ' : 'Hiện đủ sao phụ';
  });

  /* ---------- Công cụ ---------- */
  $('btn-print').addEventListener('click', function () { TVTLRender.clearFocus($('board')); window.print(); });

  $('btn-copy').addEventListener('click', function () {
    var url = location.href; // thông số lá số nằm sau dấu "#"
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () { C.toast('Đã sao chép liên kết lá số'); },
        function () { window.prompt('Sao chép liên kết:', url); });
    } else {
      window.prompt('Sao chép liên kết:', url);
    }
  });

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject; s.crossOrigin = 'anonymous';
      document.head.appendChild(s);
    });
  }

  $('btn-png').addEventListener('click', function () {
    var btn = this, board = $('board');
    btn.disabled = true;
    btn.classList.add('is-loading');
    var ready = window.html2canvas ? Promise.resolve()
      : loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    ready.then(function () {
      TVTLRender.clearFocus(board);
      board.classList.add('exporting');
      return window.html2canvas(board, { scale: 2, backgroundColor: '#fffdf8', useCORS: true, logging: false });
    }).then(function (canvas) {
      var a = document.createElement('a');
      var ten = (chart.info.ten || 'la-so').normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
      a.download = 'tuvithienluong-' + (ten || 'la-so') + '-' + chart.info.namXem + '.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      C.toast('Đã tải ảnh lá số');
    }).catch(function () {
      C.toast('Không tạo được ảnh. Hãy dùng “In” → Lưu PDF.');
    }).then(function () {
      board.classList.remove('exporting');
      btn.disabled = false;
      btn.classList.remove('is-loading');
    });
  });
})();
