/* Sinh bản xem thử giao diện quản trị cho website Thiên Lương.
   Kết quả là MỘT tệp duy nhất: docs/admin-mockup/index.html
   (CSS và logo nhúng thẳng vào trong, mở bằng trình duyệt là chạy, bấm menu
   bên trái để đi qua lại giữa các màn). Đây chỉ là bản vẽ minh họa, không có
   logic thật.
   Phạm vi: CHỈ những nội dung đang thực sự hiển thị trên 2 trang client
   (index.html + la-so.html) của bộ nhận diện Thiên Lương hiện tại.
   Chạy: node docs/admin-mockup/_build.js  */
'use strict';
const fs = require('fs');
const path = require('path');
const OUT = __dirname;

/* ---------------- đường dẫn các màn ---------------- */
const R = {
  login: 'dang-nhap',
  dash: 'tong-quan',
  home: 'trang-chu',
  form: 'trang-chu-bieu-mau',
  chart: 'trang-la-so',
  cta: 'lien-he-cta',
  seo: 'seo-logo-chia-se',
  engine: 'tuy-chon-an-sao',
  del: 'xac-nhan-xoa',
  acc: 'tai-khoan-nhat-ky',
};
const to = (k) => '#' + R[k];

/* ---------------- khung chung ---------------- */
const NAV = [
  ['g', 'Tổng quan'],
  ['dash', '◧', 'Nội dung website'],
  ['g', 'Sửa nội dung'],
  ['home', '▤', 'Trang chủ'],
  ['chart', '✦', 'Trang lá số'],
  ['cta', '☏', 'Liên hệ & nút CTA'],
  ['g', 'Cấu hình'],
  ['seo', '◎', 'SEO, logo & chia sẻ'],
  ['engine', '⚙', 'Tùy chọn an sao'],
  ['g', 'Hệ thống'],
  ['acc', '☺', 'Tài khoản & nhật ký'],
];

const LOGO = '<svg class="mk" viewBox="0 0 100 100" aria-hidden="true"><use href="#tl-logo"/></svg>';

function side(active) {
  let h = `<aside class="side">
  <a class="logo" href="${to('dash')}">${LOGO}<div><b>THIÊN LƯƠNG</b><span>Trang quản trị nội dung</span></div></a>`;
  for (const it of NAV) {
    if (it[0] === 'g') { h += `\n  <div class="navgrp">${it[1]}</div>`; continue; }
    const [key, ic, label] = it;
    h += `\n  <a href="${to(key)}"${key === active ? ' class="on"' : ''}><span class="ic">${ic}</span>${label}</a>`;
  }
  h += `\n  <div class="foot">Phiên bản 1.0 · Thầy Thiên Lương<br>Đăng nhập: 19/11/2026 09:12` +
       `<br><a class="out" href="${to('login')}">Đăng xuất</a></div>\n</aside>`;
  return h;
}

const screens = [];
const PAGES = [];

function page(file, { h1, crumb, active, body, actions = '', w = 1440, h = 900, bare = false }) {
  const route = R[active] || R.login;
  const inner = bare ? body : `<div class="app">
${side(active)}
<div class="main">
  <div class="top">
    <div><div class="crumb">${crumb}</div><h1>${h1}</h1></div>
    <div class="sp">${actions}<a class="me" href="${to('acc')}"><div class="av">TL</div><div><b>Thầy Thiên Lương</b><div class="tmeta">Chủ website</div></div></a></div>
  </div>
  <div class="wrap">${body}</div>
</div>
</div>`;
  screens.push(`<section class="screen" id="${route}" style="min-height:${h}px">\n${inner}\n</section>`);
  PAGES.push({ file, route, w, h, h1 });
}

/* ---------------- tiện ích nhỏ ---------------- */
const card = (title, inner, sp = '') =>
  `<section class="card"><h2>${title}${sp ? `<div class="sp">${sp}</div>` : ''}</h2>${inner}</section>`;
const f = (label, control, hint = '') =>
  `<div class="f"><label>${label}</label>${control}${hint ? `<div class="hint">${hint}</div>` : ''}</div>`;
const inp = (v, cls = '') => `<div class="inp ${cls}">${v}</div>`;
const sel = (v) => `<div class="sel">${v}</div>`;
const ta = (v) => `<div class="inp ta">${v}</div>`;
const sw = (on) => `<span class="sw${on ? ' on' : ''}"></span>`;
const swline = (title, desc, on) =>
  `<div class="swline">${sw(on)}<div><b>${title}</b>${desc ? `<div class="hint">${desc}</div>` : ''}</div></div>`;
/** nút Sửa / Xóa — Sửa dẫn tới màn tương ứng, Xóa mở hộp thoại xác nhận */
const btnEd = `<a class="btn sm" href="${to('del')}">✎ Sửa</a> <a class="btn sm d" href="${to('del')}">🗑 Xóa</a>`;
const edTo = (k) => ({ c: 'act', v: `<a class="btn sm" href="${to(k)}">✎ Sửa</a>` });
const ed = edTo('del');
const table = (cols, rows) =>
  `<table><thead><tr>${cols.map((c) => `<th${c[1] ? ` style="${c[1]}"` : ''}>${c[0]}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => (typeof c === 'string' ? `<td>${c}</td>` : `<td class="${c.c || ''}">${c.v}</td>`)).join('')}</tr>`)
    .join('')}</tbody></table>`;
/** thanh tab — mỗi tab dẫn sang màn chứa phần đó */
const tabs = (items, on) =>
  `<div class="tabs">${items.map((t, i) => `<a href="${to(t[1])}"${i === on ? ' class="on"' : ''}>${t[0]}</a>`).join('')}</div>`;
const HOME_TABS = [
  ['Thương hiệu & menu', 'seo'], ['Khối thương hiệu', 'home'], ['Khối giới thiệu', 'home'],
  ['Biểu mẫu lập lá số', 'form'], ['Lịch hôm nay', 'form'], ['Chân trang', 'home'],
];

