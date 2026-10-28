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
  'packages/contracts/src/collection.ts',
  'packages/contracts/src/collection.test.ts',
  'supabase/migrations/0059_achievement_reward_collection.sql',
  'apps/web/app/api/v1/collection/route.ts',
];

for (const rel of must) {
  if (!fs.existsSync(path.join(root, rel))) fail(`MISSING ${rel}`);
  else ok(`exists ${rel}`);
}

const collection = fs.readFileSync(path.join(root, 'packages/contracts/src/collection.ts'), 'utf8');
for (const m of [
  'COLLECTION_ENGINE_VERSION',
  'G1_ACHIEVEMENT_CATALOG',
  'deriveAchievementUnlocks',
  'buildCollectionProjection',
  'impliesMastery: false',
  'ST01_ACHIEVEMENT',
  'setsMastery: false',
]) {
  if (!collection.includes(m)) fail(`collection.ts missing ${m}`);
  else ok(`collection.ts ${m}`);
}

const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0059_achievement_reward_collection.sql'), 'utf8');
for (const m of [
  'achievement_definitions_p07',
  'achievement_unlocks_p07',
  'collection_grant_presentations_p07',
  'collection_sync',
  'collection_projection',
  'collection_acknowledge_presentation',
  'revoke insert, update, delete on public.achievement_unlocks_p07',
  'setsMastery',
  'G1-ACH-CHALLENGE-001',
]) {
  if (!mig.includes(m)) fail(`0059 missing ${m}`);
  else ok(`0059 ${m}`);
}

const idx = fs.readFileSync(path.join(root, 'packages/contracts/src/index.ts'), 'utf8');
if (!idx.includes('collection')) fail('index must export collection');
else ok('index exports collection');

const roadmap = fs.readFileSync(path.join(root, 'ROADMAP_PHASES.md'), 'utf8');
if (!/P07 \| Achievement[\s\S]*IMPLEMENTED/.test(roadmap)) fail('ROADMAP must mark P07 IMPLEMENTED');
else ok('roadmap P07 IMPLEMENTED');
const next = (roadmap.match(/next_eligible_phase:\s*(P\d+)/) || [])[1];
if (!next || Number(next.slice(1)) < 8) fail('next_eligible_phase must be P08+');
else ok(`next_eligible_phase ${next}`);
if (!roadmap.includes('VD-010')) fail('VD-010 required');
else ok('VD-010 present');

if (process.exitCode) {
  console.error('\nP07 static verification: FAIL');
  process.exit(1);
}
console.log('\nP07 static verification: PASS');
