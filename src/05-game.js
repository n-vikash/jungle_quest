/* ---------- Tunable settings ---------- */
const CONFIG = {
  odds: { enter: 40, normal: 30, challenge: 30 },   // relative weights for the shortcut event
  doorOdds: { enter: 50, normal: 50 },              // temple doors: shortcut or normal route only (no challenge)
  lapCheckpoints: 4,                                // green diamonds a pawn must touch before an inner shortcut opens (0 = no lap needed)
  forceOutcome: null, forceChallenge: null, forceChallengeWin: null,   // used by tests only
};
/* ---------- Helpers: timing, abort, audio, UI ---------- */
const $ = id => document.getElementById(id);
const ABORT = { abort: true };
let runId = 0, pendings = [];
const fast = () => (window.JQ_FAST ? 0.02 : 1);
const stale = id => id !== runId;
function waitFor(setup) { return new Promise((res, rej) => { pendings.push(rej); setup(res); }); }
function sleep(ms) { const my = runId; return new Promise((res, rej) => setTimeout(() => (stale(my) ? rej(ABORT) : res()), ms * fast())); }
function tween(ms, fn) {
  const my = runId; ms *= fast();
  return new Promise((res, rej) => { const t0 = performance.now(); (function step(now) { if (stale(my)) return rej(ABORT); const k = ms <= 0 ? 1 : Math.min(1, (now - t0) / ms); fn(k); k < 1 ? requestAnimationFrame(step) : res(); })(t0); });
}
let actx; function beep(f, d, type, vol) {
  if (window.JQ_FAST) return;
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
    o.type = type || 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(vol || .045, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d); } catch (e) {}
}
let toastT; function toast(msg, ms) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms || 1800); }
function logLine(msg, color) { const li = document.createElement('li'); li.textContent = msg; li.style.setProperty('--c', color || '#777'); $('log').prepend(li); while ($('log').children.length > 40) $('log').lastChild.remove(); }
function say(msg) { $('say').textContent = msg; }

function renderPlayers() {
  const box = $('players'); box.innerHTML = '';
  G.players.forEach((p, i) => {
    const d = document.createElement('div'); d.className = 'pl' + (i === activeId && !G.over ? ' turn' : ''); d.style.setProperty('--c', p.color);
    const st = p.skip ? 'Tangled' : p.shield ? 'Shielded' : (i === activeId && !G.over ? 'Turn' : '');
    d.innerHTML = `<i></i><div><b>${p.name}</b><small>${p.bot ? 'Bot' : 'Human'} · Relics ${p.relics.size}/${RELICS_NEEDED} · Lap ${Math.min(p.laps.size, CONFIG.lapCheckpoints)}/${CONFIG.lapCheckpoints}</small></div><em>${st}</em>`; box.appendChild(d);
  });
}
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function showDie(v) { const d = $('die'); d.innerHTML = ''; for (let i = 0; i < 9; i++) { const s = document.createElement('span'); if (v && PIPS[v].includes(i)) s.className = 'on'; d.appendChild(s); } }
showDie(0);

/* ---------- Dialogs ---------- */
function dialog(o) {
  return waitFor(res => {
    const c = $('dlgCard'); c.innerHTML = ''; const el = (t, cls, txt) => { const e = document.createElement(t); if (cls) e.className = cls; if (txt != null) e.textContent = txt; c.appendChild(e); return e; };
    if (o.glyph) { const b = el('div', 'big', o.glyph); b.style.color = o.color || 'var(--gold)'; }
    el('h3', '', o.title); if (o.text) el('p', '', o.text);
    let done = false; const close = v => { if (done) return; done = true; $('dlg').hidden = true; res(v); };
    if (o.options) {
      const box = el('div', 'opts'); const btns = [];
      o.options.forEach((t, i) => { const b = document.createElement('button'); b.className = 'opt'; b.textContent = t; box.appendChild(b); btns.push(b);
        b.onclick = () => { if (done || o.bot) return; reveal(i); }; });
      const reveal = i => { btns.forEach(b => b.disabled = true); btns[o.correct].classList.add('good'); if (i !== o.correct) btns[i].classList.add('bad'); beep(i === o.correct ? 700 : 180, .25, 'sine'); setTimeout(() => close(i === o.correct), 1100 * fast()); };
      if (o.bot) setTimeout(() => reveal(Math.random() < .6 ? o.correct : (o.correct + 1 + (Math.random() < .5 ? 0 : 1)) % o.options.length), 1400 * fast());
    } else {
      const b = el('button', '', o.button || 'Continue'); b.onclick = () => close(true); if (o.bot || o.auto) setTimeout(() => close(true), (o.wait || 1700) * fast()); b.focus && setTimeout(() => b.focus(), 50);
    }
    $('dlg').hidden = false; if (window.JQ_FAST) setTimeout(() => close(true), 5);
  });
}

