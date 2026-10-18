/* ---------- Pockets between roads, inner pool ---------- */
const gx = u => M + u * S;
const pockets = [[2.25, 1.15, 4.5, 1.7], [8.25, 1.15, 4.5, 1.7], [2.25, 12.15, 4.5, 1.7], [8.25, 12.15, 4.5, 1.7],
                 [1.15, 2.25, 1.7, 4.5], [1.15, 8.25, 1.7, 4.5], [12.15, 2.25, 1.7, 4.5], [12.15, 8.25, 1.7, 4.5]];
function paintPockets(g) {
  _seed = 41;
  pockets.forEach((p, i) => {
    const x = gx(p[0]), y = gx(p[1]), w = p[2] * S, h = p[3] * S, horiz = w > h;
    g.save(); g.beginPath(); g.roundRect(x, y, w, h, 14); g.clip();
    const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#244d2c'); gr.addColorStop(1, '#173a20');
    g.fillStyle = gr; g.fillRect(x, y, w, h);
    for (let k = 0; k < 40; k++) bush(g, x + rnd() * w, y + rnd() * h, 14, 4);
    if (i % 2 === 0) { // pond with a cascade
      pond(g, x + 8, y + 8, w - 16, h - 16, 12);
      const wx = horiz ? x + w * .5 - 12 : x + 8, wy = horiz ? y + (i < 4 && i < 2 ? 4 : h - 40) : y + h * .5 - 12;
      rock(g, x + w * .5, y + h * .5, 14); rock(g, x + w * (horiz ? .22 : .5), y + h * (horiz ? .5 : .24), 11);
      mossBlobs(g, x, y, w, h, 40);
    } else { // ruined court: walls, pillars, arch
      g.fillStyle = '#17361e'; g.fillRect(x, y, w, h);
      for (let k = 0; k < 30; k++) bush(g, x + rnd() * w, y + rnd() * h, 12, 5);
      const n = horiz ? 5 : 5;
      for (let k = 0; k < n; k++) { // fallen blocks
        const bx = x + 10 + rnd() * (w - 40), by = y + 10 + rnd() * (h - 34);
        g.save(); g.translate(bx, by); g.rotate(rr(-.4, .4)); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 5; g.shadowOffsetY = 3;
        g.fillStyle = stoneFill(g, 0, 0, 22, 14); g.fillRect(0, 0, rr(16, 26), rr(10, 16)); g.restore();
      }
      pillar(g, x + w * .18, y + h * .12, 18, h * .72, true); pillar(g, x + w * .74, y + h * .08, 18, h * .78, false);
      g.strokeStyle = '#8d8160'; g.lineWidth = 9; g.lineCap = 'butt'; g.beginPath(); g.arc(x + w * .46, y + h * .75, w * .22, 3.3, 6.1); g.stroke();
      mossBlobs(g, x, y, w, h, 60);
    }
    for (let k = 0; k < 4; k++) palm(g, x + rnd() * w, y + (k % 2 ? h : 0), rr(26, 38), 8);
    g.restore();
    g.strokeStyle = 'rgba(15,25,10,.65)'; g.lineWidth = 3; g.beginPath(); g.roundRect(x, y, w, h, 14); g.stroke();
  });
}
function paintInnerPool(g) {
  _seed = 77;
  const x = gx(4.05), y = gx(4.05), w = 6.9 * S, h = 6.9 * S;
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, 16); g.clip();
  g.fillStyle = '#1b4d2a'; g.fillRect(x, y, w, h);
  pond(g, x, y, w, h, 16);
  g.restore();
  // mossy corner islands with ruins
  [[4.1, 4.1], [9.3, 4.1], [4.1, 9.3], [9.3, 9.3]].forEach(([u, v]) => {
    const ix = gx(u), iy = gx(v), s = 1.6 * S;
    g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 12; g.shadowOffsetY = 5;
    g.fillStyle = stoneFill(g, ix, iy, s, s, '#857a5a'); g.beginPath(); g.roundRect(ix, iy, s, s, 12); g.fill(); g.restore();
    g.save(); g.beginPath(); g.roundRect(ix, iy, s, s, 12); g.clip();
    g.fillStyle = '#2c6a35'; g.fillRect(ix + 5, iy + 5, s - 10, s - 10);
    for (let k = 0; k < 14; k++) bush(g, ix + rnd() * s, iy + rnd() * s, 12, 5);
    g.restore();
  });
  torches.length = 0;
  [[4.85, 4.85], [10.15, 4.85], [4.85, 10.15], [10.15, 10.15]].forEach(([u, v]) => { const x0 = gx(u), y0 = gx(v); torch(g, x0, y0); torches.push([x0, y0 - 8]); });
  [[5.7, 4.0], [8.6, 4.0], [5.7, 10.3], [8.6, 10.3]].forEach(([u, v], i) => waterfall(g, gx(u), gx(v) - (i > 1 ? 0 : 0), .5 * S, .62 * S));
  [[5.3, 6.2], [9.7, 6.2], [5.3, 8.8], [9.7, 8.8]].forEach(([u, v]) => { pillar(g, gx(u) - 8, gx(v) - 24, 16, 34, true); });
  [[4.3, 4.3], [10.7, 4.3], [4.3, 10.7], [10.7, 10.7]].forEach(([u, v]) => palm(g, gx(u), gx(v), 30, 8));
}

