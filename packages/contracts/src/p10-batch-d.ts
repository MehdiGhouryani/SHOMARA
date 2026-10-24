/**
 * P10 Batch D — Signature Challenges for ST16–ST20 (Unit 4 / World 4).
 */
import type { RewardType } from './engagement';
import type { ChallengeLearningRole } from './engagement-policy';

export const P10_BATCH_D_VERSION = '2026-10-05-p10-batch-d-v1' as const;
export const P10_BATCH_D_STATIONS = ['ST16', 'ST17', 'ST18', 'ST19', 'ST20'] as const;

export type P10BatchDStationId = (typeof P10_BATCH_D_STATIONS)[number];

export interface P10BatchDChallengeSeed {
  stationId: P10BatchDStationId;
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

export const P10_BATCH_D_CHALLENGES: readonly P10BatchDChallengeSeed[] = [
  {
    stationId: 'ST16',
    code: 'G1-ST16-CH-01',
    gameCode: 'G1-GAME-CLOCK',
    primarySkillIds: ['G1-SK052', 'G1-SK016'],
    supportingSkillIds: ['G1-SK053', 'G1-SK007'],
    objectiveFa: 'ساعت دقیق را بخوان و عددهای ۱۰ تا ۲۰ را بشناس.',
    childCopyFa: 'ساعت چند را نشان می‌دهد؟',
    learningRole: 'REVIEW',
    rounds: 3,
    evaluatorVersion: 'st16-ch-clock-v1',
    rewardCode: 'G1-R-ST16-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST17',
    code: 'G1-ST17-CH-01',
    gameCode: 'G1-GAME-MULTIADD',
    primarySkillIds: ['G1-SK030', 'G1-SK027'],
    supportingSkillIds: ['G1-SK025', 'G1-SK006'],
    objectiveFa: 'جمع چندبخشی و تقریب ساده را انجام بده.',
    childCopyFa: 'چند گروه را با هم جمع کن.',
    learningRole: 'INDEPENDENT_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st17-ch-multiadd-v1',
    rewardCode: 'G1-R-ST17-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST18',
    code: 'G1-ST18-CH-01',
    gameCode: 'G1-GAME-PATTERN-TIME',
    primarySkillIds: ['G1-SK013', 'G1-SK054'],
    supportingSkillIds: ['G1-SK052', 'G1-SK011'],
    objectiveFa: 'الگوی عددی را ادامه بده و زمان را بخوان.',
    childCopyFa: 'الگو را کامل کن؛ ساعت را بگو.',
    learningRole: 'REVIEW',
    rounds: 3,
    evaluatorVersion: 'st18-ch-pattern-time-v1',
    rewardCode: 'G1-R-ST18-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST19',
    code: 'G1-ST19-CH-01',
    gameCode: 'G1-GAME-TENS-BUY',
    primarySkillIds: ['G1-SK021', 'G1-SK057'],
    supportingSkillIds: ['G1-SK026', 'G1-SK008'],
    objectiveFa: 'با ده‌تایی‌ها مسئلهٔ خرید ساده را حل کن.',
    childCopyFa: 'چند ده‌تایی برای خرید لازم است؟',
    learningRole: 'GUIDED_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st19-ch-tens-buy-v1',
    rewardCode: 'G1-R-ST19-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST20',
    code: 'G1-ST20-CH-01',
    gameCode: 'G1-GAME-TWODIGIT',
    primarySkillIds: ['G1-SK023', 'G1-SK022'],
    supportingSkillIds: ['G1-SK020', 'G1-SK021'],
    objectiveFa: 'عدد دو رقمی را با ارزش مکانی بساز و بخوان.',
    childCopyFa: 'ده‌تایی و یکی را کنار هم بگذار.',
    learningRole: 'INDEPENDENT_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st20-ch-twodigit-v1',
    rewardCode: 'G1-R-ST20-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
] as const;

export function p10BatchDViolations(seeds: readonly P10BatchDChallengeSeed[] = P10_BATCH_D_CHALLENGES): string[] {
  const v: string[] = [];
  const codes = new Set<string>();
  for (const s of seeds) {
    if (!P10_BATCH_D_STATIONS.includes(s.stationId)) v.push(`BAD_STATION:${s.stationId}`);
    if (codes.has(s.code)) v.push(`DUP:${s.code}`);
    codes.add(s.code);
    if (s.primarySkillIds.length < 1) v.push(`NO_PRIMARY:${s.code}`);
  }
  if (seeds.length !== 5) v.push(`EXPECTED_5_GOT_${seeds.length}`);
  return v;
}

export function p10BatchDProgress(seeds: readonly P10BatchDChallengeSeed[] = P10_BATCH_D_CHALLENGES) {
  const signOffs = seeds.filter((s) => s.educationalReview === 'SIGNED_OFF').length;
  return {
    batchId: 'D' as const,
    stations: P10_BATCH_D_STATIONS,
    definitionsSeeded: seeds.length,
    educationalSignOffs: signOffs,
    deviceSmoke: 'PENDING' as const,
    batchGate: signOffs === seeds.length ? ('READY_FOR_REVIEW' as const) : ('OPEN' as const),
  };
}
