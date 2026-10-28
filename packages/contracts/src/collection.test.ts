import { describe, expect, it } from 'vitest';
import {
  G1_ACHIEVEMENT_CATALOG,
  G1_COLLECTION_REWARDS,
  achievementCatalogViolations,
  buildCollectionProjection,
  collectionRewardViolations,
  deriveAchievementRewardGrants,
  deriveAchievementUnlocks,
  COLLECTION_ENGINE_VERSION,
} from './collection';

describe('P07 achievement catalog', () => {
  it('has no catalog violations', () => {
    expect(achievementCatalogViolations()).toEqual([]);
  });

  it('includes path achievements beyond the old five', () => {
    const path = G1_ACHIEVEMENT_CATALOG.filter((a) => a.family === 'PATH');
    expect(path.length).toBeGreaterThanOrEqual(25);
  });

  it('preserves ST01 challenge achievement code', () => {
    expect(G1_ACHIEVEMENT_CATALOG.some((a) => a.code === 'G1-ACH-CHALLENGE-001')).toBe(true);
  });

  it('never implies mastery', () => {
    expect(G1_ACHIEVEMENT_CATALOG.every((a) => a.impliesMastery === false)).toBe(true);
  });
});

describe('P07 reward catalog', () => {
  it('passes V1 economy violations', () => {
    expect(collectionRewardViolations()).toEqual([]);
  });

  it('has no price payload keys', () => {
    for (const r of G1_COLLECTION_REWARDS) {
      expect(r.payload).not.toHaveProperty('price');
      expect(r.payload).not.toHaveProperty('gems');
    }
  });
});

describe('deriveAchievementUnlocks', () => {
  it('unlocks path achievement for a passed station', () => {
    const unlocks = deriveAchievementUnlocks({
      learningIdentityId: 'learner-1',
      passedStationIds: ['ST01'],
      completedChallengeCodes: [],
      existingUnlocks: [],
      existingGrants: [],
      nowIso: '2026-10-05T00:00:00.000Z',
    });
    expect(unlocks.some((u) => u.definitionCode === 'G1-A-PATH-ST01')).toBe(true);
  });

  it('is idempotent on re-run', () => {
    const facts = {
      learningIdentityId: 'learner-1',
      passedStationIds: ['ST01', 'ST02'],
      completedChallengeCodes: ['G1-ST01-CH-01'] as const,
      existingUnlocks: [],
      existingGrants: [],
      nowIso: '2026-10-05T00:00:00.000Z',
    };
    const once = deriveAchievementUnlocks(facts);
    const twice = deriveAchievementUnlocks({ ...facts, existingUnlocks: once });
    expect(twice).toHaveLength(once.length);
  });

  it('grants challenge reward once with deterministic key', () => {
    const unlocks = deriveAchievementUnlocks({
      learningIdentityId: 'learner-1',
      passedStationIds: [],
      completedChallengeCodes: ['G1-ST01-CH-01'],
      existingUnlocks: [],
      existingGrants: [],
      nowIso: '2026-10-05T00:00:00.000Z',
    });
    const grants = deriveAchievementRewardGrants(
      'learner-1',
      unlocks,
      G1_ACHIEVEMENT_CATALOG,
      G1_COLLECTION_REWARDS,
      [],
      '2026-10-05T00:00:00.000Z',
    );
    const challengeGrants = grants.filter((g) => g.sourceRef === 'G1-ACH-CHALLENGE-001');
    expect(challengeGrants.length).toBe(1);
    const again = deriveAchievementRewardGrants(
      'learner-1',
      unlocks,
      G1_ACHIEVEMENT_CATALOG,
      G1_COLLECTION_REWARDS,
      grants,
      '2026-10-05T01:00:00.000Z',
    );
    expect(again.filter((g) => g.sourceRef === 'G1-ACH-CHALLENGE-001')).toHaveLength(1);
  });
});

describe('buildCollectionProjection', () => {
  it('exposes product invariants', () => {
    const projection = buildCollectionProjection([], []);
    expect(projection.engineVersion).toBe(COLLECTION_ENGINE_VERSION);
    expect(projection.setsMastery).toBe(false);
    expect(projection.setsStationCompletion).toBe(false);
    expect(projection.impliesMoneyValue).toBe(false);
    expect(projection.summary.achievementsTotal).toBeGreaterThan(5);
  });
});