/* ---------- Stone tiles and symbols ---------- */
function medallion(g, x, y, r, c1, c2) {
  g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 5; g.shadowOffsetY = 2;
  const gr = g.createRadialGradient(x - r * .3, y - r * .35, r * .1, x, y, r); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill(); g.restore();
  g.strokeStyle = '#3a2d14'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.stroke();
  g.strokeStyle = 'rgba(255,240,190,.55)'; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, r - 3, .2, 3.4); g.stroke();
}
function starPath(g, x, y, r1, r2, n, rot) {
  g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, d = i % 2 ? r2 : r1; g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); } g.closePath();
}
function glyph(g, kind, x, y, r) {
  g.save(); g.translate(x, y); g.strokeStyle = 'rgba(30,20,6,.8)'; g.fillStyle = 'rgba(30,20,6,.8)'; g.lineWidth = r * .16; g.lineCap = 'round';
  if (kind === 0) { g.beginPath(); g.arc(0, 0, r * .4, 0, 6.3); g.fill(); for (let i = 0; i < 8; i++) { const a = i * .785; g.beginPath(); g.moveTo(Math.cos(a) * r * .6, Math.sin(a) * r * .6); g.lineTo(Math.cos(a) * r * .9, Math.sin(a) * r * .9); g.stroke(); } }
  if (kind === 1) { for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(-r * .8, k * r * .38); g.quadraticCurveTo(-r * .4, k * r * .38 - r * .3, 0, k * r * .38); g.quadraticCurveTo(r * .4, k * r * .38 + r * .3, r * .8, k * r * .38); g.stroke(); } }
  if (kind === 2) { starPath(g, 0, 0, r * .85, r * .35, 5, -1.57); g.fill(); }
  if (kind === 3) { g.beginPath(); g.moveTo(-r * .7, r * .6); g.quadraticCurveTo(-r * .6, -r * .8, r * .7, -r * .7); g.quadraticCurveTo(r * .7, r * .6, -r * .7, r * .6); g.fill(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(-r * .6, r * .55); g.lineTo(r * .5, -r * .5); g.stroke(); }
  if (kind === 'q') { g.lineWidth = r * .22; g.beginPath(); g.arc(0, -r * .22, r * .36, Math.PI * 1.05, Math.PI * 2.55); g.lineTo(0, r * .3); g.stroke(); g.beginPath(); g.arc(0, r * .62, r * .1, 0, 6.3); g.fill(); }
  if (kind === 'gem') { g.beginPath(); for (let i = 0; i < 6; i++) { const a = i * 1.047 - 1.57; g.lineTo(Math.cos(a) * r * .8, Math.sin(a) * r * .8); } g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = r * .1; g.beginPath(); g.moveTo(0, -r * .8); g.lineTo(0, r * .15); g.lineTo(r * .7, -r * .4); g.moveTo(0, r * .15); g.lineTo(-r * .7, -r * .4); g.stroke(); }
  if (kind === 'star') { starPath(g, 0, 0, r * .85, r * .3, 4, -1.57); g.fill(); }
  if (kind === 'spike') { starPath(g, 0, 0, r * .9, r * .34, 8, 0); g.fill(); g.fillStyle = 'rgba(255,230,200,.8)'; g.beginPath(); g.arc(0, 0, r * .16, 0, 6.3); g.fill(); }
  g.restore();
}
function tileArt(g, n) {
  const s = S * .965, x = n.x - s / 2, y = n.y - s / 2;
  const spoke = n.zone === 'spoke' || n.zone === 'temple';
  const L = rr(56, 68), hue = spoke ? 52 : 40, sat = spoke ? 20 : 30;
  g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 6; g.shadowOffsetY = 3;
  const gr = g.createLinearGradient(x, y, x + s, y + s);
  gr.addColorStop(0, `hsl(${hue},${sat}%,${L + 8}%)`); gr.addColorStop(1, `hsl(${hue - 3},${sat - 4}%,${L - 10}%)`);
  g.fillStyle = gr; g.beginPath(); g.roundRect(x, y, s, s, 5); g.fill(); g.restore();
  g.save(); g.beginPath(); g.roundRect(x, y, s, s, 5); g.clip();
  for (let i = 0; i < 24; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '255,245,215' : '60,45,20'},${rr(.03, .09)})`; g.fillRect(x + rnd() * s, y + rnd() * s, rr(3, 12), rr(2, 8)); }
  g.strokeStyle = 'rgba(60,45,22,.55)'; g.lineWidth = 1;
  for (let k = rnd() * 2 | 0; k >= 0; k--) { let cx = x + rnd() * s, cy = y + rnd() * s; g.beginPath(); g.moveTo(cx, cy); for (let j = 0; j < 4; j++) { cx += rr(-8, 8); cy += rr(-8, 8); g.lineTo(cx, cy); } g.stroke(); }
  mossBlobs(g, x, y, s, 5, spoke ? 14 : 7); mossBlobs(g, x, y + s - 5, s, 5, 7); mossBlobs(g, x, y, 5, s, 6); mossBlobs(g, x + s - 5, y, 5, s, 6);
  g.restore();
  g.strokeStyle = 'rgba(45,32,14,.75)'; g.lineWidth = 1.6; g.beginPath(); g.roundRect(x, y, s, s, 5); g.stroke();
  g.strokeStyle = 'rgba(255,248,220,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 3, y + s - 4); g.lineTo(x + 3, y + 3); g.lineTo(x + s - 4, y + 3); g.stroke();
  g.strokeStyle = 'rgba(60,45,20,.28)'; g.lineWidth = 1; g.beginPath(); g.roundRect(x + 5, y + 5, s - 10, s - 10, 3); g.stroke();
  if (rnd() < .3) leaf(g, x + rr(2, s - 2), y + (rnd() < .5 ? 2 : s - 2), 9, rnd() * 6.28, 3, pick(GREENS.slice(2, 6)));
  const r = S * .31, t = n.type;
  if (t === 'lucky') { medallion(g, n.x, n.y, r, '#ffe08a', '#b8821f'); glyph(g, 'star', n.x, n.y, r); }
  else if (t === 'relic') { medallion(g, n.x, n.y, r * 1.08, '#d8bcff', '#5a2fa0'); glyph(g, 'gem', n.x, n.y, r * 1.05); g.strokeStyle = '#c9a6ff'; g.lineWidth = 2; g.beginPath(); g.arc(n.x, n.y, r * 1.3, 0, 6.3); g.stroke(); }
  else if (t === 'quiz') { medallion(g, n.x, n.y, r, '#8fd0f4', '#2a6fa6'); glyph(g, 'q', n.x, n.y, r); }
  else if (t === 'trap') { medallion(g, n.x, n.y, r, '#f0806a', '#a02a1a'); glyph(g, 'spike', n.x, n.y, r); }
  else if (t === 'start') { medallion(g, n.x, n.y, r * 1.12, shade(COLORS[n.startFor], 1.35), shade(COLORS[n.startFor], .62)); glyph(g, n.startFor, n.x, n.y, r * 1.1); g.strokeStyle = COLORS[n.startFor]; g.lineWidth = 2; g.beginPath(); g.arc(n.x, n.y, r * 1.35, 0, 6.3); g.stroke(); }
  else if (t === 'junction') { diamond(g, n.x, n.y, r * 1.05, '#4fd08a', '#14663a'); }
  else if (t === 'fork') { diamond(g, n.x, n.y, r * .95, '#ffa14a', '#a24a10'); }
  else if (t === 'gate') { for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(40,30,12,${.15 + i * .08})`; } g.fillStyle = 'rgba(52,232,160,.25)'; g.beginPath(); g.arc(n.x, n.y, r * .9, 0, 6.3); g.fill(); starPath(g, n.x, n.y, r * .8, r * .3, 4, .785); g.fillStyle = '#34e8a0'; g.fill(); }
  else if (rnd() < .35) { g.save(); g.translate(n.x, n.y); g.rotate(.785); g.strokeStyle = 'rgba(50,38,16,.5)'; g.lineWidth = 2; g.strokeRect(-r * .38, -r * .38, r * .76, r * .76); g.restore(); }
}
function diamond(g, x, y, r, c1, c2) {
  g.save(); g.translate(x, y); g.rotate(.785); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 5; g.shadowOffsetY = 2;
  const gr = g.createLinearGradient(-r, -r, r, r); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.beginPath(); g.roundRect(-r * .72, -r * .72, r * 1.44, r * 1.44, 4); g.fill(); g.restore();
  g.save(); g.translate(x, y); g.rotate(.785); g.strokeStyle = '#2a1e0a'; g.lineWidth = 2; g.strokeRect(-r * .72, -r * .72, r * 1.44, r * 1.44);
  g.strokeStyle = 'rgba(255,245,200,.7)'; g.lineWidth = 1.3; g.strokeRect(-r * .45, -r * .45, r * .9, r * .9); g.restore();
  g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(x, y, r * .12, 0, 6.3); g.fill();
}
function bridgeArt(g, A, Mid, B) {
  const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), wid = S * .86;
  g.save(); g.translate(A.x, A.y); g.rotate(ang);
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 10; g.shadowOffsetY = 6;
  g.fillStyle = '#3a2813'; g.fillRect(0, -wid / 2, len, wid); g.shadowColor = 'transparent';
  for (let p = 0; p < len; p += S * .24) {
    g.fillStyle = `hsl(${rr(24, 34)},${rr(40, 55)}%,${rr(30, 42)}%)`; g.fillRect(p + 1, -wid / 2 + 1, S * .22, wid - 2);
    g.fillStyle = 'rgba(255,225,170,.18)'; g.fillRect(p + 1, -wid / 2 + 1, S * .22, 2);
  }
  g.strokeStyle = '#d7c08a'; g.lineWidth = 3;
  [-1, 1].forEach(sd => { g.beginPath(); g.moveTo(0, sd * wid / 2); g.lineTo(len, sd * wid / 2); g.stroke(); g.strokeStyle = '#6b4a22'; g.lineWidth = 1.5; g.stroke(); g.strokeStyle = '#d7c08a'; g.lineWidth = 3;
    for (let p = 0; p <= len; p += len / 4) { g.fillStyle = '#5a3d1c'; g.fillRect(p - 3, sd * wid / 2 - 4, 6, 8); } });
  mossBlobs(g, 0, -wid / 2, len, wid, 30);
  g.restore();
  const r = S * .3; medallion(g, Mid.x, Mid.y, r, '#f0806a', '#a02a1a'); glyph(g, 'spike', Mid.x, Mid.y, r);
  vine(g, Mid.x - 12, Mid.y + 18, 20, 5);
}
function paintPaths(g) {
  _seed = 123;
  bridges.forEach(([A, Mid, B]) => bridgeArt(g, A, Mid, B));
  nodes.forEach(n => { if (n.type !== 'finish' && !n.bridge) tileArt(g, n); });
}
