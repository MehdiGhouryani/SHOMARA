import { describe, expect, it } from 'vitest';
import { G1_STATION_GAME_BASELINE, ENGAGEMENT_SURFACE_DECISIONS, MAX_ACTIVE_DAILY_QUESTS } from './engagement';
import { FEEDBACK_BUDGET_MS } from './game-feel';
import {
  ACHIEVEMENT_FAMILIES,
  ACHIEVEMENT_MILESTONE_THRESHOLDS,
  ACHIEVEMENT_POLICY,
  FORBIDDEN_MISSION_TRIGGERS,
  MISSION_POLICY,
  MISSION_TRIGGERS_BY_CATEGORY,
  P01_DECISION_REGISTER,
  REWARD_CLASSES_BY_SOURCE,
  REWARD_ECONOMY_V1,
  SIGNATURE_CHALLENGE_POLICY,
  challengeGrantsReward,
  decisionsNeedingReview,
  isDailyMissionExpired,
  isMissionTriggerAllowed,
  isRewardAllowedForSource,
  localDayKey,
  reachedMilestone,
  resolveChallengeResult,
  rewardDefinitionViolations,
  semanticEventForChallengeResult,
  signatureChallengeViolations,
  unscheduledDecisions,
} from './engagement-policy';

describe('P01 decision register', () => {
  it('covers every P01 decision area A–G with unique ids', () => {
    const ids = P01_DECISION_REGISTER.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const area of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
      expect(ids.some((id) => id.startsWith(`P01-${area}-`))).toBe(true);
    }
  });

  it('schedules every OPEN/PROVISIONAL decision at a later gate', () => {
    expect(unscheduledDecisions()).toHaveLength(0);
    for (const d of decisionsNeedingReview()) expect(Number(d.reviewAt!.slice(1)) > 1).toBe(true);
  });

  it('agrees with the existing surface contract', () => {
    const hub = P01_DECISION_REGISTER.find((d) => d.id === 'P01-E-01')!;
    expect(hub.state).toBe('LOCKED');
    expect(ENGAGEMENT_SURFACE_DECISIONS.missionHubPlacement).toBe('PATH_ENTRY_CARD');
    expect(ENGAGEMENT_SURFACE_DECISIONS.primaryNavigationChanges).toBe(false);
    expect(P01_DECISION_REGISTER.find((d) => d.id === 'P01-F-01')!.state).toBe('PROVISIONAL');
  });
});

describe('mission policy', () => {
  it('caps active missions and keeps daily at three', () => {
    expect(MISSION_POLICY.maxActive.DAILY).toBe(MAX_ACTIVE_DAILY_QUESTS);
    expect(MISSION_POLICY.maxActive.STATION + MISSION_POLICY.maxActive.WORLD + MISSION_POLICY.maxActive.ADVENTURE).toBe(3);
  });

  it('never treats expiry as failure or loss', () => {
    expect(MISSION_POLICY.expiryIsFailure).toBe(false);
    expect(MISSION_POLICY.expiryRemovesLearningProgress).toBe(false);
    expect(MISSION_POLICY.expiryRemovesGrantedRewards).toBe(false);
    expect(MISSION_POLICY.uiLocalProgressCanGrant).toBe(false);
  });

  it('rejects farming triggers in every category', () => {
    for (const cat of MISSION_POLICY.categories) {
      for (const bad of FORBIDDEN_MISSION_TRIGGERS) expect(isMissionTriggerAllowed(cat, bad)).toBe(false);
      for (const ok of MISSION_TRIGGERS_BY_CATEGORY[cat]) expect(isMissionTriggerAllowed(cat, ok)).toBe(true);
    }
    expect(isMissionTriggerAllowed('DAILY', 'MILESTONE_REACHED')).toBe(false);
  });

  it('expires daily missions on the learner local day boundary', () => {
    const tz = 'Asia/Tehran';
    // 23:30 and 23:50 Tehran on the same day (UTC+03:30)
    const a = new Date('2026-10-03T20:00:00Z');
    const b = new Date('2026-10-03T20:20:00Z');
    const next = new Date('2026-10-03T20:31:00Z'); // 00:01 Tehran next day
    expect(localDayKey(a, tz)).toBe('2026-10-03');
    expect(isDailyMissionExpired(a, b, tz)).toBe(false);
    expect(isDailyMissionExpired(a, next, tz)).toBe(true);
  });
});

