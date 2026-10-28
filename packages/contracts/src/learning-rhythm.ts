/**
 * P11 — Learning rhythm (non-punitive).
 *
 * - Counts distinct local calendar days with meaningful learning activity.
 * - Never consecutive-day streaks; never reward loss for a missed day.
 * - Reminders are optional and must be disableable.
 * - Notification / open-app / idle time are NOT meaningful learning.
 */
export const LEARNING_RHYTHM_VERSION = '2026-10-05-p11-v1' as const;

/** Events that may mark a day as meaningful (server or mirrored client facts). */
export const MEANINGFUL_LEARNING_EVENT_TYPES = [
  'STATION_ENCOUNTER_COMPLETED',
  'STATION_PASSED',
  'CHALLENGE_COMPLETED',
  'MISSION_STEP_COMPLETED',
  'PRACTICE_ENCOUNTER_COMPLETED',
] as const;

export type MeaningfulLearningEventType = (typeof MEANINGFUL_LEARNING_EVENT_TYPES)[number];

/** Explicitly never count these toward rhythm. */
export const NON_MEANINGFUL_EVENT_TYPES = [
  'APP_OPENED',
  'SCREEN_VIEWED',
  'TIME_SPENT',
  'IDLE',
  'NOTIFICATION_SENT',
  'NOTIFICATION_OPENED',
  'SETTINGS_CHANGED',
] as const;

export interface MeaningfulLearningEvent {
  type: MeaningfulLearningEventType;
  /** ISO timestamp when the learning fact was accepted. */
  occurredAt: string;
}

export interface RhythmReminderPolicy {
  /** Child/parent can turn this off. Default soft-on is product choice; disable must work. */
  enabled: boolean;
  /** Max gentle reminders per local calendar week. */
  maxPerWeek: number;
  /** Quiet hours local (inclusive start, exclusive end) — no scheduling in this window. */
  quietHoursLocal: { startHour: number; endHour: number };
}

export const DEFAULT_RHYTHM_REMINDER_POLICY: RhythmReminderPolicy = {
  enabled: false, // opt-in: safer for Grade 1 until parent/child chooses
  maxPerWeek: 3,
  quietHoursLocal: { startHour: 21, endHour: 8 },
};

export interface LearningRhythmProjection {
  engineVersion: string;
  /** Local day keys YYYY-MM-DD with ≥1 meaningful event (this week window). */
  meaningfulDaysThisWeek: readonly string[];
  meaningfulDayCountThisWeek: number;
  /** Soft weekly aim — informational only, never a penalty threshold. */
  softWeeklyAimDays: number;
  todayLocal: string;
  todayHasMeaningfulLearning: boolean;
  /** One gentle line for the child (no shame). */
  statusCopyFa: string;
  /** Suggested next step — navigation hint only. */
  nextSuggestion: {
    kind: 'CONTINUE_PATH' | 'TODAY_MISSION' | 'REST';
    labelFa: string;
  };
  reminder: RhythmReminderPolicy;
  /** Product invariants. */
  usesStreak: false;
  penalizesMissedDays: false;
  countsPassiveAppTime: false;
  notificationIsLearningTruth: false;
}

export function localDayKeyFromIso(iso: string, timeZone = 'Asia/Tehran'): string {
  // Prefer Intl so server/client share the same calendar day in product TZ.
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return fmt.format(new Date(iso)); // en-CA → YYYY-MM-DD
  } catch {
    return iso.slice(0, 10);
  }
}

/** Monday-start week keys containing `todayLocal` (7 day keys). */
export function weekDayKeysContaining(todayLocal: string): string[] {
  const [y, m, d] = todayLocal.split('-').map(Number);
  const date = new Date(Date.UTC(y!, m! - 1, d!));
  // JS: 0 Sun … 6 Sat → shift so Monday = 0
  const dow = (date.getUTCDay() + 6) % 7;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - dow);
  const keys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setUTCDate(monday.getUTCDate() + i);
    const yy = cur.getUTCFullYear();
    const mm = String(cur.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(cur.getUTCDate()).padStart(2, '0');
    keys.push(`${yy}-${mm}-${dd}`);
  }
  return keys;
}

