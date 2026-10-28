import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import type { FeedbackSpec, FeedbackTone } from './feedback';
import { Text } from '../ui/AppText';
import { DS } from '../ui/design-system/theme';
import { useReducedMotionPreference } from './motionPreferences';

/** Icon + colour carry the tone without relying on colour alone or on audio. */
export const FEEDBACK_ICON: Readonly<Record<FeedbackTone, string>> = {
  NEUTRAL: '•',
  POSITIVE: '✓',
  ENCOURAGE: '↺',
  CELEBRATE: '★',
};

/**
 * Transient, non-blocking feedback pill. Reduced motion = static pill for the same
 * read window; the screen-reader announcement is played by `useGameFeel`.
 */
export function FeedbackBurst({ feedback }: { feedback: FeedbackSpec | null }) {
  const reducedMotion = useReducedMotionPreference();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  useEffect(() => {
    if (!feedback) {
      opacity.value = reducedMotion ? 0 : withTiming(0, { duration: 100 });
      return;
    }
    if (reducedMotion) {
      opacity.value = 1;
      scale.value = 1;
      return;
    }
    opacity.value = withSequence(withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: Math.max(180, feedback.durationMs - 300) }), withTiming(0, { duration: 180 }));
    scale.value = withSequence(withSpring(1, { damping: 12, stiffness: 220 }), withTiming(1, { duration: Math.max(100, feedback.durationMs - 250) }));
  }, [feedback, reducedMotion, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  if (!feedback?.message) return null;
  const toneStyle = feedback.tone === 'CELEBRATE' ? styles.celebrate : feedback.tone === 'POSITIVE' ? styles.positive : feedback.tone === 'ENCOURAGE' ? styles.encourage : null;
  return (
    <Animated.View pointerEvents="none" style={[styles.container, animatedStyle]}>
      <View style={[styles.pill, toneStyle]} accessible accessibilityRole="text" accessibilityLabel={feedback.message}>
        <Text style={styles.icon}>{FEEDBACK_ICON[feedback.tone]}</Text>
        <Text style={styles.text}>{feedback.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 24, right: 24, top: 86, alignItems: 'center', zIndex: 20 },
  pill: { minHeight: 48, maxWidth: '94%', paddingHorizontal: 18, borderRadius: 24, backgroundColor: DS.color.bg.surface, borderWidth: 1, borderColor: DS.color.brand.primary, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: DS.color.text.primary, shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  positive: { backgroundColor: DS.color.brand.emeraldSoft, borderColor: DS.color.brand.emerald },
  // Encourage uses warm secondary — never a red error colour.
  encourage: { backgroundColor: DS.color.brand.secondarySoft, borderColor: DS.color.brand.secondary },
  celebrate: { backgroundColor: DS.color.brand.secondarySoft, borderColor: DS.color.brand.secondary },
  icon: { fontSize: 18, fontWeight: '900', color: DS.color.brand.primary },
  text: { fontSize: 15, fontWeight: '800', color: DS.color.text.primary, textAlign: 'center' },
});
