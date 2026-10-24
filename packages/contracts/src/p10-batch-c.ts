/**
 * P10 Batch C — Signature Challenges for ST11–ST15 (Unit 3 / World 3).
 */
import type { RewardType } from './engagement';
import type { ChallengeLearningRole } from './engagement-policy';

export const P10_BATCH_C_VERSION = '2026-10-05-p10-batch-c-v1' as const;
export const P10_BATCH_C_STATIONS = ['ST11', 'ST12', 'ST13', 'ST14', 'ST15'] as const;

export type P10BatchCStationId = (typeof P10_BATCH_C_STATIONS)[number];

export interface P10BatchCChallengeSeed {
  stationId: P10BatchCStationId;
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
  educationalReview: 'PENDING_HUMAN_SIGN_OFF' | 'SIGNED_OFF';
  rtlA11yReview: 'PENDING' | 'DONE';
}

/**
 * ST11 equality & 8 → SK037, SK016
 * ST12 compare & 9 → SK036, SK035
 * ST13 plus sign & combinations → SK025, SK028, SK029
 * ST14 subtract & length → SK031, SK032, SK038
 * ST15 grouping / place value intro → SK021, SK022 (or SK023) — use SK021, SK006
 */
export const P10_BATCH_C_CHALLENGES: readonly P10BatchCChallengeSeed[] = [
  {
    stationId: 'ST11',
    code: 'G1-ST11-CH-01',
    gameCode: 'G1-GAME-EQUAL8',
    primarySkillIds: ['G1-SK037', 'G1-SK016'],
    supportingSkillIds: ['G1-SK035', 'G1-SK003'],
    objectiveFa: 'مجموعه‌های مساوی را پیدا کن و عدد ۸ را بشناس.',
    childCopyFa: 'کدام دو گروه با هم برابرند؟',
    learningRole: 'REVIEW',
    rounds: 3,
    evaluatorVersion: 'st11-ch-equal8-v1',
    rewardCode: 'G1-R-ST11-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST12',
    code: 'G1-ST12-CH-01',
    gameCode: 'G1-GAME-COMPARE9',
    primarySkillIds: ['G1-SK036', 'G1-SK035'],
    supportingSkillIds: ['G1-SK016', 'G1-SK001'],
    objectiveFa: 'عددها را مقایسه کن و عدد ۹ را بشناس.',
    childCopyFa: 'کدام بیشتر است؟ کمتر است؟',
    learningRole: 'INDEPENDENT_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st12-ch-compare9-v1',
    rewardCode: 'G1-R-ST12-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST13',
    code: 'G1-ST13-CH-01',
    gameCode: 'G1-GAME-PLUS',
    primarySkillIds: ['G1-SK025', 'G1-SK028'],
    supportingSkillIds: ['G1-SK029', 'G1-SK026'],
    objectiveFa: 'نشانهٔ جمع را به کار ببر و ترکیب عددی بساز.',
    childCopyFa: 'دو عدد را با + به هم وصل کن.',
    learningRole: 'GUIDED_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st13-ch-plus-v1',
    rewardCode: 'G1-R-ST13-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST14',
    code: 'G1-ST14-CH-01',
    gameCode: 'G1-GAME-SUBLEN',
    primarySkillIds: ['G1-SK031', 'G1-SK032'],
    supportingSkillIds: ['G1-SK038', 'G1-SK033'],
    objectiveFa: 'تفریق کن و طول‌ها را مقایسه کن.',
    childCopyFa: 'چند تا برداشته شد؟ کدام خط بلندتر است؟',
    learningRole: 'INDEPENDENT_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st14-ch-sublen-v1',
    rewardCode: 'G1-R-ST14-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST15',
    code: 'G1-ST15-CH-01',
    gameCode: 'G1-GAME-GROUP',
    primarySkillIds: ['G1-SK021', 'G1-SK006'],
    supportingSkillIds: ['G1-SK008', 'G1-SK020'],
    objectiveFa: 'گروه‌بندی کن و ارزش مکانی اولیه را ببین.',
    childCopyFa: 'ده‌تایی و یکی را جدا کن.',
    learningRole: 'REVIEW',
    rounds: 3,
    evaluatorVersion: 'st15-ch-group-v1',
    rewardCode: 'G1-R-ST15-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
] as const;

export function p10BatchCViolations(seeds: readonly P10BatchCChallengeSeed[] = P10_BATCH_C_CHALLENGES): string[] {
  const v: string[] = [];
  const codes = new Set<string>();
  for (const s of seeds) {
    if (!P10_BATCH_C_STATIONS.includes(s.stationId)) v.push(`BAD_STATION:${s.stationId}`);
    if (codes.has(s.code)) v.push(`DUP:${s.code}`);
    codes.add(s.code);
    if (s.primarySkillIds.length < 1) v.push(`NO_PRIMARY:${s.code}`);
  }
  if (seeds.length !== 5) v.push(`EXPECTED_5_GOT_${seeds.length}`);
  return v;
}

export function p10BatchCProgress(seeds: readonly P10BatchCChallengeSeed[] = P10_BATCH_C_CHALLENGES) {
  const signOffs = seeds.filter((s) => s.educationalReview === 'SIGNED_OFF').length;
  return {
    batchId: 'C' as const,
    stations: P10_BATCH_C_STATIONS,
    definitionsSeeded: seeds.length,
    educationalSignOffs: signOffs,
    deviceSmoke: 'PENDING' as const,
    batchGate: signOffs === seeds.length ? ('READY_FOR_REVIEW' as const) : ('OPEN' as const),
  };
}
