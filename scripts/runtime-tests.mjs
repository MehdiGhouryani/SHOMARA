import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

const root = resolve(process.cwd());
const require = createRequire(import.meta.url);
const tscPath = require.resolve('typescript/bin/tsc');
const pkg = resolve(root, 'packages/learning-runtime');
// Fixed 2026-10-04 (P02-A): only clean up dist/ if this script created it. Deleting a pre-existing
// build broke later gates (web build, mobile export) because @math/learning-runtime resolves to dist/.
const distExisted = existsSync(pkg + '/dist');
execFileSync(process.execPath, [tscPath, '-p', resolve(pkg, 'tsconfig.build.json')], { stdio: 'inherit' });
const runtime = await import(resolve(pkg, 'dist/index.js'));

function makeContent(id = 'cv-st01-check') {
  return {
    id, gradeId: 'G1', stationId: 'G1-ST01', skillId: 'G1-SK001',
    learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME', interactionType: 'COUNT',
    prompt: 'How many stars?', answerSchema: { type: 'integer' },
    evaluatorConfig: { version: 'count-v1', expectedAnswers: [3, 2, 4, 1, 5], maxScore: 5, checkGroup: 'STATION_PASS' },
    feedbackConfig: {}, hintConfig: {},
  };
}

async function setup(sessionId) {
  const repo = new runtime.InMemoryLearningRuntimeRepository();
  repo.registerContent(makeContent());
  repo.registerContent({ ...makeContent('cv-st01-check-2'), evaluatorConfig: { version: 'count-v1', expectedAnswers: [3, 2, 4, 1, 5], maxScore: 5, checkGroup: 'STATION_PASS' } });
  const engine = new runtime.LearningRuntime(repo);
  await engine.startSession({ id: sessionId, learningIdentityId: 'child-1', relationshipContextId: 'platform', gradeId: 'G1', curriculumVersionId: 'G1-CV1', skillGraphVersionId: 'G1-SG1', sessionType: 'LEARNING' });
  return { repo, engine };
}

