/* ---------- Menu, legend, start ---------- */
const choices = document.createElement('div'); choices.id = 'choices'; choices.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:10px'; $('say').after(choices);
const cfg = { n: 2, bots: [false, true, true, true] };
function seatsFor(n) { return n === 2 ? [0, 2] : n === 3 ? [0, 1, 2] : [0, 1, 2, 3]; }
function makePlayers(n, bots) {
  return seatsFor(n).map((seat, i) => { const nd = nodes[startIds[seat]];
    return { i, seat, name: NAMES[seat], color: COLORS[seat], bot: !!bots[i], node: nd.id, x: nd.x, y: nd.y, relics: new Set(), laps: new Set(), eventBusy: false, hist: [], prev: null, shield: false, skip: 0, extra: false, moving: false, lift: 0 }; });
}
function renderMenu() {
  const cnt = $('cnt'); cnt.innerHTML = '';
  [2, 3, 4].forEach(n => { const b = document.createElement('button'); b.textContent = n + ' Explorers'; b.className = n === cfg.n ? 'sel' : 'ghost'; b.onclick = () => { cfg.n = n; renderMenu(); }; cnt.appendChild(b); });
  const box = $('setup'); box.innerHTML = '';
  seatsFor(cfg.n).forEach((seat, i) => {
    const r = document.createElement('div'); r.className = 'srow'; r.style.setProperty('--c', COLORS[seat]);
    r.innerHTML = `<i></i><span style="font-family:var(--f-ui);font-weight:700">${NAMES[seat]}</span>`;
    const b = document.createElement('button'); b.textContent = cfg.bots[i] ? 'Bot' : 'Human'; b.className = cfg.bots[i] ? 'ghost' : 'sel';
    b.onclick = () => { cfg.bots[i] = !cfg.bots[i]; renderMenu(); }; r.appendChild(b); box.appendChild(r);
  });
}
function cancelRun() { runId++; pendings.forEach(f => f(ABORT)); pendings = []; options = []; confOn = false; $('dlg').hidden = true; $('choices').innerHTML = ''; $('rollBtn').disabled = true; }
function openMenu() { cancelRun(); renderMenu(); $('menu').hidden = false; }
function startGame() {
  cancelRun(); $('menu').hidden = true; $('log').innerHTML = ''; showDie(0);
  G.players = makePlayers(cfg.n, cfg.bots); G.turn = 0; G.over = false; activeId = 0; renderPlayers();
  logLine('The expedition begins. Reach the emerald first!', '#e6bb58'); turnLoop(runId);
}
$('startBtn').onclick = startGame; $('newBtn').onclick = openMenu;
window.addEventListener('keydown', e => { if (e.key === ' ' && !$('rollBtn').disabled && $('dlg').hidden && $('menu').hidden) { e.preventDefault(); $('rollBtn').click(); } });

(function legend() {
  const items = [['lucky', 'Lucky draw'], ['quiz', 'Temple riddle'], ['trap', 'Trap'], ['junction', 'Go inside'], ['fork', 'Bridge shortcut'], ['relic', 'Relic'], ['gate', 'Temple door']];
  items.forEach(([t, label]) => {
    const d = document.createElement('div'), c = document.createElement('canvas'); c.width = c.height = 44; const g = c.getContext('2d'); const r = 15;
    if (t === 'lucky') { medallion(g, 22, 22, r, '#ffe08a', '#b8821f'); glyph(g, 'star', 22, 22, r); } else if (t === 'quiz') { medallion(g, 22, 22, r, '#8fd0f4', '#2a6fa6'); glyph(g, 'q', 22, 22, r); }
    else if (t === 'trap') { medallion(g, 22, 22, r, '#f0806a', '#a02a1a'); glyph(g, 'spike', 22, 22, r); } else if (t === 'junction') diamond(g, 22, 22, r, '#4fd08a', '#14663a');
    else if (t === 'fork') diamond(g, 22, 22, r, '#ffa14a', '#a24a10'); else if (t === 'relic') { medallion(g, 22, 22, r, '#d8bcff', '#5a2fa0'); glyph(g, 'gem', 22, 22, r); } else { g.fillStyle = 'rgba(52,232,160,.3)'; g.beginPath(); g.arc(22, 22, r, 0, 6.3); g.fill(); starPath(g, 22, 22, r * .9, r * .32, 4, .785); g.fillStyle = '#34e8a0'; g.fill(); }
    d.appendChild(c); d.appendChild(document.createTextNode(label)); $('legend').appendChild(d);
  });
})();
G.players = makePlayers(4, [false, false, false, false]); renderPlayers(); renderMenu();
