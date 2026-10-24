// Static gate for Stage U3 (path tab on UI v1, ADR-0035). Behavior is proven by `npm run flow:path`
// (real screen in a browser) and `npm run parity` (pixels, including four scroll positions).
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

// Tokens measured from the approved page (its CSS is content-box in places).
const t = JSON.parse(read('packages/design-system/src/tokens.json')).ui;
const P = t.path;
check('tokens-chapter-themes', Array.isArray(t.chapter) && t.chapter.length === 5 && ['p', 'pe', 'hi', 'pc', 'pm', 'tint', 'lk', 'lke', 'lki'].every((k) => t.chapter.every((c) => c[k])));
check('tokens-no-duplicate-theme-array', t.chapters === undefined);
check('tokens-layout-from-page', P.rowHeight === 132 && P.currentRowHeight === 208 && P.dividerHeight === 88 && P.topSpacer === 20 && P.bottomSpacer === 48);
check('tokens-node-from-page', P.node.size === 76 && P.node.edge === 8 && P.node.press === 6);
check('tokens-measured-content-box', P.stats.height === 62 && P.grade.height === 44 && P.mate.size === 94, 'stats 62, grade chip 44, guide portrait 94');
check('tokens-tab-outlined-measured', P.tabOutlined.width === 68 && P.tabOutlined.height === 44 && P.tabOutlined.barHeight === 106 && P.tabOutlined.border === 2);

// Screen structure.
const screen = read('apps/mobile/app/(tabs)/index.tsx');
check('screen-renders-PathView', screen.includes('<PathView') && screen.includes("from '../../src/path/PathView'"));
check('screen-uses-path-model', screen.includes('buildChapterViews') && screen.includes('jumpOfferUnitIds') && screen.includes('gradeChipLabel'));
check('screen-without-removed-cards', !/getMissionHub|buildLearningRhythmProjection|dailyGoal/.test(screen), 'missions, rhythm and practice shortcut are not in the approved page');
check('screen-keeps-navigation-logic', screen.includes('/station/${stationId}/play') && screen.includes('/station/${stationId}/start') && screen.includes('/jump?targetStationId='));
check('screen-locked-notice', screen.includes('ایستگاه‌های قبل را جلو ببر.'));
check('screen-content-states', screen.includes("'offline'") && screen.includes('PathBanner'));

// Tabs use the approved tab bar.
check('tabs-use-ChildTabBar', read('apps/mobile/app/(tabs)/_layout.tsx').includes('ChildTabBar') && read('apps/mobile/src/navigation/ChildTabBar.tsx').includes('<TabBar'));
const tabBar = read('apps/mobile/src/ui/v1/TabBar.tsx');
check('tabbar-variants', /'soft'/.test(tabBar) && /'outlined'/.test(tabBar) && tabBar.includes('barHeight'));

// Rendering rules.
check('node-icon-above-face', /<View pointerEvents="none">\s*\n?\s*<Icon/.test(read('apps/mobile/src/path/PathNode.tsx')), 'a bare web <svg> is static and would paint under the absolute face');
check('notice-bubble-wide', read('apps/mobile/src/path/PathNode.tsx').includes('floating={false} wide'));
check('connectors-no-undefined-dash', read('apps/mobile/src/path/PathView.tsx').includes('dashProps('));
check('band-uses-world-title', read('apps/mobile/src/path/pathModel.ts').includes('worldByUnitId('));

// Geometry is checked against the design page's own algorithm.
check('geometry-fixture-and-generator', exists('apps/mobile/src/path/__fixtures__/design-trail.json') && exists('scripts/gen-path-fixture.mjs'));
check('layout-tests-exist', exists('apps/mobile/src/path/layout.test.ts') && exists('apps/mobile/src/path/pathModel.test.ts'));

// Visual parity: page 05 at the top and at four scroll positions, plus the outlined tab bar.
const manifest = JSON.parse(read('apps/mobile/parity/manifest.json'));
for (const id of ['path', 'path-s900', 'path-s1800', 'path-s2700', 'path-s3600']) {
  const s = manifest.find((x) => x.id === id);
  check(`parity:${id}`, Boolean(s) && s.page === '05' && s.maxDiffPercent <= 1.0 && exists(`docs/design-handoff-2026-10/pages-v1/goldens/${s.golden ?? s.page}.png`));
}
check('parity:path-strict', manifest.find((x) => x.id === 'path').maxDiffPercent <= 0.3);
check('parity:tabbar-05', manifest.some((x) => x.id === 'tabbar-05' && x.page === '05'));

// Waived Path-tab features: the list is pinned here, and the domain code behind each must still exist.
const { PATH_UI_WAIVERS } = await import('./lib/path-waivers.mjs');
check('waivers-pinned', PATH_UI_WAIVERS.map((w) => w.id).sort().join() === ['grade-experience-density', 'mission-hub-entry', 'now-card', 'practice-jump', 'rhythm-card'].join(), PATH_UI_WAIVERS.map((w) => w.id).join(', '));
check('waivers-have-restore-plan', PATH_UI_WAIVERS.every((w) => w.verifier && w.stillVerified && w.restoreIn && exists(`scripts/${w.verifier}`) && read(`scripts/${w.verifier}`).includes('path-waivers.mjs')));
check('waived-domain:missions-route', exists('apps/mobile/app/missions.tsx'));
check('waived-domain:rhythm-logic', /export function buildLearningRhythmProjection/.test(fs.readdirSync(path.join(ROOT, 'packages/contracts/src')).map((f) => (f.endsWith('.ts') ? read(`packages/contracts/src/${f}`) : '')).join('\n')));
check('waived-domain:grade-experience', exists('packages/contracts/src/grade-experience.ts') && exists('apps/mobile/src/state/useGradeExperience.ts'));
check('waived-domain:practice-hub', exists('apps/mobile/src/ui/PracticeHubScreen.tsx'));
check('node-hints-from-contract', read('apps/mobile/src/path/pathModel.ts').includes('PATH_NODE_STATUS_HINT[status]') && read('apps/mobile/src/path/PathNode.tsx').includes('accessibilityHint'));

// Scripts are wired.
const pkg = JSON.parse(read('package.json'));
check('scripts-wired', pkg.scripts['flow:path'] === 'node scripts/flow-path-run.mjs');

if (failures.length) {
  console.error(`FAIL ${failures.length} check(s):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('UI_V1_PATH: PASS');
