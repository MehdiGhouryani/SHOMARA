#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const ok = (m) => console.log(`PASS  ${m}`);
const fail = (m) => { console.error(`FAIL  ${m}`); process.exitCode = 1; };
for (const rel of [
  'packages/contracts/src/p10-batch-b.ts',
  'packages/contracts/src/p10-batch-b.test.ts',
  'supabase/migrations/0063_p10_batch_b_challenges.sql',
]) {
  if (!fs.existsSync(path.join(root, rel))) fail(`MISSING ${rel}`);
  else ok(`exists ${rel}`);
}
const c = fs.readFileSync(path.join(root, 'packages/contracts/src/p10-batch-b.ts'), 'utf8');
for (const m of ['ST06', 'ST07', 'ST08', 'ST09', 'ST10', 'PENDING_HUMAN_SIGN_OFF']) {
  if (!c.includes(m)) fail(`contract missing ${m}`); else ok(`contract ${m}`);
}
const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0063_p10_batch_b_challenges.sql'), 'utf8');
for (const m of ['G1-ST06-CH-01', 'G1-ST10-CH-01', 'countsTowardMastery":false', 'G1-R-ST06-CH']) {
  if (!mig.includes(m)) fail(`0063 missing ${m}`); else ok(`0063 ${m}`);
}
const roadmap = fs.readFileSync(path.join(root, 'ROADMAP_PHASES.md'), 'utf8');
if (!roadmap.includes('Batch B')) fail('roadmap must mention Batch B'); else ok('roadmap Batch B');
if (!roadmap.includes('VD-014')) fail('VD-014 required'); else ok('VD-014 present');
if (process.exitCode) { console.error('\nP10 Batch B: FAIL'); process.exit(1); }
console.log('\nP10 Batch B static verification: PASS');
