import { useEffect } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Text } from '../ui/AppText';
import { DS } from '../ui/design-system/theme';
import { useFeedbackEffects } from './feedbackEffects';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TactileChoice({
  label,
  onPress,
  selected = false,
  disabled = false,
  accessibilityLabel,
  style,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}) {
  const scale = useSharedValue(1);
  const { channels, playInteraction } = useFeedbackEffects();
  const reducedMotion = channels.reducedMotion;
  useEffect(() => {
    if (disabled || reducedMotion) scale.value = 1;
  }, [disabled, reducedMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPressIn={() => {
        if (disabled) return;
        playInteraction('TAP', { announce: false });
        if (!reducedMotion) scale.value = withSpring(0.975, { damping: 14, stiffness: 260 });
      }}
      onPressOut={() => { scale.value = reducedMotion ? 1 : withSpring(1, { damping: 12, stiffness: 220 }); }}
      onPress={onPress}
      style={[styles.choice, selected ? styles.selected : null, disabled ? styles.disabled : null, animatedStyle, style]}
    >
      <View style={[styles.marker, selected ? styles.markerSelected : null]} />
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  choice: {
    minHeight: 64,
    paddingHorizontal: DS.space[4],
    borderRadius: DS.radius.xl,
    borderWidth: 1,
    borderColor: DS.color.border.default,
    backgroundColor: DS.color.bg.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DS.space[3],
  },
  selected: { borderColor: DS.color.brand.primary, backgroundColor: DS.color.brand.primarySoft },
  disabled: { opacity: 0.5 },
  marker: { width: 10, height: 10, borderRadius: 5, backgroundColor: DS.color.border.default },
  markerSelected: { backgroundColor: DS.color.brand.primary },
  label: { fontSize: DS.type.body.fontSize, lineHeight: DS.type.body.lineHeight, fontWeight: '800', color: DS.color.text.primary, textAlign: 'center', flexShrink: 1 },
});
