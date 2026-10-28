/**
 * Canonical Grade 1 engagement contract.
 *
 * Engagement is downstream of learning truth. These types intentionally do not
 * contain mastery/unlock fields that a client can authoritatively set.
 */
export const ENGAGEMENT_CONTRACT_VERSION = '2026-10-03-p01-v1' as const;

export type QuestType =
  | 'PATH_PROGRESS'
  | 'SKILL_REVIEW'
  | 'RECOVERY'
  | 'GAME_PRACTICE'
  | 'TRANSFER'
  | 'MILESTONE';

export type DailyQuestSlot = 'EASY_START' | 'SKILL_BUILDER' | 'MEANINGFUL_PROGRESS';
export type QuestStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export type QuestTriggerType =
  | 'STATION_COMPLETED'
  | 'SKILL_REVIEW_COMPLETED'
  | 'RECOVERY_COMPLETED'
  | 'GAME_COMPLETED'
  | 'TRANSFER_COMPLETED'
  | 'CHALLENGE_COMPLETED'
  | 'MILESTONE_REACHED';

export interface QuestTrigger {
  type: QuestTriggerType;
  /** Optional target, e.g. station or skill id. */
  targetRef?: string;
  /** Minimum number of valid events required by this trigger. */
  count?: number;
}

export interface QuestDefinition {
  id: string;
  code: string;
  version: string;
  type: QuestType;
  dailySlot?: DailyQuestSlot;
  title: string;
  description: string;
  target: QuestTrigger;
  maxProgress: number;
  rewardPolicyId?: string;
  active: boolean;
}

export interface QuestProgress {
  questId: string;
  status: QuestStatus;
  progress: number;
  maxProgress: number;
  startedAt: string;
  completedAt?: string;
  expiresAt?: string;
}

export const DAILY_QUEST_SLOTS: readonly DailyQuestSlot[] = [
  'EASY_START',
  'SKILL_BUILDER',
  'MEANINGFUL_PROGRESS',
] as const;

export const MAX_ACTIVE_DAILY_QUESTS = 3 as const;

export type RewardType =
  | 'STAR_PROGRESS'
  | 'MILESTONE_BADGE'
  | 'CHARACTER_REACTION'
  | 'WORLD_ELEMENT'
  | 'CHARACTER_COSMETIC'
  | 'PATH_REVEAL'
  | 'STICKER';

export type RewardSourceType =
  | 'MILESTONE'
  | 'QUEST'
  | 'STATION_PROGRESS'
  | 'LEARNING_ACHIEVEMENT'
  | 'CHALLENGE_COMPLETION'
  | 'ADVENTURE_COMPLETION';

export interface RewardDefinition {
  id: string;
  code: string;
  version: string;
  type: RewardType;
  title: string;
  payload: Record<string, unknown>;
  active: boolean;
}

export interface RewardGrantKey {
  learningIdentityId: string;
  sourceType: RewardSourceType;
  sourceRef: string;
  rewardDefinitionId: string;
}

export interface RewardGrant {
  id: string;
  key: RewardGrantKey;
  status: 'PENDING' | 'GRANTED' | 'FAILED';
  grantedAt?: string;
}

export interface EngagementAchievementDefinition {
  id: string;
  code: string;
  title: string;
  description: string;
  condition: QuestTrigger;
  rewardDefinitionId?: string;
  active: boolean;
}

export interface AdventureDefinition {
  id: string;
  code: string;
  title: string;
  description: string;
  encounterIds: readonly string[];
  completionRewardDefinitionId?: string;
  active: boolean;
}

export type GameClass =
  | 'LEARNING_GAME'
  | 'PRACTICE_GAME'
  | 'TRANSFER_GAME'
  | 'RECOVERY_GAME'
  | 'REWARD_GAME'
  | 'ADVENTURE_MISSION';

export type GameTimerPolicy = 'NONE' | 'SOFT' | 'HARD';

export interface MiniGameDefinition {
  gameCode: string;
  contentVersionId: string;
  gameClass: GameClass;
  learningRole:
    | 'DIAGNOSTIC_PROBE'
    | 'INSTRUCTION'
    | 'GUIDED_PRACTICE'
    | 'INDEPENDENT_PRACTICE'
    | 'REVIEW'
    | 'TRANSFER'
    | 'RECOVERY'
    | 'MASTERY_CHECK';
  primarySkillIds: readonly string[];
  supportingSkillIds: readonly string[];
  objective: string;
  stateSchema: Record<string, unknown>;
  actionSchema: Record<string, unknown>;
  evaluatorVersion?: string;
  successPolicyId?: string;
  evidencePolicyId?: string;
  feedbackPolicyId?: string;
  hintPolicyId?: string;
  timerPolicy: GameTimerPolicy;
  rewardPolicyId?: string;
}

