/**
 * P10 depth — Batch A (ST02–ST05). Phase 4: answer-position rebalanced (v2).
 * 3 rounds × SUPPORTED/CORE/STRETCH. Runtime template: G1-GAME-001 (MULTIPLE_CHOICE).
 * Presentation is client-safe (no answer key). Correctness lives in evaluator_config on server.
 */
export const P10_BATCH_A_DEPTH_VERSION = '2026-10-06-p10-batch-a-depth-v2' as const;

export type DepthLevel = 'SUPPORTED' | 'CORE' | 'STRETCH';

export interface DepthVariantPresentation {
  level: DepthLevel;
  promptFa: string;
  titleFa: string;
  optionsFa: readonly string[];
  /** Sequence / display tokens for the stem (not the answer key). */
  display: string;
  /** Server-only index into optionsFa — documented for migration authoring; never ship to client APIs as truth. */
  expectedOptionIndex: number;
}

export interface DepthRoundSeed {
  roundIndex: number;
  skillId: string;
  variants: readonly DepthVariantPresentation[];
}

export interface DepthChallengeSeed {
  stationId: 'ST02' | 'ST03' | 'ST04' | 'ST05';
  code: string;
  definitionId: string;
  gameCode: 'G1-GAME-001';
  evaluatorVersion: string;
  rounds: readonly DepthRoundSeed[];
}

