/**
 * Path-tab features that the approved path page (ADR-0035, Stage U3) does not draw.
 *
 * The domain logic behind each of them stays in the codebase and keeps being verified. What is waived is only
 * the assertion "the Path tab source contains X", because the child's home no longer shows X. Every waiver
 * names the verifier that used to assert it and the stage that has to give the feature a visible entry again.
 * `verify-ui-v1-path.mjs` pins this list: adding a waiver means editing it here, in review.
 */
export const PATH_UI_WAIVERS = [
  {
    id: 'mission-hub-entry',
    verifier: 'verify-p06-mission-engine.mjs',
    feature: 'Mission Hub entry on the Path tab',
    stillVerified: 'mission engine, contracts and the /missions route',
    restoreIn: 'U7 (practice/me) after owner decision U-Q8',
  },
  {
    id: 'rhythm-card',
    verifier: 'verify-p11-rhythm.mjs',
    feature: 'learning-rhythm card on the Path tab',
    stillVerified: 'rhythm projection logic, settings copy and preferences',
    restoreIn: 'U7 (practice/me) after owner decision U-Q8',
  },
  {
    id: 'grade-experience-density',
    verifier: 'verify-phase-a-grade-experience.mjs',
    feature: 'grade-based node density and session-time hint on the Path tab',
    stillVerified: 'grade experience contract (node sizes, practice limit, parent guidance) and primaryContinueLabelFa',
    restoreIn: 'decide in U8 whether the contract is still needed (page sizes are fixed)',
  },
  {
    id: 'now-card',
    verifier: 'verify-phase-b-path-focus.mjs',
    feature: '"now" card and active unit header on the Path tab',
    stillVerified: 'buildPathFocus, status hints (used as node accessibility hints)',
    restoreIn: 'replaced by the current node, its ring and the continue bubble (page 05)',
  },
  {
    id: 'practice-jump',
    verifier: 'verify-phase-d-practice-habit.mjs',
    feature: 'one-tap practice shortcut and its copy on the Path tab',
    stillVerified: 'practice habit logic and the practice hub',
    restoreIn: 'U7 (practice tab)',
  },
];

export const isWaived = (id) => PATH_UI_WAIVERS.some((w) => w.id === id);
export const waiverNote = (id) => {
  const w = PATH_UI_WAIVERS.find((x) => x.id === id);
  return w ? `WAIVED ${w.id} (ADR-0035 U3): ${w.feature}; still verified: ${w.stillVerified}; restore: ${w.restoreIn}` : '';
};
