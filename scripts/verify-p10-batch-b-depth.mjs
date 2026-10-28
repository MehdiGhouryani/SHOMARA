#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const ok = (m) => console.log(`PASS  ${m}`);
const fail = (m) => { console.error(`FAIL  ${m}`); process.exitCode = 1; };
for (const rel of [
  'packages/contracts/src/p10-batch-b-depth.ts',
  'packages/contracts/src/p10-batch-b-depth.test.ts',
  'supabase/migrations/0068_p10_batch_b_depth_content.sql',
]) {
  if (!fs.existsSync(path.join(root, rel))) fail(`MISSING ${rel}`); else ok(`exists ${rel}`);
}
const c = fs.readFileSync(path.join(root, 'packages/contracts/src/p10-batch-b-depth.ts'), 'utf8');
for (const m of ['ST06', 'ST07', 'ST08', 'ST09', 'ST10', 'G1-GAME-001']) {
  if (!c.includes(m)) fail(m); else ok(m);
}
const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0068_p10_batch_b_depth_content.sql'), 'utf8');
for (const m of ['content_versions', 'station_challenge_rounds', 'station_challenge_variants', 'st06-ch-counter-v1', 'st10-ch-num67-v1', 'G1-GAME-001']) {
  if (!mig.includes(m)) fail(`0068 ${m}`); else ok(`0068 ${m}`);
}
const n = (mig.match(/260b0000/g) || []).length;
if (n < 45) fail(`cv ids ${n}`); else ok(`cv ~${n}`);
if (process.exitCode) process.exit(1);
console.log('\nP10 Batch B depth verification: PASS');
