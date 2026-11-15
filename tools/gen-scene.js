// Sinh tranh nền assets/img/bg-scene.svg — chạy: node tools/gen-scene.js
'use strict';
const fs = require('fs');
const path = require('path');

let seed = 20261114;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const f = (n) => Math.round(n * 10) / 10;

// Một đỉnh núi kiểu đá vôi: chân rộng, đỉnh bo tròn
function peakTop(x, top, w, base) {
  return `M${f(x - w)},${base} C${f(x - w * 0.55)},${base} ${f(x - w * 0.32)},${top} ${f(x)},${top} ` +
    `C${f(x + w * 0.32)},${top} ${f(x + w * 0.55)},${base} ${f(x + w)},${base}`;
}
/** Một dãy núi: nền đất liền mạch + từng đỉnh (đặc màu, vẽ lần lượt để đỉnh sau che vân đỉnh trước) */
function layer(peaks, base, fill, rim) {
  let out = `<rect y="${base - 2}" width="1600" height="${1002 - base}" fill="${fill}"/>`;
  // vẽ đỉnh thấp trước, đỉnh cao sau
  peaks.slice().sort((a, b) => a[1] - b[1]).forEach(([x, h, w]) => {
    const body = peakTop(x, base - h, w, base) + ` L${f(x + w)},${base + 2} L${f(x - w)},${base + 2} Z`;
    let lines = peakTop(x, base - h, w, base);
    for (let k = 1; k <= 2; k++) {
      const s = 1 - k * 0.24;
      lines += ' ' + peakTop(x + w * 0.07 * k, base - h * s, w * s, base);
    }
    out += `<path d="${body}" fill="${fill}"/>` +
      `<path d="${lines}" fill="none" stroke="${rim}" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>`;
  });
  return out;
}

// Mây tường vân
const cloudDef = `<g id="cloudA">
    <path d="M10 70 Q0 70 0 58 Q0 42 20 42 Q22 18 50 16 Q70 -4 100 10 Q122 -2 142 18 Q170 14 176 40 Q200 40 200 58 Q200 70 188 70 Z"
      fill="url(#cloudFill)" stroke="url(#gold)" stroke-width="1.6"/>
    <path d="M58 50 a13 13 0 1 1 13 -13 a7 7 0 1 1 -7 7" fill="none" stroke="url(#gold)" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M118 46 a11 11 0 1 0 -11 -11 a6 6 0 1 0 6 6" fill="none" stroke="url(#gold)" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M150 58 q16 0 18 -14" fill="none" stroke="url(#gold)" stroke-width="1.4" stroke-linecap="round"/>
  </g>`;

// Sao
let stars = '';
for (let i = 0; i < 110; i++) {
  const x = rnd() * 1600, y = rnd() * 560 * (0.35 + rnd() * 0.65);
  const r = rnd() < 0.12 ? 1.9 + rnd() : 0.6 + rnd() * 1.1;
  stars += `<circle class="tw tw${i % 3}" cx="${f(x)}" cy="${f(y)}" r="${f(r)}" opacity="${f(0.35 + rnd() * 0.6)}"/>`;
}
// Chòm Bắc Đẩu (thất tinh)
const dipper = [[250, 150], [318, 132], [378, 160], [440, 182], [462, 246], [546, 252], [556, 186]];
const dipperLine = 'M' + dipper.map((p) => p.join(',')).join(' L') + ' L440,182';
const dipperStars = dipper.map(([x, y]) =>
  `<circle cx="${x}" cy="${y}" r="9" fill="url(#starGlow)"/><circle cx="${x}" cy="${y}" r="3.2" fill="#f4e8c1"/>`).join('');

