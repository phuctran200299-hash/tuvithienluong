/* Tuvithienluong — Vẽ lá số 12 cung */
(function (root) {
  'use strict';

  // Vị trí [hàng, cột] trên lưới 4x4 theo chi (1=Tý ... 12=Hợi)
  var GRID = [null, [4, 3], [4, 2], [4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4]];
  // Điểm neo (%) trên khung trung cung, dùng cho đường tam hợp & nhãn tiểu hạn
  var NEO = [null, [75, 100], [25, 100], [0, 100], [0, 75], [0, 25], [0, 0], [25, 0], [75, 0], [100, 0], [100, 25], [100, 75], [100, 100]];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dich(c, n) { var x = ((c + n) % 12 + 12) % 12; return x === 0 ? 12 : x; }

  var HANH_VT = { 'Kim': 'K', 'Mộc': 'M', 'Thủy': 'T', 'Hỏa': 'H', 'Thổ': 'O' };

  function saoHtml(s) {
    var ten = (s.luu ? 'L.' : s.dv ? 'ĐV.' : '') + s.ten + (s.dacTinh ? ' (' + s.dacTinh + ')' : '');
    var cls = 'sao h-' + s.hanh + (s.luu ? ' luu' : '') + (s.dv ? ' dvs' : '') + (s.loai < 10 ? ' cat' : ' hung');
    if (/^hoa(Loc|Quyen|Khoa|Ky)$/.test(s.key)) cls += ' tu-hoa';
    var title = s.hoaCua ? ' title="' + esc(s.ten + ' của ' + s.hoaCua) + '"' : '';
    return '<li class="' + cls + '"' + title + '>' + esc(ten) + '</li>';
  }

  function cungHtml(c, chart) {
    var info = chart.info;
    var pos = GRID[c.so];
    var chinh = c.sao.filter(function (s) { return s.chinh; });
    var phu = c.sao.filter(function (s) { return !s.chinh; });
    // cát tinh bên trái, sát/hung tinh bên phải; sao gốc trước, rồi lưu tinh, rồi sao đại vận
    var trai = phu.filter(function (s) { return s.loai < 10; });
    var phai = phu.filter(function (s) { return s.loai >= 10; });
    var hang = function (s) { return s.dv ? 2 : s.luu ? 1 : 0; };
    var byLuu = function (a, b) { return hang(a) - hang(b); };
    trai.sort(byLuu); phai.sort(byLuu);

    var isMenh = c.so === info.cungMenh;
    var isXem = info.thangXem && c.thangLuu === info.thangXem;
    var cls = 'cung' + (isMenh ? ' is-menh' : '') + (c.than ? ' is-than' : '') +
      (c.so === info.cungDaiVan ? ' is-dv' : '') + (c.so === info.cungLuuNien ? ' is-ln' : '') + (c._pad || '');

    var html = '<div class="' + cls + '" data-so="' + c.so + '" tabindex="0" aria-label="Cung ' + esc(c.ten + ' (' + c.chi + ')') +
      '" style="grid-row:' + pos[0] + ';grid-column:' + pos[1] + '">';
    html += '<div class="c-head">';
    html += '<div class="c-canchi">' + esc(TVTL.CAN_VT[c.can] + '.' + c.chi) +
      '<span class="c-hanh h-' + HANH_VT[c.hanh] + '">' + (c.amDuong > 0 ? '+' : '−') + esc(c.hanh) + '</span></div>';
    html += '<div class="c-ten">' + esc(c.ten.toUpperCase()) + (c.than ? ' <span class="than-tag">THÂN</span>' : '') + '</div>';
    html += '<div class="c-dh"><span class="dh">' + c.daiHan + '</span>' +
      '<span class="th' + (isXem ? ' th-xem' : '') + '">Th.' + c.thangLuu + '</span></div>';
    html += '</div>';

    html += '<ul class="c-chinh">' + (chinh.length ? chinh.map(saoHtml).join('') : '<li class="vo-chinh-dieu">Vô chính diệu</li>') + '</ul>';
    html += '<div class="c-phu"><ul>' + trai.map(saoHtml).join('') + '</ul><ul>' + phai.map(saoHtml).join('') + '</ul></div>';
    html += '<div class="c-foot"><span class="dv">' + (c.dv ? 'ĐV.' + esc(c.dv) : '') + '</span>' +
      '<span class="ts">' + esc(c.trangSinh) + '</span>' +
      '<span class="ln">' + (c.ln ? 'LN.' + esc(c.ln) : '') + '</span></div>';
    html += '</div>';
    return html;
  }

  function trungCungHtml(chart) {
    var i = chart.info;
    var d = i.duong, a = i.am;
    var rows = [
      ['Họ tên', i.ten || '—', ''],
      ['Năm', d.nam + ' <small>(' + a.nam + ')</small>', i.canChiNam],
      ['Tháng', d.thang + ' <small>(' + a.thang + (a.nhuan ? ' nhuận' : '') +
        (i.thangAnSao !== a.thang ? ', an sao theo tháng ' + i.thangAnSao : '') + ')</small>', i.canChiThang],
      ['Ngày', d.ngay + ' <small>(' + a.ngay + ')</small>', i.canChiNgay],
      ['Giờ', i.gio + ' giờ ' + pad(i.phut) + ' phút' + (i.tz !== 7 ? ' <small>(GMT' + (i.tz >= 0 ? '+' : '') + i.tz + ')</small>' : '') +
        (i.tyMuon ? ' <small>· Tý muộn, tính sang ngày sau</small>' : ''), i.canChiGio],
      ['Năm xem', i.canChiNamXem + ' (' + i.namXem + '), ' + i.tuoi + ' tuổi', ''],
      ['Âm dương', i.amDuongNamNu + ' <small>· ' + i.amDuongLy + '</small>', ''],
      ['Bản mệnh', i.banMenh, ''],
      ['Cục', i.cuc + ' <small>(' + i.quanHeCucMenh + ')</small>', ''],
      ['Cân lượng', i.canLuong, ''],
      ['Mệnh chủ', i.menhChu, ''],
      ['Thân chủ', i.thanChu + ' <small>· Thân cư ' + i.thanCu + '</small>', ''],
      ['Lai nhân cung', i.laiNhanCung, '']
    ];
    var tbl = rows.map(function (r) {
      var v = r[0] === 'Họ tên' ? '<strong>' + esc(r[1]) + '</strong>' : r[1];
      return '<tr><th scope="row">' + r[0] + ':</th><td' + (r[2] ? '' : ' colspan="2"') + '>' + v + '</td>' +
        (r[2] ? '<td class="cc">' + esc(r[2]) + '</td>' : '') + '</tr>';
    }).join('');

    // Đường tam hợp (Mệnh – Tài – Quan) & xung chiếu (Thiên Di)
    var svg = '<svg class="tam-hop" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      lineSvg(i.cungMenh) + '</svg>';

    // Nhãn tiểu hạn quanh trung cung
    var labels = chart.cung.map(function (c) {
      var n = NEO[c.so];
      var x = Math.min(96, Math.max(4, n[0])), y = Math.min(96.5, Math.max(3.5, n[1]));
      return '<span class="tieu-han" data-so="' + c.so + '" style="left:' + x + '%;top:' + y + '%">' + esc(c.tieuHanChi) + '</span>';
    }).join('');

    return '<div class="trung-cung" style="grid-row:2 / span 2;grid-column:2 / span 2">' + svg + labels +
      '<div class="tc-body">' +
      '<div class="tc-brand"><img src="assets/img/logo.svg" alt="" width="26" height="26"> TUVITHIENLUONG</div>' +
      '<h2 class="tc-title">Lá Số Tử Vi</h2>' +
      '<table class="tc-info">' + tbl + '</table>' +
      '</div>' +
      '<div class="tc-focus" aria-live="polite"></div>' +
      '<div class="tc-seal" aria-hidden="true">THIÊN<br>LƯƠNG</div>' +
      '</div>';
  }

  function tuanTrietHtml(chart) {
    var tuan = chart.info.tuan, triet = chart.info.triet;
    function center(c) { var g = GRID[c]; return [(g[1] - 0.5) * 25, (g[0] - 0.5) * 25]; }
    function mid(pair) {
      var a = center(pair[0]), b = center(pair[1]);
      return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    }
    var same = (tuan[0] === triet[0] && tuan[1] === triet[1]) || (tuan[0] === triet[1] && tuan[1] === triet[0]);
    function badge(text, pair, cls) {
      var p = mid(pair);
      // hai cung cùng hàng -> cạnh chung thẳng đứng -> nhãn viết dọc
      var vert = GRID[pair[0]][0] === GRID[pair[1]][0];
      return '<span class="tt-badge ' + cls + (vert ? ' vert' : '') + '" style="left:' + p[0] + '%;top:' + p[1] + '%">' + text + '</span>';
    }
    if (same) return badge('Tuần – Triệt', tuan, 'both');
    return badge('Tuần', tuan, 'tuan') + badge('Triệt', triet, 'triet');
  }

  /** Tam hợp (tam giác) + xung chiếu (nét đứt) của một cung */
  function lineSvg(m) {
    var P = function (c) { return NEO[c][0] + ',' + NEO[c][1]; };
    var x = dich(m, 6);
    return '<polygon points="' + P(m) + ' ' + P(dich(m, 4)) + ' ' + P(dich(m, 8)) + '" />' +
      '<line class="xung" x1="' + NEO[m][0] + '" y1="' + NEO[m][1] + '" x2="' + NEO[x][0] + '" y2="' + NEO[x][1] + '" />';
  }

  /* ---------- Hiệu ứng rê chuột / chạm: tam phương tứ chính ---------- */
  function setFocus(board, so) {
    var chart = board._chart;
    if (!chart) return;
    var svg = board.querySelector('.tam-hop');
    var cap = board.querySelector('.tc-focus');
    var cells = board.querySelectorAll('.cung');
    var tamHop = so ? [dich(so, 4), dich(so, 8)] : [];
    var xung = so ? dich(so, 6) : 0;
    cells.forEach(function (el) {
      var n = Number(el.dataset.so);
      el.classList.toggle('is-active', n === so);
      el.classList.toggle('is-tam-hop', tamHop.indexOf(n) >= 0);
      el.classList.toggle('is-xung', n === xung);
    });
    board.querySelectorAll('.tieu-han').forEach(function (el) {
      el.classList.toggle('is-active', Number(el.dataset.so) === so);
    });
    board.classList.toggle('has-focus', !!so);
    svg.innerHTML = lineSvg(so || chart.info.cungMenh);
    svg.classList.toggle('is-focus', !!so);
    if (so) {
      var c = chart.cung[so - 1], t = function (n) { return chart.cung[n - 1].ten; };
      cap.innerHTML = '<strong>' + esc(c.ten) + '</strong> · tam hợp ' + esc(t(tamHop[0])) + ', ' + esc(t(tamHop[1])) +
        ' · xung chiếu ' + esc(t(xung));
    } else {
      cap.textContent = '';
    }
    board._focus = so || 0;
  }

  function bindInteractions(board) {
    if (board._bound) return;
    board._bound = true;
    var hoverable = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    var cellOf = function (e) { var el = e.target.closest && e.target.closest('.cung'); return el && board.contains(el) ? el : null; };

    board.addEventListener('mouseover', function (e) {
      if (!hoverable || board._pinned) return;
      var el = cellOf(e);
      setFocus(board, el ? Number(el.dataset.so) : 0);
    });
    board.addEventListener('mouseleave', function () {
      if (!board._pinned) setFocus(board, 0);
    });
    // Chạm / bấm: ghim cung đang xem; bấm lại để bỏ ghim
    board.addEventListener('click', function (e) {
      var el = cellOf(e);
      var so = el ? Number(el.dataset.so) : 0;
      if (!so || (board._pinned && board._focus === so)) { board._pinned = false; setFocus(board, 0); return; }
      board._pinned = true;
      setFocus(board, so);
    });
    // Bàn phím
    board.addEventListener('focusin', function (e) {
      var el = cellOf(e);
      if (el) setFocus(board, Number(el.dataset.so));
    });
    board.addEventListener('focusout', function (e) {
      if (!board.contains(e.relatedTarget) && !board._pinned) setFocus(board, 0);
    });
    board.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { board._pinned = false; setFocus(board, 0); }
    });
  }

  function clearFocus(board) { board._pinned = false; setFocus(board, 0); }

  /** Chừa khoảng trống ở cạnh chung của cặp cung Tuần/Triệt để nhãn không đè chữ */
  function padClasses(chart) {
    var pads = {};
    [chart.info.tuan, chart.info.triet].forEach(function (pair) {
      var a = GRID[pair[0]], b = GRID[pair[1]];
      var first = pair[0], second = pair[1];
      if (a[0] === b[0]) { // cùng hàng
        if (a[1] > b[1]) { first = pair[1]; second = pair[0]; }
        pads[first] = (pads[first] || '') + ' pad-r';
        pads[second] = (pads[second] || '') + ' pad-l';
      } else {             // cùng cột
        if (a[0] > b[0]) { first = pair[1]; second = pair[0]; }
        pads[first] = (pads[first] || '') + ' pad-b';
        pads[second] = (pads[second] || '') + ' pad-t';
      }
    });
    return pads;
  }

  function renderBoard(chart, el) {
    var pads = padClasses(chart);
    chart.cung.forEach(function (c) { c._pad = pads[c.so] || ''; });
    el.innerHTML = chart.cung.map(function (c) { return cungHtml(c, chart); }).join('') +
      trungCungHtml(chart) + tuanTrietHtml(chart);
    el._chart = chart;
    el._pinned = false;
    el._focus = 0;
    el.classList.remove('has-focus');
    bindInteractions(el);
  }

  root.TVTLRender = { renderBoard: renderBoard, clearFocus: clearFocus };
})(this);
