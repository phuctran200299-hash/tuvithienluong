/* Tìm thêm vài lá số cần tải từ tuvi.vn để phủ kín bảng miếu/vượng/đắc/bình/hãm
 * của các phụ tinh còn thiếu ô.
 *
 * Chạy: node tools/xcheck/gen-cover.js            -> in ra danh sách + ghi extra-cases.json
 */
const fs = require('fs');
const path = require('path');
const TVTL = require('../../assets/js/tuvi-core.js');
const { parse, NAM_XEM, THANG_XEM } = require('./lib-tuvivn.js');

const DIR = path.join(__dirname, 'html');
const CHI = TVTL.CHI.slice(1);

// Các sao cần bảng đầy đủ (key engine -> tên hiển thị trên tuvi.vn)
const CAN_BANG = {
  locTon: 'Lộc Tồn', thienMa: 'Thiên Mã', vanXuong: 'Văn Xương', vanKhuc: 'Văn Khúc',
  thienKhoc: 'Thiên Khốc', thienHu: 'Thiên Hư', thienHinh: 'Thiên Hình', thienRieu: 'Thiên Diêu',
};
const TEN2KEY = {};
Object.entries(CAN_BANG).forEach(([k, v]) => { TEN2KEY[v] = k; });

/* ---------- 1. Những ô đã quan sát được trong html/ ---------- */
const seen = new Set();
let nFile = 0;
for (const f of fs.existsSync(DIR) ? fs.readdirSync(DIR) : []) {
  if (!f.endsWith('.html')) continue;
  const ref = parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  if (Object.keys(ref.cung).length !== 12) continue;
  nFile++;
  for (const so of Object.keys(ref.cung)) {
    const r = ref.cung[so];
    for (const s of r.sao) {
      if (s.luu || s.dv || !s.dacTinh) continue;
      const k = TEN2KEY[s.ten];
      if (k) seen.add(k + '@' + r.chi);
    }
  }
}

/* ---------- 2. Những ô sao có thể tới được (quét bằng engine) ---------- */
const viTriCuaSao = (ls) => {
  const out = {};
  ls.cung.forEach((c) => c.sao.forEach((s) => {
    if (s.luu || s.dv) return;
    const k = Object.keys(CAN_BANG).find((key) => key === s.key);
    if (k) out[k] = c.chi;
  }));
  return out;
};

const charts = [];
const reach = new Set();
for (let y = 1962; y <= 2009; y += 1) {
  for (let m = 1; m <= 12; m++) {
    for (const d of [5, 15, 25]) {
      for (let h = 0; h <= 22; h += 2) {
        let ls;
        try { ls = TVTL.lapLaSo({ ngay: d, thang: m, nam: y, gio: h, phut: 0, gioiTinh: 1, namXem: NAM_XEM, thangXem: THANG_XEM }); }
        catch (e) { continue; }
        const vt = viTriCuaSao(ls);
        const cells = Object.entries(vt).map(([k, chi]) => k + '@' + chi);
        cells.forEach((c) => reach.add(c));
        charts.push({ d, m, y, h, mi: 0, g: 1, cells });
      }
    }
  }
}

const missing = new Set([...reach].filter((c) => !seen.has(c)));
console.log(`Đã có ${nFile} lá số trong html/ — phủ ${seen.size}/${reach.size} ô, còn thiếu ${missing.size}.`);
if (!missing.size) { console.log('Không cần tải thêm.'); process.exit(0); }

/* ---------- 3. Tham lam: chọn ít lá số nhất phủ hết ô còn thiếu ---------- */
const chosen = [];
const left = new Set(missing);
while (left.size) {
  let best = null, bestGain = 0;
  for (const c of charts) {
    const gain = c.cells.filter((x) => left.has(x)).length;
    if (gain > bestGain) { bestGain = gain; best = c; }
  }
  if (!best) break;
  best.cells.filter((x) => left.has(x)).forEach((x) => left.delete(x));
  chosen.push({ d: best.d, m: best.m, y: best.y, h: best.h, mi: 0, g: 1, note: 'phủ ' + bestGain + ' ô' });
  if (chosen.length > 40) break;
}

console.log(`Cần tải thêm ${chosen.length} lá số:`);
chosen.forEach((c) => console.log(`  ${c.d}/${c.m}/${c.y} ${c.h}h — ${c.note}`));
if (left.size) console.log('Không phủ được:', [...left].join(', '));
fs.writeFileSync(path.join(__dirname, 'extra-cases.json'), JSON.stringify(chosen, null, 2));
console.log('\nĐã ghi extra-cases.json — chạy: node tools/xcheck/fetch-extra.js');
