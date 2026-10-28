/**
 * P10 depth — Batch B (ST06–ST10). Phase 4: answer-position rebalanced (v2).
 * 3 rounds × SUPPORTED/CORE/STRETCH. Runtime template: G1-GAME-001 (MULTIPLE_CHOICE).
 * Presentation is client-safe (no answer key). Correctness lives in evaluator_config on server.
 */
export const P10_BATCH_B_DEPTH_VERSION = '2026-10-06-p10-batch-b-depth-v2' as const;

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
  stationId: 'ST06' | 'ST07' | 'ST08' | 'ST09' | 'ST10';
  code: string;
  definitionId: string;
  gameCode: 'G1-GAME-001';
  evaluatorVersion: string;
  rounds: readonly DepthRoundSeed[];
}

export const P10_BATCH_B_DEPTH: readonly DepthChallengeSeed[] = [
  {
    stationId: 'ST06',
    code: 'G1-ST06-CH-01',
    definitionId: '2f0b0000-0000-4000-8000-000000000006',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st06-ch-counter-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK026',
        variants: [
          { level: 'SUPPORTED', promptFa: '۲ مهره بود، ۱ تا اضافه شد. چند تا؟', titleFa: 'مهره', display: '●● + ●', optionsFa: ['۳', '۲'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۳ مهره + ۲ مهره چند می‌شود؟', titleFa: 'جمع با شمارنده', display: '●●● + ●●', optionsFa: ['۵', '۴', '۶'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: '۴ + ۳ با مهره چند؟', titleFa: 'جمع', display: '•••• + •••', optionsFa: ['۷', '۶', '۸', '۵'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK032',
        variants: [
          { level: 'SUPPORTED', promptFa: '۴ مهره بود، ۱ تا برداشتیم. چند ماند؟', titleFa: 'تفریق', display: '●●●● − ●', optionsFa: ['۳', '۴'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۵ − ۲ با شمارنده چند؟', titleFa: 'تفریق', display: '●●●●● − ●●', optionsFa: ['۲', '۴', '۳'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: '۶ − ۴ چند می‌ماند؟', titleFa: 'تفریق', display: '۶ − ۴', optionsFa: ['۱', '۳', '۲', '۴'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK005',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام راه «جمع» است؟', titleFa: 'معنی', display: 'اضافه کردن مهره', optionsFa: ['جمع', 'تفریق'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۳ تا بود، ۲ تا کم شد. چند؟', titleFa: 'شمارنده', display: '●●● − ●●', optionsFa: ['۰', '۱', '۲'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'کدام درست است؟', titleFa: 'انتخاب', display: '۵ مهره، ۲ تا اضافه', optionsFa: ['۵ + ۲', '۵ − ۲', '۲ − ۵', '۵'], expectedOptionIndex: 0 },
        ],
      },
    ],
  },
  {
    stationId: 'ST07',
    code: 'G1-ST07-CH-01',
    definitionId: '2f0b0000-0000-4000-8000-000000000007',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st07-ch-num12-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK016',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام عدد «یک» است؟', titleFa: 'عدد ۱', display: '۱', optionsFa: ['۲', '۱'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'کدام گروه فقط یک چیز دارد؟', titleFa: 'یک', display: '●  |  ●●', optionsFa: ['گروه دوم', 'گروه اول', 'هر دو'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'کدام نماد برای دو است؟', titleFa: 'عدد ۲', display: 'دو نقطه', optionsFa: ['۱', '۲', '۳', '۰'], expectedOptionIndex: 1 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK001',
        variants: [
          { level: 'SUPPORTED', promptFa: 'چند تا می‌بینی؟', titleFa: 'شمارش', display: '●●', optionsFa: ['۱', '۲'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'کدام بیشتر است؟', titleFa: 'مقایسه', display: '●  و  ●●', optionsFa: ['دوتایی', 'یکی', 'برابر'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: 'کدام کمتر است؟', titleFa: 'مقایسه', display: '●●  و  ●', optionsFa: ['دوتایی', 'برابر', 'نمی‌دانم', 'یکی'], expectedOptionIndex: 3 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK035',
        variants: [
          { level: 'SUPPORTED', promptFa: '۱ و ۱ با هم چند؟', titleFa: 'ساخت', display: '● + ●', optionsFa: ['۱', '۲'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'برای ساختن ۲ کدام درست است؟', titleFa: 'ترکیب', display: 'هدف: ۲', optionsFa: ['۲ و ۲', '۰ و ۱', '۱ و ۱'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: 'کدام جمله درست است؟', titleFa: 'مقایسه', display: '۱ و ۲', optionsFa: ['۱ بزرگ‌تر از ۲', '۲ بزرگ‌تر از ۱', 'برابرند', 'هیچکدام'], expectedOptionIndex: 1 },
        ],
      },
    ],
  },
  {
    stationId: 'ST08',
    code: 'G1-ST08-CH-01',
    definitionId: '2f0b0000-0000-4000-8000-000000000008',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st08-ch-num34-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK016',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام عدد سه است؟', titleFa: 'عدد ۳', display: '۳', optionsFa: ['۳', '۴'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کدام گروه چهار تاست؟', titleFa: 'عدد ۴', display: '●●●  |  ●●●●', optionsFa: ['گروه اول', 'برابر', 'گروه دوم'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: 'کدام نماد برای چهار است؟', titleFa: 'نماد', display: 'چهار مهره', optionsFa: ['۲', '۳', '۴', '۵'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK038',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام خط بلندتر است؟', titleFa: 'قد', display: '—  و  ———', optionsFa: ['خط بلند', 'خط کوتاه'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کدام کودک بلندتر است؟', titleFa: 'مقایسه قد', display: 'کوتاه | بلند', optionsFa: ['اولی', 'دومی', 'برابر'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'کدام ترتیب از کوتاه به بلند است؟', titleFa: 'ترتیب', display: 'سه چوب', optionsFa: ['کوتاه-متوسط-بلند', 'بلند-کوتاه-متوسط', 'همه برابر', 'فقط بلند'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK001',
        variants: [
          { level: 'SUPPORTED', promptFa: '۳ تا می‌بینی یا ۴ تا؟', titleFa: 'شمارش', display: '●●●', optionsFa: ['۳', '۴'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۲ + ۲ چند می‌شود؟', titleFa: 'جمع کوچک', display: '۲ + ۲', optionsFa: ['۴', '۳', '۵'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: 'کدام بیشتر است؟', titleFa: 'مقایسه', display: '۳ و ۴', optionsFa: ['۳', 'برابر', '۴', 'نمی‌دانم'], expectedOptionIndex: 2 },
        ],
      },
    ],
  },
  {
    stationId: 'ST09',
    code: 'G1-ST09-CH-01',
    definitionId: '2f0b0000-0000-4000-8000-000000000009',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st09-ch-zero5-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK016',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام جا هیچی نیست؟', titleFa: 'صفر', display: '●●  |  (خالی)', optionsFa: ['جعبه با مهره', 'جعبه خالی'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'کدام عدد «صفر» است؟', titleFa: '۰', display: '۰', optionsFa: ['۰', '۵', '۱'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: '۵ تا بود همه رفتند. چند ماند؟', titleFa: 'به صفر', display: '۵ − ۵', optionsFa: ['۱', '۵', '۲', '۰'], expectedOptionIndex: 3 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK045',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام شکل متقارن است؟', titleFa: 'تقارن', display: '□ متقارن | شکل کج', optionsFa: ['شکل کج', 'مربع'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'نیمهٔ دیگر قلب کدام است؟', titleFa: 'تقارن', display: 'نیمه‌قلب', optionsFa: ['مثلث', 'خط', 'همان شکل برعکس'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: 'کدام شکل با تا کردن روی هم می‌افتد؟', titleFa: 'تقارن', display: 'چند شکل', optionsFa: ['فقط یک ضلع کج', 'دایره', 'ابر نامنظم', 'خط شکسته'], expectedOptionIndex: 1 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK004',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام عدد پنج است؟', titleFa: '۵', display: '۵', optionsFa: ['۰', '۵'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'چند تا می‌بینی؟', titleFa: 'شمارش تا ۵', display: '●●●●●', optionsFa: ['۴', '۵', '۶'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: '۴ + ۱ چند می‌شود؟', titleFa: 'تا ۵', display: '۴ + ۱', optionsFa: ['۴', '۶', '۳', '۵'], expectedOptionIndex: 3 },
        ],
      },
    ],
  },
  {
    stationId: 'ST10',
    code: 'G1-ST10-CH-01',
    definitionId: '2f0b0000-0000-4000-8000-000000000010',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st10-ch-num67-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK016',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام عدد شش است؟', titleFa: '۶', display: '۶', optionsFa: ['۶', '۷'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کدام گروه هفت تاست؟', titleFa: '۷', display: '●●●●●●  |  ●●●●●●●', optionsFa: ['شش‌تایی', 'هفت‌تایی', 'برابر'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'کدام نماد برای هفت است؟', titleFa: 'نماد', display: 'هفت مهره', optionsFa: ['۷', '۵', '۶', '۸'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK035',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام بیشتر است؟', titleFa: 'مقایسه', display: '۶ و ۵', optionsFa: ['۶', '۵'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۶ و ۷ کدام بزرگ‌تر است؟', titleFa: 'مقایسه', display: '۶ ؟ ۷', optionsFa: ['۷', '۶', 'برابر'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: 'کدام ترتیب از کوچک به بزرگ است؟', titleFa: 'ترتیب', display: '۵، ۷، ۶', optionsFa: ['۷-۶-۵', '۶-۵-۷', '۵-۶-۷', 'فقط ۷'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK036',
        variants: [
          { level: 'SUPPORTED', promptFa: '۳ + ۳ چند می‌شود؟', titleFa: 'تا ۶', display: '۳ + ۳', optionsFa: ['۶', '۵'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۵ + ۲ چند؟', titleFa: 'تا ۷', display: '۵ + ۲', optionsFa: ['۶', '۸', '۷'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: 'کدام برابر ۷ است؟', titleFa: 'معادل', display: 'هدف: ۷', optionsFa: ['۴ + ۳', '۳ + ۳', '۲ + ۲', '۵ + ۱'], expectedOptionIndex: 0 },
        ],
      },
    ],
  },
];

export function p10BatchBDepthViolations(seeds: readonly DepthChallengeSeed[] = P10_BATCH_B_DEPTH): string[] {
  const v: string[] = [];
  if (seeds.length !== 5) v.push(`EXPECTED_5_GOT_${seeds.length}`);
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
