// Static gate for Stage U6 (result page 11 and challenge intro page 12 on UI v1, ADR-0035).
// Behavior is proven by `npm run flow:station` (the full happy path through the mock learning server)
// and `npm run parity` (pixels against pages 11 and 12).
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

// Tokens measured from the pages' authored CSS and DOM.
const t = JSON.parse(read('packages/design-system/src/tokens.json')).ui;
const R = t.result;
check('tokens-result-from-page', R.disc === 260 && R.hero === 220 && R.heroBottom === 16 && R.bodyTop === 56 && R.titleSize === 36 && R.titleLine === 48 && R.barHeight === 12 && R.barGap === 6 && R.rowRadius === 20 && R.rowIcon === 48 && R.rowGlyph === 26);
check('tokens-result-colors-measured', R.confettiSky === '#9EC3DB' && R.rowShadow === '#C9BEF5' && R.rowLabel === '#4A3C99' && R.confetti.length === 6);
check('tokens-challenge-from-page', t.challenge.disc === 240 && t.challenge.hero === 230 && t.challenge.chipGap === 8);

// Views are pure and token-only, and no reward counters anywhere.
const views = ['StageResultView', 'ChallengeIntroView'].map((n) => [n, read(`apps/mobile/src/station/views/${n}.tsx`)]);
for (const [name, src] of views) {
  check(`view-pure:${name}`, !/expo-router|useAppState|expo-speech|runtimeApi|fetch\(|submitAttempt/.test(src));
  check(`view-tokens-only:${name}`, !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(src));
  check(`view-no-reward-counters:${name}`, !/ستاره|جان|streak|زنجیره|XP/.test(src), 'celebration without stars, lives or streaks');
}
for (const name of ['Confetti.tsx', 'AchievementRow.tsx']) {
  const src = read(`apps/mobile/src/ui/v1/${name}`);
  check(`component-tokens-only:${name}`, !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(src), 'colors only through tokens');
}

// Wiring: the celebration renders only when the station actually passed; other complete kinds keep the legacy card.
const flowSrc = read('apps/mobile/src/station/StationFlow.tsx');
check('wiring:celebration-gated-on-real-pass', flowSrc.includes("stage === 'COMPLETE' && stationPassAchieved") && flowSrc.includes('<StageResultView') && flowSrc.includes('pathAchievementTitle'));
check('wiring:legacy-complete-kept', flowSrc.includes('پیشرفت این جلسه ذخیره شد') && flowSrc.includes('sessionCompleteFeel(') && flowSrc.includes('<RewardReveal visible={stationPassAchieved} />'), 'unapproved complete kinds keep their current screen');
check('wiring:challenge-intro-then-player', flowSrc.includes("stage === 'SIGNATURE_CHALLENGE' && !challengeIntroDone") && flowSrc.includes('<ChallengeIntroView') && flowSrc.includes('setChallengeIntroDone(true)'));
check('wiring:challenge-card-not-under-player', flowSrc.includes("stage !== 'COMPLETE' && stage !== 'SIGNATURE_CHALLENGE'"), 'stale lesson content no longer renders under the challenge player');
check('wiring:chrome-has-challenge-fallback', read('apps/mobile/src/station/LessonPlayerChrome.tsx').includes("LESSON_STAGE_META[stage] ?? {"), 'SIGNATURE_CHALLENGE is outside the lesson stage contract and used to crash the header');

// Copy lives in strings.fa.ts, celebration copy matches the page.
const strings = read('apps/mobile/src/ui/strings.fa.ts');
check('strings:page-11', strings.includes("title: 'آفرین!'") && strings.includes('`مرحلهٔ «${stageTitle}» را کامل کردی.`') && strings.includes('دستاورد جدید'));
check('strings:page-12', strings.includes('چهار سؤال کوتاه. این بار بدون کمک.') && strings.includes('چالش آخر') && strings.includes('شروع چالش'));

// Parity specimens and thresholds.
const manifest = JSON.parse(read('apps/mobile/parity/manifest.json'));
for (const [id, page] of [['stage-result', '11'], ['challenge-intro', '12']]) {
  const e = manifest.find((x) => x.id === id);
  check(`parity:${id}`, Boolean(e) && e.page === page && e.maxDiffPercent <= 0.5 && exists(`docs/design-handoff-2026-10/pages-v1/goldens/${page}.png`));
}
check('flow:covers-full-path', read('scripts/flow-station-run.mjs').includes("open('play-pass')") && read('scripts/flow-station-run.mjs').includes('شمارش‌گر') && read('scripts/flow-station-run.mjs').includes('شروع چالش'));

if (failures.length) {
  for (const f of failures) console.error(`FAIL ${f}`);
  console.error(`VERIFY_UI_V1_RESULT: FAIL (${failures.length})`);
  process.exit(1);
}
console.log('VERIFY_UI_V1_RESULT: PASS');
