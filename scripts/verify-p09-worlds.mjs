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
  'packages/contracts/src/worlds.ts',
  'packages/contracts/src/worlds.test.ts',
  'supabase/migrations/0061_world_progression.sql',
  'apps/web/app/api/v1/worlds/route.ts',
  'apps/mobile/app/(tabs)/index.tsx',
];

for (const rel of must) {
  if (!fs.existsSync(path.join(root, rel))) fail(`MISSING ${rel}`);
  else ok(`exists ${rel}`);
}

const contract = fs.readFileSync(path.join(root, 'packages/contracts/src/worlds.ts'), 'utf8');
for (const m of [
  'WORLD_ENGINE_VERSION',
  'G1_WORLDS',
  'buildWorldsProjection',
  'pathIsPrimarySurface',
  'setsMastery: false',
  'inventsLocalUnlocks: false',
  'isMasteryCheck: false',
]) {
  if (!contract.includes(m)) fail(`worlds.ts missing ${m}`);
  else ok(`worlds.ts ${m}`);
}

const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0061_world_progression.sql'), 'utf8');
for (const m of [
  'world_definitions_p09',
  'world_completions_p09',
  'worlds_projection',
  'pathIsPrimarySurface',
  'setsMastery',
  'revoke insert, update, delete on public.world_completions_p09',
]) {
  if (!mig.includes(m)) fail(`0061 missing ${m}`);
  else ok(`0061 ${m}`);
}

const pathUi = fs.readFileSync(path.join(root, 'apps/mobile/app/(tabs)/index.tsx'), 'utf8');
if (!pathUi.includes('worldByUnitId')) fail('Path UI must show world identity');
else ok('Path UI has world layer');
// Must not replace primary path route
if (pathUi.includes("name=\"worlds\"") && pathUi.includes('Tabs.Screen')) fail('worlds must not be primary tab');
else ok('Path remains primary surface');

const roadmap = fs.readFileSync(path.join(root, 'ROADMAP_PHASES.md'), 'utf8');
if (!/P09 \| World.*IMPLEMENTED/.test(roadmap)) fail('ROADMAP P09 must be IMPLEMENTED');
else ok('roadmap P09 IMPLEMENTED');
// P09 only requires that the roadmap has moved on to P10 or later (the pointer advances as later phases close).
if (!/next_eligible_phase:\s*P(1\d|[2-9]\d)\b/.test(roadmap)) fail('next_eligible_phase must be P10 or later');
else ok('next_eligible_phase is P10 or later');
if (!roadmap.includes('VD-012')) fail('VD-012 required');
else ok('VD-012 present');

if (process.exitCode) {
  console.error('\nP09 static verification: FAIL');
  process.exit(1);
}
console.log('\nP09 static verification: PASS');