export function meaningfulDaysFromEvents(
  events: readonly MeaningfulLearningEvent[],
  weekKeys: readonly string[],
  timeZone = 'Asia/Tehran',
): string[] {
  const week = new Set(weekKeys);
  const days = new Set<string>();
  for (const e of events) {
    if (!(MEANINGFUL_LEARNING_EVENT_TYPES as readonly string[]).includes(e.type)) continue;
    const day = localDayKeyFromIso(e.occurredAt, timeZone);
    if (week.has(day)) days.add(day);
  }
  return [...days].sort();
}

export function buildLearningRhythmProjection(input: {
  events: readonly MeaningfulLearningEvent[];
  todayLocal: string;
  timeZone?: string;
  reminder?: Partial<RhythmReminderPolicy>;
  softWeeklyAimDays?: number;
  pathHasContinue?: boolean;
  missionAvailable?: boolean;
}): LearningRhythmProjection {
  const timeZone = input.timeZone ?? 'Asia/Tehran';
  const weekKeys = weekDayKeysContaining(input.todayLocal);
  const days = meaningfulDaysFromEvents(input.events, weekKeys, timeZone);
  const todayHas = days.includes(input.todayLocal);
  const aim = input.softWeeklyAimDays ?? 3;
  const reminder: RhythmReminderPolicy = {
    ...DEFAULT_RHYTHM_REMINDER_POLICY,
    ...input.reminder,
  };

  let statusCopyFa: string;
  if (todayHas) {
    statusCopyFa = 'امروز یک قدم یادگیری برداشتی. آفرین.';
  } else if (days.length === 0) {
    statusCopyFa = 'هر وقت آماده بودی، یک فعالیت کوچک کافی است.';
  } else {
    statusCopyFa = 'این هفته چند روز یاد گرفتی. هر روز اجباری نیست.';
  }

  let nextSuggestion: LearningRhythmProjection['nextSuggestion'];
  if (todayHas && !input.missionAvailable) {
    nextSuggestion = { kind: 'REST', labelFa: 'اگر خواستی استراحت کن؛ فردا هم می‌آییم.' };
  } else if (input.missionAvailable) {
    nextSuggestion = { kind: 'TODAY_MISSION', labelFa: 'ماموریت‌های امروز را ببین' };
  } else if (input.pathHasContinue !== false) {
    nextSuggestion = { kind: 'CONTINUE_PATH', labelFa: 'ادامه مسیر' };
  } else {
    nextSuggestion = { kind: 'REST', labelFa: 'هر وقت آماده بودی برگرد.' };
  }

  return {
    engineVersion: LEARNING_RHYTHM_VERSION,
    meaningfulDaysThisWeek: days,
    meaningfulDayCountThisWeek: days.length,
    softWeeklyAimDays: aim,
    todayLocal: input.todayLocal,
    todayHasMeaningfulLearning: todayHas,
    statusCopyFa,
    nextSuggestion,
    reminder,
    usesStreak: false,
    penalizesMissedDays: false,
    countsPassiveAppTime: false,
    notificationIsLearningTruth: false,
  };
}

/** Copy lint: reject shame/pressure phrases in rhythm UI. */
export const RHYTHM_FORBIDDEN_COPY_FA = [
  'رشته',
  'شکست',
  'باختی',
  'عقب افتاد',
  'از دست دادی',
  'جریمه',
  'تنبیه',
  'زود باش',
  'فقط امروز',
  'دیگه دیر',
] as const;

export function rhythmCopyViolations(text: string): string[] {
  const v: string[] = [];
  for (const bad of RHYTHM_FORBIDDEN_COPY_FA) {
    if (text.includes(bad)) v.push(`FORBIDDEN_COPY:${bad}`);
  }
  return v;
}
