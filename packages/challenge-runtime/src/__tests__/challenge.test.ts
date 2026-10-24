import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CHALLENGE_DIFFICULTY_POLICY,
  DEFAULT_CHALLENGE_EVIDENCE_POLICY,
  DEFAULT_CHALLENGE_HINT_POLICY,
  G1_GAME_CATALOG,
  CHALLENGE_OFFLINE_REPLAY_SEMANTICS,
  stationChallengeDefinitionViolations,
  challengeRoundIdempotencyKey,
  challengeAnswerFingerprint,
  findAnswerKeyLeaks,
  levelForNextRound,
  toChallengeClientView,
} from '@math/contracts';
import { InMemoryLearningRuntimeRepository, LearningRuntime } from '@math/learning-runtime';
import { InMemoryChallengeRepository } from '../repository';
import { ChallengeRuntime } from '../service';
import type { StationChallengeDefinition } from '@math/contracts';

type Level = 'SUPPORTED' | 'CORE' | 'STRETCH';
const LEVELS: Level[] = ['SUPPORTED', 'CORE', 'STRETCH'];
const CHILD = 'child-1';
const CTX = 'platform';

/** Two engine paths: G1-GAME-002 (INTEGER count) and G1-GAME-001 (OPTION_INDEX pattern). */
const TEMPLATES = {
  count: { id: 'challenge-st01-count-v1', code: 'G1-ST01-CHALLENGE-001', gameCode: 'G1-GAME-002', skill: 'G1-SK003', interaction: 'COUNT', evaluator: 'challenge-count-v1', expected: [3], prefix: 'cvc' },
  pattern: { id: 'challenge-st01-pattern-v1', code: 'G1-ST01-CHALLENGE-002', gameCode: 'G1-GAME-001', skill: 'G1-SK009', interaction: 'MULTIPLE_CHOICE', evaluator: 'challenge-pattern-v1', expected: [2], prefix: 'cvp' },
} as const;
type TemplateKey = keyof typeof TEMPLATES;

function definition(key: TemplateKey = 'count', rounds = 2): StationChallengeDefinition {
  const t = TEMPLATES[key];
  return {
    id: t.id, code: t.code, version: 1, status: 'ACTIVE', gradeId: 'G1', stationId: 'G1-ST01', gameCode: t.gameCode,
    primarySkillIds: [t.skill], supportingSkillIds: [], objective: 'ستاره‌ها را بشمار', learningRole: 'GUIDED_PRACTICE',
    rounds: Array.from({ length: rounds }, (_, roundIndex) => ({ roundIndex, skillId: t.skill, variants: LEVELS.map((level, variantIndex) => ({ level, contentVersionId: `${t.prefix}-${roundIndex}-${variantIndex}`, skillId: t.skill })) })),
    finalMoment: 'SUMMARY_CELEBRATION', difficultyPolicy: DEFAULT_CHALLENGE_DIFFICULTY_POLICY, hintPolicy: DEFAULT_CHALLENGE_HINT_POLICY,
    timerPolicy: { policy: 'NONE' }, evaluatorVersion: t.evaluator,
    rewardPolicy: { source: 'CHALLENGE_COMPLETION', rewardClass: 'STICKER', rewardDefinitionCode: `G1-R-${t.code}`, grantedOn: ['COMPLETED', 'COMPLETED_WITH_SUPPORT'], oncePerChallengeInstance: true, replayGrants: false },
    evidencePolicy: DEFAULT_CHALLENGE_EVIDENCE_POLICY, estimatedDurationSec: 45,
  };
}

async function setup(opts: { rounds?: number; masteryContent?: boolean } = {}) {
  const rounds = opts.rounds ?? 2;
  const learningRepo = new InMemoryLearningRuntimeRepository();
  const learning = new LearningRuntime(learningRepo);
  for (const s of ['session-1', 'session-2']) {
    await learning.startSession({ id: s, learningIdentityId: CHILD, relationshipContextId: CTX, gradeId: 'G1', curriculumVersionId: 'cv-1', skillGraphVersionId: 'sg-1', sessionType: 'LEARNING' });
  }
  const challengeRepo = new InMemoryChallengeRepository();
  for (const key of Object.keys(TEMPLATES) as TemplateKey[]) {
    const t = TEMPLATES[key];
    for (let round = 0; round < rounds; round++) for (let variant = 0; variant < 3; variant++) {
      learningRepo.registerContent({ id: `${t.prefix}-${round}-${variant}`, gradeId: 'G1', stationId: 'G1-ST01', skillId: t.skill, learningRole: opts.masteryContent ? 'MASTERY_CHECK' : 'GUIDED_PRACTICE', experienceForm: 'CHALLENGE', interactionType: t.interaction, prompt: 'بشمار', answerSchema: {}, evaluatorConfig: { version: t.evaluator, expectedAnswers: [...t.expected], maxScore: 1 }, feedbackConfig: {}, hintConfig: {} });
    }
    challengeRepo.registerDefinition(definition(key, rounds));
  }
  return { learningRepo, learning, challengeRepo, runtime: new ChallengeRuntime(learning, learningRepo, challengeRepo) };
}

