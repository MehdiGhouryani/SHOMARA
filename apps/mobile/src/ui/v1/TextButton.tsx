import { Pressable, StyleSheet } from 'react-native';
import { Text } from '../AppText';
import { C, UI, typeStyle } from './tokens';

type Props = { label: string; onPress?: (() => void) | undefined; disabled?: boolean | undefined; testID?: string | undefined };

/** `.tbtn`: borderless text action (48px target, primary 16/600). */
export function TextButton({ label, onPress, disabled = false, testID }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={styles.hit}
    >
      <Text style={[typeStyle('label'), { color: disabled ? C.ink2 : C.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { minHeight: UI.button.textButtonMinHeight, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
});
