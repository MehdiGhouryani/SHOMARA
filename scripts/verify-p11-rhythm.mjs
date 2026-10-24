#!/usr/bin/env node
import { isWaived, waiverNote } from './lib/path-waivers.mjs';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ok = (m) => console.log(`PASS  ${m}`);
const fail = (m) => {
  console.error(`FAIL  ${m}`);
  process.exitCode = 1;
};

for (const rel of [
  'packages/contracts/src/learning-rhythm.ts',
  'packages/contracts/src/learning-rhythm.test.ts',
  'apps/mobile/app/settings.tsx',
  'apps/mobile/app/(tabs)/index.tsx',
]) {
  if (!fs.existsSync(path.join(root, rel))) fail(`MISSING ${rel}`);
  else ok(`exists ${rel}`);
}

const contract = fs.readFileSync(path.join(root, 'packages/contracts/src/learning-rhythm.ts'), 'utf8');
for (const m of [
  'LEARNING_RHYTHM_VERSION',
  'MEANINGFUL_LEARNING_EVENT_TYPES',
  'NON_MEANINGFUL_EVENT_TYPES',
  'usesStreak: false',
  'penalizesMissedDays: false',
  'notificationIsLearningTruth: false',
  'RHYTHM_FORBIDDEN_COPY_FA',
]) {
  if (!contract.includes(m)) fail(`contract missing ${m}`);
  else ok(`contract ${m}`);
}

const settings = fs.readFileSync(path.join(root, 'apps/mobile/app/settings.tsx'), 'utf8');
if (!settings.includes('gentleReminders')) fail('settings must expose gentleReminders toggle');
else ok('settings gentleReminders');
if (!settings.includes('خاموش')) fail('settings must say user can turn reminder off');
else ok('settings disable copy');

const pathUi = fs.readFileSync(path.join(root, 'apps/mobile/app/(tabs)/index.tsx'), 'utf8');
if (isWaived('rhythm-card')) ok(waiverNote('rhythm-card'));
else {
  if (!pathUi.includes('buildLearningRhythmProjection')) fail('Path must show rhythm projection');
  else ok('Path rhythm');
  if (!pathUi.includes('آهنگ یادگیری')) fail('Path must label rhythm card');
  else ok('Path rhythm label');
}

const core = fs.readFileSync(path.join(root, 'apps/mobile/src/state/appStateCore.ts'), 'utf8');
if (!core.includes('gentleReminders')) fail('AppPreferences must include gentleReminders');
else ok('AppPreferences gentleReminders');

const roadmap = fs.readFileSync(path.join(root, 'ROADMAP_PHASES.md'), 'utf8');
if (!/P11 \| Learning Rhythm.*IMPLEMENTED|P11 \| Learning Rhythm.*IN_PROGRESS/.test(roadmap)) {
  fail('roadmap must mark P11 IN_PROGRESS or IMPLEMENTED');
} else ok('roadmap P11 status');
if (!roadmap.includes('VD-018')) fail('VD-018 required');
else ok('VD-018');

if (process.exitCode) {
  console.error('\nP11 static verification: FAIL');
  process.exit(1);
}
console.log('\nP11 static verification: PASS');
