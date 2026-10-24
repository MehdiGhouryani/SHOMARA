import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const root = resolve(process.cwd());
const require = createRequire(import.meta.url);
const tscPath = require.resolve('typescript/bin/tsc');

async function runIndependentVerification() {
  console.log('=== STARTING INDEPENDENT MULTI-LAYER VERIFICATION ===\n');

  const pkg = resolve(root, 'packages/learning-runtime');
  execFileSync(process.execPath, [tscPath, '-p', resolve(pkg, 'tsconfig.build.json')], { stdio: 'inherit' });

  // 1. Learning Runtime TS Evaluation Verification
  const runtimePkg = resolve(root, 'packages/learning-runtime/dist/index.js');
  const runtime = await import(runtimePkg);

  console.log('[1/7] Testing Learning Engine: 5/5, 4/5, 3/5, Recovery, 2-Session Rule & Idempotency...');

  function makeContent(id = 'cv-st01-check', checkGroup = 'STATION_PASS') {
    return {
      id,
      gradeId: 'G1',
      stationId: 'G1-ST01',
      skillId: 'G1-SK001',
      learningRole: 'MASTERY_CHECK',
      experienceForm: 'MINI_GAME',
      interactionType: 'COUNT',
      prompt: 'شمارش ستاره‌ها',
      answerSchema: { type: 'integer' },
      evaluatorConfig: {
        version: 'count-v1',
        expectedAnswers: [3, 2, 4, 1, 5],
        maxScore: 5,
        checkGroup,
      },
      feedbackConfig: {},
      hintConfig: {},
    };
  }

  // Test 1: 5/5 Correct
  const repo1 = new runtime.InMemoryLearningRuntimeRepository();
  repo1.registerContent(makeContent('cv-1'));
  const engine1 = new runtime.LearningRuntime(repo1);
  await engine1.startSession({
    id: 'sess-1',
    learningIdentityId: 'child-1',
    relationshipContextId: 'platform',
    gradeId: 'G1',
    curriculumVersionId: 'G1-CV1',
    skillGraphVersionId: 'G1-SG1',
    sessionType: 'LEARNING',
  });
  await engine1.createEncounter({
    id: 'enc-1',
    sessionId: 'sess-1',
    sequence: 1,
    stationId: 'G1-ST01',
    skillId: 'G1-SK001',
    contentVersionId: 'cv-1',
    learningRole: 'MASTERY_CHECK',
    experienceForm: 'MINI_GAME',
  });
  const res5of5 = await engine1.submitAttempt({
    learningIdentityId: 'child-1',
    relationshipContextId: 'platform',
    sessionId: 'sess-1',
    encounterId: 'enc-1',
    attemptNumber: 1,
    clientIdempotencyKey: 'idem-5of5',
    answers: [0, 1, 2, 3, 4].map((i) => ({ answerIndex: i, answerPayload: [3, 2, 4, 1, 5][i] })),
  });
  assert.equal(res5of5.attempt.evaluation?.correct, true);
  assert.equal(res5of5.learningState.state, 'BUILDING');
  assert.equal(res5of5.stationPass, false);
  console.log('  ✅ Case 1 (5/5 Correct): Mastery evidence created, state=BUILDING, evaluation=correct');

  // Test 2: 3/5 Wrong (Routes to RECOVERY)
  const repo2 = new runtime.InMemoryLearningRuntimeRepository();
  repo2.registerContent(makeContent('cv-2'));
  const engine2 = new runtime.LearningRuntime(repo2);
  await engine2.startSession({
    id: 'sess-2',
    learningIdentityId: 'child-2',
    relationshipContextId: 'platform',
    gradeId: 'G1',
    curriculumVersionId: 'G1-CV1',
    skillGraphVersionId: 'G1-SG1',
    sessionType: 'LEARNING',
  });
  await engine2.createEncounter({
    id: 'enc-2',
    sessionId: 'sess-2',
    sequence: 1,
    stationId: 'G1-ST01',
    skillId: 'G1-SK001',
    contentVersionId: 'cv-2',
    learningRole: 'MASTERY_CHECK',
    experienceForm: 'MINI_GAME',
  });
  const res3of5 = await engine2.submitAttempt({
    learningIdentityId: 'child-2',
    relationshipContextId: 'platform',
    sessionId: 'sess-2',
    encounterId: 'enc-2',
    attemptNumber: 1,
    clientIdempotencyKey: 'idem-3of5',
    answers: [0, 1, 2, 3, 4].map((i) => ({ answerIndex: i, answerPayload: [3, 9, 2, 7, 5][i] })),
  });
  assert.equal(res3of5.attempt.evaluation?.correct, false);
  assert.equal(res3of5.decision.selectedStep, 'RECOVERY');
  assert.equal(res3of5.learningState.state, 'NEEDS_REVIEW');
  console.log('  ✅ Case 2 (3/5 Wrong): Correctly routes to RECOVERY, state=NEEDS_REVIEW');

  // Test 3: 4/5 Qualifying Check (no recovery)
  const repo3 = new runtime.InMemoryLearningRuntimeRepository();
  repo3.registerContent(makeContent('cv-3'));
  const engine3 = new runtime.LearningRuntime(repo3);
  await engine3.startSession({
    id: 'sess-3',
    learningIdentityId: 'child-3',
    relationshipContextId: 'platform',
    gradeId: 'G1',
    curriculumVersionId: 'G1-CV1',
    skillGraphVersionId: 'G1-SG1',
    sessionType: 'LEARNING',
  });
  await engine3.createEncounter({
    id: 'enc-3',
    sessionId: 'sess-3',
    sequence: 1,
    stationId: 'G1-ST01',
    skillId: 'G1-SK001',
    contentVersionId: 'cv-3',
    learningRole: 'MASTERY_CHECK',
    experienceForm: 'MINI_GAME',
  });
  const res4of5 = await engine3.submitAttempt({
    learningIdentityId: 'child-3',
    relationshipContextId: 'platform',
    sessionId: 'sess-3',
    encounterId: 'enc-3',
    attemptNumber: 1,
    clientIdempotencyKey: 'idem-4of5',
    answers: [0, 1, 2, 3, 4].map((i) => ({ answerIndex: i, answerPayload: [3, 2, 4, 1, 4][i] })),
  });
  assert.equal(res4of5.attempt.evaluation?.correct, false);
  assert.equal(res4of5.attempt.evaluation?.score, 4);
  assert.equal(res4of5.decision.selectedStep, 'CONTINUE');
  assert.equal(res4of5.learningState.recoveryNeed, false);
  assert.equal(res4of5.learningState.reviewNeed, false);
  console.log('  ✅ Case 3 (4/5 Qualifying Check): Passes 4-of-5 qualification, selectedStep=CONTINUE, no recovery');

  // Test 4: Two-Session Rule for Station Pass
  const repo4 = new runtime.InMemoryLearningRuntimeRepository();
  repo4.registerContent(makeContent('cv-sp-1', 'STATION_PASS'));
  repo4.registerContent(makeContent('cv-sp-2', 'STATION_PASS'));
  const engine4 = new runtime.LearningRuntime(repo4);
  
  // Session 1
  await engine4.startSession({ id: 's1', learningIdentityId: 'child-sp', relationshipContextId: 'platform', gradeId: 'G1', curriculumVersionId: 'G1-CV1', skillGraphVersionId: 'G1-SG1', sessionType: 'LEARNING' });
  await engine4.createEncounter({ id: 'e1', sessionId: 's1', sequence: 1, stationId: 'G1-ST01', skillId: 'G1-SK001', contentVersionId: 'cv-sp-1', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME' });
  const r1 = await engine4.submitAttempt({ learningIdentityId: 'child-sp', relationshipContextId: 'platform', sessionId: 's1', encounterId: 'e1', attemptNumber: 1, clientIdempotencyKey: 'k1', answers: [0,1,2,3,4].map(i => ({ answerIndex: i, answerPayload: [3,2,4,1,5][i] })) });
  assert.equal(r1.stationPass, false);

  // Session 2
  await engine4.startSession({ id: 's2', learningIdentityId: 'child-sp', relationshipContextId: 'platform', gradeId: 'G1', curriculumVersionId: 'G1-CV1', skillGraphVersionId: 'G1-SG1', sessionType: 'LEARNING' });
  await engine4.createEncounter({ id: 'e2', sessionId: 's2', sequence: 1, stationId: 'G1-ST01', skillId: 'G1-SK001', contentVersionId: 'cv-sp-2', learningRole: 'MASTERY_CHECK', experienceForm: 'MINI_GAME' });
  const r2 = await engine4.submitAttempt({ learningIdentityId: 'child-sp', relationshipContextId: 'platform', sessionId: 's2', encounterId: 'e2', attemptNumber: 1, clientIdempotencyKey: 'k2', answers: [0,1,2,3,4].map(i => ({ answerIndex: i, answerPayload: [3,2,4,1,5][i] })) });
  assert.equal(r2.stationPass, true);
  console.log('  ✅ Case 4 (Two-Session Rule): Station Pass granted strictly on second independent session');

  // Test 5: Idempotency Replay
  const dup = await engine4.submitAttempt({ learningIdentityId: 'child-sp', relationshipContextId: 'platform', sessionId: 's2', encounterId: 'e2', attemptNumber: 1, clientIdempotencyKey: 'k2', answers: [0,1,2,3,4].map(i => ({ answerIndex: i, answerPayload: [3,2,4,1,5][i] })) });
  assert.equal(dup.idempotent, true);
  assert.equal(dup.attempt.id, r2.attempt.id);
  console.log('  ✅ Case 5 (Idempotent Replay): Duplicate submission returns original attempt without re-executing');

  console.log('\n[2/7] Testing DB Migrations Integrity (44 files)...');
  await import(resolve(root, 'scripts/verify-migrations-static.mjs'));
  console.log('  ✅ Migrations 0001 through 0044 verified sequentially');

  console.log('\n[3/7] Testing Production Auth / RLS Boundary...');
  await import(resolve(root, 'scripts/verify-phase11-auth.mjs'));
  console.log('  ✅ Auth and RLS static policies verified');

  console.log('\n[4/7] Testing Postgres Learning Runtime RPC Contracts...');
  await import(resolve(root, 'scripts/verify-phase12-postgres-runtime.mjs'));
  console.log('  ✅ PostgreSQL RPCs (start_session, create_encounter, submit_attempt) verified');

  console.log('\n[5/7] Testing Deep Remediation & Content Pinning (ST01 12+8 Variants)...');
  await import(resolve(root, 'scripts/verify-phase14-deep-remediation.mjs'));
  console.log('  ✅ 12 logical + 8 hidden variants and package checksum verified');

  console.log('\n[6/7] Testing Adversarial Check Group and Evidence Provenance...');
  await import(resolve(root, 'scripts/verify-phase15-deep-remediation.mjs'));
  console.log('  ✅ Provenance fields, check group ordering and hypothesis tracking verified');

  console.log('\n[7/7] Testing Fail-Closed Production Readiness Gates...');
  await import(resolve(root, 'scripts/verify-phase16-deep-audit.mjs'));
  console.log('  ✅ All verification gates executed successfully');

  console.log('\n🎉 =======================================================');
  console.log('🎉 ALL INDEPENDENT VERIFICATIONS COMPLETED SUCCESSFULLY!');
  console.log('🎉 =======================================================');
}

runIndependentVerification().catch((err) => {
  console.error('\n❌ INDEPENDENT VERIFICATION FAILED:', err);
  process.exit(1);
});
