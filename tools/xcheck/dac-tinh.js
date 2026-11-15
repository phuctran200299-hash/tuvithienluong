/* Dựng bảng MIẾU / VƯỢNG / ĐẮC / BÌNH / HÃM cho phụ tinh.
 *
 *   A. Đọc HTML tuvi.vn đã lưu trong html/  -> bảng quan sát được (phái VN)
 *   B. Chạy iztro (phái TQ, ~4k sao GitHub) -> bảng 庙旺得利平不陷 quy về M/V/Đ/B/H
 *   C. In ra cạnh bảng DAC_TINH hiện tại của engine để đối chiếu
 *
 * Chạy: node tools/xcheck/dac-tinh.js            (chỉ các sao đang thiếu)
 *       node tools/xcheck/dac-tinh.js all        (tất cả các sao có dữ liệu)
 */
const fs = require('fs');
const path = require('path');
const TVTL = require('../../assets/js/tuvi-core.js');
const { CASES, parse, NAM_XEM, THANG_XEM } = require('./lib-tuvivn.js');

const CHI = TVTL.CHI.slice(1);                       // Tý ... Hợi
const DIR = path.join(__dirname, 'html');
const ALL = process.argv.includes('all');

/* ---------- Tên sao: engine key <-> tuvi.vn <-> iztro (tiếng Trung) ---------- */
const SAO = [
  // [key engine, tên tuvi.vn, tên iztro]
  ['locTon', 'Lộc Tồn', '禄存'],
  ['thienMa', 'Thiên Mã', '天马'],
  ['vanXuong', 'Văn Xương', '文昌'],
  ['vanKhuc', 'Văn Khúc', '文曲'],
  ['thienKhoc', 'Thiên Khốc', '天哭'],
  ['thienHu', 'Thiên Hư', '天虚'],
  ['thienHinh', 'Thiên Hình', '天刑'],
  ['thienRieu', 'Thiên Diêu', '天姚'],
  ['kinhDuong', 'Kình Dương', '擎羊'],
  ['daLa', 'Đà La', '陀罗'],
  ['hoaTinh', 'Hỏa Tinh', '火星'],
  ['linhTinh', 'Linh Tinh', '铃星'],
  ['diaKhong', 'Địa Không', '地空'],
  ['diaKiep', 'Địa Kiếp', '地劫'],
  ['taPhu', 'Tả Phù', '左辅'],
  ['huuBat', 'Hữu Bật', '右弼'],
  ['thienKhoi', 'Thiên Khôi', '天魁'],
  ['thienViet', 'Thiên Việt', '天钺'],
];

/* ---------- A. Quan sát từ tuvi.vn ---------- */
const web = {};        // tên tuvi.vn -> { chi: {letter: count} }
let nChart = 0;
for (const name of fs.existsSync(DIR) ? fs.readdirSync(DIR) : []) {
  if (!name.endsWith('.html')) continue;
  const f = path.join(DIR, name);
  const ref = parse(fs.readFileSync(f, 'utf8'));
  if (Object.keys(ref.cung).length !== 12) continue;
  nChart++;
  for (const so of Object.keys(ref.cung)) {
    const r = ref.cung[so];
    for (const s of r.sao) {
      if (s.luu || s.dv) continue;
      const m = (web[s.ten] = web[s.ten] || {});
      const cell = (m[r.chi] = m[r.chi] || {});
      // "" = có gặp sao ở cung này nhưng tuvi.vn KHÔNG ghi đắc tính
      cell[s.dacTinh || ''] = (cell[s.dacTinh || ''] || 0) + 1;
    }
    for (const [ten, dt] of r.chinh) {
      if (!dt) continue;
      const m = (web[ten] = web[ten] || {});
      const cell = (m[r.chi] = m[r.chi] || {});
      cell[dt] = (cell[dt] || 0) + 1;
    }
  }
}

