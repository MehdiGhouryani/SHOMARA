/**
 * P10 depth — Batch D (ST16–ST20). Phase 4: answer-position rebalanced (v2).
 * 3 rounds × SUPPORTED/CORE/STRETCH. Runtime template: G1-GAME-001 (MULTIPLE_CHOICE).
 * Presentation is client-safe (no answer key). Correctness lives in evaluator_config on server.
 */
export const P10_BATCH_D_DEPTH_VERSION = '2026-10-06-p10-batch-d-depth-v2' as const;

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
  stationId: 'ST16' | 'ST17' | 'ST18' | 'ST19' | 'ST20';
  code: string;
  definitionId: string;
  gameCode: 'G1-GAME-001';
  evaluatorVersion: string;
  rounds: readonly DepthRoundSeed[];
}

export const P10_BATCH_D_DEPTH: readonly DepthChallengeSeed[] = [
  {
    stationId: 'ST16',
    code: 'G1-ST16-CH-01',
    definitionId: '2f0d0000-0000-4000-8000-000000000016',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st16-ch-clock-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK052',
        variants: [
          { level: 'SUPPORTED', promptFa: 'ساعت ۳ را کدام نشان می‌دهد؟', titleFa: 'ساعت', display: 'ساعت عقربه‌ای', optionsFa: ['۳', '۹'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'ساعت چند است؟ (عقربه روی ۶)', titleFa: 'خواندن ساعت', display: 'عقربه ساعت‌شمار روی ۶', optionsFa: ['۶', '۱۲', '۳'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: 'نیم ساعت بعد از ۲ کدام است؟', titleFa: 'زمان', display: '۲:۰۰ → ؟', optionsFa: ['۲:۳۰', '۳:۰۰', '۱:۳۰', '۲:۱۵'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK016',
        variants: [
          { level: 'SUPPORTED', promptFa: 'کدام عدد ده است؟', titleFa: '۱۰', display: '۱۰', optionsFa: ['۱۰', '۱۲'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کدام عدد بین ۱۰ و ۲۰ است؟', titleFa: '۱۱–۱۹', display: '۸، ۱۵، ۲۲', optionsFa: ['۸', '۲۲', '۱۵'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: '۱۲ یعنی چند ده‌تایی و چند یکی؟', titleFa: 'ارزش مکانی', display: '۱۲', optionsFa: ['۲ و ۱', '۱۲ یکی', '۱ و ۲', '۱ و ۱۲'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK053',
        variants: [
          { level: 'SUPPORTED', promptFa: 'یک ساعت چند دقیقه است؟', titleFa: 'دقیقه', display: 'ساعت کامل', optionsFa: ['۶۰', '۳۰'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'ساعت ۵ بعد از ۱ ساعت چند می‌شود؟', titleFa: 'گذشت زمان', display: '۵ → +۱', optionsFa: ['۴', '۶', '۷'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'از ۱۰ تا ۱۲ چند ساعت است؟', titleFa: 'فاصله', display: '۱۰ → ۱۲', optionsFa: ['۲', '۱', '۳', '۰'], expectedOptionIndex: 0 },
        ],
      },
    ],
  },
  {
    stationId: 'ST17',
    code: 'G1-ST17-CH-01',
    definitionId: '2f0d0000-0000-4000-8000-000000000017',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st17-ch-multiadd-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK030',
        variants: [
          { level: 'SUPPORTED', promptFa: '۲ + ۲ + ۱ چند می‌شود؟', titleFa: 'جمع چندتایی', display: '۲+۲+۱', optionsFa: ['۴', '۵'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۳ + ۱ + ۲ چند؟', titleFa: 'جمع', display: '۳+۱+۲', optionsFa: ['۵', '۶', '۷'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: '۴ + ۲ + ۳ چند؟', titleFa: 'جمع', display: '۴+۲+۳', optionsFa: ['۸', '۹', '۱۰', '۷'], expectedOptionIndex: 1 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK027',
        variants: [
          { level: 'SUPPORTED', promptFa: 'تقریباً ۵ یعنی نزدیک به کدام؟', titleFa: 'تقریب', display: '۴ یا ۹', optionsFa: ['۹', '۴'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۸ به کدام نزدیک‌تر است؟', titleFa: 'تقریب', display: 'به ۵ یا به ۱۰', optionsFa: ['۱۰', '۵', '۰'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: '۱۲ را به نزدیک‌ترین ده گرد کن', titleFa: 'گرد کردن', display: '۱۲', optionsFa: ['۲۰', '۱۲', '۱۵', '۱۰'], expectedOptionIndex: 3 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK025',
        variants: [
          { level: 'SUPPORTED', promptFa: '۱ + ۱ + ۱ چند؟', titleFa: 'جمع', display: '۱+۱+۱', optionsFa: ['۲', '۳'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'کدام جمع بزرگ‌تر است؟', titleFa: 'مقایسه', display: '۲+۲+۲ و ۳+۱', optionsFa: ['۳+۱', 'برابر', '۲+۲+۲'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: '۵ + ۰ + ۲ چند؟', titleFa: 'با صفر', display: '۵+۰+۲', optionsFa: ['۵', '۷', '۶', '۲'], expectedOptionIndex: 1 },
        ],
      },
    ],
  },
  {
    stationId: 'ST18',
    code: 'G1-ST18-CH-01',
    definitionId: '2f0d0000-0000-4000-8000-000000000018',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st18-ch-pattern-time-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK013',
        variants: [
          { level: 'SUPPORTED', promptFa: 'الگو را ادامه بده: ۲، ۴، ۶، ؟', titleFa: 'الگوی عددی', display: '۲ ۴ ۶ ؟', optionsFa: ['۸', '۷'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۱، ۳، ۵، ؟ بعدی چیست؟', titleFa: 'الگو', display: '۱ ۳ ۵ ؟', optionsFa: ['۶', '۸', '۷'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: '۱۰، ۸، ۶، ؟', titleFa: 'الگوی کاهشی', display: '۱۰ ۸ ۶ ؟', optionsFa: ['۵', '۲', '۴', '۷'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK054',
        variants: [
          { level: 'SUPPORTED', promptFa: 'ساعت ۷ را کدام است؟', titleFa: 'زمان', display: 'ساعت', optionsFa: ['۷', '۱'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'یک ربع بعد از ۳ کدام است؟', titleFa: 'ربع', display: '۳:۰۰ + ۱۵دقیقه', optionsFa: ['۳:۳۰', '۳:۱۵', '۴:۰۰'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'از ۸ تا ۸:۳۰ چند دقیقه گذشته؟', titleFa: 'مدت', display: '۸:۰۰ → ۸:۳۰', optionsFa: ['۳۰', '۱۵', '۶۰', '۴۵'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK011',
        variants: [
          { level: 'SUPPORTED', promptFa: 'الگوی شکل: ■ ● ■ ● ؟', titleFa: 'الگوی شکلی', display: '■ ● ■ ● ؟', optionsFa: ['■', '●'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۲، ۲، ۳، ۳، ۴، ؟', titleFa: 'الگو', display: '۲ ۲ ۳ ۳ ۴ ؟', optionsFa: ['۴', '۵', '۳'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: '۵، ۱۰، ۱۵، ؟', titleFa: 'شمارش ۵تایی', display: '۵ ۱۰ ۱۵ ؟', optionsFa: ['۱۶', '۲۵', '۲۰', '۱۸'], expectedOptionIndex: 2 },
        ],
      },
    ],
  },
  {
    stationId: 'ST19',
    code: 'G1-ST19-CH-01',
    definitionId: '2f0d0000-0000-4000-8000-000000000019',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st19-ch-tens-buy-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK021',
        variants: [
          { level: 'SUPPORTED', promptFa: 'یک ده‌تایی چند تومان فرضی است؟ (۱۰ واحد)', titleFa: 'ده‌تایی', display: '۱ بسته', optionsFa: ['۱', '۱۰'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۲ ده‌تایی چند واحد است؟', titleFa: 'ده‌تایی', display: '۲ بسته', optionsFa: ['۲۰', '۱۲', '۲'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: '۳ ده‌تایی و ۴ یکی چند؟', titleFa: 'ترکیب', display: '۳۰ + ۴', optionsFa: ['۴۳', '۷', '۳۰', '۳۴'], expectedOptionIndex: 3 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK057',
        variants: [
          { level: 'SUPPORTED', promptFa: 'مداد ۵ واحد است. با ۱۰ واحد چند مداد؟', titleFa: 'خرید', display: '۵ تایی با ۱۰', optionsFa: ['۵', '۲'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: 'یک خوراکی ۸ واحد. با ۲۰ واحد چند تا؟', titleFa: 'مسئله', display: '۸ با ۲۰', optionsFa: ['۳', '۱', '۲'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: '۱۵ واحد داری، کالا ۱۲. چقدر می‌ماند؟', titleFa: 'باقی', display: '۱۵ − ۱۲', optionsFa: ['۲', '۳', '۴', '۱'], expectedOptionIndex: 1 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK026',
        variants: [
          { level: 'SUPPORTED', promptFa: '۱۰ + ۵ چند؟', titleFa: 'جمع', display: '۱۰+۵', optionsFa: ['۵', '۱۵'], expectedOptionIndex: 1 },
          { level: 'CORE', promptFa: '۲۰ − ۱۰ چند؟', titleFa: 'تفریق', display: '۲۰−۱۰', optionsFa: ['۵', '۱۰', '۱۵'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: 'برای خرید ۲۵ واحدی، چند ده‌تایی کامل لازم است حداقل؟', titleFa: 'برآورد', display: '۲۵', optionsFa: ['۲', '۱', '۵', '۳'], expectedOptionIndex: 3 },
        ],
      },
    ],
  },
  {
    stationId: 'ST20',
    code: 'G1-ST20-CH-01',
    definitionId: '2f0d0000-0000-4000-8000-000000000020',
    gameCode: 'G1-GAME-001',
    evaluatorVersion: 'st20-ch-twodigit-v1',
    rounds: [
      {
        roundIndex: 0,
        skillId: 'G1-SK023',
        variants: [
          { level: 'SUPPORTED', promptFa: 'عدد ۲۳ را چگونه می‌خوانی؟', titleFa: 'دورقمی', display: '۲۳', optionsFa: ['بیست و سه', 'دو و سه'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: 'کدام عدد دورقمی است؟', titleFa: 'تشخیص', display: '۷، ۱۴، ۵', optionsFa: ['۷', '۱۴', '۵'], expectedOptionIndex: 1 },
          { level: 'STRETCH', promptFa: '۴۵ یعنی چند ده و چند یکی؟', titleFa: 'ارزش مکانی', display: '۴۵', optionsFa: ['۴ و ۵', '۵ و ۴', '۴۵ یکی', '۴'], expectedOptionIndex: 0 },
        ],
      },
      {
        roundIndex: 1,
        skillId: 'G1-SK022',
        variants: [
          { level: 'SUPPORTED', promptFa: '۱ ده و ۷ یکی کدام عدد است؟', titleFa: 'ساخت', display: '۱۰+۷', optionsFa: ['۱۷', '۷۱'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۳ ده و ۰ یکی کدام است؟', titleFa: 'ساخت', display: '۳۰+۰', optionsFa: ['۳۰', '۳', '۳۳'], expectedOptionIndex: 0 },
          { level: 'STRETCH', promptFa: 'کدام درست است؟', titleFa: 'انتخاب', display: '۲۸', optionsFa: ['۸ ده و ۲ یکی', '۲۸ ده', '۲ ده و ۸ یکی', 'فقط ۸'], expectedOptionIndex: 2 },
        ],
      },
      {
        roundIndex: 2,
        skillId: 'G1-SK020',
        variants: [
          { level: 'SUPPORTED', promptFa: '۲۵ و ۵۲ کدام بزرگ‌تر است؟', titleFa: 'مقایسه', display: '۲۵ و ۵۲', optionsFa: ['۵۲', '۲۵'], expectedOptionIndex: 0 },
          { level: 'CORE', promptFa: '۳۰ و ۲۹ کدام کوچک‌تر؟', titleFa: 'مقایسه', display: '۳۰ ؟ ۲۹', optionsFa: ['۳۰', 'برابر', '۲۹'], expectedOptionIndex: 2 },
          { level: 'STRETCH', promptFa: 'ترتیب از کوچک به بزرگ؟', titleFa: 'ترتیب', display: '۴۱، ۱۴، ۲۴', optionsFa: ['۱۴-۲۴-۴۱', '۴۱-۲۴-۱۴', '۲۴-۱۴-۴۱', 'فقط ۴۱'], expectedOptionIndex: 0 },
        ],
      },
    ],
  },
];

export function p10BatchDDepthViolations(seeds: readonly DepthChallengeSeed[] = P10_BATCH_D_DEPTH): string[] {
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
