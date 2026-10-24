// Interaction test of the REAL station start screen (page 06) and the real lesson player's first section (page 07):
// react-native-web in Chromium, only native and network edges stubbed and recorded.
// Usage: node scripts/flow-station-run.mjs
import fs from 'node:fs';
import path from 'node:path';
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
  await page.goto(`file://${path.join(DIST, 'index.html')}#scenario=${scenario}`);
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
const tap = (locator) => locator.click({ timeout: 3000 }).then(() => true, () => false);
const shot = (page, name) => page.screenshot({ path: path.join(OUT, `flow-station-${name}.png`) });

// ================= page 06: start screen =================
build('apps/mobile/app/station/[stationId]/start.tsx');

{
  const { page, errors } = await open('cached');
  check('06 cached: stage chip, title, subtitle and chips come from the station', (await visible(page, 'مرحله ۱')) && (await visible(page, 'شمارش و الگو')) && (await visible(page, 'شمارش تا ۵ و ادامه‌دادن الگوهای ساده')) && (await visible(page, '۵ بخش')) && (await visible(page, 'حدود ۸ دقیقه')));
  check('06 cached: empty progress bar is announced', await page.getByRole('progressbar', { name: 'هنوز بخشی انجام نشده' }).isVisible().catch(() => false));
  const bar = await page.getByRole('progressbar', { name: 'هنوز بخشی انجام نشده' }).boundingBox();
  check('06 cached: the bar is 10px high, not a pill', bar && Math.round(bar.height) === 10 && Math.round(bar.width) === 260, JSON.stringify(bar));
  check('06 cached: no session hint line (waived, U-Q15)', (await text(page, 'پیشنهاد جلسه').count()) === 0);
  check('06 cached: start button is the primary action', await button(page, 'شروع').isVisible().catch(() => false));
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
  check('07: the guide bubble shows the lesson prompt', await visible(page, 'هر ستاره را یکی‌یکی ببین'));
  const bar = page.getByRole('progressbar', { name: 'بخش ۱ از ۵' });
  const track = await bar.boundingBox();
  const fill = await bar.locator('> div').first().boundingBox();
  check('07: progress bar is 16px high and 1 of 5 sections (20%) filled', track && fill && Math.round(track.height) === 16 && Math.abs(fill.width / track.width - 0.2) < 0.005, JSON.stringify({ track, fill }));
  check('07: three numbered beads', (await page.getByLabel('۳ مهره').count()) > 0 && (await visible(page, '۳')) && (await visible(page, '۲')));
  const replay = button(page, 'دوباره بشنو');
  check('07: hear-again and continue buttons are present', (await replay.isVisible().catch(() => false)) && (await button(page, 'ادامه').isVisible().catch(() => false)));
  await tap(replay);
  let f = await flow(page);
  check('07: hear again reads the prompt in Persian', f.spoken.length === 1 && f.spoken[0].language === 'fa-IR' && f.spoken[0].text.startsWith('هر ستاره را یکی‌یکی ببین'), JSON.stringify(f.spoken));
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
  const moved = await gone(page, 'هر ستاره را یکی‌یکی ببین');
  f = await flow(page);
  check('07: continue stops speech and moves to the next section', moved && f.stops > stopsBefore && (await visible(page, 'یه انتخاب کوچولو')), `${moved} ${f.stops}/${stopsBefore}`);
  if (results.some((r) => !r.ok)) await shot(page, 'play-fail');
  check('no runtime errors (07)', errors.length === 0, errors.join(' | '));
  await page.close();
}

await browser.close();
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${!r.ok && r.detail ? ` — ${r.detail}` : ''}`);
fs.writeFileSync(path.join(OUT, 'flow-station-report.json'), JSON.stringify(results, null, 2));
const bad = results.filter((r) => !r.ok);
console.log(bad.length ? `FLOW_STATION: FAIL (${bad.length}/${results.length})` : `FLOW_STATION: PASS (${results.length}/${results.length})`);
process.exit(bad.length ? 1 : 0);