/* ================= 01. Đăng nhập ================= */
page('01-dang-nhap', {
  h1: 'Đăng nhập quản trị', bare: true, active: 'login', w: 1100, h: 680,
  body: `<div class="login"><div class="box">
  <div class="lg">${LOGO.replace('class="mk"', 'class="mk big"')}</div>
  <div class="demo-tag">BẢN VẼ MINH HỌA · KHÔNG PHẢI TRANG ĐĂNG NHẬP THẬT</div>
  <h1>Trang quản trị Thiên Lương</h1><p class="s">Chỉ dành cho thầy và người được cấp quyền</p>
  ${f('Email đăng nhập', inp('thay@thienluong.vn'))}
  ${f('Mật khẩu', inp('••••••••••••'))}
  <div style="display:flex;align-items:center;justify-content:space-between;margin:2px 0 18px">
    <span style="font-size:12.5px"><span class="chk on"></span> Ghi nhớ đăng nhập</span>
    <a href="${to('login')}" style="font-size:12.5px;color:var(--brand);text-decoration:none">Quên mật khẩu?</a></div>
  <a class="btn p" href="${to('dash')}" style="width:100%;justify-content:center;padding:11px">Đăng nhập</a>
  <div class="hint" style="text-align:center;margin-top:14px">Tự động đăng xuất sau 60 phút không dùng · Khóa tạm khi nhập sai nhiều lần</div>
</div></div>`,
});

/* ================= 02. Nội dung website (tổng quan) ================= */
page('02-noi-dung-website', {
  h1: 'Nội dung website', crumb: 'Quản trị / <b>Tổng quan</b>', active: 'dash', h: 1310,
  actions: '<span class="btn">👁 Xem trang thật</span><span class="btn p">⤴ Phát hành (3)</span>',
  body: `
<div class="grid g3">
  <section class="card kpi"><div class="l">Thay đổi chưa phát hành</div><div class="n">3</div><div class="d" style="color:var(--info)">Sửa gần nhất 09:05 hôm nay</div></section>
  <section class="card kpi"><div class="l">Lần phát hành gần nhất</div><div class="n" style="font-size:20px;margin-top:7px">18/11 21:50</div><div class="d" style="color:var(--muted)">bản v1.0.13</div></section>
  <section class="card kpi"><div class="l">Nút “Liên hệ thầy” trên trang lá số</div><div class="n" style="font-size:20px;margin-top:7px;color:var(--danger)">ĐANG ẨN</div><div class="d" style="color:var(--warn)">Chưa điền link Zalo/Messenger</div></section>
</div>
${card('Các khu vực nội dung sửa được <small>2 trang · 12 khu vực — bấm Sửa để vào đúng màn</small>', table(
    [['Khu vực nội dung'], ['Thuộc trang'], ['Chữ đang hiển thị'], ['Trạng thái'], ['Sửa lần cuối'], ['', 'text-align:right;width:110px']],
    [['<b>Thương hiệu & thanh menu</b><div class="tmeta">Logo, tên, dòng phụ, liên kết menu</div>', 'Cả 2 trang', 'THIÊN LƯƠNG · Sáng rõ trước mỗi quyết định', '<span class="badge b-ok">● Đang hiện</span>', '05/11 11:00', edTo('seo')],
     ['<b>Khối thương hiệu giữa trang chủ</b><div class="tmeta">Logo lớn, tên, câu định vị</div>', 'Trang chủ', 'Câu chuyện thương hiệu · Sáng rõ trước mỗi…', '<span class="badge b-ok">● Đang hiện</span>', '05/11 11:00', edTo('home')],
     ['<b>Khối giới thiệu</b><div class="tmeta">Dòng nhấn, tiêu đề lớn, mô tả, 3 ô số liệu</div>', 'Trang chủ', 'Lập lá số Tử Vi chuẩn xác, luận giải bởi…', '<span class="badge b-warn">● Có bản nháp</span>', '09:05 hôm nay', edTo('home')],
     ['<b>Khối “Lịch hôm nay”</b><div class="tmeta">Nhãn chữ; số liệu do máy tự tính</div>', 'Trang chủ', 'Hôm nay · Âm lịch · Tiết khí · Giờ hoàng đạo', '<span class="badge b-ok">● Đang hiện</span>', '02/11 08:12', edTo('form')],
     ['<b>Biểu mẫu lập lá số</b><div class="tmeta">Nhãn ô nhập, chữ gợi ý, câu báo lỗi</div>', 'Trang chủ', 'Lập lá số Tử Vi · Họ và tên · Năm sinh…', '<span class="badge b-ok">● Đang hiện</span>', '10/11 15:44', edTo('form')],
     ['<b>Khối “Lá số gần đây”</b><div class="tmeta">Tiêu đề khối lịch sử trên máy khách</div>', 'Trang chủ', 'Lá số gần đây', '<span class="badge b-ok">● Đang hiện</span>', '02/11 08:12', edTo('form')],
     ['<b>Chữ quanh lá số</b><div class="tmeta">Dòng gợi ý, chú giải, câu khi thiếu thông tin</div>', 'Trang lá số', 'Rê chuột hoặc chạm vào một cung…', '<span class="badge b-ok">● Đang hiện</span>', '12/11 09:20', edTo('chart')],
     ['<b>Khối giữa lá số</b><div class="tmeta">Tên thương hiệu, tiêu đề, dấu triện</div>', 'Trang lá số', 'TUVITHIENLUONG · Lá Số Tử Vi · triện THIÊN LƯƠNG', '<span class="badge b-ok">● Đang hiện</span>', '12/11 09:20', edTo('chart')],
     ['<b>Thanh công cụ cho khách</b><div class="tmeta">Nút Sửa · Sao chép link · In · Tải ảnh</div>', 'Trang lá số', '4 nút đang bật', '<span class="badge b-ok">● Đang hiện</span>', '12/11 09:20', edTo('chart')],
     ['<b>Dải “Nhờ thầy luận giải”</b><div class="tmeta">Tiêu đề, mô tả, nút liên hệ</div>', 'Trang lá số', 'Nhờ thầy luận giải lá số này', '<span class="badge b-dan">● Đang ẩn</span>', '—', edTo('cta')],
     ['<b>Chân trang</b><div class="tmeta">2 dòng mô tả và miễn trừ trách nhiệm</div>', 'Cả 2 trang', 'Lá số mang tính tham khảo…', '<span class="badge b-ok">● Đang hiện</span>', '05/11 11:00', edTo('home')],
     ['<b>Tiêu đề, mô tả & ảnh chia sẻ</b><div class="tmeta">Thẻ title, description, ảnh Facebook/Zalo</div>', 'Cả 2 trang', 'Thiên Lương — Lập lá số Tử Vi phái Việt Nam', '<span class="badge b-ok">● Đang hiện</span>', '05/11 11:00', edTo('seo')]]))}
${card('Thay đổi gần đây <small>bấm Khôi phục để quay lại bản cũ</small>', `<div class="pad" style="padding-top:4px">
  ${[['Thầy Thiên Lương', 'sửa <b>Tiêu đề khối giới thiệu</b>', '09:05 hôm nay', 1],
     ['Thầy Thiên Lương', 'sửa <b>Chú giải đắc tính</b>', '12/11 09:20', 0],
     ['Thầy Thiên Lương', 'đổi <b>câu định vị thương hiệu</b>', '05/11 11:00', 0]]
    .map((l) => `<div class="log"><span class="dot"></span><div><b>${l[0]}</b> ${l[1]}</div><span class="t">${l[2]} ${l[3] ? '<span class="badge b-warn">chưa phát hành</span>' : '<span class="btn sm">↺ Khôi phục</span>'}</span></div>`).join('')}
</div>`)}`,
});

