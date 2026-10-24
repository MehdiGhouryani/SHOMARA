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

const nav = read('packages/contracts/src/navigation.ts');
const product = read('packages/contracts/src/product-surface.ts');
const practice = read('packages/contracts/src/practice.ts');

check('primary-nav-three', (nav.match(/id: '(PATH|PRACTICE|PROFILE)'/g) ?? []).length === 3);
check('profile-owns-achievements', /id: 'PROFILE'/.test(nav) && /S17/.test(nav) && /S18/.test(nav));
check('practice-one-surface', /export type PracticeSectionId = 'GAMES';/.test(practice) && !/SKILLS.*CONCEPT/.test(practice));
check('station-names', ['شمارش و الگو','جایگاه و جهت','عدد و جمع','شکل‌ها و ویژگی‌ها','جمع و تفریق'].every((x) => product.includes(`title: '${x}'`)));
check('station-header-rule', /maxTitleWords: 5/.test(product) && /supportingCopy: null/.test(product));
check('removed-surfaces-contract', ['TEACHER_LOGIN','TEACHER_PORTAL','LEADERBOARD','ASSIGNMENTS','FRIENDS_FEED','ANIMATION_LAB'].every((x) => product.includes(`'${x}'`)));
check('deferred-surfaces-explicit', ['SKILLS_LIBRARY','CONCEPT_REVIEW','AVATAR_WORKSHOP'].every((x) => product.includes(`'${x}'`)));
check('teacher-page-removed', !exists('apps/web/app/teacher/page.tsx'));
check('teacher-demo-ui-removed', !exists('apps/web/components/AdultsView.tsx'));
check('backpack-ui-removed', !exists('apps/web/components/BackpackView.tsx'));
check('leaderboard-ui-removed', !exists('apps/web/components/LeaderboardView.tsx'));
check('legacy-wardrobe-removed', !exists('apps/web/components/WardrobeView.tsx'));
check('treasure-primary-route-removed', !exists('apps/web/components/TreasureView.tsx') && !exists('apps/mobile/app/(tabs)/treasure.tsx'));
check('legacy-skills-tab-removed', !exists('apps/mobile/app/(tabs)/skills.tsx'));
check('db-label-migration-present', exists('supabase/migrations/0049_child_product_surface_labels.sql'));
check('surface-reference-present', exists('docs/reference/CHILD_PRODUCT_SURFACE.md'));

const webPractice = read('apps/web/components/PracticeHubView.tsx');
const mobilePractice = read('apps/mobile/src/ui/PracticeHubScreen.tsx');
const webProfile = read('apps/web/components/ProfileView.tsx');
const mobileProfile = read('apps/mobile/app/(tabs)/profile.tsx');
const pathWeb = read('apps/web/components/DuolingoPath.tsx');
const pathMobile = read('apps/mobile/app/(tabs)/index.tsx');
const stationStartWeb = read('apps/web/app/station/[stationId]/start/page.tsx');
const unitWeb = read('apps/web/app/unit/[unitId]/page.tsx');
const webNav = read('apps/web/components/ChildBottomNav.tsx');
const mobileNav = read('apps/mobile/app/(tabs)/_layout.tsx');
const topBar = read('apps/web/components/ChildTopBar.tsx');

check('practice-no-secondary-tabs', !webPractice.includes('sectionNav') && !mobilePractice.includes('tablist'));
check('practice-no-path-duplicate', webPractice.includes('دیدن مسیر') && mobilePractice.includes('دیدن مسیر'));
check('profile-no-friends-or-dev-surfaces', !/دوستان|companion|assignments|animation/.test(webProfile + mobileProfile));
check('profile-holds-all-achievements', webProfile.includes('CHILD_ACHIEVEMENTS.map') && mobileProfile.includes('CHILD_ACHIEVEMENTS.map'));
check('profile-no-unimplemented-avatar-entry', !/ظاهر فعلی|ویرایش ظاهر|avatar workshop|کارگاه آواتار/i.test(webProfile + mobileProfile));
check('path-no-companion-chrome', !/CharacterArt|CompanionBust|companionId/.test(pathWeb) && !/CharacterAvatar|CharacterSays/.test(pathMobile));
check('station-header-clean', !stationStartWeb.includes('آماده‌ای شروع کنی؟') && stationStartWeb.includes('{station.title}'));
check('unit-title-short', unitWeb.includes('G1_UNITS.find') && unitWeb.includes('{unit.title}') && !unitWeb.includes('خانه و صبحانه خانوادگی'));
check('web-nav-three-tabs', webNav.includes('gridTemplateColumns: `repeat(${CHILD_PRIMARY_NAV.length},') && !webNav.includes('TREASURE'));
check('mobile-nav-three-tabs', mobileNav.includes("name=\"index\"") && mobileNav.includes("name=\"practice\"") && mobileNav.includes("name=\"profile\"") && !mobileNav.includes('name="treasure"'));
check('topbar-no-persistent-metrics', !topBar.includes('stars') && !topBar.includes('ستاره'));
const activeRewardSurfaces = [
  webProfile,
  mobileProfile,
  pathWeb,
  pathMobile,
  webPractice,
  mobilePractice,
  read('apps/web/components/DuolingoLessonModal.tsx'),
  read('apps/mobile/src/ui/strings.fa.ts'),
];
check('no-reward-currency-ui', !activeRewardSurfaces.join('\n').match(/ستاره دانایی|ستاره(?:ٔ|‌)? تازه|کوله‌پشتی|صندوق گنجینه|ستاره‌های دانایی|\bXP\b|\bgems?\b|جواهر|\bleague\b|leaderboard/i));
check('product-surface-version', product.includes('PRODUCT_SURFACE_VERSION'));

if (failures.length) {
  console.error(`\nFAIL ${failures.length} checks`);
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}
console.log(`\nUX-P07.5 cleanup verifier: PASS`);
