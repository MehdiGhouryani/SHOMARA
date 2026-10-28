/**
 * P10 depth — Batch C (ST11–ST15). Phase 4: answer-position rebalanced (v2).
 * 3 rounds × SUPPORTED/CORE/STRETCH. Runtime template: G1-GAME-001 (MULTIPLE_CHOICE).
 * Presentation is client-safe (no answer key). Correctness lives in evaluator_config on server.
 */
export const P10_BATCH_C_DEPTH_VERSION = '2026-10-06-p10-batch-c-depth-v2' as const;

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
  stationId: 'ST11' | 'ST12' | 'ST13' | 'ST14' | 'ST15';
  code: string;
  definitionId: string;
  gameCode: 'G1-GAME-001';
  evaluatorVersion: string;
  rounds: readonly DepthRoundSeed[];
}

export const P10_BATCH_C_DEPTH: readonly DepthChallengeSeed[] = [
  {
    stationId: 'ST11',
    code: 'G1-ST11-CH-01',
    definitionId: '2f0c0000-0000-4000-8000-000000000011',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st11-ch-equal8-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK037',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام دو گروه برابرند؟', titleFa: 'برابری', display: '●●  و  ●●', optionsFa: ['برابرند', 'نابرابر'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کدام جفت مساوی است؟', titleFa: 'مساوی', display: '۳ و ۳  |  ۲ و ۴', optionsFa: ['۳ و ۳', '۲ و ۴', 'هیچکدام'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: 'برای برابر شدن با ۴، چند تا کم است؟', titleFa: 'برابری', display: '●●●  ؟  ●●●●', optionsFa: ['۱', '۲', '۰', '۳'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK016',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام عدد هشت است؟', titleFa: '۸', display: '۸', optionsFa: ['۸', '۶'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کدام گروه هشت تاست؟', titleFa: 'شمارش ۸', display: '۷ نقطه | ۸ نقطه', optionsFa: ['اولی', 'برابر', 'دومی'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: '۴ + ۴ چند می‌شود؟', titleFa: 'تا ۸', display: '۴ + ۴', optionsFa: ['۶', '۷', '۸', '۹'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK035',
        variants: [
          { level: 'SUPPORTED', promptFa: '۵ و ۳ با هم چند؟', titleFa: 'جمع تا ۸', display: '۵ + ۳', optionsFa: ['۸', '۷'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کدام برابر ۸ است؟', titleFa: 'معادل', display: 'هدف: ۸', optionsFa: ['۳ + ۴', '۵ + ۳', '۲ + ۵'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'کدام جمله درست است؟', titleFa: 'مقایسه', display: '۷ و ۸', optionsFa: ['۸ بزرگ‌تر', '۷ بزرگ‌تر', 'برابر', 'نمی‌دانم'], expectedOptionIndex: 0 },
        ],
      },
    ],
  },
  {
    stationId: 'ST12',
    code: 'G1-ST12-CH-01',
    definitionId: '2f0c0000-0000-4000-8000-000000000012',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st12-ch-compare9-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK036',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام بیشتر است؟', titleFa: 'مقایسه', display: '۵ و ۷', optionsFa: ['۵', '۷'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۸ و ۶ کدام کوچک‌تر است؟', titleFa: 'کمتر', display: '۸ ؟ ۶', optionsFa: ['۸', '۶', 'برابر'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'ترتیب از کوچک به بزرگ؟', titleFa: 'ترتیب', display: '۹، ۷، ۸', optionsFa: ['۹-۸-۷', '۷-۸-۹', '۸-۷-۹', 'فقط ۹'], expectedOptionIndex: 1 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK035',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام عدد نه است؟', titleFa: '۹', display: '۹', optionsFa: ['۸', '۹'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'کدام گروه ۹ تاست؟', titleFa: 'شمارش', display: '۸ | ۹', optionsFa: ['نه‌تایی', 'هشت‌تایی', 'برابر'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: '۵ + ۴ چند؟', titleFa: 'تا ۹', display: '۵ + ۴', optionsFa: ['۸', '۱۰', '۷', '۹'], expectedOptionIndex: 3 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK016',
        variants: [
          { level: 'SUPPORTED', promptFa: '۶ و ۹ کدام بزرگ‌تر؟', titleFa: 'مقایسه', display: '۶ و ۹', optionsFa: ['۶', '۹'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'کدام برابر ۹ است؟', titleFa: 'معادل', display: 'هدف: ۹', optionsFa: ['۴ + ۴', '۳ + ۵', '۵ + ۴'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: '۹ − ۱ چند می‌ماند؟', titleFa: 'تفریق', display: '۹ − ۱', optionsFa: ['۷', '۸', '۹', '۱۰'], expectedOptionIndex: 1 },
        ],
      },
    ],
  },
  {
    stationId: 'ST13',
    code: 'G1-ST13-CH-01',
    definitionId: '2f0c0000-0000-4000-8000-000000000013',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st13-ch-plus-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK025',
        variants: [
          { level: 'SUPPORTED', promptFa: 'نشانهٔ جمع کدام است؟', titleFa: 'نشانه +', display: '+ − =', optionsFa: ['+', '−'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۲ + ۳ یعنی چه؟', titleFa: 'معنی +', display: '۲ + ۳', optionsFa: ['کم کردن', 'فقط نوشتن', 'جمع کردن'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: 'کدام عبارت جمع است؟', titleFa: 'تشخیص', display: 'چند عبارت', optionsFa: ['۵ − ۲', '۳ = ۳', '۴ + ۱', 'فقط ۵'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK028',
        variants: [
          { level: 'SUPPORTED', promptFa: '۱ + ۴ چند می‌شود؟', titleFa: 'جمع', display: '۱ + ۴', optionsFa: ['۵', '۴'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۳ + ۳ چند؟', titleFa: 'جمع', display: '۳ + ۳', optionsFa: ['۵', '۶', '۷'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: '۲ + ۶ چند؟', titleFa: 'جمع', display: '۲ + ۶', optionsFa: ['۸', '۷', '۹', '۶'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK029',
        variants: [
          { level: 'SUPPORTED', promptFa: 'برای ۵، کدام جمع درست است؟', titleFa: 'ترکیب', display: 'هدف: ۵', optionsFa: ['۲ + ۳', '۱ + ۱'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کدام جمع برابر ۶ است؟', titleFa: 'ترکیب', display: 'هدف: ۶', optionsFa: ['۴ + ۲', '۲ + ۲', '۱ + ۳'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: 'کدام دو جمع با هم برابرند؟', titleFa: 'معادل', display: '۳+۲ و ۴+۱', optionsFa: ['متفاوت', 'هر دو ۴', 'هر دو ۵', 'نمی‌دانم'], expectedOptionIndex: 2 },
        ],
      },
    ],
  },
  {
    stationId: 'ST14',
    code: 'G1-ST14-CH-01',
    definitionId: '2f0c0000-0000-4000-8000-000000000014',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st14-ch-sublen-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK031',
        variants: [
          { level: 'SUPPORTED', promptFa: 'نشانهٔ تفریق کدام است؟', titleFa: 'نشانه −', display: '+ −', optionsFa: ['+', '−'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۵ − ۲ یعنی چه؟', titleFa: 'معنی', display: '۵ − ۲', optionsFa: ['کم کردن', 'جمع', 'فقط خواندن'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: 'کدام عبارت تفریق است؟', titleFa: 'تشخیص', display: 'عبارت‌ها', optionsFa: ['۳ + ۱', '۴ = ۴', '۲ + ۲', '۶ − ۲'], expectedOptionIndex: 3 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK032',
        variants: [
          { level: 'SUPPORTED', promptFa: '۴ − ۱ چند؟', titleFa: 'تفریق', display: '۴ − ۱', optionsFa: ['۴', '۳'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۷ − ۳ چند؟', titleFa: 'تفریق', display: '۷ − ۳', optionsFa: ['۳', '۵', '۴'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: '۹ − ۴ چند؟', titleFa: 'تفریق', display: '۹ − ۴', optionsFa: ['۴', '۵', '۶', '۳'], expectedOptionIndex: 1 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK038',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام نوار بلندتر است؟', titleFa: 'طول', display: 'کوتاه | بلند', optionsFa: ['نوار کوتاه', 'نوار بلند'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'کدام کوتاه‌تر است؟', titleFa: 'مقایسه طول', display: 'A بلند B کوتاه', optionsFa: ['A', 'B', 'برابر'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'اگر از نوار بلند ۲ واحد کم کنیم، چه می‌شود؟', titleFa: 'طول و تفریق', display: 'بلند − ۲', optionsFa: ['بلندتر', 'همان', 'ناپدید', 'کوتاه‌تر از قبل'], expectedOptionIndex: 3 },
        ],
      },
    ],
  },
  {
    stationId: 'ST15',
    code: 'G1-ST15-CH-01',
    definitionId: '2f0c0000-0000-4000-8000-000000000015',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st15-ch-group-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK021',
        variants: [
          { level: 'SUPPORTED', promptFa: 'ده‌تایی یعنی چند تا؟', titleFa: 'ده‌تایی', display: 'یک بسته', optionsFa: ['۱۰', '۱'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۱ ده‌تایی و ۲ یکی چند می‌شود؟', titleFa: 'ارزش مکانی', display: '۱۰ + ۲', optionsFa: ['۱۰', '۱۲', '۳'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: '۱ ده‌تایی و ۵ یکی کدام عدد است؟', titleFa: 'ساخت عدد', display: 'ده و پنج یکی', optionsFa: ['۱۵', '５۱', '۱۰', '۶'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK006',
        variants: [
          { level: 'SUPPORTED', promptFa: '۱۰ تا را یک گروه کنیم. چند گروه؟', titleFa: 'گروه‌بندی', display: '۱۰ مهره', optionsFa: ['۱ گروه ده‌تایی', '۱۰ گروه'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۱۴ یعنی چند ده‌تایی و چند یکی؟', titleFa: 'تجزیه', display: '۱۴', optionsFa: ['۱ ده و ۴ یکی', '۴ ده و ۱ یکی', '۱۴ یکی فقط'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: '۲ ده‌تایی و ۳ یکی چند؟', titleFa: 'ترکیب', display: '۲۰ + ۳', optionsFa: ['۳۲', '۵', '۲۳', '۲۰'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK008',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام بسته ده‌تایی است؟', titleFa: 'تشخیص', display: 'بسته ۱۰ | ۵ تای پراکنده', optionsFa: ['بسته ۱۰', '۵ تای پراکنده'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۱۱ چند ده‌تایی و چند یکی دارد؟', titleFa: 'ارزش مکانی', display: '۱۱', optionsFa: ['۰ و ۱۱', '۲ و ۱', '۱ و ۱'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: 'کدام درست است؟', titleFa: 'انتخاب', display: '۱۶', optionsFa: ['۱ ده و ۶ یکی', '۶ ده و ۱ یکی', '۱۶ ده', 'فقط ۶'], expectedOptionIndex: 0 },
        ],
      },
    ],
  },
];

export function p10BatchCDepthViolations(seeds: readonly DepthChallengeSeed[] = P10_BATCH_C_DEPTH): string[] {
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
