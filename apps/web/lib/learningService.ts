/**
 * Learning Service Layer
 * Authoritative client for real backend session creation (POST /api/v1/learning/sessions)
 * and encounter initiation (POST /api/v1/learning/sessions/:sessionId/encounters).
 */

import {
  startLearningSession,
  createLearningEncounter,
  submitLearningAttempt,
  NODE_CANONICAL_MAPPINGS,
  type StartSessionInput,
  type SessionResponse,
  type CreateEncounterInput,
  type EncounterResponse,
  type SubmitAttemptInput,
  type SubmitAttemptResponse,
  type NodeCanonicalMapping,
} from './learning-api-client';

export interface ServiceSessionContext {
  activeSession: SessionResponse | null;
  activeEncounter: EncounterResponse | null;
  activeMapping: NodeCanonicalMapping | null;
  attemptCount: number;
}

export class LearningService {
  private static instance: LearningService;
  private currentSession: SessionResponse | null = null;
  private currentEncounter: EncounterResponse | null = null;
  private currentMapping: NodeCanonicalMapping | null = null;
  private attemptCount = 0;

  private constructor() {}

  public static getInstance(): LearningService {
    if (!LearningService.instance) {
      LearningService.instance = new LearningService();
    }
    return LearningService.instance;
  }

  /**
   * Start a new authoritative learning session on the backend.
   * Calls POST /api/v1/learning/sessions
   */
  public async createSession(options: StartSessionInput = {}): Promise<SessionResponse> {
    const session = await startLearningSession(options);
    this.currentSession = session;
    this.currentEncounter = null;
    this.attemptCount = 0;
    return session;
  }

  /**
   * Ensure an active session exists, or create a new one.
   */
  public async ensureActiveSession(options: StartSessionInput = {}): Promise<SessionResponse> {
    if (this.currentSession && this.currentSession.status === 'ACTIVE') {
      return this.currentSession;
    }
    return this.createSession(options);
  }

  /**
   * Initiate an encounter for a specific learning node.
   * Validates canonical mappings and calls POST /api/v1/learning/sessions/:sessionId/encounters
   */
  public async initiateEncounterForNode(
    nodeId: string,
    sessionOverride?: SessionResponse
  ): Promise<{
    session: SessionResponse;
    encounter: EncounterResponse;
    mapping: NodeCanonicalMapping;
  }> {
    const mapping = NODE_CANONICAL_MAPPINGS[nodeId] ?? {
      nodeId,
      stepNumber: 1,
      stationCode: 'G1-ST01',
      skillCode: 'G1-SK001',
      contentVersionId: '26000000-0000-4000-8000-000000000001',
      learningRole: 'INSTRUCTION' as const,
      experienceForm: 'CONVERSATION_EXPLANATION' as const,
      expectedIndex: 1,
    };

    const activeSession = sessionOverride ?? (await this.ensureActiveSession());

    const encounterPayload: CreateEncounterInput = {
      contentVersionId: mapping.contentVersionId,
      stationId: mapping.stationCode,
      skillId: mapping.skillCode,
      sequence: mapping.stepNumber,
      learningRole: mapping.learningRole,
      experienceForm: mapping.experienceForm,
    };

    const encounter = await createLearningEncounter(activeSession.id, encounterPayload);

    this.currentEncounter = encounter;
    this.currentMapping = mapping;
    this.attemptCount = 0;

    return {
      session: activeSession,
      encounter,
      mapping,
    };
  }

  /**
   * Submit an attempt with deterministic idempotency key and server-authoritative evaluation.
   * Calls POST /api/v1/learning/attempts/submit
   */
  public async submitAttempt(input: {
    sessionId: string;
    encounterId: string;
    userAnswer: unknown;
    answerIndex?: number;
    customIdempotencyKey?: string;
  }): Promise<SubmitAttemptResponse> {
    this.attemptCount += 1;
    const idempotencyKey =
      input.customIdempotencyKey ??
      `attempt-${input.sessionId}-${input.encounterId}-${this.attemptCount}`;

    const result = await submitLearningAttempt({
      sessionId: input.sessionId,
      encounterId: input.encounterId,
      attemptNumber: this.attemptCount,
      clientIdempotencyKey: idempotencyKey,
      answers: [
        {
          answerIndex: input.answerIndex ?? 0,
          answerPayload: input.userAnswer,
        },
      ],
    });

    return result;
  }

  /**
   * Reset local service state
   */
  public reset(): void {
    this.currentSession = null;
    this.currentEncounter = null;
    this.currentMapping = null;
    this.attemptCount = 0;
  }

  /**
   * Read current session context snapshot
   */
  public getContext(): ServiceSessionContext {
    return {
      activeSession: this.currentSession,
      activeEncounter: this.currentEncounter,
      activeMapping: this.currentMapping,
      attemptCount: this.attemptCount,
    };
  }
}

export const learningService = LearningService.getInstance();