/* ================= 03. Trang chủ — thương hiệu, khối giới thiệu, chân trang ================= */
page('03-trang-chu-khoi-gioi-thieu', {
  h1: 'Sửa nội dung trang chủ', crumb: 'Sửa nội dung / <b>Trang chủ</b>', active: 'home', h: 1320,
  actions: '<span class="btn">👁 Xem trước</span><span class="btn">💾 Lưu nháp</span><span class="btn p">⤴ Lưu & phát hành</span>',
  body: `
<section class="card">${tabs(HOME_TABS, 2)}
<div class="pad"><div class="grid g-73">
  <div>
    ${f('Dòng nhấn phía trên', inp('Tử Vi Đẩu Số · Trường phái Việt Nam'), 'Tối đa 60 ký tự')}
    ${f('Tiêu đề lớn', ta('Lập lá số Tử Vi <mark style="background:#f4e8c1">chuẩn xác</mark>, luận giải bởi thầy Thiên Lương'), 'Bôi chữ rồi bấm <b>A</b> để tô màu vàng kim.')}
    <div class="counter">63 / 120 ký tự</div>
    ${f('Đoạn mô tả', ta('An đủ hơn 110 sao, đại vận, tiểu hạn, lưu niên và nguyệt hạn. Lịch âm tính theo múi giờ Việt Nam (GMT+7). Dữ liệu chỉ nằm trên máy bạn.'))}
    <div class="counter">156 / 240 ký tự</div>
  </div>
  <div>
    <label style="font-size:12.5px;font-weight:600">Xem trước ngay</label>
    <div class="prev" style="margin-top:6px">
      <div class="ey">✦ Tử Vi Đẩu Số · Trường phái Việt Nam</div>
      <h3>Lập lá số Tử Vi <em>chuẩn xác</em>, luận giải bởi thầy Thiên Lương</h3>
      <p>An đủ hơn 110 sao, đại vận, tiểu hạn, lưu niên và nguyệt hạn. Lịch âm tính theo múi giờ Việt Nam (GMT+7). Dữ liệu chỉ nằm trên máy bạn.</p>
      <div class="fx"><div><b>110+</b>sao an đủ</div><div><b>GMT+7</b>lịch âm Việt</div><div><b>1 chạm</b>tải ảnh · in</div></div>
    </div>
    <div class="steps" style="margin-top:10px"><div class="on">Máy tính</div><div>Điện thoại</div></div>
  </div>
</div></div></section>
${card('Ba ô số liệu nổi bật <small>kéo ⣿ để đổi thứ tự</small>', table(
    [['', 'width:38px'], ['Số / chữ lớn'], ['Chú thích bên dưới'], ['Hiện'], ['', 'text-align:right;width:150px']],
    [[{ c: '', v: '<span class="hd">⣿</span>' }, inp('110+'), inp('sao an đủ'), sw(1), { c: 'act', v: btnEd }],
     [{ c: '', v: '<span class="hd">⣿</span>' }, inp('GMT+7'), inp('lịch âm Việt'), sw(1), { c: 'act', v: btnEd }],
     [{ c: '', v: '<span class="hd">⣿</span>' }, inp('1 chạm'), inp('tải ảnh · in · chia sẻ'), sw(1), { c: 'act', v: btnEd }]]),
  '<span class="btn sm">+ Thêm ô</span>')}
<div class="grid g2">
  ${card('Khối thương hiệu giữa trang chủ <small>ngay dưới thanh menu</small>', `<div class="pad">
    ${f('Tên thương hiệu', inp('THIÊN LƯƠNG'))}
    ${f('Dòng dẫn', inp('Câu chuyện thương hiệu'))}
    ${f('Câu định vị', inp('Sáng rõ trước mỗi quyết định'))}
    ${swline('Hiện khối thương hiệu', 'Tắt là trang chủ vào thẳng phần giới thiệu', 1)}</div>`)}
  ${card('Chân trang <small>hiện ở cả 2 trang</small>', `<div class="pad">
    ${f('Dòng 1', ta('<b>Tuvithienluong</b> — Lá số an theo trường phái Tử Vi Việt Nam, lịch âm múi giờ GMT+7.'))}
    ${f('Dòng 2 (miễn trừ trách nhiệm)', ta('Lá số mang tính tham khảo. Phần luận giải chi tiết do thầy của Tuvithienluong thực hiện.'))}</div>`)}
</div>
${card('Lịch sử phiên bản của khu vực này', `<div class="pad" style="padding-top:4px">
    ${[['Bản đang chạy', '09:05 hôm nay · Thầy Thiên Lương', 1],
       ['Bản trước', '10/11 15:44 · Thầy Thiên Lương', 0],
       ['Bản trước nữa', '02/11 08:12 · Thầy Thiên Lương', 0]]
      .map((v) => `<div class="log"><span class="dot${v[2] ? '' : ' e'}"></span><div><b>${v[0]}</b><div class="tmeta">${v[1]}</div></div>${v[2] ? '<span class="t">đang dùng</span>' : '<span class="t"><span class="btn sm">↺ Khôi phục</span></span>'}</div>`).join('')}
    </div>`)}`,
});

