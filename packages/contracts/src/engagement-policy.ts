/**
 * P01 — Product / Game design lock (Roadmap §5–§11, P01 decisions A–G).
 *
 * Executable policy only: no engine, no persistence, no UI. These constants and
 * validators exist so P04–P11 implement one semantics instead of re-deciding it.
 * Engagement stays downstream of learning truth (ADR-0003, ADR-0032): nothing in
 * this module can set mastery, station completion, or unlocks.
 *
 * Decision states follow Roadmap §0.6. A change to a LOCKED value requires a
 * PLAN_REVISION entry in ROADMAP_PHASES.md (§0.8).
 */
import type { AnimationSemanticEvent } from './animation';
import { FEEDBACK_BUDGET_MS } from './game-feel';
import {
  G1_GAME_CATALOG,
  G1_STATION_GAME_BASELINE,
  MAX_ACTIVE_DAILY_QUESTS,
  type GameTimerPolicy,
  type MiniGameDefinition,
  type QuestTriggerType,
  type RewardSourceType,
  type RewardType,
} from './engagement';

export const ENGAGEMENT_POLICY_VERSION = '2026-10-03-p01-v2' as const;

// ---------------------------------------------------------------------------
// Decision register (P01 A–G). Every OPEN/PROVISIONAL item names its review gate.
// ---------------------------------------------------------------------------

export type ProductDecisionState = 'LOCKED' | 'PROVISIONAL' | 'OPEN' | 'REJECTED';
export type RoadmapPhaseId = `P${'00' | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12' | '13' | '14'}`;

export interface ProductDecision {
  id: `P01-${'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'}-${string}`;
  topic: string;
  state: ProductDecisionState;
  decision: string;
  /** Required for PROVISIONAL/OPEN: the phase whose gate must confirm or replace it. */
  reviewAt?: RoadmapPhaseId;
  /** Short source keys; full research log lives in the P01 phase log. */
  evidence: readonly string[];
}

