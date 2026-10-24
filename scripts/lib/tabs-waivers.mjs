/**
 * Practice/Me-tab features that the approved pages 13 and 14 (ADR-0035, Stage U7) do not draw.
 *
 * The domain logic behind each waiver stays in the codebase and keeps being verified elsewhere. What is
 * waived is only the assertion "the tab source contains X", because the approved page replaced X.
 * `verify-ui-v1-tabs.mjs` pins this list; adding a waiver means editing it here, in review.
 */
export const TABS_UI_WAIVERS = [
  {
    id: 'practice-habit-card',
    verifier: 'verify-phase-d-practice-habit.mjs',
    feature: 'one-tap recommendation card and habit line on the Practice tab (page 13 draws rows and one start button)',
    stillVerified: 'pickRecommendedPractice and softDailyHabitForGrade stay wired (habit copy read by screen readers); one primary action still opens the recommended station',
    restoreIn: 'an approved practice page that draws a habit/recommendation card again',
  },
  {
    id: 'practice-touch-tokens',
    verifier: 'verify-uiux-phase7.mjs',
    feature: 'DS.size.touchPrimary/minHeight literals in the practice screen source (page 13 is built from ui/v1)',
    stillVerified: 'every control is a ui/v1 component; the touchTargets test enforces the 48px minimum app-wide',
    restoreIn: 'not needed while the tab is built from ui/v1',
  },
  {
    id: 'practice-see-path',
    verifier: 'verify-uiux-phase7-5.mjs',
    feature: '"دیدن مسیر" secondary link on the Practice tab (page 13 has no such link)',
    stillVerified: 'the three-tab bar navigates to the path; the web practice view keeps the link',
    restoreIn: 'an approved practice page that draws a path link',
  },
  {
    id: 'profile-counter-copy',
    verifier: 'verify-phase-e-me-surface.mjs',
    feature: '"دستاورد واقعی" counter label drawn on the Me tab (page 14 replaced the counters with the n-of-25 progress)',
    stillVerified: 'the unlocked count is computed and read by screen readers through S.me.achievementsA11y; the copy lives in strings.fa.ts',
    restoreIn: 'an approved me page that draws counters again',
  },
  {
    id: 'profile-action-subtitle',
    verifier: 'verify-phase-e-me-surface.mjs',
    feature: '"با پیشرفت مسیر" literal in profile.tsx (the subtitle now comes from strings.fa.ts)',
    stillVerified: 'the تغییر ظاهر action row and its subtitle are still rendered on the Me tab',
    restoreIn: 'not needed while the copy lives in strings.fa.ts',
  },
];

export const isTabsWaived = (id) => TABS_UI_WAIVERS.some((w) => w.id === id);
export const tabsWaiverNote = (id) => {
  const w = TABS_UI_WAIVERS.find((x) => x.id === id);
  return w ? `WAIVED ${w.id} (ADR-0035 U7): ${w.feature}; still verified: ${w.stillVerified}; restore: ${w.restoreIn}` : '';
};
