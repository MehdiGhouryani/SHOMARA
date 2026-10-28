/**
 * P10 Batch A — Signature Challenges for ST02–ST05.
 *
 * Production method (roadmap): Research → Content design → Implementation →
 * Evaluator QA → Educational review → Device smoke → batch gate.
 *
 * This module is the design + seed contract for Batch A only.
 * Full interactive round content (like ST01's rich variants) can deepen per station
 * without changing the challenge engine. Batch B+ are out of scope here.
 *
 * Guardrails: challenge ≠ mastery; PRACTICE_EVIDENCE; once-per-instance reward;
 * maps to real G1 skill codes only.
 */
import type { RewardType } from './engagement';
import type { ChallengeLearningRole } from './engagement-policy';

export const P10_BATCH_A_VERSION = '2026-10-05-p10-batch-a-v1' as const;
export const P10_BATCH_A_STATIONS = ['ST02', 'ST03', 'ST04', 'ST05'] as const;

export type P10BatchStationId = (typeof P10_BATCH_A_STATIONS)[number];

export interface P10ChallengeSeed {
  stationId: P10BatchStationId;
  stationUuidSuffix: string; // last 12 of station uuid pattern 21000000-...00000N
  code: string;
  gameCode: string;
  primarySkillIds: readonly string[];
  supportingSkillIds: readonly string[];
  objectiveFa: string;
  childCopyFa: string;
  learningRole: ChallengeLearningRole;
  rounds: 3;
  evaluatorVersion: string;
  rewardCode: string;
  rewardClass: Extract<RewardType, 'STICKER' | 'CHARACTER_REACTION' | 'WORLD_ELEMENT'>;
  /** Educational review gate — not auto-PASS. */
  educationalReview: 'PENDING_HUMAN_SIGN_OFF' | 'SIGNED_OFF';
  rtlA11yReview: 'PENDING' | 'DONE';
}

/**
 * Batch A matrix — skills chosen from 0035 seed graph to match station themes:
 * ST02 جایگاه و جهت → SK047/SK048
 * ST03 عدد و جمع → SK016/SK025/SK026
 * ST04 شکل‌ها → SK041/SK042/SK043
 * ST05 جمع و تفریق → SK026/SK031/SK032
 */
