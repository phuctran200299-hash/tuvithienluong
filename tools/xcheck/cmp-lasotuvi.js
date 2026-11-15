// Doi chieu engine Tuvithienluong voi lasotuvi (Python goc, phai VN)
const fs = require('fs');
const path = require('path');
const TVTL = require('../../assets/js/tuvi-core.js');

const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'cases.json'), 'utf8'));
const ref = JSON.parse(fs.readFileSync(path.join(__dirname, 'py.json'), 'utf8'));

const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const ALIAS = { 'lực sĩ': 'lực sỹ', 'bác sĩ': 'bác sỹ', 'thê thiếp': 'phu thê', 'tử tức': 'tử tức' };
const N = (s) => ALIAS[norm(s)] || norm(s);

const stats = {};
function rec(key, ok, ex) {
  const s = stats[key] || (stats[key] = { n: 0, bad: 0, ex: [] });
  s.n++;
  if (!ok) { s.bad++; if (s.ex.length < 3) s.ex.push(ex); }
}

let n = 0;
for (let i = 0; i < cases.length; i++) {
  const c = cases[i], r = ref[i];
  if (!r || r.err) continue;
  // gio: 1=Ty -> gio he 24h o giua canh gio (Ty dung 0h de khong doi ngay)
  const gioH = c.gio === 1 ? 0 : 2 * (c.gio - 1);
  let mine;
  try { mine = TVTL.lapLaSo({ ngay: c.d, thang: c.m, nam: c.y, gio: gioH, gioiTinh: c.g, namXem: 2026 }); }
  catch (e) { rec('engine throw', false, `${c.d}/${c.m}/${c.y} ${e.message}`); continue; }
  n++;
  const I = mine.info;
  const tag = `${c.d}/${c.m}/${c.y} ${c.gio === 1 ? 'Tý' : TVTL.CHI[c.gio]} ${c.g === 1 ? 'nam' : 'nữ'}`;

  rec('Âm lịch', I.am.ngay === r.am[0] && I.am.thang === r.am[1] && I.am.nam === r.am[2] && !!I.am.nhuan === !!r.am[3],
    `${tag}: py ${r.am.join('/')} mình ${I.am.ngay}/${I.am.thang}/${I.am.nam}/${I.am.nhuan ? 1 : 0}`);
  rec('Cục', I.cuc === r.cuc || N(I.cuc) === N(r.cuc), `${tag}: py ${r.cuc} mình ${I.cuc}`);

  const mineBySo = {}; mine.cung.forEach((x) => { mineBySo[x.so] = x; });
  const mineMenh = mine.cung.find((x) => x.ten === 'Mệnh').so;
  const mineThan = mine.cung.find((x) => x.than).so;
  rec('Cung Mệnh', mineMenh === r.cungMenh, `${tag}: py ${r.cungMenh} mình ${mineMenh}`);
  rec('Cung Thân', mineThan === r.cungThan, `${tag}: py ${r.cungThan} mình ${mineThan}`);

  // vi tri sao trong engine (bo lua tinh), ke ca vong Trang sinh
  const pos = {};
  const add = (ten, so) => { (pos[N(ten)] = pos[N(ten)] || []).push(so); };
  mine.cung.forEach((cg) => {
    cg.sao.forEach((s) => { if (!s.luu && !s.dv) add(s.ten, cg.so); });
    if (cg.trangSinh) add(cg.trangSinh, cg.so);
  });
  const dac = {};
  mine.cung.forEach((cg) => cg.sao.forEach((s) => { if (!s.luu && !s.dv) dac[N(s.ten)] = s.dacTinh; }));

  r.cung.forEach((rc) => {
    const mc = mineBySo[rc.so];
    rec('Tên cung', N(mc.ten) === N(rc.cungChu || mc.ten), `${tag}: cung ${rc.so} py ${rc.cungChu} mình ${mc.ten}`);
    rec('Đại hạn', mc.daiHan === rc.daiHan, `${tag}: cung ${rc.so} py ${rc.daiHan} mình ${mc.daiHan}`);
    rec('Tiểu hạn', N(mc.tieuHanChi) === N(rc.tieuHan), `${tag}: cung ${rc.so} py ${rc.tieuHan} mình ${mc.tieuHanChi}`);
    rec('Tuần', mc.tuan === rc.tuan, `${tag}: cung ${rc.so} py ${rc.tuan} mình ${mc.tuan}`);
    rec('Triệt', mc.triet === rc.triet, `${tag}: cung ${rc.so} py ${rc.triet} mình ${mc.triet}`);
    rc.sao.forEach((s) => {
      const ten = N(s[1]);
      const p = pos[ten];
      if (!p) { rec('THIẾU SAO: ' + s[1], false, tag); return; }
      rec(s[1], p.includes(rc.so), `${tag}: py cung ${rc.so}, mình cung ${p.join('/')}`);
      if (s[2]) rec('đắc tính ' + s[1], N(dac[ten]) === N(s[2]), `${tag}: py ${s[2]} mình ${dac[ten]}`);
    });
  });
}

console.log('Số lá số đối chiếu:', n, '/', cases.length);
const rows = Object.entries(stats).sort((a, b) => b[1].bad - a[1].bad || a[0].localeCompare(b[0]));
const bad = rows.filter((x) => x[1].bad);
for (const [k, s] of bad) console.log(`✗ ${k}: lệch ${s.bad}/${s.n}\n    ${s.ex.join('\n    ')}`);
console.log('\nKHỚP 100% (' + (rows.length - bad.length) + ' hạng mục):');
console.log(rows.filter((x) => !x[1].bad).map((x) => x[0]).join(', '));
