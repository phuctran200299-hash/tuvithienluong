// Chạy: node tests/engine.test.js
'use strict';
const assert = require('assert');
const TVTL = require('../assets/js/tuvi-core.js');
const CHI = TVTL.CHI;

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; }
  catch (e) { fail++; console.log('✗ ' + name + '\n   ' + e.message); }
}

/* ---------------- Lịch âm ---------------- */
const L = TVTL.lunar;
t('20/02/1999 = 5/1 Kỷ Mão', () => assert.deepStrictEqual(L.solarToLunar(20, 2, 1999, 7), [5, 1, 1999, 0]));
t('Tết Bính Ngọ 17/02/2026', () => assert.deepStrictEqual(L.solarToLunar(17, 2, 2026, 7), [1, 1, 2026, 0]));
t('Tết Giáp Thìn 10/02/2024', () => assert.deepStrictEqual(L.solarToLunar(10, 2, 2024, 7), [1, 1, 2024, 0]));
t('Năm 2023 nhuận tháng 2', () => assert.strictEqual(L.leapMonthOfYear(2023, 7), 2));
t('Năm 2025 nhuận tháng 6', () => assert.strictEqual(L.leapMonthOfYear(2025, 7), 6));
t('22/03/2023 = 1/2 nhuận', () => assert.deepStrictEqual(L.solarToLunar(22, 3, 2023, 7), [1, 2, 2023, 1]));
t('Tết 1985 VN (21/1) khác TQ', () => assert.deepStrictEqual(L.solarToLunar(21, 1, 1985, 7), [1, 1, 1985, 0]));
t('Âm -> Dương khứ hồi', () => {
  for (let y = 1930; y <= 2050; y += 7) {
    for (let m = 1; m <= 12; m++) {
      const s = L.lunarToSolar(15, m, y, 0, 7);
      assert.deepStrictEqual(L.solarToLunar(s[0], s[1], s[2], 7).slice(0, 3), [15, m, y]);
    }
  }
});

/* ---------------- Lá số mẫu (ảnh tuvi.vn) ----------------
 * 20/02/1999 dương lịch, 5h30, Nam, năm xem 2026 */
const ls = TVTL.lapLaSo({ ten: 'Lá số mẫu', ngay: 20, thang: 2, nam: 1999, gio: 5, phut: 30, gioiTinh: 1, namXem: 2026, thangXem: 10 });
const I = ls.info;
const cungTai = (chi) => ls.cung[CHI.indexOf(chi) - 1];
const coSao = (chi, ten, luu = false) => cungTai(chi).sao.some(s => s.ten === ten && !!s.luu === luu && !s.dv);
const viTriSao = (ten, luu = false) => ls.cung.filter(c => c.sao.some(s => s.ten === ten && !!s.luu === luu && !s.dv)).map(c => c.chi);