/* ================= 04. Trang chủ — biểu mẫu, lịch hôm nay, lá số gần đây ================= */
page('04-trang-chu-bieu-mau', {
  h1: 'Sửa nội dung trang chủ', crumb: 'Sửa nội dung / Trang chủ / <b>Biểu mẫu</b>', active: 'form', h: 1160,
  actions: '<span class="btn">👁 Xem trước</span><span class="btn p">⤴ Lưu & phát hành</span>',
  body: `
<section class="card">${tabs(HOME_TABS, 3)}
<div class="pad"><div class="grid g2">
  <div>
    ${f('Tiêu đề biểu mẫu', inp('Lập lá số Tử Vi'))}
    ${f('Chữ trên nút bấm', inp('Lập lá số'))}
    ${f('Câu báo lỗi năm sinh', inp('Nhập năm sinh từ 1900 đến 2100.'))}
    ${f('Chữ gợi ý khi chưa chọn giờ', ta('Chưa rõ giờ sinh? Hãy hỏi lại gia đình, giờ sinh quyết định cung Mệnh.'))}
    ${f('Nhãn mục tùy chọn nâng cao', inp('Tùy chọn an sao nâng cao'), `Nội dung bên trong sửa ở mục <a href="${to('engine')}"><b>Tùy chọn an sao</b></a>`)}
  </div>
  <div>
    <label style="font-size:12.5px;font-weight:600">Nhãn các ô nhập</label>
    <div style="margin-top:6px">
      ${[['Họ và tên', 'Họ và tên'], ['Ngày / tháng / năm sinh', 'Ngày · Tháng · Năm sinh'],
         ['Loại lịch', 'Dương lịch / Âm lịch'], ['Tháng nhuận', 'Sinh vào tháng nhuận'],
         ['Giờ · phút sinh', 'Giờ sinh · Phút sinh'], ['Giới tính', 'Nam / Nữ'],
         ['Năm xem · tháng xem', 'Năm xem · Tháng xem (âm lịch)']]
        .map((r) => `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #f1eff6">
          <div style="width:160px;font-size:12.5px;font-weight:600">${r[0]}</div>
          <div class="inp" style="flex:1">${r[1]}</div><span class="btn sm">✎</span></div>`).join('')}
    </div>
    <div class="hint" style="margin-top:8px">Chỉ đổi được <b>chữ hiển thị</b>. Không thêm/bớt ô nhập vì bộ máy an sao cần đủ ngày – giờ – giới tính.</div>
  </div>
</div></div></section>
<div class="grid g2">
  ${card('Khối “Lịch hôm nay” <small>cột trái trang chủ</small>', `<div class="pad">
    <div class="note" style="margin-bottom:12px">⚑ Ngày âm – dương, can chi, tiết khí và giờ hoàng đạo do máy tự tính theo lịch Việt Nam (GMT+7). Chỉ sửa được <b>nhãn chữ</b>.</div>
    ${f('Nhãn “Hôm nay”', inp('Hôm nay'))}
    ${f('Nhãn “Âm lịch”', inp('Âm lịch'))}
    <div class="row3">${f('Nhãn “Ngày”', inp('Ngày'))}${f('Nhãn “Tháng”', inp('Tháng'))}${f('Nhãn “Tiết khí”', inp('Tiết khí'))}</div>
    ${f('Nhãn “Giờ hoàng đạo”', inp('Giờ hoàng đạo'))}
    ${swline('Hiện khối Lịch hôm nay', 'Tắt là ẩn khỏi trang chủ', 1)}</div>`)}
  ${card('Khối “Lá số gần đây” <small>lịch sử nằm trên máy khách</small>', `<div class="pad">
    ${f('Tiêu đề khối', inp('Lá số gần đây'))}
    ${f('Số lá số lưu lại tối đa', sel('8 lá số'))}
    ${swline('Cho khách lưu lá số gần đây', 'Tắt là bỏ hẳn khối này khỏi trang chủ', 1)}
    <div class="note" style="margin-top:12px">⚑ Đây là lịch sử riêng trên trình duyệt của từng khách. Trang quản trị <b>không</b> đọc được danh sách này — đúng cam kết “dữ liệu chỉ nằm trên máy bạn”.</div></div>`)}
</div>`,
});

/* ================= 05. Trang lá số ================= */
page('05-trang-la-so', {
  h1: 'Sửa nội dung trang lá số', crumb: 'Sửa nội dung / <b>Trang lá số</b>', active: 'chart', h: 1080,
  actions: '<span class="btn">👁 Xem trước</span><span class="btn p">⤴ Lưu & phát hành</span>',
  body: `
<div class="note">⚑ Trang này chỉ sửa được <b>phần chữ xung quanh</b>. Tên sao, tên cung, đắc tính (M/V/Đ/B/H), đại vận, tiểu hạn do máy tính theo trường phái Việt Nam — xem mục <a href="${to('engine')}"><b>Tùy chọn an sao</b></a>.</div>
<div class="grid g2">
  ${card('Chữ hướng dẫn & chú giải', `<div class="pad">
    ${f('Dòng gợi ý trên lá số', inp('Rê chuột hoặc chạm vào một cung để xem tam phương tứ chính'))}
    ${f('Chú giải ngũ hành', inp('Kim · Mộc · Thủy · Hỏa · Thổ', 'ro'), 'Hệ thống tự sinh, không sửa')}
    ${f('Chú giải đắc tính', inp('(M) Miếu · (V) Vượng · (Đ) Đắc · (B) Bình · (H) Hãm'))}
    ${f('Chú giải sao lưu / đại vận', ta('L. Sao lưu niên · ĐV. Sao đại vận · ĐV./LN. Cung đại vận / lưu niên · Th. Nguyệt hạn'))}
    ${f('Khi khách vào mà thiếu thông tin', inp('Hãy nhập ngày giờ sinh để lập lá số.'))}
    ${f('Chữ trên nút ở màn hình đó', inp('Lập lá số'))}
    ${f('Đường dẫn phía trên lá số', inp('Trang chủ / Lá số Tử Vi'))}</div>`)}
  <div style="display:flex;flex-direction:column;gap:16px">
  ${card('Thanh công cụ cho khách <small>bật/tắt từng nút</small>', `<div class="pad" style="padding-top:6px">
    ${swline('Nút “Sửa”', 'Quay lại biểu mẫu để sửa ngày sinh', 1)}
    ${swline('Nút “Sao chép link”', 'Khách gửi link lá số cho người khác', 1)}
    ${swline('Nút “In”', 'In lá số ra giấy A4', 1)}
    ${swline('Nút “Tải ảnh”', 'Xuất lá số thành ảnh PNG', 1)}
    ${swline('Chọn năm xem / tháng xem', 'Cho khách tự xem vận các năm khác', 1)}
    ${swline('Hiện sao đại vận (ĐV.)', 'Mặc định bật sẵn khi khách mới vào', 1)}</div>`)}
  ${card('Khối giữa lá số <small>phần in luôn lên ảnh khách tải về</small>', `<div class="pad">
    ${f('Tên thương hiệu trên lá số', inp('TUVITHIENLUONG'))}
    ${f('Tiêu đề giữa lá số', inp('Lá Số Tử Vi'))}
    ${f('Dấu triện góc', inp('THIÊN LƯƠNG'), 'Hai chữ xếp thành 2 dòng')}
    ${swline('In logo & dấu triện lên ảnh tải về', 'Ảnh khách chia sẻ luôn mang thương hiệu', 1)}</div>`)}
  </div>
</div>`,
});