type Rt = Awaited<ReturnType<typeof setup>>['runtime'];
let startCounter = 0;
async function start(runtime: Rt, key: TemplateKey = 'count', sessionId = 'session-1') {
  startCounter += 1;
  return runtime.startRun({ learningIdentityId: CHILD, relationshipContextId: CTX, sessionId, challengeId: TEMPLATES[key].id, clientIdempotencyKey: `challenge-start-key-${startCounter}` });
}
function submit(runtime: Rt, runId: string, roundIndex: number, attemptNumber: number, payload: unknown) {
  return runtime.submitRound({ learningIdentityId: CHILD, relationshipContextId: CTX, runId, roundIndex, attemptNumber, clientIdempotencyKey: challengeRoundIdempotencyKey({ runId, roundIndex, attemptNumber }), answers: [{ answerIndex: 0, answerPayload: payload }] });
}

describe('P04 challenge contract', () => {
  it('rejects answer keys and accepts a valid definition', () => {
    expect(findAnswerKeyLeaks({ evaluatorConfig: { expectedAnswers: [3] } })).toEqual(['$.evaluatorConfig', '$.evaluatorConfig.expectedAnswers']);
    const d = definition();
    expect(stationChallengeDefinitionViolations(d)).toEqual([]);
    expect(stationChallengeDefinitionViolations(definition('pattern'))).toEqual([]);
    expect(G1_GAME_CATALOG.some((g) => g.code === d.gameCode)).toBe(true);
  });

  it('flags hard timer, mastery role, skill drift, reward-on-NOT_YET and leaked answer keys', () => {
    const d = definition();
    const bad = {
      ...d,
      learningRole: 'MASTERY_CHECK',
      timerPolicy: { policy: 'HARD' },
      rounds: [d.rounds[0]!, { ...d.rounds[1]!, variants: [{ level: 'CORE', contentVersionId: 'x', skillId: 'G1-SK999' }] }],
      rewardPolicy: { ...d.rewardPolicy, grantedOn: ['NOT_YET'] },
      expectedAnswer: 3,
    } as unknown as StationChallengeDefinition;
    const v = stationChallengeDefinitionViolations(bad);
    for (const code of ['MASTERY_CHECK_ROLE_FORBIDDEN', 'HARD_TIMER_FORBIDDEN', 'DIFFICULTY_CHANGES_SKILL_IDENTITY:1:CORE', 'REWARD_GRANTED_ON_NON_COMPLETION', 'ANSWER_KEY_IN_DEFINITION:$.expectedAnswer']) expect(v).toContain(code);
  });

  it('client view carries no content ids per level and no evaluator data', () => {
    const view = toChallengeClientView(definition());
    expect(findAnswerKeyLeaks(view)).toEqual([]);
    expect(JSON.stringify(view).includes('cvc-')).toBe(false);
    expect(view.plannedRounds).toBe(2);
  });

  it('makes offline keys deterministic and fingerprints payload order canonically', () => {
    expect(challengeRoundIdempotencyKey({ runId: 'run-1', roundIndex: 0, attemptNumber: 1 })).toBe('challenge:v1:round:run-1:r0:a1');
    expect(() => challengeRoundIdempotencyKey({ runId: 'run 1', roundIndex: 0, attemptNumber: 1 })).toThrow('CHALLENGE_KEY_PART_INVALID');
    expect(challengeAnswerFingerprint([{ answerIndex: 1, answerPayload: { b: 2, a: 1 } }, { answerIndex: 0, answerPayload: 3 }])).toBe(challengeAnswerFingerprint([{ answerIndex: 0, answerPayload: 3 }, { answerIndex: 1, answerPayload: { a: 1, b: 2 } }]));
    expect(CHALLENGE_OFFLINE_REPLAY_SEMANTICS.evaluationOnReplay).toBe('SERVER');
  });

  it('difficulty steps up after first-try streaks and resets (never demotes) after a scaffold', () => {
    const p = DEFAULT_CHALLENGE_DIFFICULTY_POLICY;
    expect(levelForNextRound(p, [])).toBe('CORE');
    expect(levelForNextRound(p, [{ solved: true, attempts: 1 }, { solved: true, attempts: 1 }])).toBe('STRETCH');
    expect(levelForNextRound(p, [{ solved: true, attempts: 1 }, { solved: true, attempts: 1 }, { solved: false, attempts: 3 }])).toBe('CORE');
  });
});

