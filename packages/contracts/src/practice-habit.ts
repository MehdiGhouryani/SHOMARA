/**
 * Phase D — soft practice habit helpers (presentation only).
 * No punitive streaks, no XP/gems, no pressure language.
 */
import {
  PRACTICE_GAMES,
  canOpenPracticeStation,
  type PracticeGameDefinition,
} from './practice';
import { ageBandForGrade } from './grade-experience';

export interface SoftDailyHabit {
  /** One-line child-facing goal (never "or else"). */
  goalFa: string;
  /** Optional secondary reassurance. */
  reassuranceFa: string;
  /** Suggested minutes upper bound for UI chip. */
  minutesHint: number;
}

/**
 * Pick today's recommended practice game: first openable, else first game.
 */
export function pickRecommendedPractice(args: {
  completedStationIds: readonly string[];
  games?: readonly PracticeGameDefinition[];
}): PracticeGameDefinition {
  const games = args.games ?? PRACTICE_GAMES;
  const open = games.find((g) => canOpenPracticeStation(g.stationId, args.completedStationIds));
  return open ?? games[0]!;
}

/** Soft daily habit line by age band — optional, never blocking. */
export function softDailyHabitForGrade(gradeId?: string | null): SoftDailyHabit {
  const band = ageBandForGrade(gradeId);
  if (band === 'EARLY') {
    return {
      goalFa: 'امروز یک تمرین کوتاه کافی است',
      reassuranceFa: 'اگر امروز نشد، اشکالی ندارد.',
      minutesHint: 5,
    };
  }
  if (band === 'MIDDLE') {
    return {
      goalFa: 'امروز یک تمرین کوتاه یا ادامه مسیر',
      reassuranceFa: 'اجباری نیست؛ با ریتم خودت.',
      minutesHint: 8,
    };
  }
  return {
    goalFa: 'یک جلسه کوتاه امروز',
    reassuranceFa: 'می‌توانی هر روز یا چند بار در هفته تمرین کنی.',
    minutesHint: 12,
  };
}

/** One-tap CTA label for practice hub. */
export function practiceStartLabelFa(gradeId?: string | null): string {
  const band = ageBandForGrade(gradeId);
  if (band === 'EARLY') return 'شروع همین حالا';
  if (band === 'MIDDLE') return 'شروع تمرین امروز';
  return 'شروع جلسه';
}

export function practiceHabitViolations(): string[] {
  const v: string[] = [];
  for (const g of ['G1', 'G3', 'G6'] as const) {
    const h = softDailyHabitForGrade(g);
    if (!h.goalFa.trim()) v.push(`EMPTY_GOAL_${g}`);
    for (const bad of ['وگرنه', 'از دست می‌دهی', 'سوزاندن', 'باختی', 'استریک']) {
      if (h.goalFa.includes(bad) || h.reassuranceFa.includes(bad)) v.push(`PRESSURE_${g}:${bad}`);
    }
  }
  const rec = pickRecommendedPractice({ completedStationIds: [] });
  if (!rec?.id) v.push('NO_RECOMMENDED_GAME');
  return v;
}
