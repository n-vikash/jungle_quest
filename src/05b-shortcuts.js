/* ---------- Shortcut random event ---------- */
const EVENT_LOG = [];
const OUTCOMES = {
  enter:     { short: 'Shortcut',     icon: '→', color: '#6cf0b0' },
  normal:    { short: 'Normal Route', icon: '↻', color: '#e6bb58' },
  challenge: { short: 'Challenge',    icon: '!',      color: '#ff8a6a' },
};
function rollOutcome(sc) {                     // decided here, before any animation plays
  const door = sc && sc.kind === 'door';
  if (CONFIG.forceOutcome) return door && CONFIG.forceOutcome === 'challenge' ? 'normal' : CONFIG.forceOutcome;
  if (door) return Math.random() * (CONFIG.doorOdds.enter + CONFIG.doorOdds.normal) < CONFIG.doorOdds.enter ? 'enter' : 'normal';
  const o = CONFIG.odds, total = o.enter + o.normal + o.challenge; let r = Math.random() * total;
  if ((r -= o.enter) < 0) return 'enter'; if ((r -= o.normal) < 0) return 'normal'; return 'challenge';
}
const goesInside = sc => sc.kind !== 'bridge';     // temple doors and inner corridors say "Go Inside"; only rope bridges stay "Shortcut"
const canUseShortcut = (p, sc) => sc.kind === 'door' ? p.relics.size >= RELICS_NEEDED : (!sc.intoInner || p.laps.size >= CONFIG.lapCheckpoints);

