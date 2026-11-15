/* Tuvithienluong — Trang lá số */
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

  function summaryItem(label, value, sub) {
    return '<li><span class="s-label">' + label + '</span><strong>' + esc(value) + '</strong>' +
      (sub ? '<small>' + esc(sub) + '</small>' : '') + '</li>';
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
    applyDvToggle();
    document.title = (i.ten ? i.ten + ' — ' : '') + 'Lá số Tử Vi · Tuvithienluong';
    $('btn-edit').href = 'index.html#' + C.toQuery(params);
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

  // Nút liên hệ thầy (chỉ hiện khi đã cấu hình link)
  if (C.CONFIG.lienHeThayUrl) {
    $('cta').hidden = false;
    $('cta-link').href = C.CONFIG.lienHeThayUrl;
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
