/**
 * P04 — Station Challenge Foundation: the one canonical challenge contract.
 *
 * Layering (Roadmap P04 scope):
 *   Game Template → Station Challenge Instance → Encounter → Attempt → Evaluator → Evidence → Learning Runtime
 *
 * A Signature Challenge is NOT a second engine. Every round attempt is an ordinary
 * Learning Runtime encounter + attempt, evaluated server-side by the existing
 * evaluator. This module only defines the shared shape, the deterministic policies
 * (difficulty step, round progression, idempotency keys, offline replay) and the
 * validators that must pass before a definition may become ACTIVE.
 *
 * Guardrails (ADR-0003, ADR-0035, P01-G-01..05):
 * - client never decides correctness, mastery, station completion or reward;
 * - difficulty never changes skill identity (all variants of a round share one skill);
 * - no HARD timer, never a MASTERY_CHECK role;
 * - challenge results never set mastery or station completion;
 * - no evaluator / answer key in any client-visible payload;
 * - every write is idempotent and replay-safe.
 */
import type { RewardSourceType, RewardType } from './engagement';
import { G1_GAME_CATALOG, rewardGrantKeyString } from './engagement';
import {
  SIGNATURE_CHALLENGE_POLICY,
  isRewardAllowedForSource,
  signatureChallengeViolations,
  type ChallengeHintLevel,
  type ChallengeLearningRole,
  type ChallengeResult,
} from './engagement-policy';

export const CHALLENGE_CONTRACT_VERSION = '2026-10-04-p04-v1' as const;

// ---------------------------------------------------------------------------
// Template registry (engine path). One adapter per game template; adapters only
// validate the *shape* of a raw response — never its truth.
// ---------------------------------------------------------------------------

/** Mirrors `content_versions.interaction_type`. */
export type ChallengeInteractionType = 'MULTIPLE_CHOICE' | 'TAP' | 'DRAG_DROP' | 'SORT' | 'COUNT' | 'COLOR' | 'NUMBER_LINE' | 'MATCH' | 'MINI_GAME';

export type ChallengeActionShape =
  | { kind: 'OPTION_INDEX'; maxOptions: number }
  | { kind: 'INTEGER'; min: number; max: number }
  | { kind: 'ORDERED_INDICES'; minLength: number; maxLength: number; maxIndex: number };

export interface ChallengeTemplateAdapter {
  gameCode: `G1-GAME-${string}`;
  interactionTypes: readonly ChallengeInteractionType[];
  actionShape: ChallengeActionShape;
  /** Child-facing objective must be explainable within the 2 s objective budget. */
  objectiveMaxChars: number;
}

/**
 * Templates whose engine path exists now. ST01 uses G1-GAME-002 + G1-GAME-001 (P05);
 * remaining templates are added with their station content in P10 — through this
 * registry, never through a second engine.
 */
export const CHALLENGE_TEMPLATE_ADAPTERS: Readonly<Record<string, ChallengeTemplateAdapter>> = {
  'G1-GAME-001': { gameCode: 'G1-GAME-001', interactionTypes: ['MULTIPLE_CHOICE', 'COLOR', 'TAP'], actionShape: { kind: 'OPTION_INDEX', maxOptions: 4 }, objectiveMaxChars: 48 },
  'G1-GAME-002': { gameCode: 'G1-GAME-002', interactionTypes: ['COUNT', 'TAP', 'MULTIPLE_CHOICE'], actionShape: { kind: 'INTEGER', min: 0, max: 20 }, objectiveMaxChars: 48 },
};

export function challengeTemplateAdapter(gameCode: string): ChallengeTemplateAdapter | null {
  return CHALLENGE_TEMPLATE_ADAPTERS[gameCode] ?? null;
}

