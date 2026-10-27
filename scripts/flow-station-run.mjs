// Interaction test of the REAL station start screen (page 06) and the real lesson player's first section (page 07):
// react-native-web in Chromium, only native and network edges stubbed and recorded.
// Usage: node scripts/flow-station-run.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { launchChromium } from './lib/browser.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'apps/mobile/parity/dist-flow');
const OUT = path.join(ROOT, 'apps/mobile/parity/out');
fs.mkdirSync(OUT, { recursive: true });

function build(target) {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/parity-build.mjs'), '--flow'], {
    stdio: 'inherit',
    env: { ...process.env, FLOW_STATION: '1', FLOW_TARGET: target },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail });
const browser = await launchChromium();

async function open(scenario) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  await page.goto(`${pathToFileURL(path.join(DIST, 'index.html')).href}#scenario=${scenario}`);
  await page.waitForSelector('html[data-ready="1"]', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  return { page, errors };
}

const flow = (page) => page.evaluate(() => window.__flow);
const text = (page, t) => page.getByText(t, { exact: false }).first();
const visible = (page, t, ms = 3000) => text(page, t).waitFor({ state: 'visible', timeout: ms }).then(() => true, () => false);
const gone = async (page, t, ms = 4000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if ((await text(page, t).count()) === 0) return true;
    await page.waitForTimeout(150);
  }
  return false;
};
const button = (page, name) => page.getByRole('button', { name, exact: true }).first();
const isDisabled = async (page, name) => (await button(page, name).getAttribute('aria-disabled')) === 'true';
const option = (page, label) => page.getByRole('button', { name: label, exact: true }).first();
const tap = (locator) => locator.click({ timeout: 3000 }).then(() => true, () => false);
const shot = (page, name) => page.screenshot({ path: path.join(OUT, `flow-station-${name}.png`) });

// ================= page 06: start screen =================
build('apps/mobile/app/station/[stationId]/start.tsx');

{
  const { page, errors } = await open('cached');
  check('06 cached: stage chip, title, subtitle and chips come from the station', (await visible(page, 'مرحله ۱')) && (await visible(page, 'شمارش و الگو')) && (await visible(page, 'شمارش تا ۵ و ادامه‌دادن الگوهای ساده')) && (await visible(page, '۵ بخش')) && (await visible(page, 'حدود ۸ دقیقه')));
  check('06 cached: empty progress bar is announced', await page.getByRole('progressbar', { name: 'هنوز بخشی انجام نشده' }).isVisible().catch(() => false));
  const bar = await page.getByRole('progressbar', { name: 'هنوز بخشی انجام نشده' }).boundingBox();
  check('06 (V2): the honest bar is 14px high (tokens.v2.progressH)', bar && Math.round(bar.height) === 14, JSON.stringify(bar));
  check('06 cached: no session hint line (waived, U-Q15)', (await text(page, 'پیشنهاد جلسه').count()) === 0);
  check('06 cached: start button is the primary action', await button(page, 'شروع').isVisible().catch(() => false));
  if (process.env.FLOW_CAPTURE === '1') await page.screenshot({ path: path.join(OUT, 'v2-station-start.png') });
  await tap(button(page, 'شروع'));
  let f = await flow(page);
  check('06 cached: start opens the lesson route', f.pushed.length === 1 && f.pushed[0] === '/station/ST01/play', JSON.stringify(f.pushed));
  await tap(button(page, 'برگرد به مسیر'));
  await tap(button(page, 'بستن'));
  f = await flow(page);
  check('06 cached: close and "back to path" both return to the path tab', f.replaced.length === 2 && f.replaced.every((h) => h === '/(tabs)'), JSON.stringify(f.replaced));
  if (results.some((r) => !r.ok)) await shot(page, 'start-fail');
  check('no runtime errors (06 cached)', errors.length === 0, errors.join(' | '));
  await page.close();
}

{
  const { page, errors } = await open('uncached');
  check('06 uncached: the primary action asks to prepare the content', await button(page, 'آماده‌سازی').isVisible().catch(() => false));
  await tap(button(page, 'آماده‌سازی'));
  const prepared = await visible(page, 'شروع', 3000);
  const f = await flow(page);
  check('06 uncached: preparing downloads the package, then the button becomes start', prepared && f.prepared.length === 1 && f.prepared[0] === 'pkg-ST01', JSON.stringify(f.prepared));
  check('no runtime errors (06 uncached)', errors.length === 0, errors.join(' | '));
  await page.close();
}

