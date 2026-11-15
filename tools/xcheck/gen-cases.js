// Sinh danh sach la so de doi chieu (deterministic)
const fs = require('fs');
const path = require('path');

let seed = 20261114;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

const cases = [];
const N = Number(process.argv[2] || 3000);
for (let i = 0; i < N; i++) {
  const y = 1920 + Math.floor(rnd() * 130);           // 1920..2049
  const m = 1 + Math.floor(rnd() * 12);
  const d = 1 + Math.floor(rnd() * 28);
  const gio = 1 + Math.floor(rnd() * 12);             // 1 = Ty ... 12 = Hoi
  const g = rnd() < 0.5 ? 1 : -1;
  cases.push({ d, m, y, gio, g });
}
fs.writeFileSync(path.join(__dirname, 'cases.json'), JSON.stringify(cases));
console.log('cases:', cases.length);
