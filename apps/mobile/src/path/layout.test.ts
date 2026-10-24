import { describe, expect, it } from 'vitest';
import { activeChapter, buildPathLayout, jumpTarget, type ChapterInput, type NodeRow, type StationNodeState } from './layout';

/**
 * Reference: the approved page's own script (pages-v1/05-path.html), copied literally. The port must
 * produce the same positions, heights and curve strings for any chapter progress.
 */
type DesignChapter = { done: number; cur: number };
function designReference(CH: DesignChapter[]) {
  const slots = ['n', 'n', 'n', 'n', 'c', 'n'];
  const rows: any[] = [];
  const starts: number[] = [];
  let y = 20, g = 0, curY = 0;
  CH.forEach((c, ci) => {
    starts.push(ci === 0 ? 0 : y);
    if (ci > 0) { rows.push({ isDiv: true }); y += 88; }
    slots.forEach((s, si) => {
      const ni = si < 4 ? si : si - 1;
      let st: string;
      if (s === 'c') st = 'chest'; else if (ni < c.done) st = 'done'; else if (ni === c.cur) st = 'cur'; else st = 'lock';
      const h = st === 'cur' ? 208 : 132, cy = st === 'cur' ? 108 : 52, x = Math.round(195 + 64 * Math.sin(g * 0.9 + 3.4)); g++;
      if (st === 'cur') curY = y;
      rows.push({ isNode: true, ci, st, h, cy, x, ni, dTop: '', dBot: '', topCls: '', botCls: '' });
      y += h;
    });
  });
  const reachedFn = (r: any) => r.st === 'done' || r.st === 'cur';
  rows.forEach((r, j) => {
    if (!r.isNode) return;
    const nx = rows[j + 1], pv = rows[j - 1];
    if (nx && nx.isNode && nx.ci === r.ci) { const xm = Math.round((r.x + nx.x) / 2), mid = r.cy + (r.h - r.cy) * 0.5; r.dBot = 'M ' + r.x + ' ' + r.cy + ' C ' + r.x + ' ' + mid + ' ' + xm + ' ' + mid + ' ' + xm + ' ' + r.h; r.botCls = reachedFn(nx) ? 'done' : 'todo'; }
    if (pv && pv.isNode && pv.ci === r.ci) { const xm2 = Math.round((pv.x + r.x) / 2), m2 = r.cy * 0.5; r.dTop = 'M ' + xm2 + ' 0 C ' + xm2 + ' ' + m2 + ' ' + r.x + ' ' + m2 + ' ' + r.x + ' ' + r.cy; r.topCls = reachedFn(r) ? 'done' : 'todo'; }
  });
  return { nodes: rows.filter((r) => r.isNode), starts, curY, total: y + 48 };
}

function toInput(CH: DesignChapter[]): ChapterInput[] {
  return CH.map((c) => ({
    stations: Array.from({ length: 5 }, (_, ni): StationNodeState => (ni < c.done ? 'done' : ni === c.cur ? 'cur' : 'lock')),
  }));
}

const DESIGN: DesignChapter[] = [{ done: 2, cur: 2 }, { done: 0, cur: -1 }, { done: 0, cur: -1 }, { done: 0, cur: -1 }, { done: 0, cur: -1 }];

describe('path layout matches the approved page script', () => {
  const compare = (CH: DesignChapter[]) => {
    const ref = designReference(CH);
    const mine = buildPathLayout(toInput(CH), 390);
    const nodes = mine.rows.filter((r): r is NodeRow => r.kind === 'node');
    expect(nodes.length).toBe(ref.nodes.length);
    nodes.forEach((n, i) => {
      const r = ref.nodes[i];
      expect({ state: n.state, height: n.height, cy: n.cy, x: n.x, dTop: n.dTop, dBot: n.dBot }).toEqual({ state: r.st, height: r.h, cy: r.cy, x: r.x, dTop: r.dTop, dBot: r.dBot });
      expect(n.dTop === '' ? '' : n.topReached ? 'done' : 'todo').toBe(r.topCls);
      expect(n.dBot === '' ? '' : n.botReached ? 'done' : 'todo').toBe(r.botCls);
    });
    expect(mine.starts).toEqual(ref.starts);
    expect(mine.curY ?? 0).toBe(ref.curY);
    expect(mine.total).toBe(ref.total);
  };

  it('for the page example (chapter 1, two done, third current)', () => compare(DESIGN));
  it('for 200 pseudo-random progress states', () => {
    let seed = 7;
    const rnd = (n: number) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
    for (let k = 0; k < 200; k++) {
      const CH = Array.from({ length: 5 }, () => { const done = rnd(6); const cur = rnd(7) - 1; return { done, cur: cur >= 0 && cur < 5 && cur >= done ? cur : -1 }; });
      compare(CH);
    }
  });
  it('places the chest in the fifth slot and five stations around it', () => {
    const nodes = buildPathLayout(toInput(DESIGN)).rows.filter((r): r is NodeRow => r.kind === 'node');
    expect(nodes.length).toBe(30);
    expect(nodes.filter((n) => n.state === 'chest').length).toBe(5);
    expect(nodes.slice(0, 6).map((n) => n.stationIndex)).toEqual([0, 1, 2, 3, null, 4]);
  });
});

describe('path layout adapts to the screen and to the app states', () => {
  it('centers the zigzag on the actual width', () => {
    const narrow = buildPathLayout(toInput(DESIGN), 360).rows.filter((r): r is NodeRow => r.kind === 'node');
    const wide = buildPathLayout(toInput(DESIGN), 390).rows.filter((r): r is NodeRow => r.kind === 'node');
    narrow.forEach((n, i) => expect(n.x).toBe(wide[i]!.x - 15));
  });
  it('treats open and download stations as reached for the curves', () => {
    const l = buildPathLayout([{ stations: ['done', 'open', 'download', 'lock', 'lock'] }]);
    const n = l.rows.filter((r): r is NodeRow => r.kind === 'node');
    expect(n[1]!.topReached).toBe(true); // open
    expect(n[2]!.topReached).toBe(true); // download
    expect(n[3]!.topReached).toBe(false); // lock
    expect(n[4]!.topReached).toBe(false); // chest is never "reached"
    expect(n[5]!.topReached).toBe(false); // lock
  });
  it('adds a jump row without moving chapter starts relative to their divider', () => {
    const plain = buildPathLayout(toInput(DESIGN));
    const withJump = buildPathLayout(toInput(DESIGN).map((c, i) => (i === 1 ? { ...c, jumpOffer: true } : c)));
    expect(withJump.starts[1]).toBe(plain.starts[1]);
    expect(withJump.starts[2]).toBe(plain.starts[2]! + 72);
    expect(withJump.total).toBe(plain.total + 72);
  });
  it('has no current station when everything is locked or done', () => {
    expect(buildPathLayout([{ stations: ['done', 'done', 'done', 'done', 'done'] }]).curY).toBeNull();
    expect(jumpTarget(null)).toBeNull();
  });
  it('switches the chapter band 40px before the chapter starts and scrolls to 160px above the current row', () => {
    const l = buildPathLayout(toInput(DESIGN));
    expect(activeChapter(l.starts, 0)).toBe(0);
    expect(activeChapter(l.starts, l.starts[1]! - 41)).toBe(0);
    expect(activeChapter(l.starts, l.starts[1]! - 40)).toBe(1);
    expect(jumpTarget(284)).toBe(124);
    expect(jumpTarget(100)).toBe(0);
  });
});
