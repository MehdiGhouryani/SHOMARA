/**
 * Authoritative Learning API Client for Primary Math Web Application
 * Connects UI interactions to /api/v1/learning routes and PostgreSQL backend.
 */

export interface StartSessionInput {
  gradeId?: string;
  curriculumVersionId?: string;
  skillGraphVersionId?: string;
  relationshipContextId?: string;
  sessionType?: 'LEARNING' | 'DIAGNOSTIC' | 'RECOVERY' | 'REVIEW';
  learningIdentityId?: string;
}

export interface SessionResponse {
  id: string;
  learningIdentityId: string;
  relationshipContextId: string;
  gradeId: string;
  curriculumVersionId: string;
  skillGraphVersionId: string;
  sessionType: string;
  status: string;
}

export interface CreateEncounterInput {
  contentVersionId: string;
  stationId: string;
  skillId: string;
  learningObjectiveId?: string;
  sequence?: number;
  learningRole?: string;
  experienceForm?: string;
}

export interface EncounterResponse {
  id: string;
  sessionId: string;
  sequence: number;
  stationId?: string;
  skillId?: string;
  contentVersionId: string;
  learningRole: string;
  experienceForm: string;
  status: string;
  content?: {
    prompt: string;
    interactionType: string;
    evaluatorConfig?: {
      version?: string;
      expectedAnswers?: unknown[];
      maxScore?: number;
      checkGroup?: string;
    };
  };
}

export interface SubmitAttemptInput {
  sessionId: string;
  encounterId: string;
  attemptNumber?: number;
  clientIdempotencyKey: string;
  answers: Array<{ answerIndex: number; answerPayload: unknown }>;
  relationshipContextId?: string;
  learningIdentityId?: string;
}

export interface SubmitAttemptResponse {
  idempotent: boolean;
  attempt: {
    id: string;
    encounterId: string;
    attemptNumber: number;
    clientIdempotencyKey: string;
    status: string;
    evaluation?: {
      accepted: boolean;
      correct: boolean;
      score: number;
      maxScore: number;
      feedbackCode: string;
    };
  };
  evidence?: Record<string, unknown> | null;
  learningState?: {
    state: string;
    confidence: number;
    uncertainty: number;
    reviewNeed: boolean;
    recoveryNeed: boolean;
  };
  decision?: {
    selectedStep: 'CONTINUE' | 'RECOVERY' | 'RECHECK' | 'STATION_PASS';
  };
  stationPass: boolean;
  recheckRequired: boolean;
  semanticEvent?: string;
}

export async function startLearningSession(input: StartSessionInput = {}): Promise<SessionResponse> {
  const res = await fetch('/api/v1/learning/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gradeId: input.gradeId ?? 'G1',
      curriculumVersionId: input.curriculumVersionId ?? 'g1-build-001',
      skillGraphVersionId: input.skillGraphVersionId ?? 'g1-canonical-v1.0',
      sessionType: input.sessionType ?? 'LEARNING',
      ...(input.relationshipContextId ? { relationshipContextId: input.relationshipContextId } : {}),
      ...(input.learningIdentityId ? { learningIdentityId: input.learningIdentityId } : {}),
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `SESSION_CREATE_FAILED: HTTP ${res.status}`);
  }

  return res.json();
}

export async function createLearningEncounter(
  sessionId: string,
  input: CreateEncounterInput
): Promise<EncounterResponse> {
  const res = await fetch(`/api/v1/learning/sessions/${encodeURIComponent(sessionId)}/encounters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `ENCOUNTER_CREATE_FAILED: HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.encounter || data;
}

export async function submitLearningAttempt(
  input: SubmitAttemptInput
): Promise<SubmitAttemptResponse> {
  const res = await fetch('/api/v1/learning/attempts/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: input.sessionId,
      encounterId: input.encounterId,
      attemptNumber: input.attemptNumber ?? 1,
      clientIdempotencyKey: input.clientIdempotencyKey,
      answers: input.answers,
      ...(input.relationshipContextId ? { relationshipContextId: input.relationshipContextId } : {}),
      ...(input.learningIdentityId ? { learningIdentityId: input.learningIdentityId } : {}),
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `ATTEMPT_SUBMIT_FAILED: HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Node to Canonical Backend Station & Skill Mapping
 */
export interface NodeCanonicalMapping {
  nodeId: string;
  stepNumber: number;
  stationCode: string;
  skillCode: string;
  contentVersionId: string;
  learningRole: 'INSTRUCTION' | 'GUIDED_PRACTICE' | 'INDEPENDENT_PRACTICE' | 'REVIEW' | 'MASTERY_CHECK' | 'RECOVERY' | 'TRANSFER';
  experienceForm: 'STORY' | 'PUZZLE' | 'CHALLENGE' | 'BOSS' | 'BUILD_EXPLORE' | 'CONVERSATION_EXPLANATION' | 'MINI_GAME';
  expectedIndex: number;
}

export const NODE_CANONICAL_MAPPINGS: Record<string, NodeCanonicalMapping> = {
  'step-1': {
    nodeId: 'step-1',
    stepNumber: 1,
    stationCode: 'G1-ST01',
    skillCode: 'G1-SK001',
    contentVersionId: '26000000-0000-4000-8000-000000000001',
    learningRole: 'INSTRUCTION',
    experienceForm: 'CONVERSATION_EXPLANATION',
    expectedIndex: 1,
  },
  'step-2': {
    nodeId: 'step-2',
    stepNumber: 2,
    stationCode: 'G1-ST01',
    skillCode: 'G1-SK009',
    contentVersionId: '26000000-0000-4000-8000-000000000003',
    learningRole: 'GUIDED_PRACTICE',
    experienceForm: 'MINI_GAME',
    expectedIndex: 1,
  },
  'step-3': {
    nodeId: 'step-3',
    stepNumber: 3,
    stationCode: 'G1-ST01',
    skillCode: 'G1-SK001',
    contentVersionId: '26000000-0000-4000-8000-000000000002',
    learningRole: 'GUIDED_PRACTICE',
    experienceForm: 'PUZZLE',
    expectedIndex: 1,
  },
  'step-4': {
    nodeId: 'step-4',
    stepNumber: 4,
    stationCode: 'G1-ST01',
    skillCode: 'G1-SK003',
    contentVersionId: '26000000-0000-4000-8000-000000000004',
    learningRole: 'GUIDED_PRACTICE',
    experienceForm: 'MINI_GAME',
    expectedIndex: 1,
  },
  'step-5': {
    nodeId: 'step-5',
    stepNumber: 5,
    stationCode: 'G1-ST01',
    skillCode: 'G1-SK001',
    contentVersionId: '26000000-0000-4000-8000-000000000005',
    learningRole: 'INDEPENDENT_PRACTICE',
    experienceForm: 'PUZZLE',
    expectedIndex: 2,
  },
  'step-6': {
    nodeId: 'step-6',
    stepNumber: 6,
    stationCode: 'G1-ST01',
    skillCode: 'G1-SK009',
    contentVersionId: '26000000-0000-4000-8000-000000000006',
    learningRole: 'REVIEW',
    experienceForm: 'MINI_GAME',
    expectedIndex: 0,
  },
  'step-7': {
    nodeId: 'step-7',
    stepNumber: 7,
    stationCode: 'G1-ST01',
    skillCode: 'G1-SK001',
    contentVersionId: '26000000-0000-4000-8000-000000000007',
    learningRole: 'MASTERY_CHECK',
    experienceForm: 'CHALLENGE',
    expectedIndex: 1,
  },
};
