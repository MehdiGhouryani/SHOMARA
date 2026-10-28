#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(); const ok=m=>console.log('PASS  '+m); const fail=m=>{console.error('FAIL  '+m);process.exitCode=1;};
for (const rel of ['packages/contracts/src/p10-batch-d-depth.ts','supabase/migrations/0070_p10_batch_d_depth_content.sql']) {
  if (!fs.existsSync(path.join(root,rel))) fail('MISSING '+rel); else ok(rel);
}
const c=fs.readFileSync(path.join(root,'packages/contracts/src/p10-batch-d-depth.ts'),'utf8');
for (const m of ['ST16','ST20','G1-GAME-001']) { if (!c.includes(m)) fail(m); else ok(m); }
const mig=fs.readFileSync(path.join(root,'supabase/migrations/0070_p10_batch_d_depth_content.sql'),'utf8');
for (const m of ['content_versions','st16-ch-clock-v1','st20-ch-twodigit-v1']) { if (!mig.includes(m)) fail(m); else ok(m); }
if ((mig.match(/260d0000/g)||[]).length < 45) fail('cv'); else ok('cv');
if (process.exitCode) process.exit(1);
console.log('\nP10 Batch D depth: PASS');
