import type { FeedbackHaptic } from '@math/contracts';

/**
 * Android Vibration patterns (ms). Short and soft by design: a wrong answer is a
 * gentle nudge, never an alarm. `null` = no vibration.
 */
export const HAPTIC_PATTERN: Readonly<Record<FeedbackHaptic, number | number[] | null>> = {
  NONE: null,
  LIGHT: 8,
  SUCCESS: [0, 12, 50, 18],
  SOFT_NUDGE: 10,
  CELEBRATE: [0, 14, 55, 20, 65, 26],
};

export function hapticPatternFor(haptic: FeedbackHaptic): number | number[] | null {
  return HAPTIC_PATTERN[haptic];
}

/** Total vibration time of a pattern; used by tests to keep haptics inside the feedback budget. */
export function hapticDurationMs(pattern: number | number[] | null): number {
  if (pattern === null) return 0;
  return Array.isArray(pattern) ? pattern.reduce((sum, value) => sum + value, 0) : pattern;
}
