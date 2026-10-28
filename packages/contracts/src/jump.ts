/** Child-facing Jump Assessment contract. Correct answers stay server-side in production. */
export const JUMP_PASS_THRESHOLD = 0.8;
export const JUMP_QUESTION_COUNT = 5;

export interface JumpQuestion {
  id: string;
  targetStationId: string;
  prompt: string;
  options: readonly string[];
}

export interface JumpAssessmentDefinition {
  id: string;
  fromUnitId: string;
  targetUnitId: string;
  targetStationId: string;
  title: string;
  intro: string;
  questions: readonly JumpQuestion[];
}

export const JUMP_ASSESSMENTS: readonly JumpAssessmentDefinition[] = [
  {
    id: 'JUMP-U02', fromUnitId: 'G1-U01', targetUnitId: 'G1-U02', targetStationId: 'ST06',
    title: 'آماده‌ای جلوتر بروی؟', intro: 'پنج سؤال کوتاه از چیزهایی که در واحد بعد لازم داری.',
    questions: [
      { id: 'J02-01', targetStationId: 'ST06', prompt: '۳ مهره داریم. ۲ مهره دیگر اضافه کنیم، چندتا می‌شود؟', options: ['۴', '۵', '۶'] },
      { id: 'J02-02', targetStationId: 'ST06', prompt: 'کدام عدد بزرگ‌تر است؟', options: ['۱', '۲', '۳'] },
      { id: 'J02-03', targetStationId: 'ST06', prompt: 'جای خالی را پیدا کن: ۱، ۲، __، ۴', options: ['۲', '۳', '۵'] },
      { id: 'J02-04', targetStationId: 'ST06', prompt: '۴ تا از ۵ تا کم کنیم، چندتا می‌ماند؟', options: ['۱', '۲', '۳'] },
      { id: 'J02-05', targetStationId: 'ST06', prompt: 'کدام گروه بیشتر است؟', options: ['●●', '●●●', '●'] },
    ],
  },
  {
    id: 'JUMP-U03', fromUnitId: 'G1-U02', targetUnitId: 'G1-U03', targetStationId: 'ST11',
    title: 'یک پرش دیگر؟', intro: 'مهارت‌های پایه را در پنج سؤال بررسی کن.',
    questions: [
      { id: 'J03-01', targetStationId: 'ST11', prompt: '۷ و ۸؛ کدام بزرگ‌تر است؟', options: ['۷', '۸', 'هر دو'] },
      { id: 'J03-02', targetStationId: 'ST11', prompt: '۲ + ۳ = ؟', options: ['۴', '۵', '۶'] },
      { id: 'J03-03', targetStationId: 'ST11', prompt: 'کدام دو گروه برابرند؟', options: ['●● و ●', '●● و ●●', '● و ●●●'] },
      { id: 'J03-04', targetStationId: 'ST11', prompt: '۹ بعد از کدام عدد می‌آید؟', options: ['۷', '۸', '۱۰'] },
      { id: 'J03-05', targetStationId: 'ST11', prompt: '۵ − ۲ = ؟', options: ['۲', '۳', '۴'] },
    ],
  },
  {
    id: 'JUMP-U04', fromUnitId: 'G1-U03', targetUnitId: 'G1-U04', targetStationId: 'ST16',
    title: 'می‌خواهی جلوتر بروی؟', intro: 'پنج سؤال از جمع، تفریق و عددها.',
    questions: [
      { id: 'J04-01', targetStationId: 'ST16', prompt: '۶ + ۴ = ؟', options: ['۹', '۱۰', '۱۱'] },
      { id: 'J04-02', targetStationId: 'ST16', prompt: '۱۲ بعد از کدام عدد می‌آید؟', options: ['۱۰', '۱۱', '۱۳'] },
      { id: 'J04-03', targetStationId: 'ST16', prompt: '۱۴ − ۵ = ؟', options: ['۸', '۹', '۱۰'] },
      { id: 'J04-04', targetStationId: 'ST16', prompt: 'کدام عدد کوچک‌تر است؟', options: ['۱۶', '۱۳', '۱۵'] },
      { id: 'J04-05', targetStationId: 'ST16', prompt: '۸ + ۲ = ؟', options: ['۹', '۱۰', '۱۲'] },
    ],
  },
  {
    id: 'JUMP-U05', fromUnitId: 'G1-U04', targetUnitId: 'G1-U05', targetStationId: 'ST21',
    title: 'آماده آخرین بخش؟', intro: 'پنج سؤال برای سنجیدن آمادگی واحد بعد.',
    questions: [
      { id: 'J05-01', targetStationId: 'ST21', prompt: '۲۰ + ۵ = ؟', options: ['۲۳', '۲۵', '۳۰'] },
      { id: 'J05-02', targetStationId: 'ST21', prompt: 'کدام عدد به ۳۰ نزدیک‌تر است؟', options: ['۲۴', '۲۹', '۳۵'] },
      { id: 'J05-03', targetStationId: 'ST21', prompt: '۳۰ − ۱۰ = ؟', options: ['۱۰', '۲۰', '۳۰'] },
      { id: 'J05-04', targetStationId: 'ST21', prompt: 'بعد از ۳۹ کدام عدد می‌آید؟', options: ['۳۸', '۴۰', '۴۱'] },
      { id: 'J05-05', targetStationId: 'ST21', prompt: 'کدام تعداد بیشتر است؟', options: ['۱۰', '۸', '۹'] },
    ],
  },
] as const;

export function jumpAssessmentForTarget(targetStationId: string): JumpAssessmentDefinition | null {
  return JUMP_ASSESSMENTS.find((item) => item.targetStationId === targetStationId) ?? null;
}
