// Dung chung: danh sach la so + parser HTML tuvi.vn
const TVTL = require('../../assets/js/tuvi-core.js');
const chiSo = (ten) => TVTL.CHI.indexOf(ten);

const CASES = [
  { d: 20, m: 2, y: 1999, h: 5, mi: 30, g: 1, note: 'Kỷ Mão - mẫu trong test' },
  { d: 17, m: 5, y: 1990, h: 4, mi: 0, g: 1, note: 'Canh Ngọ - Khôi/Việt + Tứ Hóa Canh' },
  { d: 28, m: 8, y: 1992, h: 4, mi: 0, g: 1, note: 'Nhâm Thân - Hóa Khoa năm Nhâm' },
  { d: 27, m: 11, y: 1983, h: 0, mi: 10, g: -1, note: 'Quý Hợi - Thiên Trù năm Quý' },
  { d: 15, m: 6, y: 1987, h: 10, mi: 0, g: -1, note: 'Đinh Mão - Khôi/Việt + Lưu Hà Đinh' },
  { d: 3, m: 10, y: 1988, h: 14, mi: 20, g: 1, note: 'Mậu Thìn - Khôi/Việt Mậu' },
  { d: 22, m: 10, y: 1993, h: 2, mi: 0, g: 1, note: 'Quý Dậu - Hỏa/Linh Tỵ Dậu Sửu' },
  { d: 9, m: 1, y: 1994, h: 18, mi: 0, g: -1, note: 'Quý Dậu cuối năm - nữ' },
  { d: 16, m: 4, y: 1991, h: 22, mi: 0, g: -1, note: 'Tân Mùi - nữ giờ Hợi' },
  { d: 7, m: 7, y: 2000, h: 23, mi: 30, g: 1, note: 'Canh Thìn - giờ Tý muộn' },
  { d: 12, m: 7, y: 2023, h: 9, mi: 0, g: -1, note: '2023 nhuận tháng 2' },
  { d: 1, m: 1, y: 1975, h: 12, mi: 0, g: 1, note: 'Giáp Dần cận Tết' },
  { d: 25, m: 9, y: 1966, h: 16, mi: 0, g: -1, note: 'Bính Ngọ - nữ' },
  { d: 11, m: 3, y: 2005, h: 7, mi: 45, g: 1, note: 'Ất Dậu' },
  { d: 30, m: 11, y: 2011, h: 20, mi: 0, g: -1, note: 'Tân Mão - nữ' },
  { d: 6, m: 6, y: 2018, h: 3, mi: 0, g: 1, note: 'Mậu Tuất - giờ Dần' },
];

const DEC = (s) => String(s || '')
  .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
  .replace(/^[+\-\s]+/, '').trim();

function parse(html) {
  const tds = html.split(/<td class="cung"/).slice(1);
  const cung = {};
  for (const raw of tds) {
    const seg = raw.split('</td>')[0];
    const full = seg.match(/data-cung-full-name="([^."]+)\.([^"]+)"/);
    if (!full) continue;
    const canTat = full[1], chiTen = full[2];
    const so = chiSo(chiTen);
    const daiVan = Number((seg.match(/data-dai-van="(\d+)"/) || [])[1]);
    const ln = (seg.match(/data-luu-nien="([^"]*)"/) || [])[1];
    const tenCung = DEC((seg.match(/text-sao-chinh-tinh[^>]*>\s*([^<]+)</) || [])[1]);
    const chinh = [];
    const reC = /text-chinh-chinh[^>]*>\s*([^<(]+?)\s*(?:\(([A-ZĐ])\))?\s*</g;
    let m;
    while ((m = reC.exec(seg))) chinh.push([DEC(m[1]), m[2] || null]);
    const sao = [];
    const reS = /text-sao-xau-tot[^>]*>\s*([^<]+?)\s*</g;
    while ((m = reS.exec(seg))) {
      let t = DEC(m[1]);
      if (/^ĐV\./.test(t)) { sao.push({ ten: t.replace(/^ĐV\.\s*/, ''), dv: true }); continue; }
      const luu = /^L\./.test(t);
      t = t.replace(/^L\./, '').trim();
      const dt = t.match(/\(([A-ZĐ])\)\s*$/);
      if (dt) t = t.replace(/\(([A-ZĐ])\)\s*$/, '').trim();
      sao.push({ ten: t, luu, dacTinh: dt ? dt[1] : null });
    }
    const bottom = (seg.match(/<div class="cung-bottom">([\s\S]*?)<\/div>/) || [])[1] || '';
    const trangSinh = DEC((bottom.match(/data-sao-id="\d+"[^>]*>\s*([^<]+?)\s*</) || [])[1]);
    const dv = (bottom.match(/id="DVT\d+">\s*([^<]*)/) || [])[1] || '';
    const tieuHan = DEC((seg.match(/khoi-tieu-han[^>]*>\s*<span[^>]*>\s*([^<]+?)\s*</) || [])[1]);
    const thangLuu = (seg.match(/id="KNH\d+">\s*([^<]*)/) || [])[1] || '';
    cung[so] = { chi: chiTen, canTat, so, daiVan, ln: (ln || '').trim(), ten: tenCung, chinh, sao, trangSinh, dv: dv.trim(), tieuHan, thangLuu: thangLuu.trim() };
  }
  return { cung };
}

module.exports = { CASES, parse, DEC, NAM_XEM: 2026, THANG_XEM: 10 };
