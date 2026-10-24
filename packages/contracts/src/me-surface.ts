/**
 * Phase E — Me / Parent / Avatar presentation helpers (no learning truth).
 */
import { ageBandForGrade, experienceForGrade, sessionLengthHintFa } from './grade-experience';
import { G1_STATIONS } from './progression';

export interface ParentProgressSummary {
  completedCount: number;
  totalStations: number;
  /** Rough minutes practiced = sum of estimatedMinutes of completed stations. */
  approxMinutes: number;
  currentStationLabelFa: string;
  sessionHintFa: string;
  guidanceFa: string;
  emptyFa: string;
}

export function buildParentProgressSummary(args: {
  gradeId?: string | null;
  completedStationIds: readonly string[];
  stations?: readonly { id: string; number: number; title: string; estimatedMinutes: number }[];
}): ParentProgressSummary {
  const stations = args.stations ?? G1_STATIONS;
  const done = new Set(args.completedStationIds);
  let approxMinutes = 0;
  let next: { number: number; title: string } | null = null;
  for (const s of stations) {
    if (done.has(s.id)) approxMinutes += s.estimatedMinutes;
    else if (!next) next = { number: s.number, title: s.title };
  }
  const completedCount = args.completedStationIds.filter((id) => stations.some((s) => s.id === id)).length;
  const band = ageBandForGrade(args.gradeId);
  const guidanceFa =
    band === 'EARLY'
      ? `جلسهٔ کوتاه کافی است (حدود ${sessionLengthHintFa(args.gradeId)}). اجبار نکنید.`
      : `پیشنهاد جلسه: ${sessionLengthHintFa(args.gradeId)}. ریتم کودک را دنبال کنید.`;

  return {
    completedCount,
    totalStations: stations.length,
    approxMinutes,
    currentStationLabelFa: next
      ? `ایستگاه ${next.number}: ${next.title}`
      : completedCount >= stations.length
        ? 'مسیر این پایه تمام شده'
        : 'در حال آماده‌سازی',
    sessionHintFa: sessionLengthHintFa(args.gradeId),
    guidanceFa,
    emptyFa: 'هنوز ایستگاهی تمام نشده؛ با اولین تمرین شروع می‌شود.',
  };
}

/** How many secondary action rows to stress on Profile for this age band. */
export function profileActionDensity(gradeId?: string | null): 'MINIMAL' | 'STANDARD' {
  return ageBandForGrade(gradeId) === 'EARLY' ? 'MINIMAL' : 'STANDARD';
}

/** Parent-first reminder copy for settings / parent screen. */
export function reminderControlCopyFa(gradeId?: string | null): { titleFa: string; bodyFa: string } {
  const emphasis = experienceForGrade(gradeId).parentEmphasis;
  if (emphasis === 'HIGH') {
    return {
      titleFa: 'یادآور فقط با نظر والدین',
      bodyFa: 'خاموش کردن یادآور هیچ جریمه‌ای ندارد. یادگیری از دست نمی‌رود.',
    };
  }
  return {
    titleFa: 'یادآور ملایم',
    bodyFa: 'اختیاری است؛ هر وقت بخواهی از تنظیمات خاموش کن.',
  };
}

/** Locked cosmetic line — progress, never purchase. */
export function cosmeticLockedHintFa(): string {
  return 'با پیشرفت مسیر باز می‌شود — خریدنی نیست';
}

export function meSurfaceViolations(): string[] {
  const v: string[] = [];
  const empty = buildParentProgressSummary({ gradeId: 'G1', completedStationIds: [] });
  if (empty.completedCount !== 0) v.push('EMPTY_NOT_ZERO');
  const full = buildParentProgressSummary({
    gradeId: 'G1',
    completedStationIds: G1_STATIONS.map((s) => s.id),
  });
  if (full.completedCount !== G1_STATIONS.length) v.push('FULL_COUNT');
  if (cosmeticLockedHintFa().includes('خرید') && !cosmeticLockedHintFa().includes('نیست')) {
    v.push('PURCHASE_PRESSURE');
  }
  return v;
}