t('Can chi', () => {
  assert.strictEqual(I.canChiNam, 'Kỷ Mão');
  assert.strictEqual(I.canChiThang, 'Bính Dần');
  assert.strictEqual(I.canChiNgay, 'Quý Mão');
  assert.strictEqual(I.canChiGio, 'Ất Mão');
});
t('Thông tin chung', () => {
  assert.strictEqual(I.amDuongNamNu, 'Âm Nam');
  assert.strictEqual(I.banMenh, 'Thành Đầu Thổ');
  assert.strictEqual(I.cuc, 'Hỏa Lục Cục');
  assert.strictEqual(I.quanHeCucMenh, 'Cục sinh Mệnh');
  assert.strictEqual(I.menhChu, 'Văn Khúc');
  assert.strictEqual(I.thanChu, 'Thiên Đồng');
  assert.strictEqual(I.laiNhanCung, 'Thiên Di');
  assert.strictEqual(I.tuoi, 28);
  assert.ok(I.canLuong.startsWith('5 lượng'), I.canLuong);
});
t('12 cung chủ + Thân', () => {
  const exp = { Hợi: 'Mệnh', Tý: 'Phụ Mẫu', Sửu: 'Phúc Đức', Dần: 'Điền Trạch', Mão: 'Quan Lộc', Thìn: 'Nô Bộc',
    Tỵ: 'Thiên Di', Ngọ: 'Tật Ách', Mùi: 'Tài Bạch', Thân: 'Tử Tức', Dậu: 'Phu Thê', Tuất: 'Huynh Đệ' };
  for (const k in exp) assert.strictEqual(cungTai(k).ten, exp[k], k);
  assert.ok(cungTai('Tỵ').than);
});
t('Can cung (Ngũ Hổ Độn)', () => {
  const exp = { Dần: 'Bính', Mão: 'Đinh', Thìn: 'Mậu', Tỵ: 'Kỷ', Ngọ: 'Canh', Tý: 'Bính', Sửu: 'Đinh', Hợi: 'Ất' };
  for (const k in exp) assert.strictEqual(TVTL.CAN[cungTai(k).can], exp[k], k);
});
t('Đại hạn', () => {
  const exp = { Hợi: 6, Tuất: 16, Dậu: 26, Thân: 36, Mùi: 46, Ngọ: 56, Tỵ: 66, Thìn: 76, Mão: 86, Dần: 96, Sửu: 106, Tý: 116 };
  for (const k in exp) assert.strictEqual(cungTai(k).daiHan, exp[k], k);
});
t('Chính tinh + miếu hãm', () => {
  const exp = [['Tỵ', 'Tham Lang', 'H'], ['Tỵ', 'Liêm Trinh', 'H'], ['Ngọ', 'Cự Môn', 'V'], ['Mùi', 'Thiên Tướng', 'Đ'],
    ['Thân', 'Thiên Đồng', 'M'], ['Thân', 'Thiên Lương', 'V'], ['Thìn', 'Thái Âm', 'H'], ['Dậu', 'Thất Sát', 'H'],
    ['Dậu', 'Vũ Khúc', 'Đ'], ['Mão', 'Thiên Phủ', 'B'], ['Tuất', 'Thái Dương', 'H'], ['Sửu', 'Phá Quân', 'V'],
    ['Sửu', 'Tử Vi', 'Đ'], ['Tý', 'Thiên Cơ', 'Đ']];
  for (const [chi, ten, dt] of exp) {
    const s = cungTai(chi).sao.find(x => x.ten === ten);
    assert.ok(s, ten + ' phải ở ' + chi);
    assert.strictEqual(s.dacTinh, dt, ten);
  }
});
t('Phụ tinh theo ảnh mẫu', () => {
  const exp = {
    'Tả Phù': 'Thìn', 'Hữu Bật': 'Tuất', 'Văn Khúc': 'Mùi', 'Văn Xương': 'Mùi', 'Lộc Tồn': 'Ngọ', 'Kình Dương': 'Mùi',
    'Đà La': 'Tỵ', 'Địa Kiếp': 'Dần', 'Địa Không': 'Thân', 'Hỏa Tinh': 'Ngọ', 'Linh Tinh': 'Sửu', 'Thiên Khôi': 'Tý',
    'Thiên Việt': 'Thân', 'Long Trì': 'Mùi', 'Phượng Các': 'Mùi', 'Giải Thần': 'Mùi', 'Tam Thai': 'Thân', 'Bát Tọa': 'Ngọ',
    'Ân Quang': 'Tuất', 'Thiên Quý': 'Thìn', 'Thiên Hình': 'Dậu', 'Thai Phụ': 'Dậu', 'Phong Cáo': 'Tỵ', 'Thiên Giải': 'Thân',
    'Địa Giải': 'Mùi', 'Thiên Thọ': 'Thân', 'Thiên Trù': 'Thân', 'Lưu Hà': 'Ngọ', 'Thiên Quan': 'Dậu', 'Thiên Phúc': 'Dần',
    'Đẩu Quân': 'Ngọ', 'Thiên Không': 'Thìn', 'Văn Tinh': 'Dậu', 'Đường Phù': 'Hợi', 'Quốc Ấn': 'Dần', 'Thiên Mã': 'Tỵ',
    'Hoa Cái': 'Mùi', 'Kiếp Sát': 'Thân', 'Đào Hoa': 'Tý', 'Phá Toái': 'Tỵ', 'Cô Thần': 'Tỵ', 'Thiên Hư': 'Dậu',
    'Thiên Hỷ': 'Ngọ', 'Thiên La': 'Thìn', 'Địa Võng': 'Tuất', 'Thiên Thương': 'Thìn', 'Thiên Sứ': 'Ngọ',
    'Tang Môn': 'Tỵ', 'Bạch Hổ': 'Hợi', 'Lực Sỹ': 'Tỵ', 'Đại Hao': 'Dậu', 'Phục Binh': 'Thân',
    'Hóa Quyền': 'Tỵ', 'Hóa Lộc': 'Dậu', 'Hóa Khoa': 'Thân', 'Hóa Kỵ': 'Mùi'
  };
  for (const ten in exp) assert.deepStrictEqual(viTriSao(ten), [exp[ten]], ten);
});
t('Tràng sinh (âm nam nghịch)', () => {
  const exp = { Dần: 'Tràng Sinh', Sửu: 'Mộc Dục', Tuất: 'Đế Vượng', Dậu: 'Suy', Thân: 'Bệnh', Mùi: 'Tử', Ngọ: 'Mộ', Tỵ: 'Tuyệt', Thìn: 'Thai', Mão: 'Dưỡng' };
  for (const k in exp) assert.strictEqual(cungTai(k).trangSinh, exp[k], k);
});
t('Tuần, Triệt ở Thân - Dậu', () => {
  assert.deepStrictEqual(I.tuan.slice().sort((a, b) => a - b), [9, 10]);
  assert.deepStrictEqual(I.triet.slice().sort((a, b) => a - b), [9, 10]);
});
t('Tiểu hạn (vòng chi quanh trung cung)', () => {
  const exp = { Sửu: 'Mão', Thìn: 'Ngọ', Tỵ: 'Mùi', Hợi: 'Sửu', Dậu: 'Hợi' };
  for (const k in exp) assert.strictEqual(cungTai(k).tieuHanChi, exp[k], k);
});
t('Đại vận / Lưu niên / Nguyệt hạn 2026', () => {
  assert.strictEqual(cungTai('Dậu').dv, 'MỆNH');
  assert.strictEqual(cungTai('Tuất').dv, 'PHỤ');
  assert.strictEqual(cungTai('Tỵ').dv, 'TÀI');
  assert.strictEqual(cungTai('Thìn').ln, 'MỆNH');
  assert.strictEqual(cungTai('Tỵ').ln, 'PHỤ');
  assert.strictEqual(cungTai('Mão').ln, 'HUYNH');
  assert.strictEqual(cungTai('Mùi').thangLuu, 1);
  assert.strictEqual(cungTai('Tỵ').thangLuu, 11);
  assert.strictEqual(cungTai('Thìn').thangLuu, 10);
});
t('Lưu tinh năm Bính Ngọ', () => {
  const exp = { 'Thái Tuế': 'Ngọ', 'Lộc Tồn': 'Tỵ', 'Kình Dương': 'Ngọ', 'Văn Khúc': 'Ngọ', 'Văn Xương': 'Thân',
    'Thiên Mã': 'Thân', 'Hóa Lộc': 'Thân', 'Hóa Khoa': 'Mùi', 'Hóa Kỵ': 'Tỵ', 'Tang Môn': 'Thân', 'Thiên Việt': 'Dậu',
    'Hồng Loan': 'Dậu', 'Kiếp Sát': 'Hợi', 'Đào Hoa': 'Mão', 'Thiên Khốc': 'Tý' };
  for (const ten in exp) assert.deepStrictEqual(viTriSao(ten, true), [exp[ten]], 'L.' + ten);
});
t('Bộ Đức của lưu niên Bính Ngọ', () => {
  // Vòng Thái Tuế của năm xem: Long Đức +7, Phúc Đức & Thiên Đức +9, Nguyệt Đức +5 (cùng Tử Phù)
  const exp = { 'Long Đức': 'Sửu', 'Phúc Đức': 'Mão', 'Thiên Đức': 'Mão', 'Nguyệt Đức': 'Hợi' };
  for (const ten in exp) assert.deepStrictEqual(viTriSao(ten, true), [exp[ten]], 'L.' + ten);
});
t('Sao đại vận (cung Dậu, can Quý) — đối chiếu tuvi.vn', () => {
  const viTriDV = (ten) => ls.cung.filter(c => c.sao.some(s => s.ten === ten && s.dv)).map(c => c.chi);
  const exp = { 'Lộc Tồn': 'Tý', 'Kình Dương': 'Sửu', 'Đà La': 'Hợi', 'Thiên Khôi': 'Mão', 'Thiên Việt': 'Tỵ',
    'Văn Xương': 'Mão', 'Văn Khúc': 'Hợi', 'Thiên Mã': 'Hợi',
    'Hóa Lộc': 'Sửu', 'Hóa Quyền': 'Ngọ', 'Hóa Khoa': 'Thìn', 'Hóa Kỵ': 'Tỵ' };
  for (const ten in exp) assert.deepStrictEqual(viTriDV(ten), [exp[ten]], 'ĐV.' + ten);
  // sao đại vận không được lẫn vào sao gốc hay lưu tinh
  assert.deepStrictEqual(viTriSao('Lộc Tồn'), ['Ngọ']);
  assert.deepStrictEqual(viTriSao('Lộc Tồn', true), ['Tỵ']);
});

