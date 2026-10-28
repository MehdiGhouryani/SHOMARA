#!/usr/bin/env node
/**
 * Guards the P01 review prototype (prototypes/p01-engagement-review) so it stays a research
 * artifact and never becomes a back door for P04+ work before P01/P02 PASS
 * (ROADMAP_PHASES.md 13.1, PLAN_REVISION 2026-10-04).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const protoDir = join(root, 'prototypes', 'p01-engagement-review');
let failed = 0;
const ok = (m) => console.log(`PASS  ${m}`);
const fail = (m) => { failed++; console.log(`FAIL  ${m}`); };

if (!existsSync(join(protoDir, 'index.html')) || !existsSync(join(protoDir, 'README.md'))) {
  fail('prototype index.html + README.md exist');
  process.exit(1);
}
ok('prototype index.html + README.md exist');

// 1. No app/package code references the prototype.
const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.next' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|mjs|cjs|json|css)$/.test(name)) out.push(p);
  }
  return out;
};
const leaks = ['apps', 'packages']
  .filter((d) => existsSync(join(root, d)))
  .flatMap((d) => walk(join(root, d)))
  .filter((f) => /prototypes[\\/]|p01-engagement-review/.test(readFileSync(f, 'utf8')));
leaks.length ? fail(`apps/packages reference the prototype: ${leaks.map((f) => relative(root, f)).join(', ')}`) : ok('apps/ and packages/ never reference the prototype');

const html = readFileSync(join(protoDir, 'index.html'), 'utf8');
const script = (html.match(/<script>([\s\S]*?)<\/script>/) || [, ''])[1];

// 2. No network / backend calls.
/\bfetch\s*\(|XMLHttpRequest|WebSocket|supabase|\/api\/v1/i.test(script)
  ? fail('prototype makes no network/backend calls') : ok('prototype makes no network/backend calls');

// 3. Forbidden V1 economy/social mechanics (P01-D-02, P01-D-04, REJECT list).
const forbidden = [/💎/, /الماس/, /سکه/, /فروشگاه/, /leaderboard/i, /لیدربورد/, /lootbox|loot box/i];
const visibleCopy = script.replace(/صندوق شانسی، فروشگاه و الماس وجود ندارد/g, '').replace(/\/\/.*$/gm, '');
const hits = forbidden.filter((re) => re.test(visibleCopy));
hits.length ? fail(`forbidden economy/social copy present: ${hits.join(' ')}`) : ok('no gems/coins/store/leaderboard/loot boxes');

// 4. Primary nav stays three sections.
const nav = (html.match(/<nav class="nav"[\s\S]*?<\/nav>/) || [''])[0];
const tabs = (nav.match(/<button/g) || []).length;
tabs === 3 && /مسیر/.test(nav) && /تمرین/.test(nav) && /من/.test(nav)
  ? ok('primary nav stays مسیر / تمرین / من') : fail(`primary nav must be exactly 3 tabs (found ${tabs})`);

// 5. Clearly labelled as non-production.
/پروتوتایپ بازبینی P01/.test(html) && /به Learning Runtime وصل نیست/.test(html)
  ? ok('prototype is visibly labelled as research/demo-only') : fail('prototype banner missing');

console.log(`\nP01_PROTOTYPE_ISOLATION: ${failed === 0 ? 'PASS' : 'FAIL'}`);
process.exitCode = failed === 0 ? 0 : 1;