/** Shape-only check of a raw response. Returns null when acceptable, else a reason code. */
export function challengeActionShapeViolation(shape: ChallengeActionShape, payload: unknown): string | null {
  switch (shape.kind) {
    case 'OPTION_INDEX':
      return Number.isInteger(payload) && (payload as number) >= 0 && (payload as number) < shape.maxOptions ? null : 'ACTION_OPTION_INDEX_INVALID';
    case 'INTEGER':
      return Number.isInteger(payload) && (payload as number) >= shape.min && (payload as number) <= shape.max ? null : 'ACTION_INTEGER_OUT_OF_RANGE';
    case 'ORDERED_INDICES': {
      if (!Array.isArray(payload)) return 'ACTION_ORDER_NOT_ARRAY';
      if (payload.length < shape.minLength || payload.length > shape.maxLength) return 'ACTION_ORDER_LENGTH_INVALID';
      return payload.every((v) => Number.isInteger(v) && v >= 0 && v <= shape.maxIndex) ? null : 'ACTION_ORDER_INDEX_INVALID';
    }
  }
}

// ---------------------------------------------------------------------------
// Policies
// ---------------------------------------------------------------------------

/** SUPPORTED = scaffolded representation, CORE = default, STRETCH = harder numbers/longer pattern. Same skill at every level. */
export type ChallengeDifficultyLevel = 'SUPPORTED' | 'CORE' | 'STRETCH';
export const CHALLENGE_DIFFICULTY_LEVELS: readonly ChallengeDifficultyLevel[] = ['SUPPORTED', 'CORE', 'STRETCH'] as const;

export interface ChallengeDifficultyPolicy {
  mode: 'FIXED' | 'STEP_ADAPTIVE';
  startLevel: ChallengeDifficultyLevel;
  /** Step down one level after this many wrong attempts in a round (the scaffold). */
  stepDownAfterWrongAttempts: number;
  /** Step up one level after this many consecutive first-try-correct rounds. */
  stepUpAfterFirstTryRounds: number;
  /** Structural guarantee: difficulty selects a variant of the SAME skill. Always true. */
  preservesSkillIdentity: true;
}

export interface ChallengeHintPolicy {
  ladder: readonly ChallengeHintLevel[];
  offerAfterWrongAttempts: number;
  offerAfterIdleMs: number;
  revealsFinalAnswer: false;
  reducesReward: false;
}

export interface ChallengeTimerPolicy {
  policy: 'NONE' | 'SOFT';
  /** SOFT only: a calm pacing cue; expiry never ends a round or changes evaluation. */
  softPaceSec?: number;
}

export interface ChallengeRewardPolicy {
  source: Extract<RewardSourceType, 'CHALLENGE_COMPLETION'>;
  rewardClass: RewardType;
  /** Reward catalog code (e.g. G1-R-ST01-CH). Resolved and granted by the P07 grant service. */
  rewardDefinitionCode: string;
  grantedOn: readonly ChallengeResult[];
  oncePerChallengeInstance: true;
  replayGrants: false;
}

export interface ChallengeEvidencePolicy {
  /**
   * PRACTICE_EVIDENCE: round attempts are ordinary practice encounters for the learning
   * state (like any GUIDED/INDEPENDENT encounter). They are structurally excluded from
   * station-pass checks and mastery evaluations because the role is never MASTERY_CHECK.
   */
  mode: 'PRACTICE_EVIDENCE';
  countsTowardStationPass: false;
  countsTowardMastery: false;
  /** Scaffolded (SUPPORTED) attempts are recorded with `scaffolded=true` provenance. */
  tagsScaffoldedAttempts: true;
}

export interface ChallengeRoundVariant {
  level: ChallengeDifficultyLevel;
  /** Server-side content_versions id. The variant carries no answer key; evaluator config stays server-only. */
  contentVersionId: string;
  skillId: string;
}

export interface ChallengeRoundDefinition {
  roundIndex: number;
  skillId: string;
  variants: readonly ChallengeRoundVariant[];
}

export type ChallengeDefinitionStatus = 'DRAFT' | 'ACTIVE' | 'RETIRED';

/** Canonical challenge definition (server-authoritative). Roadmap P04 "Contract". */
export interface StationChallengeDefinition {
  id: string;
  code: string;
  version: number;
  status: ChallengeDefinitionStatus;
  gradeId: string;
  stationId: string;
  gameCode: string;
  primarySkillIds: readonly string[];
  supportingSkillIds: readonly string[];
  objective: string;
  learningRole: ChallengeLearningRole;
  rounds: readonly ChallengeRoundDefinition[];
  finalMoment: 'SUMMARY_CELEBRATION';
  difficultyPolicy: ChallengeDifficultyPolicy;
  hintPolicy: ChallengeHintPolicy;
  timerPolicy: ChallengeTimerPolicy;
  /** Must equal `evaluator_config.version` of every variant's content version. */
  evaluatorVersion: string;
  rewardPolicy: ChallengeRewardPolicy;
  evidencePolicy: ChallengeEvidencePolicy;
  estimatedDurationSec: number;
}

