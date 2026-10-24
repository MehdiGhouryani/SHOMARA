import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { DS } from '../ui/design-system/theme';
import { feedbackForInteraction } from './feedback';
import { useReducedMotionPreference } from './motionPreferences';

export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

/**
 * Shared progress-fill primitive. Fills forward with a short ease; never animates
 * "loss" theatrically (a decrease snaps). Reduced motion = immediate fill.
 */
export function ProgressFill({ value, label }: { value: number; label?: string }) {
  const clamped = clampProgress(value);
  const reducedMotion = useReducedMotionPreference();
  const progress = useSharedValue(clamped);
  const previous = useRef(clamped);

  useEffect(() => {
    const increasing = clamped > previous.current;
    previous.current = clamped;
    if (reducedMotion || !increasing) {
      progress.value = clamped;
      return;
    }
    progress.value = withTiming(clamped, { duration: feedbackForInteraction('PROGRESS_FILL').durationMs, easing: Easing.out(Easing.cubic) });
  }, [clamped, progress, reducedMotion]);

  const fill = useAnimatedStyle(() => ({ width: `${progress.value}%` }));
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }} accessibilityLabel={label}>
      <View style={styles.track}><Animated.View style={[styles.fill, fill]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 12, borderRadius: DS.radius.full, backgroundColor: DS.color.border.subtle, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: DS.radius.full, backgroundColor: DS.color.brand.emerald },
});
