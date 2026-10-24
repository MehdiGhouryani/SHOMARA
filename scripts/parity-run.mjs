// Visual parity: renders each specimen with react-native-web and compares it, pixel by pixel, with the
// same region of the approved page's golden screenshot. Usage: node scripts/parity-run.mjs [specimenId ...]
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { launchChromium } from './lib/browser.mjs';

const ROOT = process.cwd();
const P = path.join(ROOT, 'apps/mobile/parity');
const GOLD = path.join(ROOT, 'docs/design-handoff-2026-10/pages-v1/goldens');
const OUT = path.join(P, 'out');
const manifest = JSON.parse(fs.readFileSync(path.join(P, 'manifest.json'), 'utf8'));
const rects = JSON.parse(fs.readFileSync(path.join(GOLD, 'rects.json'), 'utf8'));
const only = process.argv.slice(2);

const build = spawnSync(process.execPath, [path.join(ROOT, 'scripts/parity-build.mjs')], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const crop = (png, x, y, w, h) => {
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(png, out, x, y, w, h, 0, 0);
  return out;
};

const browser = await launchChromium();
const results = [];
for (const spec of manifest.filter((s) => only.length === 0 || only.includes(s.id))) {
  const r = rects[spec.page]?.[spec.selector]?.[spec.index];
  if (!r) throw new Error(`no rect for ${spec.id}: page ${spec.page} ${spec.selector}[${spec.index}]`);
  const x0 = Math.max(0, Math.floor(r.x - spec.pad));
  const y0 = Math.max(0, Math.floor(r.y - spec.pad));
  const x1 = Math.min(390, Math.ceil(r.x + r.w + spec.pad));
  const y1 = Math.min(844, Math.ceil(r.y + r.h + spec.pad));
  const clip = { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };

  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  const hash = `id=${spec.id}&x=${r.x}&y=${r.y}&w=${r.w}${spec.bg ? `&bg=${encodeURIComponent(spec.bg)}` : ''}${spec.sy ? `&sy=${spec.sy}` : ''}`;
  await page.goto(`${pathToFileURL(path.join(P, 'dist/index.html')).href}#${hash}`);
  await page.waitForSelector('html[data-ready="1"]', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const actualBuf = await page.screenshot({ clip });
  await page.close();

  const actual = PNG.sync.read(actualBuf);
  const golden = crop(PNG.sync.read(fs.readFileSync(path.join(GOLD, `${spec.golden ?? spec.page}.png`))), clip.x, clip.y, clip.width, clip.height);
  const diff = new PNG({ width: clip.width, height: clip.height });
  const bad = pixelmatch(golden.data, actual.data, diff.data, clip.width, clip.height, { threshold: 0.18, includeAA: false });
  const pct = (bad / (clip.width * clip.height)) * 100;
  fs.writeFileSync(path.join(OUT, `${spec.id}.actual.png`), PNG.sync.write(actual));
  fs.writeFileSync(path.join(OUT, `${spec.id}.golden.png`), PNG.sync.write(golden));
  fs.writeFileSync(path.join(OUT, `${spec.id}.diff.png`), PNG.sync.write(diff));
  results.push({ id: spec.id, pct: +pct.toFixed(2), max: spec.maxDiffPercent, pass: pct <= spec.maxDiffPercent && errors.length === 0, errors });
}
await browser.close();

for (const r of results) {
  console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.id.padEnd(14)} diff ${r.pct.toFixed(2).padStart(6)}%  (max ${r.max}%)${r.errors.length ? '  errors: ' + r.errors.join(' | ') : ''}`);
}
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.pass);
console.log(failed.length ? `PARITY: FAIL (${failed.length}/${results.length})` : `PARITY: PASS (${results.length}/${results.length})`);
process.exit(failed.length ? 1 : 0);