/* ================= 06. Liên hệ & CTA ================= */
page('06-lien-he-cta', {
  h1: 'Liên hệ & nút CTA', crumb: 'Sửa nội dung / <b>Liên hệ & nút CTA</b>', active: 'cta', h: 1250,
  actions: '<span class="btn">👁 Xem trước</span><span class="btn p">⤴ Lưu & phát hành</span>',
  body: `
<div class="note" style="background:#fdecea;border-color:#f3cdc8;color:#8c2b20">⚠ Hiện tại link liên hệ đang <b>để trống</b> nên dải “Nhờ thầy luận giải” <b>bị ẩn</b> trên trang lá số. Điền link Zalo hoặc Messenger rồi phát hành là nút hiện ra ngay.</div>
${card('Dải “Nhờ thầy luận giải” <small>cuối trang lá số</small>', `<div class="pad"><div class="grid g-73">
  <div>
    ${f('Tiêu đề', inp('Nhờ thầy luận giải lá số này'))}
    ${f('Đoạn mô tả', ta('Thầy Tuvithienluong sẽ luận chi tiết tính cách, sự nghiệp, tài lộc, tình duyên và vận hạn của bạn.'))}
    <div class="row2">${f('Chữ trên nút', inp('Liên hệ thầy'))}${f('Nút dẫn tới', sel('Kênh Zalo của thầy'))}</div>
    ${swline('Hiện dải này trên trang lá số', 'Tắt là ẩn hoàn toàn', 1)}
  </div>
  <div>
    <label style="font-size:12.5px;font-weight:600">Xem trước</label>
    <div class="prev" style="margin-top:6px">
      <h3 style="font-size:16px">Nhờ thầy luận giải lá số này</h3>
      <p>Thầy Tuvithienluong sẽ luận chi tiết tính cách, sự nghiệp, tài lộc, tình duyên và vận hạn của bạn.</p>
      <div style="margin-top:12px"><span class="btn g">💬 Liên hệ thầy</span></div>
    </div>
  </div>
</div></div>`)}
${card('Kênh liên hệ của thầy <small>kéo ⣿ để đổi thứ tự</small>', table(
    [['', 'width:38px'], ['Kênh'], ['Đường dẫn / số'], ['Chữ trên nút'], ['Dùng cho nút CTA'], ['', 'text-align:right;width:150px']],
    [[{ c: '', v: '<span class="hd">⣿</span>' }, '<b>Zalo</b>', inp('https://zalo.me/0912345678'), inp('Liên hệ thầy'), '<span class="badge b-ok">● Đang dùng</span>', { c: 'act', v: btnEd }],
     [{ c: '', v: '<span class="hd">⣿</span>' }, '<b>Messenger</b>', inp('https://m.me/thienluong'), inp('Chat Facebook'), '<span class="badge b-off">dự phòng</span>', { c: 'act', v: btnEd }],
     [{ c: '', v: '<span class="hd">⣿</span>' }, '<b>Điện thoại</b>', inp('0912 345 678'), inp('Gọi thầy'), '<span class="badge b-off">dự phòng</span>', { c: 'act', v: btnEd }]]),
  '<span class="btn sm">+ Thêm kênh</span>')}
<div class="grid g2">
  ${card('Thêm kênh liên hệ', `<div class="pad">
    ${f('Loại kênh', sel('Fanpage Facebook'))}
    ${f('Đường dẫn', inp('https://facebook.com/thienluong'))}
    ${f('Chữ trên nút', inp('Xem Fanpage'))}
    <div style="display:flex;gap:8px;margin-top:4px"><span class="btn p">+ Thêm kênh</span><span class="btn">Hủy</span></div></div>`)}
  ${card('Nút liên hệ nổi (tùy chọn)', `<div class="pad" style="padding-top:6px">
    ${swline('Bật nút nổi ở góc dưới bên phải', 'Hiện trên cả 2 trang', 0)}
    ${swline('Chỉ hiện trên điện thoại', '', 0)}
    ${swline('Chỉ hiện sau khi khách lập xong lá số', 'Tránh làm rối khi khách chưa xem gì', 1)}
    <div class="hint" style="margin-top:8px">Đây là phần <b>bổ sung mới</b>, hiện website chưa có. Có thể bỏ nếu Quý khách thấy chưa cần.</div></div>`)}
</div>`,
});

