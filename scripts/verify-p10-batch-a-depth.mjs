#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const ok = (m) => console.log(`PASS  ${m}`);
const fail = (m) => { console.error(`FAIL  ${m}`); process.exitCode = 1; };

for (const rel of [
  'packages/contracts/src/p10-batch-a-depth.ts',
  'packages/contracts/src/p10-batch-a-depth.test.ts',
  'supabase/migrations/0067_p10_batch_a_depth_content.sql',
]) {
  if (!fs.existsSync(path.join(root, rel))) fail(`MISSING ${rel}`); else ok(`exists ${rel}`);
}
const c = fs.readFileSync(path.join(root, 'packages/contracts/src/p10-batch-a-depth.ts'), 'utf8');
for (const m of ['P10_BATCH_A_DEPTH', 'G1-GAME-001', 'ST02', 'ST05', 'SUPPORTED', 'STRETCH']) {
  if (!c.includes(m)) fail(`contract ${m}`); else ok(m);
}
const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0067_p10_batch_a_depth_content.sql'), 'utf8');
for (const m of [
  'content_versions',
  'station_challenge_rounds',
  'station_challenge_variants',
  'G1-GAME-001',
  'st02-ch-position-v1',
  'st05-ch-addsub-v1',
]) {
  if (!mig.includes(m)) fail(`0067 ${m}`); else ok(`0067 ${m}`);
}
// count variant content rows roughly
const cvCount = (mig.match(/260a0000/g) || []).length;
if (cvCount < 36) fail(`expected >=36 content version ids, got ${cvCount}`); else ok(`content versions ~${cvCount}`);

if (process.exitCode) { console.error('\nP10 Batch A depth: FAIL'); process.exit(1); }
console.log('\nP10 Batch A depth verification: PASS');
