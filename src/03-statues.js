/* ---------- Stone guardian statues (2D, shaded stone) ---------- */
function statueArt(kind) {
  const oc = document.createElement('canvas'); oc.width = oc.height = 240; const g = oc.getContext('2d'); g.scale(2.4, 2.4);
  const BASE = '#8e8771';
  const E = (x, y, rx, ry, rot) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, 6.3); g.fill(); };
  const L = (x1, y1, x2, y2, w) => { g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
  const P = pts => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
  g.fillStyle = BASE; g.strokeStyle = BASE;
  if (kind === 'horse') {
    E(44, 58, 25, 13, -.9); E(54, 48, 13, 15, -.5); P([[52, 48], [56, 22], [70, 16], [68, 42], [62, 56]]);
    E(72, 19, 13, 6.5, .5); E(83, 25, 5, 5, .5); P([[66, 13], [67, 4], [72, 12]]);
    L(62, 54, 76, 58, 7); L(76, 58, 78, 70, 5.5); L(58, 56, 70, 66, 6); L(70, 66, 70, 75, 5);
    L(34, 68, 30, 85, 9); L(44, 70, 50, 85, 8); E(30, 86, 6, 3); E(50, 86, 6, 3);
    L(24, 60, 14, 68, 6); L(14, 68, 12, 82, 5); P([[54, 24], [47, 26], [53, 30], [46, 34], [52, 38], [45, 42], [52, 46], [57, 36]]);
  } else if (kind === 'elephant') {
    E(56, 58, 28, 21); [36, 50, 64, 78].forEach((x, i) => L(x, 70 + (i % 3 ? 3 : 0), x, 88, 12)); E(26, 48, 17, 17); E(30, 38, 13, 10); E(42, 50, 12, 19, .15);
    L(14, 56, 10, 66, 9); L(10, 66, 10, 76, 7); L(10, 76, 16, 83, 5.5); L(84, 52, 90, 68, 3.5);
  } else if (kind === 'chimp') {
    E(48, 66, 19, 22); E(48, 50, 23, 13); E(46, 28, 14, 14); E(32, 29, 5, 6); E(60, 29, 5, 6);
    L(30, 52, 24, 72, 10); L(66, 52, 72, 72, 10); E(24, 77, 7, 5); E(72, 77, 7, 5); E(34, 82, 13, 8, -.2); E(62, 82, 13, 8, .2); E(26, 89, 10, 4); E(70, 89, 10, 4);
  } else { // crow on a broken pillar
    P([[34, 98], [36, 72], [44, 67], [52, 73], [60, 67], [68, 71], [70, 98]]);
    E(52, 50, 22, 12, -.35); E(33, 36, 9, 8); P([[27, 34], [13, 41], [27, 42]]); P([[68, 56], [94, 72], [90, 78], [64, 62]]); L(48, 58, 48, 70, 2.4); L(57, 58, 57, 70, 2.4);
  }
  g.globalCompositeOperation = 'source-atop';
  const sh = g.createLinearGradient(0, 0, 100, 100); sh.addColorStop(0, 'rgba(255,248,215,.5)'); sh.addColorStop(.4, 'rgba(255,248,215,0)'); sh.addColorStop(1, 'rgba(10,8,0,.7)');
  g.fillStyle = sh; g.fillRect(0, 0, 100, 100);
  _seed = 900 + kind.length * 17;
  for (let i = 0; i < 38; i++) { g.fillStyle = `rgba(${rr(45, 90) | 0},${rr(120, 170) | 0},${rr(50, 80) | 0},${rr(.3, .7)})`; g.beginPath(); g.ellipse(rr(8, 92), rr(8, 80), rr(1.5, 5), rr(1, 3), rnd() * 3, 0, 6.3); g.fill(); }
  g.strokeStyle = 'rgba(30,22,10,.45)'; g.lineWidth = .8; g.lineCap = 'round';
  for (let i = 0; i < 16; i++) { const x = rr(10, 90), y = rr(10, 85); g.beginPath(); g.moveTo(x, y); g.lineTo(x + rr(-6, 6), y + rr(2, 9)); g.stroke(); }
  g.globalCompositeOperation = 'source-over';
  const dark = '#1d160a', ivory = '#f1e8cf';
  g.fillStyle = dark; g.strokeStyle = dark; g.lineCap = 'round';
  if (kind === 'horse') { g.beginPath(); g.arc(73, 17, 1.6, 0, 6.3); g.fill(); g.beginPath(); g.arc(86, 25, 1, 0, 6.3); g.fill(); g.lineWidth = .9; g.beginPath(); g.arc(45, 56, 14, -2.2, -.7); g.stroke(); }
  if (kind === 'elephant') { g.beginPath(); g.arc(22, 44, 1.8, 0, 6.3); g.fill(); g.lineWidth = 1; g.beginPath(); g.arc(30, 34, 10, 3.5, 6); g.stroke(); g.beginPath(); g.arc(30, 34, 6, 3.5, 6); g.stroke();
    g.strokeStyle = ivory; g.lineWidth = 3.4; g.beginPath(); g.moveTo(17, 58); g.quadraticCurveTo(6, 62, 3, 72); g.stroke(); g.strokeStyle = '#c9a24b'; g.lineWidth = 1.4; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(56, 56, 24 + i * 0, 3.2 + i * .1, 3.3 + i * .1); g.stroke(); } g.strokeStyle = dark; g.lineWidth = .9; g.beginPath(); g.arc(56, 58, 20, 3.6, 5.9); g.stroke(); }
  if (kind === 'chimp') { g.lineWidth = 1.6; g.beginPath(); g.moveTo(38, 25); g.quadraticCurveTo(46, 22, 54, 25); g.stroke(); g.beginPath(); g.arc(41, 28, 1.5, 0, 6.3); g.arc(51, 28, 1.5, 0, 6.3); g.fill(); g.fillStyle = 'rgba(230,220,190,.6)'; g.beginPath(); g.ellipse(46, 34, 8, 6, 0, 0, 6.3); g.fill(); g.fillStyle = dark; g.fillRect(43, 35, 6, 1.2); }
  if (kind === 'crow') { g.beginPath(); g.arc(31, 34, 1.6, 0, 6.3); g.fill(); g.lineWidth = 1; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(44 + i * 6, 46 + i); g.lineTo(54 + i * 7, 56 + i * 2); g.stroke(); } }
  return oc;
}
const statueCache = {};
function drawStatue(g, kind, x, y, size, withPlinth) {
  const sa = statueCache[kind] || (statueCache[kind] = statueArt(kind));
  if (withPlinth) { _seed = 200; rock(g, x + size * .5, y + size * .82, size * .38); rock(g, x + size * .25, y + size * .86, size * .24); rock(g, x + size * .78, y + size * .84, size * .26); }
  g.save(); g.shadowColor = 'rgba(0,0,0,.65)'; g.shadowBlur = size * .1; g.shadowOffsetX = size * .04; g.shadowOffsetY = size * .06;
  if (withPlinth && kind !== 'crow') { const px0 = x + size * .1, py0 = y + size * .84; g.fillStyle = stoneFill(g, px0, py0, size * .8, size * .14, '#8d8160'); g.beginPath(); g.roundRect(px0, py0, size * .8, size * .14, 4); g.fill(); }
  g.restore();
  g.save(); g.shadowColor = 'rgba(12,8,2,.95)'; g.shadowBlur = 0; // dark outline from 8 offset silhouettes
  for (let k = 0; k < 8; k++) { const dx = Math.cos(k * .785) * size * .018, dy = Math.sin(k * .785) * size * .018; g.shadowOffsetX = 5000 + dx; g.shadowOffsetY = dy; g.drawImage(sa, x - 5000, y, size, size); }
  g.restore();
  g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = size * .08; g.shadowOffsetX = size * .03; g.shadowOffsetY = size * .05; g.drawImage(sa, x, y, size, size); g.restore();
  if (withPlinth && kind !== 'crow') mossBlobs(g, x + size * .1, y + size * .84, size * .8, size * .14, 18);
}
function paintStatues(g) {
  const b = 98, o = 0;
  drawStatue(g, 'horse', o, o, b, true); drawStatue(g, 'elephant', W - b - o, o, b, true);
  drawStatue(g, 'chimp', o, W - b - o, b, true); drawStatue(g, 'crow', W - b - o, W - b - o, b, true);
  const cs = 34; [1, 5].forEach(i => { const p = pockets[i], x = gx(p[0]) + p[2] * S / 2 - cs / 2, y = gx(p[1]) + p[3] * S / 2 - cs / 2; drawStatue(g, 'crow', x, y, cs, false); });
}
/* ---------- Whole board ---------- */
function paintBoard(g) {
  paintScene(g); paintOutsideFoliage(g); paintPockets(g); paintInnerPool(g); paintHangingVines(g);
  paintPaths(g); paintTemple(g); paintStatues(g); paintAtmosphere(g);
}
