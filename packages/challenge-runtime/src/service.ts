import {
  CHALLENGE_CONTRACT_VERSION,
  challengeActionShapeViolation,
  challengeAnswerFingerprint,
  challengeGrantsReward,
  challengeHintIdempotencyKey,
  challengeRewardGrantKey,
  challengeRoundIdempotencyKey,
  challengeTemplateAdapter,
  extractClientPresentation,
  hintLevelForRequest,
  levelForNextAttempt,
  levelForNextRound,
  maxAttemptsPerRound,
  resolveChallengeResult,
  semanticEventForChallengeResult,
  semanticEventForOutcome,
  shouldOfferHint,
  stationChallengeDefinitionViolations,
  toChallengeClientView,
  variantForLevel,
  type ChallengeDifficultyLevel,
  type StationChallengeDefinition,
} from '@math/contracts';
import type { LearningRuntime, LearningRuntimeRepository } from '@math/learning-runtime';
import type { ChallengeRepository } from './repository';
import type {
  ChallengeEncounterPresentation,
  ChallengeHintResult,
  ChallengeRoundState,
  ChallengeRunRecord,
  ChallengeRunResultView,
  ChallengeRunView,
  FinishChallengeRunCommand,
  RequestChallengeHintCommand,
  StartChallengeRunCommand,
  SubmitChallengeRoundCommand,
  SubmitChallengeRoundResult,
} from './types';

export class ChallengeRuntimeError extends Error {
  constructor(public readonly code: string, message = code, public readonly retryable = false) {
    // Keep the stable machine code at the start of the message so `message` alone is enough to identify the error.
    super(message === code ? code : `${code}: ${message}`);
    this.name = 'ChallengeRuntimeError';
  }
}