export interface EngagementEvent {
  type:
    | 'GAME_STARTED'
    | 'GAME_COMPLETED'
    | 'GAME_ABANDONED'
    | 'QUEST_PRESENTED'
    | 'QUEST_PROGRESSED'
    | 'QUEST_COMPLETED'
    | 'REWARD_PRESENTED'
    | 'REWARD_CLAIMED'
    | 'MILESTONE_REACHED'
    | 'LEARNING_RHYTHM_UPDATED';
  eventId: string;
  occurredAt: string;
  learningIdentityId: string;
  sessionId?: string;
  encounterId?: string;
  sourceRef?: string;
  payload: Record<string, unknown>;
}

/**
 * Product V1 economy guardrails. Kept executable so future server contracts
 * can validate proposed reward definitions before activation.
 */
export const ENGAGEMENT_V1_GUARDRAILS = {
  childLeaderboard: false,
  paidCurrency: false,
  tradeableCurrency: false,
  punitiveDailyStreak: false,
  loginOnlyRewards: false,
  timeOnlyRewards: false,
  hardTimerForMasteryCheck: false,
  rewardGameProducesEvidenceByDefault: false,
  maxActiveDailyQuests: MAX_ACTIVE_DAILY_QUESTS,
  pathRemainsPrimaryLearningSurface: true,
  engagementIsNotLearningTruth: true,
} as const;


export type MissionHubPlacement = 'PATH_ENTRY_CARD';
export type Grade1WorldId = 'W01' | 'W02' | 'W03' | 'W04' | 'W05';

export const ENGAGEMENT_SURFACE_DECISIONS = {
  missionHubPlacement: 'PATH_ENTRY_CARD' as MissionHubPlacement,
  primaryNavigationChanges: false,
  grade1UnitToWorldMapping: 'ONE_TO_ONE' as const,
  dailyQuestOrdering: DAILY_QUEST_SLOTS,
  rewardFrequency: 'QUEST_COMPLETION_OR_LEARNING_MILESTONE' as const,
  rewardPresentation: 'COLLECTIBLE_AND_COSMETIC' as const,
} as const;

export interface Grade1GameCatalogEntry {
  code: `G1-GAME-${string}`;
  name: string;
  mechanic: string;
  sampleSkillIds: readonly string[];
}

export const G1_GAME_CATALOG: readonly Grade1GameCatalogEntry[] = [
  { code: 'G1-GAME-001', name: 'مسیر الگو', mechanic: 'انتخاب مسیر مطابق الگو', sampleSkillIds: ['G1-SK009', 'G1-SK010'] },
  { code: 'G1-GAME-002', name: 'شکار شمارش', mechanic: 'tap/drag اشیا و شمارش', sampleSkillIds: ['G1-SK001', 'G1-SK002', 'G1-SK003'] },
  { code: 'G1-GAME-003', name: 'کارخانه عدد', mechanic: 'ساخت عدد با چند نمایش', sampleSkillIds: ['G1-SK020', 'G1-SK021', 'G1-SK024'] },
  { code: 'G1-GAME-004', name: 'شهر شکل‌ها', mechanic: 'ساخت و دسته‌بندی شکل', sampleSkillIds: ['G1-SK041', 'G1-SK044'] },
  { code: 'G1-GAME-005', name: 'آینه جادویی', mechanic: 'تکمیل تقارن', sampleSkillIds: ['G1-SK045', 'G1-SK046'] },
  { code: 'G1-GAME-006', name: 'ربات مقایسه', mechanic: 'انتخاب کمتر/بیشتر/برابر', sampleSkillIds: ['G1-SK035', 'G1-SK040'] },
  { code: 'G1-GAME-007', name: 'پرش روی محور', mechanic: 'حرکت روی خط عدد', sampleSkillIds: ['G1-SK007', 'G1-SK034'] },
  { code: 'G1-GAME-008', name: 'تعمیر ساعت', mechanic: 'ساخت ساعت و ترتیب زمانی', sampleSkillIds: ['G1-SK052', 'G1-SK055'] },
  { code: 'G1-GAME-009', name: 'شکار تقویم', mechanic: 'پیدا کردن روز و ترتیب', sampleSkillIds: ['G1-SK056'] },
  { code: 'G1-GAME-010', name: 'فروشگاه کوچولو', mechanic: 'خرید و مسئله‌های عددی', sampleSkillIds: ['G1-SK022', 'G1-SK025', 'G1-SK029', 'G1-SK057'] },
  { code: 'G1-GAME-011', name: 'کارخانه ده‌تایی', mechanic: 'گروه‌بندی ده‌تایی و یکی', sampleSkillIds: ['G1-SK022', 'G1-SK023', 'G1-SK024'] },
  { code: 'G1-GAME-012', name: 'جدول جادویی', mechanic: 'جدول، خانه‌ها و استدلال', sampleSkillIds: ['G1-SK015', 'G1-SK060'] },
  { code: 'G1-GAME-013', name: 'کارآگاه اطلاعات', mechanic: 'کافی یا ناکافی بودن اطلاعات', sampleSkillIds: ['G1-SK061'] },
  { code: 'G1-GAME-014', name: 'ماموریت چندمرحله‌ای', mechanic: 'چند گام تصمیمی', sampleSkillIds: ['G1-SK062', 'G1-SK064'] },
] as const;

