// Interaction test of the REAL onboarding screen (react-native-web in Chromium, native/app dependencies
// replaced by recording stubs). It clicks and types through the whole flow and checks the logic that the
// static verifiers cannot see. Usage: node scripts/flow-run.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { launchChromium } from './lib/browser.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'apps/mobile/parity/dist-flow');
const OUT = path.join(ROOT, 'apps/mobile/parity/out');
fs.mkdirSync(OUT, { recursive: true });

const build = spawnSync(process.execPath, [path.join(ROOT, 'scripts/parity-build.mjs'), '--flow'], { stdio: 'inherit', env: process.env });
if (build.status !== 0) process.exit(build.status ?? 1);

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail });

const browser = await launchChromium();

async function open() {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(pathToFileURL(path.join(DIST, 'index.html')).href);
  await page.waitForSelector('html[data-ready="1"]', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  return { page, errors };
}

const flow = (page) => page.evaluate(() => window.__flow);
const btn = (page, name) => page.getByRole('button', { name, exact: true });
const text = (page, t) => page.getByText(t, { exact: false }).first();
const visible = async (page, t, ms = 3000) => text(page, t).waitFor({ timeout: ms }).then(() => true, () => false);
const gone = async (page, t) => (await text(page, t).count()) === 0;
const isDisabled = async (page, name) => (await btn(page, name).getAttribute('aria-disabled')) === 'true';
// Clicks that may legitimately be missing (a failing flow must be reported, not crash the run).
const tap = (page, name) => btn(page, name).click({ timeout: 2500 }).catch(() => false);
const barLabel = (page) => page.getByRole('progressbar').first().getAttribute('aria-label');

async function toCode(page) {
  await btn(page, 'بریم!').click();
  await page.locator('input[aria-label="شماره موبایل"]').fill('۰۹۱۲۳۴۵۶۷۸۹');
  await btn(page, 'ارسال کد').click();
  await visible(page, 'کد را وارد کن');
}
async function toProfile(page) {
  await toCode(page);
  await page.locator('input[aria-label="کد تأیید شش رقمی"]').fill('۱۲۳۴۵۶');
  await btn(page, 'تأیید').click();
  await visible(page, 'دوست داری بهت چی بگیم؟');
}

// ---------- Scenario A: full flow with placement ----------
{
  const { page, errors } = await open();
  check('welcome: title and consent line', (await visible(page, 'سلام!')) && (await visible(page, 'شرایط استفاده و حریم خصوصی را می‌پذیری')));
  if (process.env.FLOW_CAPTURE === '1') await page.screenshot({ path: path.join(OUT, 'v2-welcome.png') });
  await btn(page, 'بریم!').click();
  check('phone: page and progress 2/6', (await visible(page, 'شماره‌ات را بنویس')) && (await barLabel(page)) === 'مرحلهٔ ۲ از ۶');
  check('phone: send disabled while empty', await isDisabled(page, 'ارسال کد'));
  await page.locator('input[aria-label="شماره موبایل"]').fill('۰۹۱۲۳۴۵۶۷۸۹');
  check('phone: Persian digits accepted, send enabled', !(await isDisabled(page, 'ارسال کد')));
  if (process.env.FLOW_CAPTURE === '1') await page.screenshot({ path: path.join(OUT, 'v2-phone.png') });
  await btn(page, 'ارسال کد').click();
  check('code: page and progress 3/6', (await visible(page, 'کد را وارد کن')) && (await barLabel(page)) === 'مرحلهٔ ۳ از ۶');
  check('code: OTP requested for the E.164 number', JSON.stringify((await flow(page)).otpRequests) === JSON.stringify(['+989123456789']), JSON.stringify((await flow(page)).otpRequests));
  check('code: masked number in the approved format ۰۹۱۲***۶۷۸۹', await visible(page, '۰۹۱۲***۶۷۸۹'));
  check('code: verify disabled until six digits', await isDisabled(page, 'تأیید'));
  check('code: resend countdown shown', await visible(page, 'ارسال دوباره تا'));
  if (process.env.FLOW_CAPTURE === '1') await page.screenshot({ path: path.join(OUT, 'v2-code.png') });
  await page.locator('input[aria-label="کد تأیید شش رقمی"]').fill('۰۰۰۰۰۰');
  await btn(page, 'تأیید').click();
  check('code: wrong code shows the server message and stays', (await visible(page, 'کد نادرست است.')) && (await visible(page, 'کد را وارد کن')));
  await page.locator('input[aria-label="کد تأیید شش رقمی"]').fill('۱۲۳۴۵۶');
  await btn(page, 'تأیید').click();
  check('profile: reached directly after the code (grade step skipped), progress 4/6', (await visible(page, 'دوست داری بهت چی بگیم؟')) && (await barLabel(page)) === 'مرحلهٔ ۴ از ۶');
  check('profile: grade chooser is on the same page', await visible(page, 'در کدام پایه درس می‌خوانی؟'));
  check('profile: old separate grade page is gone', await gone(page, 'از کدام پایه شروع کنیم؟'));
  check('profile: continue disabled until a name is typed', await isDisabled(page, 'ادامه'));
  await btn(page, 'برگشت').click();
  check('back from profile goes to the code page', await visible(page, 'کد را وارد کن'));
  await btn(page, 'شماره را عوض کن').click();
  check('change number returns to the phone page', await visible(page, 'شماره‌ات را بنویس'));
  await btn(page, 'ارسال کد').click();
  await visible(page, 'کد را وارد کن');
  await page.locator('input[aria-label="کد تأیید شش رقمی"]').fill('۱۲۳۴۵۶');
  await btn(page, 'تأیید').click();
  await visible(page, 'دوست داری بهت چی بگیم؟');
  await page.locator('input[aria-label="اسم یا لقب"]').fill('نیما');
  check('profile: continue enabled after a name', !(await isDisabled(page, 'ادامه')));
  // Selected tiles are drawn with the V2 primarySoft fill (#DDF2E7) + primary border + check badge
  // (D-021 replacement of the V1 #D5E5EF assertion). react-native-web does not expose
  // accessibilityState to the DOM, so the visual state is what can be asserted here.
  const tileSelected = (name) => page.getByRole('radio', { name, exact: true }).evaluate((el) => [...el.querySelectorAll('*')].some((n) => getComputedStyle(n).backgroundColor === 'rgb(221, 242, 231)'));
  const before = { sun: await tileSelected('خورشیدی'), moon: await tileSelected('ماه') };
  await page.getByRole('radio', { name: 'ماه', exact: true }).click();
  const after = { sun: await tileSelected('خورشیدی'), moon: await tileSelected('ماه') };
  check('profile: avatar selection moves from sun to moon', before.sun && !before.moon && !after.sun && after.moon, JSON.stringify({ before, after }));
  check('profile: locked grades are disabled', (await page.getByRole('radio', { name: 'دوم', exact: true }).getAttribute('aria-disabled')) === 'true');
  if (process.env.FLOW_CAPTURE === '1') await page.screenshot({ path: path.join(OUT, 'v2-profile.png') });
  await btn(page, 'ادامه').click();
  check('placement: first question is shown (not a blank page)', await visible(page, 'سؤال ۱ از ۲'));
  // V2 chrome icons are Ionicons text glyphs; a real option always has readable text, so drop
  // private-use-glyph-only button texts (the icon-only back chevron) before choosing.
  const options = async () => (await page.getByRole('button').allInnerTexts()).map((t) => t.trim()).filter((t) => t && !['برگشت', 'فعلاً رد می‌کنم'].includes(t) && !/^[\uE000-\uF8FF\s]+$/.test(t));
  const first = (await options())[0];
  if (first) await tap(page, first);
  check('placement: second question after the first answer', await visible(page, 'سؤال ۲ از ۲'));
  const second = (await options())[0];
  if (second) await tap(page, second);
  check('result: shown after both answers, progress 6/6', (await visible(page, 'نقطه شروع تو آماده است')) && (await barLabel(page)) === 'مرحلهٔ ۶ از ۶');
  await tap(page, 'ورود به یادگیری');
  await page.waitForFunction(() => window.__flow.replaced.length > 0, null, { timeout: 5000 }).catch(() => undefined);
  const f = await flow(page);
  check('finish: routed to the tabs', JSON.stringify(f.replaced) === JSON.stringify(['/(tabs)']), JSON.stringify(f.replaced));
  check('finish: first grade content prepared', JSON.stringify(f.prepared) === JSON.stringify(['G1']), JSON.stringify(f.prepared));
  const prof = f.completed?.profile ?? {};
  check('finish: profile saved with name, grade, avatar and consent time',
    prof.childName === 'نیما' && prof.gradeId === 'G1' && prof.avatarPresetId === 'moon' && !Number.isNaN(Date.parse(prof.consentAt)), JSON.stringify(prof));
  check('no runtime errors (flow A)', errors.length === 0, errors.join(' | '));
  if (results.some((r) => !r.ok)) await page.screenshot({ path: path.join(OUT, 'flow-fail-A.png') });
  await page.close();
}

// ---------- Scenario B: skip placement ----------
{
  const { page, errors } = await open();
  await toProfile(page);
  await page.locator('input[aria-label="اسم یا لقب"]').fill('سارا');
  await btn(page, 'ادامه').click();
  await visible(page, 'سؤال ۱ از ۲', 1500);
  await text(page, 'فعلاً رد می‌کنم').click({ timeout: 2500 }).catch(() => false);
  await page.waitForFunction(() => window.__flow.replaced.length > 0, null, { timeout: 5000 }).catch(() => undefined);
  const f = await flow(page);
  check('skip: finishes without placement', JSON.stringify(f.replaced) === JSON.stringify(['/(tabs)']) && f.completed?.profile?.childName === 'سارا' && f.completed?.fastTrack === false, JSON.stringify(f.completed));
  check('no runtime errors (flow B)', errors.length === 0, errors.join(' | '));
  if (results.some((r) => !r.ok)) await page.screenshot({ path: path.join(OUT, 'flow-fail-B.png') });
  await page.close();
}
await browser.close();

for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${!r.ok && r.detail ? ` — ${r.detail}` : ''}`);
fs.writeFileSync(path.join(OUT, 'flow-report.json'), JSON.stringify(results, null, 2));
const bad = results.filter((r) => !r.ok);
console.log(bad.length ? `FLOW: FAIL (${bad.length}/${results.length})` : `FLOW: PASS (${results.length}/${results.length})`);
process.exit(bad.length ? 1 : 0);
