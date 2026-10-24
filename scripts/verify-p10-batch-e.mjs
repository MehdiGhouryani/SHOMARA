#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const ok = (m) => console.log(`PASS  ${m}`);
const fail = (m) => { console.error(`FAIL  ${m}`); process.exitCode = 1; };
for (const rel of [
  'packages/contracts/src/p10-batch-e.ts',
  'packages/contracts/src/p10-batch-e.test.ts',
  'supabase/migrations/0066_p10_batch_e_challenges.sql',
]) {
  if (!fs.existsSync(path.join(root, rel))) fail(`MISSING ${rel}`); else ok(`exists ${rel}`);
}
const c = fs.readFileSync(path.join(root, 'packages/contracts/src/p10-batch-e.ts'), 'utf8');
for (const m of ['ST21', 'ST22', 'ST23', 'ST24', 'ST25', 'totalStationChallengesSeeded', 'PENDING_HUMAN_SIGN_OFF']) {
  if (!c.includes(m)) fail(`missing ${m}`); else ok(m);
}
const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0066_p10_batch_e_challenges.sql'), 'utf8');
for (const m of ['G1-ST21-CH-01', 'G1-ST25-CH-01', 'countsTowardMastery":false']) {
  if (!mig.includes(m)) fail(`0066 ${m}`); else ok(`0066 ${m}`);
}
// All batch migrations present
for (const f of ['0062', '0063', '0064', '0065', '0066']) {
  const p = path.join(root, `supabase/migrations/${f}_p10_batch_${['a','b','c','d','e'][Number(f)-62]}_challenges.sql`);
  if (!fs.existsSync(p)) fail(`missing batch mig ${f}`); else ok(`mig ${f}`);
}
const roadmap = fs.readFileSync(path.join(root, 'ROADMAP_PHASES.md'), 'utf8');
if (!roadmap.includes('Batch E')) fail('roadmap Batch E'); else ok('roadmap Batch E');
if (!roadmap.includes('VD-017')) fail('VD-017'); else ok('VD-017');
// Must still be IN_PROGRESS not PASS
if (/P10 \|[^\n]*\| `PASS`/.test(roadmap)) fail('P10 must not be PASS yet'); else ok('P10 not falsely PASS');
if (process.exitCode) { console.error('\nP10 Batch E: FAIL'); process.exit(1); }
console.log('\nP10 Batch E static verification: PASS');