async function eventReel(p, sc, rolled, final, note) {
  const door = sc.kind === 'door', inside = goesInside(sc), keys = door ? ['enter', 'normal'] : Object.keys(OUTCOMES), N = keys.length, card = $('dlgCard'); card.innerHTML = '';
  const mk = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; card.appendChild(e); return e; };
  mk('div', 'big', '◇').style.color = '#e6bb58'; mk('h3', '', door ? 'Temple Door' : inside ? 'Way Inside' : 'Shortcut Event');
  mk('p', '', door ? `${p.name} stands at the temple door. Fate decides...` : inside ? `${p.name} reached a way into the temple. Fate decides...` : `${p.name} landed on a shortcut tile. Fate decides your way...`);
  const row = mk('div', 'reelrow'); row.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
  const cells = keys.map(k => { const c = document.createElement('div'); c.className = 'reel'; c.style.setProperty('--c', OUTCOMES[k].color); c.innerHTML = `<b>${OUTCOMES[k].icon}</b><span>${inside && k === 'enter' ? 'Go Inside' : OUTCOMES[k].short}</span>`; row.appendChild(c); return c; });
  const verdict = mk('p', 'verdict', ' '); $('dlg').hidden = false;
  const mark = i => cells.forEach((c, j) => c.classList.toggle('on', j === i));
  const target = keys.indexOf(rolled), L = 13, start = (((target - L) % N) + N) % N;
  for (let i = 0; i <= L; i++) { mark((start + i) % N); beep(280 + (i % 3) * 110, .05, 'square', .02); await sleep(55 + i * i * 2.4); }
  cells[target].classList.add('lock'); beep(740, .25, 'sine');
  const say2 = door ? { enter: 'The door swings open! Go inside to the emerald.', normal: 'The door stays shut. Continue on the normal route.' }
    : inside ? { enter: 'The way is open! Go inside the temple.', normal: 'The way stays closed. Continue on the normal route.', challenge: 'A challenge blocks the way!' }
    : { enter: `Shortcut unlocked! Taking the ${sc.name}.`, normal: 'No shortcut. Stay on the normal route.', challenge: 'A challenge blocks the way!' };
  verdict.textContent = say2[rolled]; await sleep(note ? 1000 : 1100);
  if (final !== rolled) {                      // not eligible: fall back to the normal route
    cells[target].classList.remove('lock'); mark(keys.indexOf(final)); cells[keys.indexOf(final)].classList.add('lock');
    verdict.textContent = note; verdict.classList.add('bad'); beep(200, .3, 'sawtooth'); await sleep(1500);
  }
  $('dlg').hidden = true;
}
async function takeShortcut(p, sc, depth) {
  evt.path = { ids: [sc.entry, ...sc.path], t0: performance.now() }; toast(goesInside(sc) ? 'The way is open! Going inside...' : `${sc.name} unlocked!`, 1800); beep(600, .15, 'sine'); setTimeout(() => beep(900, .25, 'sine'), 120);
  await sleep(700);
  for (const id of sc.path) await step(p, id, 190);   // walk the real route to its defined exit
  await sleep(250); evt.path = null;
  logLine(goesInside(sc) ? `${p.name} went inside the temple` : `${p.name} took the ${sc.name.toLowerCase()}`, p.color);
  await land(p, depth + 1);                            // resolve the exit tile like any other landing
}
async function shortcutEvent(p, n, depth) {
  if (p.eventBusy) return;                              // one resolution per landing
  p.eventBusy = true; const sc = n.shortcut;
  try {
    const rolled = rollOutcome(sc); let final = rolled, note = '';
    if (rolled === 'enter' && !canUseShortcut(p, sc)) { final = 'normal'; note = sc.kind === 'door' ? `The door is sealed until you hold ${RELICS_NEEDED} relics. Staying on the normal route.` : `The way inside is sealed. Touch all four green diamonds first (${p.laps.size}/${CONFIG.lapCheckpoints}). Staying on the normal route.`; }
    const kind = final === 'challenge' ? (CONFIG.forceChallenge || ['log', 'relic', 'croc'][Math.floor(Math.random() * 3)]) : null;
    EVENT_LOG.push({ player: p.name, tile: n.id, rolled, outcome: final, kind });
    evt.focus = { id: n.id, t0: performance.now() };
    say(sc.kind === 'door' ? `${p.name} reached a temple door...` : goesInside(sc) ? `${p.name} reached a way inside...` : `${p.name} landed on a shortcut tile...`); beep(520, .12, 'triangle');
    await sleep(900);                                   // movement paused, shortcut symbol highlighted on the open board
    await eventReel(p, sc, rolled, final, note);
    if (final === 'enter') await takeShortcut(p, sc, depth);
    else if (final === 'normal') { logLine(sc.kind === 'door' ? `${p.name} found the door shut` : goesInside(sc) ? `${p.name} found the way closed` : `${p.name} stayed on the normal route`, p.color); toast('Staying on the normal route', 1500); await sleep(500); }
    else await runChallenge(p, kind, depth);
  } finally { p.eventBusy = false; evt.focus = null; evt.path = null; }
}

