// Đối chiếu engine Tuvithienluong với iztro trên nhiều lá số (cùng ngày âm lịch, bỏ qua khác biệt lịch GMT+7/+8)
const { astro } = require('iztro');
const TVTL = require('../../assets/js/tuvi-core.js');

// tên sao iztro (vi-VN) -> tên trong engine
const MAP = {
  'Phụng Các': 'Phượng Các', 'Thiên Diêu': 'Thiên Riêu', 'Đài Phụ': 'Thai Phụ', 'Hàm Trì': 'Đào Hoa',
  'Trường Sinh': 'Tràng Sinh', 'Lực Sỹ': 'Lực Sỹ'
};
const SKIP = new Set(['Âm Sát', 'Thiên Vu', 'Thiên Nguyệt', 'Niên Giải', 'Tuần Trung', 'Tuần Không', 'Triệt Lộ', 'Triệt Không',
  'Không Vong', 'Nguyệt Đức', 'Thiên Đức', 'Long Đức']);

const stats = {}; // ten -> {n, bad, ex}
function rec(ten, ok, ex) {
  const s = stats[ten] || (stats[ten] = { n: 0, bad: 0, ex: [] });
  s.n++; if (!ok) { s.bad++; if (s.ex.length < 3) s.ex.push(ex); }
}

let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
let charts = 0;
for (let i = 0; i < 4000; i++) {
  const y = 1920 + Math.floor(rnd() * 120), m = 1 + Math.floor(rnd() * 12), d = 1 + Math.floor(rnd() * 29);
  const chi = 1 + Math.floor(rnd() * 12), g = rnd() < 0.5 ? 1 : -1;
  let mine;
  try { mine = TVTL.lapLaSo({ ngay: d, thang: m, nam: y, amLich: true, gio: (2 * (chi - 1)) % 24, gioiTinh: g, namXem: 2026 }); }
  catch (e) { continue; }
  let a;
  try { a = astro.byLunar(`${y}-${m}-${d}`, chi - 1, g === 1 ? 'male' : 'female', false, true, 'vi-VN'); }
  catch (e) { continue; }
  charts++;
  const tag = `${d}/${m}/${y} ÂL giờ ${TVTL.CHI[chi]} ${g === 1 ? 'nam' : 'nữ'} (${mine.info.canChiNam})`;

  // vị trí sao (không tính lưu tinh) trong engine
  const pos = {};
  mine.cung.forEach(c => c.sao.forEach(s => { if (!s.luu && !s.dv) (pos[s.ten] = pos[s.ten] || []).push(c.chi); }));
  mine.cung.forEach(c => { (pos[c.trangSinh] = pos[c.trangSinh] || []).push(c.chi); });

  a.palaces.forEach(p => {
    const list = [...p.majorStars, ...p.minorStars, ...p.adjectiveStars].map(s => s.name)
      .concat([p.changsheng12, p.boshi12]).filter(Boolean);
    list.forEach(n0 => {
      const n = MAP[n0] || n0;
      if (SKIP.has(n)) return;
      if (!pos[n] && !['Quan Phủ'].includes(n)) { rec(n + ' (không có trong engine)', false, tag); return; }
      rec(n, (pos[n] || []).includes(p.earthlyBranch), `${tag}: iztro ${p.earthlyBranch}, mình ${(pos[n] || []).join('/')}`);
    });
    // Vòng Thái Tuế (tên TQ -> VN)
    const SQ = { 'Tuế Kiện': 'Thái Tuế', 'Hối Khí': 'Thiếu Dương', 'Tang Môn': 'Tang Môn', 'Quán Tác': 'Thiếu Âm',
      'Quan Phù': 'Quan Phù', 'Tiểu Hao': 'Tử Phù', 'Tuế Phá': 'Tuế Phá', 'Long Đức': 'Long Đức', 'Bạch Hổ': 'Bạch Hổ',
      'Thiên Đức': 'Phúc Đức', 'Điếu Khách': 'Điếu Khách', 'Bệnh Phù': 'Trực Phù' };
    if (p.suiqian12 && SQ[p.suiqian12]) {
      const n = SQ[p.suiqian12];
      rec('Vòng Thái Tuế: ' + n, (pos[n] || []).includes(p.earthlyBranch), `${tag}: iztro ${p.earthlyBranch}, mình ${(pos[n] || []).join('/')}`);
    }
    // Tuần, Triệt
    const adjNames = p.adjectiveStars.map(s => s.name);
    const myC2 = mine.cung.find(c => c.chi === p.earthlyBranch);
    if (adjNames.includes('Tuần Trung')) rec('Tuần', myC2.tuan, `${tag}: iztro Tuần@${p.earthlyBranch}`);
    if (adjNames.includes('Triệt Lộ') || adjNames.includes('Không Vong')) rec('Triệt', myC2.triet, `${tag}: iztro Triệt@${p.earthlyBranch}`);
    // Tứ hóa gốc
    [...p.majorStars, ...p.minorStars].forEach(s => {
      if (!s.mutagen) return;
      const ten = 'Hóa ' + s.mutagen;
      rec(ten + ' (theo can)', (pos[ten] || []).includes(p.earthlyBranch),
        `${tag}: iztro ${s.name}@${p.earthlyBranch}, mình ${(pos[ten] || []).join('/')}`);
    });
    // Đại hạn
    const myC = mine.cung.find(c => c.chi === p.earthlyBranch);
    rec('Đại hạn', myC.daiHan === p.decadal.range[0], `${tag}: ${p.earthlyBranch} iztro ${p.decadal.range[0]} mình ${myC.daiHan}`);
    rec('Tên cung', (p.name === myC.ten) || (p.name.replace('Huynh Đệ', 'Huynh Đệ') === myC.ten),
      `${tag}: ${p.earthlyBranch} iztro ${p.name} mình ${myC.ten}`);
    if (p.isBodyPalace) rec('Cung Thân', myC.than, tag);
  });
  rec('Cục', a.fiveElementsClass.toLowerCase() === mine.info.cuc.toLowerCase(), `${tag}: iztro ${a.fiveElementsClass} mình ${mine.info.cuc}`);
}

console.log('Số lá số đối chiếu:', charts);
const rows = Object.entries(stats).sort((x, y) => y[1].bad - x[1].bad);
for (const [ten, s] of rows) {
  if (s.bad) console.log(`✗ ${ten}: lệch ${s.bad}/${s.n}\n    ${s.ex.join('\n    ')}`);
}
console.log('Khớp hoàn toàn:', rows.filter(r => !r[1].bad).map(r => r[0]).join(', '));