/* ---------- Movement ---------- */
async function hop(p, id, ms) {
  const n = nodes[id], x0 = p.x, y0 = p.y; p.moving = true;
  await tween(ms || 230, k => { p.x = x0 + (n.x - x0) * k; p.y = y0 + (n.y - y0) * k; p.lift = Math.sin(k * Math.PI) * 16; });
  p.lift = 0; p.x = n.x; p.y = n.y; p.node = id; p.moving = false; beep(380 + Math.random() * 90, .07); renderPlayers();
}
async function fly(p, id) {
  const n = nodes[id], x0 = p.x, y0 = p.y; p.moving = true;
  await tween(800, k => { const e = k * k * (3 - 2 * k); p.x = x0 + (n.x - x0) * e; p.y = y0 + (n.y - y0) * e; p.lift = Math.sin(k * Math.PI) * 70; });
  p.lift = 0; p.x = n.x; p.y = n.y; p.node = id; p.moving = false; renderPlayers();
}
async function step(p, to, ms) {            // one pawn step, recording history and lap checkpoints
  p.hist.push(p.node); p.prev = p.node; await hop(p, to, ms);
  const nn = nodes[to];
  if (nn.zone === 'outer' && nn.type === 'junction' && !p.laps.has(to)) {
    p.laps.add(to); const k = Math.min(p.laps.size, CONFIG.lapCheckpoints);
    floatText(nn.x, nn.y, `Lap checkpoint ${k}/${CONFIG.lapCheckpoints}`, '#ffe08a'); renderPlayers();
    if (k === CONFIG.lapCheckpoints && CONFIG.lapCheckpoints) logLine(`${p.name} completed the outer lap`, p.color);
  }
}
const nextOptions = p => {
  let o = nodes[p.node].next.filter(i => i !== p.prev && !(nodes[i].type === 'gate' && p.relics.size < RELICS_NEEDED));
  if (!o.length) o = nodes[p.node].next.filter(i => i !== p.prev); return o.length ? o : nodes[p.node].next.slice(0, 1);
};
function goalDist(p) { // BFS back from the bot's current goal: uncollected relics, then the emerald
  const goals = p.relics.size < RELICS_NEEDED ? relicIds.filter(i => !p.relics.has(i)) : [F.id], d = new Array(nodes.length).fill(Infinity), q = goals.slice(); goals.forEach(i => d[i] = 0);
  const rev = nodes.map(() => []); nodes.forEach(n => n.next.forEach(k => { if (!(nodes[k].type === 'gate' && p.relics.size < RELICS_NEEDED)) rev[k].push(n.id); }));
  if (p.relics.size >= RELICS_NEEDED) shortcuts.forEach(s => { if (s.kind === 'door') rev[s.exit].push(s.entry); });   // an open door leads to the emerald
  for (let h = 0; h < q.length; h++) rev[q[h]].forEach(j => { if (d[j] === Infinity) { d[j] = d[q[h]] + 1; q.push(j); } }); return d;
}
async function choose(p, opts) {
  options = opts.slice(); const box = $('choices'); box.innerHTML = '';
  if (!p.bot) {
    say(`${p.name}, choose your path. Tap a glowing tile or a button.`); toast('Fork in the road: pick a path', 2600);
    const id = await waitFor(res => {
      const done = v => { cv.removeEventListener('pointerdown', onTap); box.innerHTML = ''; res(v); };
      const onTap = e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * W;
        let best = null, bd = S * 1.0; opts.forEach(i => { const d = Math.hypot(nodes[i].x - x, nodes[i].y - y); if (d < bd) { bd = d; best = i; } }); if (best != null) done(best); };
      cv.addEventListener('pointerdown', onTap);
      opts.forEach(i => { const b = document.createElement('button'); b.className = 'ghost'; b.textContent = labelFor(nodes[i]); b.onclick = () => done(i); box.appendChild(b); });
    });
    options = []; return id;
  }
  await sleep(650);
  let pick = opts[0];
  if (Math.random() < .8) { const gd = goalDist(p), sc = i => gd[i] + (nodes[i].type === 'trap' ? 2.5 : 0) + Math.random() * .8; pick = opts.slice().sort((a, b) => sc(a) - sc(b))[0]; } else pick = opts[Math.floor(Math.random() * opts.length)];
  options = []; return pick;
}
async function advance(p, steps) {
  for (let i = 0; i < steps; i++) {
    const opts = nextOptions(p); if (!opts.length || p.node === F.id) return;
    const to = opts.length > 1 ? await choose(p, opts) : opts[0];
    await step(p, to); if (to === F.id) return;
    if (nodes[to].shortcut && nodes[to].shortcut.kind === 'door') return;   // a door stops the move and rolls its event
    const nn = nodes[to]; if (nn.gateEntry && p.relics.size < RELICS_NEEDED && i === steps - 1) { floatText(nn.x, nn.y, `Gate sealed: ${p.relics.size}/${RELICS_NEEDED} relics`, '#ffb09a'); }
  }
}
async function retreat(p, n) {
  for (let i = 0; i < n && p.hist.length; i++) { const to = p.hist.pop(); p.prev = p.hist.length ? p.hist[p.hist.length - 1] : null; await hop(p, to, 200); }
}
async function sendHome(p) { p.hist = []; p.prev = null; p.skip = 0; await fly(p, startIds[p.seat]); }

