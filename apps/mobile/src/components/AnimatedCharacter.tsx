import { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { RiveView, useRive, useRiveFile, Fit } from '@rive-app/react-native';
import type { CharacterVisualState } from '@math/contracts';
import { CHARACTERS, type CharacterId } from '../characters/characters';
import { artFor } from '../characters/art';
import { useReducedMotionPreference } from '../game-feel/motionPreferences';

interface AnimatedCharacterProps {
  state: CharacterVisualState;
  characterId?: CharacterId;
  /** optional .riv source; when absent (current build) the packaged v2 art is used */
  source?: string;
  size?: number;
  /** lesson mode: no looping motion (ADR: idle is static during questions) */
  staticIdle?: boolean;
}

const STATE_FA: Record<CharacterVisualState, string> = {
  IDLE: 'آرام',
  THINK: 'در حال فکر',
  ENCOURAGE: 'در حال تشویق',
  CORRECT: 'خوشحال از پاسخ',
  CELEBRATE: 'در حال جشن',
  RECOVERY: 'دلگرم‌کننده',
};

function RiveAnimationPlayer({ source }: { source: string }) {
  const { riveFile, error } = useRiveFile(source);
  const { setHybridRef } = useRive();
  if (error || !riveFile) return null;
  return <RiveView hybridRef={setHybridRef} file={riveFile} fit={Fit.Layout} style={StyleSheet.absoluteFill} />;
}

/**
 * Whole-image motion that mirrors project-design-v2/source/motion.css at sprite level.
 * Part-level motion (blink, tail, arms) arrives with the Rive rig; until then each state
 * swaps to its own drawn pose, so meaning never depends on animation.
 */
export function AnimatedCharacter({ state, characterId = 'aria', source, size = 220, staticIdle = false }: AnimatedCharacterProps) {
  const reducedMotion = useReducedMotionPreference();
  const ty = useSharedValue(0);
  const rot = useSharedValue(0);
  const sx = useSharedValue(1);
  const sy = useSharedValue(1);


  useEffect(() => {
    [ty, rot, sx, sy].forEach((v) => cancelAnimation(v));
    ty.value = 0; rot.value = 0; sx.value = 1; sy.value = 1;
    if (reducedMotion) return;
    const ease = Easing.inOut(Easing.sin);
    switch (state) {
      case 'IDLE':
        if (!staticIdle) {
          sy.value = withRepeat(withSequence(withTiming(0.988, { duration: 1700, easing: ease }), withTiming(1, { duration: 1700, easing: ease })), -1);
          sx.value = withRepeat(withSequence(withTiming(1.012, { duration: 1700, easing: ease }), withTiming(1, { duration: 1700, easing: ease })), -1);
        }
        break;
      case 'THINK':
        if (!staticIdle) rot.value = withRepeat(withSequence(withTiming(-2, { duration: 1400, easing: ease }), withTiming(0, { duration: 1400, easing: ease })), -1);
        break;
      case 'ENCOURAGE':
        rot.value = withSequence(withTiming(-3, { duration: 180 }), withSpring(0, { damping: 9, stiffness: 160 }));
        break;
      case 'CORRECT':
        ty.value = withSequence(withTiming(5, { duration: 200 }), withSpring(0, { damping: 10, stiffness: 200 }));
        break;
      case 'CELEBRATE':
        ty.value = withRepeat(withSequence(withTiming(-14, { duration: 280, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 340, easing: Easing.in(Easing.quad) })), 3);
        sy.value = withRepeat(withSequence(withTiming(1.04, { duration: 280 }), withTiming(0.96, { duration: 260 }), withTiming(1, { duration: 80 })), 3);
        break;
      case 'RECOVERY':
        if (!staticIdle) rot.value = withRepeat(withSequence(withTiming(-1.2, { duration: 2000, easing: ease }), withTiming(1.2, { duration: 2000, easing: ease })), -1, true);
        break;
    }
  }, [state, reducedMotion, staticIdle, ty, rot, sx, sy]);

  const motion = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }, { rotate: `${rot.value}deg` }, { scaleX: sx.value }, { scaleY: sy.value }],
  }));

  const c = CHARACTERS[characterId];
  const hasSource = Boolean(source && source.trim().length > 0);
  const height = Math.round((size * 256) / 224);

  return (
    <Animated.View
      style={[styles.wrapper, { width: size, height }, motion]}
      accessibilityRole="image"
      accessibilityLabel={`${c.name}، ${STATE_FA[state]}`}
    >
      {hasSource && !reducedMotion ? (
        <RiveAnimationPlayer source={source!} />
      ) : (
        <Image source={artFor(characterId, state)} style={{ width: size, height }} resizeMode="contain" />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'flex-end' },
});
