import { describe, expect, it } from 'vitest';
import { MACRO_LABELS, macroFilled, macroIndex, macroLabel } from './macro';
import type { StationStage } from './types';

describe('5 macro stages (SoT §8)', () => {
  it('has exactly 5 child-facing stages', () => expect(MACRO_LABELS).toHaveLength(5));
  it('maps the 12 encounters onto 5 stages in order', () => {
    const order: StationStage[] = ['LEARN', 'GUIDED', 'GAME_PATTERN', 'INDEPENDENT', 'CHECK_A'];
    expect(order.map((s) => macroIndex(s))).toEqual([0, 1, 2, 3, 4]);
    expect(macroIndex('GAME_COUNT')).toBe(2);
    expect(macroIndex('REVIEW')).toBe(3);
    for (const s of ['CHECK_B', 'MASTERY_CHECK', 'RECOVERY', 'RECHECK', 'TRANSFER'] as StationStage[]) expect(macroIndex(s)).toBe(4);
  });
  it('transient stages have no macro index', () => {
    for (const s of ['ENTRY', 'RESULT', 'COMPLETE'] as StationStage[]) expect(macroIndex(s)).toBeNull();
  });
  it('fill: entry 0, RESULT keeps the previous fill, complete = all', () => {
    expect(macroFilled('ENTRY', null)).toBe(0);
    expect(macroFilled('GUIDED', 'LEARN')).toBe(2);
    expect(macroFilled('RESULT', 'INDEPENDENT')).toBe(4);
    expect(macroFilled('COMPLETE', 'CHECK_B')).toBe(5);
  });
  it('recovery never moves the bar backwards past the checks stage', () => {
    expect(macroFilled('RECOVERY', 'CHECK_A')).toBe(5);
    expect(macroFilled('RECHECK', 'RECOVERY')).toBe(5);
  });
  it('labels are child-friendly Persian', () => {
    expect(macroLabel('LEARN', null)).toBe('کشف می‌کنیم');
    expect(macroLabel('RESULT', 'REVIEW')).toBe('خودت انجام بده');
  });
});
