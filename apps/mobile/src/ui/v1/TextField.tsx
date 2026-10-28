import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../AppText';
import { C, UI, typeStyle } from './tokens';

type Props = {
  label: string;
  value: string;
  onChangeText?: ((v: string) => void) | undefined;
  placeholder?: string | undefined;
  /** Fixed start adornment such as the country code (`.pre`). Always left-to-right. */
  prefix?: string | undefined;
  /** Digits, phone numbers and codes are LTR runs inside the RTL layout. */
  ltr?: boolean | undefined;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad' | undefined;
  maxLength?: number | undefined;
  /** Forces the focused look (used by specimens); normally driven by real focus. */
  /** Small helper line under the input (`.cap`). */
  hint?: string | undefined;
  /** Error message: tints the border and replaces the hint. Not in the pages; derived from the error token. */
  error?: string | undefined;
  focused?: boolean | undefined;
  autoFocus?: boolean | undefined;
  testID?: string | undefined;
};

/** `.field` + `.inp`: label above a 60px input; the focused state thickens the border to 3px in primary. */
export function TextField({ label, value, onChangeText, placeholder, prefix, ltr, keyboardType, maxLength, hint, error, focused, autoFocus, testID }: Props) {
  const [hasFocus, setHasFocus] = useState(false);
  const on = focused ?? hasFocus;
  return (
    <View style={styles.field}>
      <Text style={typeStyle('label')}>{label}</Text>
      <View
        style={[
          styles.input,
          on ? { borderColor: C.primary, borderWidth: UI.control.inputBorderFocus } : null,
          error ? { borderColor: C.error } : null,
        ]}
      >
        {prefix ? (
          <View style={styles.prefix}>
            <Text style={[typeStyle('label'), { fontWeight: '600', writingDirection: 'ltr', textAlign: 'center' }]}>{prefix}</Text>
          </View>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.ink2}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoFocus={autoFocus ?? false}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          accessibilityLabel={label}
          testID={testID}
          style={[styles.text, typeStyle('input'), ltr ? { writingDirection: 'ltr', textAlign: 'right' } : null]}
        />
      </View>
      {error || hint ? <Text style={[typeStyle('caption'), { color: error ? C.error : C.ink2 }]}>{error || hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { width: '100%', gap: 8 },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: UI.control.inputHeight,
    borderWidth: UI.control.inputBorder,
    borderColor: C.outline,
    borderRadius: UI.control.inputRadius,
    backgroundColor: C.surface,
    paddingHorizontal: 16,
  },
  prefix: {
    height: 44,
    minWidth: 64,
    paddingHorizontal: 12,
    borderRadius: UI.surface.prefixRadius,
    backgroundColor: C.surfaceV,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // outlineWidth 0: the field draws its own focus border; the browser's default ring must not appear (web harness).
  text: { flex: 1, color: C.ink, padding: 0, outlineWidth: 0 },
});
