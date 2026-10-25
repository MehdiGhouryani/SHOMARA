// Interaction test of the REAL practice and me tabs (pages 13 and 14 on UI v1): react-native-web in
// Chromium with the app dependencies stubbed and recorded. Usage: node scripts/flow-tabs-run.mjs
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
    env: { ...process.env, FLOW_TARGET: target },
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
  await page.waitForTimeout(600);
  return { page, errors };
}

const flow = (page) => page.evaluate(() => window.__flow);
const text = (page, t) => page.getByText(t, { exact: false }).first();
const visible = (page, t, ms = 3000) => text(page, t).waitFor({ state: 'visible', timeout: ms }).then(() => true, () => false);
const button = (page, name) => page.getByRole('button', { name, exact: true }).first();
const tap = (locator) => locator.click({ timeout: 3000 }).then(() => true, () => false);
const shot = (page, name) => page.screenshot({ path: path.join(OUT, `flow-tabs-${name}.png`) });

// ================= page 13: practice =================
build('apps/mobile/app/(tabs)/practice.tsx');
{
  const { page, errors } = await open('tabs-practice');
  check('13: title and Fandogh guide bubble', (await visible(page, 'تمرین')) && (await visible(page, 'بیا مهارتت را قوی کنیم.')));
  check('13: recommended row and second game carry the practice chip', (await visible(page, 'الگوی بعدی را پیدا کن')) && (await visible(page, 'تعداد را پیدا کن')) && (await page.getByText('تمرین', { exact: true }).count()) >= 2);
  check('13: locked row explains when it opens', await visible(page, 'شکل‌ها را پیدا کن') && (await visible(page, 'بعد از مرحلهٔ ۳ باز می‌شود')));
  check('13: start uses the contract label for the grade', await button(page, 'شروع همین حالا').isVisible().catch(() => false));
  await tap(button(page, 'شروع همین حالا'));
  let f = await flow(page);
  check('13: start opens the recommended station start route', f.pushed.length === 1 && f.pushed[0] === '/station/ST01/start?entry=practice', JSON.stringify(f.pushed));
  check('no runtime errors (13)', errors.length === 0, errors.join(' | '));
  if (results.some((r) => !r.ok)) await shot(page, 'practice-fail');
  await page.close();
}

// ================= page 14: me =================
build('apps/mobile/app/(tabs)/profile.tsx');
{
  const { page, errors } = await open('tabs-me');
  check('14: name, grade chip and the 25-station progress', (await visible(page, 'دوست ریاضی')) && (await visible(page, 'پایه اول ابتدایی')) && (await visible(page, '۰ از ۲۵ ایستگاه')));
  check('14: all five path achievements as locked rows', (await visible(page, 'شمارش‌گر')) && (await visible(page, 'حسابگر')) && (await visible(page, 'ایستگاه ۱ را کامل کن')) && (await visible(page, 'ایستگاه ۵ را کامل کن')));
  check('14: derived action rows keep the parent and avatar entries', (await visible(page, 'تغییر ظاهر')) && (await visible(page, 'والدین')));
  await tap(button(page, 'تنظیمات'));
  let f = await flow(page);
  check('14: settings button opens the settings route', f.pushed.includes('/settings'), JSON.stringify(f.pushed));
  await tap(text(page, 'والدین'));
  f = await flow(page);
  check('14: parent row opens the protected parent route', f.pushed.includes('/parent'), JSON.stringify(f.pushed));
  await tap(text(page, 'شمارش‌گر'));
  check('14: achievement row opens the detail sheet (S18)', await visible(page, 'هنوز نه'));
  await tap(button(page, 'بستن'));
  check('14: the sheet closes', (await page.getByText('هنوز نه', { exact: false }).count()) === 0);
  check('no runtime errors (14)', errors.length === 0, errors.join(' | '));
  if (results.some((r) => !r.ok)) await shot(page, 'me-fail');
  await page.close();
}

// ================= settings (no design page; ADULT_SURFACE scope) =================
build('apps/mobile/app/settings.tsx');
{
  const { page, errors } = await open();
  const switches = ['صدا', 'حرکت و انیمیشن', 'لرزش لمسی', 'متن بزرگ‌تر'];
  let allVisible = true;
  for (const name of switches) allVisible = allVisible && (await page.getByRole('switch', { name, exact: true }).first().isVisible().catch(() => false));
  check('settings: the four learning/accessibility switches are present', allVisible, switches.join('،'));
  check('settings: only preference switches — nothing else is offered (ADULT_SURFACE)', (await page.getByRole('switch').count()) === 6, `${await page.getByRole('switch').count()} switches: sound, motion, haptics, gentle reminder, large text, reduced motion`);
  await page.getByRole('switch', { name: 'صدا', exact: true }).first().click();
  await page.getByRole('switch', { name: 'لرزش لمسی', exact: true }).first().click();
  await page.getByRole('switch', { name: 'متن بزرگ‌تر', exact: true }).first().click();
  const f = await flow(page);
  check('settings: toggling records exactly the touched preferences', JSON.stringify(f.preferenceSets) === JSON.stringify([['sound', false], ['haptics', true], ['largeText', true]]), JSON.stringify(f.preferenceSets));
  check('no runtime errors (settings)', errors.length === 0, errors.join(' | '));
  await page.close();
}

// ================= avatar workshop (no design page; child identity preset) =================
build('apps/mobile/app/avatar.tsx');
{
  const { page, errors } = await open();
  check('avatar: the workshop opens with its header', (await visible(page, 'کارگاه آواتار')) && (await visible(page, 'ظاهر من')));
  const items = await page.getByLabel(/، هنوز باز نشده$|انتخاب آیتم/).count();
  check('avatar: item grid announces ownership in Persian', items > 0, `${items} labelled entries`);
  check('avatar: the workshop view arrived (remote line, offline fallback absent)', await visible(page, 'ظاهر تازه با پیشرفت مسیر باز می‌شود — خریدنی نیست.'));
  const save = button(page, 'ذخیره');
  check('avatar: save is the primary action', await save.isVisible().catch(() => false));
  await tap(save);
  await visible(page, 'ذخیره شد');
  const f = await flow(page);
  check('avatar: saving posts the appearance exactly once (remote path)', f.avatarSaves.length === 1, JSON.stringify(f.avatarSaves));
  check('no runtime errors (avatar)', errors.length === 0, errors.join(' | '));
  await page.close();
}
await browser.close();

for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${!r.ok && r.detail ? ` — ${r.detail}` : ''}`);
fs.writeFileSync(path.join(OUT, 'flow-tabs-report.json'), JSON.stringify(results, null, 2));
const bad = results.filter((r) => !r.ok);
console.log(bad.length ? `FLOW_TABS: FAIL (${bad.length}/${results.length})` : `FLOW_TABS: PASS (${results.length}/${results.length})`);
process.exit(bad.length ? 1 : 0);
