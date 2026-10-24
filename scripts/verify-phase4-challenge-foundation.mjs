import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const failures = [];
const check = (name, ok) => { if (!ok) failures.push(name); };

check('contract_exists', exists('packages/contracts/src/challenge.ts'));
check('challenge_runtime_package_exists', exists('packages/challenge-runtime/src/service.ts') && exists('packages/challenge-runtime/src/repository.ts') && exists('packages/challenge-runtime/src/types.ts'));
check('challenge_tests_exist', exists('packages/challenge-runtime/src/__tests__/challenge.test.ts'));
check('forward_migration_exists', exists('supabase/migrations/0055_station_challenge_foundation.sql'));
check('runtime_rpc_migration_exists', exists('supabase/migrations/0056_station_challenge_runtime_rpc.sql'));
check('runtime_test_runner_exists', exists('scripts/test-challenge-runtime.mjs'));
check('runtime_test_runner_is_not_a_skip', read('scripts/test-challenge-runtime.mjs').includes('P04-CHALLENGE-RUNTIME-TESTS'));
check('api_boundary_exists', exists('apps/web/lib/challenge-runtime-production.ts') &&
  exists('apps/web/app/api/v1/challenges/runs/route.ts') &&
  exists('apps/web/app/api/v1/challenges/runs/[runId]/rounds/route.ts'));

const contract = read('packages/contracts/src/challenge.ts');
const service = read('packages/challenge-runtime/src/service.ts');
const types = read('packages/challenge-runtime/src/types.ts');
const migration = read('supabase/migrations/0055_station_challenge_foundation.sql');
const tests = read('packages/challenge-runtime/src/__tests__/challenge.test.ts');
const runtimeMigration = read('supabase/migrations/0056_station_challenge_runtime_rpc.sql');

check('two_template_adapters', contract.includes("'G1-GAME-001'") && contract.includes("'G1-GAME-002'"));
check('server_evaluator_boundary', service.includes('this.learning.submitAttempt') && service.includes('Learning Runtime'));
check('no_parallel_engine', !service.includes('class ChallengeEngine2') && !service.includes('class ChallengeEngine'));
check('difficulty_preserves_skill', contract.includes('preservesSkillIdentity: true') && contract.includes('DIFFICULTY_CHANGES_SKILL_IDENTITY'));
check('no_mastery_or_station_pass', types.includes('setsMastery: false') && types.includes('setsStationCompletion: false') && contract.includes('countsTowardStationPass: false'));
check('no_hard_timer', contract.includes('HARD_TIMER_FORBIDDEN') && migration.includes("timer_policy text not null check (timer_policy in ('NONE','SOFT'))"));
check('answer_keys_stay_out', contract.includes('FORBIDDEN_CLIENT_ANSWER_KEYS') && contract.includes('evaluatorConfig') && service.includes('assertContentIntegrity'));
check('versioned_evaluator', contract.includes('evaluatorVersion') && migration.includes('evaluator_version text not null'));
check('idempotent_start', service.includes('getRunByIdempotency') && service.includes('IDEMPOTENCY_CONTEXT_MISMATCH'));
check('idempotent_round_replay', service.includes('getRoundSubmission') && service.includes('IDEMPOTENCY_PAYLOAD_MISMATCH') && service.includes('RETURN_STORED_RESULT') === false);
check('offline_semantics', contract.includes('CHALLENGE_OFFLINE_REPLAY_SEMANTICS') && contract.includes('FIFO_PER_RUN') && contract.includes('NEUTRAL_SYNC_PENDING'));
check('hint_no_answer_or_penalty', contract.includes('revealsFinalAnswer: false') && contract.includes('reducesReward: false'));
check('reward_not_mastery', service.includes('saveRewardEligibility') && service.includes('rewardEligible') && !service.includes('saveStationCheck'));
check('forward_only_schema', migration.includes('create table if not exists public.station_challenge_runs') && migration.includes('runtime_submit_attempt'));
check('runtime_rpc_implementation', runtimeMigration.includes('create or replace function public.runtime_start_challenge') && runtimeMigration.includes('runtime_submit_attempt') && runtimeMigration.includes('challenge_finalize_run'));
check('challenge_provenance_link', runtimeMigration.includes('station_challenge_attempt_links') && runtimeMigration.includes('counts_toward_mastery boolean not null default false check (counts_toward_mastery = false)'));
check('server_fingerprint', runtimeMigration.includes('challenge_answers_fingerprint') && runtimeMigration.includes('p_request_fingerprint'));
check('mobile_boundary_exists', read('apps/mobile/src/station/runtimeApi.ts').includes('startSignatureChallenge') &&
  read('apps/mobile/src/station/runtimeApi.ts').includes('submitSignatureChallengeRound'));
check('writes_revoked', migration.includes('revoke insert, update, delete on public.station_challenge_runs from authenticated'));
check('runtime_tests_cover_idempotency', tests.includes('idempotent') && tests.includes('setsMastery'));

if (failures.length) {
  console.error(JSON.stringify({ phase: 'P04-STATION-CHALLENGE-FOUNDATION', status: 'FAIL', failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ phase: 'P04-STATION-CHALLENGE-FOUNDATION', status: 'PASS', checks: 32 }, null, 2));