// Hoa sen
function lotus(x, y, s) {
  const petal = (rot, len, wid) => `<path transform="rotate(${rot})" d="M0 0 C${-wid} ${-len * 0.45} ${-wid * 0.6} ${-len * 0.85} 0 ${-len} C${wid * 0.6} ${-len * 0.85} ${wid} ${-len * 0.45} 0 0 Z"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="url(#lotusFill)" stroke="#c5a059" stroke-width="1.5" stroke-linejoin="round">
    ${petal(-62, 70, 24)}${petal(62, 70, 24)}${petal(-34, 92, 28)}${petal(34, 92, 28)}${petal(0, 110, 30)}
    <path d="M-120 6 Q0 -18 120 6 Q0 22 -120 6 Z" fill="#3a2060" stroke="#c5a059"/>
  </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#140b24"/>
    <stop offset=".34" stop-color="#2a1844"/>
    <stop offset=".6" stop-color="#4a2a70"/>
    <stop offset=".8" stop-color="#8a5fa8"/>
    <stop offset="1" stop-color="#d9b8d6"/>
  </linearGradient>
  <radialGradient id="horizonGlow" cx=".5" cy=".78" r=".55">
    <stop offset="0" stop-color="#f3d99a" stop-opacity=".55"/>
    <stop offset=".45" stop-color="#e2a9c4" stop-opacity=".18"/>
    <stop offset="1" stop-color="#e2a9c4" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="moonHalo" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#f4e8c1" stop-opacity=".5"/>
    <stop offset="1" stop-color="#f4e8c1" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="starGlow" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#f4e8c1" stop-opacity=".6"/>
    <stop offset="1" stop-color="#f4e8c1" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ead196"/>
    <stop offset="1" stop-color="#b3903f"/>
  </linearGradient>
  <linearGradient id="moonFill" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fbf0cf"/>
    <stop offset="1" stop-color="#d9b56a"/>
  </linearGradient>
  <linearGradient id="cloudFill" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f7eefa" stop-opacity=".95"/>
    <stop offset="1" stop-color="#d8c8e2" stop-opacity=".85"/>
  </linearGradient>
  <linearGradient id="lotusFill" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f3dce9"/>
    <stop offset="1" stop-color="#b98fc4"/>
  </linearGradient>
  <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f1e4f4" stop-opacity="0"/>
    <stop offset=".5" stop-color="#f1e4f4" stop-opacity=".22"/>
    <stop offset="1" stop-color="#f1e4f4" stop-opacity="0"/>
  </linearGradient>
  <mask id="crescent">
    <rect width="1600" height="1000" fill="#000"/>
    <circle cx="1270" cy="190" r="62" fill="#fff"/>
    <circle cx="1298" cy="170" r="56" fill="#000"/>
  </mask>
  ${cloudDef}
  <style>
    .tw { fill: #f8efd6; }
    .tw0 { animation: tw 3.2s ease-in-out infinite alternate; }
    .tw1 { animation: tw 4.6s ease-in-out infinite alternate .8s; }
    .tw2 { animation: tw 6s ease-in-out infinite alternate 1.6s; }
    @keyframes tw { from { opacity: .15 } to { opacity: 1 } }
    .drift1 { animation: drift 38s ease-in-out infinite alternate; }
    .drift2 { animation: drift 52s ease-in-out infinite alternate-reverse; }
    @keyframes drift { from { transform: translateX(-40px) } to { transform: translateX(40px) } }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
  </style>
</defs>

<rect width="1600" height="1000" fill="url(#sky)"/>
<rect width="1600" height="1000" fill="url(#horizonGlow)"/>
<g>${stars}</g>
<path d="${dipperLine}" fill="none" stroke="#e6c983" stroke-width="1.2" stroke-dasharray="3 5" opacity=".55"/>
<g>${dipperStars}</g>

<circle cx="1270" cy="190" r="170" fill="url(#moonHalo)"/>
<rect width="1600" height="1000" fill="url(#moonFill)" mask="url(#crescent)"/>

<g class="drift1" opacity=".9"><use xlink:href="#cloudA" transform="translate(1040 250) scale(1.35)"/></g>
<g class="drift2" opacity=".75"><use xlink:href="#cloudA" transform="translate(120 330) scale(1.05)"/></g>
<g class="drift1" opacity=".6"><use xlink:href="#cloudA" transform="translate(640 120) scale(.7)"/></g>

${layer([[90, 300, 170], [330, 220, 150], [560, 340, 190], [820, 250, 170], [1060, 320, 180], [1300, 230, 160], [1520, 300, 170]], 780, '#6c4e93', '#e6c983')}
<rect y="600" width="1600" height="260" fill="url(#mist)"/>
${layer([[-20, 360, 200], [250, 260, 170], [470, 200, 150], [1150, 210, 150], [1380, 300, 180], [1640, 380, 210]], 860, '#55307f', '#e6c983')}
<g class="drift2" opacity=".85"><use xlink:href="#cloudA" transform="translate(1180 640) scale(1.6)"/></g>
<g class="drift1" opacity=".85"><use xlink:href="#cloudA" transform="translate(60 700) scale(1.4)"/></g>
${layer([[40, 330, 190], [300, 200, 160], [1310, 210, 170], [1580, 340, 200]], 940, '#3b2160', '#d8b46a')}
<rect y="820" width="1600" height="180" fill="url(#mist)"/>
${layer([[-60, 420, 210], [170, 250, 150], [1440, 260, 160], [1680, 440, 220]], 1000, '#251340', '#c5a059')}
${lotus(250, 1000, 0.9)}
${lotus(1370, 1004, 1.05)}
</svg>
`;

const out = path.join(__dirname, '..', 'assets', 'img', 'bg-scene.svg');
fs.writeFileSync(out, svg);
console.log('Đã ghi', out, (svg.length / 1024).toFixed(1) + ' KB');