test('correct mastery check creates evidence and deterministic state', async () => {
  const { engine } = await setup('sess-1');
  await engine.createEncounter({ id: 'enc-1', sessionId: 'sess-1', sequence: 1, stationId: 'G1-ST01', skillId: 'G1-SK001', contentVersionId: 'cv-st01-check', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME' });
  const result = await engine.submitAttempt({ learningIdentityId: 'child-1', relationshipContextId: 'platform', sessionId: 'sess-1', encounterId: 'enc-1', attemptNumber: 1, clientIdempotencyKey: 'key-1', answers: [0,1,2,3,4].map((answerIndex) => ({ answerIndex, answerPayload: [3,2,4,1,5][answerIndex] })) });
  assert.equal(result.attempt.evaluation?.correct, true);
  assert.equal(result.learningState.state, 'BUILDING');
  assert.equal(result.stationPass, false);
  assert.equal(result.semanticEvent, 'ANSWER_CORRECT');
});

test('wrong answer routes to recovery, not diagnosis', async () => {
  const { engine } = await setup('sess-2');
  await engine.createEncounter({ id: 'enc-2', sessionId: 'sess-2', sequence: 1, stationId: 'G1-ST01', skillId: 'G1-SK001', contentVersionId: 'cv-st01-check', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME' });
  const result = await engine.submitAttempt({ learningIdentityId: 'child-1', relationshipContextId: 'platform', sessionId: 'sess-2', encounterId: 'enc-2', attemptNumber: 1, clientIdempotencyKey: 'key-2', answers: [0,1,2,3,4].map((answerIndex) => ({ answerIndex, answerPayload: [3,9,2,7,5][answerIndex] })) });
  assert.equal(result.attempt.evaluation?.correct, false);
  assert.equal(result.decision.selectedStep, 'RECOVERY');
  assert.equal(result.learningState.state, 'NEEDS_REVIEW');
});

test('duplicate submission is idempotent', async () => {
  const { engine } = await setup('sess-3');
  await engine.createEncounter({ id: 'enc-3', sessionId: 'sess-3', sequence: 1, stationId: 'G1-ST01', skillId: 'G1-SK001', contentVersionId: 'cv-st01-check', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME' });
  const command = { learningIdentityId: 'child-1', relationshipContextId: 'platform', sessionId: 'sess-3', encounterId: 'enc-3', attemptNumber: 1, clientIdempotencyKey: 'key-3', answers: [0,1,2,3,4].map((answerIndex) => ({ answerIndex, answerPayload: [3,2,4,1,5][answerIndex] })) };
  const first = await engine.submitAttempt(command);
  const second = await engine.submitAttempt(command);
  assert.equal(first.idempotent, false);
  assert.equal(second.idempotent, true);
  assert.equal(second.attempt.id, first.attempt.id);
  assert.equal(second.decision.id, first.decision.id);
  assert.equal(second.plan.id, first.plan.id);
});


test('four of five is a qualifying check and does not trigger recovery', async () => {
  const { engine } = await setup('sess-4c');
  await engine.createEncounter({ id: 'enc-4c', sessionId: 'sess-4c', sequence: 1, stationId: 'G1-ST01', skillId: 'G1-SK001', contentVersionId: 'cv-st01-check', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME' });
  const result = await engine.submitAttempt({ learningIdentityId: 'child-1', relationshipContextId: 'platform', sessionId: 'sess-4c', encounterId: 'enc-4c', attemptNumber: 1, clientIdempotencyKey: 'key-4c', answers: [0,1,2,3,4].map((answerIndex) => ({ answerIndex, answerPayload: [3,2,4,1,4][answerIndex] })) });
  assert.equal(result.attempt.evaluation?.correct, false);
  assert.equal(result.attempt.evaluation?.score, 4);
  assert.equal(result.decision.selectedStep, 'CONTINUE');
  assert.equal(result.learningState.recoveryNeed, false);
  assert.equal(result.learningState.reviewNeed, false);
  assert.equal(result.learningState.state, 'BUILDING');
  assert.equal(result.stationPass, false);
});
test('mastery evidence can qualify without granting station pass', async () => {
  const repo = new runtime.InMemoryLearningRuntimeRepository();
  const content = makeContent('cv-st01-mastery');
  content.evaluatorConfig = { version: 'mastery-v1', expectedAnswers: [3, 2, 4, 1, 5], maxScore: 5, checkGroup: 'MASTERY_EVIDENCE' };
  repo.registerContent(content);
  const engine = new runtime.LearningRuntime(repo);
  await engine.startSession({ id: 'sess-mastery', learningIdentityId: 'child-1', relationshipContextId: 'platform', gradeId: 'G1', curriculumVersionId: 'G1-CV1', skillGraphVersionId: 'G1-SG1', sessionType: 'LEARNING' });
  await engine.createEncounter({ id: 'enc-mastery', sessionId: 'sess-mastery', sequence: 1, stationId: 'G1-ST01', skillId: 'G1-SK001', contentVersionId: 'cv-st01-mastery', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME' });
  const result = await engine.submitAttempt({ learningIdentityId: 'child-1', relationshipContextId: 'platform', sessionId: 'sess-mastery', encounterId: 'enc-mastery', attemptNumber: 1, clientIdempotencyKey: 'key-mastery', answers: [0,1,2,3,4].map((answerIndex) => ({ answerIndex, answerPayload: [3,2,4,1,5][answerIndex] })) });
  assert.equal(result.stationPass, false);
  assert.equal(result.decision.selectedStep, 'CONTINUE');
});

test('station pass requires two separate qualifying checks', async () => {
  const repo = new runtime.InMemoryLearningRuntimeRepository();
  repo.registerContent(makeContent());
  const engine = new runtime.LearningRuntime(repo);
  await engine.startSession({ id: 'sess-4a', learningIdentityId: 'child-1', relationshipContextId: 'platform', gradeId: 'G1', curriculumVersionId: 'G1-CV1', skillGraphVersionId: 'G1-SG1', sessionType: 'LEARNING' });
  await engine.createEncounter({ id: 'enc-4a', sessionId: 'sess-4a', sequence: 1, stationId: 'G1-ST01', skillId: 'G1-SK001', contentVersionId: 'cv-st01-check', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME' });
  const first = await engine.submitAttempt({ learningIdentityId: 'child-1', relationshipContextId: 'platform', sessionId: 'sess-4a', encounterId: 'enc-4a', attemptNumber: 1, clientIdempotencyKey: 'key-4a', answers: [0,1,2,3,4].map((answerIndex) => ({ answerIndex, answerPayload: [3,2,4,1,5][answerIndex] })) });
  assert.equal(first.stationPass, false);

  await engine.startSession({ id: 'sess-4b', learningIdentityId: 'child-1', relationshipContextId: 'platform', gradeId: 'G1', curriculumVersionId: 'G1-CV1', skillGraphVersionId: 'G1-SG1', sessionType: 'LEARNING' });
  await engine.createEncounter({ id: 'enc-4b', sessionId: 'sess-4b', sequence: 1, stationId: 'G1-ST01', skillId: 'G1-SK001', contentVersionId: 'cv-st01-check', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME' });
  const second = await engine.submitAttempt({ learningIdentityId: 'child-1', relationshipContextId: 'platform', sessionId: 'sess-4b', encounterId: 'enc-4b', attemptNumber: 1, clientIdempotencyKey: 'key-4b', answers: [0,1,2,3,4].map((answerIndex) => ({ answerIndex, answerPayload: [3,2,4,1,5][answerIndex] })) });
  assert.equal(second.stationPass, true);
  assert.equal(second.decision.selectedStep, 'STATION_PASS');
});

if (!distExisted) {
  rmSync(pkg + '/dist', { recursive: true, force: true });
  assert.equal(existsSync(pkg + '/dist'), false);
}
console.log('[PASS] Phase 5 runtime tests');
