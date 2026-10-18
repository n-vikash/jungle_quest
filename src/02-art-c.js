/* ---------- Central temple ---------- */
function disc(g, r, fill, stroke, lw) {
  g.beginPath(); g.arc(CX, CY, r, 0, 6.3); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 2; g.stroke(); }
}
function paintTemple(g) {
  _seed = 5;
  const R = k => k * S;
  const ring = (r0, r1, c0, c1) => { const gr = g.createRadialGradient(CX - r1 * .35, CY - r1 * .4, r0 * .3, CX, CY, r1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; };
  g.save(); g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
  disc(g, R(2.5), ring(0, R(2.5), '#cdbf98', '#6d6246'), '#2d2312', 3); g.restore();
  disc(g, R(2.4), ring(0, R(2.4), '#b6a982', '#7d714f'), 'rgba(40,30,12,.8)', 2);
  // rune ring
  disc(g, R(2.2), '#4a4532', 'rgba(255,240,190,.35)', 2); disc(g, R(1.74), '#6b6247', '#2b2310', 2);
  for (let i = 0; i < 40; i++) {
    const a = i / 40 * 6.28, r = R(1.97); g.save(); g.translate(CX + Math.cos(a) * r, CY + Math.sin(a) * r); g.rotate(a);
    g.strokeStyle = 'rgba(80,235,170,.75)'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath();
    const k = i % 4; if (k === 0) { g.moveTo(-6, 0); g.lineTo(6, 0); g.moveTo(0, -6); g.lineTo(0, 6); } else if (k === 1) { g.arc(0, 0, 4.5, 0, 6.3); } else if (k === 2) { g.moveTo(-5, -6); g.lineTo(4, 0); g.lineTo(-5, 6); } else { g.moveTo(-6, 4); g.lineTo(0, -6); g.lineTo(6, 4); g.moveTo(-3, 0); g.lineTo(3, 0); }
    g.stroke(); g.restore();
  }
  disc(g, R(1.7), ring(0, R(1.7), '#c2b58c', '#8a7e5c'), 'rgba(35,26,10,.85)', 2.5);
  // carved star band
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * 6.28; g.beginPath(); g.moveTo(CX + Math.cos(a - .1) * R(1.28), CY + Math.sin(a - .1) * R(1.28));
    g.lineTo(CX + Math.cos(a) * R(1.62), CY + Math.sin(a) * R(1.62)); g.lineTo(CX + Math.cos(a + .1) * R(1.28), CY + Math.sin(a + .1) * R(1.28)); g.closePath();
    g.fillStyle = i % 2 ? 'rgba(60,45,20,.35)' : 'rgba(255,245,210,.22)'; g.fill();
  }
  disc(g, R(1.25), ring(0, R(1.25), '#a0946f', '#655a3e'), 'rgba(35,26,10,.85)', 2.5);
  disc(g, R(1.1), '#3c382a', 'rgba(255,240,190,.3)', 1.5);
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28 + .39; g.save(); g.translate(CX + Math.cos(a) * R(.93), CY + Math.sin(a) * R(.93)); g.rotate(a); g.fillStyle = 'rgba(80,235,170,.5)'; g.beginPath(); g.moveTo(-6, 0); g.lineTo(0, -5); g.lineTo(8, 0); g.lineTo(0, 5); g.closePath(); g.fill(); g.restore(); }
  disc(g, R(.78), ring(0, R(.78), '#c9bd96', '#7a6f4f'), '#2a210f', 3);
  disc(g, R(.58), '#1d3a2b', 'rgba(80,235,170,.6)', 2);
  // broken pillars at diagonals
  [[.78], [2.36], [3.93], [5.5]].forEach(([a]) => {
    const x = CX + Math.cos(a) * R(2.18), y = CY + Math.sin(a) * R(2.18);
    g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 8; g.shadowOffsetX = 3; g.shadowOffsetY = 4;
    const gr = g.createRadialGradient(x - 3, y - 4, 1, x, y, 16); gr.addColorStop(0, '#d8cca6'); gr.addColorStop(1, '#7a6e4e'); g.fillStyle = gr;
    g.beginPath(); for (let i = 0; i < 11; i++) { const t = i / 11 * 6.28, d = 14 * rr(.8, 1.05); g.lineTo(x + Math.cos(t) * d, y + Math.sin(t) * d); } g.closePath(); g.fill(); g.restore();
    g.strokeStyle = 'rgba(40,30,14,.55)'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 8, 0, 6.3); g.stroke(); mossBlobs(g, x - 12, y - 12, 24, 24, 10);
  });
  // moss and creepers on the rings
  for (let i = 0; i < 90; i++) { const a = rnd() * 6.28, r = R(rr(1.2, 2.45)); g.fillStyle = `rgba(${rr(45, 90) | 0},${rr(125, 175) | 0},${rr(50, 85) | 0},${rr(.3, .65)})`; g.beginPath(); g.ellipse(CX + Math.cos(a) * r, CY + Math.sin(a) * r, rr(2, 6), rr(1.5, 4), rnd() * 3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 14; i++) { const a = rnd() * 6.28, r = R(2.45); leaf(g, CX + Math.cos(a) * r, CY + Math.sin(a) * r, rr(14, 26), a + Math.PI + rr(-.6, .6), 5, pick(GREENS.slice(2, 6)), true); }
  // stairs from each gate up to the ring
  for (let q = 0; q < 4; q++) {
    g.save(); g.translate(CX, CY); g.rotate(q * Math.PI / 2 + Math.PI / 2);
    for (let k = 0; k < 5; k++) { const y0 = R(2.62) - k * R(.12) - R(.12); g.fillStyle = `hsl(42,24%,${74 - k * 4}%)`; g.fillRect(-R(.42), y0, R(.84), R(.12)); g.fillStyle = 'rgba(30,20,8,.4)'; g.fillRect(-R(.42), y0 + R(.1), R(.84), 2); }
    g.strokeStyle = 'rgba(30,20,8,.7)'; g.lineWidth = 2; g.strokeRect(-R(.42), R(2.62) - R(.6), R(.84), R(.6)); g.restore();
  }
}
/* ---------- Atmosphere ---------- */
function paintOutsideFoliage(g) {
  _seed = 301; const a = M - .55 * S;
  for (let i = 0; i < 26; i++) { const t = rr(10, W - 10), s = rr(24, 44); palm(g, t, rr(4, a - 18), s, 9); palm(g, t, rr(W - a + 18, W - 4), s, 9); palm(g, rr(4, a - 18), t, s, 9); palm(g, rr(W - a + 18, W - 4), t, s, 9); }
  for (let i = 0; i < 40; i++) bush(g, rnd() < .5 ? rr(0, 50) : rr(W - 50, W), rr(0, W), 20, 6);
}
function paintHangingVines(g) {
  _seed = 55; const a = M - .55 * S;
  for (let i = 0; i < 40; i++) { const t = rr(30, W - 30), l = rr(12, 28); vine(g, t, a - 2, l, rr(-4, 4)); vine(g, t, W - a + 2 - l * .1, -l * .5, rr(-3, 3)); }
}
function paintAtmosphere(g) {
  g.save(); g.globalCompositeOperation = 'screen';
  [[.05, .25], [.32, .5], [.62, .72]].forEach(([a, b], i) => {
    const gr = g.createLinearGradient(W * a, 0, W * (a + .35), W); gr.addColorStop(0, 'rgba(255,214,130,0)'); gr.addColorStop(.5, `rgba(255,214,130,${.09 - i * .015})`); gr.addColorStop(1, 'rgba(255,214,130,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(W * a, 0); g.lineTo(W * (a + .2), 0); g.lineTo(W * (b + .55), W); g.lineTo(W * (b + .2), W); g.closePath(); g.fill();
  });
  g.restore();
  [[30, 520, 120], [980, 300, 110], [500, 985, 140], [90, 90, 120], [900, 940, 130], [960, 640, 90]].forEach(([x, y, r]) => {
    const gr = g.createRadialGradient(x, y, 4, x, y, r); gr.addColorStop(0, 'rgba(235,245,240,.28)'); gr.addColorStop(1, 'rgba(235,245,240,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  });
  const v = g.createRadialGradient(CX, CY, W * .34, CX, CY, W * .76); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,10,4,.72)');
  g.fillStyle = v; g.fillRect(0, 0, W, W);
}
