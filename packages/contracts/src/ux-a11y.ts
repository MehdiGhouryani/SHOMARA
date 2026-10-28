/**
 * Phase F — UX accessibility policy (presentation only).
 * Child primary surfaces: large targets, RTL-safe type, one primary action.
 */

/** Minimum touch target (dp) — Apple/Material child-friendly floor. */
export const TOUCH_TARGET_MIN = 48;
/** Preferred primary CTA height. */
export const TOUCH_TARGET_PRIMARY = 56;

export type TextScaleMode = 'NORMAL' | 'LARGE';

export function textScaleFactor(largeText: boolean): number {
  return largeText ? 1.18 : 1;
}

export function scaledFontSize(base: number, largeText: boolean): number {
  return Math.round(base * textScaleFactor(largeText));
}

/** Soft max lines guidance for early readers — avoid walls of text. */
export function preferredMaxLinesForBand(ageBand: 'EARLY' | 'MIDDLE' | 'UPPER'): number {
  if (ageBand === 'EARLY') return 3;
  if (ageBand === 'MIDDLE') return 4;
  return 6;
}

/**
 * One-primary-action checklist for screen audits (docs / verify).
 * Screens should expose a single dominant CTA; secondary actions quieter.
 */
export const ONE_PRIMARY_ACTION_SCREENS = [
  'path-now-card',
  'practice-today-card',
  'station-start',
  'session-complete',
  'onboarding-step',
] as const;

export function uxA11yViolations(args?: {
  touchMin?: number;
  touchPrimary?: number;
}): string[] {
  const v: string[] = [];
  const touchMin = args?.touchMin ?? TOUCH_TARGET_MIN;
  const touchPrimary = args?.touchPrimary ?? TOUCH_TARGET_PRIMARY;
  if (touchMin < 44) v.push('TOUCH_MIN_TOO_SMALL');
  if (touchPrimary < touchMin) v.push('PRIMARY_SMALLER_THAN_MIN');
  if (textScaleFactor(true) <= 1) v.push('LARGE_TEXT_NO_SCALE');
  return v;
}
