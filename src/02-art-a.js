/* ---------- Painterly helpers ---------- */
let _seed = 7;
const rnd = () => (_seed = (_seed * 16807) % 2147483647) / 2147483647;
const rr = (a, b) => a + (b - a) * rnd();
const pick = a => a[Math.floor(rnd() * a.length)];
const GREENS = ['#1c4a28', '#245c30', '#2f7436', '#3b8a3c', '#4fa042', '#67b24c', '#17381f'];

function leaf(g, x, y, len, ang, w, col, vein) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = col; g.beginPath(); g.moveTo(0, 0);
  g.quadraticCurveTo(len * .5, -w, len, 0); g.quadraticCurveTo(len * .5, w * .9, 0, 0); g.fill();
  if (vein) { g.strokeStyle = 'rgba(255,255,200,.22)'; g.lineWidth = Math.max(.6, w * .08); g.beginPath(); g.moveTo(0, 0); g.lineTo(len * .92, 0); g.stroke(); }
  g.restore();
}
function palm(g, x, y, size, n) {
  n = n || 9; const base = rnd() * 6.28;
  g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = size * .25; g.shadowOffsetY = size * .08;
  for (let i = 0; i < n; i++) {
    const a = base + i * 6.28 / n + rr(-.15, .15), l = size * rr(.75, 1.05);
    leaf(g, x, y, l, a, size * .26, pick(GREENS.slice(0, 5)), true);
  }
  g.restore();
  g.fillStyle = '#2a1d0e'; g.beginPath(); g.arc(x, y, size * .07, 0, 6.3); g.fill();
}
function bush(g, x, y, r, count) {
  for (let i = 0; i < count; i++) {
    const a = rnd() * 6.28, d = Math.sqrt(rnd()) * r;
    leaf(g, x + Math.cos(a) * d, y + Math.sin(a) * d, r * rr(.5, .9), rnd() * 6.28, r * rr(.12, .22), pick(GREENS), rnd() < .3);
  }
}
function vine(g, x, y, len, sway) {
  g.save(); g.strokeStyle = '#2e6a32'; g.lineWidth = 2; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + sway, y + len * .35, x - sway, y + len * .7, x + sway * .4, y + len); g.stroke();
  for (let i = 1; i < 6; i++) {
    const t = i / 6, vx = x + sway * Math.sin(t * 3) * .5, vy = y + len * t;
    leaf(g, vx, vy, 9, rnd() < .5 ? .5 : 2.6, 3.2, pick(GREENS.slice(2, 6)));
  }
  g.restore();
}
function mossBlobs(g, x, y, w, h, n) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = `rgba(${rr(40, 90) | 0},${rr(120, 170) | 0},${rr(50, 80) | 0},${rr(.25, .6)})`;
    g.beginPath(); g.ellipse(x + rnd() * w, y + rnd() * h, rr(2, 6), rr(1.5, 4), rnd() * 3, 0, 6.3); g.fill();
  }
}
function stoneFill(g, x, y, w, h, base) {
  const gr = g.createLinearGradient(x, y, x + w, y + h);
  gr.addColorStop(0, '#d9ccaa'); gr.addColorStop(.5, base || '#a99b78'); gr.addColorStop(1, '#6d6246');
  return gr;
}
function pillar(g, x, y, w, h, broken) {
  g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 8; g.shadowOffsetX = 4; g.shadowOffsetY = 5;
  g.fillStyle = stoneFill(g, x, y, w, h); g.beginPath();
  g.moveTo(x, y + h); g.lineTo(x + w * .08, y + h * .15);
  if (broken) { g.lineTo(x + w * .3, y); g.lineTo(x + w * .5, y + h * .12); g.lineTo(x + w * .72, y - h * .03); g.lineTo(x + w * .92, y + h * .18); }
  else { g.lineTo(x + w * .08, y); g.lineTo(x + w * .92, y); g.lineTo(x + w * .92, y + h * .15); }
  g.lineTo(x + w, y + h); g.closePath(); g.fill(); g.restore();
  g.strokeStyle = 'rgba(40,30,15,.35)'; g.lineWidth = 1;
  for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x + w * i / 4, y + h * .2); g.lineTo(x + w * i / 4, y + h); g.stroke(); }
  g.fillStyle = '#7d7254'; g.fillRect(x - w * .1, y + h * .88, w * 1.2, h * .12);
  mossBlobs(g, x, y + h * .3, w, h * .7, 14);
}
function pond(g, x, y, w, h, rad) {
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, rad); g.clip();
  const gr = g.createLinearGradient(x, y, x + w, y + h);
  gr.addColorStop(0, '#0b6a73'); gr.addColorStop(.5, '#0f8a86'); gr.addColorStop(1, '#0a4f66');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.strokeStyle = 'rgba(190,255,240,.18)'; g.lineWidth = 1.2;
  for (let i = 0; i < w * h / 500; i++) { const a = x + rnd() * w, b = y + rnd() * h, l = rr(6, 20); g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo(a + l / 2, b - 2, a + l, b); g.stroke(); }
  for (let i = 0; i < w * h / 2600; i++) { // lily pads
    const a = x + rnd() * w, b = y + rnd() * h, r = rr(5, 9);
    g.fillStyle = pick(['#2f8a3a', '#3fa045', '#276f33']); g.beginPath(); g.moveTo(a, b); g.arc(a, b, r, .5, 6.1); g.fill();
    if (rnd() < .35) { g.fillStyle = '#f7b7d0'; g.beginPath(); g.arc(a + 1, b - 1, 2.6, 0, 6.3); g.fill(); }
  }
  g.restore();
  g.strokeStyle = '#4b4330'; g.lineWidth = 4; g.beginPath(); g.roundRect(x, y, w, h, rad); g.stroke();
  g.strokeStyle = 'rgba(140,200,120,.5)'; g.lineWidth = 1.5; g.stroke();
}
function waterfall(g, x, y, w, h) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  const gr = g.createLinearGradient(x, y, x, y + h);
  gr.addColorStop(0, '#e6fbff'); gr.addColorStop(.5, '#9fdcea'); gr.addColorStop(1, '#4fb0c8');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.4;
  for (let i = 0; i < w / 3; i++) { const a = x + rnd() * w; g.beginPath(); g.moveTo(a, y); g.lineTo(a + rr(-2, 2), y + h); g.stroke(); }
  g.restore();
  const m = g.createRadialGradient(x + w / 2, y + h, 2, x + w / 2, y + h, w * 1.2);
  m.addColorStop(0, 'rgba(255,255,255,.75)'); m.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = m; g.fillRect(x - w, y + h - w, w * 3, w * 2);
}
function rock(g, x, y, r) {
  g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 10; g.shadowOffsetY = 5;
  const gr = g.createRadialGradient(x - r * .3, y - r * .4, r * .1, x, y, r * 1.2);
  gr.addColorStop(0, '#9b9482'); gr.addColorStop(1, '#4a4538'); g.fillStyle = gr;
  g.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28, d = r * rr(.75, 1.1); g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d * .8); }
  g.closePath(); g.fill(); g.restore(); mossBlobs(g, x - r, y - r * .8, r * 2, r, 16);
}
function torch(g, x, y) { // base only; flame is animated in the live layer
  g.fillStyle = stoneFill(g, x - 8, y - 4, 16, 26); g.fillRect(x - 7, y + 2, 14, 22);
  g.fillStyle = '#7d7254'; g.fillRect(x - 10, y + 20, 20, 6); g.fillRect(x - 9, y - 3, 18, 6);
  g.fillStyle = '#2a2014'; g.beginPath(); g.ellipse(x, y - 3, 7, 3, 0, 0, 6.3); g.fill();
}
const torches = [];