/* ---------- Tile effects ---------- */
const CARDS = [
  { t: 'Monkey Shortcut', d: 'A friendly monkey swings you ahead 3 tiles.', fwd: 3 },
  { t: 'Eagle Tailwind', d: 'A strong wind pushes you ahead 2 tiles.', fwd: 2 },
  { t: 'Elephant Ride', d: 'A temple elephant carries you ahead 4 tiles.', fwd: 4 },
  { t: 'Golden Idol', d: 'The idol hums with power. Roll again!', again: true },
  { t: 'Spirit Shield', d: 'A glowing spirit will block your next trap.', shield: true },
  { t: 'Mossy Stumble', d: 'You slip on wet moss and slide back 2 tiles.', back: 2 },
];
const QUIZ = [
  ['Which is the largest land animal?', 'Elephant', 'Giraffe', 'Rhino'], ['Which rainforest is the largest on Earth?', 'Amazon', 'Congo', 'Daintree'],
  ['Which jungle bird can copy human speech?', 'Parrot', 'Eagle', 'Owl'], ['What is a group of crows called?', 'A murder', 'A parade', 'A choir'],
  ['What is a baby elephant called?', 'Calf', 'Cub', 'Foal'], ['Which gas do trees take in from the air?', 'Carbon dioxide', 'Helium', 'Neon'],
  ['Which big cat lives in the Amazon?', 'Jaguar', 'Lion', 'Snow leopard'], ['Which snake is heaviest?', 'Green anaconda', 'King cobra', 'Garter snake'],
  ['The Congo rainforest is on which continent?', 'Africa', 'Asia', 'Australia'], ['Which animal is famous for moving very slowly in trees?', 'Sloth', 'Monkey', 'Squirrel'],
  ['I have a trunk but I am no tree, and two long tusks. What am I?', 'An elephant', 'A walrus', 'A boat'], ['Chimpanzees belong to which animal group?', 'Apes', 'Lemurs', 'Baboons'],
  ['What do horses mostly eat?', 'Grass and hay', 'Meat', 'Fish'], ['Which animal has the longest neck?', 'Giraffe', 'Horse', 'Camel'],
];
async function captureCheck(p) {
  const n = nodes[p.node]; if (n.type === 'start' || n.type === 'gate' || n.id === F.id) return;
  for (const q of G.players) if (q !== p && q.node === p.node) { toast(`${p.name} sends ${q.name} home!`, 2200); logLine(`${p.name} sent ${q.name} back to the start`, p.color); floatText(n.x, n.y, 'Sent home!', '#ff9a8a'); beep(160, .3, 'sawtooth'); await sendHome(q); }
}
async function land(p, depth) {
  const n = nodes[p.node]; if (n.id === F.id) return;
  await captureCheck(p); if (depth > 3) return;
  const bot = p.bot;
  if (n.shortcut) { await shortcutEvent(p, n, depth); return; }
  if (n.type === 'relic' && !p.relics.has(n.id)) {
    p.relics.add(n.id); beep(660, .18, 'sine'); setTimeout(() => beep(990, .3, 'sine'), 140); floatText(n.x, n.y, `Relic ${p.relics.size}/${RELICS_NEEDED}`, '#d8bcff'); renderPlayers();
    logLine(`${p.name} found a relic (${p.relics.size}/${RELICS_NEEDED})`, p.color);
    await dialog({ glyph: '◆', color: '#c9a6ff', title: p.relics.size >= RELICS_NEEDED ? 'The Seal Breaks!' : 'Ancient Relic', text: p.relics.size >= RELICS_NEEDED ? 'All three relics are yours. The temple gates glow green for you.' : `You hold ${p.relics.size} of ${RELICS_NEEDED} relics. The temple gates stay sealed until you have all three.`, bot, wait: 1300 });
  } else if (n.type === 'lucky') {
    const c = CARDS[Math.floor(Math.random() * CARDS.length)]; beep(880, .25, 'sine'); floatText(n.x, n.y, 'Lucky draw!');
    await dialog({ glyph: '✦', title: c.t, text: c.d, bot }); logLine(`${p.name} drew ${c.t}`, p.color);
    if (c.fwd) { await advance(p, c.fwd); await land(p, depth + 1); } else if (c.back) { await retreat(p, c.back); await captureCheck(p); }
    else if (c.again) p.extra = true; else if (c.shield) { p.shield = true; renderPlayers(); }
  } else if (n.type === 'quiz') {
    const q = QUIZ[Math.floor(Math.random() * QUIZ.length)], ans = q.slice(1).sort(() => Math.random() - .5);
    floatText(n.x, n.y, 'Riddle!', '#9fd8ff');
    const ok = await dialog({ glyph: '?', color: '#7cc4f2', title: 'Temple Riddle', text: q[0], options: ans, correct: ans.indexOf(q[1]), bot });
    logLine(`${p.name} ${ok ? 'answered correctly' : 'answered wrongly'}`, p.color);
    if (ok) { toast('Correct! Move 2 tiles ahead.'); await advance(p, 2); await land(p, depth + 1); } else { toast('Wrong! Slip back 1 tile.'); await retreat(p, 1); await captureCheck(p); }
  } else if (n.type === 'trap') {
    if (p.shield) { p.shield = false; renderPlayers(); await dialog({ glyph: '☥', color: '#7cd6f2', title: 'Shield Shatters', text: 'Your spirit shield takes the blow.', bot }); return; }
    beep(150, .35, 'sawtooth'); floatText(n.x, n.y, 'Trap!', '#ff8a7a');
    if (n.bridge) { await dialog({ glyph: '☠', color: '#e0634a', title: 'The Rope Snaps!', text: 'The cursed plank gives way. You scramble back to the bridge entrance.', bot }); await retreat(p, 1); }
    else if (n.id % 2) { await dialog({ glyph: '☠', color: '#e0634a', title: 'Tangling Vines', text: 'Vines grip your ankles. You lose your next turn.', bot }); p.skip = 1; renderPlayers(); }
    else { await dialog({ glyph: '☠', color: '#e0634a', title: 'Falling Stones', text: 'Loose ruins tumble down and knock you back 3 tiles.', bot }); await retreat(p, 3); }
    logLine(`${p.name} hit a trap`, p.color); await captureCheck(p);
  }
}

