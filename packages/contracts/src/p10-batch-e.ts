/**
 * P10 Batch E — Signature Challenges for ST21–ST25 (Unit 5 / World 5).
 * Final content batch for Signature Challenge seed coverage (ST01 already in P05).
 */
import type { RewardType } from './engagement';
import type { ChallengeLearningRole } from './engagement-policy';

export const P10_BATCH_E_VERSION = '2026-10-05-p10-batch-e-v1' as const;
export const P10_BATCH_E_STATIONS = ['ST21', 'ST22', 'ST23', 'ST24', 'ST25'] as const;

export type P10BatchEStationId = (typeof P10_BATCH_E_STATIONS)[number];

export interface P10BatchEChallengeSeed {
  stationId: P10BatchEStationId;
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

export const P10_BATCH_E_CHALLENGES: readonly P10BatchEChallengeSeed[] = [
  {
    stationId: 'ST21',
    code: 'G1-ST21-CH-01',
    gameCode: 'G1-GAME-HUNDRED-TABLE',
    primarySkillIds: ['G1-SK023', 'G1-SK049'],
    supportingSkillIds: ['G1-SK007', 'G1-SK050'],
    objectiveFa: 'در جدول عددها حرکت کن و اندازه بگیر.',
    childCopyFa: 'عدد را در جدول پیدا کن؛ طول را با واحد بشمار.',
    learningRole: 'REVIEW',
    rounds: 3,
    evaluatorVersion: 'st21-ch-hundred-table-v1',
    rewardCode: 'G1-R-ST21-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST22',
    code: 'G1-ST22-CH-01',
    gameCode: 'G1-GAME-CALENDAR',
    primarySkillIds: ['G1-SK056', 'G1-SK008'],
    supportingSkillIds: ['G1-SK013', 'G1-SK055'],
    objectiveFa: 'تقویم را بخوان و الگوی شمارش را ادامه بده.',
    childCopyFa: 'فردا چه روزی است؟ الگو را کامل کن.',
    learningRole: 'GUIDED_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st22-ch-calendar-v1',
    rewardCode: 'G1-R-ST22-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST23',
    code: 'G1-ST23-CH-01',
    gameCode: 'G1-GAME-GROUP-COUNT',
    primarySkillIds: ['G1-SK008', 'G1-SK057'],
    supportingSkillIds: ['G1-SK006', 'G1-SK030'],
    objectiveFa: 'شمارش ۵تایی و ۸تایی را در مسئله به کار ببر.',
    childCopyFa: 'گروه‌گروه بشمار تا جواب را پیدا کنی.',
    learningRole: 'INDEPENDENT_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st23-ch-group-count-v1',
    rewardCode: 'G1-R-ST23-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST24',
    code: 'G1-ST24-CH-01',
    gameCode: 'G1-GAME-MULTI-STEP',
    primarySkillIds: ['G1-SK062', 'G1-SK055'],
    supportingSkillIds: ['G1-SK057', 'G1-SK058'],
    objectiveFa: 'مسئلهٔ چندمرحله‌ای و زمان تقریبی را حل کن.',
    childCopyFa: 'اول این کار، بعد آن کار؛ حدوداً چقدر طول می‌کشد؟',
    learningRole: 'INDEPENDENT_PRACTICE',
    rounds: 3,
    evaluatorVersion: 'st24-ch-multi-step-v1',
    rewardCode: 'G1-R-ST24-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
  {
    stationId: 'ST25',
    code: 'G1-ST25-CH-01',
    gameCode: 'G1-GAME-HUNDRED-INFO',
    primarySkillIds: ['G1-SK024', 'G1-SK061'],
    supportingSkillIds: ['G1-SK023', 'G1-SK064'],
    objectiveFa: 'عدد ۱۰۰ را بشناس و بگو اطلاعات مسئله کافی است یا نه.',
    childCopyFa: 'آیا همهٔ چیزهایی که لازم داری را داری؟',
    learningRole: 'TRANSFER',
    rounds: 3,
    evaluatorVersion: 'st25-ch-hundred-info-v1',
    rewardCode: 'G1-R-ST25-CH',
    rewardClass: 'STICKER',
    educationalReview: 'PENDING_HUMAN_SIGN_OFF',
    rtlA11yReview: 'PENDING',
  },
] as const;

export function p10BatchEViolations(seeds: readonly P10BatchEChallengeSeed[] = P10_BATCH_E_CHALLENGES): string[] {
  const v: string[] = [];
  const codes = new Set<string>();
  for (const s of seeds) {
    if (!P10_BATCH_E_STATIONS.includes(s.stationId)) v.push(`BAD_STATION:${s.stationId}`);
    if (codes.has(s.code)) v.push(`DUP:${s.code}`);
    codes.add(s.code);
    if (s.primarySkillIds.length < 1) v.push(`NO_PRIMARY:${s.code}`);
  }
  if (seeds.length !== 5) v.push(`EXPECTED_5_GOT_${seeds.length}`);
  return v;
}

export function p10BatchEProgress(seeds: readonly P10BatchEChallengeSeed[] = P10_BATCH_E_CHALLENGES) {
  const signOffs = seeds.filter((s) => s.educationalReview === 'SIGNED_OFF').length;
  return {
    batchId: 'E' as const,
    stations: P10_BATCH_E_STATIONS,
    definitionsSeeded: seeds.length,
    educationalSignOffs: signOffs,
    deviceSmoke: 'PENDING' as const,
    batchGate: signOffs === seeds.length ? ('READY_FOR_REVIEW' as const) : ('OPEN' as const),
  };
}

/** Aggregate coverage after all batches A–E (+ ST01 from P05). */
export function p10SignatureCoverageSummary() {
  return {
    st01FromP05: true,
    batchA: 4,
    batchB: 5,
    batchC: 5,
    batchD: 5,
    batchE: 5,
    totalStationChallengesSeeded: 1 + 4 + 5 + 5 + 5 + 5, // 25
    educationalSignOffComplete: false,
    deviceSmokeComplete: false,
    p10Status: 'IN_PROGRESS' as const,
    note: 'All 25 stations have Signature Challenge definition seeds; PASS requires human review + device smoke per batch.',
  };
}
