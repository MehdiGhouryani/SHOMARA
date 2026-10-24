#!/usr/bin/env node
/**
 * P06 static verifier — Mission Engine + Mission Hub surface.
 * Does not claim PASS; only checks that the implementation artifacts exist
 * and preserve BUILD_FIRST / V1 guardrails in source.
 */
import { isWaived, waiverNote } from './lib/path-waivers.mjs';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ok = (msg) => console.log(`PASS  ${msg}`);
const fail = (msg) => {
  console.error(`FAIL  ${msg}`);
  process.exitCode = 1;
};

const mustExist = [
  'packages/contracts/src/missions.ts',
  'packages/contracts/src/missions.test.ts',
  'packages/contracts/src/st01-slice.ts',
  'supabase/migrations/0058_mission_engine_hub.sql',
  'supabase/migrations/0057_st01_engagement_vertical_slice.sql',
  'apps/web/app/api/v1/missions/hub/route.ts',
  'apps/mobile/app/missions.tsx',
  'apps/mobile/app/(tabs)/index.tsx',
  'apps/mobile/src/station/runtimeApi.ts',
];

for (const rel of mustExist) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) fail(`MISSING: ${rel}`);
  else ok(`exists ${rel}`);
}

const missions = fs.readFileSync(path.join(root, 'packages/contracts/src/missions.ts'), 'utf8');
for (const marker of [
  'MISSION_ENGINE_VERSION',
  'selectDailyMissions',
  'applyMissionEvents',
  'buildMissionHubProjection',
  'setsMastery',
  'ST01_STATION_MISSION',
  'FORBIDDEN_MISSION_TRIGGERS',
]) {
  if (!missions.includes(marker)) fail(`missions.ts missing marker: ${marker}`);
  else ok(`missions.ts has ${marker}`);
}

const migration = fs.readFileSync(path.join(root, 'supabase/migrations/0058_mission_engine_hub.sql'), 'utf8');
for (const marker of [
  'mission_definitions_p06',
  'mission_instances_p06',
  'mission_receipts_p06',
  'mission_reward_grants_p06',
  'mission_sync',
  'mission_hub_projection',
  'GAME_COMPLETED',
  'SKILL_REVIEW_COMPLETED',
  'TRANSFER_COMPLETED',
  'bool_and',
  'grant execute on function public.mission_sync',
]) {
  if (!migration.includes(marker)) fail(`0058 missing marker: ${marker}`);
  else ok(`0058 has ${marker}`);
}

// Guardrail: clients must not write mission truth
if (!migration.includes('revoke insert, update, delete on public.mission_instances_p06 from authenticated')) {
  fail('0058 must revoke client writes on mission_instances_p06');
} else ok('0058 revokes client writes on instances');

const pathTab = fs.readFileSync(path.join(root, 'apps/mobile/app/(tabs)/index.tsx'), 'utf8');
if (isWaived('mission-hub-entry')) {
  ok(waiverNote('mission-hub-entry'));
} else if (!pathTab.includes("router.push('/missions')") && !pathTab.includes('router.push("/missions")')) {
  fail('Path tab must expose Mission Hub entry');
} else ok('Path tab has Mission Hub entry');

const tabs = fs.readFileSync(path.join(root, 'apps/mobile/app/(tabs)/_layout.tsx'), 'utf8');
if (tabs.includes('missions') && tabs.includes('Tabs.Screen')) {
  // missions must stay secondary, not a 4th primary tab
  const tabScreens = [...tabs.matchAll(/Tabs\.Screen name="([^"]+)"/g)].map((m) => m[1]);
  if (tabScreens.includes('missions')) fail('missions must not be a primary tab');
  else ok(`primary tabs remain: ${tabScreens.join(', ')}`);
} else {
  ok('tabs layout readable');
}

const hubRoute = fs.readFileSync(path.join(root, 'apps/web/app/api/v1/missions/hub/route.ts'), 'utf8');
if (!hubRoute.includes('mission_sync')) fail('hub route must call mission_sync RPC');
else ok('hub route calls mission_sync');

const roadmap = fs.readFileSync(path.join(root, 'ROADMAP_PHASES.md'), 'utf8');
if (!/P06 \| Mission Engine.*IMPLEMENTED/.test(roadmap)) fail('ROADMAP table must mark P06 IMPLEMENTED');
else ok('ROADMAP P06 IMPLEMENTED');
const next = (roadmap.match(/next_eligible_phase:\s*(P\d+)/) || [])[1];
if (!next || !['P07', 'P08', 'P09', 'P10', 'P11', 'P12', 'P13', 'P14'].includes(next)) fail('next_eligible_phase must be P07+ after P06');
else ok(`next_eligible_phase ${next}`);
if (!roadmap.includes('VD-009')) fail('VD-009 must be present for P06 deferred gates');
else ok('VD-009 present');

if (process.exitCode) {
  console.error('\nP06 static verification: FAIL');
  process.exit(1);
}
console.log('\nP06 static verification: PASS');
