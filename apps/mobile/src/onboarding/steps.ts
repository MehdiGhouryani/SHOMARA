import type { OnboardingStep } from '@math/contracts';
import { toFa } from '../ui/digits';

/**
 * The approved pages count six steps ("مرحلهٔ ۲ از ۶"): welcome, phone, code, profile, placement, result.
 * Profile merges the contract's GRADE and CHILD steps, so the mobile flow never visits GRADE (the shared
 * contract keeps it because the web flow still uses it).
 */
export const FLOW_STEP_TOTAL = 6;

const STEP_NUMBER: Record<OnboardingStep, number> = {
  WELCOME: 1,
  AUTH: 2,
  OTP: 3,
  GRADE: 4,
  CHILD: 4,
  PLACEMENT: 5,
  RESULT: 6,
  SYNC_LOADING: 6,
};

export function stepNumber(step: OnboardingStep): number {
  return STEP_NUMBER[step];
}

/** Bar fill as a whole percent (the pages write 33%, 50%, 67%) and the screen-reader label. */
export function stepProgress(step: OnboardingStep): { percent: number; label: string } {
  const n = STEP_NUMBER[step];
  return { percent: Math.round((n / FLOW_STEP_TOTAL) * 100), label: `مرحلهٔ ${toFa(n)} از ${toFa(FLOW_STEP_TOTAL)}` };
}

/** Where back goes. SYNC_LOADING commits the result and is not reversible. */
export function stepBack(step: OnboardingStep): OnboardingStep | null {
  switch (step) {
    case 'AUTH':
      return 'WELCOME';
    case 'OTP':
      return 'AUTH';
    case 'GRADE':
    case 'CHILD':
      return 'OTP';
    case 'PLACEMENT':
      return 'CHILD';
    case 'RESULT':
      return 'PLACEMENT';
    default:
      return null;
  }
}

/** Resend countdown as m:ss in Persian digits (the page shows ۰:۴۵). */
export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${toFa(Math.floor(safe / 60))}:${toFa(String(safe % 60).padStart(2, '0'))}`;
}

/** Bidi-isolates a left-to-right run (digits, masked numbers) inside Persian text. */
export function ltrRun(text: string): string {
  return `\u2066${text}\u2069`;
}
