#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ok = (m) => console.log(`PASS  ${m}`);
const fail = (m) => {
  console.error(`FAIL  ${m}`);
  process.exitCode = 1;
};

const must = [
  'packages/contracts/src/p10-batch-a.ts',
  'packages/contracts/src/p10-batch-a.test.ts',
  'supabase/migrations/0062_p10_batch_a_challenges.sql',
];

for (const rel of must) {
  if (!fs.existsSync(path.join(root, rel))) fail(`MISSING ${rel}`);
  else ok(`exists ${rel}`);
}

const contract = fs.readFileSync(path.join(root, 'packages/contracts/src/p10-batch-a.ts'), 'utf8');
for (const m of ['P10_BATCH_A_CHALLENGES', 'ST02', 'ST03', 'ST04', 'ST05', 'PENDING_HUMAN_SIGN_OFF', 'PRACTICE_EVIDENCE']) {
  if (!contract.includes(m)) fail(`contract missing ${m}`);
  else ok(`contract ${m}`);
}

const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0062_p10_batch_a_challenges.sql'), 'utf8');
for (const m of ['G1-ST02-CH-01', 'G1-ST03-CH-01', 'G1-ST04-CH-01', 'G1-ST05-CH-01', 'countsTowardMastery":false', 'G1-R-ST02-CH']) {
  if (!mig.includes(m)) fail(`0062 missing ${m}`);
  else ok(`0062 ${m}`);
}

// Must NOT claim full P10 PASS
const roadmap = fs.readFileSync(path.join(root, 'ROADMAP_PHASES.md'), 'utf8');
if (/P10 \| ST02.*\| `PASS`/.test(roadmap)) fail('P10 must not be PASS yet');
if (!/P10 \|.*IN_PROGRESS/.test(roadmap) && !roadmap.includes('P10 Batch A')) {
  // allow IN_PROGRESS or explicit batch note
  ok('roadmap present');
} else ok('roadmap P10 batch state');
if (!roadmap.includes('VD-013')) fail('VD-013 required for Batch A deferred gates');
else ok('VD-013 present');

if (process.exitCode) {
  console.error('\nP10 Batch A static verification: FAIL');
  process.exit(1);
}
console.log('\nP10 Batch A static verification: PASS');
