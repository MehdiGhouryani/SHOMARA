import type { ImageSourcePropType } from 'react-native';

/**
 * Character art used by the approved pages. Pose names describe what the image SHOWS; the file names
 * in the handoff pack are unreliable for Number and Roka (see assets/characters-v1/PROVENANCE.json).
 */
export const CHARACTER_ART = {
  'main-wave': require('../../../assets/characters-v1/main-wave.webp'),
  'main-thinking': require('../../../assets/characters-v1/main-thinking.webp'),
  'main-front': require('../../../assets/characters-v1/main-front.webp'),
  'main-celebrate': require('../../../assets/characters-v1/main-celebrate.webp'),
  'number-yawning': require('../../../assets/characters-v1/number-yawning.webp'),
  'number-front': require('../../../assets/characters-v1/number-front.webp'),
  'roka-trophy': require('../../../assets/characters-v1/roka-trophy.webp'),
  'dana-portrait': require('../../../assets/characters-v1/dana-portrait.webp'),
  'fandogh-portrait': require('../../../assets/characters-v1/fandogh-portrait.webp'),
} as const satisfies Record<string, ImageSourcePropType>;

export type CharacterPose = keyof typeof CHARACTER_ART;

import { CHARACTER_SIZE } from './characterSizes';
export { CHARACTER_SIZE };

// Compile-time guarantee that every pose has a size and vice versa.
const _sizesMatchArt: Record<CharacterPose, { width: number; height: number }> = CHARACTER_SIZE;
void _sizesMatchArt;