describe('achievement policy', () => {
  it('locks nine families with ascending positive thresholds', () => {
    expect(ACHIEVEMENT_FAMILIES).toHaveLength(9);
    for (const f of ACHIEVEMENT_FAMILIES) {
      const t = ACHIEVEMENT_MILESTONE_THRESHOLDS[f];
      expect(t.length > 0).toBe(true);
      t.forEach((v, i) => { expect(Number.isInteger(v) && v > 0).toBe(true); if (i) expect(v > t[i - 1]!).toBe(true); });
    }
  });

  it('keeps PATH/CHALLENGE inside 25 stations and SKILL inside 64 skills', () => {
    expect(Math.max(...ACHIEVEMENT_MILESTONE_THRESHOLDS.PATH)).toBe(25);
    expect(Math.max(...ACHIEVEMENT_MILESTONE_THRESHOLDS.CHALLENGE)).toBe(25);
    expect(Math.max(...ACHIEVEMENT_MILESTONE_THRESHOLDS.SKILL)).toBe(64);
  });

  it('is unlock-once, never revoked, never mastery, no streak', () => {
    expect(ACHIEVEMENT_POLICY.revocable).toBe(false);
    expect(ACHIEVEMENT_POLICY.reUnlockable).toBe(false);
    expect(ACHIEVEMENT_POLICY.impliesMastery).toBe(false);
    expect(ACHIEVEMENT_POLICY.persistenceCountsConsecutiveDays).toBe(false);
    expect(reachedMilestone('PATH', 0)).toBeNull();
    expect(reachedMilestone('PATH', 7)).toBe(5);
    expect(reachedMilestone('PATH', 25)).toBe(25);
  });
});

describe('reward economy V1', () => {
  it('has no token, no purchase, no randomness, no social comparison', () => {
    expect(REWARD_ECONOMY_V1.childFacingToken).toBe('NONE');
    expect(REWARD_ECONOMY_V1.starProgressIsSpendable).toBe(false);
    expect(REWARD_ECONOMY_V1.purchasable).toBe(false);
    expect(REWARD_ECONOMY_V1.premiumOnlyRewards).toBe(false);
    expect(REWARD_ECONOMY_V1.randomized).toBe(false);
    expect(REWARD_ECONOMY_V1.socialComparison).toBe(false);
    expect(REWARD_ECONOMY_V1.engagementContingent).toBe(false);
    expect(REWARD_ECONOMY_V1.revealMaxBlockingMs).toBe(FEEDBACK_BUDGET_MS.celebration);
  });

  it('maps every source to known classes only', () => {
    for (const [source, classes] of Object.entries(REWARD_CLASSES_BY_SOURCE)) {
      expect(classes.length > 0).toBe(true);
      for (const c of classes) expect((REWARD_ECONOMY_V1.rewardClasses as readonly string[]).includes(c)).toBe(true);
      expect(source.length > 0).toBe(true);
    }
    expect(isRewardAllowedForSource('QUEST', 'CHARACTER_COSMETIC')).toBe(false);
    expect(isRewardAllowedForSource('ADVENTURE_COMPLETION', 'WORLD_ELEMENT')).toBe(true);
  });

  it('rejects money-like or random payloads', () => {
    expect(rewardDefinitionViolations({ type: 'STICKER', payload: { sticker: 'PATTERN' } })).toEqual([]);
    expect(rewardDefinitionViolations({ type: 'STICKER', payload: { price: 10 } })).toEqual(['FORBIDDEN_PAYLOAD_KEY:price']);
    expect(rewardDefinitionViolations({ type: 'GEM', payload: { odds: 0.1 } })).toEqual(['UNKNOWN_REWARD_CLASS', 'FORBIDDEN_PAYLOAD_KEY:odds']);
  });
});

