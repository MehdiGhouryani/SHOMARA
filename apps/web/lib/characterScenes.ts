import { resolveGuide, type GuideId, type GuideScene } from '@math/contracts';

export type LessonNodeType = 'COUNT' | 'PATTERN' | 'WONDER_GRID' | 'TALLY' | 'SYMMETRY' | 'SCALE' | 'CHECK' | 'CHEST';

/** Character bible v2 §5 + characters-v2.json allowedScenes: which scene a path node is. */
export const NODE_SCENE: Readonly<Record<LessonNodeType, GuideScene>> = {
  COUNT: 'counting-intro',
  TALLY: 'counting-intro',
  PATTERN: 'pattern-intro',
  WONDER_GRID: 'shape-intro',
  SYMMETRY: 'symmetry',
  SCALE: 'lesson-intro',
  CHECK: 'assessment',
  CHEST: 'reward',
};

/** Guide shown in a lesson node, or null when no guide may render (assessment). */
export function lessonGuideFor(companionId: string, nodeType: LessonNodeType): GuideId | null {
  return resolveGuide(companionId, NODE_SCENE[nodeType] ?? 'lesson-intro');
}
