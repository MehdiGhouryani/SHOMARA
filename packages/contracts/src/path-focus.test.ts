import { describe, expect, it } from 'vitest';
import { buildPathFocus, pathFocusViolations } from './path2';

const stations = [
  { id: 'ST01', number: 1, title: 'شمارش' },
  { id: 'ST02', number: 2, title: 'جهت' },
  { id: 'ST03', number: 3, title: 'جمع' },
] as const;

describe('path focus (Phase B)', () => {
  it('points at CURRENT before AVAILABLE', () => {
    const model = buildPathFocus({
      stations,
      statuses: { ST01: 'COMPLETED', ST02: 'CURRENT', ST03: 'LOCKED' },
    });
    expect(model.focus?.id).toBe('ST02');
    expect(model.hereLabelFa).toContain('جهت');
    expect(model.nextLabelFa).toContain('ادامه');
    expect(pathFocusViolations(model)).toEqual([]);
  });

  it('prefers CURRENT over NOT_DOWNLOADED', () => {
    const model = buildPathFocus({
      stations,
      statuses: { ST01: 'NOT_DOWNLOADED', ST02: 'CURRENT', ST03: 'LOCKED' },
    });
    expect(model.focus?.id).toBe('ST02');
  });

  it('marks path complete with no focus', () => {
    const model = buildPathFocus({
      stations,
      statuses: { ST01: 'COMPLETED', ST02: 'COMPLETED', ST03: 'COMPLETED' },
    });
    expect(model.pathComplete).toBe(true);
    expect(model.focus).toBeNull();
    expect(pathFocusViolations(model)).toEqual([]);
  });

  it('falls back when nothing actionable', () => {
    const model = buildPathFocus({
      stations,
      statuses: { ST01: 'LOCKED', ST02: 'LOCKED', ST03: 'LOCKED' },
    });
    expect(model.focus).toBeNull();
    expect(model.hereLabelFa.length).toBeGreaterThan(0);
  });
});
