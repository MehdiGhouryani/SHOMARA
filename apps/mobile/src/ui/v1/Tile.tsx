import { Pressable, StyleSheet } from 'react-native';
import { EdgeBox } from './EdgeBox';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { C, UI } from './tokens';

type Props = {
  icon: IconName;
  /** Icon color (the avatar tiles tint their icon; the tile chrome follows the selected state). */
  iconColor: string;
  selected: boolean;
  label: string;
  onPress?: (() => void) | undefined;
  testID?: string | undefined;
};

/** `.tile`: 88px choice tile with a 36px icon; selected = primary border, primary-container fill and edge. */
export function Tile({ icon, iconColor, selected, label, onPress, testID }: Props) {
  const K = UI.control;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      testID={testID}
      style={styles.hit}
    >
      {({ pressed }) => (
        <EdgeBox
          edge={K.tileEdge}
          edgeColor={selected ? C.primary : C.line}
          radius={UI.surface.cardRadius}
          // Press feedback is not in the pages; it follows the button rule (face sinks into its edge).
          lift={pressed ? K.tileEdge - 1 : 0}
          faceStyle={{
            minHeight: K.tileMinHeight,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: UI.surface.cardBorder,
            borderColor: selected ? C.primary : C.line,
            backgroundColor: selected ? C.primaryC : C.surface,
          }}
        >
          <Icon name={icon} size={K.tileIcon} color={iconColor} />
        </EdgeBox>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { flex: 1, minHeight: UI.control.tileMinHeight },
});
