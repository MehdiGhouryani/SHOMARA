// Runs the approved path page's own geometry code (no DOM) and stores the result as a fixture, so the
// TypeScript geometry (apps/mobile/src/path/geometry.ts) is verified against the design's algorithm.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const page = fs.readFileSync(path.join(ROOT, 'docs/design-handoff-2026-10/pages-v1/05-path.html'), 'utf8');
const script = page.match(/<script>([\s\S]*?)<\/script>/)[1];
const start = script.indexOf('var CH=[');
const end = script.indexOf('function node(r)');
if (start < 0 || end < 0) throw new Error('path page script layout changed');
const geometry = script.slice(start, end);

const sandbox = { fa: (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]) };
vm.createContext(sandbox);
vm.runInContext(`(function(){ ${geometry}\n this.__out = { CH: CH, rows: rows, starts: starts, y: y, curY: curY }; }).call(this);`, sandbox);
const out = sandbox.__out;
const fixture = {
  source: 'docs/design-handoff-2026-10/pages-v1/05-path.html (geometry part of its script)',
  width: 390,
  totalHeightBeforeFooter: out.y,
  curY: out.curY,
  starts: out.starts,
  chapters: out.CH.map((c) => ({ t: c.t, title: c.title, k: c.k, tint: c.tint, done: c.done, cur: c.cur })),
  rows: out.rows,
};
fs.writeFileSync(path.join(ROOT, 'apps/mobile/src/path/__fixtures__/design-trail.json'), JSON.stringify(fixture, null, 1));
console.log(`fixture: ${fixture.rows.length} rows, curY=${fixture.curY}, height=${fixture.totalHeightBeforeFooter}, starts=${fixture.starts.join(',')}`);
