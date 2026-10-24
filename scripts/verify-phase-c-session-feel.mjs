#!/usr/bin/env node
/**
 * Phase C — session feel gate (static; TS imports resolved by app bundler).
 */
import fs from 'node:fs';
import path from 'node:path';

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

for (const rel of [
  'packages/contracts/src/session-feel.ts',
  'packages/contracts/src/session-feel.test.ts',
  'apps/mobile/src/station/StationFlow.tsx',
  'apps/mobile/src/ui/strings.fa.ts',
]) {
  if (!exists(rel)) fail(`MISSING:${rel}`);
}
ok('required files present');

const feel = read('packages/contracts/src/session-feel.ts');
for (const m of [
  'sessionAttemptFeel',
  'sessionCompleteFeel',
  'scaleFeedbackDurationMs',
  'sessionFeelViolations',
  'STATION_PASSED',
  'CHALLENGE_DONE',
  'TRY_AGAIN',
]) {
  if (!feel.includes(m)) fail(`CONTRACT_MISSING:${m}`);
}
if (!feel.includes('اشکالی ندارد') && !feel.includes('نزدیک بودی')) fail('MISSING_WARM_RETRY_COPY');
// User-facing copy branches must not use shame; allow the words only inside the violations denylist array.
const copyOnly = feel.replace(/for \(const bad of \[[^\]]+\]/, 'for (const bad of []');
if (copyOnly.includes('باختی') || copyOnly.includes('شکست خوردی')) fail('SHAME_COPY_IN_CONTRACT');
ok('session-feel contract markers');

const flow = read('apps/mobile/src/station/StationFlow.tsx');
for (const m of [
  'sessionAttemptFeel',
  'sessionCompleteFeel',
  'completeFeel',
  'attemptFeel',
  'setCompleteKind',
  'پیشرفت این جلسه ذخیره شد',
  'CHALLENGE_DONE',
  'STATION_PASSED',
]) {
  if (!flow.includes(m)) fail(`FLOW_MISSING:${m}`);
}
ok('StationFlow session-feel wired');

const strings = read('apps/mobile/src/ui/strings.fa.ts');
if (!strings.includes('برگرد به مسیر')) fail('STRINGS_BACK_HOME');
if (!strings.includes('اشکالی ندارد')) fail('STRINGS_RETRY');
ok('fallback strings present');

if (!read('packages/contracts/src/index.ts').includes('session-feel')) fail('INDEX_EXPORT');
else ok('contracts export session-feel');

if (failures.length) {
  console.error('\nPHASE_C_SESSION_FEEL: BLOCKED');
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('\nPHASE_C_SESSION_FEEL: PASS');
process.exit(0);
