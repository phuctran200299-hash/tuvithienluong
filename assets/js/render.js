/* Tử Vi Thiên Lương — Vẽ lá số 12 cung */
(function (root) {
  'use strict';

  // Vị trí [hàng, cột] trên lưới 4x4 theo chi (1=Tý ... 12=Hợi)
  var GRID = [null, [4, 3], [4, 2], [4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4]];
  // Điểm neo (%) trên khung trung cung, dùng cho đường tam hợp & nhãn tiểu hạn
  var NEO = [null, [75, 100], [25, 100], [0, 100], [0, 75], [0, 25], [0, 0], [25, 0], [75, 0], [100, 0], [100, 25], [100, 75], [100, 100]];

  /** Dưới ngưỡng này lá số chuyển sang bản thu gọn vừa khung điện thoại */
  var MOBILE = '(max-width: 639px)';
  /** Số sao phụ hiện sẵn mỗi cột khi thu gọn; phần còn lại nằm sau chip "+N" */
  var PHU_RUT_GON = 3;
  /** Tên miền in trong lá số — ảnh PNG khách tải về luôn dẫn được về web */
  var SITE = 'tuvithienluong.vn';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dich(c, n) { var x = ((c + n) % 12 + 12) % 12; return x === 0 ? 12 : x; }
  function isMobile() { return !!(window.matchMedia && window.matchMedia(MOBILE).matches); }

  var HANH_VT = { 'Kim': 'K', 'Mộc': 'M', 'Thủy': 'T', 'Hỏa': 'H', 'Thổ': 'O' };
  // Cung mang tên hành đầy đủ ('Hỏa'), sao mang mã một chữ ('H') — xem SAO trong tuvi-core
  var HANH_DAY = { K: 'Kim', M: 'Mộc', T: 'Thủy', H: 'Hỏa', O: 'Thổ' };
  var DAC_TINH_DAY = { 'M': 'Miếu', 'V': 'Vượng', 'Đ': 'Đắc', 'B': 'Bình', 'H': 'Hãm' };

  function saoTen(s) {
    return (s.luu ? 'L.' : s.dv ? 'ĐV.' : '') + s.ten + (s.dacTinh ? ' (' + s.dacTinh + ')' : '');
  }
  function saoCls(s) {
    var cls = 'sao h-' + s.hanh + (s.luu ? ' luu' : '') + (s.dv ? ' dvs' : '') + (s.loai < 10 ? ' cat' : ' hung');
    if (/^hoa(Loc|Quyen|Khoa|Ky)$/.test(s.key)) cls += ' tu-hoa';
    return cls;
  }
  function saoHtml(s) {
    var title = s.hoaCua ? ' title="' + esc(s.ten + ' của ' + s.hoaCua) + '"' : '';
    return '<li class="' + saoCls(s) + '"' + title + '>' + esc(saoTen(s)) + '</li>';
  }

  /** Tách sao của một cung thành chính tinh / cát tinh (trái) / sát tinh (phải) */
  function chiaSao(c) {
    var phu = c.sao.filter(function (s) { return !s.chinh; });
    var hang = function (s) { return s.dv ? 2 : s.luu ? 1 : 0; };
    var byLuu = function (a, b) { return hang(a) - hang(b); };
    return {
      chinh: c.sao.filter(function (s) { return s.chinh; }),
      trai: phu.filter(function (s) { return s.loai < 10; }).sort(byLuu),
      phai: phu.filter(function (s) { return s.loai >= 10; }).sort(byLuu)
    };
  }

  function cungHtml(c, chart) {
    var info = chart.info;
    var pos = GRID[c.so];
    var sao = chiaSao(c);

    var isMenh = c.so === info.cungMenh;
    var isXem = info.thangXem && c.thangLuu === info.thangXem;
    var cls = 'cung' + (isMenh ? ' is-menh' : '') + (c.than ? ' is-than' : '') +
      (c.so === info.cungDaiVan ? ' is-dv' : '') + (c.so === info.cungLuuNien ? ' is-ln' : '') + (c._pad || '');

    var html = '<div class="' + cls + '" data-so="' + c.so + '" tabindex="0" aria-label="Cung ' + esc(c.ten + ' (' + c.chi + ')') +
      '" style="grid-row:' + pos[0] + ';grid-column:' + pos[1] + '">';
    html += '<div class="c-head">';
    html += '<div class="c-canchi">' + esc(TVTL.CAN_VT[c.can] + '.' + c.chi) +
      '<span class="c-hanh h-' + HANH_VT[c.hanh] + '">' + (c.amDuong > 0 ? '+' : '−') + esc(c.hanh) + '</span></div>';
    // Tên cung có hai bản: bản đầy đủ cho màn hình rộng, bản rút gọn cho điện
    // thoại (ô chỉ rộng ~80px). CSS chọn bản nào, không phải JS — nhờ vậy xoay
    // ngang màn hình là đổi ngay, không phải vẽ lại lá số.
    html += '<div class="c-ten"><span class="c-ten-du">' + esc(c.ten.toUpperCase()) + '</span>' +
      '<span class="c-ten-ngan">' + esc((c.tenNgan || c.ten).toUpperCase()) + '</span>' +
      (c.than ? '<span class="than-tag">THÂN</span>' : '') + '</div>';
    html += '<div class="c-dh"><span class="dh">' + c.daiHan + '</span>' +
      '<span class="th' + (isXem ? ' th-xem' : '') + '">Th.' + c.thangLuu + '</span></div>';
    html += '</div>';

    html += '<ul class="c-chinh">' + (sao.chinh.length ? sao.chinh.map(saoHtml).join('') : '<li class="vo-chinh-dieu">Vô chính diệu</li>') + '</ul>';
    html += '<div class="c-phu"><ul>' + sao.trai.map(saoHtml).join('') + '</ul><ul>' + sao.phai.map(saoHtml).join('') + '</ul></div>';

    // Chip "+N": số sao phụ bị giấu ở bản thu gọn. Chạm vào ô sẽ mở bảng chi tiết.
    var an = Math.max(0, sao.trai.length - PHU_RUT_GON) + Math.max(0, sao.phai.length - PHU_RUT_GON);
    if (an) html += '<p class="sao-more" aria-hidden="true">+' + an + ' sao</p>';

    html += '<div class="c-foot"><span class="dv">' + (c.dv ? 'ĐV.' + esc(c.dv) : '') + '</span>' +
      '<span class="ts">' + esc(c.trangSinh) + '</span>' +
      '<span class="ln">' + (c.ln ? 'LN.' + esc(c.ln) : '') + '</span></div>';
    html += '</div>';
    return html;
  }

  /* ---------- Khối thông tin trung tâm ---------- */

  /** Các dòng của bảng thông tin: [nhãn, giá trị (HTML), can chi] */
  function infoRows(chart) {
    var i = chart.info, d = i.duong, a = i.am;
    return [
      ['Họ tên', '<strong class="ho-ten">' + esc(i.ten || '—') + '</strong>', ''],
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
  }

  function infoTableHtml(chart) {
    return '<table class="tc-info">' + infoRows(chart).map(function (r) {
      return '<tr><th scope="row">' + r[0] + ':</th><td' + (r[2] ? '' : ' colspan="2"') + '>' + r[1] + '</td>' +
        (r[2] ? '<td class="cc">' + esc(r[2]) + '</td>' : '') + '</tr>';
    }).join('') + '</table>';
  }

  function trungCungHtml(chart) {
    var i = chart.info;

    // Đường tam hợp (Mệnh – Tài – Quan) & xung chiếu (Thiên Di)
    var svg = '<svg class="tam-hop" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      lineSvg(i.cungMenh) + '</svg>';

    // Nhãn tiểu hạn quanh trung cung
    var labels = chart.cung.map(function (c) {
      var n = NEO[c.so];
      var x = Math.min(96, Math.max(4, n[0])), y = Math.min(96.5, Math.max(3.5, n[1]));
      return '<span class="tieu-han" data-so="' + c.so + '" style="left:' + x + '%;top:' + y + '%">' + esc(c.tieuHanChi) + '</span>';
    }).join('');

    // .tc-panel là nền ĐẶC nằm trên lớp đường kẻ: tam phương tứ chính chỉ hiện
    // ở phần viền quanh khối chữ, không cắt ngang chữ nữa.
    return '<div class="trung-cung" style="grid-row:2 / span 2;grid-column:2 / span 2">' + svg + labels +
      '<div class="tc-body">' +
      '<div class="tc-panel">' +
      '<div class="tc-brand"><img src="assets/img/logo.svg" alt="" width="26" height="26"> TỬ VI THIÊN LƯƠNG</div>' +
      '<h2 class="tc-title">Lá Số Tử Vi</h2>' +
      '<div class="tc-link">' + SITE + '</div>' +
      infoTableHtml(chart) +
      '</div>' +
      '<div class="tc-crest">' +
      '<img src="assets/img/logo-tuvithienluong-tim-128.png" alt="" width="64" height="64" loading="lazy" decoding="async">' +
      '<b>LÁ SỐ TỬ VI</b>' +
      '<span class="tc-crest-ten">' + esc(i.ten || '—') + '</span>' +
      '<small>' + esc(i.canChiNam + ' · ' + i.cuc) + '</small>' +
      '<span class="tc-link">' + SITE + '</span>' +
      '</div>' +
      '</div>' +
      '<div class="tc-focus" aria-live="polite"></div>' +
      '<div class="tc-seal" aria-hidden="true">TỬ VI<br>THIÊN LƯƠNG</div>' +
      '</div>';
  }

  /** Thẻ thông tin dùng thay khối trung cung trên điện thoại (TL-03) */
  function renderInfoCard(chart, el) {
    if (!el) return;
    el.innerHTML = '<h2 class="info-card-title">Thông tin lá số</h2>' + infoTableHtml(chart);
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

  /* ---------- Bảng chi tiết một cung (điện thoại) ---------- */

  var sheet = null;

  function saoListHtml(list, nhan) {
    if (!list.length) return '';
    return '<div class="sheet-group"><h4>' + nhan + '</h4><ul>' + list.map(function (s) {
      var phu = [];
      if (s.luu) phu.push('sao lưu niên');
      if (s.dv) phu.push('sao đại vận');
      if (s.dacTinh) phu.push(DAC_TINH_DAY[s.dacTinh] || s.dacTinh);
      if (s.hoaCua) phu.push('của ' + s.hoaCua);
      phu.push('hành ' + (HANH_DAY[s.hanh] || s.hanh));
      return '<li class="' + saoCls(s) + '">' + esc(s.ten) + '<small>' + esc(phu.join(' · ')) + '</small></li>';
    }).join('') + '</ul></div>';
  }

  function openSheet(chart, so) {
    var c = chart.cung[so - 1];
    var sao = chiaSao(c);
    var ten = function (n) { return chart.cung[n - 1].ten; };
    var tamHop = [dich(so, 4), dich(so, 8)], xung = dich(so, 6);

    if (!sheet) {
      sheet = document.createElement('dialog');
      sheet.className = 'cung-sheet';
      sheet.addEventListener('click', function (e) {
        // bấm ra ngoài khối nội dung (::backdrop hoặc vùng đệm) thì đóng
        if (e.target === sheet || (e.target.closest && e.target.closest('[data-close]'))) sheet.close();
      });
      document.body.appendChild(sheet);
    }

    // Dòng trên tiêu đề: cung này đang giữ vai trò gì trong lá số
    var info = chart.info, vaiTro = [];
    if (c.so === info.cungMenh) vaiTro.push('Cung Mệnh');
    if (c.than) vaiTro.push('Thân cư');
    if (c.so === info.cungDaiVan) vaiTro.push('Đại vận ' + info.namXem);
    if (c.so === info.cungLuuNien) vaiTro.push('Lưu niên ' + info.namXem);

    var meta = [
      ['Can chi', TVTL.CAN_VT[c.can] + '.' + c.chi],
      ['Ngũ hành', (c.amDuong > 0 ? 'Dương ' : 'Âm ') + c.hanh],
      ['Đại hạn', c.daiHan + ' – ' + (c.daiHan + 9) + ' tuổi'],
      ['Tiểu hạn', c.tieuHanChi],
      ['Nguyệt hạn', 'Tháng ' + c.thangLuu],
      ['Tràng sinh', c.trangSinh]
    ];
    if (c.dv) meta.push(['Cung đại vận', c.dv]);
    if (c.ln) meta.push(['Cung lưu niên', c.ln]);
    if (c.tuan) meta.push(['Tuần', 'Có']);
    if (c.triet) meta.push(['Triệt', 'Có']);

    sheet.innerHTML =
      '<div class="sheet-card">' +
      '<header class="sheet-head">' +
      '<div>' + (vaiTro.length ? '<p class="sheet-eyebrow">' + esc(vaiTro.join(' · ')) + '</p>' : '') +
      '<h3>' + esc(c.ten) + ' <span>(' + esc(c.chi) + ')</span></h3></div>' +
      '<button type="button" class="sheet-close" data-close aria-label="Đóng">✕</button>' +
      '</header>' +
      '<div class="sheet-body">' +
      '<dl class="sheet-meta">' + meta.map(function (m) {
        return '<div><dt>' + esc(m[0]) + '</dt><dd>' + esc(m[1]) + '</dd></div>';
      }).join('') + '</dl>' +
      (sao.chinh.length
        ? saoListHtml(sao.chinh, 'Chính tinh')
        : '<div class="sheet-group"><h4>Chính tinh</h4><p class="sheet-vcd">Vô chính diệu</p></div>') +
      saoListHtml(sao.trai, 'Cát tinh · phụ tinh') +
      saoListHtml(sao.phai, 'Sát tinh · hung tinh') +
      '<p class="sheet-tph">Tam phương: <b>' + esc(ten(tamHop[0])) + '</b>, <b>' + esc(ten(tamHop[1])) +
      '</b> · Xung chiếu: <b>' + esc(ten(xung)) + '</b></p>' +
      '</div>' +
      '<footer class="sheet-foot"><button type="button" class="btn btn-quiet" data-close>Đóng</button></footer>' +
      '</div>';

    if (typeof sheet.showModal === 'function') { if (!sheet.open) sheet.showModal(); }
    else sheet.setAttribute('open', '');   // trình duyệt cũ: vẫn đọc được nội dung
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
    // Chạm / bấm: ghim cung đang xem; bấm lại để bỏ ghim.
    // Trên điện thoại chữ trong ô rất nhỏ nên mở thêm bảng chi tiết đầy đủ.
    board.addEventListener('click', function (e) {
      var el = cellOf(e);
      var so = el ? Number(el.dataset.so) : 0;
      if (!so || (board._pinned && board._focus === so && !isMobile())) { board._pinned = false; setFocus(board, 0); return; }
      board._pinned = true;
      setFocus(board, so);
      if (isMobile()) openSheet(board._chart, so);
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
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('cung')) {
        e.preventDefault();
        openSheet(board._chart, Number(e.target.dataset.so));
      }
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
    if (sheet && sheet.open) sheet.close();
    bindInteractions(el);
  }

  root.TVTLRender = {
    renderBoard: renderBoard, renderInfoCard: renderInfoCard,
    clearFocus: clearFocus, infoRows: infoRows
  };
})(this);
