#!/usr/bin/env node
/**
 * Phase F — UX accessibility gate (static).
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
  'packages/contracts/src/ux-a11y.ts',
  'packages/design-system/src/tokens.json',
  'apps/mobile/src/ui/AppText.tsx',
  'apps/mobile/app/settings.tsx',
]) {
  if (!exists(rel)) fail(`MISSING:${rel}`);
}
ok('required files present');

const ux = read('packages/contracts/src/ux-a11y.ts');
for (const m of ['TOUCH_TARGET_MIN', 'TOUCH_TARGET_PRIMARY', 'scaledFontSize', 'ONE_PRIMARY_ACTION_SCREENS', 'uxA11yViolations']) {
  if (!ux.includes(m)) fail(`UX_MISSING:${m}`);
}
ok('ux-a11y contract');

const tokens = JSON.parse(read('packages/design-system/src/tokens.json'));
if ((tokens.size?.touchMin ?? 0) < 48) fail('TOUCH_MIN');
if ((tokens.size?.touchPrimary ?? 0) < 56) fail('TOUCH_PRIMARY');
ok('design tokens touch sizes');

const appText = read('apps/mobile/src/ui/AppText.tsx');
for (const m of ['scaledFontSize', 'largeText', 'writingDirection', 'rtl', 'textAlign']) {
  if (!appText.includes(m)) fail(`APPTEXT_MISSING:${m}`);
}
ok('AppText largeText + RTL');

const settings = read('apps/mobile/app/settings.tsx');
if (!settings.includes('متن بزرگ‌تر')) fail('SETTINGS_LARGE_TEXT');
if (!settings.includes('حرکت')) fail('SETTINGS_MOTION');
ok('settings a11y rows');

if (!read('packages/contracts/src/index.ts').includes('ux-a11y')) fail('INDEX_EXPORT');
else ok('contracts export ux-a11y');

// Spot-check one primary action surfaces still present
const pathUi = read('apps/mobile/app/(tabs)/index.tsx');
const practice = read('apps/mobile/src/ui/PracticeHubScreen.tsx');
// Stage U3: the primary action is the current node with its continue bubble (page 05), not a separate card.
const pathNodeUi = read('apps/mobile/src/path/PathNode.tsx');
if (!(pathUi.includes('goText=') && pathNodeUi.includes('GoBubble') && pathNodeUi.includes('onPress'))) fail('PATH_PRIMARY');
if (!practice.includes('openStation(recommended.stationId)')) fail('PRACTICE_PRIMARY');
ok('primary action surfaces present');

if (failures.length) {
  console.error('\nPHASE_F_UX_A11Y: BLOCKED');
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('\nPHASE_F_UX_A11Y: PASS');
process.exit(0);