export const P10_BATCH_A_CHALLENGES: readonly P10ChallengeSeed[] = [
  {
    stationId: 'ST02',
    stationUuidSuffix: '000000000002',
    code: 'G1-ST02-CH-01',
    gameCode: 'G1-GAME-POSITION',
    primarySkillIds: ['G1-SK047', 'G1-SK048'],
    supportingSkillIds: ['G1-SK012'],
    objectiveFa: 'جای درست را در شبکه پیدا کن.',
    childCopyFa: 'دوستت گم شده؛ بگو کجاست: بالا، پایین، چپ یا راست؟',
    learningRole: 'REVIEW',
    rounds: 3,
    evaluatorVersion: 'st02-ch-position-v1',
    rewardCode: 'G1-R-ST02-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST03',
    stationUuidSuffix: '000000000003',
    code: 'G1-ST03-CH-01',
    gameCode: 'G1-GAME-COMPOSE',
    primarySkillIds: ['G1-SK025', 'G1-SK026'],
    supportingSkillIds: ['G1-SK016', 'G1-SK006'],
    objectiveFa: 'دو گروه را با هم جمع کن تا عدد هدف ساخته شود.',
    childCopyFa: 'مهره‌ها را کنار هم بگذار تا عدد درست شود.',
    learningRole: 'INDEPENDENT_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st03-ch-compose-v1',
    rewardCode: 'G1-R-ST03-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST04',
    stationUuidSuffix: '000000000004',
    code: 'G1-ST04-CH-01',
    gameCode: 'G1-GAME-SHAPE',
    primarySkillIds: ['G1-SK041', 'G1-SK043'],
    supportingSkillIds: ['G1-SK042'],
    objectiveFa: 'شکل درست را از روی ویژگی‌ها انتخاب کن.',
    childCopyFa: 'کدام شکل گوشه و ضلع مناسب دارد؟',
    learningRole: 'REVIEW',
    rounds: 3,
    evaluatorVersion: 'st04-ch-shape-v1',
    rewardCode: 'G1-R-ST04-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST05',
    stationUuidSuffix: '000000000005',
    code: 'G1-ST05-CH-01',
    gameCode: 'G1-GAME-ADDSUB',
    primarySkillIds: ['G1-SK026', 'G1-SK032'],
    supportingSkillIds: ['G1-SK031', 'G1-SK025'],
    objectiveFa: 'جمع یا تفریق کوچک را با مدل حل کن.',
    childCopyFa: 'چند تا مانده؟ یا چند تا با هم؟',
    learningRole: 'INDEPENDENT_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st05-ch-addsub-v1',
    rewardCode: 'G1-R-ST05-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
] as const;

export interface P10BatchProgress {
  batchId: 'A';
  stations: readonly P10BatchStationId[];
  definitionsSeeded: number;
  educationalSignOffs: number;
  deviceSmoke: 'PENDING' | 'DONE';
  /** Full P10 PASS requires all batches A–E. */
  batchGate: 'OPEN' | 'READY_FOR_REVIEW' | 'PASSED';
}

export function p10BatchAProgress(seeds: readonly P10ChallengeSeed[] = P10_BATCH_A_CHALLENGES): P10BatchProgress {
  const signOffs = seeds.filter((s) => s.educationalReview === 'SIGNED_OFF').length;
  return {
    batchId: 'A',
    stations: P10_BATCH_A_STATIONS,
    definitionsSeeded: seeds.length,
    educationalSignOffs: signOffs,
    deviceSmoke: 'PENDING',
    batchGate: signOffs === seeds.length ? 'READY_FOR_REVIEW' : 'OPEN',
  };
}

export function p10BatchAViolations(seeds: readonly P10ChallengeSeed[] = P10_BATCH_A_CHALLENGES): string[] {
  const v: string[] = [];
  const codes = new Set<string>();
  for (const s of seeds) {
    if (!P10_BATCH_A_STATIONS.includes(s.stationId)) v.push(`BAD_STATION:${s.stationId}`);
    if (codes.has(s.code)) v.push(`DUP_CODE:${s.code}`);
    codes.add(s.code);
    if (s.primarySkillIds.length < 1) v.push(`NO_PRIMARY:${s.code}`);
    if (!s.primarySkillIds.every((id) => id.startsWith('G1-SK'))) v.push(`BAD_SKILL:${s.code}`);
    if (s.rounds !== 3) v.push(`ROUNDS:${s.code}`);
  }
  if (seeds.length !== 4) v.push(`EXPECTED_4_GOT_${seeds.length}`);
  return v;
}

/** Coverage report for roadmap content matrix (Batch A rows only). */
export function p10BatchAContentMatrix(seeds: readonly P10ChallengeSeed[] = P10_BATCH_A_CHALLENGES) {
  return seeds.map((s) => ({
    station: s.stationId,
    primarySkillIds: s.primarySkillIds,
    supportingSkillIds: s.supportingSkillIds,
    gameTemplate: s.gameCode,
    challengeInstanceId: s.code,
    objective: s.objectiveFa,
    difficultyPolicy: 'STEP_ADAPTIVE',
    evaluatorVersion: s.evaluatorVersion,
    hintPolicy: 'STRATEGY→REPRESENTATION→WORKED_STEP',
    rewardPolicy: s.rewardCode,
    missionHooks: 'STATION_MISSION + DAILY GAME_COMPLETED',
    evidencePolicy: 'PRACTICE_EVIDENCE',
    childCopy: s.childCopyFa,
    rtlA11yReview: s.rtlA11yReview,
    educationalReview: s.educationalReview,
  }));
}
