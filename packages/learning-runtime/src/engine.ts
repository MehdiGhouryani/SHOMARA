import { ConfiguredEvaluator, type Evaluator } from './evaluator.js';
import { hasStationPass, isQualifyingCheck, nextStateForAttempt, RUNTIME_POLICY_VERSION, shouldRequireRecovery, STATION_CHECK_TOTAL_ITEMS, STATION_PASS_POLICY_VERSION, updateLearningState } from './policies.js';
import type { LearningRuntimeRepository } from './repository.js';
import type { AttemptRecord, EncounterRecord, LearningDecisionRecord, LearningPlanRecord, SessionRecord, SubmitAttemptCommand, SubmitAttemptResult, StationCheckGroup } from './types.js';

function newId(): string { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`; }

export class LearningRuntimeError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'LearningRuntimeError'; }
}

export class LearningRuntime {
  constructor(private readonly repo: LearningRuntimeRepository, private readonly evaluator: Evaluator = new ConfiguredEvaluator()) {}

  async startSession(input: Omit<SessionRecord, 'status' | 'createdAt' | 'lastActivityAt'>): Promise<SessionRecord> {
    const now = new Date().toISOString();
    const session: SessionRecord = { ...input, status: 'ACTIVE', createdAt: now, lastActivityAt: now };
    await this.repo.saveSession(session);
    return session;
  }

  async createEncounter(input: Omit<EncounterRecord, 'status' | 'createdAt'>): Promise<EncounterRecord> {
    const session = await this.repo.getSession(input.sessionId);
    if (!session) throw new LearningRuntimeError('SESSION_NOT_FOUND', 'Session not found');
    if (session.status !== 'ACTIVE') throw new LearningRuntimeError('SESSION_NOT_ACTIVE', 'Session is not active');
    const content = await this.repo.getContentVersion(input.contentVersionId);
    if (!content) throw new LearningRuntimeError('CONTENT_VERSION_NOT_FOUND', 'Content version not found');
    if (content.gradeId !== session.gradeId || content.stationId !== input.stationId || content.skillId !== input.skillId) {
      throw new LearningRuntimeError('VERSION_INTEGRITY_ERROR', 'Content does not match the session/encounter version pins');
    }
    const encounter: EncounterRecord = { ...input, status: 'PRESENTED', createdAt: new Date().toISOString(), content };
    await this.repo.saveEncounter(encounter);
    return encounter;
  }

  async submitAttempt(command: SubmitAttemptCommand): Promise<SubmitAttemptResult> {
    return this.repo.withTransaction(async (tx) => {
      const existing = await tx.getAttemptByIdempotency(command.clientIdempotencyKey);
      if (existing) {
        const encounter = await tx.getEncounter(existing.encounterId);
        if (!encounter || !existing.evaluation) throw new LearningRuntimeError('IDEMPOTENCY_STATE_INVALID', 'Existing attempt is incomplete');
        const state = await tx.getLearningState(command.learningIdentityId, encounter.skillId, command.relationshipContextId);
        if (!state) throw new LearningRuntimeError('STATE_NOT_FOUND', 'Learning state missing for idempotent replay');
        const checks = await tx.listStationChecks(command.learningIdentityId, encounter.stationId);
        const stationPass = hasStationPass(checks);
        const replayQualifyingCheck = encounter.learningRole === 'MASTERY_CHECK'
          ? isQualifyingCheck({ correctCount: existing.evaluation.score, totalCount: existing.evaluation.maxScore })
          : false;
        if (encounter.sessionId !== command.sessionId || state.learningIdentityId !== command.learningIdentityId || state.relationshipContextId !== command.relationshipContextId) {
          throw new LearningRuntimeError('IDEMPOTENCY_CONTEXT_MISMATCH', 'Idempotent replay context mismatch');
        }
        const decision = await tx.getDecisionByAttemptId(existing.id) ?? await this.buildDecision(command.learningIdentityId, command.relationshipContextId, encounter, existing, state, existing.evaluation, stationPass, replayQualifyingCheck, undefined);
        const plan = await tx.getPlanByDecisionId(decision.id) ?? await this.buildPlan(command.learningIdentityId, decision);
        return {
          idempotent: true,
          attempt: existing,
          evidence: null,
          learningState: state,
          decision,
          plan,
          stationPass,
          recheckRequired: decision.selectedStep === 'RECHECK',
          semanticEvent: stationPass ? 'STATION_PASS' : (existing.evaluation.correct ? 'ANSWER_CORRECT' : 'ANSWER_WRONG'),
        };
      }

      const encounter = await tx.getEncounter(command.encounterId);
      if (!encounter) throw new LearningRuntimeError('ENCOUNTER_NOT_FOUND', 'Encounter not found');
      if (encounter.status === 'COMPLETED') throw new LearningRuntimeError('ENCOUNTER_COMPLETED', 'Encounter already completed');
      if (!Number.isInteger(command.attemptNumber) || command.attemptNumber < 1) throw new LearningRuntimeError('ATTEMPT_NUMBER_INVALID', 'Attempt number must be a positive integer');
      if (!Array.isArray(command.answers) || command.answers.length === 0) throw new LearningRuntimeError('ANSWERS_REQUIRED', 'At least one answer is required');
      if (encounter.learningRole === 'MASTERY_CHECK' && command.answers.length !== STATION_CHECK_TOTAL_ITEMS) {
        throw new LearningRuntimeError('MASTERY_CHECK_REQUIRES_FIVE_ANSWERS', 'Mastery checks require exactly five answers');
      }
      const session = await tx.getSession(encounter.sessionId);
      if (!session || session.id !== command.sessionId || session.learningIdentityId !== command.learningIdentityId) throw new LearningRuntimeError('AUTH_CONTEXT_MISMATCH', 'Session context mismatch');

      const attempt: AttemptRecord = {
        id: newId(),
        encounterId: encounter.id,
        attemptNumber: command.attemptNumber,
        clientIdempotencyKey: command.clientIdempotencyKey,
        status: 'SUBMITTED',
        answers: command.answers,
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
      };
      const evaluation = this.evaluator.evaluate(encounter.content, command.answers);
      attempt.evaluation = evaluation;
      attempt.status = evaluation.accepted ? 'EVALUATED' : 'REJECTED';
      await tx.saveAttempt(attempt);

      if (!evaluation.accepted) throw new LearningRuntimeError('ANSWER_REJECTED', 'Answer payload was not accepted');

      const now = new Date().toISOString();
      const currentCheck = encounter.learningRole === 'MASTERY_CHECK' ? { correctCount: evaluation.score, totalCount: evaluation.maxScore } : null;
      const qualifyingCheck = currentCheck ? isQualifyingCheck(currentCheck) : false;
      const previousState = await tx.getLearningState(command.learningIdentityId, encounter.skillId, command.relationshipContextId);
      const learningState = updateLearningState(previousState, evaluation, now, qualifyingCheck);
      learningState.learningIdentityId = command.learningIdentityId;
      learningState.skillId = encounter.skillId;
      learningState.relationshipContextId = command.relationshipContextId;
      await tx.saveLearningState(learningState);

      const evidence = {
        id: newId(),
        learningIdentityId: command.learningIdentityId,
        sessionId: session.id,
        encounterId: encounter.id,
        attemptId: attempt.id,
        skillId: encounter.skillId,
        contentVersionId: encounter.contentVersionId,
        relationshipContextId: command.relationshipContextId,
        evidenceType: encounter.learningRole === 'MASTERY_CHECK' ? 'MASTERY_CHECK_RESULT' : 'ENCOUNTER_RESULT',
        quality: 'USABLE' as const,
        payload: {
          correct: evaluation.correct,
          score: evaluation.score,
          maxScore: evaluation.maxScore,
          evaluatorVersion: evaluation.evaluatorVersion,
          experienceForm: encounter.experienceForm,
        },
        occurredAt: now,
        ...(command.evidenceProvenance ? { provenance: { ...command.evidenceProvenance } } : {}),
      };
      await tx.saveEvidence(evidence);

      if (encounter.learningRole === 'MASTERY_CHECK') {
        await tx.saveStationCheck({
          id: newId(),
          learningIdentityId: command.learningIdentityId,
          stationId: encounter.stationId,
          sessionId: session.id,
          encounterId: encounter.id,
          attemptId: attempt.id,
          correctCount: evaluation.score,
          totalCount: evaluation.maxScore,
          passedCheck: isQualifyingCheck({ correctCount: evaluation.score, totalCount: evaluation.maxScore }),
          checkGroup: String(encounter.content.evaluatorConfig.checkGroup ?? 'NON_PASS_GATE') as StationCheckGroup,
          createdAt: now,
        });
      }

      const checks = await tx.listStationChecks(command.learningIdentityId, encounter.stationId);
      const stationPass = hasStationPass(checks);
      const decision = await this.buildDecision(command.learningIdentityId, command.relationshipContextId, encounter, attempt, learningState, evaluation, stationPass, qualifyingCheck, evidence.id);
      await tx.saveDecision(decision);
      const plan = await this.buildPlan(command.learningIdentityId, decision);
      await tx.savePlan(plan);

      encounter.status = 'COMPLETED';
      await tx.saveEncounter(encounter);
      session.lastActivityAt = now;
      if (stationPass) session.status = 'COMPLETED';
      await tx.saveSession(session);

      return {
        idempotent: false,
        attempt,
        evidence,
        learningState,
        decision,
        plan,
        stationPass,
        recheckRequired: decision.selectedStep === 'RECHECK',
        semanticEvent: stationPass ? 'STATION_PASS' : (evaluation.correct || qualifyingCheck ? 'ANSWER_CORRECT' : 'ANSWER_WRONG'),
      };
    });
  }

  private async buildDecision(learningIdentityId: string, relationshipContextId: string, encounter: EncounterRecord, attempt: AttemptRecord, state: SubmitAttemptResult['learningState'], evaluation: NonNullable<AttemptRecord['evaluation']>, stationPass: boolean, qualifyingCheck = false, evidenceId?: string): Promise<LearningDecisionRecord> {
    const selectedStep = nextStateForAttempt(evaluation, stationPass, qualifyingCheck);
    const decisionStep = stationPass ? 'STATION_PASS' : (qualifyingCheck ? 'CONTINUE' : selectedStep);
    return {
      id: newId(),
      learningIdentityId,
      targetSkillId: encounter.skillId,
      relationshipContextId,
      selectedStep: decisionStep,
      objectiveContext: encounter.learningRole,
      generationVersion: RUNTIME_POLICY_VERSION,
      decisionPolicyVersion: STATION_PASS_POLICY_VERSION,
      evidenceRefs: evidenceId ? [evidenceId] : [],
      sourceAttemptId: attempt.id,
      status: 'SELECTED',
      createdAt: new Date().toISOString(),
    };
  }

  private async buildPlan(learningIdentityId: string, decision: LearningDecisionRecord): Promise<LearningPlanRecord> {
    const action = decision.selectedStep === 'RECOVERY'
      ? 'CHANGE_REPRESENTATION_OR_DIFFICULTY'
      : decision.selectedStep === 'RECHECK'
        ? 'RUN_NEW_CHECK'
        : decision.selectedStep === 'STATION_PASS'
          ? 'ADVANCE_TO_NEXT_STATION'
          : 'CONTINUE_CURRENT_PLAN';
    return {
      id: newId(),
      decisionId: decision.id,
      learningIdentityId,
      status: 'ACTIVE',
      planPayload: { action, sourceDecision: decision.id },
      createdAt: new Date().toISOString(),
    };
  }
}
