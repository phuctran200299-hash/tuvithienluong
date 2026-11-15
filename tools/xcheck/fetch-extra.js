/* Tải thêm các lá số trong extra-cases.json (do gen-cover.js sinh ra) về html/.
 * Chỉ gửi ngày/giờ/giới tính + tên "A" — không gửi thông tin cá nhân nào.
 * Chạy: node tools/xcheck/fetch-extra.js
 */
const fs = require('fs');
const path = require('path');
const { NAM_XEM, THANG_XEM } = require('./lib-tuvivn.js');

const DIR = path.join(__dirname, 'html');
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'extra-cases.json'), 'utf8'));

async function tai(c) {
  const body = new URLSearchParams({
    name: 'A', dayOfDOB: String(c.d), monthOfDOB: String(c.m), yearOfDOB: String(c.y),
    hourOfDOB: String(c.h), minOfDOB: String(c.mi || 0), calendar: 'true',
    gender: c.g === 1 ? 'true' : 'false', timezone: '1',
    viewYear: String(NAM_XEM), viewMonth: String(THANG_XEM),
  });
  const res = await fetch('https://tuvi.vn/la-so', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0' },
    body,
    redirect: 'follow',
  });
  fs.writeFileSync(path.join(DIR, `${c.y}-${c.m}-${c.d}-${c.h}-${c.g}.html`), await res.text());
}

(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  for (const c of cases) {
    try { await tai(c); process.stdout.write('.'); }
    catch (e) { console.log('\nLỗi tải', c, e.message); }
    await new Promise((r) => setTimeout(r, 1500)); // lịch sự với server của người ta
  }
  console.log('\nXong —', cases.length, 'lá số. Chạy: node tools/xcheck/dac-tinh.js');
})();
