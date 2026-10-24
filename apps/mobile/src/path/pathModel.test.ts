import { describe, expect, it } from 'vitest';
import { G1_STATIONS, G1_UNITS, buildPathFocus, deriveStationStatus, type ProgressionNodeStatus } from '@math/contracts';
import { buildChapterViews, chapterKicker, chapterTitle, gradeChipLabel, jumpOfferUnitIds, ringFraction, stationNodeState } from './pathModel';
import { buildPathLayout } from './layout';

/** Statuses for the real G1 path with the first `n` stations completed and everything downloaded. */
function statusesAfter(n: number, downloaded: readonly string[] = G1_STATIONS.map((s) => s.id)) {
  const completed = G1_STATIONS.slice(0, n).map((s) => s.id);
  const statuses: Record<string, ProgressionNodeStatus> = {};
  for (const station of G1_STATIONS) {
    statuses[station.id] = deriveStationStatus({ station, completedStationIds: completed, downloadedStationIds: [...downloaded], jumpUnlockedStationIds: [] });
  }
  const focus = buildPathFocus({ stations: G1_STATIONS.map((s) => ({ id: s.id, number: s.number, title: s.title })), statuses }).focus?.id ?? null;
  return { statuses, focus, completed: new Set(completed) };
}

describe('status to node state', () => {
  it('draws completed, locked, the focus and the rest', () => {
    expect(stationNodeState('COMPLETED', false)).toBe('done');
    expect(stationNodeState('LOCKED', false)).toBe('lock');
    expect(stationNodeState('CURRENT', true)).toBe('cur');
    expect(stationNodeState('NOT_DOWNLOADED', true)).toBe('cur');
    expect(stationNodeState('NOT_DOWNLOADED', false)).toBe('download');
    expect(stationNodeState('AVAILABLE', false)).toBe('open');
    expect(stationNodeState('SYNC_PENDING', false)).toBe('open');
  });
});

describe('chapters from the real G1 contract', () => {
  const noJump = new Set<string>();
  const none = () => undefined;

  it('has five chapters of five stations in contract order', () => {
    const { statuses, focus } = statusesAfter(0);
    const chapters = buildChapterViews({ statuses, focusStationId: focus, jumpOffers: noJump, onJump: none });
    expect(chapters).toHaveLength(5);
    expect(chapters.map((c) => c.stations.length)).toEqual([5, 5, 5, 5, 5]);
    expect(chapters.flatMap((c) => c.stations.map((s) => s.id))).toEqual(G1_STATIONS.map((s) => s.id));
  });
  it('shows the first chapter with its world name and a kicker', () => {
    const { statuses, focus } = statusesAfter(0);
    const [first] = buildChapterViews({ statuses, focusStationId: focus, jumpOffers: noJump, onJump: none });
    expect(first!.title).toBe('دره‌ی عددها');
    expect(first!.kicker).toBe(chapterKicker(G1_UNITS[0]!));
    expect(first!.kicker.startsWith('فصل ۱ · ')).toBe(true);
    expect(chapterTitle(G1_UNITS[1]!).length).toBeGreaterThan(0);
  });
  it('marks exactly one current station and locks everything after it', () => {
    for (const n of [0, 1, 3, 5, 12, 24]) {
      const { statuses, focus } = statusesAfter(n);
      const states = buildChapterViews({ statuses, focusStationId: focus, jumpOffers: noJump, onJump: none }).flatMap((c) => c.stations.map((s) => s.state));
      expect(states.filter((s) => s === 'cur')).toHaveLength(1);
      expect(states.slice(0, n).every((s) => s === 'done')).toBe(true);
      expect(states.slice(n + 1).every((s) => s === 'lock')).toBe(true);
    }
  });
  it('has no current station when the whole path is done', () => {
    const { statuses, focus } = statusesAfter(25);
    const states = buildChapterViews({ statuses, focusStationId: focus, jumpOffers: noJump, onJump: none }).flatMap((c) => c.stations.map((s) => s.state));
    expect(states.every((s) => s === 'done')).toBe(true);
  });
  it('keeps the current station when its content is not downloaded yet', () => {
    const { statuses, focus } = statusesAfter(2, []);
    const states = buildChapterViews({ statuses, focusStationId: focus, jumpOffers: noJump, onJump: none }).flatMap((c) => c.stations.map((s) => s.state));
    expect(states[2]).toBe('cur');
  });
  it('describes every node for screen readers with its number, title and status', () => {
    const { statuses, focus } = statusesAfter(1);
    const views = buildChapterViews({ statuses, focusStationId: focus, jumpOffers: noJump, onJump: none }).flatMap((c) => c.stations);
    expect(views[0]!.accessibilityLabel).toContain('ایستگاه ۱');
    expect(views[0]!.accessibilityLabel).toContain(G1_STATIONS[0]!.title);
    expect(new Set(views.map((v) => v.accessibilityLabel)).size).toBe(25);
  });
  it('produces a layout the page geometry accepts for any progress', () => {
    for (const n of [0, 4, 13, 25]) {
      const { statuses, focus } = statusesAfter(n);
      const chapters = buildChapterViews({ statuses, focusStationId: focus, jumpOffers: noJump, onJump: none });
      const layout = buildPathLayout(chapters.map((c) => ({ stations: c.stations.map((s) => s.state) })), 390);
      expect(layout.rows.filter((r) => r.kind === 'node')).toHaveLength(30);
      if (n < 25) expect(layout.curY).not.toBeNull();
    }
  });
});

