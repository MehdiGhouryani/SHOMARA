/**
 * P10 depth — Batch E (ST21–ST25). Phase 4: answer-position rebalanced (v2).
 * 3 rounds × SUPPORTED/CORE/STRETCH. Runtime template: G1-GAME-001 (MULTIPLE_CHOICE).
 * Presentation is client-safe (no answer key). Correctness lives in evaluator_config on server.
 */
export const P10_BATCH_E_DEPTH_VERSION = '2026-10-06-p10-batch-e-depth-v2' as const;

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
  stationId: 'ST21' | 'ST22' | 'ST23' | 'ST24' | 'ST25';
  code: string;
  definitionId: string;
  gameCode: 'G1-GAME-001';
  evaluatorVersion: string;
  rounds: readonly DepthRoundSeed[];
}

export const P10_BATCH_E_DEPTH: readonly DepthChallengeSeed[] = [
  {
    stationId: 'ST21',
    code: 'G1-ST21-CH-01',
    definitionId: '2f0e0000-0000-4000-8000-000000000021',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st21-ch-hundred-table-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK023',
        variants: [
          { level: 'SUPPORTED', promptFa: 'در جدول عددها، بعد از ۲۵ کدام است؟', titleFa: 'جدول', display: '۲۵ → ؟', optionsFa: ['۲۶', '۲۴'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'عدد ۵۰ کجای جدول نزدیک است؟', titleFa: 'جدول ۱۰۰', display: '۴۹، ۵۰، ۵۱', optionsFa: ['کنار ۴۹', 'کنار ۹۰', 'اول جدول'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: 'از ۳۰ تا ۴۰ چند عدد کامل است؟', titleFa: 'بازه', display: '۳۰ → ۴۰', optionsFa: ['۱۰', '۹', '۱۱', '۲۰'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK049',
        variants: [
          { level: 'SUPPORTED', promptFa: 'با واحد کوچک، کدام مداد بلندتر است؟', titleFa: 'اندازه', display: 'کوتاه | بلند', optionsFa: ['بلند', 'کوتاه'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'اگر هر واحد ۱ باشد، طول ۵ واحد یعنی؟', titleFa: 'اندازه‌گیری', display: '۵ واحد', optionsFa: ['۱', '۱۰', '۵'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: '۸ واحد منهای ۳ واحد چند؟', titleFa: 'طول', display: '۸ − ۳', optionsFa: ['۴', '۶', '۵', '۳'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK007',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام عدد دو رقمی بزرگ‌تر است؟', titleFa: 'مقایسه', display: '۳۴ و ۴۳', optionsFa: ['۴۳', '۳۴'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۶۰ و ۵۹ کدام کوچک‌تر؟', titleFa: 'مقایسه', display: '۶۰ ؟ ۵۹', optionsFa: ['۶۰', '۵۹', 'برابر'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'ترتیب از کوچک به بزرگ؟', titleFa: 'ترتیب', display: '۷۲، ۲۷، ۵۲', optionsFa: ['۲۷-۵۲-۷۲', '۷۲-۵۲-۲۷', '۵۲-۲۷-۷۲', 'فقط ۷۲'], expectedOptionIndex: 0 },
        ],
      },
    ],
  },
  {
    stationId: 'ST22',
    code: 'G1-ST22-CH-01',
    definitionId: '2f0e0000-0000-4000-8000-000000000022',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st22-ch-calendar-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK056',
        variants: [
          { level: 'SUPPORTED', promptFa: 'بعد از شنبه کدام روز است؟', titleFa: 'تقویم', display: 'شنبه → ؟', optionsFa: ['جمعه', 'یکشنبه'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'هفته چند روز دارد؟', titleFa: 'هفته', display: 'تقویم', optionsFa: ['۵', '۷', '۱۰'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'اگر امروز سه‌شنبه باشد، دو روز بعد؟', titleFa: 'روزها', display: 'سه‌شنبه + ۲', optionsFa: ['چهارشنبه', 'پنجشنبه', 'جمعه', 'دوشنبه'], expectedOptionIndex: 1 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK008',
        variants: [
          { level: 'SUPPORTED', promptFa: '۲، ۴، ۶، ؟', titleFa: 'شمارش', display: 'الگوی زوج', optionsFa: ['۷', '۸'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۵، ۱۰، ۱۵، ؟', titleFa: '۵تایی', display: '۵ ۱۰ ۱۵ ؟', optionsFa: ['۲۰', '۱۶', '۲۵'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: '۱۰، ۲۰، ۳۰، ؟', titleFa: 'ده‌تایی', display: '۱۰ ۲۰ ۳۰ ؟', optionsFa: ['۳۵', '۵۰', '۳۱', '۴۰'], expectedOptionIndex: 3 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK013',
        variants: [
          { level: 'SUPPORTED', promptFa: 'الگو: روز، شب، روز، شب، ؟', titleFa: 'الگو', display: 'تکرار', optionsFa: ['هفته', 'روز'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۱، ۲، ۳، ۴، ؟', titleFa: 'شمارش پشت‌سرهم', display: '۱–۴', optionsFa: ['۶', '۴', '۵'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: '۷، ۶، ۵، ؟', titleFa: 'کاهشی', display: '۷ ۶ ۵ ؟', optionsFa: ['۳', '۴', '۵', '۸'], expectedOptionIndex: 1 },
        ],
      },
    ],
  },
  {
    stationId: 'ST23',
    code: 'G1-ST23-CH-01',
    definitionId: '2f0e0000-0000-4000-8000-000000000023',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st23-ch-group-count-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK008',
        variants: [
          { level: 'SUPPORTED', promptFa: 'شمارش ۵تایی: ۵، ۱۰، ؟', titleFa: '۵تایی', display: '۵ ۱۰ ؟', optionsFa: ['۱۵', '۱۲'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۳ گروه ۵تایی چند تا؟', titleFa: 'گروه', display: '۳ × ۵', optionsFa: ['۱۰', '۲۰', '۱۵'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: '۴ گروه ۵تایی چند؟', titleFa: 'گروه', display: '۴ × ۵', optionsFa: ['۱۵', '۲۵', '۲۰', '۱۰'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK057',
        variants: [
          { level: 'SUPPORTED', promptFa: '۲ گروه ۸تایی یعنی چند؟', titleFa: '۸تایی', display: '۲ × ۸', optionsFa: ['۱۶', '۱۰'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۸، ۱۶، ؟', titleFa: 'الگو', display: '۸ ۱۶ ؟', optionsFa: ['۲۰', '۲۴', '۱۸'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: '۳ گروه ۸تایی چند؟', titleFa: 'مسئله', display: '۳ × ۸', optionsFa: ['۲۴', '۲۱', '۲۷', '۱۶'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK006',
        variants: [
          { level: 'SUPPORTED', promptFa: '۱۰ تا را دو گروه ۵تایی کنیم. درست است؟', titleFa: 'گروه‌بندی', display: '۱۰ = ۵+۵', optionsFa: ['درست', 'غلط'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۲۰ تا چند گروه ۵تایی است؟', titleFa: 'تقسیم گروهی', display: '۲۰ ÷ ۵', optionsFa: ['۴', '۳', '۵'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: '۱۶ تا چند گروه ۸تایی؟', titleFa: 'مسئله', display: '۱۶ ÷ ۸', optionsFa: ['۱', '۴', '۲', '۸'], expectedOptionIndex: 2 },
        ],
      },
    ],
  },
  {
    stationId: 'ST24',
    code: 'G1-ST24-CH-01',
    definitionId: '2f0e0000-0000-4000-8000-000000000024',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st24-ch-multi-step-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK062',
        variants: [
          { level: 'SUPPORTED', promptFa: '۳ تا داشت، ۲ تا گرفت. حالا چند؟', titleFa: 'دو قدم', display: '۳ + ۲', optionsFa: ['۳', '۵'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۵ تا بود، ۱ داد، بعد ۲ گرفت. چند؟', titleFa: 'چندمرحله', display: '۵−۱+۲', optionsFa: ['۶', '۵', '۷'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: '۱۰ داشت، ۳ داد، ۴ گرفت. چند؟', titleFa: 'چندمرحله', display: '۱۰−۳+۴', optionsFa: ['۱۰', '۱۲', '۹', '۱۱'], expectedOptionIndex: 3 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK055',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کار ۱۰ دقیقه‌ای از ساعت ۲؛ حدوداً کی تمام؟', titleFa: 'زمان تقریبی', display: '۲:۰۰ + ۱۰د', optionsFa: ['۳:۰۰', 'حدود ۲:۱۰'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'نیم ساعت بعد از ۴؟', titleFa: 'تقریب زمان', display: '۴:۰۰ + ۳۰د', optionsFa: ['۴:۱۵', '۵:۰۰', '۴:۳۰'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: 'دو کار ۱۵ دقیقه‌ای پشت‌سرهم از ۱؛ حدوداً؟', titleFa: 'مجموع زمان', display: '۱:۰۰ + ۳۰د', optionsFa: ['۱:۱۵', '۱:۳۰', '۲:۰۰', '۱:۴۵'], expectedOptionIndex: 1 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK058',
        variants: [
          { level: 'SUPPORTED', promptFa: 'اول جمع، بعد تفریق: ۲+۳−۱؟', titleFa: 'ترتیب', display: '۲+۳−۱', optionsFa: ['۵', '۴'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۴+۴−۲ چند؟', titleFa: 'ترتیب', display: '۴+۴−۲', optionsFa: ['۵', '۶', '۸'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: '۶+۳−۴ چند؟', titleFa: 'ترتیب', display: '۶+۳−۴', optionsFa: ['۴', '۶', '۳', '۵'], expectedOptionIndex: 3 },
        ],
      },
    ],
  },
  {
    stationId: 'ST25',
    code: 'G1-ST25-CH-01',
    definitionId: '2f0e0000-0000-4000-8000-000000000025',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st25-ch-hundred-info-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK024',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام عدد صد است؟', titleFa: '۱۰۰', display: '۱۰۰', optionsFa: ['۱۰۰', '۱۰'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۱۰ ده‌تایی چند می‌شود؟', titleFa: 'تا ۱۰۰', display: '۱۰ × ۱۰', optionsFa: ['۱۰', '۱۰۰', '۲۰'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: '۹۹ + ۱ چند؟', titleFa: '۱۰۰', display: '۹۹+۱', optionsFa: ['۱۰۰', '۹۹', '۱۰۱', '۹۰'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK061',
        variants: [
          { level: 'SUPPORTED', promptFa: 'برای دانستن «چند سیب دارد» آیا رنگ سیب لازم است؟', titleFa: 'کفایت', display: 'سؤال تعداد', optionsFa: ['نه', 'بله'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'می‌گوید «چند تا؟» ولی عددی نداده. اطلاعات کافی است؟', titleFa: 'کفایت', display: 'بدون عدد', optionsFa: ['ناکافی', 'کافی', 'مهم نیست'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: '۳ سیب قرمز و ۲ سیب سبز. برای «جمع کل» اطلاعات کافی است؟', titleFa: 'کفایت', display: '۳+۲', optionsFa: ['ناکافی', 'فقط رنگ مهم است', 'کافی', 'نمی‌دانم'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK023',
        variants: [
          { level: 'SUPPORTED', promptFa: '۱۰۰ از ۹۰ بزرگ‌تر است؟', titleFa: 'مقایسه', display: '۱۰۰ و ۹۰', optionsFa: ['بله', 'خیر'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کدام به ۱۰۰ نزدیک‌تر است؟', titleFa: 'نزدیکی', display: '۹۵ و ۸۰', optionsFa: ['۸۰', 'برابر', '۹۵'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: '۱۰۰ − ۱۰ چند؟', titleFa: 'تفریق', display: '۱۰۰−۱۰', optionsFa: ['۹۰', '۸۰', '۱۱۰', '۱۰'], expectedOptionIndex: 0 },
        ],
      },
    ],
  },
];

export function p10BatchEDepthViolations(seeds: readonly DepthChallengeSeed[] = P10_BATCH_E_DEPTH): string[] {
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

/** Honest coverage after all depth batches. */
export function p10PlayableCoverageSummary() {
  return {
    st01: 'P05_FULL',
    st02_to_st05: 'BATCH_A_DEPTH',
    st06_to_st10: 'BATCH_B_DEPTH',
    st11_to_st15: 'BATCH_C_DEPTH',
    st16_to_st20: 'BATCH_D_DEPTH',
    st21_to_st25: 'BATCH_E_DEPTH',
    playableDefinitionStations: 25,
    educationalSignOffComplete: false,
    deviceSmokeComplete: false,
    p10Status: 'IN_PROGRESS' as const,
    answerPositionRebalanced: true as const,
    note: 'All 25 stations have playable MC packs with rebalanced answer positions; PASS still needs human educational + device gates.',
  };
}
