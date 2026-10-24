import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput as RNTextInput, View } from 'react-native';
import { Text } from '../AppText';
import { toFa } from '../digits';
import { C, UI, typeStyle } from './tokens';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  onSubmit?: (() => void) | undefined;
  /** Accessible name of the whole group (the page's aria-label). */
  label: string;
  /** Shown as an error border; the message itself is rendered by the screen. */
  invalid?: boolean | undefined;
  testID?: string | undefined;
};

/**
 * One cell per digit (left-to-right, as the page draws them). A transparent text input on top keeps the
 * OS code autofill (`oneTimeCode` / `sms-otp`) and number pad working exactly like the legacy OtpBoxes it replaced.
 */
export function CodeInput({ value, onChangeText, length = 6, autoFocus = true, onSubmit, label, invalid = false, testID }: Props) {
  const ref = useRef<RNTextInput>(null);
  const K = UI.control;
  const cells = Array.from({ length }, (_, i) => value[i] ?? '');
  return (
    <Pressable accessibilityRole="none" onPress={() => ref.current?.focus()} style={styles.shell} testID={testID}>
      <View style={styles.row} accessibilityRole="none">
        {cells.map((digit, index) => {
          const current = index === value.length && value.length < length;
          const filled = digit !== '';
          const borderColor = invalid ? C.error : current || filled ? C.primary : C.outline;
          return (
            <View
              key={index}
              style={[styles.cell, { height: K.codeCellHeight, borderColor, borderWidth: current ? UI.control.inputBorderFocus : UI.control.inputBorder }]}
            >
              <Text style={[typeStyle('code'), { color: C.ink }]}>{filled ? toFa(digit) : ''}</Text>
            </View>
          );
        })}
      </View>
      <RNTextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        selectionColor="transparent"
        cursorColor="transparent"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        onSubmitEditing={onSubmit}
        accessibilityLabel={label}
        style={styles.hidden}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: { width: '100%', minHeight: UI.control.codeCellHeight },
  // `direction: ltr`: the six cells run left to right like the digits, inside the RTL screen.
  row: { flexDirection: 'row', direction: 'ltr', gap: UI.control.codeGap, width: '100%' },
  cell: { flex: 1, borderRadius: UI.control.inputRadius, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  hidden: { position: 'absolute', top: 0, start: 0, end: 0, bottom: 0, opacity: 0.01, color: 'transparent', backgroundColor: 'transparent', outlineWidth: 0 },
});
