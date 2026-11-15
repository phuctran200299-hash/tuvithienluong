/* Tải 16 lá số tham chiếu từ tuvi.vn về thư mục html/ rồi gọi cmp-offline.js để đối chiếu.
 * Chạy: node tools/xcheck/cmp-tuvivn.js
 * Chỉ gửi ngày/giờ/giới tính + tên "A" — không gửi thông tin cá nhân nào.
 */
const fs = require('fs');
const path = require('path');
const { CASES, NAM_XEM, THANG_XEM } = require('./lib-tuvivn.js');

const DIR = path.join(__dirname, 'html');

async function tai(c) {
  const body = new URLSearchParams({
    name: 'A', dayOfDOB: String(c.d), monthOfDOB: String(c.m), yearOfDOB: String(c.y),
    hourOfDOB: String(c.h), minOfDOB: String(c.mi), calendar: 'true',
    gender: c.g === 1 ? 'true' : 'false', timezone: '1',
    viewYear: String(NAM_XEM), viewMonth: String(THANG_XEM),
  });
  const res = await fetch('https://tuvi.vn/la-so', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0' },
    body,
    redirect: 'follow',
  });
  const html = await res.text();
  fs.writeFileSync(path.join(DIR, `${c.y}-${c.m}-${c.d}-${c.h}-${c.g}.html`), html);
}

(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  for (const c of CASES) {
    try { await tai(c); process.stdout.write('.'); }
    catch (e) { console.log('\nLỗi tải', c.note, e.message); }
    await new Promise((r) => setTimeout(r, 1500)); // lịch sự với server của người ta
  }
  console.log('\nĐã lưu HTML vào', DIR, '\n');
  require('./cmp-offline.js');
})();
