// Renders each approved page (pages-v1) at 390x844 and stores a golden PNG plus the bounding boxes of
// the elements that components are compared against. Animations are frozen so output is deterministic.
import fs from 'node:fs';
import path from 'node:path';
import { launchChromium } from './lib/browser.mjs';

const ROOT = process.cwd();
const V1 = path.join(ROOT, 'docs/design-handoff-2026-10/pages-v1');
const OUT = path.join(V1, 'goldens');
const SELECTORS = ['.scr', '.top', '.bar', '.bar > i', '.ibtn', '.guide', '.por', '.bub', '.btn', '.tbtn', '.card', '.chip', '.inp', '.field', '.tabs', '.tab', '.tray', '.bead', '.bn', '.opts', '.opt', '.opt.sel', '.fb', '.fbh', '.fbi', '.fbi svg', '.tile', '.unit', '.node', '.h1', '.sub', '.cap', '.hero', '.body', '.foot'];
const SCROLL_SHOTS = [900, 1800, 2700, 3600];
const manifest = JSON.parse(fs.readFileSync(path.join(V1, 'manifest.json'), 'utf8'));
const pages = manifest.pages.filter((p) => p.id !== '15');

fs.mkdirSync(OUT, { recursive: true });
const browser = await launchChromium();
const rects = {};
for (const page of pages) {
  const tab = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await tab.goto('file://' + path.join(V1, page.file));
  await tab.waitForSelector('.scr', { timeout: 15000 });
  await tab.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
  await tab.evaluate(() => document.fonts.ready);
  await tab.waitForTimeout(600);
  await tab.screenshot({ path: path.join(OUT, `${page.id}.png`) });
  const measure = () => tab.evaluate((sels) => {
    const out = {};
    for (const s of sels) {
      out[s] = [...document.querySelectorAll(s)].map((el) => {
        const r = el.getBoundingClientRect();
        return { x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) };
      });
    }
    return out;
  }, SELECTORS);
  rects[page.id] = await measure();
  if (page.id === '06') {
    // The page's own `.bar{flex:1}` sits in a column flex container, so the 10px progress track (`height:10px`,
    // `max-width:260px`) grows into a 166px pill. `06-fix` renders the same page with only that rule neutralised
    // (the declared intent); U-Q14 in START_HERE records the decision. The untouched `06` golden stays as delivered.
    await tab.addStyleTag({ content: '.body > .bar{flex:none!important}' });
    await tab.waitForTimeout(300);
    await tab.screenshot({ path: path.join(OUT, '06-fix.png') });
    rects['06-fix'] = await measure();
  }
  if (page.id === '05') {
    // The path page scrolls: chapters, dividers, chests and band themes only show below the first screen.
    for (const y of SCROLL_SHOTS) {
      await tab.evaluate((top) => document.querySelector('.trail').scrollTo({ top, behavior: 'instant' }), y);
      await tab.waitForTimeout(450);
      await tab.screenshot({ path: path.join(OUT, `05-s${y}.png`) });
    }
  }
  await tab.close();
  console.log(`golden ${page.id} ${page.file}`);
}
fs.writeFileSync(path.join(OUT, 'rects.json'), JSON.stringify(rects, null, 1));
await browser.close();
console.log(`done: ${pages.length} goldens + rects.json`);
