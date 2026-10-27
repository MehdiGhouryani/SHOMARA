import { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useReduceMotion } from './useReduceMotionV2';
import { M2 } from './tokens';
import { CHARACTER_ART } from '../v1/characters';

/**
 * Central character facade (DESIGN guides/MOTION_AND_CHARACTERS.md): the five real SHOMARA
 * characters through their nine existing WebP poses — no invented assets, no fake `.riv`
 * state machines. A future Rive renderer replaces only the pose resolution inside this file;
 * screens keep this API. Poses are limited: characters without an emotion's artwork show a
 * stable image instead (documented fallback map, never a fabricated new pose).
 */

export type ShomaraCharacterId = 'main' | 'number' | 'dana' | 'fandogh' | 'roka';
export type CharacterEmotion = 'idle' | 'guide' | 'thinking' | 'correct' | 'retry' | 'celebrate';

/** Documented fallback map: emotion → pose key per character (limited art is honest, not hidden). */
const POSE: Record<ShomaraCharacterId, Record<CharacterEmotion, keyof typeof CHARACTER_ART>> = {
  main: { idle: 'main-front', guide: 'main-wave', thinking: 'main-thinking', correct: 'main-celebrate', retry: 'main-thinking', celebrate: 'main-celebrate' },
  number: { idle: 'number-front', guide: 'number-front', thinking: 'number-yawning', correct: 'number-front', retry: 'number-front', celebrate: 'number-front' },
  dana: { idle: 'dana-portrait', guide: 'dana-portrait', thinking: 'dana-portrait', correct: 'dana-portrait', retry: 'dana-portrait', celebrate: 'dana-portrait' },
  fandogh: { idle: 'fandogh-portrait', guide: 'fandogh-portrait', thinking: 'fandogh-portrait', correct: 'fandogh-portrait', retry: 'fandogh-portrait', celebrate: 'fandogh-portrait' },
  roka: { idle: 'roka-trophy', guide: 'roka-trophy', thinking: 'roka-trophy', correct: 'roka-trophy', retry: 'roka-trophy', celebrate: 'roka-trophy' },
};

type Props = {
  characterId: ShomaraCharacterId;
  emotion?: CharacterEmotion;
  /** Resolved from component tokens/layout at the call site; never a random per-screen number. */
  size: number;
  accessibilityLabel?: string | undefined;
  /** Decorative characters are hidden from the screen reader. */
  decorative?: boolean | undefined;
  /** Very subtle idle bob; never runs under reduce-motion. */
  idleBob?: boolean | undefined;
  /** Portrait art (Dana/Fandogh) is verified as `cover` inside a circular frame; full-body art is `contain`. */
  fit?: 'contain' | 'cover' | undefined;
};

export function Character({ characterId, emotion = 'idle', size, accessibilityLabel, decorative = false, idleBob = false, fit = 'contain' }: Props) {
  const reduced = useReduceMotion();
  const y = useSharedValue(0);
  useEffect(() => {
    if (idleBob && !reduced) y.value = withRepeat(withTiming(-6, { duration: M2.slow }), -1, true);
    else y.value = 0;
    return undefined;
  }, [idleBob, reduced, y]);
  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  const image = (
    <Image
      source={CHARACTER_ART[POSE[characterId][emotion]]}
      style={{ width: size, height: size, resizeMode: fit }}
    />
  );
  return (
    <Animated.View
      style={[styles.spot, { width: size, height: size, borderRadius: fit === 'cover' ? size / 2 : 0, overflow: 'hidden' }, animated]}
      accessibilityRole="image"
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'auto'}
      accessible={!decorative}
    >
      {image}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  spot: { alignItems: 'center', justifyContent: 'center' },
});