/* ---------------- Bảng an sao theo Can / Chi (hồi quy các lỗi đã sửa) ---------------- */
// Năm âm lịch có Can tương ứng: 1984 Giáp ... 1993 Quý
const theoCan = (can, opt = {}) => TVTL.lapLaSo(Object.assign({ ngay: 10, thang: 5, nam: 1983 + can, amLich: true, gio: 0, gioiTinh: 1, namXem: 2026 }, opt));
const viTri = (ls2, ten) => ls2.cung.filter(c => c.sao.some(s => s.ten === ten && !s.luu && !s.dv)).map(c => c.chi);

t('Thiên Khôi – Thiên Việt đủ 10 Can', () => {
  // Giáp Mậu: Sửu–Mùi · Ất Kỷ: Tý–Thân · Bính Đinh: Hợi–Dậu · Canh Tân: Ngọ–Dần · Nhâm Quý: Mão–Tỵ
  const exp = [, ['Sửu', 'Mùi'], ['Tý', 'Thân'], ['Hợi', 'Dậu'], ['Hợi', 'Dậu'], ['Sửu', 'Mùi'], ['Tý', 'Thân'],
    ['Ngọ', 'Dần'], ['Ngọ', 'Dần'], ['Mão', 'Tỵ'], ['Mão', 'Tỵ']];
  for (let can = 1; can <= 10; can++) {
    const x = theoCan(can);
    assert.deepStrictEqual([viTri(x, 'Thiên Khôi')[0], viTri(x, 'Thiên Việt')[0]], exp[can], TVTL.CAN[can]);
  }
  const canhTQ = theoCan(7, { khoiVietCanh: 'suuMui' });
  assert.deepStrictEqual([viTri(canhTQ, 'Thiên Khôi')[0], viTri(canhTQ, 'Thiên Việt')[0]], ['Sửu', 'Mùi'], 'Canh tùy chọn Sửu–Mùi');
});
t('Lưu Hà đủ 10 Can', () => {
  const exp = [, 'Dậu', 'Tuất', 'Mùi', 'Thân', 'Tỵ', 'Ngọ', 'Thìn', 'Mão', 'Hợi', 'Dần'];
  for (let can = 1; can <= 10; can++) assert.deepStrictEqual(viTri(theoCan(can), 'Lưu Hà'), [exp[can]], TVTL.CAN[can]);
});
t('Thiên Quan, Thiên Phúc, Thiên Trù, Lộc Tồn đủ 10 Can', () => {
  const quan = [, 'Mùi', 'Thìn', 'Tỵ', 'Dần', 'Mão', 'Dậu', 'Hợi', 'Dậu', 'Tuất', 'Ngọ'];
  const phuc = [, 'Dậu', 'Thân', 'Tý', 'Hợi', 'Mão', 'Dần', 'Ngọ', 'Tỵ', 'Ngọ', 'Tỵ'];
  const tru = [, 'Tỵ', 'Ngọ', 'Tý', 'Tỵ', 'Ngọ', 'Thân', 'Dần', 'Ngọ', 'Dậu', 'Tuất'];
  const loc = [, 'Dần', 'Mão', 'Tỵ', 'Ngọ', 'Tỵ', 'Ngọ', 'Thân', 'Dậu', 'Hợi', 'Tý'];
  for (let can = 1; can <= 10; can++) {
    const x = theoCan(can);
    assert.deepStrictEqual(viTri(x, 'Thiên Quan'), [quan[can]], 'Quan ' + TVTL.CAN[can]);
    assert.deepStrictEqual(viTri(x, 'Thiên Phúc'), [phuc[can]], 'Phúc ' + TVTL.CAN[can]);
    assert.deepStrictEqual(viTri(x, 'Thiên Trù'), [tru[can]], 'Trù ' + TVTL.CAN[can]);
    assert.deepStrictEqual(viTri(x, 'Lộc Tồn'), [loc[can]], 'Lộc ' + TVTL.CAN[can]);
  }
});
t('Hỏa Tinh – Linh Tinh: điểm khởi giờ Tý theo tam hợp tuổi', () => {
  // Dương nam: Hỏa thuận, Linh nghịch -> giờ Tý đúng tại cung khởi
  const exp = { 'Thân Tý Thìn': ['Dần', 'Tuất'], 'Dần Ngọ Tuất': ['Sửu', 'Mão'], 'Tỵ Dậu Sửu': ['Mão', 'Tuất'], 'Hợi Mão Mùi': ['Dậu', 'Tuất'] };
  // Giáp Tý & Bính Dần: Dương nam · Quý Dậu & Quý Hợi: Âm nữ
  const cases = [
    ['Thân Tý Thìn', 1984, 1], ['Dần Ngọ Tuất', 1986, 1], ['Tỵ Dậu Sửu', 1993, -1], ['Hợi Mão Mùi', 1983, -1]
  ];
  for (const [g, y, gt] of cases) {
    const x = TVTL.lapLaSo({ ngay: 10, thang: 5, nam: y, amLich: true, gio: 0, gioiTinh: gt, namXem: 2026 });
    assert.deepStrictEqual([viTri(x, 'Hỏa Tinh')[0], viTri(x, 'Linh Tinh')[0]], exp[g], g);
  }
});
t('Tứ Hóa năm Nhâm: mặc định Tả Phù hóa Khoa, tùy chọn Thiên Phủ', () => {
  const a = theoCan(9), b = theoCan(9, { tuHoaNham: 'thienPhu' });
  assert.deepStrictEqual(viTri(a, 'Hóa Khoa'), viTri(a, 'Tả Phù'));
  assert.deepStrictEqual(viTri(b, 'Hóa Khoa'), viTri(b, 'Thiên Phủ'));
});
t('Thiên Giải: mặc định đếm liền, tùy chọn nhảy cung', () => {
  const a = TVTL.lapLaSo({ ngay: 10, thang: 3, nam: 1990, amLich: true, gio: 0, gioiTinh: 1 });
  const b = TVTL.lapLaSo({ ngay: 10, thang: 3, nam: 1990, amLich: true, gio: 0, gioiTinh: 1, thienGiai: 'nhayCung' });
  assert.deepStrictEqual(viTri(a, 'Thiên Giải'), ['Tuất']); // Thân +2 (đếm liền)
  assert.deepStrictEqual(viTri(b, 'Thiên Giải'), ['Tý']);   // Thân +4 (nhảy cung)
});
t('Tháng nhuận tách ngày 15', () => {
  // 2023 nhuận tháng 2; ngày 20/2 nhuận
  const a = TVTL.lapLaSo({ ngay: 20, thang: 2, nam: 2023, amLich: true, thangNhuan: true, gio: 0, gioiTinh: 1 });
  const b = TVTL.lapLaSo({ ngay: 20, thang: 2, nam: 2023, amLich: true, thangNhuan: true, gio: 0, gioiTinh: 1, nhuanTach15: true });
  assert.strictEqual(a.info.thangAnSao, 2);
  assert.strictEqual(b.info.thangAnSao, 3);
  assert.strictEqual(b.info.cungMenh, a.info.cungMenh + 1);
});
t('Mỗi sao gốc xuất hiện đúng 1 lần, Tuần/Triệt mỗi thứ 2 cung', () => {
  for (let y = 1930; y <= 2030; y += 7) {
    for (const g of [1, -1]) {
      const x = TVTL.lapLaSo({ ngay: (y % 28) + 1, thang: (y % 12) + 1, nam: y, gio: (y * 3) % 24, gioiTinh: g, namXem: 2026 });
      const dem = {};
      x.cung.forEach(c => c.sao.filter(s => !s.luu && !s.dv).forEach(s => { dem[s.key] = (dem[s.key] || 0) + 1; }));
      for (const k in TVTL.SAO) {
        if (/^(trangSinh|mocDuc|quanDoi|lamQuan|deVuong|suy|benh|tu|mo|tuyet|thai|duong)$/.test(k)) continue;
        assert.strictEqual(dem[k], 1, `${k} năm ${y}`);
      }
      assert.strictEqual(x.cung.filter(c => c.tuan).length, 2);
      assert.strictEqual(x.cung.filter(c => c.triet).length, 2);
      assert.strictEqual(new Set(x.cung.map(c => c.trangSinh)).size, 12);
      assert.strictEqual(new Set(x.cung.map(c => c.tieuHanChi)).size, 12);
      assert.strictEqual(new Set(x.cung.map(c => c.ten)).size, 12);
    }
  }
});