export const P10_BATCH_A_DEPTH: readonly DepthChallengeSeed[] = [
  {
    stationId: 'ST02',
    code: 'G1-ST02-CH-01',
    definitionId: '2f0a0000-0000-4000-8000-000000000002',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st02-ch-position-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK047',
        variants: [
          { level: 'SUPPORTED', promptFa: 'توپ کجاست؟', titleFa: 'بالا یا پایین', display: 'توپ روی قفسهٔ بالا', optionsFa: ['بالا', 'پایین'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'گربه نسبت به جعبه کجاست؟', titleFa: 'چپ یا راست', display: 'گربه سمت چپ جعبه', optionsFa: ['چپ', 'راست', 'روی جعبه'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: 'پرنده کجای درخت است؟', titleFa: 'موقعیت', display: 'پرنده بین دو شاخه', optionsFa: ['بین', 'پشت', 'زیر', 'جلو'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK048',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام یکی وسط است؟', titleFa: 'ردیف', display: '★ ○ ★', optionsFa: ['وسط', 'اول'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کدام صندلی کنار در است؟', titleFa: 'کنار', display: 'در | صندلی | میز', optionsFa: ['میز', 'پنجره', 'صندلی'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: 'کدام خانه در ردیف دوم و ستون اول است؟', titleFa: 'جدول', display: 'جدول ۲×۲', optionsFa: ['خانهٔ بالا-راست', 'وسط', 'خانهٔ پایین-چپ', 'بیرون جدول'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK047',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کفش‌ها کجایند؟', titleFa: 'زیر یا رو', display: 'کفش زیر نیمکت', optionsFa: ['زیر', 'رو'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کیف نسبت به صندلی کجاست؟', titleFa: 'پشت / جلو', display: 'کیف پشت صندلی', optionsFa: ['جلو', 'پشت', 'روی صندلی'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'کدام راه به در می‌رسد؟', titleFa: 'مسیر شبکه', display: 'شبکه ساده ۳ خانه', optionsFa: ['راست-راست', 'چپ-بالا', 'پایین-پایین', 'همان‌جا'], expectedOptionIndex: 0 },
        ],
      },
    ],
  },
  {
    stationId: 'ST03',
    code: 'G1-ST03-CH-01',
    definitionId: '2f0a0000-0000-4000-8000-000000000003',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st03-ch-compose-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK025',
        variants: [
          { level: 'SUPPORTED', promptFa: '۲ و ۱ با هم چند تا می‌شوند؟', titleFa: 'جمع کوچک', display: '●● + ●', optionsFa: ['۲', '۳'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۳ و ۲ با هم چند تا؟', titleFa: 'جمع', display: '●●● + ●●', optionsFa: ['۴', '۵', '۶'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: '۴ و ۳ با هم چند تا؟', titleFa: 'جمع', display: '•••• + •••', optionsFa: ['۶', '۷', '۸', '۵'], expectedOptionIndex: 1 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK026',
        variants: [
          { level: 'SUPPORTED', promptFa: 'برای ساختن ۴، کدام جفت درست است؟', titleFa: 'ترکیب', display: 'هدف: ۴', optionsFa: ['۱ و ۱', '۲ و ۲'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'برای ساختن ۵ کدام جفت؟', titleFa: 'ترکیب', display: 'هدف: ۵', optionsFa: ['۳ و ۲', '۲ و ۲', '۱ و ۱'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: 'برای ساختن ۶ کدام جفت؟', titleFa: 'ترکیب', display: 'هدف: ۶', optionsFa: ['۱ و ۴', '۲ و ۲', '۵ و ۵', '۳ و ۳'], expectedOptionIndex: 3 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK016',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام عدد «چهار» است؟', titleFa: 'نماد', display: '۴', optionsFa: ['۲', '۴'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'کدام نماد برای پنج است؟', titleFa: 'نماد', display: 'پنج مهره', optionsFa: ['۳', '۶', '۵'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: 'کدام درست است؟', titleFa: 'نماد و کمیت', display: '●●●●●●', optionsFa: ['۵', '۶', '۷', '۴'], expectedOptionIndex: 1 },
        ],
      },
    ],
  },
  {
    stationId: 'ST04',
    code: 'G1-ST04-CH-01',
    definitionId: '2f0a0000-0000-4000-8000-000000000004',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st04-ch-shape-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK041',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام دایره است؟', titleFa: 'شکل', display: '○ △ □', optionsFa: ['دایره', 'مثلث'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کدام مربع است؟', titleFa: 'شکل', display: '△ □ ○', optionsFa: ['مثلث', 'دایره', 'مربع'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: 'کدام مستطیل است؟', titleFa: 'شکل', display: 'اشکال مخلوط', optionsFa: ['مربع', 'مثلث', 'مستطیل', 'دایره'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK042',
        variants: [
          { level: 'SUPPORTED', promptFa: 'مثلث چند گوشه دارد؟', titleFa: 'گوشه', display: '△', optionsFa: ['۳', '۴'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'مربع چند ضلع دارد؟', titleFa: 'ضلع', display: '□', optionsFa: ['۳', '۴', '۵'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'کدام شکل ۴ گوشه دارد؟', titleFa: 'ویژگی', display: '△ ○ □', optionsFa: ['مربع', 'مثلث', 'دایره', 'هیچکدام'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK043',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام مثل بقیه نیست؟', titleFa: 'گروه', display: '○ ○ △', optionsFa: ['مثلث', 'دایره'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کدام‌ها هم‌خانواده‌اند؟', titleFa: 'رده‌بندی', display: '□ مستطیل ○', optionsFa: ['مربع و مستطیل', 'دایره و مربع', 'همه'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: 'کدام شکل گوشه ندارد؟', titleFa: 'ویژگی', display: 'اشکال', optionsFa: ['مثلث', 'مربع', 'دایره', 'مستطیل'], expectedOptionIndex: 2 },
        ],
      },
    ],
  },
  {
    stationId: 'ST05',
    code: 'G1-ST05-CH-01',
    definitionId: '2f0a0000-0000-4000-8000-000000000005',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st05-ch-addsub-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK026',
        variants: [
          { level: 'SUPPORTED', promptFa: '۳ تا بود، ۱ تا اضافه شد. چند تا؟', titleFa: 'جمع', display: '●●● + ●', optionsFa: ['۳', '۴'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۲ + ۳ چند می‌شود؟', titleFa: 'جمع', display: '۲ + ۳', optionsFa: ['۵', '۴', '۶'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: '۴ + ۲ چند؟', titleFa: 'جمع', display: '۴ + ۲', optionsFa: ['۵', '۷', '۸', '۶'], expectedOptionIndex: 3 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK032',
        variants: [
          { level: 'SUPPORTED', promptFa: '۴ تا بود، ۱ تا برداشتیم. چند تا ماند؟', titleFa: 'تفریق', display: '●●●● − ●', optionsFa: ['۴', '۳'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۵ − ۲ چند؟', titleFa: 'تفریق', display: '۵ − ۲', optionsFa: ['۲', '۴', '۳'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: '۶ − ۳ چند؟', titleFa: 'تفریق', display: '۶ − ۳', optionsFa: ['۲', '۳', '۴', '۵'], expectedOptionIndex: 1 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK031',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام یعنی کم کردن؟', titleFa: 'معنی', display: 'برداشتن از ظرف', optionsFa: ['جمع', 'تفریق'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۳ تا بود، ۲ تا کم شد. چند؟', titleFa: 'تفریق', display: '●●● − ●●', optionsFa: ['۰', '۱', '۲'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'کدام عبارت درست است؟', titleFa: 'انتخاب', display: '۵ تا، ۲ تا رفت', optionsFa: ['۵ + ۲', '۲ − ۵', '۵', '۵ − ۲'], expectedOptionIndex: 3 },
        ],
      },
    ],
  },
];

export function p10BatchADepthViolations(seeds: readonly DepthChallengeSeed[] = P10_BATCH_A_DEPTH): string[] {
  const v: string[] = [];
  if (seeds.length !== 4) v.push(`EXPECTED_4_GOT_${seeds.length}`);
  for (const s of seeds) {
    if (s.gameCode !== 'G1-GAME-001') v.push(`BAD_TEMPLATE:${s.code}`);
    if (s.rounds.length !== 3) v.push(`ROUNDS:${s.code}`);
    for (const r of s.rounds) {
      if (r.variants.length !== 3) v.push(`VARIANTS:${s.code}:R${r.roundIndex}`);
      const levels = r.variants.map((x) => x.level);
      for (const need of ['SUPPORTED', 'CORE', 'STRETCH'] as const) {
        if (!levels.includes(need)) v.push(`MISSING_LEVEL:${s.code}:R${r.roundIndex}:${need}`);
      }
      for (const x of r.variants) {
        if (x.optionsFa.length < 2) v.push(`TOO_FEW_OPTIONS:${s.code}:R${r.roundIndex}:${x.level}`);
        if (x.expectedOptionIndex < 0 || x.expectedOptionIndex >= x.optionsFa.length) {
          v.push(`BAD_ANSWER_INDEX:${s.code}:R${r.roundIndex}:${x.level}`);
        }
        if (!x.promptFa.trim() || !x.titleFa.trim()) v.push(`EMPTY_COPY:${s.code}:R${r.roundIndex}:${x.level}`);
      }
    }
  }
  return v;
}
