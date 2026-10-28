#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const ok = (m) => console.log(`PASS  ${m}`);
const fail = (m) => { console.error(`FAIL  ${m}`); process.exitCode = 1; };
for (const rel of ['packages/contracts/src/p10-batch-c.ts','packages/contracts/src/p10-batch-c.test.ts','supabase/migrations/0064_p10_batch_c_challenges.sql']) {
  if (!fs.existsSync(path.join(root, rel))) fail(`MISSING ${rel}`); else ok(`exists ${rel}`);
}
const c = fs.readFileSync(path.join(root, 'packages/contracts/src/p10-batch-c.ts'), 'utf8');
for (const m of ['ST11','ST12','ST13','ST14','ST15','PENDING_HUMAN_SIGN_OFF']) {
  if (!c.includes(m)) fail(`contract missing ${m}`); else ok(`contract ${m}`);
}
const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0064_p10_batch_c_challenges.sql'), 'utf8');
for (const m of ['G1-ST11-CH-01','G1-ST15-CH-01','countsTowardMastery":false','G1-R-ST11-CH']) {
  if (!mig.includes(m)) fail(`0064 missing ${m}`); else ok(`0064 ${m}`);
}
const roadmap = fs.readFileSync(path.join(root, 'ROADMAP_PHASES.md'), 'utf8');
if (!roadmap.includes('Batch C')) fail('roadmap Batch C'); else ok('roadmap Batch C');
if (!roadmap.includes('VD-015')) fail('VD-015'); else ok('VD-015');
if (process.exitCode) { console.error('\nP10 Batch C: FAIL'); process.exit(1); }
console.log('\nP10 Batch C static verification: PASS');
