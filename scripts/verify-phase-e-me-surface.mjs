#!/usr/bin/env node
/**
 * Phase E — Me / Parent / Avatar presentation gate (static).
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
  'packages/contracts/src/me-surface.ts',
  'apps/mobile/app/(tabs)/profile.tsx',
  'apps/mobile/app/parent.tsx',
  'apps/mobile/app/avatar.tsx',
  'apps/mobile/app/settings.tsx',
]) {
  if (!exists(rel)) fail(`MISSING:${rel}`);
}
ok('required files present');

const me = read('packages/contracts/src/me-surface.ts');
for (const m of ['buildParentProgressSummary', 'profileActionDensity', 'reminderControlCopyFa', 'cosmeticLockedHintFa']) {
  if (!me.includes(m)) fail(`CONTRACT_MISSING:${m}`);
}
ok('me-surface contract markers');

const profile = read('apps/mobile/app/(tabs)/profile.tsx');
for (const m of ['profileActionDensity', 'G1_STATIONS', 'دستاورد واقعی', 'با پیشرفت مسیر']) {
  if (!profile.includes(m)) fail(`PROFILE_MISSING:${m}`);
}
ok('profile wired');

const parent = read('apps/mobile/app/parent.tsx');
for (const m of ['buildParentProgressSummary', 'approxMinutes', 'reminderControlCopyFa', 'زمان تقریبی']) {
  if (!parent.includes(m)) fail(`PARENT_MISSING:${m}`);
}
ok('parent summary wired');

const avatar = read('apps/mobile/app/avatar.tsx');
if (!avatar.includes('خریدنی نیست') && !read('packages/contracts/src/avatar-customization.ts').includes('خریدنی نیست')) {
  fail('AVATAR_NO_PURCHASE_COPY');
}
ok('avatar progress-not-purchase copy');

const settings = read('apps/mobile/app/settings.tsx');
if (!settings.includes('جریمه')) fail('SETTINGS_REMINDER');
ok('settings reminder copy');

if (!read('packages/contracts/src/index.ts').includes('me-surface')) fail('INDEX_EXPORT');
else ok('contracts export me-surface');

if (failures.length) {
  console.error('\nPHASE_E_ME_SURFACE: BLOCKED');
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('\nPHASE_E_ME_SURFACE: PASS');
process.exit(0);
