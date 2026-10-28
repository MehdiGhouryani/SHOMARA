import { TOKENS } from '@math/design-system';

/**
 * Geometry of the learning path, ported from the approved page's script (pages-v1/05-path.html).
 * Pure data: every number comes from `tokens.ui.path`, so the screen and the tests share one source.
 */
const P = TOKENS.ui.path;

/** `done` includes sync-pending; `open` is reachable but not current; `download` still needs its content. */
export type StationNodeState = 'done' | 'cur' | 'open' | 'download' | 'lock';
export type NodeState = StationNodeState | 'chest';

export type ChapterInput = {
  /** Exactly five stations per chapter; the chest is placed by position, not by data. */
  stations: readonly StationNodeState[];
  /** Show the unit-jump offer right under this chapter's divider. */
  jumpOffer?: boolean;
};

export type SpacerRow = { kind: 'spacer'; chapter: number; height: number };
export type DividerRow = { kind: 'divider'; chapter: number; height: number };
export type JumpRow = { kind: 'jump'; chapter: number; height: number };
export type NodeRow = {
  kind: 'node';
  chapter: number;
  slot: number;
  /** Index within the chapter's five stations (null for the chest). */
  stationIndex: number | null;
  state: NodeState;
  height: number;
  /** Node center from the row top. */
  cy: number;
  /** Node center from the physical left edge. */
  x: number;
  dTop: string;
  dBot: string;
  topReached: boolean;
  botReached: boolean;
};
export type PathRow = SpacerRow | DividerRow | JumpRow | NodeRow;

export type PathLayout = {
  rows: PathRow[];
  /** Scroll offset at which each chapter begins (chapter 1 starts at 0). */
  starts: number[];
  /** Top of the current station's row, or null when no station is current. */
  curY: number | null;
  total: number;
};

/** Slot order inside a chapter: four stations, the chest, the fifth station. */
export const SLOTS = ['n', 'n', 'n', 'n', 'c', 'n'] as const;

const reached = (state: NodeState) => state === 'done' || state === 'cur' || state === 'open' || state === 'download';

export function buildPathLayout(chapters: readonly ChapterInput[], width: number = 2 * TOKENS.ui.path.xCenterDefault): PathLayout {
  const rows: PathRow[] = [{ kind: 'spacer', chapter: 0, height: P.topSpacer }];
  const starts: number[] = [];
  let y: number = P.topSpacer;
  let g = 0;
  let curY: number | null = null;

  chapters.forEach((chapter, ci) => {
    starts.push(ci === 0 ? 0 : y);
    if (ci > 0) {
      rows.push({ kind: 'divider', chapter: ci, height: P.dividerHeight });
      y += P.dividerHeight;
      if (chapter.jumpOffer) {
        rows.push({ kind: 'jump', chapter: ci, height: P.jumpOfferHeight });
        y += P.jumpOfferHeight;
      }
    }
    SLOTS.forEach((slot, si) => {
      const stationIndex = slot === 'c' ? null : si < 4 ? si : si - 1;
      const state: NodeState = slot === 'c' ? 'chest' : (chapter.stations[stationIndex as number] ?? 'lock');
      const isCurrent = state === 'cur';
      const height = isCurrent ? P.currentRowHeight : P.rowHeight;
      const cy = isCurrent ? P.currentNodeCenter : P.nodeCenter;
      const x = Math.round(width / 2 + P.x.amplitude * Math.sin(g * P.x.frequency + P.x.phase));
      g += 1;
      if (isCurrent) curY = y;
      rows.push({ kind: 'node', chapter: ci, slot: si, stationIndex, state, height, cy, x, dTop: '', dBot: '', topReached: false, botReached: false });
      y += height;
    });
  });
  rows.push({ kind: 'spacer', chapter: chapters.length - 1, height: P.bottomSpacer });

  // Curves: the lower half of a node joins the upper half of the next node of the same chapter.
  rows.forEach((row, j) => {
    if (row.kind !== 'node') return;
    const next = rows[j + 1];
    const prev = rows[j - 1];
    if (next && next.kind === 'node' && next.chapter === row.chapter) {
      const xm = Math.round((row.x + next.x) / 2);
      const mid = row.cy + (row.height - row.cy) * 0.5;
      row.dBot = `M ${row.x} ${row.cy} C ${row.x} ${mid} ${xm} ${mid} ${xm} ${row.height}`;
      row.botReached = reached(next.state);
    }
    if (prev && prev.kind === 'node' && prev.chapter === row.chapter) {
      const xm = Math.round((prev.x + row.x) / 2);
      const m = row.cy * 0.5;
      row.dTop = `M ${xm} 0 C ${xm} ${m} ${row.x} ${m} ${row.x} ${row.cy}`;
      row.topReached = reached(row.state);
    }
  });

  return { rows, starts, curY, total: y + P.bottomSpacer };
}

/** Which chapter's band to show for a scroll offset (the page switches 40px before a chapter starts). */
export function activeChapter(starts: readonly number[], scrollY: number): number {
  let active = 0;
  starts.forEach((s, i) => {
    if (scrollY + 40 >= s) active = i;
  });
  return active;
}

/** Scroll target for "go to the current station". */
export function jumpTarget(curY: number | null): number | null {
  return curY === null ? null : Math.max(0, curY - TOKENS.ui.path.fab.scrollOffset);
}
