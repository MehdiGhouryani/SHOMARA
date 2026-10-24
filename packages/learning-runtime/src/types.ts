export type RuntimeSessionType = 'LEARNING' | 'DIAGNOSTIC' | 'RECOVERY' | 'REVIEW';
export type RuntimeSessionStatus = 'CREATED' | 'ACTIVE' | 'INTERRUPTED' | 'COMPLETED' | 'ABANDONED';
export type EncounterStatus = 'CREATED' | 'PRESENTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type AttemptStatus = 'CREATED' | 'SUBMITTED' | 'EVALUATED' | 'REJECTED';
export type LearningRole = 'DIAGNOSTIC_PROBE' | 'INSTRUCTION' | 'GUIDED_PRACTICE' | 'INDEPENDENT_PRACTICE' | 'REVIEW' | 'TRANSFER' | 'RECOVERY' | 'MASTERY_CHECK';
export type ExperienceForm = 'STORY' | 'PUZZLE' | 'CHALLENGE' | 'BOSS' | 'BUILD_EXPLORE' | 'CONVERSATION_EXPLANATION' | 'MINI_GAME';
export type LearningStateName = 'UNKNOWN' | 'BUILDING' | 'STRONG' | 'NEEDS_REVIEW';
export type RetentionState = 'FRESH' | 'REVIEW_DUE' | 'AT_RISK';
export type NextStep = 'CONTINUE' | 'RECOVERY' | 'RECHECK' | 'STATION_PASS';
export type StationCheckGroup = 'STATION_PASS' | 'RECOVERY_RECHECK' | 'MASTERY_EVIDENCE' | 'NON_PASS_GATE';
export type EvidenceQuality = 'UNREVIEWED' | 'USABLE' | 'LIMITED' | 'RETRACTED';

export interface VersionPin {
  gradeId: string;
  curriculumVersionId: string;
  skillGraphVersionId: string;
}

export interface RuntimeContentVersion {
  id: string;
  gradeId: string;
  stationId: string;
  skillId: string;
  learningRole: LearningRole;
  experienceForm: ExperienceForm;
  interactionType: string;
  prompt?: string;
  answerSchema: Record<string, unknown>;
  evaluatorConfig: Record<string, unknown>;
  feedbackConfig?: Record<string, unknown>;
  hintConfig?: Record<string, unknown>;
  /**
   * Server metadata bag (e.g. { presentation: { title, options, display } }).
   * Clients must only read presentation via extractClientPresentation — never evaluator fields.
   */
  metadata?: Record<string, unknown>;
}

export interface SessionRecord extends VersionPin {
  id: string;
  learningIdentityId: string;
  relationshipContextId: string;
  sessionType: RuntimeSessionType;
  status: RuntimeSessionStatus;
  createdAt: string;
  lastActivityAt: string;
}

export interface EncounterRecord {
  id: string;
  sessionId: string;
  sequence: number;
  stationId: string;
  skillId: string;
  learningObjectiveId?: string;
  contentVersionId: string;
  learningRole: LearningRole;
  experienceForm: ExperienceForm;
  status: EncounterStatus;
  createdAt: string;
  content: RuntimeContentVersion;
}

export interface AnswerSubmission {
  answerIndex: number;
  answerPayload: unknown;
}

export interface EvaluationResult {
  accepted: boolean;
  correct: boolean;
  score: number;
  maxScore: number;
  evaluatorVersion: string;
  feedbackCode: string;
  payload: Record<string, unknown>;
}

export interface AttemptRecord {
  id: string;
  encounterId: string;
  attemptNumber: number;
  clientIdempotencyKey: string;
  status: AttemptStatus;
  answers: AnswerSubmission[];
  evaluation?: EvaluationResult;
  startedAt: string;
  submittedAt?: string;
}

export interface EvidenceRecord {
  id: string;
  learningIdentityId: string;
  sessionId: string;
  encounterId: string;
  attemptId: string;
  skillId: string;
  contentVersionId: string;
  relationshipContextId: string;
  evidenceType: string;
  quality: EvidenceQuality;
  payload: Record<string, unknown>;
  occurredAt: string;
  sourceType?: string;
  actorAccountId?: string;
  evidenceKind?: string;
  provenance?: Record<string, unknown>;
  clientInstallationId?: string;
  clientEventId?: string;
}

export interface LearningStateRecord {
  learningIdentityId: string;
  skillId: string;
  relationshipContextId: string;
  state: LearningStateName;
  revision: number;
  retentionState: RetentionState;
  lastEvidenceAt: string;
  confidence: number;
  uncertainty: number;
  reviewNeed: boolean;
  recoveryNeed: boolean;
}

export interface StationCheckRecord {
  id: string;
  learningIdentityId: string;
  stationId: string;
  sessionId: string;
  encounterId: string;
  attemptId: string;
  correctCount: number;
  totalCount: number;
  passedCheck: boolean;
  checkGroup: StationCheckGroup;
  createdAt: string;
}

export interface LearningDecisionRecord {
  id: string;
  learningIdentityId: string;
  targetSkillId: string;
  relationshipContextId: string;
  selectedStep: NextStep;
  objectiveContext: string;
  generationVersion: string;
  decisionPolicyVersion: string;
  evidenceRefs: string[];
  sourceAttemptId: string;
  status: 'SELECTED' | 'SUPERSEDED';
  createdAt: string;
}

export interface LearningPlanRecord {
  id: string;
  decisionId: string;
  learningIdentityId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'SUPERSEDED';
  planPayload: Record<string, unknown>;
  createdAt: string;
}

export interface SubmitAttemptCommand {
  learningIdentityId: string;
  relationshipContextId: string;
  sessionId: string;
  encounterId: string;
  attemptNumber: number;
  clientIdempotencyKey: string;
  answers: AnswerSubmission[];
  /**
   * Optional provenance from an orchestrating layer (e.g. P04 Signature Challenge).
   * Stored on the evidence record only; it never changes evaluation, learning state,
   * station checks or decisions.
   */
  evidenceProvenance?: Record<string, string | number | boolean>;
}

export interface SubmitAttemptResult {
  idempotent: boolean;
  attempt: AttemptRecord;
  evidence: EvidenceRecord | null;
  learningState: LearningStateRecord;
  decision: LearningDecisionRecord;
  plan: LearningPlanRecord;
  stationPass: boolean;
  recheckRequired: boolean;
  semanticEvent: 'ANSWER_CORRECT' | 'ANSWER_WRONG' | 'RECOVERY' | 'STATION_PASS';
}
