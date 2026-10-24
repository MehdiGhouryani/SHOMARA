import fs from 'node:fs';
import path from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const migrationDir = path.join(root, 'supabase', 'migrations');
const files = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql')).sort();

const required = [
  '0001_extensions_and_helpers.sql',
  '0002_accounts_and_roles.sql',
  '0003_client_installations_and_push.sql',
  '0004_relationships_and_classes.sql',
  '0005_grades_and_curriculum.sql',
  '0006_skill_graph_and_stations.sql',
  '0007_learning_objectives.sql',
  '0008_content_contract.sql',
  '0009_diagnostics_and_policies.sql',
  '0010_runtime_core.sql',
  '0011_evidence_and_state.sql',
  '0012_decisions_and_plans.sql',
  '0013_progression_unlocks_quests_rewards.sql',
  '0014_events_and_audit.sql',
  '0015_entitlements_and_assignments.sql',
  '0016_rls_hardening_and_indexes.sql',
  '0017_seed_registry.sql',
  '0018_auth_trigger.sql',
  '0019_rls_tests_contract.sql',
  '0020_rls_historical_safety.sql',
  '0021_phase2_completion.sql',
];

const errors = [];
if (files.length < required.length || required.some((name, index) => files[index] !== name)) {
  errors.push(`Migration order mismatch. Required prefix: ${required.join(', ')}; Found: ${files.join(', ')}`);
}

const allSql = files.map(f => fs.readFileSync(path.join(migrationDir, f), 'utf8')).join('\n');
for (const table of [
  'accounts','account_roles','learning_identities','client_installations','relationships','classes','class_memberships',
  'grades','curriculum_versions','skill_graph_versions','skills','stations','station_skills','learning_objectives',
  'content_artifacts','content_versions','sessions','encounters','attempts','answers','evidence','learning_states',
  'learning_decisions','learning_plans','entitlements','assignments','assignment_instances','events','audit_records'
]) {
  if (!new RegExp(`create table if not exists public\\.${table}\\b`).test(allSql)) errors.push(`Missing table: ${table}`);
}

for (const role of ['CHILD','PARENT','TEACHER','ADMIN']) {
  if (!allSql.includes(`'${role}'`)) errors.push(`Missing role vocabulary: ${role}`);
}

for (const forbidden of ['Unity','Unreal','Godot']) {
  if (allSql.includes(forbidden)) errors.push(`Forbidden runtime dependency found in SQL: ${forbidden}`);
}

for (const historical of ['revoke delete on public.evidence', 'revoke delete on public.sessions', 'revoke delete on public.answers']) {
  if (!allSql.toLowerCase().includes(historical)) errors.push(`Missing historical safety rule: ${historical}`);
}

if (!fs.existsSync(path.join(root, 'docs', 'adr', 'ADR-0001-no-unity-game-architecture.md'))) {
  errors.push('Missing no-Unity architecture ADR');
}

if (errors.length) {
  console.error('PHASE2 VERIFY: FAIL');
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log(`PHASE2 VERIFY: PASS — ${files.length} migrations checked, canonical architecture constraints present.`);