/** What a client may see. No content-version ids per level, no evaluator data. */
export interface StationChallengeClientView {
  challengeId: string;
  code: string;
  version: number;
  stationId: string;
  gameCode: string;
  objective: string;
  plannedRounds: number;
  timerPolicy: ChallengeTimerPolicy;
  hintLadder: readonly ChallengeHintLevel[];
  finalMoment: 'SUMMARY_CELEBRATION';
  contractVersion: typeof CHALLENGE_CONTRACT_VERSION;
}

export function toChallengeClientView(def: StationChallengeDefinition): StationChallengeClientView {
  return {
    challengeId: def.id,
    code: def.code,
    version: def.version,
    stationId: def.stationId,
    gameCode: def.gameCode,
    objective: def.objective,
    plannedRounds: def.rounds.length,
    timerPolicy: def.timerPolicy,
    hintLadder: def.hintPolicy.ladder,
    finalMoment: def.finalMoment,
    contractVersion: CHALLENGE_CONTRACT_VERSION,
  };
}

export const DEFAULT_CHALLENGE_DIFFICULTY_POLICY: ChallengeDifficultyPolicy = {
  mode: 'STEP_ADAPTIVE',
  startLevel: 'CORE',
  stepDownAfterWrongAttempts: SIGNATURE_CHALLENGE_POLICY.failure.attemptsPerRoundBeforeScaffold,
  stepUpAfterFirstTryRounds: 2,
  preservesSkillIdentity: true,
};

export const DEFAULT_CHALLENGE_HINT_POLICY: ChallengeHintPolicy = {
  ladder: SIGNATURE_CHALLENGE_POLICY.hints.ladder,
  offerAfterWrongAttempts: SIGNATURE_CHALLENGE_POLICY.hints.offerAfterWrongAttempts,
  offerAfterIdleMs: SIGNATURE_CHALLENGE_POLICY.hints.offerAfterIdleMs,
  revealsFinalAnswer: false,
  reducesReward: false,
};

export const DEFAULT_CHALLENGE_EVIDENCE_POLICY: ChallengeEvidencePolicy = {
  mode: 'PRACTICE_EVIDENCE',
  countsTowardStationPass: false,
  countsTowardMastery: false,
  tagsScaffoldedAttempts: true,
};

/**
 * Attempts allowed per round: N wrong attempts trigger the scaffold (step down), then
 * one scaffolded attempt; after that the round closes and the run continues
 * ("scaffold then continue", never a dead end, never a lost reward).
 */
export function maxAttemptsPerRound(policy: ChallengeDifficultyPolicy = DEFAULT_CHALLENGE_DIFFICULTY_POLICY): number {
  return policy.stepDownAfterWrongAttempts + 1;
}

// ---------------------------------------------------------------------------
// Deterministic difficulty selection (same inputs → same level, server and tests agree)
// ---------------------------------------------------------------------------

export interface ChallengeRoundHistoryItem {
  solved: boolean;
  attempts: number;
}

function stepLevel(level: ChallengeDifficultyLevel, delta: -1 | 1): ChallengeDifficultyLevel {
  const i = CHALLENGE_DIFFICULTY_LEVELS.indexOf(level);
  return CHALLENGE_DIFFICULTY_LEVELS[Math.min(CHALLENGE_DIFFICULTY_LEVELS.length - 1, Math.max(0, i + delta))]!;
}

/** Level for the first attempt of the next round, from closed rounds only. */
export function levelForNextRound(policy: ChallengeDifficultyPolicy, closedRounds: readonly ChallengeRoundHistoryItem[]): ChallengeDifficultyLevel {
  if (policy.mode === 'FIXED') return policy.startLevel;
  let level = policy.startLevel;
  let firstTryStreak = 0;
  for (const r of closedRounds) {
    if (r.solved && r.attempts === 1) {
      firstTryStreak += 1;
      if (firstTryStreak >= policy.stepUpAfterFirstTryRounds) { level = stepLevel(level, 1); firstTryStreak = 0; }
    } else {
      firstTryStreak = 0;
      // A round that needed the scaffold starts the next one back at the start level (not lower):
      // support is temporary, never a demotion.
      if (!r.solved || r.attempts > policy.stepDownAfterWrongAttempts) level = policy.startLevel;
    }
  }
  return level;
}

