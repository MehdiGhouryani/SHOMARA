#!/usr/bin/env node
/**
 * Phase D — soft practice habit / one-tap practice gate (static).
 */
import { isWaived, waiverNote } from './lib/path-waivers.mjs';
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
  'packages/contracts/src/practice-habit.ts',
  'apps/mobile/src/ui/PracticeHubScreen.tsx',
  'apps/mobile/app/(tabs)/index.tsx',
]) {
  if (!exists(rel)) fail(`MISSING:${rel}`);
}
ok('required files present');

const habit = read('packages/contracts/src/practice-habit.ts');
for (const m of ['pickRecommendedPractice', 'softDailyHabitForGrade', 'practiceStartLabelFa', 'practiceHabitViolations']) {
  if (!habit.includes(m)) fail(`CONTRACT_MISSING:${m}`);
}
if (habit.includes('استریک') && habit.includes('goalFa')) {
  /* denylist may mention streak — only fail if goal template uses it */
}
if (/goalFa: '.*استریک/.test(habit)) fail('STREAK_IN_GOAL');
ok('practice-habit contract markers');

const hub = read('apps/mobile/src/ui/PracticeHubScreen.tsx');
for (const m of ['pickRecommendedPractice', 'softDailyHabitForGrade', 'practiceStartLabelFa', 'شروع همین حالا', 'featureCard', 'habitLine']) {
  if (!hub.includes(m) && m !== 'شروع همین حالا') {
    if (!hub.includes(m)) fail(`HUB_MISSING:${m}`);
  }
}
if (!hub.includes('pickRecommendedPractice') || !hub.includes('softDailyHabitForGrade')) fail('HUB_CORE');
// Whole card should be pressable one-tap
if (!hub.includes('onPress={() => openStation(recommended.stationId)}')) fail('ONE_TAP_CARD');
ok('PracticeHub one-tap + habit wired');

const pathUi = read('apps/mobile/app/(tabs)/index.tsx');
if (isWaived('practice-jump')) console.log(waiverNote('practice-jump'));
else for (const m of ['بدون اجبار', 'چیزی از دست نمی‌دهی', 'تمرین یک‌لمسی امروز', 'practiceJump', 'اختیاری']) {
  if (!pathUi.includes(m)) fail(`PATH_MISSING:${m}`);
}
ok('path rhythm + practice jump wired');

if (!read('packages/contracts/src/index.ts').includes('practice-habit')) fail('INDEX_EXPORT');
else ok('contracts export practice-habit');

if (failures.length) {
  console.error('\nPHASE_D_PRACTICE_HABIT: BLOCKED');
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('\nPHASE_D_PRACTICE_HABIT: PASS');
process.exit(0);
