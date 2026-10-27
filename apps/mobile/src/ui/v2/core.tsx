import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Text } from '../AppText';
import { useReduceMotion } from './useReduceMotionV2';
import { C2, K2, M2, R2, S2, type2 } from './tokens';

type Variant = 'primary' | 'amber' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
  accessibilityLabel?: string | undefined;
  style?: StyleProp<ViewStyle> | undefined;
};

const LOOK: Record<Variant, { bg: string; text: string; edge: string }> = {
  primary: { bg: C2.primary, text: C2.white, edge: C2.primaryDark },
  amber: { bg: C2.amber, text: C2.amberInk, edge: C2.amberEdge },
  ghost: { bg: C2.surface, text: C2.primaryDark, edge: C2.line2 },
};

/** V2 primary action: rounded tactile face, solid bottom edge, spring press, spinner on loading. */
export function Button({ label, onPress, variant = 'primary', disabled = false, loading = false, accessibilityLabel, style }: Props) {
  const reduced = useReduceMotion();
  const scale = useSharedValue(1);
  const look = LOOK[variant];
  const off = disabled || loading;
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: off, busy: loading }}
      disabled={off}
      onPressIn={() => { if (!reduced && !off) scale.value = withSpring(M2.pressScale, M2.spring); }}
      onPressOut={() => { if (!reduced) scale.value = withSpring(1, M2.spring); }}
      onPress={onPress}
      style={[styles.press, style]}
    >
      <Animated.View style={[styles.face, animated, { backgroundColor: off ? C2.line : look.bg, borderBottomColor: off ? C2.line2 : look.edge, borderBottomWidth: K2.edge, borderRadius: R2.md, minHeight: K2.buttonH }]}>
        {loading ? <ActivityIndicator color={look.text} /> : null}
        <Text style={[type2('body'), { color: off ? C2.muted : look.text, fontWeight: '800' }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

/** V2 card: white surface, warm hairline, soft lifted shadow. */
export function Card({ children, style, tone = 'surface' }: { children: React.ReactNode; style?: StyleProp<ViewStyle> | undefined; tone?: 'surface' | 'alt' }) {
  return (
    <View style={[styles.card, { backgroundColor: tone === 'alt' ? C2.surfaceAlt : C2.surface }, style]}>
      {children}
    </View>
  );
}

export function Chip({ label, tone = 'primary' }: { label: string; tone?: 'primary' | 'amber' | 'sky' | 'neutral' }) {
  const map = { primary: [C2.primarySoft, C2.primaryDark], amber: [C2.amberSoft, C2.amberInk], sky: [C2.skySoft, C2.sky], neutral: [C2.surfaceAlt, C2.ink2] } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[type2('caption'), { color: fg }]}>{label}</Text>
    </View>
  );
}

/** V2 progress: honest plain-style fill. Animated fill is a V2 follow-up (the flow harness stubs
 *  reanimated, and a snapped meter must never fake a value); reduce-motion parity is automatic. */
export function ProgressBar({ ratio, accessibilityLabel }: { ratio: number; accessibilityLabel: string }) {
  const clamped = Math.max(0, Math.min(1, ratio));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height: K2.progressH }]}
    >
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  press: { minHeight: K2.buttonH },
  face: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S2.sm,
    paddingHorizontal: S2.xl,
    paddingVertical: S2.md,
  },
  card: {
    borderRadius: R2.lg,
    borderWidth: 1.5,
    borderColor: C2.line,
    padding: S2.lg,
    shadowColor: C2.ink,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chip: { borderRadius: R2.pill, paddingHorizontal: S2.md, paddingVertical: 6, alignSelf: 'flex-start' },
  track: { borderRadius: R2.pill, backgroundColor: C2.surfaceAlt, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: R2.pill, backgroundColor: C2.primary },
});
