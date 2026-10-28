import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrations = fs.readdirSync(path.join(root, 'supabase/migrations')).sort();
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const allSql = migrations.map((m) => read(`supabase/migrations/${m}`)).join('\n');
const seed = read('supabase/migrations/0017_seed_registry.sql');
const executableSeed = read('supabase/migrations/0035_grade1_staging_seed.sql');
const recoverySeed = read('supabase/migrations/0039_skill_aware_recovery_variants.sql');
const stationSource = read('docs/source/math_learning_product_station01_vertical_slice_v0_30_completed_v0_31.md');
const policySource = read('packages/learning-runtime/src/policies.ts');
const rpcSource = read('supabase/migrations/0033_runtime_integrity_hardening.sql') + '\n' + read('supabase/migrations/0036_deep_integrity_and_projection_hardening.sql') + '\n' + read('supabase/migrations/0043_runtime_semantics_v2.sql') + '\n' + read('supabase/migrations/0044_runtime_check_group_ordering.sql');

const failures = [];
const requiredStationEntries = ['ST01-E01','ST01-E02','ST01-E03','ST01-E04','ST01-E05','ST01-E06','ST01-E07','ST01-E08','ST01-E09','ST01-E10','ST01-E11','ST01-E12'];
const requiredMigrations = ['0030_runtime_client_write_lockdown.sql','0031_learning_runtime_contract_alignment.sql','0032_runtime_transactional_rpc.sql','0033_runtime_integrity_hardening.sql','0034_version_pin_and_seed_gate.sql','0035_grade1_staging_seed.sql','0036_deep_integrity_and_projection_hardening.sql','0037_content_runtime_boundary.sql','0038_content_delivery_rls_hardening.sql','0039_skill_aware_recovery_variants.sql','0040_recovery_package_version.sql','0041_grade1_skill_relations_completion.sql','0042_learning_truth_schema_alignment.sql','0043_runtime_semantics_v2.sql','0044_runtime_check_group_ordering.sql','0045_grade1_skill_graph_canonical.sql','0046_st01_content_canonical_approval.sql'];
for (const m of requiredMigrations) if (!migrations.includes(m)) failures.push(`MISSING_MIGRATION:${m}`);

// Grade-1 executable staging seed is present, but production remains blocked until educational approval and live Supabase verification.
const requiredExecutableSeeds = ['stations', 'skills', 'station_skills', 'content_artifacts', 'content_versions', 'content_packages', 'content_manifests', 'content_manifest_items'];
const lowerSeed = executableSeed.toLowerCase();
const executableSeedPresence = requiredExecutableSeeds.filter((name) => lowerSeed.includes(`insert into public.${name}`));
if (executableSeedPresence.length !== requiredExecutableSeeds.length) {
  failures.push(`EXECUTABLE_SEED_INCOMPLETE:missing ${requiredExecutableSeeds.filter((name) => !executableSeedPresence.includes(name)).join(',')}`);
}
for (const entry of requiredStationEntries) {
  if (!executableSeed.includes(entry)) failures.push(`SEED_ST01_ENTRY_MISSING:${entry}`);
}
for (const marker of ['G1-SK001','G1-SK064','G1-ST25','G1-ST01-E12','g1-provisional-001','EDUCATIONAL_REVIEW_REQUIRED']) {
  if (!executableSeed.includes(marker)) failures.push(`SEED_MARKER_MISSING:${marker}`);
}
for (const entry of ['G1-ST01-RECOVERY-SK001','G1-ST01-RECOVERY-SK003','G1-ST01-RECOVERY-SK009','G1-ST01-RECOVERY-SK011']) {
  if (!recoverySeed.includes(entry)) failures.push(`RECOVERY_VARIANT_MISSING:${entry}`);
}
// Readiness is intentionally blocked until educational approval and live database verification exist.
if (!allSql.includes('g1-canonical-v1.0')) {
  failures.push('PRODUCTION_PILOT_BLOCKED:grade1_skill_graph_is_provisional');
}
if (!allSql.includes('CANONICAL_APPROVED')) {
  failures.push('PRODUCTION_PILOT_BLOCKED:st01_content_requires_educational_review');
}
if (!rpcSource.includes('runtime_submit_attempt') || !rpcSource.includes('security definer')) {
  failures.push('PRODUCTION_PILOT_BLOCKED:live_supabase_auth_rls_rpc_e2e_not_verified');
}

const policyVersion = /RUNTIME_POLICY_VERSION\s*=\s*'([^']+)'/.exec(policySource)?.[1];
const passPolicyVersion = /STATION_PASS_POLICY_VERSION\s*=\s*'([^']+)'/.exec(policySource)?.[1];
if (policyVersion && !rpcSource.includes(`'${policyVersion}'`)) failures.push(`POLICY_VERSION_DRIFT:${policyVersion}`);
if (passPolicyVersion && !rpcSource.includes(`'${passPolicyVersion}'`)) failures.push(`PASS_POLICY_VERSION_DRIFT:${passPolicyVersion}`);

for (const e of requiredStationEntries) if (!stationSource.includes(e)) failures.push(`SOURCE_ST01_ENTRY_MISSING:${e}`);

const prodGates = ['MATH_RUNTIME_BACKEND','MATH_ADULT_BACKEND','MATH_ASSIGNMENT_BACKEND','MATH_CONTENT_BACKEND','MATH_ADULT_PROJECTION_REPO','MATH_ASSIGNMENT_REPO'];
const envExample = read('.env.example');
for (const key of prodGates) if (!envExample.includes(key)) failures.push(`ENV_EXAMPLE_MISSING:${key}`);

// Guard against route regressions: no validation response may reference an out-of-scope catch variable.
const routeRoot = path.join(root, 'apps/web/app/api/v1');
function walk(dir) {
  const out=[];
  for (const ent of fs.readdirSync(dir,{withFileTypes:true})) {
    const p=path.join(dir,ent.name);
    if (ent.isDirectory()) out.push(...walk(p)); else if (ent.name==='route.ts') out.push(p);
  }
  return out;
}
for (const file of walk(routeRoot)) {
  const s=fs.readFileSync(file,'utf8');
  if (/apiErrorStatus\(error\)/.test(s)) {
    const lines=s.split(/\r?\n/);
    lines.forEach((line,i)=>{
      if (!line.includes('apiErrorStatus(error)')) return;
      const statementPrefix=lines[i].slice(0, Math.max(0, lines[i].indexOf('apiErrorStatus(error)')));
      const prior=lines.slice(Math.max(0,i-10),i).join('\n');
      if (!/catch\s*\(\s*error\s*\)/.test(prior) && !/catch\s*\(\s*error\s*\)/.test(statementPrefix)) failures.push(`UNSCOPED_ERROR_REF:${path.relative(root,file)}:${i+1}`);
    });
  }
}

if (failures.length) {
  console.error('PRODUCTION_READINESS_STATIC_GUARD: BLOCKED');
  console.error(failures.join('\n'));
  process.exit(2);
}

console.log('PRODUCTION_READINESS_STATIC_GUARD: PASS');
