import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const failures=[];
const check=(name, ok, detail='')=>{ if(ok) console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`); else failures.push(`${name}${detail ? ` — ${detail}` : ''}`); };

const nav=read('packages/contracts/src/navigation.ts');
const surface=read('packages/contracts/src/product-surface.ts');
const path2=read('packages/contracts/src/path2.ts');
const progression=read('packages/contracts/src/progression.ts');
const jump=read('packages/contracts/src/jump.ts');
const jumpBank=read('apps/web/lib/jump-assessment-bank.ts');
const jumpApi=read('apps/web/app/api/v1/progression/jump/route.ts');
const jumpWeb=read('apps/web/components/JumpAssessmentView.tsx');
const pathWeb=read('apps/web/components/DuolingoPath.tsx');
const pathMobile=read('apps/mobile/app/(tabs)/index.tsx');
// Stage U3: the path logic moved out of the screen into src/path (page geometry and the status-to-node model).
const pathLayoutMobile=read('apps/mobile/src/path/layout.ts');
const pathModelMobile=read('apps/mobile/src/path/pathModel.ts');
const auth=read('apps/web/components/AuthFlowScreen.tsx');
const profileContract=read('packages/contracts/src/profile.ts');
const profileWeb=read('apps/web/components/ProfileView.tsx');
const profileMobile=read('apps/mobile/app/(tabs)/profile.tsx');
const mobileStack=read('apps/mobile/app/_layout.tsx');
const tokens=JSON.parse(read('packages/design-system/src/tokens.json'));

check('child-primary-nav-three', (nav.match(/id: '(PATH|PRACTICE|PROFILE)'/g) ?? []).length===3);
check('continuous-25-stations', (progression.match(/station\('ST\d{2}'/g) ?? []).length===25);
check('five-units', (progression.match(/id: 'G1-U0\d'/g) ?? []).length===5);
check('continuous-alternation-web', pathWeb.includes('globalIndex') && pathWeb.includes('globalIndex % 2 === 0'));
// One counter runs through every chapter, so the sway never restarts at a unit boundary.
check('continuous-alternation-mobile', /let g = 0;/.test(pathLayoutMobile) && /Math\.sin\(g \*/.test(pathLayoutMobile) && /g \+= 1;/.test(pathLayoutMobile));
check('path-node-kind-contract', path2.includes('PATH_NODE_KIND_BY_STATION') && (path2.match(/ST\d{2}: '\w+'/g) ?? []).length === 25 && pathWeb.includes('node.visualKind'));
check('no-web-central-spine', !pathWeb.includes('pathRow::after') && !pathWeb.includes('.rowRight::after'));
check('all-stations-route-to-play', read('apps/web/app/station/[stationId]/play/page.tsx').includes('G1_STATIONS.find') && read('apps/mobile/app/station/[stationId]/start.tsx').includes('G1_STATIONS.find'));
check('station-start-no-delivery-jargon', !read('apps/web/components/StationStartView.tsx').includes('checksum') && !read('apps/web/components/StationStartView.tsx').includes('packageId'));

check('unit-checkpoints', progression.includes('G1_PATH_CHECKPOINTS'));
check('jump-five-question-contract', jump.includes('JUMP_QUESTION_COUNT = 5'));
check('jump-server-validation', jumpApi.includes('evaluateJumpAssessment') && jumpBank.includes('JUMP-U02') && jumpBank.includes('answers'));
check('answer-key-not-shared', jump.includes('correct') === false && jumpWeb.includes('/api/v1/progression/jump'));
check('jump-four-of-five', jumpBank.includes('correctCount / assessment.questions.length >= 0.8') && jump.includes('JUMP_PASS_THRESHOLD = 0.8'));
check('jump-at-unit-boundary', pathWeb.includes('completed.includes(G1_UNITS[unitIndex - 1]') && pathModelMobile.includes('completed.has(previousEnd)'));
check('jump-does-not-repeat-after-unlock', pathWeb.includes('!jumpUnlockedStationIds.includes(firstUnitStation.id)') && pathModelMobile.includes('!isJumpUnlocked(target)'));
check('jump-revisit-skipped-stations', progression.includes('Skipped earlier stations') || path2.includes('allowRevisitSkippedStations'));
check('compact-station-header', surface.includes('supportingCopy: null') && surface.includes('hideLongSubtitleInHeader: true') && surface.includes("eyebrow: 'ایستگاه {number}'"));
check('login-no-technical-ids', !auth.includes('<p className={styles.eyebrow}>S0') && !auth.includes('provider، غیرفعال است'));
check('login-no-disabled-google-card', !auth.includes('methodDisabled') || !auth.includes('ورود با Google'));
check('settings-web', exists('apps/web/app/settings/page.tsx'));
check('settings-mobile', exists('apps/mobile/app/settings.tsx') && mobileStack.includes('name="settings"'));
check('profile-settings-action', profileContract.includes("id: 'SETTINGS'") && profileWeb.includes("'/settings'") && profileMobile.includes("'/settings'"));
check('teacher-not-in-child-shell', surface.includes("'TEACHER_LOGIN'") && surface.includes("'TEACHER_PORTAL'") && !nav.includes('TEACHER'));
check('no-primary-reward-currency', !(/\bXP\b|\bgems?\b|leaderboard|جواهر|رتبه‌بندی/i).test(pathWeb+pathMobile+profileWeb+profileMobile+read('apps/web/components/PracticeHubView.tsx')));
check('palette-canonical', tokens.color.brand.primary==='#2B5C7A' && tokens.color.bg.canvas==='#F5F7F8' && tokens.color.text.primary==='#1B2A36' /* canonical palette per ADR-0035 */);
check('required-contracts-in-repo', exists('docs/reference/PATH_2_CONTRACT.md') && exists('docs/reference/PATH_2_1_VISUAL_RULES.md'));
check('path2-contract-exported', read('packages/contracts/src/index.ts').includes("export * from './path2';"));

if(failures.length){ console.error(`\nFAIL ${failures.length} checks`); failures.forEach(f=>console.error(` - ${f}`)); process.exit(1); }
console.log('\nUX-P08.5 verifier: PASS');
