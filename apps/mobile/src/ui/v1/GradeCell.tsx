import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../AppText';
import { EdgeBox } from './EdgeBox';
import { Icon } from './Icon';
import { C, UI, typeStyle } from './tokens';

type Props = {
  label: string;
  selected?: boolean | undefined;
  /** Not yet available: flat, muted, with a lock; presses are ignored. */
  locked?: boolean | undefined;
  onPress?: (() => void) | undefined;
  testID?: string | undefined;
};

/** `.gr`: 52px grade cell (default / selected / locked). */
export function GradeCell({ label, selected = false, locked = false, onPress, testID }: Props) {
  const K = UI.control;
  const lockedColor = UI.onColor.lockedText;
  const textColor = locked ? lockedColor : selected ? C.primaryEdge : C.ink;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled: locked }}
      disabled={locked}
      onPress={onPress}
      testID={testID}
      style={styles.hit}
    >
      {({ pressed }) => (
        <EdgeBox
          edge={locked ? 0 : K.gridCellEdge}
          edgeColor={selected ? C.primary : C.line}
          radius={K.gridCellRadius}
          lift={pressed && !locked ? K.gridCellEdge - 1 : 0}
          faceStyle={{
            minHeight: K.gridCellMinHeight,
            borderWidth: 2,
            borderColor: locked ? C.surfaceV : selected ? C.primary : C.line,
            backgroundColor: locked ? C.surfaceV : selected ? C.primaryC : C.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={styles.row}>
            {locked ? <Icon name="lock" size={16} color={lockedColor} /> : null}
            <Text style={[typeStyle('label'), { color: textColor }]}>{label}</Text>
          </View>
        </EdgeBox>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { flex: 1, minHeight: UI.control.gridCellMinHeight },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
