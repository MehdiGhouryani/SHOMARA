// Static gate for Stage U7 (practice page 13 and me page 14 on UI v1, ADR-0035).
// Behavior is proven by `npm run flow:tabs` (real tabs in a browser) and `npm run parity`.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`);
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

const t = JSON.parse(read('packages/design-system/src/tokens.json')).ui;
check('tokens-from-pages', t.practice.bodyTop === 32 && t.practice.listGap === 12 && t.practice.listTop === 8 && t.me.avatar === 112 && t.me.avatarIcon === 64 && t.me.cardRadius === 28 && t.me.cardPadY === 24 && t.me.capSize === 16);

for (const [name, file] of [['PracticeView', 'apps/mobile/src/practice/views/PracticeView.tsx'], ['MeView', 'apps/mobile/src/profile/views/MeView.tsx'], ['ListRow', 'apps/mobile/src/ui/v1/ListRow.tsx']]) {
  const src = read(file);
  check(`pure:${name}`, !/expo-router|useAppState|runtimeApi|fetch\(/.test(src));
  check(`tokens-only:${name}`, !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(src));
  check(`no-reward-counters:${name}`, !/ستاره|جان|streak|زنجیره|\bXP\b/.test(src));
}

const hub = read('apps/mobile/src/ui/PracticeHubScreen.tsx');
// practiceListLimit moved into the pure helper src/practice/rows.ts (review R-3 unit-testable composition);
// the wiring check requires the hub to consume that helper and the helper to use the contract limit.
const practiceRows = read('apps/mobile/src/practice/rows.ts');
check('practice:wiring-kept', ['pickRecommendedPractice', 'softDailyHabitForGrade', 'practiceStartLabelFa', 'canOpenPracticeStation', "openStation(recommended.stationId)", '/station/${stationId}/', "from '../practice/rows'"].every((m) => hub.includes(m)) && hub.includes('<PracticeView') && practiceRows.includes('practiceListLimit'));
const profile = read('apps/mobile/app/(tabs)/profile.tsx');
check('me:wiring-kept', ['CHILD_ACHIEVEMENTS.map', 'isAchievementUnlocked', 'G1_STATIONS', 'accessibilityViewIsModal', 'sessionLengthHintFa', 'ONBOARDING_GRADE_OPTIONS', 'profileActionDensity'].every((m) => profile.includes(m)) && profile.includes('<MeView'));
check('me:contract-actions-kept', profile.includes("router.push('/avatar')") && profile.includes("router.push('/parent')") && profile.includes("router.push('/settings')"), 'avatar/parent/settings entries stay reachable (profile contract Actions)');

const strings = read('apps/mobile/src/ui/strings.fa.ts');
check('strings:pages-13-14', strings.includes('بیا مهارتت را قوی کنیم.') && strings.includes('بعد از مرحلهٔ') && strings.includes('ایستگاه') && strings.includes('دستاوردها'));

const manifest = JSON.parse(read('apps/mobile/parity/manifest.json'));
const { isTabsWaived, tabsWaiverNote } = await import('./lib/tabs-waivers.mjs');
if (isTabsWaived('tabbar-outlined-vs-soft-goldens')) console.log(tabsWaiverNote('tabbar-outlined-vs-soft-goldens'));
for (const [id, page] of [['practice', '13'], ['me', '14']]) {
  const e = manifest.find((x) => x.id === id);
  check(`parity:${id}`, Boolean(e) && e.page === page && e.selector === '.body' && e.maxDiffPercent <= 0.5 && exists(`docs/design-handoff-2026-10/pages-v1/goldens/${page}.png`), 'body region only; the tab bar is the outlined one app-wide (D-011)');
}

const { TABS_UI_WAIVERS } = await import('./lib/tabs-waivers.mjs');
check('waivers-pinned', TABS_UI_WAIVERS.map((w) => w.id).join() === 'practice-habit-card,practice-touch-tokens,practice-see-path,profile-counter-copy,profile-action-subtitle,tabbar-outlined-vs-soft-goldens');
check('waivers-have-restore-plan', TABS_UI_WAIVERS.every((w) => w.verifier && w.stillVerified && w.restoreIn && exists(`scripts/${w.verifier}`) && read(`scripts/${w.verifier}`).includes('tabs-waivers.mjs')));

const pkg = JSON.parse(read('package.json'));
check('flow-wired', pkg.scripts['flow:tabs'] === 'node scripts/flow-tabs-run.mjs' && read('scripts/flow-tabs-run.mjs').includes("open('tabs-practice')"));

if (failures.length) {
  for (const f of failures) console.error(`FAIL ${f}`);
  console.error(`VERIFY_UI_V1_TABS: FAIL (${failures.length})`);
  process.exit(1);
}
console.log('VERIFY_UI_V1_TABS: PASS');