export const P01_DECISION_REGISTER: readonly ProductDecision[] = [
  // A — child game feeling
  { id: 'P01-A-01', topic: 'Error treatment', state: 'LOCKED', decision: 'Errors are information: encourage + retry/representation change; no lives, no shame copy, no loss of earned items.', evidence: ['ROADMAP-4.3', 'DECI-1999'] },
  { id: 'P01-A-02', topic: 'Math as mechanic', state: 'LOCKED', decision: 'Prefer templates whose interaction embodies the math (count by tapping, compose by grouping) over question wrappers.', evidence: ['DRAGONBOX', 'GAMIFICATION-META-2024'] },
  // B — mission architecture
  { id: 'P01-B-01', topic: 'Mission categories', state: 'LOCKED', decision: 'DAILY, STATION, WORLD, ADVENTURE. SPECIAL_EVENT is out of V1.', evidence: ['ROADMAP-6.2', 'SOURCE-7.2'] },
  { id: 'P01-B-02', topic: 'Active mission caps', state: 'LOCKED', decision: 'Max 3 daily (EASY_START → SKILL_BUILDER → MEANINGFUL_PROGRESS), 1 station, 1 world, 1 adventure.', evidence: ['DUOLINGO-QUESTS', 'SOURCE-7.3'] },
  { id: 'P01-B-03', topic: 'Completion authority', state: 'LOCKED', decision: 'Only server-accepted learning/challenge events complete missions; UI-local progress cannot grant.', evidence: ['ROADMAP-6.5', 'ADR-0003'] },
  { id: 'P01-B-04', topic: 'Expiry', state: 'LOCKED', decision: 'Daily missions expire silently at local day end; expiry is not failure, removes nothing, carries nothing over. Station/World/Adventure missions do not expire.', evidence: ['ROADMAP-6.6', 'ROADMAP-8.5'] },
  // C — achievements
  { id: 'P01-C-01', topic: 'Achievement families', state: 'LOCKED', decision: 'PATH, SKILL, CHALLENGE, RECOVERY, TRANSFER, EXPLORATION, COLLECTION, PERSISTENCE, WORLD.', evidence: ['ROADMAP-7.2'] },
  { id: 'P01-C-02', topic: 'Unlock semantics', state: 'LOCKED', decision: 'Unlock once per learning identity, never revoked, no re-unlock; achievement ≠ mastery.', evidence: ['ROADMAP-7.4', 'ROADMAP-7.5'] },
  { id: 'P01-C-03', topic: 'Thresholds and IDs', state: 'PROVISIONAL', decision: 'Milestone thresholds below are working values; final IDs/thresholds/assets are fixed in P07.', reviewAt: 'P07', evidence: ['ROADMAP-7.3'] },
  // D — rewards / economy
  { id: 'P01-D-01', topic: 'V1 reward classes', state: 'LOCKED', decision: 'STAR_PROGRESS, MILESTONE_BADGE, CHARACTER_REACTION, WORLD_ELEMENT, CHARACTER_COSMETIC, PATH_REVEAL, STICKER.', evidence: ['SOURCE-8.1'] },
  { id: 'P01-D-02', topic: 'Child-facing token', state: 'LOCKED', decision: 'No child-facing token/gem/diamond balance in V1. STAR_PROGRESS is a progress meter, never a spendable balance.', evidence: ['PLAY-FAMILIES', 'PLAY-PAYMENTS', 'FAIRPLAY-PRODIGY-2021', 'DECI-1999'] },
  { id: 'P01-D-03', topic: 'Earn-only token for later versions', state: 'OPEN', decision: 'An earn-only, non-purchasable token may be proposed only with child test + Families policy re-check + PLAN_REVISION.', reviewAt: 'P07', evidence: ['ROADMAP-8.2'] },
  { id: 'P01-D-04', topic: 'Determinism', state: 'LOCKED', decision: 'Rewards are deterministic and pre-mapped; no random chests/loot boxes; no paid or premium-only variant of any reward.', evidence: ['PLAY-PAYMENTS', 'FAIRPLAY-PRODIGY-2021'] },
  { id: 'P01-D-05', topic: 'Reward contingency', state: 'LOCKED', decision: 'Rewards follow learning milestones/mission completion and are presented as informational ("you learned X"), never per tap, per minute, or per login.', evidence: ['DECI-1999', 'ROADMAP-6.7'] },
  { id: 'P01-D-06', topic: 'Reward frequency cap', state: 'PROVISIONAL', decision: 'At most 3 celebratory reward reveals per session; small reward for a mission, larger for accumulated milestones.', reviewAt: 'P06', evidence: ['KHAN-KIDS', 'ROADMAP-6.7'] },
  { id: 'P01-D-07', topic: 'Choice-based rewards', state: 'PROVISIONAL', decision: 'V1 grants are fixed; a "pick 1 of 2 cosmetics" choice is evaluated with the avatar workshop.', reviewAt: 'P08', evidence: ['ROADMAP-9.3'] },
  // E — Mission Hub placement
  { id: 'P01-E-01', topic: 'Mission Hub placement', state: 'LOCKED', decision: 'Secondary surface opened from one Path entry card; primary navigation stays مسیر / تمرین / من. Re-open only if the P06 discoverability test fails.', reviewAt: 'P06', evidence: ['ROADMAP-5.1', 'DUOLINGO-TSLW'] },
  // F — worlds
  { id: 'P01-F-01', topic: 'Unit → world mapping', state: 'PROVISIONAL', decision: '5 Grade 1 units map one-to-one to 5 worlds (W01–W05).', reviewAt: 'P09', evidence: ['ROADMAP-10.1'] },
  // G — signature challenges
  { id: 'P01-G-01', topic: 'Challenge coverage', state: 'LOCKED', decision: 'Exactly one Signature Challenge instance per station (25/25), each built on an existing G1 template.', evidence: ['ROADMAP-11.1', 'ROADMAP-11.2'] },
  { id: 'P01-G-02', topic: 'Challenge shape', state: 'LOCKED', decision: '30–90 s, ≤2 s objective, 3 rounds (2–4 allowed) + final moment; no hard timer for Grade 1 V1.', evidence: ['ROADMAP-11.3', 'ROADMAP-11.4', 'NNG-CHILD-UX'] },
  { id: 'P01-G-03', topic: 'Challenge results', state: 'LOCKED', decision: 'COMPLETED, COMPLETED_WITH_SUPPORT, NOT_YET, ABANDONED. No FAILED state; results never set mastery.', evidence: ['ROADMAP-4.3', 'ROADMAP-8.4'] },
  { id: 'P01-G-04', topic: 'Challenge reward', state: 'LOCKED', decision: 'First COMPLETED or COMPLETED_WITH_SUPPORT grants the station challenge reward once; hints never reduce it; replays give reactions only.', evidence: ['DECI-1999', 'ROADMAP-8.3'] },
  { id: 'P01-G-05', topic: 'Template binding', state: 'PROVISIONAL', decision: 'Each station challenge uses a template from G1_STATION_GAME_BASELINE; P10 re-validates against the skill graph.', reviewAt: 'P10', evidence: ['ROADMAP-12'] },
] as const;