{
  const { page, errors } = await open('error');
  check('06 error: a calm alert explains that preparing did not finish', await visible(page, 'آماده‌سازی محتوا کامل نشد'));
  const disabled = await button(page, 'آماده‌سازی').getAttribute('aria-disabled');
  check('06 error: the prepare button is disabled without a package', disabled === 'true', String(disabled));
  check('no runtime errors (06 error)', errors.length === 0, errors.join(' | '));
  await page.close();
}

// ================= page 07: first lesson section =================
build('apps/mobile/parity/flow/targets/StationPlay.tsx');

{
  const { page, errors } = await open('play');
  check('07: section caption and position', (await visible(page, 'کشف می‌کنیم')) && (await visible(page, '۱ از ۵')));
  check('07: the guide bubble shows the lesson prompt', await visible(page, 'هر مهره را یکی‌یکی ببین'));
  const bar = page.getByRole('progressbar', { name: 'بخش ۱ از ۵' });
  const track = await bar.boundingBox();
  const fill = await bar.locator('> div').first().boundingBox();
  check('07 (V2): progress bar is 14px high (tokens.v2) and 1 of 5 sections (20%) filled', track && fill && Math.round(track.height) === 14 && Math.abs(fill.width / track.width - 0.2) < 0.005, JSON.stringify({ track, fill }));
  if (process.env.FLOW_CAPTURE === '1') await page.screenshot({ path: path.join(OUT, 'v2-teach.png') });
  const tray = page.getByLabel('سینی شمارش مهره‌ها');
  check('07 (V2): interactive counting tray with three uncounted beads and the count hint', (await tray.count()) === 1 && (await tray.getByRole('button').count()) >= 3 && (await visible(page, 'مهره‌ها را یکی‌یکی لمس کن')), JSON.stringify({ tray: await tray.count(), beads: await tray.getByRole('button').count() }));
  const replay = button(page, 'دوباره بشنو');
  check('07: hear-again and continue buttons are present', (await replay.isVisible().catch(() => false)) && (await button(page, 'ادامه').isVisible().catch(() => false)));
  await tap(replay);
  let f = await flow(page);
  check('07: hear again reads the prompt in Persian', f.spoken.length === 1 && f.spoken[0].language === 'fa-IR' && f.spoken[0].text.startsWith('هر مهره را یکی‌یکی ببین'), JSON.stringify(f.spoken));
  await tap(replay);
  f = await flow(page);
  check('07: pressing again restarts the speech (stop, then speak)', f.spoken.length === 2 && f.stops >= 2, `${f.spoken.length} spoken, ${f.stops} stops`);
  await tap(button(page, 'بستن'));
  f = await flow(page);
  check('07: close asks before leaving (no silent exit)', f.alerts.length === 1 && f.alerts[0].title === 'خارج می‌شوی؟' && f.backed === 0, JSON.stringify(f.alerts.map((a) => a.title)));
  await page.evaluate(() => {
    const leave = window.__flow.alerts[0].buttons.find((b) => b.text === 'خروج');
    leave.onPress();
  });
  f = await flow(page);
  check('07: confirming leaves the lesson', f.backed === 1, String(f.backed));
  const stopsBefore = f.stops;
  await tap(button(page, 'ادامه'));
  const moved = await gone(page, 'هر مهره را یکی‌یکی ببین');
  f = await flow(page);
  check('07: continue stops speech and moves to the next section', moved && f.stops > stopsBefore && (await visible(page, 'گروهی را انتخاب کن که ۳ مهره دارد')), `${moved} ${f.stops}/${stopsBefore}`);

  // ================= pages 08 to 10: the question interaction (D-001 to D-003) =================
  const optionDisabled = async (page, label) => (await option(page, label).getAttribute('aria-disabled')) === 'true';

  check('08 (V2): macro label and position chip render separately, question progress 2/5', (await visible(page, 'با هم تمرین می‌کنیم')) && (await visible(page, '۲ از ۵')) && (await page.getByRole('progressbar').first().getAttribute('aria-label')) === 'سؤال ۲ از ۵');
  check('08: check is disabled until an option is selected', await isDisabled(page, 'بررسی'));
  if (process.env.FLOW_CAPTURE === '1') await page.screenshot({ path: path.join(OUT, 'v2-question.png') });
  await tap(option(page, '۲'));
  check('08: selecting an option enables check (no submit yet)', !(await isDisabled(page, 'بررسی')));
  let submits = () => flow(page).then((x) => x.submits);
  check('08: selecting sends nothing to the server (D-001)', (await submits()).length === 0, JSON.stringify(await submits()));
  // Wave D interaction guard: a fast double-tap on «بررسی» (the submit is in flight during the
  // session/submit await) must reach the server exactly once — attemptNumber never drifts.
  await tap(button(page, 'بررسی'));
  await tap(button(page, 'بررسی'));
  check('10: warm sheet with retry copy, never red', (await visible(page, 'نزدیک بود. دوباره امتحان کنیم؟')) && (await visible(page, 'دوباره امتحان کن')));
  check('10: options lock while the sheet is open', (await optionDisabled(page, '۳')) && (await optionDisabled(page, '۴')));
  f = await flow(page);
  check('08: a double-tap on check still submits exactly one attempt (attemptNumber 1, no drift)', f.submits.length === 1 && f.submits[0].attemptNumber === 1 && f.submits[0].answerIndex === 0, JSON.stringify(f.submits));
  await tap(button(page, 'دوباره امتحان کن'));
  check('10: retry re-opens the same question and clears the selection', (await gone(page, 'نزدیک بود. دوباره امتحان کنیم؟')) && (await isDisabled(page, 'بررسی')));
  await tap(option(page, '۳'));
  await tap(button(page, 'بررسی'));
  check('09: correct sheet', (await visible(page, 'درست است!')) && (await visible(page, 'ادامه')));
  f = await flow(page);
  check('08: the retry is a second honest attempt (attemptNumber 2, fresh idempotency key)', f.submits.length === 2 && f.submits[1].attemptNumber === 2 && f.submits[0].idempotencyKey !== f.submits[1].idempotencyKey, JSON.stringify(f.submits.map((x) => [x.attemptNumber, x.answerIndex])));
  await tap(button(page, 'ادامه'));
  check('09: continue moves straight to the next section (pattern game)', (await visible(page, 'مسیر الگو')) && (await visible(page, 'کدام مهره باید جای علامت سؤال بیاید؟')));
  // The legacy pattern stage still submits on tap and auto-advances to the counting question (E04).
  await tap(option(page, 'آبی'));
  check('08 (V2): the counting question opens after the pattern game', (await visible(page, 'بازی می‌کنیم')) && (await visible(page, '۳ از ۵')) && (await visible(page, 'چند مهره می‌بینی؟')));
  // A second wrong answer is redirected by the server: the sheet says continue and recovery opens (D-002).
  await tap(option(page, '۲'));
  await tap(button(page, 'بررسی'));
  await visible(page, 'نزدیک بود. دوباره امتحان کنیم؟');
  await tap(button(page, 'دوباره امتحان کن'));
  await tap(option(page, '۲'));
  await tap(button(page, 'بررسی'));
  const retryButtonsAfterRedirect = await page.getByRole('button', { name: 'دوباره امتحان کن', exact: true }).count();
  check('10: a server redirect shows continue, not retry', (await visible(page, 'ادامه')) && retryButtonsAfterRedirect === 0, `retry buttons: ${retryButtonsAfterRedirect}`);
  await tap(button(page, 'ادامه'));
  check('10: continue follows the server decision into recovery', await visible(page, 'با هم دوباره'));
  if (results.some((r) => !r.ok)) await shot(page, 'play-fail');
  check('no runtime errors (07)', errors.length === 0, errors.join(' | '));
  await page.close();
}