/* ================= 07. SEO, logo & chia sẻ ================= */
page('07-seo-logo-chia-se', {
  h1: 'SEO, logo & chia sẻ', crumb: 'Cấu hình / <b>SEO, logo & chia sẻ</b>', active: 'seo', h: 1140,
  actions: '<span class="btn p">⤴ Lưu & phát hành</span>',
  body: `
${card('Tiêu đề & mô tả cho Google <small>2 trang hiện có</small>', table(
    [['Trang'], ['Tiêu đề trên Google'], ['Mô tả'], ['', 'text-align:right;width:110px']],
    [['<b>Trang chủ</b><div class="tmeta">/</div>', 'Thiên Lương — Lập lá số Tử Vi phái Việt Nam<div class="tmeta">44 / 60 ký tự</div>', 'An đủ hơn 110 sao, đại vận, tiểu hạn, lưu niên và nguyệt hạn. Lịch âm múi giờ Việt Nam (GMT+7). Miễn phí, dữ liệu chỉ nằm trên máy bạn.<div class="tmeta">146 / 160 ký tự</div>', ed],
     ['<b>Trang lá số</b><div class="tmeta">/la-so.html</div>', 'Lá số Tử Vi — Thiên Lương<div class="tmeta">25 / 60 ký tự</div>', 'Lá số Tử Vi 12 cung, an sao chuẩn trường phái Việt Nam, kèm đại vận, tiểu hạn, lưu niên và nguyệt hạn.<div class="tmeta">104 / 160 ký tự</div>', ed]]))}
<div class="grid g2">
  ${card('Thương hiệu & hình ảnh', `<div class="pad">
    ${f('Tên thương hiệu', inp('THIÊN LƯƠNG'))}
    ${f('Dòng phụ trên thanh menu', inp('Sáng rõ trước mỗi quyết định'))}
    ${f('Logo', `<div style="display:flex;align-items:center;gap:12px">${LOGO.replace('class="mk"', 'class="mk md"')}<span class="btn sm">⤒ Đổi logo</span><span class="btn sm d">🗑 Bỏ</span></div>`, 'SVG hoặc PNG nền trong suốt, tối thiểu 256×256')}
    ${f('Biểu tượng tab (favicon)', `<div style="display:flex;align-items:center;gap:12px"><div style="width:30px;height:30px;border-radius:7px;background:#3b1d5d;display:grid;place-items:center">${LOGO.replace('class="mk"', 'class="mk sm2"')}</div><span class="btn sm">⤒ Đổi</span></div>`)}
    ${f('Màu nền thanh trình duyệt', `<div style="display:flex;align-items:center;gap:12px"><div style="width:30px;height:30px;border-radius:7px;background:#3b1d5d;border:1px solid var(--line)"></div><div class="inp" style="width:120px">#3b1d5d</div></div>`)}</div>`)}
  ${card('Ảnh & chữ khi chia sẻ Facebook / Zalo', `<div class="pad">
    ${f('Ảnh chia sẻ', `<div style="display:flex;gap:12px;align-items:center"><div style="width:120px;height:63px;border-radius:8px;background:linear-gradient(135deg,#3b1d5d,#7a4aa6);display:grid;place-items:center;color:#e1c78e;font-size:11px;letter-spacing:.12em">THIÊN LƯƠNG</div><div><span class="btn sm">⤒ Đổi ảnh</span><div class="hint" style="margin-top:6px">Chuẩn 1200×630 px</div></div></div>`, 'Đang dùng: assets/img/og-image.png')}
    ${f('Tiêu đề khi chia sẻ', inp('Thiên Lương — Lập lá số Tử Vi phái Việt Nam'))}
    ${f('Mô tả khi chia sẻ', ta('An đủ 110+ sao, đại vận, tiểu hạn. Thầy Thiên Lương luận giải chi tiết.'))}
    ${swline('Chặn Google lập chỉ mục link lá số của khách', 'Giữ riêng tư lá số khách đã chia sẻ', 1)}</div>`)}
</div>
${card('Liên kết trên thanh menu <small>mỗi trang một liên kết</small>', table(
    [['', 'width:38px'], ['Tên hiển thị'], ['Hiện ở trang'], ['Dẫn tới'], ['Hiện'], ['', 'text-align:right;width:150px']],
    [[{ c: '', v: '<span class="hd">⣿</span>' }, inp('Lập lá số'), 'Trang chủ', sel('Trang chủ › phần biểu mẫu'), sw(1), { c: 'act', v: btnEd }],
     [{ c: '', v: '<span class="hd">⣿</span>' }, inp('Lập lá số mới'), 'Trang lá số', sel('Trang chủ › phần biểu mẫu'), sw(1), { c: 'act', v: btnEd }]]),
  '<span class="btn sm">+ Thêm liên kết</span>')}`,
});

