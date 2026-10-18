/* ---------- Canvas setup, live layer, pawns ---------- */
const cv = document.getElementById('board'), ctx = cv.getContext('2d');
const wrap = cv.parentElement;
let bg = null, bgSize = 0;
function layout() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2), size = Math.max(300, Math.min(1700, Math.round(wrap.clientWidth * dpr)));
  if (size === bgSize) return; bgSize = size; cv.width = cv.height = size;
  bg = document.createElement('canvas'); bg.width = bg.height = size;
  const g = bg.getContext('2d'); g.scale(size / W, size / W); paintBoard(g);
}
new ResizeObserver(layout).observe(wrap);

const fx = { sparks: [], flies: [], floaters: [] };
for (let i = 0; i < 26; i++) fx.flies.push({ x: Math.random() * W, y: Math.random() * W, a: Math.random() * 6.28, s: .15 + Math.random() * .3, p: Math.random() * 9 });
const evt = { focus: null, path: null };   // shortcut tile highlight and route glow
let options = [];            // nodes currently offered to the player
let activeId = -1;           // current player index
const G = { players: [], turn: 0 };
const RELICS_NEEDED = 3;

function drawGem(g, t) {
  const pulse = .5 + .5 * Math.sin(t / 700), r = S * .5;
  const aura = g.createRadialGradient(CX, CY, 4, CX, CY, S * (1.5 + pulse * .35));
  aura.addColorStop(0, `rgba(80,255,180,${.55 + pulse * .2})`); aura.addColorStop(1, 'rgba(80,255,180,0)');
  g.fillStyle = aura; g.beginPath(); g.arc(CX, CY, S * 2, 0, 6.3); g.fill();
  const pts = []; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; pts.push([CX + Math.cos(a) * r, CY + Math.sin(a) * r]); }
  const gr = g.createLinearGradient(CX - r, CY - r, CX + r, CY + r); gr.addColorStop(0, '#9dffd8'); gr.addColorStop(.45, '#22c986'); gr.addColorStop(1, '#046a45');
  g.save(); g.shadowColor = '#4dffb5'; g.shadowBlur = 18 + pulse * 10; g.fillStyle = gr; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); g.restore();
  g.strokeStyle = 'rgba(0,70,45,.75)'; g.lineWidth = 1.5; pts.forEach(p => { g.beginPath(); g.moveTo(CX, CY); g.lineTo(p[0], p[1]); g.stroke(); });
  g.strokeStyle = 'rgba(210,255,235,.8)'; g.lineWidth = 2; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.stroke();
  const inner = []; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; inner.push([CX + Math.cos(a) * r * .5, CY + Math.sin(a) * r * .5]); }
  g.fillStyle = 'rgba(190,255,225,.35)'; g.beginPath(); inner.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
  g.fillStyle = `rgba(255,255,255,${.7 + pulse * .3})`; g.beginPath(); g.ellipse(CX - r * .32, CY - r * .38, r * .2, r * .1, -.7, 0, 6.3); g.fill();
  if (Math.random() < .35) fx.sparks.push({ x: CX + (Math.random() - .5) * S, y: CY + (Math.random() - .5) * S * .6, vy: -.25 - Math.random() * .4, vx: (Math.random() - .5) * .3, life: 1 });
  fx.sparks = fx.sparks.filter(s => (s.life -= .012) > 0);
  fx.sparks.forEach(s => { s.x += s.vx; s.y += s.vy; g.fillStyle = `rgba(150,255,210,${s.life * .9})`; g.beginPath(); g.arc(s.x, s.y, 1.2 + s.life * 1.6, 0, 6.3); g.fill(); });
}
function drawTorch(g, x, y, t, i) {
  const f = .8 + .2 * Math.sin(t / 90 + i * 2) * Math.sin(t / 53 + i);
  const glow = g.createRadialGradient(x, y, 2, x, y, 46); glow.addColorStop(0, `rgba(255,170,60,${.42 * f})`); glow.addColorStop(1, 'rgba(255,140,40,0)');
  g.fillStyle = glow; g.beginPath(); g.arc(x, y, 46, 0, 6.3); g.fill();
  g.fillStyle = '#e8541a'; g.beginPath(); g.moveTo(x - 5, y + 2); g.quadraticCurveTo(x - 7, y - 8 * f, x + Math.sin(t / 120 + i) * 2, y - 17 * f); g.quadraticCurveTo(x + 7, y - 7 * f, x + 5, y + 2); g.fill();
  g.fillStyle = '#ffc24a'; g.beginPath(); g.moveTo(x - 3, y + 2); g.quadraticCurveTo(x - 3, y - 5, x, y - 11 * f); g.quadraticCurveTo(x + 4, y - 4, x + 3, y + 2); g.fill();
}
function drawPawn(g, x, y, col, bob, sc, label) {
  g.save(); g.translate(x, y - bob); g.scale(sc, sc);
  g.fillStyle = 'rgba(0,0,0,.4)'; g.save(); g.translate(0, bob / sc + 11); g.scale(1, .35); g.beginPath(); g.arc(0, 0, 11, 0, 6.3); g.fill(); g.restore();
  g.lineJoin = 'round';
  g.fillStyle = shade(col, .7); g.beginPath(); g.roundRect(-6, 4, 5, 8, 2); g.roundRect(1, 4, 5, 8, 2); g.fill();            // legs
  const body = g.createLinearGradient(-9, -8, 9, 8); body.addColorStop(0, shade(col, 1.25)); body.addColorStop(1, shade(col, .72));
  g.fillStyle = body; g.strokeStyle = 'rgba(15,10,3,.85)'; g.lineWidth = 1.6; g.beginPath(); g.roundRect(-8, -7, 16, 15, 5); g.fill(); g.stroke(); // torso
  g.fillStyle = '#3a2810'; g.fillRect(-8, 2, 16, 2.4); g.fillStyle = '#e6bb58'; g.fillRect(-1.5, 1.8, 3, 3);                    // belt
  g.fillStyle = '#5a3d1c'; g.beginPath(); g.roundRect(5, -6, 5, 10, 2); g.fill();                                              // pack
  g.fillStyle = '#efc79b'; g.strokeStyle = 'rgba(15,10,3,.85)'; g.beginPath(); g.arc(0, -12, 6.2, 0, 6.3); g.fill(); g.stroke();  // head
  g.fillStyle = '#1d140a'; g.fillRect(-3, -12, 1.6, 2.2); g.fillRect(1.6, -12, 1.6, 2.2);
  g.fillStyle = '#d9c28a'; g.beginPath(); g.ellipse(0, -16, 10.5, 3.4, 0, 0, 6.3); g.fill(); g.stroke();                       // hat brim
  g.beginPath(); g.moveTo(-6.4, -16); g.quadraticCurveTo(-6, -24, 0, -24); g.quadraticCurveTo(6, -24, 6.4, -16); g.closePath(); g.fillStyle = '#e8d49c'; g.fill(); g.stroke();
  g.fillStyle = col; g.fillRect(-6.1, -18.6, 12.2, 2.6);
  g.restore();
}
function pawnSpot(p) { // spread pawns that share a tile
  if (p.moving) return [p.x, p.y];
  const mates = G.players.filter(q => !q.moving && q.node === p.node); if (mates.length < 2) return [p.x, p.y];
  const i = mates.indexOf(p), a = i / mates.length * 6.28 - 2.3; return [p.x + Math.cos(a) * S * .22, p.y + Math.sin(a) * S * .16];
}
function labelFor(n) { return n.bridge ? 'Rope bridge' : n.type === 'gate' ? 'Temple door' : n.zone === 'spoke' ? 'Inward path' : n.zone === 'inner' ? 'Inner ring' : n.type === 'fork' ? 'Ring' : 'Straight on'; }
function drawLive(g, t) {
  fx.flies.forEach(f => { f.a += Math.sin(t / 900 + f.p) * .05; f.x += Math.cos(f.a) * f.s; f.y += Math.sin(f.a) * f.s; if (f.x < 0) f.x = W; if (f.x > W) f.x = 0; if (f.y < 0) f.y = W; if (f.y > W) f.y = 0;
    const a = .35 + .35 * Math.sin(t / 400 + f.p); const gl = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, 8); gl.addColorStop(0, `rgba(235,255,150,${a})`); gl.addColorStop(1, 'rgba(235,255,150,0)'); g.fillStyle = gl; g.fillRect(f.x - 8, f.y - 8, 16, 16); });
  torches.forEach((q, i) => drawTorch(g, q[0], q[1], t, i));
  drawGem(g, t);
  if (evt.path) {
    const pts = evt.path.ids.map(i => nodes[i]), a = .55 + .35 * Math.sin(t / 130);
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = `rgba(110,255,190,${a * .45})`; g.lineWidth = 22; g.beginPath(); pts.forEach((n, i) => i ? g.lineTo(n.x, n.y) : g.moveTo(n.x, n.y)); g.stroke();
    g.strokeStyle = '#d6ffe9'; g.lineWidth = 4; g.setLineDash([14, 12]); g.lineDashOffset = -t / 22; g.beginPath(); pts.forEach((n, i) => i ? g.lineTo(n.x, n.y) : g.moveTo(n.x, n.y)); g.stroke();
    g.restore(); pts.forEach(n => { g.fillStyle = `rgba(110,255,190,${a * .5})`; g.beginPath(); g.arc(n.x, n.y, S * .4, 0, 6.3); g.fill(); });
  }
  if (evt.focus) {
    const n = nodes[evt.focus.id], k = (t - evt.focus.t0) / 1000, pulse = .5 + .5 * Math.sin(t / 120);
    g.save(); g.translate(n.x, n.y); g.rotate(k * 1.2);
    for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.fillStyle = `rgba(255,224,130,${.35 + pulse * .3})`; g.beginPath(); g.moveTo(S * .55, -3); g.lineTo(S * (.95 + pulse * .15), 0); g.lineTo(S * .55, 3); g.fill(); }
    g.restore();
    g.strokeStyle = '#ffe08a'; g.lineWidth = 4; g.shadowColor = '#ffd45a'; g.shadowBlur = 16; g.beginPath(); g.arc(n.x, n.y, S * (.5 + pulse * .08), 0, 6.3); g.stroke(); g.shadowBlur = 0;
    g.font = '700 15px Cinzel, Georgia, serif'; g.textAlign = 'center'; const lab = !n.shortcut || n.shortcut.kind === 'bridge' ? 'SHORTCUT' : n.shortcut.kind === 'door' ? 'TEMPLE DOOR' : 'GO INSIDE', w = g.measureText(lab).width + 18, lx = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, n.x)), ly = n.y < 90 ? n.y + S * 1.2 : n.y - S * .95;
    g.fillStyle = 'rgba(30,20,4,.92)'; g.beginPath(); g.roundRect(lx - w / 2, ly - 14, w, 22, 11); g.fill(); g.strokeStyle = '#ffe08a'; g.lineWidth = 1.2; g.stroke(); g.fillStyle = '#ffe08a'; g.fillText(lab, lx, ly + 2);
  }
  const cur = G.players[activeId];
  nodes.forEach(n => { if (n.type === 'gate' && cur) { const open = cur.relics.size >= RELICS_NEEDED; g.strokeStyle = open ? 'rgba(90,255,190,.9)' : 'rgba(255,120,90,.9)'; g.lineWidth = 3; g.globalAlpha = .5 + .3 * Math.sin(t / 300); g.beginPath(); g.arc(n.x, n.y, S * .46, 0, 6.3); g.stroke(); g.globalAlpha = 1;
    if (!open) { g.fillStyle = 'rgba(30,8,4,.55)'; g.beginPath(); g.arc(n.x, n.y, S * .4, 0, 6.3); g.fill(); g.fillStyle = '#ffb09a'; g.fillRect(n.x - 7, n.y - 2, 14, 11); g.strokeStyle = '#ffb09a'; g.lineWidth = 2.5; g.beginPath(); g.arc(n.x, n.y - 3, 5, Math.PI, 0); g.stroke(); } } });
  relicIds.forEach(id => { const n = nodes[id]; G.players.forEach((p, k) => { if (p.relics.has(id)) { const a = k * 1.57 - .8; g.fillStyle = p.color; g.strokeStyle = '#120c04'; g.lineWidth = 1.5; g.beginPath(); g.arc(n.x + Math.cos(a) * S * .36, n.y + Math.sin(a) * S * .36, 5.5, 0, 6.3); g.fill(); g.stroke(); } }); });
  if (cur && !cur.moving && !G.over) { const n = nodes[cur.node]; g.strokeStyle = cur.color; g.lineWidth = 3; g.globalAlpha = .55 + .35 * Math.sin(t / 260); g.beginPath(); g.arc(n.x, n.y, S * .52, 0, 6.3); g.stroke(); g.globalAlpha = 1; }
  options.forEach(id => {
    const n = nodes[id], k = .5 + .5 * Math.sin(t / 220);
    g.fillStyle = `rgba(110,255,190,${.15 + k * .15})`; g.beginPath(); g.arc(n.x, n.y, S * .55, 0, 6.3); g.fill();
    g.strokeStyle = '#8dffc6'; g.lineWidth = 4; g.beginPath(); g.arc(n.x, n.y, S * (.5 + k * .08), 0, 6.3); g.stroke();
    const txt = labelFor(n); g.font = '700 15px Cinzel, Georgia, serif'; g.textAlign = 'center'; const w = g.measureText(txt).width + 16;
    let ly = n.y - S * .95; if (ly < 28) ly = n.y + S * 1.15; const lx = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, n.x));
    g.fillStyle = 'rgba(8,20,12,.9)'; g.beginPath(); g.roundRect(lx - w / 2, ly - 14, w, 22, 11); g.fill(); g.strokeStyle = '#8dffc6'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = '#e9ffe9'; g.fillText(txt, lx, ly + 2);
  });
  const order = G.players.map((p, i) => [p, i]).sort((a, b) => a[0].y - b[0].y);
  order.forEach(([p, i]) => {
    const [x, y] = pawnSpot(p), idle = (i === activeId && !p.moving) ? 2.5 + 2.5 * Math.sin(t / 220) : 0;
    drawPawn(g, x, y - 4, p.color, (p.lift || 0) + idle, 1.5);
    if (p.shield) { g.strokeStyle = 'rgba(120,230,255,.85)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 16 - (p.lift || 0), 20, 0, 6.3); g.stroke(); }
    if (p.skip) { g.fillStyle = 'rgba(40,120,50,.9)'; g.font = '700 13px Cinzel, serif'; g.textAlign = 'center'; g.fillText('tangled', x, y + 22); }
  });
  fx.floaters = fx.floaters.filter(f => (f.life -= .014) > 0);
  fx.floaters.forEach(f => { f.y -= .5; g.globalAlpha = Math.min(1, f.life * 1.6); g.font = '700 22px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = '#08140c'; g.strokeText(f.text, f.x, f.y); g.fillStyle = f.color; g.fillText(f.text, f.x, f.y); g.globalAlpha = 1; });
}
function floatText(x, y, text, color) { fx.floaters.push({ x, y: y - 30, text, color: color || '#ffe08a', life: 1.4 }); }
function frame(t) {
  if (!bg) layout();
  const k = cv.width / W; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0, cv.width, cv.height); ctx.setTransform(k, 0, 0, k, 0, 0);
  drawLive(ctx, t); requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