describe('jump offers (same rule as the old screen)', () => {
  const hasJump = () => true;
  const locked = () => false;

  it('offers a jump only after the previous unit is finished and the next is untouched', () => {
    const afterUnit1 = new Set(G1_STATIONS.slice(0, 5).map((s) => s.id));
    expect([...jumpOfferUnitIds({ units: G1_UNITS, completed: afterUnit1, hasJump, isJumpUnlocked: locked })]).toEqual([G1_UNITS[1]!.id]);
  });
  it('offers nothing at the start, mid-unit or once the target is unlocked or started', () => {
    expect(jumpOfferUnitIds({ units: G1_UNITS, completed: new Set(), hasJump, isJumpUnlocked: locked }).size).toBe(0);
    const midUnit = new Set(G1_STATIONS.slice(0, 3).map((s) => s.id));
    expect(jumpOfferUnitIds({ units: G1_UNITS, completed: midUnit, hasJump, isJumpUnlocked: locked }).size).toBe(0);
    const afterUnit1 = new Set(G1_STATIONS.slice(0, 5).map((s) => s.id));
    expect(jumpOfferUnitIds({ units: G1_UNITS, completed: afterUnit1, hasJump, isJumpUnlocked: () => true }).size).toBe(0);
    expect(jumpOfferUnitIds({ units: G1_UNITS, completed: afterUnit1, hasJump: () => false, isJumpUnlocked: locked }).size).toBe(0);
    const startedUnit2 = new Set(G1_STATIONS.slice(0, 6).map((s) => s.id));
    expect(jumpOfferUnitIds({ units: G1_UNITS, completed: startedUnit2, hasJump, isJumpUnlocked: locked }).size).toBe(0);
  });
  it('labels the offer with the chapter number and calls back with the unit', () => {
    const calls: string[] = [];
    const { statuses, focus } = statusesAfter(5);
    const chapters = buildChapterViews({ statuses, focusStationId: focus, jumpOffers: new Set([G1_UNITS[1]!.id]), onJump: (id) => calls.push(id) });
    expect(chapters[0]!.jumpOffer).toBeUndefined();
    expect(chapters[1]!.jumpOffer!.label).toBe('پرش به فصل ۲');
    chapters[1]!.jumpOffer!.onPress();
    expect(calls).toEqual([G1_UNITS[1]!.id]);
  });
});

describe('small helpers', () => {
  it('writes the grade chip like the page', () => {
    expect(gradeChipLabel('G1')).toBe('پایهٔ ۱');
    expect(gradeChipLabel('G3')).toBe('پایهٔ ۳');
    expect(gradeChipLabel(null)).toBe('پایهٔ ۱');
  });
  it('fills the ring by completed macro stages out of five', () => {
    expect(ringFraction(null)).toBe(0);
    expect(ringFraction('LEARN')).toBe(0);
    expect(ringFraction('GUIDED')).toBeCloseTo(0.2);
    expect(ringFraction('MASTERY_CHECK')).toBeCloseTo(0.8);
    expect(ringFraction('ENTRY')).toBe(0);
  });
});
