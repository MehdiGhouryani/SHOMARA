#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const ok = (m) => console.log(`PASS  ${m}`);
const fail = (m) => { console.error(`FAIL  ${m}`); process.exitCode = 1; };
for (const rel of [
  'packages/contracts/src/p10-batch-e-depth.ts',
  'supabase/migrations/0071_p10_batch_e_depth_content.sql',
]) {
  if (!fs.existsSync(path.join(root, rel))) fail(`MISSING ${rel}`); else ok(rel);
}
const c = fs.readFileSync(path.join(root, 'packages/contracts/src/p10-batch-e-depth.ts'), 'utf8');
for (const m of ['ST21', 'ST25', 'G1-GAME-001', 'playableDefinitionStations']) {
  if (!c.includes(m)) fail(m); else ok(m);
}
const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0071_p10_batch_e_depth_content.sql'), 'utf8');
for (const m of ['content_versions', 'st21-ch-hundred-table-v1', 'st25-ch-hundred-info-v1']) {
  if (!mig.includes(m)) fail(m); else ok(m);
}
if ((mig.match(/260e0000/g) || []).length < 45) fail('cv count'); else ok('cv');
// All depth migrations present
for (const f of ['0067', '0068', '0069', '0070', '0071']) {
  const files = fs.readdirSync(path.join(root, 'supabase/migrations')).filter((x) => x.startsWith(f));
  if (!files.length) fail(`missing mig ${f}`); else ok(`mig ${f}`);
}
const roadmap = fs.readFileSync(path.join(root, 'ROADMAP_PHASES.md'), 'utf8');
if (!roadmap.includes('Batch E depth') && !roadmap.includes('25/25 playable')) fail('roadmap depth E'); else ok('roadmap');
if (process.exitCode) process.exit(1);
console.log('\nP10 Batch E depth + handoff: PASS');
