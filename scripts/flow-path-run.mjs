// Interaction test of the REAL path tab (react-native-web in Chromium, app dependencies stubbed and recorded).
// Scenarios: fresh start, mid path, jump offer, offline content. Usage: node scripts/flow-path-run.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { launchChromium } from './lib/browser.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'apps/mobile/parity/dist-flow');
const OUT = path.join(ROOT, 'apps/mobile/parity/out');
fs.mkdirSync(OUT, { recursive: true });

const build = spawnSync(process.execPath, [path.join(ROOT, 'scripts/parity-build.mjs'), '--flow'], {
  stdio: 'inherit',
  env: { ...process.env, FLOW_TARGET: 'apps/mobile/app/(tabs)/index.tsx' },
});
if (build.status !== 0) process.exit(build.status ?? 1);

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
const visible = (page, t, ms = 2500) => text(page, t).waitFor({ state: 'visible', timeout: ms }).then(() => true, () => false);
const gone = async (page, t, ms = 4500) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if ((await text(page, t).count()) === 0) return true;
    await page.waitForTimeout(150);
  }
  return false;
};
const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
const node = (page, n) => page.getByRole('button', { name: new RegExp(`^ایستگاه ${fa(n)}،`) }).first();
const tap = (locator) => locator.click({ timeout: 2500 }).then(() => true, () => false);
const scrollTop = (page) =>
  page.evaluate(() => {
    const el = [...document.querySelectorAll('*')].find((e) => ['auto', 'scroll'].includes(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 400);
    return el ? el.scrollTop : -1;
  });
const scrollTo = (page, top) =>
  page.evaluate((t) => {
    const el = [...document.querySelectorAll('*')].find((e) => ['auto', 'scroll'].includes(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 400);
    // react-native-web puts its own scrollTo({x,y}) on the node, so assign scrollTop (it fires the scroll event).
    if (el) el.scrollTop = t;
  }, top);
// The band is the chapter strip under the grade chip (y 60-120); dividers also start with «فصل».
const bandKicker = (page) =>
  page.evaluate(() => {
    const hit = [...document.querySelectorAll('div,span')].find((e) => e.children.length === 0 && /^فصل /.test(e.textContent || '') && e.getBoundingClientRect().top > 60 && e.getBoundingClientRect().top < 125);
    return hit ? hit.textContent : '';
  });
const inView = async (locator) => {
  const box = await locator.boundingBox();
  return Boolean(box) && box.y >= 0 && box.y + box.height <= 844 - 100;
};

// ---------- fresh start ----------
{
  const { page, errors } = await open('fresh');
  check('fresh: first chapter band (world name and kicker)', (await visible(page, 'دره‌ی عددها')) && (await bandKicker(page)).startsWith('فصل ۱ · '));
  check('fresh: grade chip is shown', await page.getByRole('button', { name: 'پایهٔ ۱', exact: true }).isVisible().catch(() => false));
  check('fresh: 25 stations and 5 chests are on the trail', (await page.getByRole('button', { name: /^ایستگاه [۰-۹]+،/ }).count()) === 25 && (await page.getByRole('button', { name: 'گنج، قفل', exact: true }).count()) === 5);
  check('fresh: start bubble on the current node', await visible(page, 'شروع', 1500).then(async (a) => a || (await visible(page, 'ادامه', 1500))));
  await tap(node(page, 1));
  const f1 = await flow(page);
  check('fresh: current station opens its start page', f1.pushed.length === 1 && /^\/station\/[^/]+\/start$/.test(f1.pushed[0]), JSON.stringify(f1.pushed));
  await tap(node(page, 3));
  check('fresh: locked station shows the notice and does not navigate', (await visible(page, 'ایستگاه‌های قبل را جلو ببر.')) && (await flow(page)).pushed.length === 1);
  check('fresh: notice disappears by itself', await gone(page, 'ایستگاه‌های قبل را جلو ببر.'));
  await tap(page.getByRole('button', { name: 'پایهٔ ۱', exact: true }));
  check('fresh: grade chip explains other grades are coming', await visible(page, 'پایه‌های دیگر به‌زودی باز می‌شوند.'));
  check('fresh: that note disappears by itself', await gone(page, 'پایه‌های دیگر به‌زودی باز می‌شوند.', 5000));
  const before = (await page.locator('body').innerText()).length;
  await tap(page.getByRole('button', { name: 'راهنمای فصل', exact: true }));
  await page.waitForTimeout(300);
  const opened = (await page.locator('body').innerText()).length;
  await tap(page.getByRole('button', { name: 'راهنمای فصل', exact: true }));
  await page.waitForTimeout(300);
  const closed = (await page.locator('body').innerText()).length;
  check('fresh: guide button shows then hides the chapter story', opened > before && closed === before, `${before}/${opened}/${closed}`);
  check('fresh: jump button is hidden at the top', (await page.getByRole('button', { name: 'برو به مرحلهٔ فعلی', exact: true }).count()) === 0);
  await scrollTo(page, 900);
  await page.waitForTimeout(500);
  check('scroll: band switches to the second chapter', (await bandKicker(page)).startsWith('فصل ۲ · '), await bandKicker(page));
  check('scroll: chapter dividers are announced as headings', (await page.getByRole('heading').count()) >= 4);
  check('scroll: jump-to-current button appears after 300px', await page.getByRole('button', { name: 'برو به مرحلهٔ فعلی', exact: true }).isVisible().catch(() => false));
  await tap(page.getByRole('button', { name: 'برو به مرحلهٔ فعلی', exact: true }));
  await page.waitForTimeout(700);
  const top = await scrollTop(page);
  check('scroll: jump button returns to the current station', top >= 0 && top <= 300, `scrollTop=${top}`);
  check('scroll: first chapter band is back', (await bandKicker(page)).startsWith('فصل ۱ · '), await bandKicker(page));
  check('no runtime errors (fresh)', errors.length === 0, errors.join(' | '));
  if (results.some((r) => !r.ok)) await page.screenshot({ path: path.join(OUT, 'flow-path-fail-fresh.png') });
  await page.close();
}

// ---------- mid path (7 stations done, the 8th has a resume point) ----------
{
  const { page, errors } = await open('mid');
  check('mid: opens on the chapter of the current station', (await bandKicker(page)).startsWith('فصل ۲ · '), await bandKicker(page));
  check('mid: the current station is on screen without scrolling', await inView(node(page, 8)));
  await tap(node(page, 8));
  const f = await flow(page);
  check('mid: resuming a started station goes to its play page', f.pushed.length === 1 && /^\/station\/[^/]+\/play$/.test(f.pushed[0]), JSON.stringify(f.pushed));
  check('mid: a finished station is not locked (no notice)', (await tap(node(page, 1))) && (await text(page, 'ایستگاه‌های قبل را جلو ببر.').count()) === 0);
  check('no runtime errors (mid)', errors.length === 0, errors.join(' | '));
  if (results.some((r) => !r.ok)) await page.screenshot({ path: path.join(OUT, 'flow-path-fail-mid.png') });
  await page.close();
}

// ---------- jump offer (the first chapter is finished, the second untouched) ----------
{
  const { page, errors } = await open('jump');
  await scrollTo(page, 700);
  await page.waitForTimeout(500);
  const offer = page.getByRole('button', { name: /پرش به فصل ۲/ }).first();
  check('jump: offer appears under the second chapter divider', await offer.isVisible().catch(() => false));
  await tap(offer);
  const f = await flow(page);
  check('jump: offer opens the jump assessment of that unit', f.pushed.length === 1 && /\/jump\?targetStationId=/.test(f.pushed[0]), JSON.stringify(f.pushed));
  check('no runtime errors (jump)', errors.length === 0, errors.join(' | '));
  if (results.some((r) => !r.ok)) await page.screenshot({ path: path.join(OUT, 'flow-path-fail-jump.png') });
  await page.close();
}

// ---------- offline (nothing downloaded) ----------
{
  const { page, errors } = await open('offline');
  check('offline: warning strip explains the situation', await visible(page, 'محتوای دانلودشده روی دستگاه نمایش داده می‌شود'));
  check('offline: the current station is marked as being prepared', /آماده/.test((await node(page, 1).getAttribute('aria-label')) ?? ''), (await node(page, 1).getAttribute('aria-label')) ?? '');
  check('offline: the path is still fully shown', (await page.getByRole('button', { name: /^ایستگاه [۰-۹]+،/ }).count()) === 25);
  check('no runtime errors (offline)', errors.length === 0, errors.join(' | '));
  await page.close();
}

await browser.close();
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${!r.ok && r.detail ? ` — ${r.detail}` : ''}`);
fs.writeFileSync(path.join(OUT, 'flow-path-report.json'), JSON.stringify(results, null, 2));
const bad = results.filter((r) => !r.ok);
console.log(bad.length ? `FLOW_PATH: FAIL (${bad.length}/${results.length})` : `FLOW_PATH: PASS (${results.length}/${results.length})`);
process.exit(bad.length ? 1 : 0);