/* ---------- Challenges ---------- */
const CHALLENGES = {
  log:   { title: 'Rolling Log Escape', rule: 'Jump over the rolling logs. Clear at least 2 of 3.',                      win: 'Dash ahead 2 tiles.',           lose: 'Knocked back 2 tiles.' },
  relic: { title: 'Relic Rush',         rule: 'Tap each relic before it vanishes. Grab 4 in 8 seconds.',                  win: 'You gain a relic.',             lose: 'No penalty.' },
  croc:  { title: 'Crocodile Crossing', rule: 'Hop across 3 rows of stones. Avoid the stone where crocodile eyes surface.', win: 'Dash ahead 3 tiles.',           lose: 'The crocodile snaps. Miss your next turn.' },
};
async function runChallenge(p, kind, depth) {
  const c = CHALLENGES[kind]; logLine(`${p.name} faces ${c.title}`, p.color);
  const win = await playChallenge(kind, p, c);
  logLine(`${p.name} ${win ? 'won' : 'lost'} ${c.title}`, p.color);
  if (kind === 'log') { if (win) { await advance(p, 2); await land(p, depth + 1); } else { await retreat(p, 2); await captureCheck(p); } }
  else if (kind === 'relic') { if (win) { const free = relicIds.filter(i => !p.relics.has(i)); if (free.length) { p.relics.add(free[Math.floor(Math.random() * free.length)]); renderPlayers(); floatText(p.x, p.y, `Relic ${p.relics.size}/${RELICS_NEEDED}`, '#d8bcff'); } } }
  else { if (win) { await advance(p, 3); await land(p, depth + 1); } else { p.skip = 1; renderPlayers(); } }
}
function playChallenge(kind, p, c) {
  return waitFor(res => {
    const card = $('dlgCard'); card.innerHTML = '';
    const mk = (t, cls, x) => { const e = document.createElement(t); if (cls) e.className = cls; if (x != null) e.textContent = x; card.appendChild(e); return e; };
    mk('h3', '', c.title); mk('p', '', c.rule);
    const stakes = mk('p', 'stakes'); stakes.innerHTML = `<span class="g">Win: ${c.win}</span><span class="r">Lose: ${c.lose}</span>`;
    const stage = mk('div', 'stage2'), status = mk('p', 'verdict', ' '); let done = false; $('dlg').hidden = false;
    const alive = () => !done && !$('dlg').hidden;
    const finish = win => { if (done) return; done = true; status.textContent = win ? 'Success! ' + c.win : 'Failed. ' + c.lose; status.className = 'verdict ' + (win ? 'good' : 'bad'); beep(win ? 760 : 170, .3, win ? 'sine' : 'sawtooth'); setTimeout(() => { $('dlg').hidden = true; res(win); }, 1400 * fast()); };
    if (p.bot || window.JQ_FAST) {
      stage.innerHTML = `<div class="botnote">${p.name} attempts the challenge...</div>`;
      setTimeout(() => finish(CONFIG.forceChallengeWin != null ? CONFIG.forceChallengeWin : Math.random() < .55), p.bot ? 1900 * fast() : 5); return;
    }
    ({ log: gameLog, relic: gameRelic, croc: gameCroc })[kind](stage, alive, finish, p);
  });
}
function gameLog(stage, alive, finish, p) {
  const c = document.createElement('canvas'); c.width = 520; c.height = 190; c.className = 'logcv'; stage.appendChild(c); const g = c.getContext('2d');
  const btn = document.createElement('button'); btn.textContent = 'Jump (Space)'; btn.className = 'jumpbtn'; stage.appendChild(btn);
  const GY = 158; let y = 0, vy = 0, hits = 0, last = performance.now(), flash = 0, hurt = 0;
  const logs = [0, 1, 2].map(i => ({ x: 680 + i * 310, hit: false, done: false, rot: 0, v: 290 + i * 45 }));
  const jump = () => { if (y === 0) { vy = 640; beep(500, .08, 'triangle'); } };
  c.onpointerdown = jump; btn.onclick = jump;
  const key = e => { if (e.code === 'Space') { e.preventDefault(); jump(); } }; addEventListener('keydown', key);
  (function loop(now) {
    if (!alive()) { removeEventListener('keydown', key); return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (y > 0 || vy > 0) { y += vy * dt; vy -= 1900 * dt; if (y <= 0) { y = 0; vy = 0; } }
    logs.forEach(L => { L.x -= L.v * dt; L.rot += dt * 7; if (!L.hit && Math.abs(L.x - 96) < 30 && y < 34) { L.hit = true; hits++; hurt = 1; beep(150, .2, 'sawtooth'); } if (!L.done && L.x < 30) L.done = true; });
    hurt = Math.max(0, hurt - dt * 2);
    const sky = g.createLinearGradient(0, 0, 0, 190); sky.addColorStop(0, '#1d5a3a'); sky.addColorStop(1, '#0e2c1c'); g.fillStyle = sky; g.fillRect(0, 0, 520, 190);
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(20,70,35,.55)'; g.beginPath(); g.ellipse(40 + i * 100, 40 + (i % 2) * 14, 46, 30, 0, 0, 6.3); g.fill(); }
    g.fillStyle = '#6b5e43'; g.fillRect(0, GY + 8, 520, 40); g.fillStyle = '#8d8160'; g.fillRect(0, GY + 8, 520, 6);
    logs.forEach(L => { g.save(); g.translate(L.x, GY - 12); g.rotate(-L.rot); const lg = g.createRadialGradient(-4, -4, 2, 0, 0, 24); lg.addColorStop(0, '#c9965a'); lg.addColorStop(1, '#5a3a1a'); g.fillStyle = lg; g.beginPath(); g.arc(0, 0, 22, 0, 6.3); g.fill(); g.strokeStyle = '#3a2410'; g.lineWidth = 2; g.stroke(); g.beginPath(); g.arc(0, 0, 13, 0, 6.3); g.arc(0, 0, 6, 0, 6.3); g.stroke(); g.restore(); });
    g.save(); if (hurt > 0) g.globalAlpha = .5 + .5 * Math.sin(now / 40); drawPawn(g, 96, GY - 4 - y, p.color, 0, 1.9); g.restore();
    g.fillStyle = '#fff'; g.font = '700 14px Cinzel, serif'; g.fillText(`Logs cleared: ${logs.filter(L => L.done && !L.hit).length}/3`, 12, 22);
    if (logs.every(L => L.done)) { removeEventListener('keydown', key); finish(hits <= 1); return; }
    requestAnimationFrame(loop);
  })(performance.now());
}
function gameRelic(stage, alive, finish) {
  const info = document.createElement('div'); info.className = 'rinfo'; const grid = document.createElement('div'); grid.className = 'rgrid'; stage.append(info, grid);
  let score = 0, left = 8, cur = -1; const cells = [];
  const upd = () => { info.textContent = `Relics ${score}/4   ·   Time ${left}s`; cells.forEach((b, i) => b.classList.toggle('on', i === cur)); };
  for (let i = 0; i < 9; i++) { const b = document.createElement('button'); b.className = 'rcell'; b.setAttribute('aria-label', 'Stone ' + (i + 1));
    b.onclick = () => { if (!alive()) return; if (i === cur) { score++; cur = -1; beep(700 + score * 90, .12, 'sine'); upd(); if (score >= 4) finish(true); } else { b.classList.add('miss'); setTimeout(() => b.classList.remove('miss'), 200); } };
    cells.push(b); grid.appendChild(b); }
  const move = () => { if (!alive()) return; let n; do { n = Math.floor(Math.random() * 9); } while (n === cur); cur = n; upd(); setTimeout(move, 780); };
  const tick = setInterval(() => { if (!alive()) { clearInterval(tick); return; } left--; upd(); if (left <= 0) { clearInterval(tick); finish(score >= 4); } }, 1000);
  upd(); setTimeout(move, 500);
}
function gameCroc(stage, alive, finish) {
  const rows = 3, croc = Array.from({ length: rows }, () => Math.floor(Math.random() * 3)); let cur = rows - 1; const stones = [];
  const water = document.createElement('div'); water.className = 'water'; stage.appendChild(water);
  for (let r = 0; r < rows; r++) { const row = document.createElement('div'); row.className = 'stonerow'; stones[r] = [];
    for (let j = 0; j < 3; j++) { const b = document.createElement('button'); b.className = 'stone'; b.setAttribute('aria-label', `Row ${rows - r}, stone ${j + 1}`); b.innerHTML = '<i class="eyes"></i>';
      b.onclick = () => { if (!alive() || r !== cur) return;
        if (j === croc[r]) { b.classList.add('chomp'); b.firstChild.style.opacity = 1; finish(false); }
        else { b.classList.add('safe'); beep(520 + (rows - r) * 80, .1, 'sine'); cur--; stones.forEach((rw, k) => rw.forEach(s => s.classList.toggle('now', k === cur))); if (cur < 0) finish(true); } };
      stones[r].push(b); row.appendChild(b); }
    water.appendChild(row); }
  stones[cur].forEach(s => s.classList.add('now'));
  const blink = () => { if (!alive()) return; if (cur >= 0) { const e = stones[cur][croc[cur]].firstChild; e.classList.add('show'); setTimeout(() => e.classList.remove('show'), 450); } setTimeout(blink, 1500); };
  setTimeout(blink, 400);
}
