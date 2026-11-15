/*!
 * Tuvithienluong — Lõi lập lá số Tử Vi (phái Việt Nam)
 *
 * - Thuật toán lịch âm: Hồ Ngọc Đức (2006), dựa trên "Astronomical Algorithms" (Jean Meeus).
 * - Thuật toán an sao: chuyển thể từ dự án lasotuvi (MIT, (c) 2016 doanguyen),
 *   đã sửa lỗi & bổ sung (xem THIRD_PARTY_NOTICES.md và docs/GHI-CHU-AN-SAO.md).
 *
 * Quy ước vị trí cung trên địa bàn: 1=Tý, 2=Sửu, 3=Dần, ... 12=Hợi.
 * Quy ước Can: 1=Giáp ... 10=Quý.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TVTL = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ===================================================================== *
   * 1. LỊCH ÂM — Hồ Ngọc Đức
   * ===================================================================== */
  var PI = Math.PI;
  var INT = Math.floor;

  function jdFromDate(dd, mm, yy) {
    var a = INT((14 - mm) / 12);
    var y = yy + 4800 - a;
    var m = mm + 12 * a - 3;
    var jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    return jd;
  }

  function jdToDate(jd) {
    var a, b, c;
    if (jd > 2299160) {
      a = jd + 32044;
      b = INT((4 * a + 3) / 146097);
      c = a - INT((b * 146097) / 4);
    } else {
      b = 0;
      c = jd + 32082;
    }
    var d = INT((4 * c + 3) / 1461);
    var e = c - INT((1461 * d) / 4);
    var m = INT((5 * e + 2) / 153);
    var day = e - INT((153 * m + 2) / 5) + 1;
    var month = m + 3 - 12 * INT(m / 10);
    var year = b * 100 + d - 4800 + INT(m / 10);
    return [day, month, year];
  }

  function newMoon(k) {
    var T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
    var Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    var M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    var Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    var F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    var C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    var deltat;
    if (T < -11) deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
    else deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    return Jd1 + C1 - deltat;
  }

  function getSunLongitude(jdn, timeZone) {
    return INT(sunLongitudeDeg(jdn, timeZone) / 30);
  }

  /** Kinh độ mặt trời (độ, 0..360) lúc 0h giờ địa phương của ngày Julius jdn */
  function sunLongitudeDeg(jdn, timeZone) {
    var T = (jdn - 2451545.5 - timeZone / 24) / 36525, T2 = T * T, dr = PI / 180;
    var M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    var L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    var DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    var L = L0 + DL;
    var omega = 125.04 - 1934.136 * T;
    L = L - 0.00569 - 0.00478 * Math.sin(omega * dr);
    L = L * dr;
    L = L - PI * 2 * INT(L / (PI * 2));
    return (L / dr);
  }

  var TIET_KHI = ['Xuân Phân', 'Thanh Minh', 'Cốc Vũ', 'Lập Hạ', 'Tiểu Mãn', 'Mang Chủng', 'Hạ Chí', 'Tiểu Thử',
    'Đại Thử', 'Lập Thu', 'Xử Thử', 'Bạch Lộ', 'Thu Phân', 'Hàn Lộ', 'Sương Giáng', 'Lập Đông', 'Tiểu Tuyết',
    'Đại Tuyết', 'Đông Chí', 'Tiểu Hàn', 'Đại Hàn', 'Lập Xuân', 'Vũ Thủy', 'Kinh Trập'];
  /** Tiết khí của ngày dương lịch (tính theo kinh độ mặt trời, mỗi tiết 15°) */
  function tietKhi(dd, mm, yy, timeZone) {
    if (timeZone === undefined) timeZone = 7;
    // lấy kinh độ lúc cuối ngày để ngày giao tiết hiện tên tiết mới
    return TIET_KHI[INT(sunLongitudeDeg(jdFromDate(dd, mm, yy) + 1, timeZone) / 15) % 24];
  }

  function getNewMoonDay(k, timeZone) {
    return INT(newMoon(k) + 0.5 + timeZone / 24);
  }

  function getLunarMonth11(yy, timeZone) {
    var off = jdFromDate(31, 12, yy) - 2415021;
    var k = INT(off / 29.530588853);
    var nm = getNewMoonDay(k, timeZone);
    if (getSunLongitude(nm, timeZone) >= 9) nm = getNewMoonDay(k - 1, timeZone);
    return nm;
  }

  function getLeapMonthOffset(a11, timeZone) {
    var k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    var last, i = 1;
    var arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    do {
      last = arc;
      i++;
      arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    } while (arc !== last && i < 14);
    return i - 1;
  }

  /** Dương lịch -> Âm lịch. Trả về [ngày, tháng, năm, nhuận(0|1)] */
  function solarToLunar(dd, mm, yy, timeZone) {
    if (timeZone === undefined) timeZone = 7;
    var dayNumber = jdFromDate(dd, mm, yy);
    var k = INT((dayNumber - 2415021.076998695) / 29.530588853);
    var monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) monthStart = getNewMoonDay(k, timeZone);
    var a11 = getLunarMonth11(yy, timeZone);
    var b11 = a11;
    var lunarYear;
    if (a11 >= monthStart) {
      lunarYear = yy;
      a11 = getLunarMonth11(yy - 1, timeZone);
    } else {
      lunarYear = yy + 1;
      b11 = getLunarMonth11(yy + 1, timeZone);
    }
    var lunarDay = dayNumber - monthStart + 1;
    var diff = INT((monthStart - a11) / 29);
    var lunarLeap = 0;
    var lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      var leapMonthDiff = getLeapMonthOffset(a11, timeZone);
      if (diff >= leapMonthDiff) {
        lunarMonth = diff + 10;
        if (diff === leapMonthDiff) lunarLeap = 1;
      }
    }
    if (lunarMonth > 12) lunarMonth -= 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
    return [lunarDay, lunarMonth, lunarYear, lunarLeap];
  }

  /** Âm lịch -> Dương lịch. Trả về [ngày, tháng, năm] hoặc [0,0,0] nếu tháng nhuận không tồn tại */
  function lunarToSolar(lunarDay, lunarMonth, lunarYear, lunarLeap, timeZone) {
    if (timeZone === undefined) timeZone = 7;
    var a11, b11;
    if (lunarMonth < 11) {
      a11 = getLunarMonth11(lunarYear - 1, timeZone);
      b11 = getLunarMonth11(lunarYear, timeZone);
    } else {
      a11 = getLunarMonth11(lunarYear, timeZone);
      b11 = getLunarMonth11(lunarYear + 1, timeZone);
    }
    var k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    var off = lunarMonth - 11;
    if (off < 0) off += 12;
    if (b11 - a11 > 365) {
      var leapOff = getLeapMonthOffset(a11, timeZone);
      var leapMonth = leapOff - 2;
      if (leapMonth < 0) leapMonth += 12;
      if (lunarLeap && lunarMonth !== leapMonth) return [0, 0, 0];
      else if (lunarLeap || off >= leapOff) off += 1;
    } else if (lunarLeap) {
      return [0, 0, 0];
    }
    var monthStart = getNewMoonDay(k + off, timeZone);
    return jdToDate(monthStart + lunarDay - 1);
  }

  /** Tháng nhuận của năm âm lịch (0 nếu không có) */
  function leapMonthOfYear(lunarYear, timeZone) {
    if (timeZone === undefined) timeZone = 7;
    var a11 = getLunarMonth11(lunarYear - 1, timeZone);
    var b11 = getLunarMonth11(lunarYear, timeZone);
    if (b11 - a11 <= 365) return 0;
    var leapMonth = getLeapMonthOffset(a11, timeZone) - 2;
    if (leapMonth < 0) leapMonth += 12;
    return leapMonth;
  }

  /* ===================================================================== *
   * 2. DỮ LIỆU CĂN BẢN
   * ===================================================================== */
  var CAN = ['', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  var CAN_VT = ['', 'G', 'A', 'B', 'Đ', 'M', 'K', 'C', 'T', 'N', 'Q'];
  var CHI = ['', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  /** Âm dương của Can: +1 dương, -1 âm */
  var CAN_AM_DUONG = [0, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1];
  /** Vị trí Lộc Tồn theo Can năm */
  var LOC_TON = [0, 3, 4, 6, 7, 6, 7, 9, 10, 12, 1];
  /** Hành của 12 cung trên địa bàn */
  var HANH_CUNG = ['', 'Thủy', 'Thổ', 'Mộc', 'Mộc', 'Thổ', 'Hỏa', 'Hỏa', 'Thổ', 'Kim', 'Kim', 'Thổ', 'Thủy'];
  /** Mệnh chủ / Thân chủ theo Chi năm sinh */
  var MENH_CHU = ['', 'Tham Lang', 'Cự Môn', 'Lộc Tồn', 'Văn Khúc', 'Liêm Trinh', 'Vũ Khúc', 'Phá Quân', 'Vũ Khúc', 'Liêm Trinh', 'Văn Khúc', 'Lộc Tồn', 'Cự Môn'];
  var THAN_CHU = ['', 'Linh Tinh', 'Thiên Tướng', 'Thiên Lương', 'Thiên Đồng', 'Văn Xương', 'Thiên Cơ', 'Hỏa Tinh', 'Thiên Tướng', 'Thiên Lương', 'Thiên Đồng', 'Văn Xương', 'Thiên Cơ'];

  var TEN_CUNG = ['Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch', 'Quan Lộc', 'Nô Bộc', 'Thiên Di', 'Tật Ách', 'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ'];
  var TEN_CUNG_NGAN = ['MỆNH', 'PHỤ', 'PHÚC', 'ĐIỀN', 'QUAN', 'NÔ', 'DI', 'TẬT', 'TÀI', 'TỬ', 'PHỐI', 'HUYNH'];

  var HANH = {
    K: { ten: 'Kim', cuc: 4, tenCuc: 'Kim Tứ Cục' },
    M: { ten: 'Mộc', cuc: 3, tenCuc: 'Mộc Tam Cục' },
    T: { ten: 'Thủy', cuc: 2, tenCuc: 'Thủy Nhị Cục' },
    H: { ten: 'Hỏa', cuc: 6, tenCuc: 'Hỏa Lục Cục' },
    O: { ten: 'Thổ', cuc: 5, tenCuc: 'Thổ Ngũ Cục' }
  };
  /** Vòng tương sinh: Kim -> Thủy -> Mộc -> Hỏa -> Thổ -> Kim */
  var SINH = { K: 'T', T: 'M', M: 'H', H: 'O', O: 'K' };
  var KHAC = { K: 'M', M: 'O', O: 'T', T: 'H', H: 'K' };

  /** Nạp âm 60 hoa giáp (theo cặp) */
  var NAP_AM = [
    ['K', 'Hải Trung Kim'], ['H', 'Lư Trung Hỏa'], ['M', 'Đại Lâm Mộc'], ['O', 'Lộ Bàng Thổ'], ['K', 'Kiếm Phong Kim'],
    ['H', 'Sơn Đầu Hỏa'], ['T', 'Giản Hạ Thủy'], ['O', 'Thành Đầu Thổ'], ['K', 'Bạch Lạp Kim'], ['M', 'Dương Liễu Mộc'],
    ['T', 'Tuyền Trung Thủy'], ['O', 'Ốc Thượng Thổ'], ['H', 'Tích Lịch Hỏa'], ['M', 'Tùng Bách Mộc'], ['T', 'Trường Lưu Thủy'],
    ['K', 'Sa Trung Kim'], ['H', 'Sơn Hạ Hỏa'], ['M', 'Bình Địa Mộc'], ['O', 'Bích Thượng Thổ'], ['K', 'Kim Bạch Kim'],
    ['H', 'Phú Đăng Hỏa'], ['T', 'Thiên Hà Thủy'], ['O', 'Đại Trạch Thổ'], ['K', 'Thoa Xuyến Kim'], ['M', 'Tang Đố Mộc'],
    ['T', 'Đại Khê Thủy'], ['O', 'Sa Trung Thổ'], ['H', 'Thiên Thượng Hỏa'], ['M', 'Thạch Lựu Mộc'], ['T', 'Đại Hải Thủy']
  ];

  /** Chỉ số Lục thập hoa giáp (0 = Giáp Tý) từ can (1..10), chi (1..12) */
  function giapTyIndex(can, chi) {
    for (var i = 0; i < 60; i++) if (i % 10 === can - 1 && i % 12 === chi - 1) return i;
    return -1;
  }
  function napAm(can, chi) {
    var x = NAP_AM[INT(giapTyIndex(can, chi) / 2)];
    return { hanh: x[0], ten: x[1] };
  }

  /* ---------- Danh mục sao ----------
   * hanh: K/M/T/H/O ; loai: <10 cát tinh, >10 sát/hung tinh (theo lasotuvi)
   * chinh: true với 14 chính tinh                                         */
  var SAO = {
    tuVi: ['Tử Vi', 'O', 1], liemTrinh: ['Liêm Trinh', 'H', 1], thienDong: ['Thiên Đồng', 'T', 1],
    vuKhuc: ['Vũ Khúc', 'K', 1], thaiDuong: ['Thái Dương', 'H', 1], thienCo: ['Thiên Cơ', 'M', 1],
    thienPhu: ['Thiên Phủ', 'O', 1], thaiAm: ['Thái Âm', 'T', 1], thamLang: ['Tham Lang', 'T', 1],
    cuMon: ['Cự Môn', 'T', 1], thienTuong: ['Thiên Tướng', 'T', 1], thienLuong: ['Thiên Lương', 'M', 1],
    thatSat: ['Thất Sát', 'K', 1], phaQuan: ['Phá Quân', 'T', 1],
    // Vòng Thái Tuế
    thaiTue: ['Thái Tuế', 'H', 15], thieuDuong: ['Thiếu Dương', 'H', 5], tangMon: ['Tang Môn', 'M', 12],
    thieuAm: ['Thiếu Âm', 'T', 5], quanPhu3: ['Quan Phù', 'H', 12], tuPhu: ['Tử Phù', 'K', 12],
    tuePha: ['Tuế Phá', 'H', 12], longDuc: ['Long Đức', 'T', 5], bachHo: ['Bạch Hổ', 'K', 12],
    phucDuc: ['Phúc Đức', 'O', 5], dieuKhach: ['Điếu Khách', 'H', 12], trucPhu: ['Trực Phù', 'K', 16],
    // Vòng Lộc Tồn - Bác Sỹ
    locTon: ['Lộc Tồn', 'O', 3], bacSy: ['Bác Sỹ', 'T', 5], lucSi: ['Lực Sỹ', 'H', 2],
    thanhLong: ['Thanh Long', 'T', 5], tieuHao: ['Tiểu Hao', 'H', 12], tuongQuan: ['Tướng Quân', 'M', 4],
    tauThu: ['Tấu Thư', 'K', 3], phiLiem: ['Phi Liêm', 'H', 2], hyThan: ['Hỷ Thần', 'H', 5],
    benhPhu: ['Bệnh Phù', 'O', 12], daiHao: ['Đại Hao', 'H', 12], phucBinh: ['Phục Binh', 'H', 13],
    quanPhu2: ['Quan Phủ', 'H', 12],
    // Vòng Tràng Sinh
    trangSinh: ['Tràng Sinh', 'T', 5], mocDuc: ['Mộc Dục', 'T', 14], quanDoi: ['Quan Đới', 'K', 4],
    lamQuan: ['Lâm Quan', 'K', 7], deVuong: ['Đế Vượng', 'K', 5], suy: ['Suy', 'T', 12],
    benh: ['Bệnh', 'H', 12], tu: ['Tử', 'H', 12], mo: ['Mộ', 'O', 2], tuyet: ['Tuyệt', 'O', 12],
    thai: ['Thai', 'O', 14], duong: ['Dưỡng', 'M', 2],
    // Lục sát & phụ tinh
    daLa: ['Đà La', 'K', 11], kinhDuong: ['Kình Dương', 'K', 11], diaKhong: ['Địa Không', 'H', 11],
    diaKiep: ['Địa Kiếp', 'H', 11], linhTinh: ['Linh Tinh', 'H', 11], hoaTinh: ['Hỏa Tinh', 'H', 11],
    vanXuong: ['Văn Xương', 'K', 6], vanKhuc: ['Văn Khúc', 'T', 6], thienKhoi: ['Thiên Khôi', 'H', 6],
    thienViet: ['Thiên Việt', 'H', 6], taPhu: ['Tả Phù', 'O', 2], huuBat: ['Hữu Bật', 'O', 2],
    longTri: ['Long Trì', 'T', 3], phuongCac: ['Phượng Các', 'O', 3], tamThai: ['Tam Thai', 'M', 7],
    batToa: ['Bát Tọa', 'T', 7], anQuang: ['Ân Quang', 'M', 3], thienQuy: ['Thiên Quý', 'O', 3],
    thienKhoc: ['Thiên Khốc', 'T', 12], thienHu: ['Thiên Hư', 'T', 12], thienDuc: ['Thiên Đức', 'H', 5],
    nguyetDuc: ['Nguyệt Đức', 'H', 5], thienHinh: ['Thiên Hình', 'H', 15], thienRieu: ['Thiên Riêu', 'T', 13],
    thienY: ['Thiên Y', 'T', 5], quocAn: ['Quốc Ấn', 'O', 6], duongPhu: ['Đường Phù', 'M', 4],
    daoHoa: ['Đào Hoa', 'M', 8], hongLoan: ['Hồng Loan', 'T', 8], thienHy: ['Thiên Hỷ', 'T', 5],
    thienGiai: ['Thiên Giải', 'H', 5], diaGiai: ['Địa Giải', 'O', 5], giaiThan: ['Giải Thần', 'M', 5],
    thaiPhu: ['Thai Phụ', 'K', 6], phongCao: ['Phong Cáo', 'O', 4], thienTai: ['Thiên Tài', 'O', 2],
    thienTho: ['Thiên Thọ', 'O', 5], thienThuong: ['Thiên Thương', 'O', 12], thienSu: ['Thiên Sứ', 'T', 12],
    thienLa: ['Thiên La', 'O', 12], diaVong: ['Địa Võng', 'O', 12],
    hoaKhoa: ['Hóa Khoa', 'T', 5], hoaQuyen: ['Hóa Quyền', 'T', 4], hoaLoc: ['Hóa Lộc', 'M', 3], hoaKy: ['Hóa Kỵ', 'T', 13],
    coThan: ['Cô Thần', 'O', 13], quaTu: ['Quả Tú', 'O', 13], thienMa: ['Thiên Mã', 'H', 3],
    phaToai: ['Phá Toái', 'H', 12], thienQuan: ['Thiên Quan', 'H', 5], thienPhuc: ['Thiên Phúc', 'H', 5],
    luuHa: ['Lưu Hà', 'T', 12], thienTru: ['Thiên Trù', 'O', 5], kiepSat: ['Kiếp Sát', 'H', 11],
    hoaCai: ['Hoa Cái', 'K', 14], vanTinh: ['Văn Tinh', 'H', 6], dauQuan: ['Đẩu Quân', 'H', 5],
    thienKhong: ['Thiên Không', 'T', 11]
  };

  var CHINH_TINH = ['tuVi', 'liemTrinh', 'thienDong', 'vuKhuc', 'thaiDuong', 'thienCo', 'thienPhu',
    'thaiAm', 'thamLang', 'cuMon', 'thienTuong', 'thienLuong', 'thatSat', 'phaQuan'];
  var VONG_TRANG_SINH = ['trangSinh', 'mocDuc', 'quanDoi', 'lamQuan', 'deVuong', 'suy', 'benh', 'tu', 'mo', 'tuyet', 'thai', 'duong'];

  /** Miếu (M) Vượng (V) Đắc (Đ) Bình (B) Hãm (H) — chỉ số 1..12 theo cung Tý..Hợi */
  var DAC_TINH = {
    tuVi:       [, 'B', 'Đ', 'M', 'B', 'V', 'M', 'M', 'Đ', 'M', 'B', 'V', 'B'],
    liemTrinh:  [, 'V', 'Đ', 'V', 'H', 'M', 'H', 'V', 'Đ', 'V', 'H', 'M', 'H'],
    thienDong:  [, 'V', 'H', 'M', 'Đ', 'H', 'Đ', 'H', 'H', 'M', 'H', 'H', 'Đ'],
    vuKhuc:     [, 'V', 'M', 'V', 'Đ', 'M', 'H', 'V', 'M', 'V', 'Đ', 'M', 'H'],
    thaiDuong:  [, 'H', 'Đ', 'V', 'V', 'V', 'M', 'M', 'Đ', 'H', 'H', 'H', 'H'],
    thienCo:    [, 'Đ', 'Đ', 'H', 'M', 'M', 'V', 'Đ', 'Đ', 'V', 'M', 'M', 'H'],
    thienPhu:   [, 'M', 'B', 'M', 'B', 'V', 'Đ', 'M', 'Đ', 'M', 'B', 'V', 'Đ'],
    thaiAm:     [, 'V', 'Đ', 'H', 'H', 'H', 'H', 'H', 'Đ', 'V', 'M', 'M', 'M'],
    thamLang:   [, 'H', 'M', 'Đ', 'H', 'V', 'H', 'H', 'M', 'Đ', 'H', 'V', 'H'],
    cuMon:      [, 'V', 'H', 'V', 'M', 'H', 'H', 'V', 'H', 'Đ', 'M', 'H', 'Đ'],
    thienTuong: [, 'V', 'Đ', 'M', 'H', 'V', 'Đ', 'V', 'Đ', 'M', 'H', 'V', 'Đ'],
    thienLuong: [, 'V', 'Đ', 'V', 'V', 'M', 'H', 'M', 'Đ', 'V', 'H', 'M', 'H'],
    thatSat:    [, 'M', 'Đ', 'M', 'H', 'H', 'V', 'M', 'Đ', 'M', 'H', 'H', 'V'],
    phaQuan:    [, 'M', 'V', 'H', 'H', 'Đ', 'H', 'M', 'V', 'H', 'H', 'Đ', 'H'],
    daLa:       [, 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H'],
    kinhDuong:  [, 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H'],
    linhTinh:   [, 'H', 'H', 'Đ', 'Đ', 'Đ', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'H'],
    hoaTinh:    [, 'H', 'H', 'Đ', 'Đ', 'Đ', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'H'],
    // Xương/Khúc ở Mão và Dậu: tuvi.vn không ghi đắc tính, lasotuvi ghi Đ/H — để trống chờ thầy xác nhận
    vanXuong:   [null, 'H', 'Đ', 'H', null, 'Đ', 'Đ', 'H', 'Đ', 'H', null, 'Đ', 'Đ'],
    vanKhuc:    [null, 'H', 'Đ', 'H', null, 'Đ', 'Đ', 'H', 'Đ', 'H', null, 'Đ', 'Đ'],
    diaKhong:   [, 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ'],
    diaKiep:    [, 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ'],
    hoaKy:      [, , 'Đ', , , 'Đ', , , 'Đ', , , 'Đ', ],
    daiHao:     [, , , 'Đ', 'Đ', , , , , 'Đ', 'Đ', , ],
    tieuHao:    [, , , 'Đ', 'Đ', , , , , 'Đ', 'Đ', , ],
    // Bảng đầy đủ 12 cung dựng từ 20 lá số tuvi.vn (xem tools/xcheck/dac-tinh.js)
    locTon:     [null, 'M', null, 'M', 'M', null, null, 'M', null, 'B', 'B', null, null],
    thienMa:    [null, null, null, 'Đ', null, null, 'Đ', null, null, 'H', null, null, 'H'],
    thienKhoc:  [null, 'Đ', null, 'H', 'Đ', 'H', 'H', 'Đ', 'Đ', 'H', 'Đ', 'H', 'H'],
    thienHu:    [null, 'H', 'H', 'H', 'H', 'H', 'Đ', 'H', 'H', 'Đ', 'H', 'H', 'Đ'],
    thienHinh:  [null, 'H', 'H', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'Đ', 'Đ', 'H', 'H'],
    thienRieu:  [null, 'H', 'H', 'Đ', 'Đ', 'H', 'H', 'H', 'H', 'H', 'Đ', 'Đ', 'H']
  };

  /** Tứ Hóa theo Can: [Lộc, Quyền, Khoa, Kỵ] */
  function tuHoaTheoCan(can, opt) {
    var bang = {
      1: ['liemTrinh', 'phaQuan', 'vuKhuc', 'thaiDuong'],
      2: ['thienCo', 'thienLuong', 'tuVi', 'thaiAm'],
      3: ['thienDong', 'thienCo', 'vanXuong', 'liemTrinh'],
      4: ['thaiAm', 'thienDong', 'thienCo', 'cuMon'],
      5: ['thamLang', 'thaiAm', 'huuBat', 'thienCo'],
      6: ['vuKhuc', 'thamLang', 'thienLuong', 'vanKhuc'],
      7: opt && opt.tuHoaCanh === 'dongAm'
        ? ['thaiDuong', 'vuKhuc', 'thienDong', 'thaiAm']   // Canh: Nhật Vũ Đồng Âm
        : ['thaiDuong', 'vuKhuc', 'thaiAm', 'thienDong'],  // Canh: Nhật Vũ Âm Đồng (phổ biến)
      8: ['cuMon', 'thaiDuong', 'vanKhuc', 'vanXuong'],
      9: opt && opt.tuHoaNham === 'thienPhu'
        ? ['thienLuong', 'tuVi', 'thienPhu', 'vuKhuc']     // Nhâm: Lương Tử Phủ Vũ
        : ['thienLuong', 'tuVi', 'taPhu', 'vuKhuc'],       // Nhâm: Lương Tử Tả Vũ (mặc định — khớp tuvi.vn & iztro)
      10: ['phaQuan', 'cuMon', 'thaiAm', 'thamLang']
    };
    return bang[can];
  }

  /** Cân lượng (đơn vị: chỉ) — Viên Thiên Cang */
  var CAN_LUONG_NAM = [12, 9, 6, 7, 12, 5, 9, 8, 7, 8, 15, 9, 16, 8, 8, 19, 12, 6, 8, 7, 5, 15, 6, 16, 15, 7, 9, 12, 10, 7,
    15, 6, 5, 14, 14, 9, 7, 7, 9, 12, 8, 7, 13, 5, 14, 5, 9, 17, 5, 7, 12, 8, 8, 6, 19, 6, 8, 16, 10, 6];
  var CAN_LUONG_THANG = [, 6, 7, 18, 9, 5, 16, 9, 15, 18, 8, 9, 5];
  var CAN_LUONG_NGAY = [, 5, 10, 8, 15, 16, 15, 8, 16, 8, 16, 9, 17, 8, 17, 10, 8, 9, 18, 5, 15, 10, 9, 8, 9, 15, 18, 7, 8, 16, 6];
  var CAN_LUONG_GIO = [, 16, 6, 7, 10, 9, 16, 10, 8, 8, 9, 6, 6];

  /* ===================================================================== *
   * 3. HÀM TRỢ GIÚP AN SAO
   * ===================================================================== */
  /** Dịch cung: kết quả luôn trong 1..12 */
  function dich(cung) {
    var x = cung;
    for (var i = 1; i < arguments.length; i++) x += arguments[i];
    x = ((x % 12) + 12) % 12;
    return x === 0 ? 12 : x;
  }

  function timCuc(cungMenh, canNam) {
    // Ngũ Hổ Độn: Can tháng Giêng (cung Dần)
    var canDan = (canNam * 2 + 1) % 10 || 10;
    var canCungMenh = ((cungMenh - 3 + 12) % 12 + canDan) % 10 || 10;
    return napAm(canCungMenh, cungMenh).hanh;
  }

  /** Can của từng cung (Ngũ Hổ Độn) */
  function canCung(cung, canNam) {
    var canDan = (canNam * 2 + 1) % 10 || 10;
    return ((cung - 3 + 12) % 12 + canDan - 1) % 10 + 1;
  }

  function timTuVi(cuc, ngay) {
    var cungDan = 3, so = cuc;
    while (so < ngay) { so += cuc; cungDan++; }
    var saiLech = so - ngay;
    if (saiLech % 2 === 1) saiLech = -saiLech;
    return dich(cungDan, saiLech);
  }

  function timTrangSinh(cuc) {
    if (cuc === 6) return 3;            // Hỏa: Dần
    if (cuc === 4) return 6;            // Kim: Tỵ
    if (cuc === 2 || cuc === 5) return 9; // Thủy, Thổ: Thân
    return 12;                          // Mộc: Hợi
  }

  function timHoaLinh(chiNam, gio, gioiTinh, amDuongNam) {
    var hoa, linh;
    // Dần Ngọ Tuất: Sửu–Mão · Thân Tý Thìn: Dần–Tuất · Tỵ Dậu Sửu: Mão–Tuất · Hợi Mão Mùi: Dậu–Tuất
    if ([3, 7, 11].indexOf(chiNam) >= 0) { hoa = 2; linh = 4; }
    else if ([1, 5, 9].indexOf(chiNam) >= 0) { hoa = 3; linh = 11; }
    else if ([6, 10, 2].indexOf(chiNam) >= 0) { hoa = 4; linh = 11; }
    else { hoa = 10; linh = 11; }
    if (gioiTinh * amDuongNam === -1) return [dich(hoa + 1, -gio), dich(linh - 1, gio)];
    return [dich(hoa - 1, gio), dich(linh + 1, -gio)];
  }

  /** Thiên Khôi theo Can (Thiên Việt đối xứng qua trục Tỵ–Hợi: Khôi + Việt ≡ 10).
   *  Giáp Mậu: Sửu–Mùi · Ất Kỷ: Tý–Thân · Bính Đinh: Hợi–Dậu · Tân: Ngọ–Dần · Nhâm Quý: Mão–Tỵ
   *  Canh: Ngọ–Dần (mặc định, sách VN) hoặc Sửu–Mùi (tùy chọn khoiVietCanh = 'suuMui') */
  var KHOI = [0, 2, 1, 12, 12, 2, 1, 7, 7, 4, 4];
  function timKhoi(can, opt) {
    if (can === 7 && opt && opt.khoiVietCanh === 'suuMui') return 2;
    return KHOI[can];
  }
  var THIEN_QUAN = [0, 8, 5, 6, 3, 4, 10, 12, 10, 11, 7];
  var THIEN_PHUC = [0, 10, 9, 1, 12, 4, 3, 7, 6, 7, 6];
  /** Lưu Hà: Giáp Dậu, Ất Tuất, Bính Mùi, Đinh Thân, Mậu Tỵ, Kỷ Ngọ, Canh Thìn, Tân Mão, Nhâm Hợi, Quý Dần */
  var LUU_HA = [0, 10, 11, 8, 9, 6, 7, 5, 4, 12, 3];
  var THIEN_TRU = [0, 6, 7, 1, 6, 7, 9, 3, 7, 10, 11];
  /** Lưu Văn Xương / Lưu Văn Khúc theo Can năm xem */
  var LUU_XUONG = [0, 6, 7, 9, 10, 9, 10, 12, 1, 3, 4];
  var LUU_KHUC = [0, 10, 9, 7, 6, 7, 6, 4, 3, 1, 12];

  function timCoThan(chi) {
    if ([12, 1, 2].indexOf(chi) >= 0) return 3;
    if ([3, 4, 5].indexOf(chi) >= 0) return 6;
    if ([6, 7, 8].indexOf(chi) >= 0) return 9;
    return 12;
  }
  function timThienMa(chi) { return [6, 3, 12, 9][chi % 4]; }
  /** Phá Toái: Tý Ngọ Mão Dậu → Tỵ; Dần Thân Tỵ Hợi → Dậu; Thìn Tuất Sửu Mùi → Sửu */
  function timPhaToai(chi) { return [10, 6, 2][chi % 3]; }
  function timTriet(can) { return [null, [9, 10], [7, 8], [5, 6], [3, 4], [1, 2]][((can - 1) % 5) + 1]; }
  function timTuan(can, chi) {
    var ketThuc = dich(chi, 10 - can);
    return [dich(ketThuc, 1), dich(ketThuc, 2)];
  }

  /** Chi giờ từ giờ đồng hồ (0..23) */
  function chiGio(h) { return (INT((h + 1) / 2) % 12) + 1; }
  /** Can giờ theo Can ngày (Ngũ Thử Độn) */
  function canGio(canNgay, chi) {
    var canTy = ((canNgay - 1) % 5) * 2 + 1;
    return (canTy + chi - 2) % 10 + 1;
  }

  function quanHeHanh(cuc, menh) {
    if (cuc === menh) return 'Cục hòa Mệnh';
    if (SINH[cuc] === menh) return 'Cục sinh Mệnh';
    if (SINH[menh] === cuc) return 'Mệnh sinh Cục';
    if (KHAC[cuc] === menh) return 'Cục khắc Mệnh';
    return 'Mệnh khắc Cục';
  }

  function soLuongChu(chi) {
    var luong = INT(chi / 10), c = chi % 10;
    return luong + ' lượng' + (c ? ' ' + c + ' chỉ' : '');
  }

  /* ===================================================================== *
   * 4. LẬP LÁ SỐ
   * ===================================================================== */
  /**
   * @param {Object} p
   *  ten, ngay, thang, nam, amLich(bool), thangNhuan(bool), gio(0-23), phut,
   *  tz (múi giờ, mặc định 7), gioiTinh (1 nam | -1 nữ), namXem, thangXem (âm lịch, 1-12),
   *  tySangNgayMoi (bool, mặc định true): sinh 23h-24h tính sang ngày hôm sau
   *  tuHoaCanh: 'amDong' (mặc định) | 'dongAm'
   */
  function lapLaSo(p) {
    var tz = p.tz === undefined || p.tz === null || p.tz === '' ? 7 : Number(p.tz);
    var gioiTinh = Number(p.gioiTinh) === -1 ? -1 : 1;
    var gioDongHo = Number(p.gio) || 0, phut = Number(p.phut) || 0;
    var ngay = Number(p.ngay), thang = Number(p.thang), nam = Number(p.nam);
    var tySangNgayMoi = p.tySangNgayMoi !== false;

    // --- Quy đổi ra Dương lịch ---
    var dd, mm, yy;
    if (p.amLich) {
      if (ngay < 1 || ngay > 30 || thang < 1 || thang > 12) throw new Error('Ngày/tháng âm lịch không hợp lệ.');
      var s = lunarToSolar(ngay, thang, nam, p.thangNhuan ? 1 : 0, tz);
      if (!s[0]) throw new Error('Năm ' + nam + ' không có tháng ' + thang + ' nhuận.');
      var check = solarToLunar(s[0], s[1], s[2], tz);
      if (check[0] !== ngay || check[1] !== thang) throw new Error('Tháng ' + thang + ' âm lịch năm ' + nam + ' không có ngày ' + ngay + '.');
      dd = s[0]; mm = s[1]; yy = s[2];
    } else {
      var t = new Date(Date.UTC(nam, thang - 1, ngay));
      if (t.getUTCFullYear() !== nam || t.getUTCMonth() !== thang - 1 || t.getUTCDate() !== ngay) throw new Error('Ngày dương lịch không hợp lệ.');
      dd = ngay; mm = thang; yy = nam;
    }
    var duongGoc = [dd, mm, yy];

    // Giờ Tý muộn (23h-24h): tính sang ngày hôm sau
    var jdTinh = jdFromDate(dd, mm, yy);
    if (gioDongHo === 23 && tySangNgayMoi) jdTinh += 1;
    var dTinh = jdToDate(jdTinh);
    var am = solarToLunar(dTinh[0], dTinh[1], dTinh[2], tz);
    var ngayAm = am[0], thangAm = am[1], namAm = am[2], nhuan = am[3];

    // --- Can Chi ---
    var canNam = (namAm + 6) % 10 + 1;
    var chiNam = (namAm + 8) % 12 + 1;
    var canThang = (namAm * 12 + thangAm + 3) % 10 + 1;
    var canNgay = (jdTinh + 9) % 10 + 1;
    var chiNgay = (jdTinh + 1) % 12 + 1;
    var gio = chiGio(gioDongHo);
    var canG = canGio(canNgay, gio);
    var amDuongNam = CAN_AM_DUONG[canNam];
    var adnn = gioiTinh * amDuongNam; // +1: Dương Nam/Âm Nữ (thuận), -1: Âm Nam/Dương Nữ (nghịch)

    // Tháng nhuận: mặc định an theo chính tháng đó; tùy chọn nhuanTach15: sau ngày 15 tính sang tháng sau
    var tt = thangAm, nn = ngayAm;
    if (nhuan && p.nhuanTach15 && ngayAm > 15) tt = tt % 12 + 1;

    // --- Cung Mệnh, Thân, 12 cung chủ ---
    var cungMenh = dich(3, tt - 1, -(gio - 1));
    var cungThan = dich(3, tt - 1, gio - 1);

    var cung = [];
    for (var i = 0; i <= 12; i++) {
      cung.push(i === 0 ? null : {
        so: i, chi: CHI[i], can: canCung(i, canNam), hanh: HANH_CUNG[i], amDuong: i % 2 === 1 ? 1 : -1,
        ten: '', tenNgan: '', than: false, daiHan: 0, tieuHanChi: '', sao: [], tuan: false, triet: false,
        dv: '', ln: '', thangLuu: 0, trangSinh: ''
      });
    }
    for (var k = 0; k < 12; k++) {
      var c = dich(cungMenh, k);
      cung[c].ten = TEN_CUNG[k];
      cung[c].tenNgan = TEN_CUNG_NGAN[k];
    }
    cung[cungThan].than = true;

    var hanhCuc = timCuc(cungMenh, canNam);
    var cuc = HANH[hanhCuc].cuc;

    // Đại hạn: Dương Nam/Âm Nữ thuận, Âm Nam/Dương Nữ nghịch
    for (var j = 1; j <= 12; j++) {
      var kc = adnn === 1 ? (j - cungMenh + 12) % 12 : (cungMenh - j + 12) % 12;
      cung[j].daiHan = cuc + kc * 10;
    }

    // Tiểu hạn: khởi theo tam hợp chi năm sinh, nam thuận nữ nghịch
    var khoiTieuHan = dich(11, -3 * (chiNam - 1));
    for (var y = 1; y <= 12; y++) {
      // cung của năm có chi y
      var cTH = dich(khoiTieuHan, gioiTinh * (y - chiNam));
      cung[cTH].tieuHanChi = CHI[y];
    }

    var viTri = {};
    function an(key, vt, extra) {
      var d = SAO[key];
      var star = { key: key, ten: d[0], hanh: d[1], loai: d[2], chinh: CHINH_TINH.indexOf(key) >= 0, dacTinh: null, luu: false, dv: false };
      if (DAC_TINH[key] && DAC_TINH[key][vt]) star.dacTinh = DAC_TINH[key][vt];
      if (extra) for (var e in extra) star[e] = extra[e];
      cung[vt].sao.push(star);
      if (!star.luu && !star.dv) viTri[key] = vt;
      return vt;
    }

    // --- Tử Vi tinh hệ ---
    var tuVi = an('tuVi', timTuVi(cuc, nn));
    an('liemTrinh', dich(tuVi, 4));
    an('thienDong', dich(tuVi, 7));
    an('vuKhuc', dich(tuVi, 8));
    an('thaiDuong', dich(tuVi, 9));
    an('thienCo', dich(tuVi, 11));
    // --- Thiên Phủ tinh hệ ---
    var thienPhu = an('thienPhu', dich(3, 3 - tuVi));
    an('thaiAm', dich(thienPhu, 1));
    an('thamLang', dich(thienPhu, 2));
    an('cuMon', dich(thienPhu, 3));
    an('thienTuong', dich(thienPhu, 4));
    an('thienLuong', dich(thienPhu, 5));
    an('thatSat', dich(thienPhu, 6));
    an('phaQuan', dich(thienPhu, 10));

    // --- Vòng Lộc Tồn ---
    var locTon = LOC_TON[canNam];
    an('locTon', locTon);
    var vongBacSy = ['bacSy', 'lucSi', 'thanhLong', 'tieuHao', 'tuongQuan', 'tauThu', 'phiLiem', 'hyThan', 'benhPhu', 'daiHao', 'phucBinh', 'quanPhu2'];
    vongBacSy.forEach(function (key, idx) { an(key, dich(locTon, idx * adnn)); });

    // --- Vòng Thái Tuế ---
    var vongThaiTue = ['thaiTue', 'thieuDuong', 'tangMon', 'thieuAm', 'quanPhu3', 'tuPhu', 'tuePha', 'longDuc', 'bachHo', 'phucDuc', 'dieuKhach', 'trucPhu'];
    vongThaiTue.forEach(function (key, idx) { an(key, dich(chiNam, idx)); });
    an('thienKhong', dich(chiNam, 1));
    an('nguyetDuc', dich(chiNam, 5));
    an('thienDuc', dich(chiNam, 9));

    // --- Vòng Tràng Sinh ---
    var trangSinh = timTrangSinh(cuc);
    VONG_TRANG_SINH.forEach(function (key, idx) {
      var vt = dich(trangSinh, idx * adnn);
      cung[vt].trangSinh = SAO[key][0];
      viTri[key] = vt;
    });

    // --- Lục sát tinh ---
    an('kinhDuong', dich(locTon, 1));
    an('daLa', dich(locTon, -1));
    var diaKiep = an('diaKiep', dich(11, gio));
    an('diaKhong', dich(12, 12 - diaKiep));
    var hl = timHoaLinh(chiNam, gio, gioiTinh, amDuongNam);
    an('hoaTinh', hl[0]);
    an('linhTinh', hl[1]);

    // --- Phụ tinh ---
    var longTri = an('longTri', dich(5, chiNam - 1));
    an('phuongCac', dich(2, 2 - longTri));
    an('giaiThan', dich(2, 2 - longTri));
    var taPhu = an('taPhu', dich(5, tt - 1));
    var huuBat = an('huuBat', dich(2, 2 - taPhu));
    var vanKhuc = an('vanKhuc', dich(5, gio - 1));
    var vanXuong = an('vanXuong', dich(2, 2 - vanKhuc));
    an('tamThai', dich(taPhu, nn - 1));     // Từ Tả Phù đếm thuận tới ngày sinh
    an('batToa', dich(huuBat, -(nn - 1)));  // Từ Hữu Bật đếm nghịch tới ngày sinh
    an('anQuang', dich(vanXuong, nn - 2));
    an('thienQuy', dich(vanKhuc, -(nn - 2)));
    var khoi = an('thienKhoi', timKhoi(canNam, p));
    an('thienViet', dich(5, 5 - khoi));
    an('thienHu', dich(7, chiNam - 1));
    an('thienKhoc', dich(7, -chiNam + 1));
    an('thienTai', dich(cungMenh, chiNam - 1));
    an('thienTho', dich(cungThan, chiNam - 1));
    var hongLoan = an('hongLoan', dich(4, -chiNam + 1));
    an('thienHy', dich(hongLoan, 6));
    an('thienQuan', THIEN_QUAN[canNam]);
    an('thienPhuc', THIEN_PHUC[canNam]);
    var thienHinh = an('thienHinh', dich(10, tt - 1));
    an('thienRieu', dich(thienHinh, 4));
    an('thienY', dich(thienHinh, 4));
    var coThan = an('coThan', timCoThan(chiNam));
    an('quaTu', dich(coThan, -4));
    var kinhDuong = viTri.kinhDuong;
    var vanTinh = an('vanTinh', dich(kinhDuong, 2));
    var duongPhu = an('duongPhu', dich(vanTinh, 2));
    an('quocAn', dich(duongPhu, 3));
    an('thaiPhu', dich(vanKhuc, 2));
    an('phongCao', dich(vanKhuc, -2));
    // Thiên Giải: tháng Giêng ở Thân, đếm thuận tới tháng sinh.
    // Mặc định đếm liền từng cung (khớp tuvi.vn 16/16 lá số); 'nhayCung' = đếm nhảy cung.
    an('thienGiai', p.thienGiai === 'nhayCung' ? dich(9, 2 * tt - 2) : dich(9, tt - 1));
    an('diaGiai', dich(taPhu, 3));
    an('thienLa', 5);
    an('diaVong', 11);
    an('thienThuong', dich(cungMenh, 5)); // cung Nô Bộc
    an('thienSu', dich(cungMenh, 7));     // cung Tật Ách
    var thienMa = an('thienMa', timThienMa(chiNam));
    an('hoaCai', dich(thienMa, 2));
    var kiepSat = an('kiepSat', dich(thienMa, 3));
    an('daoHoa', dich(kiepSat, 4));
    an('phaToai', timPhaToai(chiNam));
    an('dauQuan', dich(chiNam, -(tt - 1), gio - 1));
    an('luuHa', LUU_HA[canNam]);
    an('thienTru', THIEN_TRU[canNam]);

    // --- Tứ Hóa (gốc) ---
    var hoaKeys = ['hoaLoc', 'hoaQuyen', 'hoaKhoa', 'hoaKy'];
    var tuHoa = tuHoaTheoCan(canNam, p);
    tuHoa.forEach(function (saoGoc, idx) {
      var vt = viTri[saoGoc];
      an(hoaKeys[idx], vt, { hoaCua: SAO[saoGoc][0] });
      cung[vt].sao.forEach(function (s) { if (s.key === saoGoc && !s.luu && !s.dv) s.hoa = hoaKeys[idx]; });
    });

    // --- Tuần, Triệt ---
    var tuan = timTuan(canNam, chiNam);
    var triet = timTriet(canNam);
    tuan.forEach(function (x) { cung[x].tuan = true; });
    triet.forEach(function (x) { cung[x].triet = true; });

    // ================== VẬN HẠN THEO NĂM XEM ==================
    var namXem = Number(p.namXem) || new Date().getFullYear();
    var thangXem = Number(p.thangXem) || 0;
    var canXem = (namXem + 6) % 10 + 1;
    var chiXem = (namXem + 8) % 12 + 1;
    var tuoi = namXem - namAm + 1;

    // Đại vận hiện hành
    var cungDaiVan = 0;
    for (var d = 1; d <= 12; d++) {
      if (tuoi >= cung[d].daiHan && tuoi < cung[d].daiHan + 10) { cungDaiVan = d; break; }
    }
    if (cungDaiVan) {
      for (var a = 0; a < 12; a++) cung[dich(cungDaiVan, a)].dv = TEN_CUNG_NGAN[a];
    }

    // Lưu niên (tiểu hạn năm xem)
    var cungLuuNien = dich(khoiTieuHan, gioiTinh * (chiXem - chiNam));
    for (var b = 0; b < 12; b++) cung[dich(cungLuuNien, b)].ln = TEN_CUNG_NGAN[b];

    // Nguyệt hạn: từ cung tiểu hạn đếm nghịch tới tháng sinh, rồi thuận tới giờ sinh = tháng Giêng
    var thangGieng = dich(cungLuuNien, -(tt - 1), gio - 1);
    for (var m = 0; m < 12; m++) cung[dich(thangGieng, m)].thangLuu = m + 1;

    // Lưu tinh
    function anLuu(key, vt, extra) {
      var x = { luu: true };
      if (extra) for (var e in extra) x[e] = extra[e];
      an(key, vt, x);
    }
    anLuu('thaiTue', chiXem);
    anLuu('tangMon', dich(chiXem, 2));
    anLuu('bachHo', dich(chiXem, 8));
    anLuu('thienKhoc', dich(7, -chiXem + 1));
    anLuu('thienHu', dich(7, chiXem - 1));
    var luuLoc = LOC_TON[canXem];
    anLuu('locTon', luuLoc);
    anLuu('kinhDuong', dich(luuLoc, 1));
    anLuu('daLa', dich(luuLoc, -1));
    var luuMa = timThienMa(chiXem);
    anLuu('thienMa', luuMa);
    anLuu('vanXuong', LUU_XUONG[canXem]);
    anLuu('vanKhuc', LUU_KHUC[canXem]);
    var luuKhoi = timKhoi(canXem, p);
    anLuu('thienKhoi', luuKhoi);
    anLuu('thienViet', dich(5, 5 - luuKhoi));
    anLuu('hongLoan', dich(4, -chiXem + 1));
    var luuKiepSat = dich(luuMa, 3);
    anLuu('kiepSat', luuKiepSat);
    anLuu('daoHoa', dich(luuKiepSat, 4));
    // Bộ Đức của lưu niên (theo vòng Thái Tuế của năm xem) — tuvi.vn hiển thị 4 sao này
    anLuu('longDuc', dich(chiXem, 7));
    anLuu('phucDuc', dich(chiXem, 9));
    anLuu('thienDuc', dich(chiXem, 9));
    anLuu('nguyetDuc', dich(chiXem, 5));
    tuHoaTheoCan(canXem, p).forEach(function (saoGoc, idx) {
      anLuu(hoaKeys[idx], viTri[saoGoc], { hoaCua: SAO[saoGoc][0] });
    });

    // Sao của ĐẠI VẬN: cùng cách an như lưu tinh nhưng theo Can/Chi của cung đại vận
    if (cungDaiVan) {
      var canDV = cung[cungDaiVan].can, chiDV = cungDaiVan;
      var anDV = function (key, vt, extra) {
        var x = { dv: true };
        if (extra) for (var e in extra) x[e] = extra[e];
        an(key, vt, x);
      };
      var dvLoc = LOC_TON[canDV];
      anDV('locTon', dvLoc);
      anDV('kinhDuong', dich(dvLoc, 1));
      anDV('daLa', dich(dvLoc, -1));
      var dvKhoi = timKhoi(canDV, p);
      anDV('thienKhoi', dvKhoi);
      anDV('thienViet', dich(5, 5 - dvKhoi));
      anDV('vanXuong', LUU_XUONG[canDV]);
      anDV('vanKhuc', LUU_KHUC[canDV]);
      anDV('thienMa', timThienMa(chiDV));
      tuHoaTheoCan(canDV, p).forEach(function (saoGoc, idx) {
        anDV(hoaKeys[idx], viTri[saoGoc], { hoaCua: SAO[saoGoc][0] });
      });
    }

    // ================== THÔNG TIN TỔNG QUÁT ==================
    var menhNapAm = napAm(canNam, chiNam);
    var lai = 0;
    for (var q = 1; q <= 12; q++) {
      // Lai nhân cung: cung có Can trùng Can năm sinh (bỏ Tý, Sửu)
      if (q > 2 && cung[q].can === canNam) { lai = q; break; }
    }
    var canLuong = CAN_LUONG_NAM[giapTyIndex(canNam, chiNam)] + CAN_LUONG_THANG[tt] + CAN_LUONG_NGAY[nn] + CAN_LUONG_GIO[gio];
    var amDuongMenhCung = cung[cungMenh].amDuong;

    var info = {
      ten: (p.ten || '').trim(),
      gioiTinh: gioiTinh,
      amDuongNamNu: (amDuongNam === 1 ? 'Dương' : 'Âm') + ' ' + (gioiTinh === 1 ? 'Nam' : 'Nữ'),
      thuanNghich: adnn === 1 ? 'thuận' : 'nghịch',
      amDuongLy: amDuongNam === amDuongMenhCung ? 'Âm dương thuận lý' : 'Âm dương nghịch lý',
      duong: { ngay: duongGoc[0], thang: duongGoc[1], nam: duongGoc[2] },
      am: { ngay: ngayAm, thang: thangAm, nam: namAm, nhuan: !!nhuan },
      gio: gioDongHo, phut: phut, tz: tz,
      tyMuon: gioDongHo === 23 && tySangNgayMoi,  // đã tính sang ngày hôm sau
      thangAnSao: tt,                              // tháng dùng để an sao (khác tháng âm khi nhuận tách 15)
      canChiNam: CAN[canNam] + ' ' + CHI[chiNam],
      canChiThang: CAN[canThang] + ' ' + CHI[(thangAm + 1) % 12 + 1],
      canChiNgay: CAN[canNgay] + ' ' + CHI[chiNgay],
      canChiGio: CAN[canG] + ' ' + CHI[gio],
      gioChi: CHI[gio],
      canNam: canNam, chiNam: chiNam,
      banMenh: menhNapAm.ten, hanhMenh: HANH[menhNapAm.hanh].ten,
      cuc: HANH[hanhCuc].tenCuc, hanhCuc: HANH[hanhCuc].ten,
      quanHeCucMenh: quanHeHanh(hanhCuc, menhNapAm.hanh),
      menhChu: MENH_CHU[chiNam], thanChu: THAN_CHU[chiNam],
      cungMenh: cungMenh, cungThan: cungThan,
      thanCu: cung[cungThan].ten,
      laiNhanCung: lai ? cung[lai].ten : '',
      canLuong: soLuongChu(canLuong), canLuongChi: canLuong,
      namXem: namXem, canChiNamXem: CAN[canXem] + ' ' + CHI[chiXem], tuoi: tuoi, thangXem: thangXem,
      cungDaiVan: cungDaiVan, cungLuuNien: cungLuuNien,
      tuan: tuan, triet: triet
    };

    return { info: info, cung: cung.slice(1), input: p };
  }

  /** Giờ hoàng đạo theo Chi ngày: trả về mảng chỉ số chi (1..12) */
  var HOANG_DAO = {
    1: [1, 2, 4, 7, 9, 10], 7: [1, 2, 4, 7, 9, 10],
    2: [3, 4, 6, 9, 11, 12], 8: [3, 4, 6, 9, 11, 12],
    3: [1, 2, 5, 6, 8, 11], 9: [1, 2, 5, 6, 8, 11],
    4: [1, 3, 4, 7, 8, 10], 10: [1, 3, 4, 7, 8, 10],
    5: [3, 5, 6, 9, 10, 12], 11: [3, 5, 6, 9, 10, 12],
    6: [2, 5, 7, 8, 11, 12], 12: [2, 5, 7, 8, 11, 12]
  };

  /** Thông tin lịch của một ngày dương: âm lịch, can chi, tiết khí, giờ hoàng đạo */
  function thongTinNgay(dd, mm, yy, timeZone) {
    if (timeZone === undefined) timeZone = 7;
    var am = solarToLunar(dd, mm, yy, timeZone);
    var jd = jdFromDate(dd, mm, yy);
    var canNgay = (jd + 9) % 10 + 1, chiNgay = (jd + 1) % 12 + 1;
    var canThang = (am[2] * 12 + am[1] + 3) % 10 + 1;
    return {
      am: { ngay: am[0], thang: am[1], nam: am[2], nhuan: !!am[3] },
      canChiNgay: CAN[canNgay] + ' ' + CHI[chiNgay],
      canChiThang: CAN[canThang] + ' ' + CHI[(am[1] + 1) % 12 + 1],
      canChiNam: CAN[(am[2] + 6) % 10 + 1] + ' ' + CHI[(am[2] + 8) % 12 + 1],
      tietKhi: tietKhi(dd, mm, yy, timeZone),
      gioHoangDao: HOANG_DAO[chiNgay].map(function (c) {
        var start = (c * 2 - 3 + 24) % 24;
        return { chi: CHI[c], tu: start, den: (start + 2) % 24 };
      })
    };
  }

  return {
    lapLaSo: lapLaSo,
    thongTinNgay: thongTinNgay,
    lunar: {
      jdFromDate: jdFromDate, jdToDate: jdToDate,
      solarToLunar: solarToLunar, lunarToSolar: lunarToSolar, leapMonthOfYear: leapMonthOfYear
    },
    CAN: CAN, CAN_VT: CAN_VT, CHI: CHI, SAO: SAO, TEN_CUNG: TEN_CUNG,
    _internal: { dich: dich, napAm: napAm, timCuc: timCuc, timTuVi: timTuVi, chiGio: chiGio, DAC_TINH: DAC_TINH }
  };
});
