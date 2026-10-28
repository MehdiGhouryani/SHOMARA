import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const contract = read('packages/contracts/src/engagement.ts');
const roadmap = read('ROADMAP_PHASES.md');
const log = read('docs/qa/phase-logs/P01_product-game-research-design-lock.md');
const sourceSpec = read('docs/source/math_learning_product_game_engagement_quest_reward_v0_28_completed_v0_31.md');

const fail = (message) => { console.error(`FAIL: ${message}`); process.exitCode = 1; };
const ok = (message) => console.log(`PASS: ${message}`);

if (!/P01 \| Product\/Game research \+ design lock .*`IN_PROGRESS`/.test(roadmap)) fail('P01 is not marked IN_PROGRESS');
else ok('P01 lifecycle status is IN_PROGRESS');

const daily = contract.match(/export const DAILY_QUEST_SLOTS[^\n]*= \[\n([\s\S]*?)\n\] as const;/)?.[1] ?? '';
for (const slot of ['EASY_START', 'SKILL_BUILDER', 'MEANINGFUL_PROGRESS']) {
  if (!daily.includes(`'${slot}'`)) fail(`missing daily quest slot ${slot}`);
}
ok('three daily quest slots are encoded');

const gameCodes = [...contract.matchAll(/\{ code: '(G1-GAME-\d{3})'/g)].map((m) => m[1]);
if (new Set(gameCodes).size !== 14) fail(`expected 14 unique game catalog codes, found ${new Set(gameCodes).size}`);
else ok('14 unique reusable game templates are locked');

const stationMap = contract.match(/export const G1_STATION_GAME_BASELINE[^=]*= \{([\s\S]*?)\n\} as const;/)?.[1] ?? '';
const stationIds = [...stationMap.matchAll(/^\s*(ST\d{2}):/gm)].map((m) => m[1]);
if (new Set(stationIds).size !== 25) fail(`expected 25 station mappings, found ${new Set(stationIds).size}`);
else ok('all 25 stations have an experience mapping');

for (const forbidden of ['childLeaderboard: true', 'paidCurrency: true', 'tradeableCurrency: true', 'punitiveDailyStreak: true', 'loginOnlyRewards: true', 'timeOnlyRewards: true']) {
  if (contract.includes(forbidden)) fail(`forbidden V1 guardrail present: ${forbidden}`);
}
ok('forbidden V1 economy/social mechanics remain disabled');

if (!contract.includes("missionHubPlacement: 'PATH_ENTRY_CARD'")) fail('Mission Hub placement is not locked');
else ok('Mission Hub is locked as a secondary Path entry card');

if (!contract.includes("grade1UnitToWorldMapping: 'ONE_TO_ONE'")) fail('Grade 1 world mapping is not locked');
else ok('Grade 1 internal world model is locked as 5 units → 5 worlds');

const duplicate012 = (sourceSpec.match(/\| `G1-GAME-012` \|/g) ?? []).length;
if (duplicate012 !== 1) fail(`source spec contains ${duplicate012} copies of G1-GAME-012`);
else ok('source game catalog has no duplicate G1-GAME-012 row');

for (const required of ['RESEARCH_SOURCES', 'BORROW_DECISIONS', 'ADAPT_DECISIONS', 'REJECT_DECISIONS', 'OUT_OF_SCOPE_BACKLOG']) {
  if (!log.includes(required.split('_').join(' ')) && !log.includes(required)) fail(`phase log missing ${required}`);
}
ok('P01 phase log contains the required evidence sections');

// --- P01 design-lock completion (decisions A–G) -------------------------------
const policyPath = 'packages/contracts/src/engagement-policy.ts';
if (!fs.existsSync(path.join(root, policyPath))) fail('engagement-policy contract missing');
else {
  const policy = read(policyPath);
  const index = read('packages/contracts/src/index.ts');
  if (!index.includes("export * from './engagement-policy';")) fail('engagement-policy is not exported from @math/contracts');
  const register = policy.match(/export const P01_DECISION_REGISTER[^=]*= \[([\s\S]*?)\n\] as const;/)?.[1] ?? '';
  const entries = [...register.matchAll(/\{ id: '(P01-[A-G]-\d{2})'[^\n]*state: '(LOCKED|PROVISIONAL|OPEN|REJECTED)'([^\n]*)\}/g)];
  if (entries.length === 0) fail('P01 decision register is empty or unparsable');
  const areas = new Set(entries.map((m) => m[1].slice(4, 5)));
  for (const a of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) if (!areas.has(a)) fail(`decision area ${a} has no register entry`);
  const unscheduled = entries.filter((m) => (m[2] === 'OPEN' || m[2] === 'PROVISIONAL') && !/reviewAt: 'P\d{2}'/.test(m[3]));
  if (unscheduled.length) fail(`unscheduled OPEN/PROVISIONAL decisions: ${unscheduled.map((m) => m[1]).join(', ')}`);
  else ok(`decision register covers A–G (${entries.length} decisions); every OPEN/PROVISIONAL item has a review gate`);
  for (const lockedFlag of ["childFacingToken: 'NONE'", 'purchasable: false', 'randomized: false', 'premiumOnlyRewards: false', 'socialComparison: false', 'engagementContingent: false', 'starProgressIsSpendable: false']) {
    if (!policy.includes(lockedFlag)) fail(`reward economy flag missing: ${lockedFlag}`);
  }
  ok('reward economy decision is explicit (no token, no purchase, no randomness, no social comparison)');
  for (const flag of ['expiryIsFailure: false', 'expiryRemovesLearningProgress: false', 'expiryRemovesGrantedRewards: false', 'uiLocalProgressCanGrant: false']) {
    if (!policy.includes(flag)) fail(`mission policy flag missing: ${flag}`);
  }
  ok('mission completion/expiry semantics are non-punitive and server-authoritative');
  for (const flag of ['perStation: 1', 'stationCount: 25', 'targetDurationSec: { min: 30, max: 90 }', "allowedTimerPolicies: ['NONE', 'SOFT']", 'resultSetsMastery: false', 'reducesReward: false', 'replayGrants: false']) {
    if (!policy.includes(flag)) fail(`signature challenge rule missing: ${flag}`);
  }
  if (/'FAILED'/.test(policy.match(/export type ChallengeResult[^;]*;/)?.[0] ?? '')) fail('ChallengeResult must not contain FAILED');
  ok('25-station signature challenge rule is explicit (shape, timer, results, hint, reward)');
}

if (process.exitCode) process.exit(1);
