#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const ok = (m) => console.log(`PASS  ${m}`);
const fail = (m) => { console.error(`FAIL  ${m}`); process.exitCode = 1; };
for (const rel of ['packages/contracts/src/p10-batch-d.ts','packages/contracts/src/p10-batch-d.test.ts','supabase/migrations/0065_p10_batch_d_challenges.sql']) {
  if (!fs.existsSync(path.join(root, rel))) fail(`MISSING ${rel}`); else ok(`exists ${rel}`);
}
const c = fs.readFileSync(path.join(root, 'packages/contracts/src/p10-batch-d.ts'), 'utf8');
for (const m of ['ST16','ST17','ST18','ST19','ST20','PENDING_HUMAN_SIGN_OFF']) {
  if (!c.includes(m)) fail(`missing ${m}`); else ok(m);
}
const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0065_p10_batch_d_challenges.sql'), 'utf8');
for (const m of ['G1-ST16-CH-01','G1-ST20-CH-01','countsTowardMastery":false']) {
  if (!mig.includes(m)) fail(`0065 ${m}`); else ok(`0065 ${m}`);
}
const roadmap = fs.readFileSync(path.join(root, 'ROADMAP_PHASES.md'), 'utf8');
if (!roadmap.includes('Batch D')) fail('roadmap'); else ok('roadmap');
if (!roadmap.includes('VD-016')) fail('VD-016'); else ok('VD-016');
if (process.exitCode) process.exit(1);
console.log('\nP10 Batch D static verification: PASS');
