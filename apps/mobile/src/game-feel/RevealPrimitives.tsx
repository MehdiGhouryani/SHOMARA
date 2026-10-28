import { useEffect, useRef, type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Text } from '../ui/AppText';
import { DS } from '../ui/design-system/theme';
import { DSBadge } from '../ui/design-system/components';
import type { InteractionFeedbackEvent } from './feedback';
import { useFeedbackEffects } from './feedbackEffects';

export type RevealTone = 'NEUTRAL' | 'POSITIVE' | 'CELEBRATE';
export type RevealFeedbackEvent = Extract<InteractionFeedbackEvent, 'HINT_REVEAL' | 'BADGE_REVEAL' | 'UNLOCK_REVEAL' | 'REWARD_REVEAL'>;

export function RevealPanel({
  visible,
  children,
  tone = 'NEUTRAL',
  style,
  durationMs = 280,
  feedbackEvent,
  announcement,
}: {
  visible: boolean;
  children: ReactNode;
  tone?: RevealTone;
  style?: ViewStyle | ViewStyle[];
  durationMs?: number;
  /** Shared interaction feedback played once when the panel becomes visible. */
  feedbackEvent?: RevealFeedbackEvent;
  /** Screen-reader text for this reveal (falls back to the shared spec). */
  announcement?: string;
}) {
  const { channels, playInteraction, announce } = useFeedbackEffects();
  const reducedMotion = channels.reducedMotion;
  const wasVisible = useRef(false);

  // Reveal feedback (haptic + announcement) fires on the hidden → visible edge only.
  useEffect(() => {
    if (visible && !wasVisible.current && feedbackEvent) {
      playInteraction(feedbackEvent, { announce: !announcement });
      if (announcement) announce(announcement);
    }
    wasVisible.current = visible;
  }, [announce, announcement, feedbackEvent, playInteraction, visible]);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.96);

  useEffect(() => {
    if (!visible) {
      opacity.value = withTiming(0, { duration: reducedMotion ? 0 : 100 });
      scale.value = withTiming(0.96, { duration: reducedMotion ? 0 : 100 });
      return;
    }
    if (reducedMotion) {
      opacity.value = 1;
      scale.value = 1;
      return;
    }
    opacity.value = withTiming(1, { duration: Math.max(160, durationMs), easing: Easing.out(Easing.cubic) });
    scale.value = withSpring(1, { damping: 15, stiffness: 190 });
  }, [durationMs, opacity, reducedMotion, scale, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;
  return <Animated.View style={[styles.panel, tone === 'POSITIVE' ? styles.positive : null, tone === 'CELEBRATE' ? styles.celebrate : null, animatedStyle, style]}>{children}</Animated.View>;
}

export function RewardReveal({
  visible,
  title = 'جایزه‌ات آماده است',
  description = 'یک دستاورد تازه برایت ثبت شد.',
}: {
  visible: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <RevealPanel visible={visible} tone="CELEBRATE" style={styles.reveal} feedbackEvent="REWARD_REVEAL" announcement={`${title}. ${description}`}>
      <View style={styles.iconCircle} accessible accessibilityRole="image" accessibilityLabel="جایزه">
        <Text style={styles.icon}>★</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </RevealPanel>
  );
}

export function BadgeReveal({
  visible,
  label,
  description,
}: {
  visible: boolean;
  label: string;
  description?: string;
}) {
  return (
    <RevealPanel visible={visible} tone="POSITIVE" style={styles.rowReveal} feedbackEvent="BADGE_REVEAL" announcement={description ? `${label}. ${description}` : label}>
      <DSBadge>{label}</DSBadge>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </RevealPanel>
  );
}

export function UnlockReveal({
  visible,
  title,
  description,
}: {
  visible: boolean;
  title: string;
  description?: string;
}) {
  return (
    <RevealPanel visible={visible} tone="CELEBRATE" style={styles.rowReveal} feedbackEvent="UNLOCK_REVEAL" announcement={description ? `${title}. ${description}` : title}>
      <View style={styles.unlockIcon} accessible accessibilityRole="image" accessibilityLabel="باز شد">
        <Text style={styles.unlockIconText}>✓</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </RevealPanel>
  );
}

export function HintReveal({
  visible,
  children,
}: {
  visible: boolean;
  children: ReactNode;
}) {
  return (
    <RevealPanel visible={visible} tone="NEUTRAL" style={styles.hint} feedbackEvent="HINT_REVEAL">
      <Text style={styles.hintTitle}>یک سرنخ کوچک</Text>
      <View style={styles.hintBody}>{children}</View>
    </RevealPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: DS.radius['2xl'],
    borderWidth: 1,
    borderColor: DS.color.border.subtle,
    backgroundColor: DS.color.bg.surface,
    padding: DS.space[3],
  },
  positive: {
    borderColor: DS.color.brand.emerald,
    backgroundColor: DS.color.brand.emeraldSoft,
  },
  celebrate: {
    borderColor: DS.color.brand.secondary,
    backgroundColor: DS.color.brand.secondarySoft,
  },
  reveal: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS.space[3],
    marginTop: DS.space[4],
  },
  rowReveal: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS.space[3],
    marginTop: DS.space[3],
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: DS.color.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 28, fontWeight: '900', color: DS.color.brand.secondaryDark },
  unlockIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DS.color.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: DS.color.brand.emerald,
  },
  unlockIconText: { fontSize: 22, fontWeight: '900', color: DS.color.brand.emeraldDark },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: DS.type.bodyStrong.fontSize, lineHeight: DS.type.bodyStrong.lineHeight, fontWeight: '900', color: DS.color.text.primary },
  description: { fontSize: DS.type.sm.fontSize, lineHeight: DS.type.sm.lineHeight, color: DS.color.text.secondary },
  hint: { marginTop: DS.space[3] },
  hintTitle: { fontSize: DS.type.bodyStrong.fontSize, lineHeight: DS.type.bodyStrong.lineHeight, fontWeight: '800', color: DS.color.text.primary },
  hintBody: { marginTop: DS.space[1] },
});