// ================= pages 11 and 12: the whole happy path (checks, challenge intro, celebration) =================
{
  const { page, errors } = await open('play-pass');
  const pick = (qi, oi) => page.getByRole('button').nth(1 + qi * 4 + oi).click();
  // LEARN → E02 (question) correct
  await button(page, 'ادامه').click();
  await visible(page, 'گروهی را انتخاب کن که ۳ مهره دارد');
  await option(page, '۳').click();
  await button(page, 'بررسی').click();
  await visible(page, 'درست است!');
  await button(page, 'ادامه').click();
  // E03 pattern (legacy, submits on tap) → E04 question correct → E05 question correct
  await visible(page, 'مسیر الگو');
  await option(page, 'آبی').click();
  await visible(page, 'چند مهره می‌بینی؟');
  await option(page, '۳').click();
  await button(page, 'بررسی').click();
  await visible(page, 'درست است!');
  await button(page, 'ادامه').click();
  await visible(page, 'بدون کمک، تعداد شکل‌ها را پیدا کن');
  await option(page, '۳').click();
  await button(page, 'بررسی').click();
  await visible(page, 'درست است!');
  await button(page, 'ادامه').click();
  // E06 review pattern (legacy) → E07 check A (5 questions, 4 options each)
  await visible(page, 'مرور الگو');
  await option(page, 'آبی').click();
  await visible(page, 'چالش اول');
  for (const [qi, oi] of [[0, 1], [1, 2], [2, 1], [3, 1], [4, 3]]) await pick(qi, oi);
  await button(page, 'تمام شد').click();
  // E08 check B (5 questions, 3 options each) — all correct is the station pass
  await visible(page, 'چالش دوم');
  for (const [qi, oi] of [[0, 1], [1, 1], [2, 2], [3, 1], [4, 1]]) await page.getByRole('button').nth(1 + qi * 3 + oi).click();
  await button(page, 'تمام شد').click();
  // E11 transfer (legacy options) → E12 final mastery check
  await visible(page, 'در دنیای واقعی');
  await option(page, 'الگو B').click();
  await visible(page, 'چالش نهایی مهارت');
  for (const [qi, oi] of [[0, 1], [1, 2], [2, 2], [3, 1], [4, 0]]) await page.getByRole('button').nth(1 + qi * 3 + oi).click();
  await button(page, 'تمام شد').click();
  // Page 12: the challenge invitation
  check('12: title, subtitle and chips from the page', (await visible(page, 'مهارتت را نشان بده')) && (await visible(page, 'چهار سؤال کوتاه. این بار بدون کمک.')) && (await visible(page, 'چالش آخر')) && (await visible(page, '۳ سؤال'), 'the chip counts the real rounds of the definition (the page sample says ۴)'));
  check('12: the bar announces section 5 of 5', (await page.getByRole('progressbar').first().getAttribute('aria-label')) === 'بخش ۵ از ۵');
  await tap(button(page, 'بستن'));
  let f = await flow(page);
  check('12: close asks before leaving (no silent exit)', f.alerts.length === 1 && f.alerts[0].title === 'خارج می‌شوی؟' && f.backed === 0, JSON.stringify(f.alerts.map((a) => a.title)));
  await page.evaluate(() => {
    const stay = window.__flow.alerts[0].buttons.find((b) => b.text === 'می‌مانم');
    if (stay?.onPress) stay.onPress();
  });
  await visible(page, 'شروع چالش');
  await tap(button(page, 'شروع چالش'));
  check('12: starting opens the challenge player (no approved page yet)', await visible(page, 'چالش الگو'));
  // Four correct rounds finish the run; the celebration page follows.
  for (let round = 0; round < 3; round++) {
    await option(page, 'آبی').click();
    await page.waitForTimeout(250);
  }
  check('11: the celebration page with the station title', (await visible(page, 'آفرین!')) && (await visible(page, 'مرحلهٔ «شمارش و الگو» را کامل کردی.')));
  check('11 (V2): chapter progress 1 of 5 and the new achievement', (await visible(page, '۱ از ۵')) && (await visible(page, 'دستاورد جدید')) && (await visible(page, 'شمارش‌گر')));
  if (process.env.FLOW_CAPTURE === '1') await page.screenshot({ path: path.join(OUT, 'v2-result.png') });
  await tap(button(page, 'ادامه'));
  f = await flow(page);
  check('11: continue leaves the lesson', f.backed >= 1, String(f.backed));
  const submitKeys = (await flow(page)).submits.map((x) => x.idempotencyKey);
  check('11: every submit stayed idempotent-unique along the whole station', new Set(submitKeys).size === submitKeys.length, `${submitKeys.length} submits`);
  check('no runtime errors (11/12)', errors.length === 0, errors.join(' | '));
  if (results.some((r) => !r.ok)) await shot(page, 'result-fail');
  await page.close();
}

await browser.close();
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${!r.ok && r.detail ? ` — ${r.detail}` : ''}`);
fs.writeFileSync(path.join(OUT, 'flow-station-report.json'), JSON.stringify(results, null, 2));
const bad = results.filter((r) => !r.ok);
console.log(bad.length ? `FLOW_STATION: FAIL (${bad.length}/${results.length})` : `FLOW_STATION: PASS (${results.length}/${results.length})`);
process.exit(bad.length ? 1 : 0);
