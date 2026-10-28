#!/usr/bin/env node
/**
 * B0 — Backend foundation gate (static, no live Supabase required).
 *
 * Checks:
 * 1. Migration sequence 0001..N continuous
 * 2. Critical runtime / challenge / progression objects referenced in SQL
 * 3. Phase 0–4 presentation + rebalance migrations present
 * 4. Mobile runtime API still talks to documented learning/challenge paths
 * 5. Contracts challenge-presentation map covers ST01–ST25
 *
 * Staging apply + live RPC smoke remain human/CI-with-secrets steps.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const failures = [];
const ok = (m) => console.log(`PASS  ${m}`);
const fail = (m) => {
  failures.push(m);
  console.error(`FAIL  ${m}`);
};

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

// --- 1. Migrations ---
const migDir = path.join(root, 'supabase', 'migrations');
if (!fs.existsSync(migDir)) {
  fail('MISSING_MIGRATIONS_DIR');
} else {
  const files = fs.readdirSync(migDir).filter((x) => /^\d{4}_.+\.sql$/.test(x)).sort();
  const numbers = files.map((x) => Number(x.slice(0, 4)));
  for (let i = 0; i < numbers.length; i += 1) {
    if (numbers[i] !== i + 1) {
      fail(`MIGRATION_SEQUENCE:expected=${String(i + 1).padStart(4, '0')}:actual=${String(numbers[i]).padStart(4, '0')}`);
      break;
    }
  }
  if (files.length < 73) fail(`MIGRATION_COUNT_LT_73:got=${files.length}`);
  else ok(`migrations sequence ${files.length} files through ${files.at(-1)}`);

  const required = [
    '0053_android_runtime_foundation.sql',
    '0054_authoritative_progression_snapshot.sql',
    '0055_station_challenge_foundation.sql',
    '0056_station_challenge_runtime_rpc.sql',
    '0072_challenge_presentation_fields.sql',
    '0073_p10_depth_answer_position_rebalance.sql',
  ];
  for (const f of required) {
    if (!files.includes(f)) fail(`MISSING_MIGRATION:${f}`);
  }
  ok('required foundation migrations present');

  // Dollar-quote balance + forbidden policy syntax
  for (const file of files) {
    const source = read(path.join('supabase', 'migrations', file));
    const dollars = (source.match(/\$\$/g) ?? []).length;
    if (dollars % 2 !== 0) fail(`UNBALANCED_DOLLAR_QUOTES:${file}`);
    if (/create\s+policy\s+if\s+not\s+exists/i.test(source)) fail(`UNSUPPORTED_POLICY_IF_NOT_EXISTS:${file}`);
  }
  ok('migration SQL static hygiene');

  const m53 = read('supabase/migrations/0053_android_runtime_foundation.sql');
  const m54 = read('supabase/migrations/0054_authoritative_progression_snapshot.sql');
  const m56 = read('supabase/migrations/0056_station_challenge_runtime_rpc.sql');
  const m72 = read('supabase/migrations/0072_challenge_presentation_fields.sql');
  const m73 = read('supabase/migrations/0073_p10_depth_answer_position_rebalance.sql');

  for (const [label, re, src] of [
    ['0053 runtime_resume_session', /create\s+or\s+replace\s+function\s+public\.runtime_resume_session/i, m53],
    ['0054 progression snapshot', /create\s+or\s+replace\s+function\s+public\.runtime_get_progression_snapshot/i, m54],
    ['0056 runtime_start_challenge', /create\s+or\s+replace\s+function\s+public\.runtime_start_challenge/i, m56],
    ['0056 runtime_submit_challenge_round', /create\s+or\s+replace\s+function\s+public\.runtime_submit_challenge_round/i, m56],
    ['0056 runtime_finish_challenge', /create\s+or\s+replace\s+function\s+public\.runtime_finish_challenge/i, m56],
    ['0072 challenge_run_view', /create\s+or\s+replace\s+function\s+public\.challenge_run_view/i, m72],
    ['0072 challenge_open_encounter', /create\s+or\s+replace\s+function\s+public\.challenge_open_encounter/i, m72],
  ]) {
    if (!re.test(src)) fail(`RPC_MISSING:${label}`);
  }
  ok('critical RPC definitions found in SQL');

  const updates73 = m73.split('\n').filter((l) => l.startsWith('update public.content_versions')).length;
  if (updates73 !== 216) fail(`0073_UPDATE_COUNT:${updates73}:expected=216`);
  else ok('0073 rebalance has 216 content_versions updates');
}

// --- 2. Packages / contracts ---
const contractFiles = [
  'packages/contracts/src/challenge-presentation.ts',
  'packages/challenge-runtime/src/service.ts',
  'packages/challenge-runtime/src/types.ts',
  'packages/learning-runtime/src/types.ts',
  'apps/mobile/src/station/runtimeApi.ts',
  'apps/mobile/src/station/SignatureChallengeView.tsx',
  'apps/mobile/src/station/StationFlow.tsx',
];
for (const rel of contractFiles) {
  if (!exists(rel)) fail(`MISSING_FILE:${rel}`);
}
ok('core package and mobile files present');

// challenge-presentation map ST01–ST25 via dynamic import when possible
try {
  const modPath = path.join(root, 'packages/contracts/src/challenge-presentation.ts');
  const mod = await import(pathToFileURL(modPath).href);
  let missing = 0;
  for (let n = 1; n <= 25; n += 1) {
    const code = `ST${String(n).padStart(2, '0')}`;
    if (typeof mod.hasStationChallenge === 'function') {
      if (!mod.hasStationChallenge(code)) missing += 1;
    } else if (mod.STATION_CHALLENGE_DEFINITION_IDS && !mod.STATION_CHALLENGE_DEFINITION_IDS[code]) {
      missing += 1;
    }
  }
  if (missing) fail(`CHALLENGE_MAP_INCOMPLETE:missing=${missing}`);
  else ok('challenge definition map covers ST01–ST25');

  const sample = mod.extractClientPresentation?.({
    presentation: { title: 't', options: ['a', 'b'], expectedAnswers: [0] },
  });
  if (sample && ('expectedAnswers' in sample || 'evaluator_config' in sample)) {
    fail('PRESENTATION_LEAKS_ANSWER_KEY');
  } else if (sample) {
    ok('extractClientPresentation does not leak answer keys');
  }
} catch (e) {
  // Fallback: string markers if TS import unsupported in this node mode
  const src = read('packages/contracts/src/challenge-presentation.ts');
  if (!src.includes('ST25') || !src.includes('extractClientPresentation')) {
    fail(`CONTRACT_IMPORT_OR_MARKERS:${e instanceof Error ? e.message : String(e)}`);
  } else {
    ok('challenge-presentation markers present (import fallback)');
  }
}

// --- 3. Mobile API surface markers (B0 boundary check) ---
const runtimeApi = read('apps/mobile/src/station/runtimeApi.ts');
for (const marker of [
  '/api/v1/',
  'startSignatureChallenge',
  'submitSignatureChallengeRound',
  'startStationSession',
  'createEncounter',
]) {
  if (!runtimeApi.includes(marker)) fail(`RUNTIME_API_MISSING_MARKER:${marker}`);
}
ok('mobile runtimeApi learning/challenge markers present');

const flow = read('apps/mobile/src/station/StationFlow.tsx');
if (!flow.includes('hasStationChallenge') || !flow.includes('SIGNATURE_CHALLENGE')) {
  fail('STATION_FLOW_CHALLENGE_ENTRY_MISSING');
} else {
  ok('StationFlow challenge-first entry wired');
}

// --- 4. Docs ---
if (!exists('docs/api/API_LEARNING_RUNTIME_CONTRACT.md')) fail('MISSING_API_LEARNING_CONTRACT');
else ok('learning runtime API contract doc present');

// --- Result ---
if (failures.length) {
  console.error('\nB0_FOUNDATION: BLOCKED');
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('\nB0_FOUNDATION: PASS');
console.log('Next human steps: apply migrations 0001–0073 on staging; smoke progression + challenge RPCs.');
process.exit(0);