/** Level for the next attempt inside the current round. */
export function levelForNextAttempt(policy: ChallengeDifficultyPolicy, roundStartLevel: ChallengeDifficultyLevel, wrongAttemptsInRound: number): ChallengeDifficultyLevel {
  if (policy.mode === 'FIXED') return roundStartLevel;
  return wrongAttemptsInRound >= policy.stepDownAfterWrongAttempts ? 'SUPPORTED' : roundStartLevel;
}

/** Variant for a level; falls back towards CORE but never to another skill. */
export function variantForLevel(round: ChallengeRoundDefinition, level: ChallengeDifficultyLevel): ChallengeRoundVariant {
  const exact = round.variants.find((v) => v.level === level);
  if (exact) return exact;
  const core = round.variants.find((v) => v.level === 'CORE');
  if (core) return core;
  return round.variants[0]!;
}

// ---------------------------------------------------------------------------
// Hints
// ---------------------------------------------------------------------------

/** Hint for the n-th request in a round (0-based); the ladder never goes past WORKED_STEP and never reveals the answer. */
export function hintLevelForRequest(policy: ChallengeHintPolicy, requestIndex: number): ChallengeHintLevel {
  return policy.ladder[Math.min(Math.max(0, requestIndex), policy.ladder.length - 1)]!;
}

export function shouldOfferHint(policy: ChallengeHintPolicy, wrongAttemptsInRound: number, idleMs: number): boolean {
  return wrongAttemptsInRound >= policy.offerAfterWrongAttempts || idleMs >= policy.offerAfterIdleMs;
}

// ---------------------------------------------------------------------------
// Idempotency + offline replay
// ---------------------------------------------------------------------------

const KEY_PART = /^[A-Za-z0-9_.-]{1,80}$/;
function part(name: string, value: string | number): string {
  const s = String(value);
  if (!KEY_PART.test(s)) throw new Error(`CHALLENGE_KEY_PART_INVALID:${name}`);
  return s;
}

/** One logical "start this challenge" operation. Retrying with the same nonce returns the same run. */
export function challengeRunIdempotencyKey(input: { installationId: string; sessionId: string; challengeId: string; startNonce: string }): string {
  return `challenge:v1:start:${part('installationId', input.installationId)}:${part('sessionId', input.sessionId)}:${part('challengeId', input.challengeId)}:${part('startNonce', input.startNonce)}`;
}

/** One round attempt. Deterministic from run/round/attempt so an offline replay is the same request. */
export function challengeRoundIdempotencyKey(input: { runId: string; roundIndex: number; attemptNumber: number }): string {
  if (!Number.isInteger(input.roundIndex) || input.roundIndex < 0) throw new Error('CHALLENGE_KEY_PART_INVALID:roundIndex');
  if (!Number.isInteger(input.attemptNumber) || input.attemptNumber < 1) throw new Error('CHALLENGE_KEY_PART_INVALID:attemptNumber');
  return `challenge:v1:round:${part('runId', input.runId)}:r${input.roundIndex}:a${input.attemptNumber}`;
}

export function challengeHintIdempotencyKey(input: { runId: string; roundIndex: number; hintIndex: number }): string {
  return `challenge:v1:hint:${part('runId', input.runId)}:r${input.roundIndex}:h${input.hintIndex}`;
}

/** Stable fingerprint of a raw response, used to reject key reuse with a different payload. */
export function challengeAnswerFingerprint(answers: readonly { answerIndex: number; answerPayload: unknown }[]): string {
  return JSON.stringify([...answers].sort((a, b) => a.answerIndex - b.answerIndex).map((a) => [a.answerIndex, canonical(a.answerPayload)]));
}

function canonical(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, canonical((v as Record<string, unknown>)[k])]));
  return v;
}

/**
 * Offline replay semantics (Roadmap P04 PASS: "offline replay semantics are defined").
 * Mirrors the existing offline-sync contract (docs/api/API_OFFLINE_SYNC_CONTRACT.md).
 */