describe('P04 challenge runtime', () => {
  it('composes Learning Runtime, is idempotent, and grants eligibility without mastery', async () => {
    const { runtime, learningRepo } = await setup();
    const started = await start(runtime);
    expect(started.next?.roundIndex).toBe(0);
    expect(findAnswerKeyLeaks(started)).toEqual([]);
    const first = await submit(runtime, started.runId, 0, 1, 3);
    expect(first.correct).toBe(true);
    expect(first.result).toBeNull();
    const replay = await submit(runtime, started.runId, 0, 1, 3);
    expect(replay.idempotent).toBe(true);
    expect(replay.evidenceId).toBe(first.evidenceId);
    const second = await submit(runtime, started.runId, 1, 1, 3);
    expect(second.result?.result).toBe('COMPLETED');
    expect(second.result?.setsMastery).toBe(false);
    expect(second.result?.setsStationCompletion).toBe(false);
    expect(second.result?.rewardEligible).toBe(true);
    // Learning truth untouched by the challenge layer: no station checks, no station pass.
    expect((await learningRepo.listStationChecks(CHILD, 'G1-ST01')).length).toBe(0);
  });

  it('runs a second template (G1-GAME-001, option index) through the same engine path', async () => {
    const { runtime } = await setup();
    const started = await start(runtime, 'pattern');
    expect(started.challenge.gameCode).toBe('G1-GAME-001');
    await expect(submit(runtime, started.runId, 0, 1, 7)).rejects.toThrow('ACTION_SHAPE_INVALID');
    expect((await submit(runtime, started.runId, 0, 1, 2)).correct).toBe(true);
    const done = await submit(runtime, started.runId, 1, 1, 2);
    expect(done.result?.result).toBe('COMPLETED');
  });

  it('rejects key reuse with a different payload and out-of-order rounds (retryable)', async () => {
    const { runtime } = await setup();
    const s = await start(runtime);
    await submit(runtime, s.runId, 0, 1, 3);
    await expect(submit(runtime, s.runId, 0, 1, 4)).rejects.toThrow('IDEMPOTENCY_PAYLOAD_MISMATCH');
    const s2 = await start(runtime, 'count', 'session-2');
    let retryable = false;
    try { await submit(runtime, s2.runId, 1, 1, 3); } catch (e) { retryable = (e as { code?: string; retryable?: boolean }).code === 'ROUND_OUT_OF_ORDER' && Boolean((e as { retryable?: boolean }).retryable); }
    expect(retryable).toBe(true);
  });

  it('start is idempotent per key and rejects a context mismatch', async () => {
    const { runtime } = await setup();
    const cmd = { learningIdentityId: CHILD, relationshipContextId: CTX, sessionId: 'session-1', challengeId: TEMPLATES.count.id, clientIdempotencyKey: 'challenge-start-same-key' };
    const a = await runtime.startRun(cmd);
    const b = await runtime.startRun(cmd);
    expect(b.idempotent).toBe(true);
    expect(b.runId).toBe(a.runId);
    await expect(runtime.startRun({ ...cmd, sessionId: 'session-2' })).rejects.toThrow('IDEMPOTENCY_CONTEXT_MISMATCH');
  });

  it('scaffolds after two wrong attempts, tags scaffolded evidence, and completes WITH_SUPPORT', async () => {
    const { runtime, learningRepo } = await setup();
    const s = await start(runtime);
    const w1 = await submit(runtime, s.runId, 0, 1, 1);
    expect(w1.correct).toBe(false);
    expect(w1.offerHint).toBe(true);
    expect(w1.scaffoldNext).toBe(false);
    const w2 = await submit(runtime, s.runId, 0, 2, 1);
    expect(w2.scaffoldNext).toBe(true);
    expect(w2.next?.level).toBe('SUPPORTED');
    const ok = await submit(runtime, s.runId, 0, 3, 3);
    expect(ok.roundSolved).toBe(true);
    const evidence = (learningRepo as unknown as { evidence: Map<string, { provenance?: Record<string, unknown> }> }).evidence;
    expect(evidence.get(ok.evidenceId!)?.provenance?.scaffolded).toBe(true);
    expect(evidence.get(ok.evidenceId!)?.provenance?.countsTowardMastery).toBe(false);
    expect(evidence.get(w1.evidenceId!)?.provenance?.scaffolded).toBe(false);
    expect(ok.next?.level).toBe('CORE');
    const done = await submit(runtime, s.runId, 1, 1, 3);
    expect(done.result?.result).toBe('COMPLETED_WITH_SUPPORT');
    expect(done.result?.rewardEligible).toBe(true);
  });

  it('closes an unsolved round after the scaffold, continues, and ends NOT_YET without reward', async () => {
    const { runtime } = await setup();
    const s = await start(runtime);
    await submit(runtime, s.runId, 0, 1, 1);
    await submit(runtime, s.runId, 0, 2, 1);
    const closed = await submit(runtime, s.runId, 0, 3, 1);
    expect(closed.roundClosed).toBe(true);
    expect(closed.roundSolved).toBe(false);
    expect(closed.next?.roundIndex).toBe(1);
    await expect(submit(runtime, s.runId, 0, 4, 3)).rejects.toThrow('ROUND_ALREADY_CLOSED');
    const done = await submit(runtime, s.runId, 1, 1, 3);
    expect(done.result?.result).toBe('NOT_YET');
    expect(done.result?.semanticEvent).toBe('RECOVERY');
    expect(done.result?.rewardEligible).toBe(false);
  });

  it('grants reward eligibility once per learner; a replay run never grants again', async () => {
    const { runtime } = await setup();
    const a = await start(runtime);
    await submit(runtime, a.runId, 0, 1, 3);
    expect((await submit(runtime, a.runId, 1, 1, 3)).result?.rewardEligible).toBe(true);
    const b = await start(runtime, 'count', 'session-2');
    await submit(runtime, b.runId, 0, 1, 3);
    const again = await submit(runtime, b.runId, 1, 1, 3);
    expect(again.result?.result).toBe('COMPLETED');
    expect(again.result?.rewardEligible).toBe(false);
  });

  it('early exit is ABANDONED, keeps earlier evidence, and blocks further rounds', async () => {
    const { runtime } = await setup();
    const s = await start(runtime);
    const first = await submit(runtime, s.runId, 0, 1, 3);
    const res = await runtime.finishRun({ learningIdentityId: CHILD, runId: s.runId, reason: 'EXITED' });
    expect(res.result).toBe('ABANDONED');
    expect(res.rewardEligible).toBe(false);
    expect(first.evidenceId).toBeTruthy();
    await expect(submit(runtime, s.runId, 1, 1, 3)).rejects.toThrow('CHALLENGE_RUN_NOT_ACTIVE');
    const view = await runtime.getRun(CHILD, s.runId);
    expect(view.status).toBe('ABANDONED');
    expect(view.next).toBeNull();
  });

  it('hints are idempotent, ordered, never reveal the answer and never reduce reward', async () => {
    const { runtime } = await setup();
    const s = await start(runtime);
    const h0 = await runtime.requestHint({ learningIdentityId: CHILD, runId: s.runId, roundIndex: 0, hintIndex: 0 });
    expect(h0.hintLevel).toBe('STRATEGY');
    expect(h0.revealsFinalAnswer).toBe(false);
    expect(h0.reducesReward).toBe(false);
    expect((await runtime.requestHint({ learningIdentityId: CHILD, runId: s.runId, roundIndex: 0, hintIndex: 0 })).idempotent).toBe(true);
    await expect(runtime.requestHint({ learningIdentityId: CHILD, runId: s.runId, roundIndex: 0, hintIndex: 2 })).rejects.toThrow('HINT_OUT_OF_ORDER');
    expect((await runtime.requestHint({ learningIdentityId: CHILD, runId: s.runId, roundIndex: 0, hintIndex: 1 })).hintLevel).toBe('REPRESENTATION');
    await submit(runtime, s.runId, 0, 1, 3);
    const done = await submit(runtime, s.runId, 1, 1, 3);
    expect(done.result?.result).toBe('COMPLETED_WITH_SUPPORT');
    expect(done.result?.rewardEligible).toBe(true);
  });

  it('refuses MASTERY_CHECK content and other learners', async () => {
    const m = await setup({ masteryContent: true });
    await expect(start(m.runtime)).rejects.toThrow('MASTERY_CHECK_ROLE_FORBIDDEN');
    const { runtime } = await setup();
    const s = await start(runtime);
    await expect(runtime.submitRound({ learningIdentityId: 'child-2', relationshipContextId: CTX, runId: s.runId, roundIndex: 0, attemptNumber: 1, clientIdempotencyKey: challengeRoundIdempotencyKey({ runId: s.runId, roundIndex: 0, attemptNumber: 1 }), answers: [{ answerIndex: 0, answerPayload: 3 }] })).rejects.toThrow('AUTH_CONTEXT_MISMATCH');
    await expect(runtime.getRun('child-2', s.runId)).rejects.toThrow('CHALLENGE_RUN_NOT_FOUND');
  });
});
