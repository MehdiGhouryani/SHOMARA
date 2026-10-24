#!/usr/bin/env node
/**
 * Phase A deep gate — grade experience profiles + mobile wiring markers.
 */
import { isWaived, waiverNote } from './lib/path-waivers.mjs';
import { isStationWaived, stationWaiverNote } from './lib/station-waivers.mjs';
import fs from 'node:fs';
import path from 'node:path';
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

const required = [
  'packages/contracts/src/grade-experience.ts',
  'packages/contracts/src/grade-experience.test.ts',
  'apps/mobile/src/state/useGradeExperience.ts',
  'apps/mobile/app/(tabs)/index.tsx',
  'apps/mobile/app/(tabs)/profile.tsx',
  'apps/mobile/src/ui/PracticeHubScreen.tsx',
  'apps/mobile/app/parent.tsx',
  'apps/mobile/app/station/[stationId]/start.tsx',
];
for (const rel of required) {
  if (!exists(rel)) fail(`MISSING:${rel}`);
}
ok('required Phase A files present');

const mod = await import(pathToFileURL(path.join(root, 'packages/contracts/src/grade-experience.ts')).href);
const violations = mod.gradeExperienceViolations();
if (violations.length) fail(`VIOLATIONS:${violations.join(',')}`);
else ok('gradeExperienceViolations empty');

if (mod.playableGradeIds().join(',') !== 'G1') fail('PLAYABLE_NOT_ONLY_G1');
else ok('only G1 playable');

if (mod.practiceListLimit('G1') !== 2) fail('EARLY_PRACTICE_LIMIT');
if (mod.pathNodeSize('G1') <= mod.pathNodeSize('G6')) fail('NODE_SIZE_ORDER');
if (!mod.shouldShowParentGuidance('G1')) fail('PARENT_GUIDANCE_G1');
if (mod.shouldShowParentGuidance('G6')) fail('PARENT_GUIDANCE_G6');
ok('derived helpers coherent');

const pathSrc = read('apps/mobile/app/(tabs)/index.tsx');
const pathRequired = isWaived('grade-experience-density') ? ['primaryContinueLabelFa'] : ['useGradeExperience', 'pathNodeSize', 'primaryContinueLabelFa', 'gradeSessionHint'];
if (isWaived('grade-experience-density')) console.log(waiverNote('grade-experience-density'));
for (const m of pathRequired) {
  if (!pathSrc.includes(m)) fail(`PATH_MISSING:${m}`);
}
ok('path wired');

const profileSrc = read('apps/mobile/app/(tabs)/profile.tsx');
if (!profileSrc.includes('sessionLengthHintFa') || !profileSrc.includes('ONBOARDING_GRADE_OPTIONS')) {
  fail('PROFILE_WIRING');
} else ok('profile wired');

const practiceSrc = read('apps/mobile/src/ui/PracticeHubScreen.tsx');
if (!practiceSrc.includes('practiceListLimit')) fail('PRACTICE_LIMIT');
else ok('practice list capped by band');

const parentSrc = read('apps/mobile/app/parent.tsx');
if (!parentSrc.includes('shouldShowParentGuidance')) fail('PARENT_GUIDANCE_UI');
else ok('parent guidance gated');

const startSrc = read('apps/mobile/app/station/[stationId]/start.tsx');
if (isStationWaived('station-start-session-hint')) {
  console.log(stationWaiverNote('station-start-session-hint'));
  if (!startSrc.includes('StageIntroView')) fail('STATION_START_NOT_V1');
  else ok('station start uses the approved stage page (session hint waived)');
} else if (!startSrc.includes('sessionLengthHintFa')) fail('STATION_START_HINT');
else ok('station start session hint');

const onboarding = read('packages/contracts/src/onboarding.ts');
if (!onboarding.includes('isGradeContentAvailable') || !onboarding.includes('playableGradeIds')) {
  fail('ONBOARDING_NOT_SINGLE_SOURCED');
} else ok('onboarding availability single-sourced');

if (failures.length) {
  console.error('\nPHASE_A_GRADE_EXPERIENCE: BLOCKED');
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('\nPHASE_A_GRADE_EXPERIENCE: PASS');
process.exit(0);
