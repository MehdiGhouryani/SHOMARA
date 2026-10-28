import type {
  ChallengeDifficultyLevel,
  ChallengeHintLevel,
  ChallengeResult,
  StationChallengeClientView,
  StationChallengeDefinition,
} from '@math/contracts';
import type { AnswerSubmission, EncounterRecord } from '@math/learning-runtime';

export type ChallengeRunStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';

export interface ChallengeRoundState {
  roundIndex: number;
  skillId: string;
  startLevel: ChallengeDifficultyLevel;
  /** Level of the currently open (or last) attempt. */
  level: ChallengeDifficultyLevel;
  attempts: number;
  wrongAttempts: number;
  hintsUsed: number;
  scaffolded: boolean;
  solved: boolean;
  closed: boolean;
  /** Encounter waiting for the next attempt; null once the round is closed. */
  openEncounterId: string | null;
  attemptIds: string[];
  evidenceIds: string[];
}

export interface ChallengeRunRecord {
  id: string;
  challengeId: string;
  challengeCode: string;
  challengeVersion: number;
  evaluatorVersion: string;
  learningIdentityId: string;
  relationshipContextId: string;
  sessionId: string;
  stationId: string;
  clientIdempotencyKey: string;
  status: ChallengeRunStatus;
  plannedRounds: number;
  currentRoundIndex: number;
  rounds: ChallengeRoundState[];
  result: ChallengeResult | null;
  rewardEligible: boolean;
  rewardGrantKey: string | null;
  startedAt: string;
  finishedAt: string | null;
}

/** Client-safe presentation of the encounter the child plays next (no evaluator data). */
export interface ChallengeEncounterPresentation {
  encounterId: string;
  roundIndex: number;
  attemptNumber: number;
  level: ChallengeDifficultyLevel;
  skillId: string;
  contentVersionId: string;
  interactionType: string;
  prompt: string | null;
  /** Short title (from metadata.presentation.title). */
  title: string | null;
  /** Multiple-choice labels only — never includes answer key. */
  options: readonly string[];
  /** Text stem for generic MC (P10 depth). */
  display: string | null;
  /** Pattern tokens for ST01-style challenges (Y B Y ?). */
  sequence: readonly string[] | null;
  /**
   * Nested content block for mobile API compatibility
   * (existing SignatureChallengeRunView consumers read options here too).
   */
  content?: {
    prompt?: string | null;
    interactionType?: string;
    title?: string | null;
    options?: readonly string[];
    display?: string | null;
    sequence?: readonly string[] | null;
    visualCount?: number | null;
  };
}

export interface ChallengeRunView {
  idempotent: boolean;
  runId: string;
  status: ChallengeRunStatus;
  challenge: StationChallengeClientView;
  currentRoundIndex: number;
  plannedRounds: number;
  next: ChallengeEncounterPresentation | null;
  result: ChallengeRunResultView | null;
}

export interface ChallengeRunResultView {
  result: ChallengeResult;
  semanticEvent: 'MILESTONE' | 'RECOVERY' | null;
  solvedRounds: number;
  plannedRounds: number;
  /** First qualifying completion for this learner → a PENDING grant for the P07 grant service. Never mastery. */
  rewardEligible: boolean;
  rewardGrantKey: string | null;
  setsMastery: false;
  setsStationCompletion: false;
}

export interface StartChallengeRunCommand {
  learningIdentityId: string;
  relationshipContextId: string;
  sessionId: string;
  challengeId: string;
  clientIdempotencyKey: string;
}

export interface SubmitChallengeRoundCommand {
  learningIdentityId: string;
  relationshipContextId: string;
  runId: string;
  roundIndex: number;
  attemptNumber: number;
  clientIdempotencyKey: string;
  answers: AnswerSubmission[];
}

export interface SubmitChallengeRoundResult {
  idempotent: boolean;
  runId: string;
  roundIndex: number;
  attemptNumber: number;
  correct: boolean;
  score: number;
  maxScore: number;
  evaluatorVersion: string;
  /** Presentation semantics only (P03 contract); derived from the server evaluation. */
  semanticEvent: 'ANSWER_CORRECT' | 'NEAR_MISS' | 'ANSWER_WRONG';
  roundClosed: boolean;
  roundSolved: boolean;
  scaffoldNext: boolean;
  offerHint: boolean;
  evidenceId: string | null;
  next: ChallengeEncounterPresentation | null;
  runStatus: ChallengeRunStatus;
  result: ChallengeRunResultView | null;
}

export interface RequestChallengeHintCommand {
  learningIdentityId: string;
  runId: string;
  roundIndex: number;
  /** 0-based index of this hint request inside the round (part of the idempotency key). */
  hintIndex: number;
}

export interface ChallengeHintResult {
  idempotent: boolean;
  runId: string;
  roundIndex: number;
  hintLevel: ChallengeHintLevel;
  hintsUsed: number;
  reducesReward: false;
  revealsFinalAnswer: false;
}

export interface FinishChallengeRunCommand {
  learningIdentityId: string;
  runId: string;
  /** EXITED = child left before all rounds closed → ABANDONED (no penalty, replay available). */
  reason: 'EXITED';
}

export interface ChallengeRewardEligibilityRecord {
  rewardGrantKey: string;
  learningIdentityId: string;
  challengeCode: string;
  runId: string;
  result: ChallengeResult;
  status: 'PENDING';
  createdAt: string;
}

export interface StoredRoundSubmission {
  clientIdempotencyKey: string;
  fingerprint: string;
  response: SubmitChallengeRoundResult;
}

export type { StationChallengeDefinition, EncounterRecord };
