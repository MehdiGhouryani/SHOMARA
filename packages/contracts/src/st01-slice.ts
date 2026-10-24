/**
 * P05 — ST01 Engagement Vertical Slice (Roadmap P05).
 *
 * One shared, client-safe contract for the Station 01 reference slice:
 *   existing learning flow + ST01 Signature Challenge + one Station Mission seed
 *   + one Achievement seed + one Reward seed + character reactions.
 *
 * Guardrails (ADR-0003, P01-B-03, P01-C-02, P01-D-02/04/05, P01-G-01..05):
 * - this module contains NO answer key; expected answers live only in
 *   `content_versions.evaluator_config` on the server (migration 0057);
 * - the challenge is a REVIEW-role practice layer, never a MASTERY_CHECK;
 * - mission progress and reward grants are DERIVED from server-accepted facts
 *   (station pass from station_check_results, challenge results from
 *   station_challenge_runs) — the client never reports progress;
 * - grants are keyed deterministically, so re-deriving is idempotent;
 * - achievement ≠ mastery, reward ≠ mastery (nothing here can set either).
 *
 * P06 (mission engine) and P07 (achievement/reward registry) generalize these seeds;
 * they must keep the same keys so ST01 history stays reconstructable.
 */
import type { ChallengeResult } from './engagement-policy';
import { DEFAULT_CHALLENGE_DIFFICULTY_POLICY, DEFAULT_CHALLENGE_EVIDENCE_POLICY, DEFAULT_CHALLENGE_HINT_POLICY, challengeRewardGrantKey, type ChallengeDifficultyLevel, type StationChallengeDefinition } from './challenge';
import { REWARD_ECONOMY_V1, isMissionTriggerAllowed, isRewardAllowedForSource, rewardDefinitionViolations, type AchievementFamily, type MissionCategory } from './engagement-policy';
import { rewardGrantKeyString, type QuestTriggerType, type RewardSourceType, type RewardType } from './engagement';

export const ST01_SLICE_VERSION = '2026-10-04-p05-v1' as const;

// ---------------------------------------------------------------------------
// Signature Challenge — "مسیر گمشده" on G1-GAME-001 (pattern path)
// ---------------------------------------------------------------------------

export const ST01_CHALLENGE_DEFINITION_ID = '2f050000-0000-4000-8000-000000000001' as const;
export const ST01_CHALLENGE_CODE = 'G1-ST01-CH-01' as const;
export const ST01_CHALLENGE_REWARD_CODE = 'G1-R-ST01-CH' as const;
export const ST01_CHALLENGE_EVALUATOR_VERSION = 'st01-ch-pattern-v1' as const;

/** Pattern tokens. Y=زرد, B=آبی, G=سبز, R=قرمز. `?` is the gap the child fills. */
export type PatternToken = 'Y' | 'B' | 'G' | 'R';
export const PATTERN_TOKEN_LABEL_FA: Readonly<Record<PatternToken, string>> = { Y: 'زرد', B: 'آبی', G: 'سبز', R: 'قرمز' };

/**
 * Child-safe presentation for one challenge variant. It is exactly what the server
 * stores in `metadata.presentation` and returns to the client. No answer index.
 */
export interface PatternPathPresentation {
  title: string;
  /** Visible sequence, ending in '?'. */
  sequence: readonly (PatternToken | '?')[];
  /** Length of the repeating unit (AB=2, AAB=3, ABC=3). A structural scaffold, never the answer. */
  unitLength: number;
  /** Option tokens in display order; the child answers with the option index. */
  optionTokens: readonly PatternToken[];
  /** Display labels (Persian), same order as optionTokens. */
  options: readonly string[];
  /** SUPPORTED variants visually group the repeating unit from the start. */
  groupUnits: boolean;
}

export interface St01ChallengeVariantSeed {
  level: ChallengeDifficultyLevel;
  contentVersionId: string;
  contentArtifactId: string;
  artifactCode: string;
  prompt: string;
  presentation: PatternPathPresentation;
}

