import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter((x) => /^\d{4}_.+\.sql$/.test(x)).sort();
const failures = [];
const numbers = files.map((x) => Number(x.slice(0, 4)));

for (let i = 0; i < numbers.length; i += 1) {
  const expected = i + 1;
  if (numbers[i] !== expected) failures.push(`MIGRATION_SEQUENCE_GAP_OR_DUPLICATE:expected=${String(expected).padStart(4, '0')}:actual=${String(numbers[i]).padStart(4, '0')}`);
}

for (const file of files) {
  const source = fs.readFileSync(path.join(dir, file), 'utf8');
  const dollars = (source.match(/\$\$/g) ?? []).length;
  if (dollars % 2 !== 0) failures.push(`UNBALANCED_DOLLAR_QUOTES:${file}`);
  if (/create\s+policy\s+if\s+not\s+exists/i.test(source)) failures.push(`UNSUPPORTED_POLICY_IF_NOT_EXISTS:${file}`);
  if (/alter\s+policy\s+if\s+not\s+exists/i.test(source)) failures.push(`UNSUPPORTED_ALTER_POLICY_IF_NOT_EXISTS:${file}`);
}

const latest = fs.readFileSync(path.join(dir, '0044_runtime_check_group_ordering.sql'), 'utf8');
if (!/create\s+or\s+replace\s+function\s+public\.runtime_submit_attempt/i.test(latest)) failures.push('0044_MUST_FORWARD_PATCH_RUNTIME_SUBMIT_ATTEMPT');
if (!/v_check_group\s*:=\s*case\s+when\s+v_encounter\.learning_role='MASTERY_CHECK'/s.test(latest)) failures.push('0044_MUST_RESOLVE_CHECK_GROUP_BEFORE_RUNTIME_WRITES');

const androidFoundation = fs.readFileSync(path.join(dir, '0053_android_runtime_foundation.sql'), 'utf8');
const progressionFoundation = fs.readFileSync(path.join(dir, '0054_authoritative_progression_snapshot.sql'), 'utf8');
if (!/create\s+or\s+replace\s+function\s+public\.runtime_resume_session/i.test(androidFoundation)) failures.push('0053_MUST_DEFINE_RUNTIME_RESUME_SESSION');
if (!/create\s+or\s+replace\s+function\s+public\.progression_submit_jump_assessment/i.test(androidFoundation)) failures.push('0053_MUST_DEFINE_SERVER_AUTHORITATIVE_JUMP');
if (!/answer_key\s+jsonb/i.test(androidFoundation)) failures.push('0053_MUST_KEEP_JUMP_ANSWER_KEY_SERVER_SIDE');
if (!/release_channel='STABLE'/i.test(androidFoundation) || !/checksum='bc684964f275808fd87a07880979aba0435a7909a74826e73e996d1a4adc1c94'/i.test(androidFoundation)) failures.push('0053_MUST_CANONICALIZE_ST01_ANDROID_PACKAGE');
if (!/create\s+or\s+replace\s+function\s+public\.runtime_get_progression_snapshot/i.test(progressionFoundation)) failures.push('0054_MUST_DEFINE_AUTHORITATIVE_PROGRESSION_SNAPSHOT');
if (!/jumpUnlockedStationIds/i.test(progressionFoundation) || !/completedStationIds/i.test(progressionFoundation)) failures.push('0054_MUST_RETURN_AUTHORITATIVE_PROGRESSION_PROJECTIONS');

// B0 extended guards — challenge runtime + presentation enrichment (0055/0056/0072/0073)
const requiredTail = [
  '0055_station_challenge_foundation.sql',
  '0056_station_challenge_runtime_rpc.sql',
  '0072_challenge_presentation_fields.sql',
  '0073_p10_depth_answer_position_rebalance.sql',
];
for (const name of requiredTail) {
  if (!files.includes(name)) failures.push(`MISSING_REQUIRED_MIGRATION:${name}`);
}
if (files.includes('0056_station_challenge_runtime_rpc.sql')) {
  const challengeRpc = fs.readFileSync(path.join(dir, '0056_station_challenge_runtime_rpc.sql'), 'utf8');
  if (!/create\s+or\s+replace\s+function\s+public\.runtime_start_challenge/i.test(challengeRpc)) {
    failures.push('0056_MUST_DEFINE_RUNTIME_START_CHALLENGE');
  }
  if (!/create\s+or\s+replace\s+function\s+public\.runtime_submit_challenge_round/i.test(challengeRpc)) {
    failures.push('0056_MUST_DEFINE_RUNTIME_SUBMIT_CHALLENGE_ROUND');
  }
}
if (files.includes('0072_challenge_presentation_fields.sql')) {
  const presentation = fs.readFileSync(path.join(dir, '0072_challenge_presentation_fields.sql'), 'utf8');
  if (!/create\s+or\s+replace\s+function\s+public\.challenge_run_view/i.test(presentation)) {
    failures.push('0072_MUST_DEFINE_CHALLENGE_RUN_VIEW');
  }
  if (!/presentation/i.test(presentation)) {
    failures.push('0072_MUST_EXPOSE_PRESENTATION_FIELDS');
  }
}
if (files.includes('0073_p10_depth_answer_position_rebalance.sql')) {
  const rebalance = fs.readFileSync(path.join(dir, '0073_p10_depth_answer_position_rebalance.sql'), 'utf8');
  const updates = rebalance.split('\n').filter((l) => l.startsWith('update public.content_versions')).length;
  if (updates !== 216) failures.push(`0073_MUST_UPDATE_216_CONTENT_VERSIONS:got=${updates}`);
}

if (failures.length) {
  console.error('MIGRATION_STATIC_GUARD: BLOCKED');
  console.error(failures.join('\n'));
  process.exit(2);
}

console.log(`MIGRATION_STATIC_GUARD: PASS (${files.length} migrations, latest=${files.at(-1)})`);