/* ---------- Turns ---------- */
async function doRoll(p) {
  const btn = $('rollBtn');
  if (!p.bot) { say(`${p.name}, roll the die.`); btn.disabled = false; btn.focus(); await waitFor(res => { btn.onclick = () => { btn.disabled = true; res(); }; }); }
  else { say(`${p.name} is thinking...`); await sleep(750); }
  const v = 1 + Math.floor(Math.random() * 6); $('die').classList.add('roll');
  for (let i = 0; i < 7; i++) { showDie(1 + Math.floor(Math.random() * 6)); beep(300 + i * 40, .05, 'square', .02); await sleep(70); }
  showDie(v); $('die').classList.remove('roll'); return v;
}
async function turnLoop(my) {
  try {
    while (!G.over) {
      const p = G.players[G.turn]; activeId = G.turn; renderPlayers();
      if (p.skip) { p.skip--; logLine(`${p.name} is tangled and misses a turn`, p.color); toast(`${p.name} is tangled in vines`); say(`${p.name} misses this turn.`); await sleep(1200); G.turn = (G.turn + 1) % G.players.length; continue; }
      let again = true, sixes = 0;
      while (again && !G.over) {
        again = false; const v = await doRoll(p); logLine(`${p.name} rolled a ${v}`, p.color); say(`${p.name} moves ${v}.`);
        await advance(p, v); if (p.node !== F.id) await land(p, 0);
        if (p.node === F.id) { await win(p); return; }
        if (p.extra) { p.extra = false; again = true; toast('Roll again!'); } else if (v === 6 && ++sixes < 3) { again = true; toast('A six! Roll again.'); }
        await sleep(250);
      }
      G.turn = (G.turn + 1) % G.players.length;
    }
  } catch (e) { if (e !== ABORT) throw e; }
}
/* ---------- Victory ---------- */
const fxc = $('fx'), fg = fxc.getContext('2d'); let conf = [], confOn = false;
function confetti() {
  fxc.width = innerWidth; fxc.height = innerHeight; conf = []; confOn = true;
  for (let i = 0; i < 220; i++) conf.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * .6, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3, r: 3 + Math.random() * 5, c: ['#34e8a0', '#e6bb58', '#9dffd8', '#fff2c0', '#3ec46d'][i % 5], a: Math.random() * 6 });
  (function step() { fg.clearRect(0, 0, fxc.width, fxc.height); conf.forEach(c => { c.x += c.vx + Math.sin(c.a += .08); c.y += c.vy; fg.save(); fg.translate(c.x, c.y); fg.rotate(c.a); fg.fillStyle = c.c; fg.fillRect(-c.r, -c.r / 2, c.r * 2, c.r); fg.restore(); });
    conf = conf.filter(c => c.y < innerHeight + 20); if (conf.length && confOn) requestAnimationFrame(step); else fg.clearRect(0, 0, fxc.width, fxc.height); })();
}
async function win(p) {
  G.over = true; renderPlayers(); beep(523, .2, 'sine'); setTimeout(() => beep(659, .2, 'sine'), 180); setTimeout(() => beep(784, .5, 'sine'), 360);
  logLine(`${p.name} claimed the emerald!`, p.color); say(`${p.name} wins!`); confetti();
  for (let i = 0; i < 80; i++) fx.sparks.push({ x: CX + (Math.random() - .5) * S * 2, y: CY, vy: -1 - Math.random() * 2, vx: (Math.random() - .5) * 2, life: 1 });
  await dialog({ glyph: '◆', color: '#34e8a0', title: `${p.name} Claims the Emerald!`, text: 'The curse is broken and the temple falls silent. What a quest.', button: 'Play Again' });
  confOn = false; openMenu();
}
