/**
 * Shomara cast v2 packaged art (mobile). Generated PNG @1x/@2x/@3x from
 * project-design-v2/source/shomara-cast.mjs. Metro picks the density suffix automatically.
 * When .riv files ship, AnimatedCharacter prefers Rive and keeps these as fallback/reduced-motion.
 */
import type { ImageSourcePropType } from 'react-native';
import type { CharacterVisualState } from '@math/contracts';
import type { CharacterId } from './characters';

type ArtKey = Lowercase<CharacterVisualState> | 'bust';

export const CHARACTER_ART: Record<CharacterId, Record<ArtKey, ImageSourcePropType>> = {
  aria: {
    idle: require('../../assets/characters/aria/idle.png'),
    think: require('../../assets/characters/aria/think.png'),
    encourage: require('../../assets/characters/aria/encourage.png'),
    correct: require('../../assets/characters/aria/correct.png'),
    celebrate: require('../../assets/characters/aria/celebrate.png'),
    recovery: require('../../assets/characters/aria/recovery.png'),
    bust: require('../../assets/characters/aria/bust.png'),
  },
  qbo: {
    idle: require('../../assets/characters/qbo/idle.png'),
    think: require('../../assets/characters/qbo/think.png'),
    encourage: require('../../assets/characters/qbo/encourage.png'),
    correct: require('../../assets/characters/qbo/correct.png'),
    celebrate: require('../../assets/characters/qbo/celebrate.png'),
    recovery: require('../../assets/characters/qbo/recovery.png'),
    bust: require('../../assets/characters/qbo/bust.png'),
  },
  dana: {
    idle: require('../../assets/characters/dana/idle.png'),
    think: require('../../assets/characters/dana/think.png'),
    encourage: require('../../assets/characters/dana/encourage.png'),
    correct: require('../../assets/characters/dana/correct.png'),
    celebrate: require('../../assets/characters/dana/celebrate.png'),
    recovery: require('../../assets/characters/dana/recovery.png'),
    bust: require('../../assets/characters/dana/bust.png'),
  },
  jiko: {
    idle: require('../../assets/characters/jiko/idle.png'),
    think: require('../../assets/characters/jiko/think.png'),
    encourage: require('../../assets/characters/jiko/encourage.png'),
    correct: require('../../assets/characters/jiko/correct.png'),
    celebrate: require('../../assets/characters/jiko/celebrate.png'),
    recovery: require('../../assets/characters/jiko/recovery.png'),
    bust: require('../../assets/characters/jiko/bust.png'),
  },
};

export function artFor(id: CharacterId, state: CharacterVisualState | 'BUST'): ImageSourcePropType {
  const key = (state === 'BUST' ? 'bust' : state.toLowerCase()) as ArtKey;
  return CHARACTER_ART[id][key];
}

/** canonical relative heights for lineups (character bible v2 §3) */
export const CAST_HEIGHT: Record<CharacterId, number> = { qbo: 1.1, aria: 1.0, dana: 0.95, jiko: 0.62 };
