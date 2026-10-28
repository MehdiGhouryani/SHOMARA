#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(); const ok=m=>console.log('PASS  '+m); const fail=m=>{console.error('FAIL  '+m);process.exitCode=1;};
for (const rel of ['packages/contracts/src/p10-batch-c-depth.ts','supabase/migrations/0069_p10_batch_c_depth_content.sql']) {
  if (!fs.existsSync(path.join(root,rel))) fail('MISSING '+rel); else ok(rel);
}
const c=fs.readFileSync(path.join(root,'packages/contracts/src/p10-batch-c-depth.ts'),'utf8');
for (const m of ['ST11','ST15','G1-GAME-001']) { if (!c.includes(m)) fail(m); else ok(m); }
const mig=fs.readFileSync(path.join(root,'supabase/migrations/0069_p10_batch_c_depth_content.sql'),'utf8');
for (const m of ['content_versions','station_challenge_rounds','st11-ch-equal8-v1','st15-ch-group-v1']) {
  if (!mig.includes(m)) fail(m); else ok(m);
}
if ((mig.match(/260c0000/g)||[]).length < 45) fail('cv count'); else ok('cv');
if (process.exitCode) process.exit(1);
console.log('\nP10 Batch C depth: PASS');