/* ---------------- Ca biên ---------------- */
t('Nhập âm lịch cho kết quả như dương lịch', () => {
  const b = TVTL.lapLaSo({ ngay: 5, thang: 1, nam: 1999, amLich: true, gio: 5, gioiTinh: 1, namXem: 2026 });
  assert.deepStrictEqual(b.info.duong, { ngay: 20, thang: 2, nam: 1999 });
  assert.strictEqual(b.info.cungMenh, I.cungMenh);
});
t('Tháng nhuận không tồn tại -> báo lỗi', () => {
  assert.throws(() => TVTL.lapLaSo({ ngay: 1, thang: 3, nam: 2023, amLich: true, thangNhuan: true, gio: 1, gioiTinh: 1 }));
});
t('Ngày dương sai -> báo lỗi', () => {
  assert.throws(() => TVTL.lapLaSo({ ngay: 31, thang: 2, nam: 2000, gio: 1, gioiTinh: 1 }));
});
t('Giờ Tý muộn (23h) sang ngày mới', () => {
  const a = TVTL.lapLaSo({ ngay: 19, thang: 2, nam: 1999, gio: 23, gioiTinh: 1, namXem: 2026 });
  assert.strictEqual(a.info.am.ngay, 5);
  const b = TVTL.lapLaSo({ ngay: 19, thang: 2, nam: 1999, gio: 23, gioiTinh: 1, namXem: 2026, tySangNgayMoi: false });
  assert.strictEqual(b.info.am.ngay, 4);
});
/* Bảng miếu/vượng/đắc/bình/hãm của phụ tinh — dựng từ 20 lá số tuvi.vn,
 * xem tools/xcheck/dac-tinh.js. '-' = tuvi.vn không ghi đắc tính ở cung đó. */