describe('signature challenge policy', () => {
  const round = (correct: boolean, hintsUsed = 0, scaffolded = false) => ({ correct, attempts: 1, hintsUsed, scaffolded });

  it('resolves results without a failure state', () => {
    expect(resolveChallengeResult([round(true), round(true), round(true)], 3, false)).toBe('COMPLETED');
    expect(resolveChallengeResult([round(true), round(true, 1), round(true)], 3, false)).toBe('COMPLETED_WITH_SUPPORT');
    expect(resolveChallengeResult([round(true), round(true, 0, true), round(true)], 3, false)).toBe('COMPLETED_WITH_SUPPORT');
    expect(resolveChallengeResult([round(true), round(false), round(true)], 3, false)).toBe('NOT_YET');
    expect(resolveChallengeResult([round(true)], 3, false)).toBe('ABANDONED');
    expect(resolveChallengeResult([round(true), round(true), round(true)], 3, true)).toBe('ABANDONED');
    expect((SIGNATURE_CHALLENGE_POLICY.results as readonly string[]).includes('FAILED')).toBe(false);
  });

  it('grants the reward once and never less for hints', () => {
    expect(challengeGrantsReward('COMPLETED', false)).toBe(true);
    expect(challengeGrantsReward('COMPLETED_WITH_SUPPORT', false)).toBe(true);
    expect(challengeGrantsReward('COMPLETED', true)).toBe(false);
    expect(challengeGrantsReward('NOT_YET', false)).toBe(false);
    expect(SIGNATURE_CHALLENGE_POLICY.hints.reducesReward).toBe(false);
    expect(SIGNATURE_CHALLENGE_POLICY.resultSetsMastery).toBe(false);
  });

  it('maps NOT_YET to encouragement, not failure', () => {
    expect(semanticEventForChallengeResult('NOT_YET')).toBe('RECOVERY');
    expect(semanticEventForChallengeResult('COMPLETED')).toBe('MILESTONE');
    expect(semanticEventForChallengeResult('ABANDONED')).toBeNull();
  });

  it('accepts a valid draft for every one of the 25 stations', () => {
    const stations = Object.keys(G1_STATION_GAME_BASELINE);
    expect(stations).toHaveLength(SIGNATURE_CHALLENGE_POLICY.stationCount);
    for (const stationId of stations) {
      const gameCode = G1_STATION_GAME_BASELINE[stationId]![0]!;
      expect(signatureChallengeViolations({ stationId, gameCode, rounds: 3, timerPolicy: 'NONE', learningRole: 'INDEPENDENT_PRACTICE', estimatedDurationSec: 60 })).toEqual([]);
    }
  });

  it('rejects hard timers, mastery-check role, off-baseline templates and bad shapes', () => {
    const v = signatureChallengeViolations({ stationId: 'ST01', gameCode: 'G1-GAME-008', rounds: 6, timerPolicy: 'HARD', learningRole: 'MASTERY_CHECK', estimatedDurationSec: 200 });
    expect(v).toEqual(['TEMPLATE_NOT_IN_STATION_BASELINE', 'ROUND_COUNT_OUT_OF_RANGE', 'TIMER_POLICY_NOT_ALLOWED', 'LEARNING_ROLE_NOT_ALLOWED', 'DURATION_OUT_OF_TARGET']);
    expect(signatureChallengeViolations({ stationId: 'ST99', gameCode: 'G1-GAME-999', rounds: 3, timerPolicy: 'NONE', learningRole: 'REVIEW', estimatedDurationSec: 45 })).toEqual(['UNKNOWN_STATION', 'UNKNOWN_TEMPLATE']);
  });
});
