import React from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '../AppText';
import { DS, RN_SHADOW } from './theme';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'neutral' | 'outline';

const variant = {
  primary: { backgroundColor: DS.color.brand.primary, borderColor: DS.color.brand.primary, shadowColor: DS.color.brand.primaryDark },
  secondary: { backgroundColor: DS.color.brand.secondary, borderColor: DS.color.brand.secondary, shadowColor: DS.color.brand.secondaryDark },
  success: { backgroundColor: DS.color.brand.emerald, borderColor: DS.color.brand.emerald, shadowColor: DS.color.brand.emeraldDark },
  neutral: { backgroundColor: DS.color.state.disabledSoft, borderColor: DS.color.border.default, shadowColor: DS.color.border.default },
  outline: { backgroundColor: DS.color.bg.surface, borderColor: DS.color.border.default, shadowColor: DS.color.border.default },
} as const;

export function DSButton({
  variant: tone = 'primary',
  children,
  style,
  ...props
}: PressableProps & { variant?: ButtonVariant; children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  const colors = variant[tone];
  const textColor = tone === 'neutral' || tone === 'outline' ? DS.color.text.primary : DS.color.text.inverse;
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.backgroundColor, borderColor: colors.borderColor, shadowColor: colors.shadowColor },
        pressed && !props.disabled ? styles.pressed : undefined,
        style,
      ]}
    >
      {typeof children === 'string' ? <Text style={[styles.buttonText, { color: textColor }]}>{children}</Text> : children}
    </Pressable>
  );
}

export function DSSurface({ children, style, elevated = false, accessibilityLabel }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; elevated?: boolean; accessibilityLabel?: string }) {
  return <View style={[styles.surface, elevated ? RN_SHADOW.card : null, style]} accessibilityLabel={accessibilityLabel}>{children}</View>;
}

export function DSBadge({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  );
}

export function DSProgress({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: clamped }} accessibilityLabel={label}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: DS.size.touchPrimary,
    paddingHorizontal: DS.space[4],
    borderRadius: DS.radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...RN_SHADOW.tactile,
  },
  pressed: { transform: [{ translateY: 3 }] },
  buttonText: { fontSize: DS.type.body.fontSize, lineHeight: DS.type.body.lineHeight, fontWeight: '700', textAlign: 'center' },
  surface: {
    backgroundColor: DS.color.bg.surface,
    borderColor: DS.color.border.subtle,
    borderWidth: 1,
    borderRadius: DS.radius['2xl'],
    padding: DS.space[4],
  },
  badge: { minHeight: 32, paddingHorizontal: DS.space[3], borderRadius: DS.radius.full, backgroundColor: DS.color.state.disabledSoft, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: DS.color.text.secondary, fontSize: DS.type.xs.fontSize, lineHeight: DS.type.xs.lineHeight, fontWeight: '700' },
  track: { height: 12, borderRadius: DS.radius.full, backgroundColor: DS.color.state.disabledSoft, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: DS.radius.full, backgroundColor: DS.color.brand.emerald },
});
