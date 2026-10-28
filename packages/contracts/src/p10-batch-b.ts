/**
 * P10 Batch B — Signature Challenges for ST06–ST10 (Unit 2 / World 2).
 * Same production method as Batch A. Educational review remains human-gated.
 */
import type { RewardType } from './engagement';
import type { ChallengeLearningRole } from './engagement-policy';

export const P10_BATCH_B_VERSION = '2026-10-05-p10-batch-b-v1' as const;
export const P10_BATCH_B_STATIONS = ['ST06', 'ST07', 'ST08', 'ST09', 'ST10'] as const;

export type P10BatchBStationId = (typeof P10_BATCH_B_STATIONS)[number];

export interface P10BatchBChallengeSeed {
  stationId: P10BatchBStationId;
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
 * Skill mapping (0035 graph):
 * ST06 counters add/sub → SK026, SK032, SK005
 * ST07 numbers 1–2 → SK016, SK001, SK035
 * ST08 numbers 3–4 + height → SK016, SK038, SK001
 * ST09 zero, 5, symmetry → SK016, SK045, SK004
 * ST10 numbers 6–7 compare → SK016, SK035, SK036
 */
export const P10_BATCH_B_CHALLENGES: readonly P10BatchBChallengeSeed[] = [
  {
    stationId: 'ST06',
    code: 'G1-ST06-CH-01',
    gameCode: 'G1-GAME-COUNTER',
    primarySkillIds: ['G1-SK026', 'G1-SK032'],
    supportingSkillIds: ['G1-SK005', 'G1-SK006'],
    objectiveFa: 'با مهره و شمارنده جمع یا تفریق کوچک را حل کن.',
    childCopyFa: 'مهره‌ها را جابه‌جا کن تا جواب درست شود.',
    learningRole: 'GUIDED_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st06-ch-counter-v1',
    rewardCode: 'G1-R-ST06-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST07',
    code: 'G1-ST07-CH-01',
    gameCode: 'G1-GAME-NUM12',
    primarySkillIds: ['G1-SK016', 'G1-SK001'],
    supportingSkillIds: ['G1-SK035', 'G1-SK003'],
    objectiveFa: 'عددهای ۱ و ۲ را بشناس، بساز و مقایسه کن.',
    childCopyFa: 'کدام گروه یکی دارد؟ کدام دو تا؟',
    learningRole: 'REVIEW',
    rounds: 3,
    evaluatorVersion: 'st07-ch-num12-v1',
    rewardCode: 'G1-R-ST07-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST08',
    code: 'G1-ST08-CH-01',
    gameCode: 'G1-GAME-NUM34',
    primarySkillIds: ['G1-SK016', 'G1-SK038'],
    supportingSkillIds: ['G1-SK001', 'G1-SK004'],
    objectiveFa: 'عددهای ۳ و ۴ را بشناس و قد/طول را مقایسه کن.',
    childCopyFa: 'کدام بلندتر است؟ چند تا می‌بینی؟',
    learningRole: 'INDEPENDENT_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st08-ch-num34-v1',
    rewardCode: 'G1-R-ST08-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST09',
    code: 'G1-ST09-CH-01',
    gameCode: 'G1-GAME-ZERO5',
    primarySkillIds: ['G1-SK016', 'G1-SK045'],
    supportingSkillIds: ['G1-SK004', 'G1-SK046'],
    objectiveFa: 'صفر و ۵ را بشناس و تقارن ساده را کامل کن.',
    childCopyFa: 'نیمه‌ی دیگر شکل را پیدا کن؛ یا بگو کجا هیچی نیست.',
    learningRole: 'REVIEW',
    rounds: 3,
    evaluatorVersion: 'st09-ch-zero5-v1',
    rewardCode: 'G1-R-ST09-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST10',
    code: 'G1-ST10-CH-01',
    gameCode: 'G1-GAME-NUM67',
    primarySkillIds: ['G1-SK016', 'G1-SK035'],
    supportingSkillIds: ['G1-SK036', 'G1-SK001'],
    objectiveFa: 'عددهای ۶ و ۷ را بشناس و مجموعه‌ها را مقایسه کن.',
    childCopyFa: 'کدام بیشتر است؟ شش یا هفت؟',
    learningRole: 'INDEPENDENT_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st10-ch-num67-v1',
    rewardCode: 'G1-R-ST10-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
] as const;

export function p10BatchBViolations(seeds: readonly P10BatchBChallengeSeed[] = P10_BATCH_B_CHALLENGES): string[] {
  const v: string[] = [];
  const codes = new Set<string>();
  for (const s of seeds) {
    if (!P10_BATCH_B_STATIONS.includes(s.stationId)) v.push(`BAD_STATION:${s.stationId}`);
    if (codes.has(s.code)) v.push(`DUP:${s.code}`);
    codes.add(s.code);
    if (s.primarySkillIds.length < 1) v.push(`NO_PRIMARY:${s.code}`);
    if (s.rounds !== 3) v.push(`ROUNDS:${s.code}`);
  }
  if (seeds.length !== 5) v.push(`EXPECTED_5_GOT_${seeds.length}`);
  return v;
}

export function p10BatchBProgress(seeds: readonly P10BatchBChallengeSeed[] = P10_BATCH_B_CHALLENGES) {
  const signOffs = seeds.filter((s) => s.educationalReview === 'SIGNED_OFF').length;
  return {
    batchId: 'B' as const,
    stations: P10_BATCH_B_STATIONS,
    definitionsSeeded: seeds.length,
    educationalSignOffs: signOffs,
    deviceSmoke: 'PENDING' as const,
    batchGate: signOffs === seeds.length ? ('READY_FOR_REVIEW' as const) : ('OPEN' as const),
  };
}

export function p10BatchBContentMatrix(seeds: readonly P10BatchBChallengeSeed[] = P10_BATCH_B_CHALLENGES) {
  return seeds.map((s) => ({
    station: s.stationId,
    primarySkillIds: s.primarySkillIds,
    supportingSkillIds: s.supportingSkillIds,
    gameTemplate: s.gameCode,
    challengeInstanceId: s.code,
    objective: s.objectiveFa,
    evaluatorVersion: s.evaluatorVersion,
    rewardPolicy: s.rewardCode,
    evidencePolicy: 'PRACTICE_EVIDENCE' as const,
    educationalReview: s.educationalReview,
  }));
}
