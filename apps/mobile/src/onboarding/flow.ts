import {
  ONBOARDING_STEP_ORDER,
  PLACEMENT_ITEMS as CANONICAL_PLACEMENT_ITEMS,
  isValidChildAlias,
  nextOnboardingStep,
  previousOnboardingStep,
  scorePlacement as canonicalScorePlacement,
  type OnboardingStep,
} from '@math/contracts';

export const STEPS = ONBOARDING_STEP_ORDER;
export const PLACEMENT_ITEMS = CANONICAL_PLACEMENT_ITEMS;
export function isValidName(value: string): boolean { return isValidChildAlias(value); }
export function nextStep(step: OnboardingStep): OnboardingStep | null { return nextOnboardingStep(step); }
export function prevStep(step: OnboardingStep): OnboardingStep | null { return previousOnboardingStep(step); }
export function progressFraction(step: OnboardingStep): number {
  const index = Math.max(0, STEPS.indexOf(step));
  return Math.min(1, (index + 1) / STEPS.length);
}
export function scorePlacement(answers: Array<string | undefined>) { return canonicalScorePlacement(answers); }