export const CHALLENGE_OFFLINE_REPLAY_SEMANTICS = {
  /** Round attempts are queued FIFO per run and replayed strictly in order. */
  ordering: 'FIFO_PER_RUN',
  /** The server evaluates on replay; the queued client result is never trusted. */
  evaluationOnReplay: 'SERVER',
  /** Same key + same fingerprint → the stored result, no second evidence/attempt. */
  duplicateReplay: 'RETURN_STORED_RESULT',
  /** Same key + different fingerprint → rejected, never re-evaluated. */
  keyReuseWithDifferentPayload: 'REJECT_IDEMPOTENCY_PAYLOAD_MISMATCH',
  /** A later round arriving before an earlier one is retryable, not fatal. */
  outOfOrderRound: 'RETRY_AFTER_PREDECESSOR',
  /** While offline the child sees a neutral "saved, will check" state; no correctness/near-miss reaction. */
  offlineChildFeedback: 'NEUTRAL_SYNC_PENDING',
  /** Run result and reward eligibility exist only after every round was server-accepted. */
  resultRequiresAllRoundsAcked: true,
  /** A run abandoned offline is finalized ABANDONED on the server; nothing is lost and replay stays available. */
  abandonedRunKeepsEarlierEvidence: true,
} as const;

// ---------------------------------------------------------------------------
// Result + reward eligibility
// ---------------------------------------------------------------------------

export function challengeRewardGrantKey(learningIdentityId: string, def: Pick<StationChallengeDefinition, 'code' | 'rewardPolicy'>): string {
  return rewardGrantKeyString({ learningIdentityId, sourceType: def.rewardPolicy.source, sourceRef: def.code, rewardDefinitionId: def.rewardPolicy.rewardDefinitionCode });
}

// ---------------------------------------------------------------------------
// Validation (definition must be violation-free before ACTIVE)
// ---------------------------------------------------------------------------

/** Keys that would leak an answer key / evaluator into a definition or client payload. */
export const FORBIDDEN_CLIENT_ANSWER_KEYS = ['expectedAnswer', 'expectedAnswers', 'answerKey', 'correctIndex', 'correctOption', 'solution', 'evaluatorConfig', 'evaluator_config'] as const;

export function findAnswerKeyLeaks(value: unknown, path = '$'): string[] {
  const leaks: string[] = [];
  if (Array.isArray(value)) value.forEach((v, i) => leaks.push(...findAnswerKeyLeaks(v, `${path}[${i}]`)));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if ((FORBIDDEN_CLIENT_ANSWER_KEYS as readonly string[]).includes(k)) leaks.push(`${path}.${k}`);
      leaks.push(...findAnswerKeyLeaks(v, `${path}.${k}`));
    }
  }
  return leaks;
}