/* ================= 08. Tùy chọn an sao ================= */
page('08-tuy-chon-an-sao', {
  h1: 'Tùy chọn an sao', crumb: 'Cấu hình / <b>Tùy chọn an sao</b>', active: 'engine', h: 1020,
  actions: '<span class="btn">↻ Về mặc định</span><span class="btn p">⤴ Lưu & phát hành</span>',
  body: `
<div class="note">⚠ Đây là phần <b>chuyên môn</b>, đổi là đổi kết quả an sao của mọi lá số lập sau đó. Chỉ thầy mới có quyền sửa, mỗi lần lưu đều ghi lại ai đổi và đổi gì.</div>
${card('6 tùy chọn trường phái <small>đúng 6 tùy chọn đang có trong mục “Tùy chọn an sao nâng cao” trên trang chủ</small>', table(
    [['Điểm an sao'], ['Đang chọn làm mặc định'], ['Lựa chọn khác'], ['Cho khách tự đổi'], ['', 'text-align:right;width:100px']],
    [['<b>Tứ Hóa năm Canh</b>', 'Nhật – Vũ – Âm – Đồng <span class="badge b-ok">phổ biến</span>', 'Nhật – Vũ – Đồng – Âm', sw(1), ed],
     ['<b>Tứ Hóa năm Nhâm (Hóa Khoa)</b>', 'Lương – Tử – Tả – Vũ (Tả Phù hóa Khoa)', 'Lương – Tử – Phủ – Vũ', sw(1), ed],
     ['<b>Khôi – Việt năm Canh</b>', 'Khôi Ngọ – Việt Dần', 'Khôi Sửu – Việt Mùi', sw(1), ed],
     ['<b>An Thiên Giải</b>', 'Từ Thân, đếm liền từng cung', 'Từ Thân, đếm nhảy cung (sách cụ Thiên Lương)', sw(1), ed],
     ['<b>Giờ Tý muộn (23h–24h)</b>', 'Tính sang ngày hôm sau', 'Giữ nguyên ngày', sw(1), ed],
     ['<b>Sinh tháng nhuận sau ngày 15</b>', 'Giữ nguyên tháng nhuận', 'Tính sang tháng sau', sw(1), ed]]))}
<div class="grid g2">
  ${card('Kiểm tra trước khi lưu', `<div class="pad">
    <div class="row3">${f('Ngày', inp('20'))}${f('Tháng', inp('02'))}${f('Năm', inp('1999'))}</div>
    <div class="row3">${f('Giờ', inp('05'))}${f('Phút', inp('30'))}${f('Giới tính', sel('Nam'))}</div>
    <span class="btn p">▶ Lập thử lá số với tùy chọn mới</span>
    <div style="margin-top:14px;border:1px solid var(--line);border-radius:10px;padding:12px;font-size:12.5px;background:#faf9fd">
      <b>Kết quả so sánh:</b><div style="margin-top:6px;color:var(--ok)">✓ 14 chính tinh · mỗi sao xuất hiện đúng 1 lần</div>
      <div style="color:var(--warn)">● 2 cung khác so với tùy chọn đang chạy: cung Tý (Hóa Kỵ), cung Dần (Thiên Giải)</div>
      <div class="btn sm" style="margin-top:9px">Xem lá số thử</div></div></div>`)}
  ${card('Chữ hiển thị trên lá số', `<div class="pad">
    ${f('Tên 12 cung', `<div class="inp ro">Mệnh · Phụ Mẫu · Phúc Đức · Điền Trạch · Quan Lộc · Nô Bộc · Di Chuyển · Tật Bệnh · Tài Bạch · <b>Tử Tức</b> · Phu Thê · Huynh Đệ</div>`, 'Phái Việt Nam dùng <b>Tử Tức</b> (không phải Tử Nữ). Sửa được chữ hiển thị nhưng không đổi cách tính.')}
    ${f('Ký hiệu đắc tính', inp('M · V · Đ · B · H'))}
    <div class="row3">${f('Nhãn sao lưu niên', inp('L.'))}${f('Nhãn sao đại vận', inp('ĐV.'))}${f('Nhãn nguyệt hạn', inp('Th.'))}</div>
    ${swline('Hiện đắc tính trong ngoặc', 'Ví dụ: Tử Vi (M)', 1)}</div>`)}
</div>`,
});

/* ================= 09. Xác nhận xóa ================= */
page('09-xac-nhan-xoa', {
  h1: 'Sửa nội dung trang chủ', crumb: 'Sửa nội dung / Trang chủ / <b>Khối giới thiệu</b>', active: 'del', h: 660,
  actions: '<span class="btn p">⤴ Lưu & phát hành</span>',
  body: `
${card('Ba ô số liệu nổi bật', table(
    [['', 'width:38px'], ['Số / chữ lớn'], ['Chú thích bên dưới'], ['Hiện'], ['', 'text-align:right;width:150px']],
    [[{ c: '', v: '<span class="hd">⣿</span>' }, inp('110+'), inp('sao an đủ'), sw(1), { c: 'act', v: btnEd }],
     [{ c: '', v: '<span class="hd">⣿</span>' }, inp('GMT+7'), inp('lịch âm Việt'), sw(1), { c: 'act', v: btnEd }],
     [{ c: '', v: '<span class="hd">⣿</span>' }, inp('1 chạm'), inp('tải ảnh · in · chia sẻ'), sw(1), { c: 'act', v: btnEd }]]),
  '<span class="btn sm">+ Thêm ô</span>')}
<div class="mask"></div>
<div class="modal">
  <div class="mh"><div class="wi">🗑</div><div><h3>Xóa ô số liệu này?</h3><p>Ô <b>“1 chạm — tải ảnh · in · chia sẻ”</b> sẽ không còn hiển thị trên trang chủ.</p></div></div>
  <div class="mb">
    <div class="note">⚑ Khối giới thiệu đang hiển thị 3 ô. Xóa xong còn 2 ô, bố cục tự giãn ra cho cân.</div>
    <div style="font-size:12.5px;margin-top:12px"><span class="chk on"></span> Giữ trong thùng rác 30 ngày (có thể phục hồi)</div>
    <div class="hint" style="margin-top:6px">Nếu chỉ muốn ẩn tạm, hãy <b>tắt công tắc “Hiện”</b> thay vì xóa.</div>
  </div>
  <div class="mf"><a class="btn" href="${to('home')}">Hủy</a><a class="btn d" href="${to('acc')}" style="background:var(--danger);color:#fff;border-color:var(--danger)">🗑 Xóa ô số liệu</a></div>
</div>`,
});

