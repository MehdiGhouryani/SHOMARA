import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../AppText';
import { EdgeBox } from './EdgeBox';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { C, GRADIENT, UI, typeStyle } from './tokens';

export type ButtonVariant = 'amber' | 'primary' | 'secondary';

type Props = {
  label: string;
  onPress?: (() => void) | undefined;
  variant?: ButtonVariant;
  /** Renders the page's "off" look and ignores presses. */
  disabled?: boolean;
  /** Busy: shows a spinner next to the label and ignores presses; keeps the variant's look. */
  loading?: boolean | undefined;
  icon?: IconName | undefined;
  /** Auto-width pill (48px, 16px text): the "replay audio" style button. */
  compact?: boolean | undefined;
  accessibilityLabel?: string | undefined;
  testID?: string | undefined;
};

type Look = {
  gradient?: readonly [string, string];
  background?: string;
  text: string;
  edge: number;
  edgeColor: string;
  highlight: { height: number; color: string };
  border: number;
  borderColor?: string;
};

const B = UI.button;
const LOOKS: Record<ButtonVariant | 'off', Look> = {
  amber: { gradient: GRADIENT.amber, text: C.onAmber, edge: B.edge, edgeColor: C.amberEdge, highlight: { height: 2, color: UI.highlight.amber }, border: 0 },
  primary: { gradient: GRADIENT.primary, text: C.white, edge: B.edge, edgeColor: C.primaryEdge, highlight: { height: 2, color: UI.highlight.primary }, border: 0 },
  secondary: { gradient: GRADIENT.secondary, text: C.primary, edge: B.edgeSecondary, edgeColor: C.line2, highlight: { height: 2, color: UI.highlight.secondary }, border: 2, borderColor: C.line2 },
  off: { background: C.surfaceV, text: C.ink2, edge: B.edge, edgeColor: C.line2, highlight: { height: 2, color: UI.highlight.off }, border: 0 },
};

/** The page button: gradient face, solid bottom edge that the face presses into. */
export function Button({ label, onPress, variant = 'amber', disabled = false, loading = false, icon, compact = false, accessibilityLabel, testID }: Props) {
  const look = LOOKS[disabled ? 'off' : variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      testID={testID}
      style={compact ? styles.hitCompact : styles.hit}
    >
      {({ pressed }) => (
        <EdgeBox
          edge={look.edge}
          edgeColor={look.edgeColor}
          radius={compact ? 99 : B.radius}
          lift={pressed && !disabled ? B.pressTravel : 0}
          gradient={look.gradient}
          highlight={look.highlight}
          style={compact ? undefined : styles.full}
          faceStyle={{
            minHeight: compact ? B.textButtonMinHeight : B.minHeight,
            justifyContent: 'center',
            backgroundColor: look.background,
            borderWidth: look.border,
            borderColor: look.borderColor,
          }}
        >
          <View style={[styles.content, compact ? styles.contentCompact : null]}>
            {loading ? <ActivityIndicator color={look.text} /> : null}
            {icon && !loading ? <Icon name={icon} size={B.icon} color={look.text} /> : null}
            <Text style={[typeStyle('body'), compact ? { fontSize: 16, lineHeight: 25 } : null, { fontWeight: '600', color: look.text, textAlign: 'center' }]}>{label}</Text>
          </View>
        </EdgeBox>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { width: '100%', minHeight: UI.button.minHeight },
  hitCompact: { alignSelf: 'center', minHeight: UI.button.textButtonMinHeight },
  full: { width: '100%' },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: B.gap,
    paddingHorizontal: 16,
  },
  contentCompact: { paddingHorizontal: 24 },
});
