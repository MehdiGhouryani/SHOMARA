import { describe, it, expect, beforeEach } from 'vitest';
import { LearningRuntime } from '../engine';
import { InMemoryLearningRuntimeRepository } from '../repository';
import type { RuntimeContentVersion } from '../types';

describe('LearningRuntime Engine Workflows', () => {
  let repo: InMemoryLearningRuntimeRepository;
  let engine: LearningRuntime;

  beforeEach(() => {
    repo = new InMemoryLearningRuntimeRepository();
    engine = new LearningRuntime(repo);
  });

  it('starts a new learning session with ACTIVE status', async () => {
    const session = await engine.startSession({
      id: 'sess-100',
      learningIdentityId: 'child-1',
      relationshipContextId: 'ctx-1',
      sessionType: 'LEARNING',
      gradeId: 'G1',
      curriculumVersionId: 'v1',
      skillGraphVersionId: 'v1',
    });

    expect(session.id).toBe('sess-100');
    expect(session.status).toBe('ACTIVE');
    expect(session.createdAt).toBeDefined();
  });

  it('submits attempt and computes learning state transition cleanly', async () => {
    const session = await engine.startSession({
      id: 'sess-101',
      learningIdentityId: 'child-1',
      relationshipContextId: 'ctx-1',
      sessionType: 'LEARNING',
      gradeId: 'G1',
      curriculumVersionId: 'v1',
      skillGraphVersionId: 'v1',
    });

    const content: RuntimeContentVersion = {
      id: 'cv-101',
      gradeId: 'G1',
      stationId: 'ST01',
      skillId: 'G1-SK01',
      learningRole: 'INDEPENDENT_PRACTICE',
      experienceForm: 'PUZZLE',
      interactionType: 'COUNT',
      answerSchema: { type: 'object' },
      evaluatorConfig: { version: 'v1', expectedAnswer: 5, maxScore: 1 },
    };
    repo.registerContent(content);

    const encounter = await engine.createEncounter({
      id: 'enc-101',
      sessionId: session.id,
      sequence: 1,
      stationId: 'ST01',
      skillId: 'G1-SK01',
      contentVersionId: content.id,
      learningRole: 'INDEPENDENT_PRACTICE',
      experienceForm: 'PUZZLE',
      content,
    });

    const result = await engine.submitAttempt({
      sessionId: session.id,
      encounterId: encounter.id,
      learningIdentityId: 'child-1',
      relationshipContextId: 'ctx-1',
      attemptNumber: 1,
      clientIdempotencyKey: 'idem-key-101',
      answers: [{ answerIndex: 0, answerPayload: 5 }],
    });

    expect(result.idempotent).toBe(false);
    expect(result.attempt.evaluation?.correct).toBe(true);
    expect(result.learningState.state).toBe('BUILDING');
    expect(result.learningState.confidence).toBe(0.70);
    expect(result.semanticEvent).toBe('ANSWER_CORRECT');
  });
});
