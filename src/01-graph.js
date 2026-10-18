'use strict';
/* ---------- Board geometry (logical 1000x1000 canvas) ---------- */
const W = 1000, UNITS = 18.6, S = W / UNITS, M = 1.8 * S;
const px = (c, r) => [M + (c + 0.5) * S, M + (r + 0.5) * S];
const CX = W / 2, CY = W / 2;

/* ---------- Route graph: single source of truth for drawing AND rules ---------- */
const nodes = [];
const byCell = {};
function addNode(c, r, type, extra) {
  const [x, y] = px(c, r);
  const n = Object.assign({ id: nodes.length, c, r, x, y, type, next: [], zone: 'outer' }, extra || {});
  nodes.push(n); byCell[c + ',' + r] = n; return n;
}
const link = (a, b) => { if (!a.next.includes(b.id)) a.next.push(b.id); };

/* Outer ring: 56 tiles clockwise from top-left */
const outerCells = [];
for (let c = 0; c < 14; c++) outerCells.push([c, 0]);
for (let r = 0; r < 14; r++) outerCells.push([14, r]);
for (let c = 14; c > 0; c--) outerCells.push([c, 14]);
for (let r = 14; r > 0; r--) outerCells.push([0, r]);
const outerPattern = ['start','n','n','lucky','relic','quiz','n','junction','n','trap','lucky','n','fork','quiz'];
const outer = outerCells.map(([c, r], i) => addNode(c, r, outerPattern[i % 14], { zone: 'outer', ring: i }));
outer.forEach((n, i) => link(n, outer[(i + 1) % 56]));

/* Inner ring: 32 tiles clockwise from (3,3) */
const innerCells = [];
for (let c = 3; c < 11; c++) innerCells.push([c, 3]);
for (let r = 3; r < 11; r++) innerCells.push([11, r]);
for (let c = 11; c > 3; c--) innerCells.push([c, 11]);
for (let r = 11; r > 3; r--) innerCells.push([3, r]);
const innerPattern = ['relic','lucky','n','quiz','junction','trap','n','lucky'];
const inner = innerCells.map(([c, r], i) => addNode(c, r, innerPattern[i % 8], { zone: 'inner', ring: i }));
inner.forEach((n, i) => link(n, inner[(i + 1) % 32]));

/* Spokes join the outer and inner rings at each side's middle; gates lead to the emerald */
const sides = [
  { j: [7, 0], s: [[7, 1], [7, 2]], i: [7, 3], g: [7, 4] },
  { j: [14, 7], s: [[13, 7], [12, 7]], i: [11, 7], g: [10, 7] },
  { j: [7, 14], s: [[7, 13], [7, 12]], i: [7, 11], g: [7, 10] },
  { j: [0, 7], s: [[1, 7], [2, 7]], i: [3, 7], g: [4, 7] },
];
const F = addNode(7, 7, 'finish', { zone: 'temple' });
const spokes = [], gates = [], shortcuts = [];
sides.forEach(sd => {
  const J = byCell[sd.j], I = byCell[sd.i];
  const s1 = addNode(sd.s[0][0], sd.s[0][1], 'n', { zone: 'spoke' });
  const s2 = addNode(sd.s[1][0], sd.s[1][1], 'quiz', { zone: 'spoke' });
  const G = addNode(sd.g[0], sd.g[1], 'gate', { zone: 'temple' });
  /* The corridor is a one-way shortcut: entrance J (outer ring) -> s1 -> s2 -> exit I (inner ring).
     J has no ordinary edge into it. Interior tiles only link forward so a pawn pushed back onto one can still walk on. */
  const afterDoor = nodes[I.next[0]];             // the inner-ring tile after the corridor exit
  link(s1, s2); link(s2, I); link(I, G); link(G, afterDoor);   // normal route from a closed door: continue along the inner ring
  const door = { kind: 'door', name: 'Temple door', entry: G.id, path: [F.id], exit: F.id, intoInner: false };
  G.shortcut = door; shortcuts.push(door);       // shortcut route: door -> emerald
  I.type = 'n'; I.gateEntry = true;
  const sc = { kind: 'inner', name: 'Temple corridor', entry: J.id, path: [s1.id, s2.id, I.id], exit: I.id, intoInner: true };
  J.shortcut = sc; shortcuts.push(sc);
  spokes.push([J, s1, s2, I]); gates.push([I, G]);
});

/* Rope bridges cut each corner (from 2 tiles before the corner to 2 after) */
const bridges = [];
[[[12, 0], [13, 1], [14, 2]], [[14, 12], [13, 13], [12, 14]], [[2, 14], [1, 13], [0, 12]], [[0, 2], [1, 1], [2, 0]]].forEach(([a, m, b]) => {
  const A = byCell[a[0] + ',' + a[1]], B = byCell[b[0] + ',' + b[1]];
  const Mid = addNode(m[0], m[1], 'trap', { zone: 'bridge', bridge: true });
  link(Mid, B); bridges.push([A, Mid, B]);   // no ordinary edge from A into the bridge
  const sc = { kind: 'bridge', name: 'Rope bridge', entry: A.id, path: [Mid.id, B.id], exit: B.id, intoInner: false };
  A.shortcut = sc; shortcuts.push(sc);
});

/* Start tiles: one per corner */
const relicIds = nodes.filter(n => n.type === 'relic').map(n => n.id);
const startIds = [0, 14, 28, 42];
const COLORS = ['#d9453a', '#3f9be0', '#e8c13a', '#3ec46d'];
const NAMES = ['Ruby', 'Azure', 'Solis', 'Jade'];
nodes.forEach(n => { if (n.type === 'start') n.startFor = startIds.indexOf(n.id); });

/* Distance to the emerald along legal moves (used by bots and the progress readout) */
const dist = new Array(nodes.length).fill(Infinity);
dist[F.id] = 0;
for (let changed = true; changed;) {
  changed = false;
  nodes.forEach(n => n.next.forEach(k => { if (dist[k] + 1 < dist[n.id]) { dist[n.id] = dist[k] + 1; changed = true; } }));
}
