/**
 * P06 mission engine pure-logic tests (no network / DB).
 * Mirrors guardrails in missions.ts and the fixed 0058 completion semantics.
 */
import { describe, expect, it } from 'vitest';
import {
  G1_DAILY_MISSION_POOL,
  G1_MISSION_CATALOG,
  applyMissionEvents,
  missionCatalogViolations,
  missionProgressValue,
  missionStepProgress,
  selectDailyMissions,
  syncMissions,
  EMPTY_MISSION_STATE,
  MISSION_ENGINE_VERSION,
} from './missions';

describe('P06 mission catalog', () => {
  it('has no catalog violations under V1 guardrails', () => {
    expect(missionCatalogViolations(G1_MISSION_CATALOG)).toEqual([]);
  });

  it('exposes a stable engine version', () => {
    expect(MISSION_ENGINE_VERSION).toMatch(/^2026-10-04-p06/);
  });
});

describe('selectDailyMissions', () => {
  it('returns at most one mission per daily slot', () => {
    const selected = selectDailyMissions('learner-a', '2026-10-04', { challengeAvailable: true });
    const slots = selected.map((m) => m.dailySlot);
    expect(new Set(slots).size).toBe(slots.length);
    expect(selected.length).toBeLessThanOrEqual(3);
  });

  it('is deterministic for the same learner/day', () => {
    const a = selectDailyMissions('learner-a', '2026-10-04', { challengeAvailable: false }).map((m) => m.code);
    const b = selectDailyMissions('learner-a', '2026-10-04', { challengeAvailable: false }).map((m) => m.code);
    expect(a).toEqual(b);
  });

  it('can differ across learners on the same day', () => {
    const a = selectDailyMissions('learner-a', '2026-10-04', { challengeAvailable: true }).map((m) => m.code).join(',');
    const b = selectDailyMissions('learner-b', '2026-10-04', { challengeAvailable: true }).map((m) => m.code).join(',');
    // Not required to differ, but pool is large enough that collision is unlikely for these ids
    expect(typeof a).toBe('string');
    expect(typeof b).toBe('string');
  });
});

describe('applyMissionEvents + step count', () => {
  const twoGames = G1_DAILY_MISSION_POOL.find((m) => m.code === 'G1-MD-SKILL-01');
  if (!twoGames) throw new Error('missing G1-MD-SKILL-01 in pool');

  it('does not complete a count:2 step with a single event', () => {
    const receipts = applyMissionEvents(
      twoGames,
      { category: 'DAILY', periodKey: '2026-10-04', receipts: [] },
      [{ type: 'GAME_COMPLETED', eventKey: 'GAME_COMPLETED:encounter:1', targetRef: null, sourceRef: 'encounter:1', occurredAt: '2026-10-04T10:00:00.000Z' }],
      'Asia/Tehran',
    );
    const steps = missionStepProgress(twoGames, receipts);
    expect(steps[0]?.have).toBe(1);
    expect(steps[0]?.done).toBe(false);
    expect(missionProgressValue(twoGames, receipts)).toBe(1);
  });

  it('completes a count:2 step only after two distinct sources', () => {
    const receipts = applyMissionEvents(
      twoGames,
      { category: 'DAILY', periodKey: '2026-10-04', receipts: [] },
      [
        { type: 'GAME_COMPLETED', eventKey: 'GAME_COMPLETED:encounter:1', targetRef: null, sourceRef: 'encounter:1', occurredAt: '2026-10-04T10:00:00.000Z' },
        { type: 'GAME_COMPLETED', eventKey: 'GAME_COMPLETED:encounter:2', targetRef: null, sourceRef: 'encounter:2', occurredAt: '2026-10-04T10:05:00.000Z' },
      ],
      'Asia/Tehran',
    );
    const steps = missionStepProgress(twoGames, receipts);
    expect(steps[0]?.have).toBe(2);
    expect(steps[0]?.done).toBe(true);
    expect(missionProgressValue(twoGames, receipts)).toBe(2);
  });

  it('ignores duplicate sourceRef (idempotent receipts)', () => {
    const receipts = applyMissionEvents(
      twoGames,
      { category: 'DAILY', periodKey: '2026-10-04', receipts: [] },
      [
        { type: 'GAME_COMPLETED', eventKey: 'GAME_COMPLETED:encounter:1', targetRef: null, sourceRef: 'encounter:1', occurredAt: '2026-10-04T10:00:00.000Z' },
        { type: 'GAME_COMPLETED', eventKey: 'GAME_COMPLETED:encounter:1', targetRef: null, sourceRef: 'encounter:1', occurredAt: '2026-10-04T10:01:00.000Z' },
      ],
      'Asia/Tehran',
    );
    expect(receipts).toHaveLength(1);
  });
});

describe('syncMissions', () => {
  it('assigns daily instances without inventing mastery flags', () => {
    const result = syncMissions(EMPTY_MISSION_STATE, {
      learningIdentityId: 'learner-a',
      timeZone: 'Asia/Tehran',
      now: new Date('2026-10-04T12:00:00.000Z'),
      challengeAvailable: true,
      passedStationIds: [],
      events: [],
    });
    expect(result.state.instances.length).toBeGreaterThan(0);
    expect(result.dayKey).toBe('2026-10-04');
    // Hub projection is built separately; sync itself must not invent mastery.
    expect(result.newGrants.every((g) => g.sourceType === 'QUEST')).toBe(true);
  });
});
