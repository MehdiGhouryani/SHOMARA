// Static gate for Stage U4 (station start page 06 and first lesson section page 07 on UI v1, ADR-0035).
// Behavior is proven by `npm run flow:station` (real screens in a browser) and `npm run parity` (pixels).
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

// Tokens measured from the DOM of pages 06 and 07.
const t = JSON.parse(read('packages/design-system/src/tokens.json')).ui;
check('tokens-intro-from-page', t.intro.disc === 240 && t.intro.hero === 220 && t.intro.barHeight === 10 && t.intro.barMaxWidth === 260 && t.intro.topSpacer === 48);
check('tokens-lesson-from-page', t.lesson.trayGap === 20 && t.lesson.trayPadTop === 32 && t.lesson.trayPadBottom === 24 && t.lesson.bodyGap === 24 && t.lesson.captionSize === 16);
check('tokens-bead-from-page', t.bead.size === 56 && t.bead.edge === 5 && t.bead.highlightHeight === 2 && t.bead.labelGap === 8);

// Views are pure: no navigation, state, network or audio, and no raw colors or hex values.
const views = ['StageIntroView', 'TeachView', 'LessonChrome'].map((n) => [n, read(`apps/mobile/src/station/views/${n}.tsx`)]);
for (const [name, src] of views) {
  check(`view-pure:${name}`, !/expo-router|useAppState|expo-speech|runtimeApi|fetch\(/.test(src));
  check(`view-tokens-only:${name}`, !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(src));
  check(`view-no-reward-counters:${name}`, !/ستاره|جان|streak|زنجیره/.test(src), 'no stars, lives or streak');
}
const bead = read('apps/mobile/src/ui/v1/Bead.tsx');
check('bead-tokens-only', !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(bead) && bead.includes('UI.bead.size') && bead.includes('UI.gradient.bead'));

// Containers keep their logic and render the approved views.
const start = read('apps/mobile/app/station/[stationId]/start.tsx');
check('start-renders-StageIntroView', start.includes('<StageIntroView') && start.includes('MobileContentManager') && start.includes('/station/${station.id}/play'));
check('start-keeps-prepare-flow', start.includes('downloadPackage') && start.includes('getCacheEntries'));
const flowSrc = read('apps/mobile/src/station/StationFlow.tsx');
check('lesson-learn-renders-TeachView', flowSrc.includes("stage === 'LEARN'") && flowSrc.includes('<TeachView') && flowSrc.includes('macroFilled(') && flowSrc.includes('macroLabel('));
check('lesson-continue-keeps-guided-step', flowSrc.includes("beginEncounter(getLocalContent('guided'), 'GUIDED')"));
check('lesson-exit-stays-confirmed', flowSrc.includes('onClose={confirmExit}'));
check('lesson-stops-speech-on-leave', flowSrc.includes('useEffect(() => stopSpeaking, [])') && flowSrc.includes('stopSpeaking();'));

// Audio: Persian speech through one adapter; reading stays possible when no engine exists.
const speech = read('apps/mobile/src/station/speech.ts');
check('speech-adapter', speech.includes("from 'expo-speech'") && speech.includes("'fa-IR'") && /try\s*{[\s\S]*Speech\.speak/.test(speech) && speech.includes('catch'));
check('speech-not-autoplayed', !/speakFa\(/.test(read('apps/mobile/src/station/views/TeachView.tsx')) && !/useEffect\([^)]*speakFa/.test(flowSrc), 'hear-again is a button; nothing plays on its own (U-Q18)');

// Visual parity.
const manifest = JSON.parse(read('apps/mobile/parity/manifest.json'));
const golden = (p) => exists(`docs/design-handoff-2026-10/pages-v1/goldens/${p}.png`);
const intro = manifest.find((x) => x.id === 'stage-intro');
check('parity:stage-intro', Boolean(intro) && intro.page === '06-fix' && intro.maxDiffPercent <= 0.5 && golden('06-fix') && golden('06'), 'compared with the page with only its flex bug neutralised (U-Q14)');
const lesson = manifest.find((x) => x.id === 'lesson');
check('parity:lesson', Boolean(lesson) && lesson.page === '07' && lesson.maxDiffPercent <= 0.5 && golden('07'));
check('parity:tray-07', manifest.some((x) => x.id === 'tray-07' && x.page === '07' && x.maxDiffPercent <= 0.15));
const goldensScript = read('scripts/parity-goldens.mjs');
check('golden-06-fix-only-neutralises-flex', goldensScript.includes(".body > .bar{flex:none!important}") && goldensScript.includes("'06-fix'"));

// Waived station-start features: the list is pinned, and the domain code behind each still exists.
const { STATION_UI_WAIVERS } = await import('./lib/station-waivers.mjs');
check('waivers-pinned', STATION_UI_WAIVERS.map((w) => w.id).join() === 'station-start-session-hint', STATION_UI_WAIVERS.map((w) => w.id).join(', '));
check('waivers-have-restore-plan', STATION_UI_WAIVERS.every((w) => w.verifier && w.stillVerified && w.restoreIn && exists(`scripts/${w.verifier}`) && read(`scripts/${w.verifier}`).includes('station-waivers.mjs')));
const contractsSrc = fs.readdirSync(path.join(ROOT, 'packages/contracts/src')).map((f) => (f.endsWith('.ts') ? read(`packages/contracts/src/${f}`) : '')).join('\n');
check('waived-domain:session-hint', /export function sessionLengthHintFa/.test(contractsSrc));

// Scripts are wired.
const pkg = JSON.parse(read('package.json'));
check('scripts-wired', pkg.scripts['flow:station'] === 'node scripts/flow-station-run.mjs' && exists('scripts/flow-station-run.mjs'));

if (failures.length) {
  for (const f of failures) console.error(`FAIL ${f}`);
  console.error(`VERIFY_UI_V1_STATION: FAIL (${failures.length})`);
  process.exit(1);
}
console.log('VERIFY_UI_V1_STATION: PASS');