function newId(prefix: string): string { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`; }

/**
 * Signature Challenge orchestrator (P04). It composes the existing Learning Runtime:
 * every round attempt is a normal encounter + attempt evaluated by the runtime's
 * evaluator. This class never evaluates, never writes evidence itself, and never
 * touches mastery, station checks or rewards beyond a PENDING eligibility record.
 */
export class ChallengeRuntime {
  constructor(
    private readonly learning: LearningRuntime,
    private readonly learningRepo: LearningRuntimeRepository,
    private readonly repo: ChallengeRepository,
  ) {}

  async getClientView(stationId: string) {
    const def = await this.repo.getActiveDefinitionForStation(stationId);
    if (!def) throw new ChallengeRuntimeError('CHALLENGE_NOT_FOUND');
    return toChallengeClientView(def);
  }

  async startRun(cmd: StartChallengeRunCommand): Promise<ChallengeRunView> {
    if (!cmd.clientIdempotencyKey || cmd.clientIdempotencyKey.length < 16) throw new ChallengeRuntimeError('IDEMPOTENCY_KEY_INVALID');
    return this.repo.withTransaction(async (tx) => {
      const existing = await tx.getRunByIdempotency(cmd.clientIdempotencyKey);
      if (existing) {
        if (existing.learningIdentityId !== cmd.learningIdentityId || existing.relationshipContextId !== cmd.relationshipContextId || existing.sessionId !== cmd.sessionId || existing.challengeId !== cmd.challengeId) {
          throw new ChallengeRuntimeError('IDEMPOTENCY_CONTEXT_MISMATCH');
        }
        const def = await this.requireDefinition(tx, existing.challengeId, { allowRetired: true });
        return this.view(existing, def, true);
      }

      const def = await this.requireDefinition(tx, cmd.challengeId);
      const violations = stationChallengeDefinitionViolations(def);
      if (violations.length) throw new ChallengeRuntimeError('CHALLENGE_DEFINITION_INVALID', violations.join(','));

      const session = await this.learningRepo.getSession(cmd.sessionId);
      if (!session || session.learningIdentityId !== cmd.learningIdentityId || session.relationshipContextId !== cmd.relationshipContextId) {
        throw new ChallengeRuntimeError('AUTH_CONTEXT_MISMATCH');
      }
      if (session.status !== 'ACTIVE') throw new ChallengeRuntimeError('SESSION_NOT_ACTIVE');
      if (session.gradeId !== def.gradeId) throw new ChallengeRuntimeError('VERSION_INTEGRITY_ERROR');
      await this.assertContentIntegrity(def);

      const startLevel = levelForNextRound(def.difficultyPolicy, []);
      const run: ChallengeRunRecord = {
        id: newId('crun'),
        challengeId: def.id,
        challengeCode: def.code,
        challengeVersion: def.version,
        evaluatorVersion: def.evaluatorVersion,
        learningIdentityId: cmd.learningIdentityId,
        relationshipContextId: cmd.relationshipContextId,
        sessionId: cmd.sessionId,
        stationId: def.stationId,
        clientIdempotencyKey: cmd.clientIdempotencyKey,
        status: 'ACTIVE',
        plannedRounds: def.rounds.length,
        currentRoundIndex: 0,
        rounds: def.rounds.map((r) => ({
          roundIndex: r.roundIndex, skillId: r.skillId, startLevel, level: startLevel,
          attempts: 0, wrongAttempts: 0, hintsUsed: 0, scaffolded: false, solved: false, closed: false,
          openEncounterId: null, attemptIds: [], evidenceIds: [],
        })),
        result: null,
        rewardEligible: false,
        rewardGrantKey: null,
        startedAt: new Date().toISOString(),
        finishedAt: null,
      };
      await this.openEncounter(tx, run, def, 0, startLevel);
      await tx.saveRun(run);
      return this.view(run, def, false);
    });
  }

  async submitRound(cmd: SubmitChallengeRoundCommand): Promise<SubmitChallengeRoundResult> {
    return this.repo.withTransaction(async (tx) => {
      const expectedKey = challengeRoundIdempotencyKey({ runId: cmd.runId, roundIndex: cmd.roundIndex, attemptNumber: cmd.attemptNumber });
      if (cmd.clientIdempotencyKey !== expectedKey) throw new ChallengeRuntimeError('IDEMPOTENCY_KEY_INVALID');
      const fingerprint = challengeAnswerFingerprint(cmd.answers ?? []);

      const stored = await tx.getRoundSubmission(expectedKey);
      if (stored) {
        if (stored.fingerprint !== fingerprint) throw new ChallengeRuntimeError('IDEMPOTENCY_PAYLOAD_MISMATCH');
        const run = await tx.getRun(cmd.runId);
        if (!run || run.learningIdentityId !== cmd.learningIdentityId || run.relationshipContextId !== cmd.relationshipContextId) throw new ChallengeRuntimeError('AUTH_CONTEXT_MISMATCH');
        return { ...stored.response, idempotent: true };
      }

      const run = await tx.getRun(cmd.runId);
      if (!run) throw new ChallengeRuntimeError('CHALLENGE_RUN_NOT_FOUND');
      if (run.learningIdentityId !== cmd.learningIdentityId || run.relationshipContextId !== cmd.relationshipContextId) throw new ChallengeRuntimeError('AUTH_CONTEXT_MISMATCH');
      if (run.status !== 'ACTIVE') throw new ChallengeRuntimeError('CHALLENGE_RUN_NOT_ACTIVE');
      if (cmd.roundIndex > run.currentRoundIndex) throw new ChallengeRuntimeError('ROUND_OUT_OF_ORDER', 'ROUND_OUT_OF_ORDER', true);
      if (cmd.roundIndex < run.currentRoundIndex) throw new ChallengeRuntimeError('ROUND_ALREADY_CLOSED');
      const round = run.rounds[cmd.roundIndex];
      if (!round || round.closed || !round.openEncounterId) throw new ChallengeRuntimeError('ROUND_ALREADY_CLOSED');
      if (cmd.attemptNumber > round.attempts + 1) throw new ChallengeRuntimeError('ATTEMPT_OUT_OF_ORDER', 'ATTEMPT_OUT_OF_ORDER', true);
      if (cmd.attemptNumber !== round.attempts + 1) throw new ChallengeRuntimeError('ATTEMPT_ALREADY_RECORDED');

      const def = await this.requireDefinition(tx, run.challengeId, { allowRetired: true });
      if (!Array.isArray(cmd.answers) || cmd.answers.length === 0) throw new ChallengeRuntimeError('ANSWERS_REQUIRED');
      const adapter = challengeTemplateAdapter(def.gameCode);
      if (!adapter) throw new ChallengeRuntimeError('TEMPLATE_ENGINE_PATH_MISSING');
      for (const a of cmd.answers) {
        const shape = challengeActionShapeViolation(adapter.actionShape, a.answerPayload);
        if (shape) throw new ChallengeRuntimeError('ACTION_SHAPE_INVALID', shape);
      }

      // Authoritative evaluation: the existing Learning Runtime, same idempotency key.
      const lr = await this.learning.submitAttempt({
        learningIdentityId: run.learningIdentityId,
        relationshipContextId: run.relationshipContextId,
        sessionId: run.sessionId,
        encounterId: round.openEncounterId,
        attemptNumber: 1,
        clientIdempotencyKey: expectedKey,
        answers: cmd.answers,
        // Provenance only (evidence policy `tagsScaffoldedAttempts`); never changes evaluation or learning truth.
        evidenceProvenance: {
          source: 'STATION_CHALLENGE',
          challengeRunId: run.id,
          challengeCode: run.challengeCode,
          challengeVersion: run.challengeVersion,
          roundIndex: cmd.roundIndex,
          attemptNumber: cmd.attemptNumber,
          difficultyLevel: round.level,
          scaffolded: round.level === 'SUPPORTED',
          countsTowardStationPass: false,
          countsTowardMastery: false,
        },
      });
      const evaluation = lr.attempt.evaluation;
      if (!evaluation) throw new ChallengeRuntimeError('EVALUATION_MISSING');
      if (evaluation.evaluatorVersion !== run.evaluatorVersion) throw new ChallengeRuntimeError('EVALUATOR_VERSION_MISMATCH');

      round.attempts += 1;
      round.attemptIds.push(lr.attempt.id);
      if (lr.evidence) round.evidenceIds.push(lr.evidence.id);
      round.openEncounterId = null;
      if (evaluation.correct) {
        round.solved = true;
        round.closed = true;
      } else {
        round.wrongAttempts += 1;
        if (round.attempts >= maxAttemptsPerRound(def.difficultyPolicy)) round.closed = true;
      }

      let next: ChallengeEncounterPresentation | null = null;
      let result: ChallengeRunResultView | null = null;
      let scaffoldNext = false;
      if (!round.closed) {
        const level = levelForNextAttempt(def.difficultyPolicy, round.startLevel, round.wrongAttempts);
        scaffoldNext = level === 'SUPPORTED' && round.level !== 'SUPPORTED';
        if (level === 'SUPPORTED') round.scaffolded = true;
        next = await this.openEncounter(tx, run, def, round.roundIndex, level);
      } else if (round.roundIndex + 1 < run.plannedRounds) {
        run.currentRoundIndex = round.roundIndex + 1;
        const level = levelForNextRound(def.difficultyPolicy, run.rounds.filter((r) => r.closed).map((r) => ({ solved: r.solved, attempts: r.attempts })));
        const nextRound = run.rounds[run.currentRoundIndex]!;
        nextRound.startLevel = level;
        next = await this.openEncounter(tx, run, def, run.currentRoundIndex, level);
      } else {
        result = await this.finalize(tx, run, def, false);
      }
      await tx.saveRun(run);

      const response: SubmitChallengeRoundResult = {
        idempotent: false,
        runId: run.id,
        roundIndex: cmd.roundIndex,
        attemptNumber: cmd.attemptNumber,
        correct: evaluation.correct,
        score: evaluation.score,
        maxScore: evaluation.maxScore,
        evaluatorVersion: evaluation.evaluatorVersion,
        semanticEvent: semanticEventForOutcome({ correct: evaluation.correct, score: evaluation.score }),
        roundClosed: round.closed,
        roundSolved: round.solved,
        scaffoldNext,
        offerHint: !round.closed && shouldOfferHint(def.hintPolicy, round.wrongAttempts, 0),
        evidenceId: lr.evidence?.id ?? null,
        next,
        runStatus: run.status,
        result,
      };
      await tx.saveRoundSubmission({ clientIdempotencyKey: expectedKey, fingerprint, response });
      return response;
    });
  }

  async requestHint(cmd: RequestChallengeHintCommand): Promise<ChallengeHintResult> {
    return this.repo.withTransaction(async (tx) => {
      const run = await tx.getRun(cmd.runId);
      if (!run) throw new ChallengeRuntimeError('CHALLENGE_RUN_NOT_FOUND');
      if (run.learningIdentityId !== cmd.learningIdentityId) throw new ChallengeRuntimeError('AUTH_CONTEXT_MISMATCH');
      const round = run.rounds[cmd.roundIndex];
      if (!round) throw new ChallengeRuntimeError('ROUND_NOT_FOUND');
      const def = await this.requireDefinition(tx, run.challengeId, { allowRetired: true });
      const key = challengeHintIdempotencyKey({ runId: run.id, roundIndex: cmd.roundIndex, hintIndex: cmd.hintIndex });
      const level = hintLevelForRequest(def.hintPolicy, cmd.hintIndex);
      if (await tx.hasHint(key)) {
        return { idempotent: true, runId: run.id, roundIndex: cmd.roundIndex, hintLevel: level, hintsUsed: round.hintsUsed, reducesReward: false, revealsFinalAnswer: false };
      }
      if (run.status !== 'ACTIVE' || round.closed) throw new ChallengeRuntimeError('ROUND_ALREADY_CLOSED');
      if (cmd.hintIndex !== round.hintsUsed) throw new ChallengeRuntimeError('HINT_OUT_OF_ORDER', 'HINT_OUT_OF_ORDER', true);
      round.hintsUsed += 1;
      await tx.saveHint(key);
      await tx.saveRun(run);
      return { idempotent: false, runId: run.id, roundIndex: cmd.roundIndex, hintLevel: level, hintsUsed: round.hintsUsed, reducesReward: false, revealsFinalAnswer: false };
    });
  }

  /** Early exit. Completing all rounds finalizes automatically inside `submitRound`. */
  async finishRun(cmd: FinishChallengeRunCommand): Promise<ChallengeRunResultView> {
    return this.repo.withTransaction(async (tx) => {
      const run = await tx.getRun(cmd.runId);
      if (!run) throw new ChallengeRuntimeError('CHALLENGE_RUN_NOT_FOUND');
      if (run.learningIdentityId !== cmd.learningIdentityId) throw new ChallengeRuntimeError('AUTH_CONTEXT_MISMATCH');
      const def = await this.requireDefinition(tx, run.challengeId, { allowRetired: true });
      if (run.status !== 'ACTIVE') return this.resultView(run);
      if (cmd.reason !== 'EXITED') throw new ChallengeRuntimeError('FINISH_REASON_INVALID');
      const result = await this.finalize(tx, run, def, true);
      await tx.saveRun(run);
      return result;
    });
  }

  async getRun(learningIdentityId: string, runId: string): Promise<ChallengeRunView> {
    const run = await this.repo.getRun(runId);
    if (!run || run.learningIdentityId !== learningIdentityId) throw new ChallengeRuntimeError('CHALLENGE_RUN_NOT_FOUND');
    const def = await this.requireDefinition(this.repo, run.challengeId, { allowRetired: true });
    return this.view(run, def, true);
  }

  // -------------------------------------------------------------------------

  private async finalize(tx: ChallengeRepository, run: ChallengeRunRecord, def: StationChallengeDefinition, exitedEarly: boolean): Promise<ChallengeRunResultView> {
    const closed = run.rounds.filter((r) => r.closed);
    const result = resolveChallengeResult(
      closed.map((r) => ({ correct: r.solved, attempts: r.attempts, hintsUsed: r.hintsUsed, scaffolded: r.scaffolded })),
      run.plannedRounds,
      exitedEarly,
    );
    run.result = result;
    run.status = result === 'ABANDONED' ? 'ABANDONED' : 'COMPLETED';
    run.finishedAt = new Date().toISOString();
    for (const r of run.rounds) r.openEncounterId = null;

    const existing = await tx.getRewardEligibility(run.learningIdentityId, def.code);
    if (challengeGrantsReward(result, Boolean(existing)) && def.rewardPolicy.grantedOn.includes(result)) {
      const rewardGrantKey = challengeRewardGrantKey(run.learningIdentityId, def);
      await tx.saveRewardEligibility({ rewardGrantKey, learningIdentityId: run.learningIdentityId, challengeCode: def.code, runId: run.id, result, status: 'PENDING', createdAt: run.finishedAt });
      run.rewardEligible = true;
      run.rewardGrantKey = rewardGrantKey;
    }
    return this.resultView(run);
  }

  private resultView(run: ChallengeRunRecord): ChallengeRunResultView {
    const result = run.result ?? 'ABANDONED';
    return {
      result,
      semanticEvent: semanticEventForChallengeResult(result) as ChallengeRunResultView['semanticEvent'],
      solvedRounds: run.rounds.filter((r) => r.solved).length,
      plannedRounds: run.plannedRounds,
      rewardEligible: run.rewardEligible,
      rewardGrantKey: run.rewardGrantKey,
      setsMastery: false,
      setsStationCompletion: false,
    };
  }

  /** Build client-safe presentation fields from content metadata (never evaluator data). */
  private presentationFromContent(content: {
    interactionType?: string;
    prompt?: string;
    metadata?: Record<string, unknown>;
  }): Pick<
    ChallengeEncounterPresentation,
    'title' | 'options' | 'display' | 'sequence' | 'content'
  > {
    const client = extractClientPresentation(content.metadata);
    return {
      title: client.title,
      options: client.options,
      display: client.display,
      sequence: client.sequence,
      content: {
        prompt: content.prompt ?? null,
        // exactOptionalPropertyTypes: omit the key instead of assigning undefined.
        ...(content.interactionType !== undefined ? { interactionType: content.interactionType } : {}),
        title: client.title,
        options: client.options,
        display: client.display,
        sequence: client.sequence,
        visualCount: client.visualCount,
      },
    };
  }

  private async openEncounter(tx: ChallengeRepository, run: ChallengeRunRecord, def: StationChallengeDefinition, roundIndex: number, level: ChallengeDifficultyLevel): Promise<ChallengeEncounterPresentation> {
    const roundDef = def.rounds[roundIndex]!;
    const variant = variantForLevel(roundDef, level);
    const round = run.rounds[roundIndex]!;
    const content = await this.learningRepo.getContentVersion(variant.contentVersionId);
    if (!content) throw new ChallengeRuntimeError('CONTENT_VERSION_NOT_FOUND');
    const sequence = await tx.allocateEncounterSequence(run.sessionId);
    const encounter = await this.learning.createEncounter({
      id: `${run.id}-r${roundIndex}-a${round.attempts + 1}`,
      sessionId: run.sessionId,
      sequence,
      stationId: def.stationId,
      skillId: variant.skillId,
      contentVersionId: variant.contentVersionId,
      learningRole: content.learningRole,
      experienceForm: content.experienceForm,
      content,
    });
    round.level = level;
    round.openEncounterId = encounter.id;
    const pres = this.presentationFromContent(content);
    return {
      encounterId: encounter.id,
      roundIndex,
      attemptNumber: round.attempts + 1,
      level,
      skillId: variant.skillId,
      contentVersionId: variant.contentVersionId,
      interactionType: content.interactionType,
      prompt: content.prompt ?? null,
      ...pres,
    };
  }

  private async assertContentIntegrity(def: StationChallengeDefinition): Promise<void> {
    const adapter = challengeTemplateAdapter(def.gameCode)!;
    for (const round of def.rounds) {
      for (const variant of round.variants) {
        const c = await this.learningRepo.getContentVersion(variant.contentVersionId);
        if (!c) throw new ChallengeRuntimeError('CONTENT_VERSION_NOT_FOUND', variant.contentVersionId);
        if (c.gradeId !== def.gradeId || c.stationId !== def.stationId || c.skillId !== variant.skillId) throw new ChallengeRuntimeError('VERSION_INTEGRITY_ERROR', variant.contentVersionId);
        if (c.learningRole === 'MASTERY_CHECK') throw new ChallengeRuntimeError('MASTERY_CHECK_ROLE_FORBIDDEN', variant.contentVersionId);
        if (c.learningRole !== def.learningRole) throw new ChallengeRuntimeError('CONTENT_ROLE_MISMATCH', variant.contentVersionId);
        if (c.experienceForm !== 'CHALLENGE') throw new ChallengeRuntimeError('CONTENT_FORM_NOT_CHALLENGE', variant.contentVersionId);
        if (!adapter.interactionTypes.includes(c.interactionType as never)) throw new ChallengeRuntimeError('INTERACTION_TYPE_NOT_SUPPORTED_BY_TEMPLATE', variant.contentVersionId);
        if (String(c.evaluatorConfig.version ?? 'v1') !== def.evaluatorVersion) throw new ChallengeRuntimeError('EVALUATOR_VERSION_MISMATCH', variant.contentVersionId);
      }
    }
  }

  private async requireDefinition(tx: ChallengeRepository, challengeId: string, opts: { allowRetired?: boolean } = {}): Promise<StationChallengeDefinition> {
    const def = await tx.getDefinition(challengeId);
    if (!def) throw new ChallengeRuntimeError('CHALLENGE_NOT_FOUND');
    if (def.status !== 'ACTIVE' && !(opts.allowRetired && def.status === 'RETIRED')) throw new ChallengeRuntimeError('CHALLENGE_NOT_ACTIVE');
    return def;
  }

  private async view(run: ChallengeRunRecord, def: StationChallengeDefinition, idempotent: boolean): Promise<ChallengeRunView> {
    let next: ChallengeEncounterPresentation | null = null;
    const round = run.rounds[run.currentRoundIndex];
    if (run.status === 'ACTIVE' && round?.openEncounterId) {
      const variant = variantForLevel(def.rounds[round.roundIndex]!, round.level);
      const content = await this.learningRepo.getContentVersion(variant.contentVersionId);
      const pres = this.presentationFromContent(content ?? {});
      next = {
        encounterId: round.openEncounterId,
        roundIndex: round.roundIndex,
        attemptNumber: round.attempts + 1,
        level: round.level,
        skillId: variant.skillId,
        contentVersionId: variant.contentVersionId,
        interactionType: content?.interactionType ?? 'MULTIPLE_CHOICE',
        prompt: content?.prompt ?? null,
        ...pres,
      };
    }
    return {
      idempotent,
      runId: run.id,
      status: run.status,
      challenge: toChallengeClientView(def),
      currentRoundIndex: run.currentRoundIndex,
      plannedRounds: run.plannedRounds,
      next,
      result: run.status === 'ACTIVE' ? null : this.resultView(run),
    };
  }
}

export const CHALLENGE_RUNTIME_VERSION = `${CHALLENGE_CONTRACT_VERSION}+runtime` as const;