export function decisionsNeedingReview(register: readonly ProductDecision[] = P01_DECISION_REGISTER): readonly ProductDecision[] {
  return register.filter((d) => d.state === 'OPEN' || d.state === 'PROVISIONAL');
}

/** P01 PASS precondition: no OPEN/PROVISIONAL decision without a scheduled review gate. */
export function unscheduledDecisions(register: readonly ProductDecision[] = P01_DECISION_REGISTER): readonly ProductDecision[] {
  return decisionsNeedingReview(register).filter((d) => d.reviewAt === undefined);
}

// ---------------------------------------------------------------------------
// B — Missions
// ---------------------------------------------------------------------------

export type MissionCategory = 'DAILY' | 'STATION' | 'WORLD' | 'ADVENTURE';
export type MissionExpiry = 'LOCAL_DAY_END' | 'NEVER';

/** Product events that can never be the sole completion reason for a mission (Roadmap §6.4). */
export type ForbiddenMissionTrigger = 'APP_OPENED' | 'TIME_SPENT' | 'SCREEN_VIEWED' | 'IDLE' | 'PURCHASE' | 'NOTIFICATION_OPENED';

export const FORBIDDEN_MISSION_TRIGGERS: readonly ForbiddenMissionTrigger[] = [
  'APP_OPENED', 'TIME_SPENT', 'SCREEN_VIEWED', 'IDLE', 'PURCHASE', 'NOTIFICATION_OPENED',
] as const;

export const MISSION_POLICY = {
  categories: ['DAILY', 'STATION', 'WORLD', 'ADVENTURE'] as readonly MissionCategory[],
  maxActive: { DAILY: MAX_ACTIVE_DAILY_QUESTS, STATION: 1, WORLD: 1, ADVENTURE: 1 } as const satisfies Record<MissionCategory, number>,
  expiry: { DAILY: 'LOCAL_DAY_END', STATION: 'NEVER', WORLD: 'NEVER', ADVENTURE: 'NEVER' } as const satisfies Record<MissionCategory, MissionExpiry>,
  completionAuthority: 'SERVER_ACCEPTED_EVENT' as const,
  uiLocalProgressCanGrant: false,
  expiryIsFailure: false,
  expiryRemovesLearningProgress: false,
  expiryRemovesGrantedRewards: false,
  incompleteDailyCarriesOver: false,
  expiryNotification: false,
  specialEventsInV1: false,
} as const;

