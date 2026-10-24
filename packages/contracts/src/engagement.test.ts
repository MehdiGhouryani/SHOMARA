import { describe, expect, it } from 'vitest';
import {
  DAILY_QUEST_SLOTS,
  ENGAGEMENT_SURFACE_DECISIONS,
  G1_GAME_CATALOG,
  G1_STATION_GAME_BASELINE,
  G1_QUEST_SEEDS,
  G1_REWARD_SEEDS,
  ENGAGEMENT_V1_GUARDRAILS,
  MAX_ACTIVE_DAILY_QUESTS,
  canGameProduceEvidence,
  isTimerPolicyAllowedForLearningRole,
  isValidQuestTrigger,
  rewardGrantKeyString,
} from './engagement';

describe('engagement contract', () => {
  it('locks the V1 daily quest surface to three ordered slots', () => {
    expect(DAILY_QUEST_SLOTS).toEqual(['EASY_START', 'SKILL_BUILDER', 'MEANINGFUL_PROGRESS']);
    expect(MAX_ACTIVE_DAILY_QUESTS).toBe(3);
    expect(ENGAGEMENT_V1_GUARDRAILS.maxActiveDailyQuests).toBe(3);
  });

  it('rejects farming-only quest triggers', () => {
    expect(isValidQuestTrigger({ type: 'STATION_COMPLETED', count: 1 })).toBe(true);
    expect(isValidQuestTrigger({ type: 'GAME_COMPLETED', count: 2 })).toBe(true);
    expect(isValidQuestTrigger({ type: 'STATION_COMPLETED', count: 0 })).toBe(false);
    expect(isValidQuestTrigger({ type: 'STATION_COMPLETED', count: 1.5 })).toBe(false);
  });

  it('keeps reward games out of evidence by default', () => {
    expect(canGameProduceEvidence({
      gameCode: 'G1-GAME-REWARD-001', contentVersionId: 'cv1', gameClass: 'REWARD_GAME',
      learningRole: 'REVIEW', primarySkillIds: ['SK1'], supportingSkillIds: [], objective: 'reward',
      stateSchema: {}, actionSchema: {}, timerPolicy: 'NONE',
    })).toBe(false);

    expect(canGameProduceEvidence({
      gameCode: 'G1-GAME-REVIEW-001', contentVersionId: 'cv2', gameClass: 'PRACTICE_GAME',
      learningRole: 'REVIEW', primarySkillIds: ['SK1'], supportingSkillIds: [], objective: 'review',
      stateSchema: {}, actionSchema: {}, evidencePolicyId: 'evidence-v1', timerPolicy: 'NONE',
    })).toBe(true);
  });

  it('does not allow a hard timer on mastery checks', () => {
    expect(isTimerPolicyAllowedForLearningRole('MASTERY_CHECK', 'NONE')).toBe(true);
    expect(isTimerPolicyAllowedForLearningRole('MASTERY_CHECK', 'SOFT')).toBe(true);
    expect(isTimerPolicyAllowedForLearningRole('MASTERY_CHECK', 'HARD')).toBe(false);
    expect(isTimerPolicyAllowedForLearningRole('REVIEW', 'HARD')).toBe(true);
  });

  it('creates a stable server-side reward idempotency key', () => {
    expect(rewardGrantKeyString({
      learningIdentityId: 'learner-1',
      sourceType: 'QUEST',
      sourceRef: 'quest-instance-1',
      rewardDefinitionId: 'reward-1',
    })).toBe('learner-1:QUEST:quest-instance-1:reward-1');
  });



  it('locks the Grade 1 game catalog to fourteen reusable templates and maps every station', () => {
    expect(G1_GAME_CATALOG).toHaveLength(14);
    expect(new Set(G1_GAME_CATALOG.map((item) => item.code)).size).toBe(14);
    expect(Object.keys(G1_STATION_GAME_BASELINE)).toHaveLength(25);
    for (const stationId of Object.keys(G1_STATION_GAME_BASELINE)) {
      expect(G1_STATION_GAME_BASELINE[stationId]?.length).toBeGreaterThan(0);
    }
  });

  it('locks mission hub and V1 quest/reward seeds without adding a new primary tab', () => {
    expect(ENGAGEMENT_SURFACE_DECISIONS.missionHubPlacement).toBe('PATH_ENTRY_CARD');
    expect(ENGAGEMENT_SURFACE_DECISIONS.primaryNavigationChanges).toBe(false);
    expect(ENGAGEMENT_SURFACE_DECISIONS.grade1UnitToWorldMapping).toBe('ONE_TO_ONE');
    expect(G1_QUEST_SEEDS).toHaveLength(3);
    expect(G1_QUEST_SEEDS.map((q) => q.slot)).toEqual(DAILY_QUEST_SLOTS);
    expect(G1_REWARD_SEEDS).toHaveLength(4);
  });

  it('explicitly keeps prohibited V1 mechanics disabled', () => {
    expect(ENGAGEMENT_V1_GUARDRAILS.childLeaderboard).toBe(false);
    expect(ENGAGEMENT_V1_GUARDRAILS.paidCurrency).toBe(false);
    expect(ENGAGEMENT_V1_GUARDRAILS.tradeableCurrency).toBe(false);
    expect(ENGAGEMENT_V1_GUARDRAILS.punitiveDailyStreak).toBe(false);
    expect(ENGAGEMENT_V1_GUARDRAILS.loginOnlyRewards).toBe(false);
    expect(ENGAGEMENT_V1_GUARDRAILS.timeOnlyRewards).toBe(false);
    expect(ENGAGEMENT_V1_GUARDRAILS.pathRemainsPrimaryLearningSurface).toBe(true);
    expect(ENGAGEMENT_V1_GUARDRAILS.engagementIsNotLearningTruth).toBe(true);
  });
});
