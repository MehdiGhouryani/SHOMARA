// Character placement contract (cast v2). Mirror of project-design-v2/specs/characters-v2.json `allowedScenes`
// and `placement.assessment.renderGuide=false`. Keep in sync; checked by apps/web/lib/characterScenes.test.ts.

export type GuideId = 'aria' | 'qbo' | 'dana' | 'jiko';

export type GuideScene =
  | 'splash' | 'home' | 'lesson-intro' | 'hint' | 'recovery' | 'outcome' | 'profile-brand'
  | 'counting-intro' | 'grouping' | 'decomposition'
  | 'pattern-intro' | 'shape-intro' | 'space' | 'symmetry'
  | 'station-pass' | 'milestone' | 'reward' | 'transfer-intro'
  | 'assessment';

export const GUIDE_IDS: readonly GuideId[] = ['aria', 'qbo', 'dana', 'jiko'];

export const CHARACTER_ALLOWED_SCENES: Readonly<Record<GuideId, readonly GuideScene[]>> = {
  aria: ['splash', 'home', 'lesson-intro', 'hint', 'recovery', 'outcome', 'profile-brand'],
  qbo: ['counting-intro', 'grouping', 'decomposition', 'hint', 'recovery', 'outcome'],
  dana: ['pattern-intro', 'shape-intro', 'space', 'symmetry', 'hint', 'recovery', 'outcome'],
  jiko: ['station-pass', 'milestone', 'reward', 'transfer-intro'],
};

/** Who speaks for a scene when the child's companion is not allowed there. */
const SCENE_SPECIALIST: Partial<Record<GuideScene, GuideId>> = {
  'counting-intro': 'qbo', grouping: 'qbo', decomposition: 'qbo',
  'pattern-intro': 'dana', 'shape-intro': 'dana', space: 'dana', symmetry: 'dana',
  'station-pass': 'jiko', milestone: 'jiko', reward: 'jiko', 'transfer-intro': 'jiko',
};

export function isGuideAllowed(id: string, scene: GuideScene): boolean {
  if (scene === 'assessment') return false;
  return (CHARACTER_ALLOWED_SCENES[id as GuideId] ?? []).includes(scene);
}

/**
 * Pick the guide for a scene. Returns null on assessment (Check A/B, mastery): no guide is rendered.
 * Order: the child's companion if allowed → the scene specialist → Aria (main guide) → first allowed.
 */
export function resolveGuide(preferred: string | undefined, scene: GuideScene): GuideId | null {
  if (scene === 'assessment') return null;
  if (preferred && isGuideAllowed(preferred, scene)) return preferred as GuideId;
  const specialist = SCENE_SPECIALIST[scene];
  if (specialist) return specialist;
  if (isGuideAllowed('aria', scene)) return 'aria';
  return GUIDE_IDS.find((g) => isGuideAllowed(g, scene)) ?? null;
}