/** Allowed completion triggers per mission category. Adventure completion is evaluated from its encounters. */
export const MISSION_TRIGGERS_BY_CATEGORY: Readonly<Record<MissionCategory, readonly QuestTriggerType[]>> = {
  DAILY: ['STATION_COMPLETED', 'SKILL_REVIEW_COMPLETED', 'RECOVERY_COMPLETED', 'GAME_COMPLETED', 'TRANSFER_COMPLETED', 'CHALLENGE_COMPLETED'],
  STATION: ['GAME_COMPLETED', 'CHALLENGE_COMPLETED', 'STATION_COMPLETED', 'RECOVERY_COMPLETED'],
  WORLD: ['STATION_COMPLETED', 'CHALLENGE_COMPLETED', 'MILESTONE_REACHED'],
  ADVENTURE: ['GAME_COMPLETED', 'TRANSFER_COMPLETED', 'CHALLENGE_COMPLETED'],
};

export function isMissionTriggerAllowed(category: MissionCategory, trigger: string): boolean {
  if ((FORBIDDEN_MISSION_TRIGGERS as readonly string[]).includes(trigger)) return false;
  return (MISSION_TRIGGERS_BY_CATEGORY[category] as readonly string[]).includes(trigger);
}

/**
 * Local-day key used for DAILY expiry. The learner's IANA time zone is explicit so
 * the server and Android agree on the boundary (e.g. Asia/Tehran).
 */
