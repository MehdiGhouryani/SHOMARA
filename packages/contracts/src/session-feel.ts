/**
 * Phase C — session feel: warm feedback + clear session end (presentation only).
 * Never decides correctness, mastery, or rewards.
 */
import type { AgeBandId } from './grade-experience';
import { ageBandForGrade } from './grade-experience';

export type SessionOutcomeKind = 'CORRECT' | 'TRY_AGAIN' | 'ERROR';
export type SessionCompleteKind = 'STATION_PASSED' | 'PRACTICED' | 'CHALLENGE_DONE' | 'CHALLENGE_NOT_YET';

export interface SessionFeelCopy {
  titleFa: string;
  bodyFa: string;
  actionFa: string;
  /** Big glyph / emoji-safe marker for RESULT card */
  mark: string;
}

/** RESULT card after one attempt (not the whole station). */
export function sessionAttemptFeel(
  kind: SessionOutcomeKind,
  gradeId?: string | null,
): SessionFeelCopy {
  const band = ageBandForGrade(gradeId);
  if (kind === 'ERROR') {
    return {
      titleFa: 'یک لحظه صبر',
      bodyFa: 'نتوانستیم ثبت کنیم. دوباره امتحان می‌کنیم.',
      actionFa: 'دوباره',
      mark: '…',
    };
  }
  if (kind === 'CORRECT') {
    if (band === 'EARLY') {
      return {
        titleFa: 'آفرین!',
        bodyFa: 'درست بود. بریم قدم بعد.',
        actionFa: 'ادامه',
        mark: '✓',
      };
    }
    if (band === 'MIDDLE') {
      return {
        titleFa: 'عالی بود',
        bodyFa: 'پاسخت درست ثبت شد. آمادهٔ مرحله بعد؟',
        actionFa: 'ادامه بده',
        mark: '✓',
      };
    }
    return {
      titleFa: 'درست',
      bodyFa: 'پاسخ معتبر بود. می‌توانی ادامه بدهی.',
      actionFa: 'ادامه از اینجا',
      mark: '✓',
    };
  }
  // TRY_AGAIN
  if (band === 'EARLY') {
    return {
      titleFa: 'اشکالی ندارد',
      bodyFa: 'با هم یک بار دیگر امتحان می‌کنیم.',
      actionFa: 'دوباره',
      mark: '↺',
    };
  }
  if (band === 'MIDDLE') {
    return {
      titleFa: 'نزدیک بودی',
      bodyFa: 'می‌توانی دوباره امتحان کنی یا راه ساده‌تر بروی.',
      actionFa: 'ادامه بده',
      mark: '↺',
    };
  }
  return {
    titleFa: 'یک بار دیگر',
    bodyFa: 'بازبینی کن و دوباره پاسخ بده.',
    actionFa: 'ادامه',
    mark: '↺',
  };
}

/** COMPLETE card after station or challenge block. */
export function sessionCompleteFeel(
  kind: SessionCompleteKind,
  gradeId?: string | null,
): SessionFeelCopy {
  const band = ageBandForGrade(gradeId);
  if (kind === 'STATION_PASSED') {
    return {
      titleFa: band === 'EARLY' ? 'ایستگاه تمام شد!' : 'ایستگاه را تمام کردی',
      bodyFa: band === 'EARLY' ? 'آفرین، یک قدم بزرگ جلو رفتی.' : 'پیشرفت این ایستگاه ثبت شد.',
      actionFa: 'برگرد به مسیر',
      mark: '★',
    };
  }
  if (kind === 'CHALLENGE_DONE') {
    return {
      titleFa: 'چالش تمام شد',
      bodyFa: band === 'EARLY' ? 'خیلی خوب تمرین کردی!' : 'تمرین چالش ثبت شد.',
      actionFa: 'برگرد به مسیر',
      mark: '✓',
    };
  }
  if (kind === 'CHALLENGE_NOT_YET') {
    return {
      titleFa: 'تمرین خوبی بود',
      bodyFa: 'بعداً دوباره امتحان می‌کنیم. پیشرفتت مانده است.',
      actionFa: 'برگرد به مسیر',
      mark: '↺',
    };
  }
  // PRACTICED without station pass
  return {
    titleFa: band === 'EARLY' ? 'امروز تمرین کردی' : 'جلسه تمام شد',
    bodyFa: 'پیشرفت این جلسه ذخیره شد. هر وقت خواستی برگرد.',
    actionFa: 'برگرد به مسیر',
    mark: '✓',
  };
}

/**
 * Scale motion duration by age band (EARLY a bit longer to read, UPPER tighter).
 * Base durations come from FEEDBACK_BUDGET_MS / FeedbackSpec.
 */
export function scaleFeedbackDurationMs(baseMs: number, gradeId?: string | null): number {
  if (baseMs <= 0) return 0;
  const band = ageBandForGrade(gradeId);
  if (band === 'EARLY') return Math.round(baseMs * 1.15);
  if (band === 'UPPER') return Math.round(baseMs * 0.9);
  return baseMs;
}

export function sessionFeelViolations(): string[] {
  const v: string[] = [];
  for (const kind of ['CORRECT', 'TRY_AGAIN', 'ERROR'] as const) {
    const c = sessionAttemptFeel(kind, 'G1');
    if (!c.titleFa.trim() || !c.bodyFa.trim()) v.push(`EMPTY_ATTEMPT_${kind}`);
  }
  for (const kind of ['STATION_PASSED', 'PRACTICED', 'CHALLENGE_DONE', 'CHALLENGE_NOT_YET'] as const) {
    const c = sessionCompleteFeel(kind, 'G1');
    if (!c.titleFa.trim() || !c.bodyFa.trim()) v.push(`EMPTY_COMPLETE_${kind}`);
  }
  // Wrong path must never use shame language
  const retry = sessionAttemptFeel('TRY_AGAIN', 'G1');
  for (const bad of ['شکست', 'باختی', 'ضعیف', 'اشتباه کردی']) {
    if (retry.bodyFa.includes(bad) || retry.titleFa.includes(bad)) v.push(`SHAME_COPY:${bad}`);
  }
  return v;
}

/** Re-export band helper for callers that only import session-feel. */
export type { AgeBandId };
