// Large-text robustness check (phase P2): the real screens in Chromium with every font multiplied by
// 1.3x (Android "large" ~130%) and 2.0x (200%). react-native-web does not implement RN font scaling
// (PixelRatio.getFontScale is hardcoded to 1), so the harness multiplies computed font sizes directly —
// the same failure mode Android produces: text grows while token-sized boxes keep their height.
// Pass criteria per screen: no NEW overlapping text pairs and no NEW clipped text at 130% and 200%
// compared to the 100% baseline (the parity goldens already pin the baseline layout pixel-exact).
// Usage: node scripts/flow-largetext-run.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { launchChromium } from './lib/browser.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'apps/mobile/parity/dist-flow');

function build(target, station = false) {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/parity-build.mjs'), '--flow'], {
    stdio: 'inherit',
    env: { ...process.env, FLOW_TARGET: target, ...(station ? { FLOW_STATION: '1' } : {}) },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail });
const browser = await launchChromium();

async function open(scenario = '') {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${pathToFileURL(path.join(DIST, 'index.html')).href}${scenario ? `#scenario=${scenario}` : ''}`);
  await page.waitForSelector('html[data-ready="1"]', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  return { page, errors };
}

// Multiplies every computed font size from the untouched baseline, then reports text overlaps and clipped text.
// Scaling is always applied from the stored baseline (never cumulatively). A text is "clipped" only when it
// sticks out of an overflow:hidden box that no scrollable (auto/scroll) ancestor between them can reveal —
// content below the fold of a ScrollView is scroll-reachable, exactly like on device.
async function measureAt(page, scale) {
  return page.evaluate((s) => {
    const all = Array.from(document.querySelectorAll('#root *'));
    if (!window.__baselineFonts) {
      window.__baselineFonts = new Map(all.map((el) => [el, window.getComputedStyle(el).fontSize]));
    }
    for (const [el, size] of window.__baselineFonts) {
      if (size && size.endsWith('px')) el.style.fontSize = s === 1 ? '' : `${Math.round(parseFloat(size) * s * 100) / 100}px`;
    }
    const isTextLeaf = (el) =>
      el.nodeType === 1 && Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    const leaves = all.filter(isTextLeaf).map((el) => ({ el, rect: el.getBoundingClientRect() })).filter((x) => x.rect.width > 1 && x.rect.height > 1);
    const intersects = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 4 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 4;
    const contains = (a, b) => a.left <= b.left + 1 && a.right >= b.right - 1 && a.top <= b.top + 1 && a.bottom >= b.bottom - 1;
    let overlaps = [];
    for (let i = 0; i < leaves.length; i += 1) {
      for (let j = i + 1; j < leaves.length; j += 1) {
        const a = leaves[i];
        const b = leaves[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        if (contains(a.rect, b.rect) || contains(b.rect, a.rect)) continue;
        if (intersects(a.rect, b.rect)) overlaps.push(`${a.el.textContent.trim().slice(0, 18)} ↔ ${b.el.textContent.trim().slice(0, 18)}`);
      }
    }
    let clipped = [];
    for (const { el, rect } of leaves) {
      let node = el.parentElement;
      while (node && node.id !== 'root') {
        const style = window.getComputedStyle(node);
        const yOverflow = style.overflowY;
        const xOverflow = style.overflowX;
        const scrollable = ['auto', 'scroll'].includes(yOverflow) || ['auto', 'scroll'].includes(xOverflow);
        const hidden = yOverflow === 'hidden' || xOverflow === 'hidden';
        if (scrollable) break; // reachable by scrolling — never a clip
        if (hidden) {
          const box = node.getBoundingClientRect();
          if (rect.left < box.left - 2 || rect.right > box.right + 2 || rect.top < box.top - 2 || rect.bottom > box.bottom + 2) {
            clipped.push(el.textContent.trim().slice(0, 18));
          }
          break;
        }
        node = node.parentElement;
      }
    }
    return { overlaps, clipped };
  }, scale);
}

async function checkScreen(name, target, scenario, station = false) {
  build(target, station);
  const { page, errors } = await open(scenario);
  const baseline = await measureAt(page, 1);
  for (const scale of [1.3, 2.0]) {
    const m = await measureAt(page, scale);
    check(`${name}: no new overlapping text at ${Math.round(scale * 100)}%`, m.overlaps.length <= baseline.overlaps.length, `baseline ${baseline.overlaps.length}: ${baseline.overlaps.slice(0, 3).join(' | ')}; scaled ${m.overlaps.length}: ${m.overlaps.slice(0, 3).join(' | ')}`);
    check(`${name}: no new clipped text at ${Math.round(scale * 100)}%`, m.clipped.length <= baseline.clipped.length, `baseline ${baseline.clipped.length}: ${baseline.clipped.slice(0, 3).join(' | ')}; scaled ${m.clipped.length}: ${m.clipped.slice(0, 3).join(' | ')}`);
  }
  check(`${name}: no runtime errors`, errors.length === 0, errors.join(' | '));
  await page.close();
}

await checkScreen('13 practice tab', 'apps/mobile/app/(tabs)/practice.tsx', 'tabs-practice');
await checkScreen('05 path tab', 'apps/mobile/app/(tabs)/index.tsx', 'fresh');
await checkScreen('07/08 lesson + question', 'apps/mobile/parity/flow/targets/StationPlay.tsx', 'play', true);
await checkScreen('settings', 'apps/mobile/app/settings.tsx', '');

await browser.close();
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${!r.ok && r.detail ? ` — ${r.detail}` : ''}`);
const bad = results.filter((r) => !r.ok);
console.log(bad.length ? `FLOW_LARGETEXT: FAIL (${bad.length}/${results.length})` : `FLOW_LARGETEXT: PASS (${results.length}/${results.length})`);
process.exit(bad.length ? 1 : 0);