export function localDayKey(at: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function isDailyMissionExpired(assignedAt: Date, now: Date, timeZone: string): boolean {
  return localDayKey(assignedAt, timeZone) !== localDayKey(now, timeZone);
}

// ---------------------------------------------------------------------------
// C — Achievements
// ---------------------------------------------------------------------------

export type AchievementFamily =
  | 'PATH' | 'SKILL' | 'CHALLENGE' | 'RECOVERY' | 'TRANSFER'
  | 'EXPLORATION' | 'COLLECTION' | 'PERSISTENCE' | 'WORLD';

export const ACHIEVEMENT_FAMILIES: readonly AchievementFamily[] = [
  'PATH', 'SKILL', 'CHALLENGE', 'RECOVERY', 'TRANSFER', 'EXPLORATION', 'COLLECTION', 'PERSISTENCE', 'WORLD',
] as const;

export const ACHIEVEMENT_POLICY = {
  unlockOncePerLearningIdentity: true,
  revocable: false,
  reUnlockable: false,
  impliesMastery: false,
  progressMustBeDeterministic: true,
  /** PERSISTENCE counts distinct learning days, never consecutive days (no streak). */
  persistenceCountsConsecutiveDays: false,
  requiredFields: ['id', 'family', 'condition', 'childDescription', 'visualAssetRef'] as const,
} as const;

/** PROVISIONAL working thresholds (P01-C-03, final in P07). Ascending, positive integers. */
export const ACHIEVEMENT_MILESTONE_THRESHOLDS: Readonly<Record<AchievementFamily, readonly number[]>> = {
  PATH: [1, 5, 10, 25],
  SKILL: [1, 10, 32, 64],
  CHALLENGE: [1, 5, 15, 25],
  RECOVERY: [1, 5, 15],
  TRANSFER: [1, 5, 15],
  EXPLORATION: [1, 3, 5],
  COLLECTION: [5, 15, 30],
  PERSISTENCE: [3, 10, 30],
  WORLD: [1, 3, 5],
};

/** Highest threshold reached for a deterministic counter, or null. Never decreases for a non-decreasing count. */
export function reachedMilestone(family: AchievementFamily, count: number): number | null {
  const reached = ACHIEVEMENT_MILESTONE_THRESHOLDS[family].filter((t) => count >= t);
  return reached.length ? reached[reached.length - 1]! : null;
}

// ---------------------------------------------------------------------------
// D — Rewards / economy
// ---------------------------------------------------------------------------

export const REWARD_ECONOMY_V1 = {
  rewardClasses: ['STAR_PROGRESS', 'MILESTONE_BADGE', 'CHARACTER_REACTION', 'WORLD_ELEMENT', 'CHARACTER_COSMETIC', 'PATH_REVEAL', 'STICKER'] as readonly RewardType[],
  childFacingToken: 'NONE' as const,
  starProgressIsSpendable: false,
  starProgressShownAsBalance: false,
  purchasable: false,
  premiumOnlyRewards: false,
  tradeable: false,
  randomized: false,
  choiceBased: false,
  socialComparison: false,
  engagementContingent: false,
  presentation: 'INFORMATIONAL' as const,
  /** Mission cards preview the kind of reward ("یک تکه از نقشه"), never a number or price. */
  missionRewardPreview: 'CATEGORY_ONLY' as const,
  maxRewardRevealsPerSession: 3,
  revealMaxBlockingMs: FEEDBACK_BUDGET_MS.celebration,
} as const;

/** Source → allowed reward classes. Deterministic and explicit (Roadmap §9.3: no opaque mapping). */
export const REWARD_CLASSES_BY_SOURCE: Readonly<Record<RewardSourceType, readonly RewardType[]>> = {
  QUEST: ['STAR_PROGRESS', 'STICKER', 'CHARACTER_REACTION'],
  STATION_PROGRESS: ['STAR_PROGRESS', 'PATH_REVEAL', 'STICKER'],
  CHALLENGE_COMPLETION: ['STICKER', 'WORLD_ELEMENT', 'CHARACTER_REACTION'],
  MILESTONE: ['MILESTONE_BADGE', 'WORLD_ELEMENT', 'CHARACTER_COSMETIC'],
  LEARNING_ACHIEVEMENT: ['MILESTONE_BADGE', 'CHARACTER_COSMETIC'],
  ADVENTURE_COMPLETION: ['WORLD_ELEMENT', 'CHARACTER_COSMETIC'],
};

export function isRewardAllowedForSource(source: RewardSourceType, reward: RewardType): boolean {
  return REWARD_CLASSES_BY_SOURCE[source].includes(reward);
}

/** Validates a proposed reward definition payload against V1 economy guardrails before activation. */
export function rewardDefinitionViolations(def: { type: string; payload: Record<string, unknown> }): string[] {
  const v: string[] = [];
  if (!(REWARD_ECONOMY_V1.rewardClasses as readonly string[]).includes(def.type)) v.push('UNKNOWN_REWARD_CLASS');
  const forbiddenKeys = ['price', 'cost', 'currency', 'balance', 'odds', 'dropRate', 'premium', 'iapSku', 'tradeable'];
  for (const k of forbiddenKeys) if (k in def.payload) v.push(`FORBIDDEN_PAYLOAD_KEY:${k}`);
  return v;
}

// ---------------------------------------------------------------------------
// G — Signature Station Challenges (policy only; the engine is P04)
// ---------------------------------------------------------------------------

export type ChallengeResult = 'COMPLETED' | 'COMPLETED_WITH_SUPPORT' | 'NOT_YET' | 'ABANDONED';
export type ChallengeHintLevel = 'STRATEGY' | 'REPRESENTATION' | 'WORKED_STEP';
export type ChallengeLearningRole = Extract<MiniGameDefinition['learningRole'], 'GUIDED_PRACTICE' | 'INDEPENDENT_PRACTICE' | 'REVIEW' | 'TRANSFER'>;

export const SIGNATURE_CHALLENGE_POLICY = {
  perStation: 1,
  stationCount: 25,
  targetDurationSec: { min: 30, max: 90 },
  objectiveExplanationMaxMs: 2000,
  rounds: { default: 3, min: 2, max: 4 },
  hasFinalMoment: true,
  allowedTimerPolicies: ['NONE', 'SOFT'] as readonly GameTimerPolicy[],
  allowedLearningRoles: ['GUIDED_PRACTICE', 'INDEPENDENT_PRACTICE', 'REVIEW', 'TRANSFER'] as readonly ChallengeLearningRole[],
  isMasteryCheck: false,
  resultSetsMastery: false,
  resultSetsStationCompletion: false,
  results: ['COMPLETED', 'COMPLETED_WITH_SUPPORT', 'NOT_YET', 'ABANDONED'] as readonly ChallengeResult[],
  hints: {
    ladder: ['STRATEGY', 'REPRESENTATION', 'WORKED_STEP'] as readonly ChallengeHintLevel[],
    offerAfterWrongAttempts: 1,
    /** PROVISIONAL idle threshold, calibrated in P05/P13. */
    offerAfterIdleMs: 8000,
    revealsFinalAnswer: false,
    reducesReward: false,
  },
  failure: {
    attemptsPerRoundBeforeScaffold: 2,
    scaffoldThenContinue: true,
    losesEarnedRewards: false,
    replayAlwaysAvailable: true,
  },
  character: {
    reactsOnlyAfterAuthoritativeOutcome: true,
    maxAnswerReactionMs: FEEDBACK_BUDGET_MS.answer,
    leaksAnswer: false,
  },
  reward: {
    source: 'CHALLENGE_COMPLETION' as RewardSourceType,
    grantedOn: ['COMPLETED', 'COMPLETED_WITH_SUPPORT'] as readonly ChallengeResult[],
    oncePerChallengeInstance: true,
    replayGrants: false,
  },
} as const;

export interface ChallengeRoundOutcome {
  correct: boolean;
  attempts: number;
  hintsUsed: number;
  scaffolded: boolean;
}

/**
 * Child-facing result from authoritative round outcomes. Only a full set of rounds
 * can complete; any hint/scaffold means "with support" — never a lesser reward.
 */
export function resolveChallengeResult(rounds: readonly ChallengeRoundOutcome[], plannedRounds: number, exitedEarly: boolean): ChallengeResult {
  if (exitedEarly) return 'ABANDONED';
  if (rounds.length < plannedRounds) return 'ABANDONED';
  const solved = rounds.filter((r) => r.correct);
  if (solved.length < plannedRounds) return 'NOT_YET';
  return rounds.some((r) => r.hintsUsed > 0 || r.scaffolded) ? 'COMPLETED_WITH_SUPPORT' : 'COMPLETED';
}

export function challengeGrantsReward(result: ChallengeResult, alreadyGranted: boolean): boolean {
  return !alreadyGranted && SIGNATURE_CHALLENGE_POLICY.reward.grantedOn.includes(result);
}

/** Semantic feedback for a challenge result; NOT_YET is encouragement, never failure. */
export function semanticEventForChallengeResult(result: ChallengeResult): AnimationSemanticEvent | null {
  switch (result) {
    case 'COMPLETED':
    case 'COMPLETED_WITH_SUPPORT':
      return 'MILESTONE';
    case 'NOT_YET':
      return 'RECOVERY';
    case 'ABANDONED':
      return null;
  }
}

export interface SignatureChallengeDraft {
  stationId: string;
  gameCode: string;
  rounds: number;
  timerPolicy: GameTimerPolicy;
  learningRole: MiniGameDefinition['learningRole'];
  estimatedDurationSec: number;
}

export function signatureChallengeViolations(c: SignatureChallengeDraft): string[] {
  const v: string[] = [];
  const p = SIGNATURE_CHALLENGE_POLICY;
  const baseline = G1_STATION_GAME_BASELINE[c.stationId];
  if (!baseline) v.push('UNKNOWN_STATION');
  else if (!baseline.includes(c.gameCode)) v.push('TEMPLATE_NOT_IN_STATION_BASELINE');
  if (!G1_GAME_CATALOG.some((g) => g.code === c.gameCode)) v.push('UNKNOWN_TEMPLATE');
  if (!Number.isInteger(c.rounds) || c.rounds < p.rounds.min || c.rounds > p.rounds.max) v.push('ROUND_COUNT_OUT_OF_RANGE');
  if (!p.allowedTimerPolicies.includes(c.timerPolicy)) v.push('TIMER_POLICY_NOT_ALLOWED');
  if (!(p.allowedLearningRoles as readonly string[]).includes(c.learningRole)) v.push('LEARNING_ROLE_NOT_ALLOWED');
  if (c.estimatedDurationSec < p.targetDurationSec.min || c.estimatedDurationSec > p.targetDurationSec.max) v.push('DURATION_OUT_OF_TARGET');
  return v;
}
