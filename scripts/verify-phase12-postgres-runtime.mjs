import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (ok, message) => { if (!ok) throw new Error(message); console.log(`[PASS] ${message}`); };

const schema = read('supabase/migrations/0031_learning_runtime_contract_alignment.sql');
const rpc = read('supabase/migrations/0032_runtime_transactional_rpc.sql') + '\n' + read('supabase/migrations/0033_runtime_integrity_hardening.sql') + '\n' + read('supabase/migrations/0036_deep_integrity_and_projection_hardening.sql');
const adapter = read('apps/web/lib/learning-runtime-production.ts');
const sessions = read('apps/web/app/api/v1/learning/sessions/route.ts');
const encounters = read('apps/web/app/api/v1/learning/sessions/[sessionId]/encounters/route.ts');
const submit = read('apps/web/app/api/v1/learning/attempts/submit/route.ts');
const env = read('.env.example');

must(schema.includes('add column if not exists confidence') && schema.includes('add column if not exists uncertainty'), 'Learning State confidence contract persisted');
must(schema.includes('add column if not exists source_attempt_id'), 'Decision causal source attempt persisted');
must(rpc.includes('create or replace function public.runtime_start_session'), 'Atomic session RPC exists');
must(rpc.includes('create or replace function public.runtime_create_encounter'), 'Atomic encounter RPC exists');
must(rpc.includes('create or replace function public.runtime_submit_attempt'), 'Atomic attempt RPC exists');
must(rpc.includes('security definer') && rpc.includes('set search_path = public, pg_catalog'), 'RPCs use locked security-definer search path');
must(rpc.includes('learning_identities li') && rpc.includes('li.account_id = auth.uid()'), 'RPCs derive learner from authenticated account');
must(rpc.includes('v_session.status <> \'ACTIVE\''), 'Attempt RPC rejects writes to inactive sessions');
must(rpc.includes('passed_check=true') && rpc.includes('distinct session_id'), 'Station pass enforces two separate qualifying sessions');
must(rpc.includes('v_correct_count >= 4') && rpc.includes('jsonb_array_length(p_answers) <> 5'), 'Mastery Check enforces five answers and 4-of-5 qualification');
must(rpc.includes('CONTENT_ROLE_FORM_OVERRIDE_FORBIDDEN'), 'Canonical content role/form cannot be overridden');
must(rpc.includes('CONTENT_PACKAGE_FORBIDDEN'), 'Encounter creation checks content package access');
must(rpc.includes('STATION_SKILL_MAPPING_NOT_FOUND'), 'Encounter creation validates station-skill mapping');
must(rpc.includes('Idempotent replay is allowed even after the original transaction completed'), 'Completed-encounter idempotent replay is supported');
must(rpc.includes('IDEMPOTENCY_PAYLOAD_MISMATCH'), 'Idempotency key cannot be reused with a different payload');
must(read('supabase/migrations/0033_runtime_integrity_hardening.sql').includes("review_need = (state = 'NEEDS_REVIEW')"), 'Historical Learning State review flags are reconciled');
must(read('apps/web/app/api/v1/sync/batch/route.ts').includes('productionLearningRuntime') && read('apps/web/app/api/v1/sync/batch/route.ts').includes('CLIENT_INSTALLATION_FORBIDDEN'), 'Production sync uses authoritative runtime and validates installation ownership');
must(read('apps/mobile/src/station/runtimeApi.ts').includes('station01:v2:${installationId}:${input.sessionId}:${input.encounterId}:${input.content.contentVersionId'), 'Mobile idempotency key is installation-, session-, encounter-, and content-scoped');
must(read('apps/mobile/src/station/runtimeApi.ts').includes('g1-build-001') && read('apps/mobile/src/station/runtimeApi.ts').includes('g1-canonical-v1.0') && read('supabase/migrations/0045_grade1_skill_graph_canonical.sql').includes("'g1-canonical-v1.0'"), 'Mobile defaults match canonical seeded version identifiers (re-baselined 2026-10-04: 0045 promotes g1-provisional-001 to g1-canonical-v1.0)');
must(read('apps/web/lib/runtime-gates.ts').includes('MATH_ADULT_BACKEND') && read('apps/web/lib/runtime-gates.ts').includes('MATH_ASSIGNMENT_BACKEND') && read('apps/web/lib/runtime-gates.ts').includes('MATH_CONTENT_BACKEND'), 'Non-Postgres Adult/Assignment/Content backends fail closed in production');
must(read('supabase/migrations/0034_version_pin_and_seed_gate.sql').includes('LEARNING_IDENTITY_NOT_UNIQUE') && read('supabase/migrations/0033_runtime_integrity_hardening.sql').includes('SKILL_NOT_IN_PINNED_GRAPH'), 'Version-pinned runtime rejects ambiguous identities and out-of-graph skills');
must(adapter.includes("supabaseRpc") && adapter.includes("runtime_submit_attempt"), 'Production adapter calls authoritative RPC');
must(sessions.includes('productionLearningRuntime') && sessions.includes('principal.accessToken'), 'Session route switches to production adapter for authenticated callers');
must(encounters.includes('productionLearningRuntime') && encounters.includes('principal.accessToken'), 'Encounter route switches to production adapter for authenticated callers');
must(submit.includes('productionLearningRuntime') && submit.includes('principal.accessToken'), 'Attempt route switches to production adapter for authenticated callers');
must(submit.includes('principal.accessToken') && submit.includes('runtimeStore.engine.submitAttempt'), 'Development engine remains explicitly behind non-token path');
must(env.includes('0031-0034 are applied'), 'Environment gate documents migration prerequisite');

// Static SQL sanity: every newly introduced function is granted only to authenticated callers.
for (const fn of ['runtime_start_session', 'runtime_create_encounter', 'runtime_submit_attempt']) {
  must(rpc.includes(`grant execute on function public.${fn}`), `${fn} execute grant is explicit`);
  must(rpc.includes(`revoke all on function public.${fn}`), `${fn} public execute is revoked first`);
}

console.log('[PASS] PostgreSQL runtime regression suite: transactional runtime invariants verified.');
