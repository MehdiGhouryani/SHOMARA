export const LESSON_STAGES = [
  'ENTRY',
  'LEARN',
  'GUIDED',
  'GAME_PATTERN',
  'GAME_COUNT',
  'INDEPENDENT',
  'REVIEW',
  'TRANSFER',
  'CHECK_A',
  'CHECK_B',
  'MASTERY_CHECK',
  'RECOVERY',
  'RECHECK',
  'RESULT',
  'COMPLETE',
] as const;

export type LessonStage = (typeof LESSON_STAGES)[number];
export type LessonStageKind = 'TEACH' | 'PRACTICE' | 'ASSESSMENT' | 'RECOVERY' | 'RESULT';
export type LessonFeedbackState = 'IDLE' | 'CHECKING' | 'CORRECT' | 'TRY_AGAIN' | 'RECOVERY' | 'RECHECK' | 'SYNC_PENDING' | 'ERROR';

export interface LessonStageMeta {
  label: string;
  kind: LessonStageKind;
  showCharacter: boolean;
  primaryAction: 'CONTINUE' | 'CHECK' | 'RETRY' | 'NEXT' | 'EXIT';
}

export const LESSON_STAGE_META: Record<LessonStage, LessonStageMeta> = {
  ENTRY: { label: 'آماده‌سازی', kind: 'RESULT', showCharacter: true, primaryAction: 'EXIT' },
  LEARN: { label: 'یاد می‌گیریم', kind: 'TEACH', showCharacter: true, primaryAction: 'CONTINUE' },
  GUIDED: { label: 'با هم تمرین می‌کنیم', kind: 'PRACTICE', showCharacter: true, primaryAction: 'CHECK' },
  GAME_PATTERN: { label: 'بازی الگو', kind: 'PRACTICE', showCharacter: true, primaryAction: 'CHECK' },
  GAME_COUNT: { label: 'بازی شمارش', kind: 'PRACTICE', showCharacter: true, primaryAction: 'CHECK' },
  INDEPENDENT: { label: 'خودت امتحان کن', kind: 'PRACTICE', showCharacter: true, primaryAction: 'CHECK' },
  REVIEW: { label: 'مرور', kind: 'PRACTICE', showCharacter: true, primaryAction: 'CHECK' },
  TRANSFER: { label: 'در یک موقعیت تازه', kind: 'PRACTICE', showCharacter: true, primaryAction: 'CHECK' },
  CHECK_A: { label: 'بررسی مهارت', kind: 'ASSESSMENT', showCharacter: false, primaryAction: 'CHECK' },
  CHECK_B: { label: 'بررسی دوباره', kind: 'ASSESSMENT', showCharacter: false, primaryAction: 'CHECK' },
  MASTERY_CHECK: { label: 'ارزیابی نهایی', kind: 'ASSESSMENT', showCharacter: false, primaryAction: 'CHECK' },
  RECOVERY: { label: 'راه ساده‌تر', kind: 'RECOVERY', showCharacter: true, primaryAction: 'CHECK' },
  RECHECK: { label: 'یک بار دیگر بررسی کنیم', kind: 'RECOVERY', showCharacter: false, primaryAction: 'CHECK' },
  RESULT: { label: 'بازخورد', kind: 'RESULT', showCharacter: true, primaryAction: 'NEXT' },
  COMPLETE: { label: 'پایان ایستگاه', kind: 'RESULT', showCharacter: true, primaryAction: 'EXIT' },
};

export function isLessonAssessment(stage: LessonStage): boolean {
  return LESSON_STAGE_META[stage].kind === 'ASSESSMENT';
}

export function isLessonInteractive(stage: LessonStage): boolean {
  return ['PRACTICE', 'RECOVERY', 'ASSESSMENT', 'TEACH'].includes(LESSON_STAGE_META[stage].kind);
}
