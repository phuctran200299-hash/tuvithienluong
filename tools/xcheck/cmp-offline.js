// So lai voi HTML tuvi.vn da luu (khong goi mang), cho phep doi tuy chon engine.
// Chay: node cmp-offline.js thienGiai=lienTiep tuHoaNham=taPhu
const fs = require('fs');
const path = require('path');
const TVTL = require('../../assets/js/tuvi-core.js');
const { CASES, parse, NAM_XEM, THANG_XEM } = require('./lib-tuvivn.js');

const OPT = {};
process.argv.slice(2).forEach((a) => { const [k, v] = a.split('='); OPT[k] = v === 'true' ? true : v === 'false' ? false : v; });

const NORM = (s) => String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim();
const ALIAS = { 'lực sĩ': 'lực sỹ', 'bác sĩ': 'bác sỹ', 'thiên diêu': 'thiên riêu', 'thiên hỉ': 'thiên hỷ', 'đầu quân': 'đẩu quân' };
const N = (s) => ALIAS[NORM(s)] || NORM(s);

const stats = {};
const rec = (k, ok, ex) => {
  const s = stats[k] || (stats[k] = { n: 0, bad: 0, ex: [] });
  s.n++; if (!ok) { s.bad++; if (s.ex.length < 4) s.ex.push(ex); }
};

const DV = {};   // sao dai van: ten -> [{tag, chi}]
let nChart = 0;
for (const c of CASES) {
  const f = path.join(__dirname, 'html', `${c.y}-${c.m}-${c.d}-${c.h}-${c.g}.html`);
  if (!fs.existsSync(f)) continue;
  const ref = parse(fs.readFileSync(f, 'utf8'));
  if (Object.keys(ref.cung).length !== 12) { console.log('parse lỗi', f); continue; }
  nChart++;
  const tag = `${c.d}/${c.m}/${c.y} ${c.h}h${c.mi} ${c.g === 1 ? 'nam' : 'nữ'}`;
  const mine = TVTL.lapLaSo(Object.assign({
    ngay: c.d, thang: c.m, nam: c.y, gio: c.h, phut: c.mi, gioiTinh: c.g,
    namXem: NAM_XEM, thangXem: THANG_XEM,
  }, OPT));
  const bySo = {}; mine.cung.forEach((x) => { bySo[x.so] = x; });

  for (const so of Object.keys(ref.cung)) {
    const r = ref.cung[so], mc = bySo[so];
    const DVMAP = { 'lộc tồn': 'Lộc Tồn', 'k dương': 'Kình Dương', 'đà la': 'Đà La', 't khôi': 'Thiên Khôi', 't việt': 'Thiên Việt', 'xương': 'Văn Xương', 'khúc': 'Văn Khúc', 't mã': 'Thiên Mã', 'h lộc': 'Hóa Lộc', 'h quyền': 'Hóa Quyền', 'h khoa': 'Hóa Khoa', 'h kỵ': 'Hóa Kỵ' };
    const mdv = new Set(mc.sao.filter((s) => s.dv).map((s) => N(s.ten)));
    r.sao.filter((s) => s.dv).forEach((s) => {
      const ten = DVMAP[NORM(s.ten)] || s.ten;
      (DV[s.ten] = DV[s.ten] || []).push(`${tag}: ${r.chi}`);
      rec('ĐV: ' + ten, mdv.has(N(ten)),
        `${tag}: web ĐV.${s.ten}@${r.chi}, mình@${(mine.cung.find((x) => x.sao.some((z) => N(z.ten) === N(ten) && z.dv)) || {}).chi || '-'}`);
    });
    mc.sao.filter((s) => s.dv).forEach((s) => {
      const webSet = new Set(r.sao.filter((z) => z.dv).map((z) => N(DVMAP[NORM(z.ten)] || z.ten)));
      rec('ĐV mình thừa: ' + s.ten, webSet.has(N(s.ten)), `${tag}: mình ĐV.${s.ten}@${r.chi}`);
    });
    const webPhu = r.sao.filter((s) => !s.luu && !s.dv);
    const minePhu = mc.sao.filter((s) => !s.chinh && !s.luu && !s.dv);
    const mset = new Set(minePhu.map((s) => N(s.ten)));
    const wset = new Set(webPhu.map((s) => N(s.ten)));
    webPhu.forEach((s) => {
      rec('Phụ tinh: ' + s.ten, mset.has(N(s.ten)),
        `${tag}: web ${s.ten}@${r.chi}, mình@${(mine.cung.find((x) => x.sao.some((z) => N(z.ten) === N(s.ten) && !z.luu)) || {}).chi || '-'}`);
      if (s.dacTinh) {
        const ms = minePhu.find((z) => N(z.ten) === N(s.ten));
        rec('Đắc tính phụ tinh: ' + s.ten, ms && N(ms.dacTinh) === N(s.dacTinh), `${tag} ${r.chi} ${s.ten}: web ${s.dacTinh} mình ${ms ? ms.dacTinh : '-'}`);
      }
    });
    minePhu.forEach((s) => rec('Mình thừa: ' + s.ten, wset.has(N(s.ten)), `${tag}: mình ${s.ten}@${r.chi}`));
    const webLuu = r.sao.filter((s) => s.luu);
    const mluu = new Set(mc.sao.filter((s) => s.luu).map((s) => N(s.ten)));
    webLuu.forEach((s) => rec('Lưu tinh: L.' + s.ten, mluu.has(N(s.ten)),
      `${tag}: web L.${s.ten}@${r.chi}, mình@${(mine.cung.find((x) => x.sao.some((z) => N(z.ten) === N(s.ten) && z.luu)) || {}).chi || '-'}`));
  }
}

console.log('Lá số đối chiếu:', nChart, '| tùy chọn:', JSON.stringify(OPT));
const rows = Object.entries(stats).sort((a, b) => b[1].bad - a[1].bad || a[0].localeCompare(b[0]));
const bad = rows.filter((x) => x[1].bad);
for (const [k, s] of bad) console.log(`✗ ${k}: ${s.bad}/${s.n}\n    ${s.ex.slice(0, 3).join('\n    ')}`);
console.log(`\nKhớp: ${rows.length - bad.length}/${rows.length} hạng mục`);
console.log('\nCác sao đại vận tuvi.vn hiển thị (để đối chiếu danh sách):');
Object.entries(DV).forEach(([k, v]) => console.log(`  ĐV.${k}  (${v.length} lần) vd ${v[0]}`));
