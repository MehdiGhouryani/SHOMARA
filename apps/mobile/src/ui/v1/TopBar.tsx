import { StyleSheet, View } from 'react-native';
import { IconButton } from './IconButton';
import type { IconName } from './icons';
import { C, UI } from './tokens';

type Action = { icon: IconName; label: string; onPress?: (() => void) | undefined };

type Props = {
  /** Back or close; sits at the reading start (right side) as the design guide requires. */
  action?: Action | undefined;
  children?: React.ReactNode;
};

/** `.top`: 64px bar, 12px start padding next to the action and 24px end margin. */
export function TopBar({ action, children }: Props) {
  return (
    <View style={styles.bar}>
      {action ? <IconButton icon={action.icon} label={action.label} onPress={action.onPress} /> : null}
      {children}
    </View>
  );
}

type ProgressProps = { value: number; label: string };

/** `.bar`: 16px pill; the fill grows from the reading start. */
export function ProgressBar({ value, label }: ProgressProps) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
    >
      <View style={[styles.fill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: UI.control.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingStart: 12,
    paddingEnd: UI.screen.margin,
    paddingVertical: 8,
  },
  track: { flex: 1, height: UI.control.progressBarHeight, borderRadius: 99, backgroundColor: C.surfaceV, overflow: 'hidden', flexDirection: 'row' },
  fill: { height: '100%', borderRadius: 99, backgroundColor: C.primary },
});