/* ---------- B. iztro ---------- */
const ZH2VN = { '庙': 'M', '旺': 'V', '得': 'Đ', '利': 'Đ', '平': 'B', '不': 'B', '陷': 'H' };
const iz = {};         // tên iztro -> { chi: Set(letter) }
let izOk = true;
try {
  const { astro } = require('iztro');
  const B2CHI = { '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão', '辰': 'Thìn', '巳': 'Tỵ',
    '午': 'Ngọ', '未': 'Mùi', '申': 'Thân', '酉': 'Dậu', '戌': 'Tuất', '亥': 'Hợi' };
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  for (let i = 0; i < 400; i++) {
    const y = rnd(1940, 2020), mo = rnd(1, 12), d = rnd(1, 28), h = rnd(0, 12);
    const a = astro.bySolar(`${y}-${mo}-${d}`, h, i % 2 ? 'male' : 'female', true, 'zh-CN');
    for (const p of a.palaces) {
      const chi = B2CHI[p.earthlyBranch];
      const list = [].concat(p.majorStars || [], p.minorStars || [], p.adjectiveStars || []);
      for (const s of list) {
        if (!s.brightness) continue;
        const L = ZH2VN[s.brightness];
        if (!L) continue;
        const m = (iz[s.name] = iz[s.name] || {});
        (m[chi] = m[chi] || new Set()).add(L);
      }
    }
  }
} catch (e) {
  izOk = false;
  console.log('(bỏ qua iztro:', e.message, '— chạy `npm i iztro` trong tools/xcheck)\n');
}

/* ---------- C. Bảng hiện tại của engine ---------- */
const cur = TVTL._internal && TVTL._internal.DAC_TINH ? TVTL._internal.DAC_TINH : null;

/* ---------- In ---------- */
const pad = (s, n) => String(s == null ? '' : s).padEnd(n);
console.log(`Lá số tuvi.vn đọc được: ${nChart}${izOk ? ' | iztro: 400 lá số' : ''}\n`);
console.log(pad('SAO', 14) + pad('NGUỒN', 8) + CHI.map((c) => pad(c, 6)).join(''));
console.log('-'.repeat(14 + 8 + 6 * 12));

const conflicts = [];
for (const [key, tenWeb, tenIz] of SAO) {
  const w = web[tenWeb] || {};
  const z = iz[tenIz] || {};
  const c = cur && cur[key];
  const haveWeb = Object.keys(w).length, haveIz = Object.keys(z).length;
  if (!ALL && !haveWeb && !haveIz) continue;

  // '·' = chưa gặp lá số nào; '—' = có gặp nhưng tuvi.vn không ghi đắc tính
  const rowWeb = CHI.map((chi) => {
    const cell = w[chi];
    if (!cell) return pad('·', 6);
    const ks = Object.keys(cell);
    if (ks.length > 1) conflicts.push(`${tenWeb} @${chi}: tuvi.vn vừa "${ks.join('" vừa "')}"`);
    return pad(ks.map((k) => k || '—').join('/'), 6);
  }).join('');
  const rowIz = CHI.map((chi) => {
    const set = z[chi];
    return pad(set ? [...set].join('/') : '·', 6);
  }).join('');
  const rowCur = CHI.map((chi, i) => pad((c && c[i + 1]) || '·', 6)).join('');

  console.log(pad(tenWeb, 14) + pad('tuvi.vn', 8) + rowWeb);
  if (izOk) console.log(pad('', 14) + pad('iztro', 8) + rowIz);
  console.log(pad('', 14) + pad('engine', 8) + rowCur);
  // so khớp tuvi.vn vs iztro
  const L = (chi) => (w[chi] ? Object.keys(w[chi]).filter(Boolean) : []);
  const diff = CHI.filter((chi) => L(chi).length && z[chi] && !L(chi).some((x) => z[chi].has(x)));
  const same = CHI.filter((chi) => L(chi).length && z[chi] && L(chi).some((x) => z[chi].has(x)));
  if (izOk && (same.length || diff.length)) {
    console.log(pad('', 22) + `VN≡TQ ${same.length}/${same.length + diff.length}` +
      (diff.length ? '  lệch: ' + diff.join(', ') : ''));
  }
  console.log(pad('', 22) + `tuvi.vn phủ ${haveWeb}/12 cung`);
  console.log('');
}

if (conflicts.length) {
  console.log('Mâu thuẫn trong chính dữ liệu tuvi.vn:');
  conflicts.forEach((x) => console.log('  ' + x));
}
