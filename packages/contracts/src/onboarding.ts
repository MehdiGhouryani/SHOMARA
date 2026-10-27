/**
 * Canonical first-run contract shared by Web and Native.
 *
 * S01 → S02 → S03 (phone only) → S04 → S05 → S06 → S07.
 * Phone OTP is the only authentication step in the current mobile-first release.
 */
import { isGradeContentAvailable, playableGradeIds } from './grade-experience';

export type OnboardingStep =
  | 'WELCOME'
  | 'AUTH'
  | 'OTP'
  | 'GRADE'
  | 'CHILD'
  | 'PLACEMENT'
  | 'RESULT'
  | 'SYNC_LOADING';

export type AuthMethod = 'MOBILE';

export const ONBOARDING_STEP_ORDER: readonly OnboardingStep[] = [
  'WELCOME',
  'AUTH',
  'OTP',
  'GRADE',
  'CHILD',
  'PLACEMENT',
  'RESULT',
  'SYNC_LOADING',
] as const;

/**
 * Grades currently playable after onboarding.
 * Single-sourced from grade-experience content flags (Phase A).
 */
export const CURRENT_ONBOARDING_GRADE_IDS = playableGradeIds();

export interface OnboardingGradeOption {
  id: string;
  title: string;
  subtitle: string;
  available: boolean;
}

export const ONBOARDING_GRADE_OPTIONS: readonly OnboardingGradeOption[] = [
  { id: 'G1', title: 'پایه اول ابتدایی', subtitle: 'شمارش، الگوها، جمع و تفریق تا ۲۰', available: isGradeContentAvailable('G1') },
  { id: 'G2', title: 'پایه دوم ابتدایی', subtitle: 'اعداد سه‌رقمی، جمع و تفریق فرآیندی', available: isGradeContentAvailable('G2') },
  { id: 'G3', title: 'پایه سوم ابتدایی', subtitle: 'جدول ضرب، تقسیم، کسر و محیط', available: isGradeContentAvailable('G3') },
  { id: 'G4', title: 'پایه چهارم ابتدایی', subtitle: 'اعداد بزرگ، ضرب چندرقمی، زاویه و مساحت', available: isGradeContentAvailable('G4') },
  { id: 'G5', title: 'پایه پنجم ابتدایی', subtitle: 'عملیات کسرها، اعداد اعشاری، تقارن و حجم', available: isGradeContentAvailable('G5') },
  { id: 'G6', title: 'پایه ششم ابتدایی', subtitle: 'کسر، اعشار، نسبت و تناسب، درصد و آمار', available: isGradeContentAvailable('G6') },
] as const;

export type ChildAvatarPresetId = 'sun' | 'leaf' | 'cloud' | 'moon';

export interface ChildAvatarPreset {
  id: ChildAvatarPresetId;
  label: string;
  accent: string;
  soft: string;
}

export const CHILD_AVATAR_PRESETS: readonly ChildAvatarPreset[] = [
  // Colors follow the approved profile page (ADR-0035). `packages/design-system` tokens `ui.avatar` is the
  // canonical source; a unit test keeps these accents identical to it.
  { id: 'sun', label: 'خورشیدی', accent: '#E3A33B', soft: '#FFFFFF' },
  { id: 'leaf', label: 'برگ', accent: '#2B5C7A', soft: '#FFFFFF' },
  { id: 'cloud', label: 'ابری', accent: '#5E8FB0', soft: '#FFFFFF' },
  { id: 'moon', label: 'ماه', accent: '#7462E6', soft: '#FFFFFF' },
] as const;

export interface PlacementItem {
  id: 'count' | 'pattern';
  prompt: string;
  display: string;
  options: readonly string[];
  correct: string;
}

export const PLACEMENT_ITEMS: readonly PlacementItem[] = [
  {
    id: 'count',
    prompt: 'چند مهره می‌بینی؟',
    display: 'مهره  ۱ · ۲ · ۳ · ۴',
    options: ['۳', '۴', '۵'],
    correct: '۴',
  },
  {
    id: 'pattern',
    prompt: 'این الگو را ادامه بده.',
    display: 'آبی · زرد · آبی · زرد · ؟',
    options: ['آبی', 'زرد', 'سبز'],
    correct: 'آبی',
  },
] as const;

export function normalizeDigits(input: string): string {
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  const ar = '٠١٢٣٤٥٦٧٨٩';
  return input
    .replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ar.indexOf(d)))
    .trim();
}

/** Phone validation: local Iranian mobile (09xxxxxxxxx) or E.164-ish international form. */
export function isValidPhone(input: string): boolean {
  const value = normalizeDigits(input).replace(/[\s()-]/g, '');
  return /^0\d{10}$/.test(value) || /^\+?[1-9]\d{7,14}$/.test(value);
}

export function isValidOtp(input: string): boolean {
  return /^\d{6}$/.test(normalizeDigits(input));
}

export function isValidChildAlias(input: string): boolean {
  const value = input.trim();
  return value.length >= 1 && value.length <= 20;
}

export function nextOnboardingStep(step: OnboardingStep): OnboardingStep | null {
  if (step === 'AUTH') return 'OTP';
  if (step === 'OTP') return 'GRADE';
  const idx = ONBOARDING_STEP_ORDER.indexOf(step);
  return idx >= 0 && idx < ONBOARDING_STEP_ORDER.length - 1 ? ONBOARDING_STEP_ORDER[idx + 1]! : null;
}

export function previousOnboardingStep(step: OnboardingStep): OnboardingStep | null {
  // SYNC_LOADING commits the onboarding result; it is not a reversible step.
  if (step === 'SYNC_LOADING') return null;
  if (step === 'GRADE') return 'OTP';
  if (step === 'OTP') return 'AUTH';
  const idx = ONBOARDING_STEP_ORDER.indexOf(step);
  return idx > 0 ? ONBOARDING_STEP_ORDER[idx - 1]! : null;
}

export function scorePlacement(answers: readonly (string | undefined)[]): { correct: number; fastTrack: boolean } {
  const correct = PLACEMENT_ITEMS.reduce((count, item, index) => count + (answers[index] === item.correct ? 1 : 0), 0);
  return { correct, fastTrack: correct === PLACEMENT_ITEMS.length };
}