/* ---------- Scene: jungle ground, cliffs, wall platform, pockets ---------- */
function paintScene(g) {
  _seed = 11;
  const bg = g.createLinearGradient(0, 0, W, W);
  bg.addColorStop(0, '#0f3320'); bg.addColorStop(.5, '#0a2517'); bg.addColorStop(1, '#0c2b1b');
  g.fillStyle = bg; g.fillRect(0, 0, W, W);
  for (let i = 0; i < 700; i++) bush(g, rnd() * W, rnd() * W, rr(14, 40), 5);       // deep jungle floor
  // cliffs and waterfalls beyond the walls
  for (let i = 0; i < 9; i++) rock(g, rr(40, 960), rr(8, 60), rr(28, 50));
  for (let i = 0; i < 9; i++) rock(g, rr(40, 960), rr(945, 995), rr(28, 50));
  for (let i = 0; i < 6; i++) { rock(g, rr(8, 55), rr(150, 850), rr(24, 40)); rock(g, rr(945, 992), rr(150, 850), rr(24, 40)); }
  [[300, 4, 24, 56], [585, 2, 30, 62], [760, 6, 20, 50]].forEach(a => waterfall(g, a[0], a[1], a[2], a[3]));
  [[170, 944, 28, 56], [420, 940, 34, 60], [690, 946, 22, 52]].forEach(a => waterfall(g, a[0], a[1], a[2], a[3]));
  waterfall(g, 6, 700, 40, 20); waterfall(g, 958, 300, 34, 18);
  // wall platform
  const a = M - .55 * S, b = W - M + .55 * S;
  g.save(); g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = 30; g.shadowOffsetY = 12;
  g.fillStyle = '#4c4332'; g.beginPath(); g.roundRect(a, a, b - a, b - a, 22); g.fill(); g.restore();
  g.save(); g.beginPath(); g.roundRect(a, a, b - a, b - a, 22); g.clip();
  g.fillStyle = stoneFill(g, a, a, b - a, b - a, '#8d8160'); g.fillRect(a, a, b - a, b - a);
  g.strokeStyle = 'rgba(30,22,10,.35)'; g.lineWidth = 1.2;
  for (let y = a; y < b; y += 14) { g.beginPath(); g.moveTo(a, y); g.lineTo(b, y); g.stroke(); for (let x = a + ((y / 14 | 0) % 2) * 22; x < b; x += 44) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 14); g.stroke(); } }
  g.restore();
  mossBlobs(g, a, a, b - a, 14, 160); mossBlobs(g, a, b - 14, b - a, 14, 160); mossBlobs(g, a, a, 14, b - a, 160); mossBlobs(g, b - 14, a, 14, b - a, 160);
  // earth inside the walls
  const e0 = M - .3 * S, e1 = W - M + .3 * S;
  g.save(); g.beginPath(); g.roundRect(e0, e0, e1 - e0, e1 - e0, 14); g.clip();
  const ground = g.createRadialGradient(CX, CY, 60, CX, CY, 520);
  ground.addColorStop(0, '#2d5a33'); ground.addColorStop(1, '#183d22'); g.fillStyle = ground; g.fillRect(e0, e0, e1 - e0, e1 - e0);
  for (let i = 0; i < 260; i++) bush(g, rr(e0, e1), rr(e0, e1), rr(10, 22), 4);
  g.restore();
  g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 5; g.beginPath(); g.roundRect(e0, e0, e1 - e0, e1 - e0, 14); g.stroke();
}

function shade(hex, f) { const n = parseInt(hex.slice(1, 7), 16); const c = k => Math.max(0, Math.min(255, Math.round(((n >> k) & 255) * f))); return `rgb(${c(16)},${c(8)},${c(0)})`; }
