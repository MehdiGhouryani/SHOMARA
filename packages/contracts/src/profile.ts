/** Canonical child Profile surface for UX-P08. */
export const PROFILE_SURFACE_VERSION = '2026-10-03-p08-5.1' as const;

export type AchievementIconKind = 'COUNT' | 'DIRECTION' | 'NUMBER' | 'SHAPE' | 'CALCULATION';

export interface ProfileMetricDefinition {
  id: 'STATIONS' | 'ACHIEVEMENTS';
  label: string;
}

export const CHILD_PROFILE_METRICS: readonly ProfileMetricDefinition[] = [
  { id: 'STATIONS', label: 'ایستگاه کامل' },
  { id: 'ACHIEVEMENTS', label: 'دستاورد' },
] as const;

export const PROFILE_SECONDARY_ACTIONS = [
  { id: 'AVATAR', label: 'تغییر ظاهر', destination: 'S20' as const },
  { id: 'SETTINGS', label: 'تنظیمات', destination: 'S21' as const },
  { id: 'PARENT', label: 'والدین', destination: null, adultGate: true },
] as const;

export const ACHIEVEMENT_ICON_KIND: Readonly<Record<string, AchievementIconKind>> = {
  A01: 'COUNT',
  A02: 'DIRECTION',
  A03: 'NUMBER',
  A04: 'SHAPE',
  A05: 'CALCULATION',
} as const;

export const PROFILE_RULES = {
  sections: ['IDENTITY', 'PROGRESS', 'ACHIEVEMENTS', 'ACTIONS'] as const,
  hideUnrelatedSocialSections: true,
  hideCurrencies: true,
  hideLeagues: true,
  hideTeacherEntry: true,
  hideCompanionGallery: true,
  achievementsStayOnProfile: true,
  achievementDetailIsSecondary: true,
  maxPrimaryActions: 0,
  maxSecondaryActions: 3,
} as const;

export function achievementIconKind(achievementId: string): AchievementIconKind {
  return ACHIEVEMENT_ICON_KIND[achievementId] ?? 'NUMBER';
}
