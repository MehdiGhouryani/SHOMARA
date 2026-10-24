import { describe, expect, it } from 'vitest';
import {
  buildLearningRhythmProjection,
  rhythmCopyViolations,
  weekDayKeysContaining,
  MEANINGFUL_LEARNING_EVENT_TYPES,
  NON_MEANINGFUL_EVENT_TYPES,
} from './learning-rhythm';

describe('P11 learning rhythm', () => {
  it('never treats open-app style events as meaningful', () => {
    for (const t of NON_MEANINGFUL_EVENT_TYPES) {
      expect((MEANINGFUL_LEARNING_EVENT_TYPES as readonly string[]).includes(t)).toBe(false);
    }
  });

  it('counts distinct days in the week without streak pressure flags', () => {
    const today = '2026-10-08'; // Wednesday
    const week = weekDayKeysContaining(today);
    expect(week).toHaveLength(7);
    const p = buildLearningRhythmProjection({
      todayLocal: today,
      events: [
        { type: 'STATION_PASSED', occurredAt: '2026-10-06T10:00:00.000Z' },
        { type: 'CHALLENGE_COMPLETED', occurredAt: '2026-10-08T10:00:00.000Z' },
      ],
    });
    expect(p.meaningfulDayCountThisWeek).toBeGreaterThanOrEqual(1);
    expect(p.usesStreak).toBe(false);
    expect(p.penalizesMissedDays).toBe(false);
    expect(p.countsPassiveAppTime).toBe(false);
    expect(p.notificationIsLearningTruth).toBe(false);
    expect(rhythmCopyViolations(p.statusCopyFa)).toEqual([]);
  });

  it('rejects shame copy', () => {
    expect(rhythmCopyViolations('رشته‌ات شکست')).toContain('FORBIDDEN_COPY:رشته');
  });
});