export const G1_STATION_GAME_BASELINE: Readonly<Record<string, readonly string[]>> = {
  ST01: ['G1-GAME-002', 'G1-GAME-001'],
  ST02: ['G1-GAME-003'],
  ST03: ['G1-GAME-003'],
  ST04: ['G1-GAME-004'],
  ST05: ['G1-GAME-002'],
  ST06: ['G1-GAME-005'],
  ST07: ['G1-GAME-002'],
  ST08: ['G1-GAME-002'],
  ST09: ['G1-GAME-005'],
  ST10: ['G1-GAME-006'],
  ST11: ['G1-GAME-006'],
  ST12: ['G1-GAME-006'],
  ST13: ['G1-GAME-003'],
  ST14: ['G1-GAME-007'],
  ST15: ['G1-GAME-011', 'G1-GAME-012'],
  ST16: ['G1-GAME-008'],
  ST17: ['G1-GAME-010'],
  ST18: ['G1-GAME-001', 'G1-GAME-008'],
  ST19: ['G1-GAME-010'],
  ST20: ['G1-GAME-011'],
  ST21: ['G1-GAME-002', 'G1-GAME-005'],
  ST22: ['G1-GAME-009'],
  ST23: ['G1-GAME-007'],
  ST24: ['G1-GAME-014'],
  ST25: ['G1-GAME-013'],
} as const;

export const G1_QUEST_SEEDS = [
  { code: 'G1-Q-001', slot: 'EASY_START' as const, type: 'PATH_PROGRESS' as const, trigger: { type: 'GAME_COMPLETED' as const, count: 1 }, rewardType: 'STAR_PROGRESS' as const },
  { code: 'G1-Q-002', slot: 'SKILL_BUILDER' as const, type: 'GAME_PRACTICE' as const, trigger: { type: 'GAME_COMPLETED' as const, targetRef: 'G1-GAME-001', count: 2 }, rewardType: 'STICKER' as const },
  { code: 'G1-Q-003', slot: 'MEANINGFUL_PROGRESS' as const, type: 'MILESTONE' as const, trigger: { type: 'STATION_COMPLETED' as const, targetRef: 'ST01', count: 1 }, rewardType: 'PATH_REVEAL' as const },
] as const;

export const G1_REWARD_SEEDS = [
  { code: 'G1-R-001', type: 'STAR_PROGRESS' as const },
  { code: 'G1-R-002', type: 'STICKER' as const, payload: { sticker: 'PATTERN' } },
  { code: 'G1-R-003', type: 'CHARACTER_REACTION' as const, payload: { reaction: 'CHEER' } },
  { code: 'G1-R-004', type: 'PATH_REVEAL' as const, payload: { stationId: 'ST02' } },
] as const;

export function isValidQuestTrigger(trigger: QuestTrigger): boolean {
  if (!trigger.type) return false;
  if (trigger.count !== undefined && (!Number.isInteger(trigger.count) || trigger.count < 1)) return false;
  return true;
}

export function canGameProduceEvidence(game: MiniGameDefinition): boolean {
  return game.gameClass !== 'REWARD_GAME' && game.evidencePolicyId !== undefined;
}

export function isTimerPolicyAllowedForLearningRole(
  learningRole: MiniGameDefinition['learningRole'],
  timerPolicy: GameTimerPolicy,
): boolean {
  if (learningRole === 'MASTERY_CHECK') return timerPolicy === 'NONE' || timerPolicy === 'SOFT';
  return true;
}

export function rewardGrantKeyString(key: RewardGrantKey): string {
  return [key.learningIdentityId, key.sourceType, key.sourceRef, key.rewardDefinitionId].join(':');
}