t('Miếu hãm phụ tinh theo tuvi.vn', () => {
  const D = TVTL._internal.DAC_TINH;
  const exp = {
    locTon:    'M-MM--M-BB--',
    thienMa:   '--Đ--Đ--H--H',
    thienKhoc: 'Đ-HĐHHĐĐHĐHH',
    thienHu:   'HHHHHĐHHĐHHĐ',
    thienHinh: 'HHĐĐHHHHĐĐHH',
    thienRieu: 'HHĐĐHHHHHĐĐH',
    vanXuong:  'HĐH-ĐĐHĐH-ĐĐ',
    vanKhuc:   'HĐH-ĐĐHĐH-ĐĐ'
  };
  for (const key in exp) {
    const got = Array.from({ length: 12 }, (_, i) => (D[key] && D[key][i + 1]) || '-').join('');
    assert.strictEqual(got, exp[key], key);
  }
});
t('Thiên Khốc và Thiên Hư có bảng riêng (lasotuvi dùng chung một bảng)', () => {
  const D = TVTL._internal.DAC_TINH;
  assert.notDeepStrictEqual(D.thienKhoc, D.thienHu);
  // lá số mẫu: Thiên Hư ở Dậu là Hãm (tuvi.vn), không phải Đắc như lasotuvi
  assert.strictEqual(cungTai('Dậu').sao.find(s => s.ten === 'Thiên Hư').dacTinh, 'H');
  assert.strictEqual(cungTai('Dậu').sao.find(s => s.ten === 'Thiên Hình').dacTinh, 'Đ');
  assert.strictEqual(cungTai('Ngọ').sao.find(s => s.ten === 'Lộc Tồn').dacTinh, 'M');
  assert.strictEqual(cungTai('Tỵ').sao.find(s => s.ten === 'Thiên Mã').dacTinh, 'Đ');
});
t('Chạy toàn dải 1900-2100 không lỗi, mỗi lá số đủ 14 chính tinh', () => {
  for (let y = 1900; y <= 2100; y += 3) {
    for (let m = 1; m <= 12; m += 2) {
      for (const h of [0, 7, 13, 23]) {
        for (const g of [1, -1]) {
          const x = TVTL.lapLaSo({ ngay: (y + m) % 28 + 1, thang: m, nam: y, gio: h, gioiTinh: g, namXem: 2026 });
          const n = x.cung.reduce((s, c) => s + c.sao.filter(z => z.chinh).length, 0);
          assert.strictEqual(n, 14, `${y}-${m} ${h}h`);
        }
      }
    }
  }
});