/* ================= 10. Tài khoản & nhật ký ================= */
page('10-tai-khoan-nhat-ky', {
  h1: 'Tài khoản & nhật ký', crumb: 'Hệ thống / <b>Tài khoản & nhật ký</b>', active: 'acc', h: 1060,
  actions: '<span class="btn p">+ Thêm tài khoản</span>',
  body: `
${card('Người được vào trang quản trị <small>2 tài khoản</small>', table(
    [['Người dùng'], ['Email đăng nhập'], ['Vai trò'], ['Lần vào gần nhất'], ['Trạng thái'], ['', 'text-align:right;width:150px']],
    [['<b>Thầy Thiên Lương</b><div class="tmeta">Chủ website</div>', 'thay@thienluong.vn', '<span class="badge b-info">Quản trị</span>', '09:12 hôm nay', '<span class="badge b-ok">● Đang bật</span>', { c: 'act', v: btnEd }],
     ['<b>Trợ lý nội dung</b><div class="tmeta">Sửa chữ, không đổi an sao</div>', 'troly@thienluong.vn', '<span class="badge b-off">Biên tập</span>', '18/11 20:40', '<span class="badge b-ok">● Đang bật</span>', { c: 'act', v: btnEd }]]),
  '<span class="btn sm">+ Thêm tài khoản</span>')}
<div class="grid g2">
  ${card('Thêm tài khoản', `<div class="pad">
    ${f('Tên hiển thị', inp('Nguyễn Văn A'))}
    ${f('Email đăng nhập', inp('nguyenvana@thienluong.vn'))}
    ${f('Vai trò', sel('Biên tập — sửa chữ, không đổi tùy chọn an sao'))}
    <div class="hint"><b>Quản trị:</b> sửa mọi thứ, kể cả tùy chọn an sao và tài khoản.<br><b>Biên tập:</b> sửa chữ và ảnh, không đụng được phần an sao.</div>
    <div style="display:flex;gap:8px;margin-top:10px"><span class="btn p">+ Gửi lời mời</span><span class="btn">Hủy</span></div></div>`)}
  ${card('Thùng rác <small>giữ 30 ngày rồi tự xóa hẳn</small>', table(
    [['Mục đã xóa'], ['Xóa lúc'], ['', 'text-align:right;width:160px']],
    [['<b>Ô số liệu “1 chạm”</b><div class="tmeta">Khối giới thiệu · trang chủ</div>', '18/11 21:40', { c: 'act', v: `<a class="btn sm" href="${to('home')}">↺ Phục hồi</a> <a class="btn sm d" href="${to('del')}">🗑 Xóa hẳn</a>` }],
     ['<b>Kênh liên hệ “Điện thoại”</b><div class="tmeta">Liên hệ & nút CTA</div>', '12/11 09:20', { c: 'act', v: `<a class="btn sm" href="${to('cta')}">↺ Phục hồi</a> <a class="btn sm d" href="${to('del')}">🗑 Xóa hẳn</a>` }]]))}
</div>
${card('Nhật ký thay đổi <small>ai sửa gì, lúc nào</small>', table(
    [['Thời điểm'], ['Người sửa'], ['Việc đã làm'], ['Khu vực nội dung'], ['', 'text-align:right;width:110px']],
    [['09:05 hôm nay', 'Thầy Thiên Lương', '<span class="badge b-warn">Sửa</span> tiêu đề lớn', 'Khối giới thiệu · trang chủ', edTo('home')],
     ['18/11 21:50', 'Thầy Thiên Lương', '<span class="badge b-ok">Phát hành</span> bản v1.0.13', 'Toàn site', edTo('dash')],
     ['18/11 21:40', 'Trợ lý nội dung', '<span class="badge b-dan">Xóa</span> ô số liệu “1 chạm”', 'Khối giới thiệu · trang chủ', edTo('home')],
     ['12/11 09:20', 'Thầy Thiên Lương', '<span class="badge b-info">Thêm</span> kênh liên hệ Messenger', 'Liên hệ & nút CTA', edTo('cta')]]))}`,
});

/* ---------------- gom thành MỘT tệp ---------------- */
const css = fs.readFileSync(path.join(OUT, '_css.css'), 'utf8');
const logoSvg = fs.readFileSync(path.join(OUT, '_logo.svg'), 'utf8');
const logoInner = logoSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

const EXTRA_CSS = `
/* --- gom nhiều màn vào một tệp --- */
.screen{display:none}
.screen.on{display:block}
a{color:inherit}
a.btn,a.logo,a.me{text-decoration:none}
a.btn:hover{border-color:var(--brand);color:var(--brand)}
a.btn.p:hover{color:#fff;filter:brightness(1.1)}
a.me{color:inherit}
.tabs a{padding:10px 13px;font-size:13px;color:var(--muted);font-weight:600;border-bottom:2px solid transparent;text-decoration:none}
.tabs a.on{color:var(--brand);border-bottom-color:var(--brand)}
.tabs a:hover{color:var(--brand)}
.side a:hover{background:rgba(255,255,255,.07)}
.side .foot .out{display:inline-block;margin-top:6px;color:#d9c79b;text-decoration:underline}
svg.mk{width:40px;height:40px;display:block}
svg.mk.big{width:66px;height:66px}
svg.mk.md{width:46px;height:46px}
svg.mk.sm2{width:22px;height:22px}
.login .lg{margin-bottom:16px}
.demo-tag{background:#f8efdc;border:1px solid #e0c98a;color:#8c6a3c;font-size:11px;font-weight:700;
  letter-spacing:.04em;text-align:center;border-radius:8px;padding:6px 8px;margin-bottom:14px}
/* màn hình nhỏ: cho cuộn ngang thay vì vỡ bố cục (bản vẽ này thiết kế cho máy tính) */
@media (max-width:1100px){
  body{overflow-x:auto}
  .screen{min-width:1280px}
  .login .box{min-width:0}
  .screen#dang-nhap{min-width:0}
}
/* bảng hướng dẫn nhỏ ở góc — ẩn khi chụp ảnh (thêm ?clean vào link) */
.tip{position:fixed;right:16px;bottom:16px;z-index:50;background:#2a1844;color:#efe7f4;font-size:12px;
  padding:9px 13px;border-radius:999px;box-shadow:0 10px 24px rgba(0,0,0,.35);border:1px solid #c7a14e}
body.clean .tip{display:none}
`;

const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Quản trị Thiên Lương</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Noto+Serif:wght@600;700&display=swap" rel="stylesheet">
<style>
${css}
${EXTRA_CSS}</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="tl-logo" viewBox="0 0 100 100">${logoInner}</symbol></svg>

${screens.join('\n\n')}

<div class="tip">Bản xem thử · bấm menu bên trái để đi các màn</div>

<script>
(function () {
  var DEFAULT = '${R.login}';
  function show() {
    var id = (location.hash || '').replace(/^#/, '') || DEFAULT;
    var el = document.getElementById(id) || document.getElementById(DEFAULT);
    var all = document.querySelectorAll('.screen');
    for (var i = 0; i < all.length; i++) all[i].className = 'screen' + (all[i] === el ? ' on' : '');
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', show);
  if (/[?&]clean/.test(location.search)) document.body.className = 'clean';
  show();
}());
</script>
</body></html>`;

fs.writeFileSync(path.join(OUT, 'index.html'), html, 'utf8');

/* xóa các tệp rời của bản cũ (mỗi màn một tệp) */
for (const name of fs.readdirSync(OUT)) {
  if (/^\d\d-.*\.html$/.test(name)) fs.unlinkSync(path.join(OUT, name));
}

fs.writeFileSync(path.join(OUT, '_pages.json'), JSON.stringify(PAGES, null, 2), 'utf8');
console.log('Đã sinh 1 tệp: index.html (' + PAGES.length + ' màn)');
for (const p of PAGES) console.log('  #' + p.route + '  (' + p.w + 'x' + p.h + ')  ' + p.h1);