export function stationChallengeDefinitionViolations(def: StationChallengeDefinition): string[] {
  const v: string[] = [];
  const shortStation = def.stationId.replace(/^G1-/, '');
  v.push(...signatureChallengeViolations({
    stationId: shortStation,
    gameCode: def.gameCode,
    rounds: def.rounds.length,
    timerPolicy: def.timerPolicy.policy,
    learningRole: def.learningRole,
    estimatedDurationSec: def.estimatedDurationSec,
  }));
  if (!def.id || !def.code) v.push('IDENTITY_REQUIRED');
  if (!Number.isInteger(def.version) || def.version < 1) v.push('VERSION_INVALID');
  if (!def.objective.trim()) v.push('OBJECTIVE_REQUIRED');
  const adapter = challengeTemplateAdapter(def.gameCode);
  if (!adapter) v.push('TEMPLATE_ENGINE_PATH_MISSING');
  else if (def.objective.length > adapter.objectiveMaxChars) v.push('OBJECTIVE_TOO_LONG_FOR_2S');
  if (!G1_GAME_CATALOG.some((g) => g.code === def.gameCode)) v.push('UNKNOWN_TEMPLATE');
  if ((def.learningRole as string) === 'MASTERY_CHECK') v.push('MASTERY_CHECK_ROLE_FORBIDDEN');
  if ((def.timerPolicy.policy as string) === 'HARD') v.push('HARD_TIMER_FORBIDDEN');
  if (def.timerPolicy.policy === 'NONE' && def.timerPolicy.softPaceSec !== undefined) v.push('SOFT_PACE_WITHOUT_SOFT_TIMER');
  if (!def.primarySkillIds.length) v.push('PRIMARY_SKILL_REQUIRED');
  if (!/^[a-z0-9][a-z0-9._-]{1,63}$/i.test(def.evaluatorVersion)) v.push('EVALUATOR_VERSION_REQUIRED');

  const allowedSkills = new Set([...def.primarySkillIds, ...def.supportingSkillIds]);
  const seenContent = new Set<string>();
  def.rounds.forEach((round, i) => {
    if (round.roundIndex !== i) v.push(`ROUND_INDEX_NOT_SEQUENTIAL:${i}`);
    if (!allowedSkills.has(round.skillId)) v.push(`ROUND_SKILL_NOT_DECLARED:${i}`);
    if (!round.variants.some((x) => x.level === 'CORE')) v.push(`ROUND_CORE_VARIANT_REQUIRED:${i}`);
    const levels = new Set<string>();
    for (const variant of round.variants) {
      if (variant.skillId !== round.skillId) v.push(`DIFFICULTY_CHANGES_SKILL_IDENTITY:${i}:${variant.level}`);
      if (levels.has(variant.level)) v.push(`DUPLICATE_VARIANT_LEVEL:${i}:${variant.level}`);
      levels.add(variant.level);
      if (!variant.contentVersionId) v.push(`VARIANT_CONTENT_REQUIRED:${i}:${variant.level}`);
      if (seenContent.has(variant.contentVersionId)) v.push(`VARIANT_CONTENT_REUSED:${variant.contentVersionId}`);
      seenContent.add(variant.contentVersionId);
    }
  });
  if (!def.primarySkillIds.some((s) => def.rounds.some((r) => r.skillId === s))) v.push('PRIMARY_SKILL_NOT_EXERCISED');

  const dp = def.difficultyPolicy;
  if (dp.preservesSkillIdentity !== true) v.push('DIFFICULTY_POLICY_MUST_PRESERVE_SKILL');
  if (!Number.isInteger(dp.stepDownAfterWrongAttempts) || dp.stepDownAfterWrongAttempts < 1) v.push('DIFFICULTY_STEP_DOWN_INVALID');
  if (!Number.isInteger(dp.stepUpAfterFirstTryRounds) || dp.stepUpAfterFirstTryRounds < 1) v.push('DIFFICULTY_STEP_UP_INVALID');

  const hp = def.hintPolicy;
  if (hp.revealsFinalAnswer !== false) v.push('HINT_REVEALS_ANSWER');
  if (hp.reducesReward !== false) v.push('HINT_REDUCES_REWARD');
  if (!hp.ladder.length || hp.ladder.some((l) => !SIGNATURE_CHALLENGE_POLICY.hints.ladder.includes(l))) v.push('HINT_LADDER_INVALID');

  const rp = def.rewardPolicy;
  if (rp.source !== 'CHALLENGE_COMPLETION') v.push('REWARD_SOURCE_INVALID');
  if (!isRewardAllowedForSource(rp.source, rp.rewardClass)) v.push('REWARD_CLASS_NOT_ALLOWED_FOR_SOURCE');
  if (rp.oncePerChallengeInstance !== true || rp.replayGrants !== false) v.push('REWARD_MUST_BE_ONCE_PER_INSTANCE');
  if (rp.grantedOn.some((r) => !SIGNATURE_CHALLENGE_POLICY.reward.grantedOn.includes(r))) v.push('REWARD_GRANTED_ON_NON_COMPLETION');
  if (!rp.rewardDefinitionCode) v.push('REWARD_DEFINITION_REQUIRED');

  const ep = def.evidencePolicy;
  if (ep.countsTowardStationPass !== false) v.push('EVIDENCE_COUNTS_TOWARD_STATION_PASS');
  if (ep.countsTowardMastery !== false) v.push('EVIDENCE_COUNTS_TOWARD_MASTERY');

  for (const leak of findAnswerKeyLeaks(def)) v.push(`ANSWER_KEY_IN_DEFINITION:${leak}`);
  return v;
}