/* ---------------- Bất biến của lá số (quét diện rộng) ----------------
 * Mỗi lá số phải "đóng kín": đủ 12 cung chủ, đủ vòng sao, không có ô trống,
 * không có đắc tính lạ. Quét cả mốc hiếm: 29/2, giờ Tý muộn, tháng nhuận, 1900 & 2100. */
t('Bất biến trên 2.000+ lá số', () => {
  const TEN12 = TVTL.TEN_CUNG.slice();
  const HOP_LE = ['M', 'V', 'Đ', 'B', 'H'];
  let n = 0;
  for (let y = 1900; y <= 2100; y += 7) {
    for (let m = 1; m <= 12; m++) {
      for (const d of [1, 15, 29]) {
        for (const h of [0, 5, 11, 23]) {
          for (const g of [1, -1]) {
            if (m === 2 && d === 29 && new Date(Date.UTC(y, 1, 29)).getUTCDate() !== 29) continue;
            const x = TVTL.lapLaSo({ ngay: d, thang: m, nam: y, gio: h, gioiTinh: g, namXem: y + 30, thangXem: 6 });
            const at = `${d}/${m}/${y} ${h}h ${g === 1 ? 'nam' : 'nữ'}`;
            n++;
            // 12 cung chủ, mỗi tên đúng một lần
            assert.deepStrictEqual(x.cung.map(c => c.ten).slice().sort(), TEN12.slice().sort(), 'tên cung ' + at);
            // vòng Tràng Sinh đủ 12, tiểu hạn đủ 12 chi, nguyệt hạn đủ 12 tháng
            assert.strictEqual(new Set(x.cung.map(c => c.trangSinh)).size, 12, 'Tràng Sinh ' + at);
            assert.strictEqual(new Set(x.cung.map(c => c.tieuHanChi)).size, 12, 'tiểu hạn ' + at);
            assert.strictEqual(new Set(x.cung.map(c => c.thangLuu)).size, 12, 'nguyệt hạn ' + at);
            // đại hạn: 12 mốc cách nhau 10 tuổi, bắt đầu từ Cục
            const dh = x.cung.map(c => c.daiHan).sort((a, b) => a - b);
            assert.strictEqual(dh.length, 12, 'đại hạn ' + at);
            dh.forEach((v, i) => assert.strictEqual(v, dh[0] + i * 10, 'đại hạn cách 10 ' + at));
            assert.ok(dh[0] >= 2 && dh[0] <= 6, 'Cục ' + at);
            // Tuần & Triệt: mỗi cái đúng 2 cung liền nhau
            assert.strictEqual(x.cung.filter(c => c.tuan).length, 2, 'Tuần ' + at);
            assert.strictEqual(x.cung.filter(c => c.triet).length, 2, 'Triệt ' + at);
            // đúng 1 cung Thân, đúng 14 chính tinh, đắc tính hợp lệ
            assert.strictEqual(x.cung.filter(c => c.than).length, 1, 'cung Thân ' + at);
            let chinh = 0;
            for (const c of x.cung) {
              for (const s of c.sao) {
                if (s.chinh && !s.luu && !s.dv) chinh++;
                if (s.dacTinh) assert.ok(HOP_LE.indexOf(s.dacTinh) >= 0, 'đắc tính lạ ' + s.ten + ' ' + at);
                assert.ok(s.ten && s.hanh, 'sao thiếu dữ liệu ' + s.key + ' ' + at);
              }
            }
            assert.strictEqual(chinh, 14, 'chính tinh ' + at);
            // thông tin tổng quát không được rỗng
            for (const k of ['banMenh', 'cuc', 'menhChu', 'thanChu', 'canChiNam', 'canChiThang', 'canChiNgay', 'canChiGio', 'thanCu', 'canLuong']) {
              assert.ok(x.info[k], k + ' rỗng ' + at);
            }
          }
        }
      }
    }
  }
  assert.ok(n > 2000, 'quét được ' + n + ' lá số');
});
t('Từ chối dữ liệu sai', () => {
  const bad = [
    { ngay: 31, thang: 2, nam: 2000 },                       // 31/2 dương lịch
    { ngay: 30, thang: 2, nam: 2023, amLich: true, thangNhuan: true }, // tháng 2 nhuận 2023 không có ngày 30
    { ngay: 1, thang: 5, nam: 2023, amLich: true, thangNhuan: true },  // 2023 không nhuận tháng 5
  ];
  for (const b of bad) {
    assert.throws(() => TVTL.lapLaSo(Object.assign({ gio: 5, gioiTinh: 1, namXem: 2026 }, b)),
      'phải báo lỗi: ' + JSON.stringify(b));
  }
});

console.log(`\n${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