export interface St01ChallengeRoundSeed {
  roundIndex: number;
  skillId: 'G1-SK009' | 'G1-SK010' | 'G1-SK011';
  variants: readonly St01ChallengeVariantSeed[];
}

function pres(title: string, seq: string, unitLength: number, optionTokens: PatternToken[], groupUnits: boolean): PatternPathPresentation {
  const sequence = seq.split(' ') as (PatternToken | '?')[];
  return { title, sequence, unitLength, optionTokens, options: optionTokens.map((t) => PATTERN_TOKEN_LABEL_FA[t]), groupUnits };
}
const cv = (n: number) => `26050000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const ca = (n: number) => `27050000-0000-4000-8000-${String(n).padStart(12, '0')}`;

/**
 * Three rounds, same skill at every level (difficulty never changes skill identity):
 *  R0 SK009 recognise an AB repeat · R1 SK010 continue an AAB/ABB repeat · R2 SK011 apply an ABC rule.
 * SUPPORTED = 2 options + grouped unit, CORE = 3 options, STRETCH = longer run + 4 options.
 */
export const ST01_CHALLENGE_ROUNDS: readonly St01ChallengeRoundSeed[] = [
  {
    roundIndex: 0, skillId: 'G1-SK009', variants: [
      { level: 'SUPPORTED', contentVersionId: cv(1), contentArtifactId: ca(1), artifactCode: 'G1-ST01-CH01-R0-SUPPORTED', prompt: 'کدام رنگ راه را ادامه می‌دهد؟', presentation: pres('تکه‌ی گمشده', 'Y B Y B ?', 2, ['Y', 'B'], true) },
      { level: 'CORE', contentVersionId: cv(2), contentArtifactId: ca(2), artifactCode: 'G1-ST01-CH01-R0-CORE', prompt: 'کدام رنگ راه را ادامه می‌دهد؟', presentation: pres('تکه‌ی گمشده', 'B G B G B ?', 2, ['B', 'G', 'Y'], false) },
      { level: 'STRETCH', contentVersionId: cv(3), contentArtifactId: ca(3), artifactCode: 'G1-ST01-CH01-R0-STRETCH', prompt: 'کدام رنگ راه را ادامه می‌دهد؟', presentation: pres('تکه‌ی گمشده', 'G R G R G ?', 2, ['G', 'Y', 'R', 'B'], false) },
    ],
  },
  {
    roundIndex: 1, skillId: 'G1-SK010', variants: [
      { level: 'SUPPORTED', contentVersionId: cv(4), contentArtifactId: ca(4), artifactCode: 'G1-ST01-CH01-R1-SUPPORTED', prompt: 'الگو را ادامه بده تا پل کامل شود.', presentation: pres('پل الگو', 'Y Y B Y Y ?', 3, ['Y', 'B'], true) },
      { level: 'CORE', contentVersionId: cv(5), contentArtifactId: ca(5), artifactCode: 'G1-ST01-CH01-R1-CORE', prompt: 'الگو را ادامه بده تا پل کامل شود.', presentation: pres('پل الگو', 'B B G B B ?', 3, ['G', 'B', 'Y'], false) },
      { level: 'STRETCH', contentVersionId: cv(6), contentArtifactId: ca(6), artifactCode: 'G1-ST01-CH01-R1-STRETCH', prompt: 'الگو را ادامه بده تا پل کامل شود.', presentation: pres('پل الگو', 'R G G R G G R ?', 3, ['R', 'Y', 'G', 'B'], false) },
    ],
  },
  {
    roundIndex: 2, skillId: 'G1-SK011', variants: [
      { level: 'SUPPORTED', contentVersionId: cv(7), contentArtifactId: ca(7), artifactCode: 'G1-ST01-CH01-R2-SUPPORTED', prompt: 'قانون الگو را پیدا کن و دروازه را باز کن.', presentation: pres('دروازه‌ی قانون', 'Y B G Y B ?', 3, ['G', 'Y'], true) },
      { level: 'CORE', contentVersionId: cv(8), contentArtifactId: ca(8), artifactCode: 'G1-ST01-CH01-R2-CORE', prompt: 'قانون الگو را پیدا کن و دروازه را باز کن.', presentation: pres('دروازه‌ی قانون', 'G R Y G R ?', 3, ['R', 'Y', 'G'], false) },
      { level: 'STRETCH', contentVersionId: cv(9), contentArtifactId: ca(9), artifactCode: 'G1-ST01-CH01-R2-STRETCH', prompt: 'قانون الگو را پیدا کن و دروازه را باز کن.', presentation: pres('دروازه‌ی قانون', 'B Y R B Y R B Y ?', 3, ['B', 'Y', 'G', 'R'], false) },
    ],
  },
] as const;

export const ST01_SIGNATURE_CHALLENGE: StationChallengeDefinition = {
  id: ST01_CHALLENGE_DEFINITION_ID,
  code: ST01_CHALLENGE_CODE,
  version: 1,
  status: 'ACTIVE',
  gradeId: 'G1',
  stationId: 'G1-ST01',
  gameCode: 'G1-GAME-001',
  primarySkillIds: ['G1-SK009', 'G1-SK010'],
  supportingSkillIds: ['G1-SK011'],
  objective: 'الگو را ادامه بده تا راه پیدا شود',
  learningRole: 'REVIEW',
  rounds: ST01_CHALLENGE_ROUNDS.map((r) => ({ roundIndex: r.roundIndex, skillId: r.skillId, variants: r.variants.map((v) => ({ level: v.level, contentVersionId: v.contentVersionId, skillId: r.skillId })) })),
  finalMoment: 'SUMMARY_CELEBRATION',
  difficultyPolicy: DEFAULT_CHALLENGE_DIFFICULTY_POLICY,
  hintPolicy: DEFAULT_CHALLENGE_HINT_POLICY,
  timerPolicy: { policy: 'NONE' },
  evaluatorVersion: ST01_CHALLENGE_EVALUATOR_VERSION,
  rewardPolicy: { source: 'CHALLENGE_COMPLETION', rewardClass: 'STICKER', rewardDefinitionCode: ST01_CHALLENGE_REWARD_CODE, grantedOn: ['COMPLETED', 'COMPLETED_WITH_SUPPORT'], oncePerChallengeInstance: true, replayGrants: false },
  evidencePolicy: DEFAULT_CHALLENGE_EVIDENCE_POLICY,
  estimatedDurationSec: 60,
};

/** Hint copy per ladder level. Generic strategy language only: never names a colour or position answer. */
export const ST01_CHALLENGE_HINT_COPY_FA = {
  STRATEGY: 'رنگ‌ها را از اول آرام بگو و ببین کدام تکه دوباره می‌آید.',
  REPRESENTATION: 'تکه‌های تکراری را جدا جدا نشانت می‌دهم؛ با انگشت دنبالشان کن.',
  WORKED_STEP: 'تکه‌ی آخر را با تکه‌ی اول مقایسه کن؛ جای خالی همان‌جای تکه است.',
} as const;

// ---------------------------------------------------------------------------
// Seeds: one Station Mission, one Achievement, one Reward (+ the existing STAR_PROGRESS seed)
// ---------------------------------------------------------------------------

export interface St01MissionStep { id: 'STATION_PASSED' | 'CHALLENGE_COMPLETED'; trigger: { type: QuestTriggerType; targetRef: string } }

export const ST01_STATION_MISSION = {
  id: '2f050000-0000-4000-8000-000000000101',
  code: 'G1-M-ST01',
  version: '1',
  category: 'STATION' as MissionCategory,
  title: 'ماموریت ایستگاه ۱',
  objective: 'ایستگاه را کامل کن و چالش مسیر گمشده را انجام بده.',
  steps: [
    { id: 'STATION_PASSED', trigger: { type: 'STATION_COMPLETED', targetRef: 'ST01' } },
    { id: 'CHALLENGE_COMPLETED', trigger: { type: 'CHALLENGE_COMPLETED', targetRef: ST01_CHALLENGE_CODE } },
  ] as readonly St01MissionStep[],
  maxProgress: 2,
  expiry: 'NEVER' as const,
  reward: { code: 'G1-R-001', type: 'STAR_PROGRESS' as RewardType, source: 'QUEST' as RewardSourceType },
  /** Mission cards preview the KIND of reward, never a number or price (REWARD_ECONOMY_V1.missionRewardPreview). */
  rewardPreviewFa: 'یک ستاره‌ی پیشرفت',
} as const;

export const ST01_ACHIEVEMENT = {
  code: 'G1-ACH-CHALLENGE-001',
  family: 'CHALLENGE' as AchievementFamily,
  /** First threshold of ACHIEVEMENT_MILESTONE_THRESHOLDS.CHALLENGE (PROVISIONAL, final in P07). */
  threshold: 1,
  condition: { type: 'CHALLENGE_COMPLETED' as QuestTriggerType, count: 1 },
  childDescription: 'اولین چالش ویژه را کامل کردی.',
  titleFa: 'کاشف چالش',
  visualAssetRef: 'achievement/challenge-first',
  impliesMastery: false,
} as const;

export interface St01RewardSeed { code: string; type: RewardType; source: RewardSourceType; titleFa: string; descriptionFa: string; payload: Record<string, unknown> }

export const ST01_REWARD_SEEDS: readonly St01RewardSeed[] = [
  { code: ST01_CHALLENGE_REWARD_CODE, type: 'STICKER', source: 'CHALLENGE_COMPLETION', titleFa: 'برچسب مسیر الگو', descriptionFa: 'چون الگوها را ادامه دادی، این برچسب مال توست.', payload: { sticker: 'PATTERN_PATH', assetRef: 'sticker/pattern-path' } },
  { code: 'G1-R-001', type: 'STAR_PROGRESS', source: 'QUEST', titleFa: 'ستاره‌ی پیشرفت', descriptionFa: 'ماموریت ایستگاه ۱ را کامل کردی.', payload: { meter: 'PATH_PROGRESS', assetRef: 'reward/star-progress' } },
] as const;

export function st01RewardSeed(code: string): St01RewardSeed | null { return ST01_REWARD_SEEDS.find((r) => r.code === code) ?? null; }

// ---------------------------------------------------------------------------
// Deterministic derivation (TS mirror of SQL engagement_sync_st01 in migration 0057)
// ---------------------------------------------------------------------------

export interface St01ChallengeRunFact {
  runId: string;
  challengeCode: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  result: ChallengeResult | null;
  /** Set only by the server finalizer (station_challenge_reward_eligibility outbox). */
  rewardEligible: boolean;
  rewardGrantKey: string | null;
}

export interface St01EngagementFacts {
  learningIdentityId: string;
  /** Authoritative station pass: ≥2 qualifying STATION_PASS checks in distinct sessions. */
  stationPassed: boolean;
  challengeRuns: readonly St01ChallengeRunFact[];
  existingGrantKeys: readonly string[];
}

export interface St01GrantIntent { idempotencyKey: string; rewardCode: string; rewardType: RewardType; sourceType: RewardSourceType; sourceRef: string }

export interface St01EngagementDerivation {
  mission: { code: string; status: 'ACTIVE' | 'COMPLETED'; progress: number; maxProgress: number; steps: { id: St01MissionStep['id']; done: boolean }[] };
  achievement: { code: string; unlocked: boolean };
  /** Grants that do not exist yet. Re-deriving after they are stored yields []. */
  newGrants: St01GrantIntent[];
  /** Every grant the learner should own after this derivation (existing + new). */
  allGrantKeys: string[];
  setsMastery: false;
  setsStationCompletion: false;
}

const COMPLETING: readonly ChallengeResult[] = ['COMPLETED', 'COMPLETED_WITH_SUPPORT'];

export function st01MissionRewardGrantKey(learningIdentityId: string): string {
  return rewardGrantKeyString({ learningIdentityId, sourceType: ST01_STATION_MISSION.reward.source, sourceRef: ST01_STATION_MISSION.code, rewardDefinitionId: ST01_STATION_MISSION.reward.code });
}

export function st01ChallengeRewardGrantKey(learningIdentityId: string): string {
  return challengeRewardGrantKey(learningIdentityId, ST01_SIGNATURE_CHALLENGE);
}

export function deriveSt01Engagement(facts: St01EngagementFacts): St01EngagementDerivation {
  const runs = facts.challengeRuns.filter((r) => r.challengeCode === ST01_CHALLENGE_CODE);
  const challengeCompleted = runs.some((r) => r.status === 'COMPLETED' && r.result !== null && COMPLETING.includes(r.result));
  const steps = [
    { id: 'STATION_PASSED' as const, done: facts.stationPassed },
    { id: 'CHALLENGE_COMPLETED' as const, done: challengeCompleted },
  ];
  const progress = steps.filter((s) => s.done).length;
  const missionCompleted = progress >= ST01_STATION_MISSION.maxProgress;

  const existing = new Set(facts.existingGrantKeys);
  const wanted: St01GrantIntent[] = [];
  // Challenge reward: only from the server outbox (first qualifying run), never from client state.
  const eligibleRun = runs.find((r) => r.rewardEligible && r.rewardGrantKey);
  if (eligibleRun) {
    wanted.push({ idempotencyKey: eligibleRun.rewardGrantKey!, rewardCode: ST01_CHALLENGE_REWARD_CODE, rewardType: 'STICKER', sourceType: 'CHALLENGE_COMPLETION', sourceRef: eligibleRun.runId });
  }
  if (missionCompleted) {
    wanted.push({ idempotencyKey: st01MissionRewardGrantKey(facts.learningIdentityId), rewardCode: ST01_STATION_MISSION.reward.code, rewardType: ST01_STATION_MISSION.reward.type, sourceType: ST01_STATION_MISSION.reward.source, sourceRef: ST01_STATION_MISSION.code });
  }
  const newGrants = wanted.filter((g) => !existing.has(g.idempotencyKey));
  return {
    mission: { code: ST01_STATION_MISSION.code, status: missionCompleted ? 'COMPLETED' : 'ACTIVE', progress, maxProgress: ST01_STATION_MISSION.maxProgress, steps },
    achievement: { code: ST01_ACHIEVEMENT.code, unlocked: challengeCompleted },
    newGrants,
    allGrantKeys: [...new Set([...facts.existingGrantKeys, ...wanted.map((g) => g.idempotencyKey)])],
    setsMastery: false,
    setsStationCompletion: false,
  };
}

// ---------------------------------------------------------------------------
// Client projection (what GET /api/v1/engagement/st01 returns)
// ---------------------------------------------------------------------------

export interface St01RewardView { grantId: string; code: string; type: RewardType; titleFa: string; descriptionFa: string; grantedAt: string; presented: boolean }

export interface St01EngagementProjection {
  sliceVersion: typeof ST01_SLICE_VERSION;
  mission: St01EngagementDerivation['mission'] & { titleFa: string; objectiveFa: string; rewardPreviewFa: string };
  achievement: { code: string; unlocked: boolean; titleFa: string; descriptionFa: string };
  rewards: St01RewardView[];
  /** Rewards to reveal now: granted, not yet presented, capped by REWARD_ECONOMY_V1.maxRewardRevealsPerSession. */
  pendingReveals: St01RewardView[];
  challengeAvailable: boolean;
}

export function pendingRevealsFor(rewards: readonly St01RewardView[], alreadyRevealedThisSession = 0): St01RewardView[] {
  const budget = Math.max(0, REWARD_ECONOMY_V1.maxRewardRevealsPerSession - alreadyRevealedThisSession);
  return rewards.filter((r) => !r.presented).slice(0, budget);
}

// ---------------------------------------------------------------------------
// Validation (run by the P05 verifier and tests)
// ---------------------------------------------------------------------------

export function st01SliceViolations(): string[] {
  const v: string[] = [];
  const m = ST01_STATION_MISSION;
  for (const s of m.steps) if (!isMissionTriggerAllowed(m.category, s.trigger.type)) v.push(`MISSION_TRIGGER_NOT_ALLOWED:${s.trigger.type}`);
  if (!isRewardAllowedForSource(m.reward.source, m.reward.type)) v.push('MISSION_REWARD_CLASS_NOT_ALLOWED');
  if (m.maxProgress !== m.steps.length) v.push('MISSION_PROGRESS_MISMATCH');
  if (/[0-9۰-۹]/.test(m.rewardPreviewFa.replace('۱', ''))) v.push('MISSION_REWARD_PREVIEW_HAS_NUMBER');
  for (const r of ST01_REWARD_SEEDS) {
    if (!isRewardAllowedForSource(r.source, r.type)) v.push(`REWARD_CLASS_NOT_ALLOWED:${r.code}`);
    v.push(...rewardDefinitionViolations({ type: r.type, payload: r.payload }).map((x) => `${r.code}:${x}`));
  }
  if (ST01_ACHIEVEMENT.impliesMastery !== false) v.push('ACHIEVEMENT_IMPLIES_MASTERY');
  for (const round of ST01_CHALLENGE_ROUNDS) {
    for (const variant of round.variants) {
      const p = variant.presentation;
      if (p.sequence[p.sequence.length - 1] !== '?') v.push(`SEQUENCE_MUST_END_WITH_GAP:${variant.artifactCode}`);
      if (p.sequence.filter((t) => t === '?').length !== 1) v.push(`SEQUENCE_ONE_GAP:${variant.artifactCode}`);
      if (p.options.length !== p.optionTokens.length) v.push(`OPTIONS_MISMATCH:${variant.artifactCode}`);
      if (p.optionTokens.length < 2 || p.optionTokens.length > 4) v.push(`OPTION_COUNT:${variant.artifactCode}`);
      if (new Set(p.optionTokens).size !== p.optionTokens.length) v.push(`OPTION_DUPLICATE:${variant.artifactCode}`);
      if ((variant.level === 'SUPPORTED') !== p.groupUnits) v.push(`GROUPING_ONLY_FOR_SUPPORTED:${variant.artifactCode}`);
      // The visible run must be internally consistent with the declared unit (no contradicting tokens).
      const visible = p.sequence.slice(0, -1);
      for (let i = p.unitLength; i < visible.length; i++) if (visible[i] !== visible[i - p.unitLength]) v.push(`SEQUENCE_BREAKS_UNIT:${variant.artifactCode}`);
      if (visible.length < p.unitLength * 1.5) v.push(`SEQUENCE_TOO_SHORT_TO_INFER:${variant.artifactCode}`);
    }
  }
  for (const copy of Object.values(ST01_CHALLENGE_HINT_COPY_FA)) {
    if (Object.values(PATTERN_TOKEN_LABEL_FA).some((label) => copy.includes(label))) v.push('HINT_NAMES_A_COLOUR');
  }
  return v;
}

/**
 * Answer derived from the visible structure only. Used by tests/verifier to prove that
 * every variant has exactly one option consistent with its pattern (well-posed item)
 * and that the server answer key agrees. Never imported by client UI code.
 */
export function inferPatternAnswerIndex(p: PatternPathPresentation): number {
  const gapIndex = p.sequence.length - 1;
  const expected = p.sequence[gapIndex - p.unitLength];
  return p.optionTokens.findIndex((t) => t === expected);
}
