// Responsive probe (playbook MASTER_EXECUTION §5 / UX rubric "Responsiveness"): renders REAL migrated
// screens at 360/390/412dp and asserts zero horizontal overflow and zero off-screen elements.
// Per width, one fresh page walks the real journey and sweeps every step it passes through.
// Usage: node scripts/probe-v2-widths.mjs  [PROBE_ONLY=onboarding|practice|me|station-play]
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { launchChromium } from './lib/browser.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'apps/mobile/parity/dist-flow');
const OUT = path.join(ROOT, 'apps/mobile/parity/out');
fs.mkdirSync(OUT, { recursive: true });

// Each journey is a list of {id, goto} steps run in order on ONE page per width; `sweep: false` skips measuring.
const journeys = [
  {
    id: 'onboarding', file: 'apps/mobile/app/onboarding.tsx',
    steps: [
      { id: 'welcome', goto: async () => {} },
      { id: 'phone', goto: async (page) => { await page.getByRole('button', { name: 'بریم!' }).click(); } },
      { id: 'code', goto: async (page) => { await page.locator('input[aria-label="شماره موبایل"]').fill('۰۹۱۲۳۴۵۶۷۸۹'); await page.getByRole('button', { name: 'ارسال کد' }).click(); } },
      { id: 'profile', goto: async (page) => { await page.locator('input[aria-label="کد تأیید شش رقمی"]').fill('۱۲۳۴۵۶'); await page.getByRole('button', { name: 'تأیید' }).click(); } },
    ],
  },
  { id: 'practice', file: 'apps/mobile/app/(tabs)/practice.tsx', steps: [{ id: 'tab', goto: async () => {} }] },
  { id: 'me', file: 'apps/mobile/app/(tabs)/profile.tsx', steps: [{ id: 'tab', goto: async () => {} }] },
  { id: 'station-play', file: 'apps/mobile/parity/flow/targets/StationPlay.tsx', steps: [{ id: 'teach', goto: async () => {} }] },
];

const build = (file) => {
  // The lesson player target runs with FLOW_STATION=1 (real state core, native/network stubs only),
  // exactly like flow:station; other targets use the plain flow stub set.
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/parity-build.mjs'), '--flow'], {
    stdio: 'inherit',
    env: { ...process.env, ...(file.includes('StationPlay') ? { FLOW_STATION: '1' } : {}), FLOW_TARGET: file },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

const browser = await launchChromium();
const failures = [];
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${!ok && detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

// In-page sweep: every rendered element must stay inside the root horizontally, and the root must
// not scroll sideways. Vertical scrolling inside the body ScrollView is legitimate.
async function sweep(page, screenshot) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const result = await page.evaluate(() => {
    const rootEl = document.getElementById('root')?.firstElementChild;
    if (!rootEl) return { error: 'no root' };
    const rw = rootEl.getBoundingClientRect();
    let offscreen = 0;
    const offenders = [];
    for (const el of rootEl.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.right > rw.right + 1 || r.left < rw.left - 1) {
        offscreen += 1;
        if (offenders.length < 4) offenders.push(`${el.tagName} right=${Math.round(r.right)} left=${Math.round(r.left)}`);
      }
    }
    const hScroll = rootEl.scrollWidth > Math.ceil(rw.width) + 1;
    return { offscreen, offenders, hScroll, width: Math.round(rw.width), rootLeft: Math.round(rw.left), rootRight: Math.round(rw.right), scrollWidth: rootEl.scrollWidth };
  });
  if (screenshot) await page.screenshot({ path: path.join(OUT, screenshot) });
  return result;
}

const targets = targets_filter();
function targets_filter() {
  const only = process.env.PROBE_ONLY;
  return only ? journeys.filter((t) => t.id === only) : journeys;
}

for (const target of targets) {
  build(target.file);
  for (const width of [360, 390, 412]) {
    const page = await browser.newPage({ viewport: { width: 412, height: 844 } });
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 150)));
    const url = `${pathToFileURL(path.join(DIST, 'index.html')).href}#probe-w=${width}&probe-h=844`;
    await page.goto(url);
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('html[data-ready="1"]', { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    for (const step of target.steps) {
      await step.goto(page);
      await page.waitForTimeout(300);
      const r = await sweep(page, `probe-${target.id}-${step.id}-${width}.png`);
      if ('error' in r) {
        check(`${target.id}/${step.id}@${width}`, false, r.error);
        continue;
      }
      check(`${target.id}/${step.id}@${width}: no horizontal overflow`, r.hScroll === false && r.offscreen === 0, JSON.stringify({ offscreen: r.offscreen, hScroll: r.hScroll, root: [r.rootLeft, r.rootRight], offenders: r.offenders }));
      check(`${target.id}/${step.id}@${width}: no runtime errors`, pageErrors.length === 0, pageErrors.join(' | '));
      pageErrors.length = 0;
    }
    await page.close();
  }
}
await browser.close();

console.log(failures.length ? `PROBE: FAIL (${failures.length})` : 'PROBE: PASS (zero overflow, zero off-screen at 360/390/412)');
process.exit(failures.length ? 1 : 0);
