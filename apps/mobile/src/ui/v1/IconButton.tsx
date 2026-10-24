import { Pressable, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { C, UI } from './tokens';

type Props = {
  icon: IconName;
  /** Required: an icon-only control has no visible text. */
  label: string;
  onPress?: (() => void) | undefined;
  color?: string;
  testID?: string | undefined;
};

/** 48x48 transparent icon button (`.ibtn`). */
export function IconButton({ icon, label, onPress, color = C.ink2, testID }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} testID={testID} style={styles.btn}>
      <Icon name={icon} size={UI.control.iconButtonIcon} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: UI.control.iconButton,
    height: UI.control.iconButton,
    borderRadius: UI.control.iconButtonRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
