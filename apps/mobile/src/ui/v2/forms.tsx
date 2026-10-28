import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput as RNTextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, TextInput } from '../AppText';
import { toFa } from '../digits';
import { C2, K2, R2, S2, type2 } from './tokens';

/**
 * V2 forms (playbook pages 03/04/15): label above, one calm field, error near the field in the
 * warm semantic tone (never alarming red fills), hint in muted. Digits/phone/code runs are LTR
 * inside the RTL layout. Only tokens — no raw colors (verifier locks).
 */

type TextField2Props = {
  label: string;
  value: string;
  onChangeText?: ((v: string) => void) | undefined;
  placeholder?: string | undefined;
  /** Fixed start adornment such as the country code; always an LTR run. */
  prefix?: string | undefined;
  /** Digits, phone numbers and codes are LTR runs inside the RTL layout. */
  ltr?: boolean | undefined;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad' | undefined;
  maxLength?: number | undefined;
  hint?: string | undefined;
  error?: string | undefined;
  autoFocus?: boolean | undefined;
  /** Draws the focused look without real focus (visual specimens). */
  focused?: boolean | undefined;
  testID?: string | undefined;
};

export function TextField2({ label, value, onChangeText, placeholder, prefix, ltr, keyboardType, maxLength, hint, error, autoFocus, focused, testID }: TextField2Props) {
  const [hasFocus, setHasFocus] = useState(false);
  const on = focused ?? hasFocus;
  return (
    <View style={styles.field}>
      <Text style={[type2('caption'), { color: C2.ink2 }]}>{label}</Text>
      <View
        style={[
          styles.input,
          on ? styles.inputFocus : null,
          error ? styles.inputError : null,
        ]}
      >
        {prefix ? (
          <View style={styles.prefix}>
            <Text style={[type2('caption'), { color: C2.ink2, writingDirection: 'ltr' }]}>{prefix}</Text>
          </View>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C2.muted}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoFocus={autoFocus ?? false}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          accessibilityLabel={label}
          testID={testID}
          style={[type2('body'), styles.text, ltr ? { writingDirection: 'ltr', textAlign: 'right' } : null]}
        />
      </View>
      {error || hint ? <Text style={[type2('caption'), { color: error ? C2.danger : C2.muted }]}>{error || hint}</Text> : null}
    </View>
  );
}

type CodeInput2Props = {
  value: string;
  onChangeText: (value: string) => void;
  /** The auth contract requires six digits; keep the default unless the contract changes. */
  length?: number;
  autoFocus?: boolean | undefined;
  onSubmit?: (() => void) | undefined;
  /** Accessible name of the whole group. */
  label: string;
  /** Tints every cell border with the warm error tone; the message is rendered by the screen. */
  invalid?: boolean | undefined;
  testID?: string | undefined;
};

/**
 * One cell per digit, running left to right like the digits themselves. A transparent input on
 * top keeps OS code autofill (`oneTimeCode` / `sms-otp`) and the number pad working.
 */
export function CodeInput2({ value, onChangeText, length = 6, autoFocus, onSubmit, label, invalid = false, testID }: CodeInput2Props) {
  const ref = useRef<RNTextInput>(null);
  const cells = Array.from({ length }, (_, i) => value[i] ?? '');
  return (
    <Pressable accessibilityRole="none" onPress={() => ref.current?.focus()} style={styles.shell} testID={testID}>
      <View style={styles.codeRow} accessibilityRole="none">
        {cells.map((digit, index) => {
          const current = index === value.length && value.length < length;
          const filled = digit !== '';
          return (
            <View
              key={index}
              style={[
                styles.cell,
                invalid ? styles.cellInvalid : current || filled ? styles.cellActive : null,
              ]}
            >
              <Text style={[type2('bignum'), { fontSize: 22, lineHeight: 28, color: C2.ink }]}>{filled ? toFa(digit) : ''}</Text>
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
        autoFocus={autoFocus ?? false}
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

type SelectTile2Props = {
  label: string;
  selected: boolean;
  onPress?: (() => void) | undefined;
  /** Glyph node (icon with its semantic color) provided by the caller. */
  glyph: React.ReactNode;
  testID?: string | undefined;
};

/** Square choice tile (avatars): selected reads beyond color — primary border + soft fill + check badge. */
export function SelectTile2({ label, selected, onPress, glyph, testID }: SelectTile2Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.tileHit, pressed ? styles.tilePressed : null]}
    >
      <View style={[styles.tileFace, selected ? styles.tileSelected : null]}>
        {glyph}
        {selected ? (
          <View style={styles.tileCheck}>
            <Ionicons name="checkmark" size={14} color={C2.primaryDark} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

type GradeCell2Props = {
  label: string;
  selected?: boolean | undefined;
  /** Not yet available: flat, muted, with a lock; presses are ignored and reported as disabled. */
  locked?: boolean | undefined;
  onPress?: (() => void) | undefined;
  testID?: string | undefined;
};

/** Grade choice cell (default / selected / honestly locked). */
export function GradeCell2({ label, selected = false, locked = false, onPress, testID }: GradeCell2Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled: locked }}
      disabled={locked}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.gradeHit, pressed && !locked ? styles.tilePressed : null]}
    >
      <View style={[styles.gradeFace, locked ? styles.gradeLocked : selected ? styles.tileSelected : null]}>
        {locked ? <Ionicons name="lock-closed" size={14} color={C2.muted} /> : null}
        <Text style={[type2('body'), { fontWeight: '700', color: locked ? C2.muted : C2.ink }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

type TextLink2Props = { label: string; onPress?: (() => void) | undefined; disabled?: boolean | undefined; testID?: string | undefined };

/** Borderless text action with a full-size hit area. */
export function TextLink2({ label, onPress, disabled = false, testID }: TextLink2Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={styles.linkHit}
    >
      <Text style={[type2('body'), { color: disabled ? C2.muted : C2.primaryDark, fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { width: '100%', gap: S2.sm },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S2.sm,
    minHeight: K2.buttonH,
    borderWidth: 1.5,
    borderColor: C2.line2,
    borderRadius: R2.md,
    backgroundColor: C2.surface,
    paddingHorizontal: S2.lg,
  },
  inputFocus: { borderColor: C2.primary, borderWidth: 2 },
  inputError: { borderColor: C2.danger },
  prefix: {
    minHeight: 44,
    minWidth: 64,
    paddingHorizontal: S2.md,
    borderRadius: R2.sm,
    backgroundColor: C2.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // outlineWidth 0: the field draws its own focus border; the browser's default ring must not appear (web harness).
  text: { flex: 1, color: C2.ink, padding: 0, outlineWidth: 0, textAlignVertical: 'center' },
  shell: { width: '100%', minHeight: K2.buttonH },
  // `direction: ltr`: the six cells run left to right like the digits, inside the RTL screen.
  codeRow: { flexDirection: 'row', direction: 'ltr', gap: S2.sm, width: '100%' },
  cell: {
    flex: 1,
    minHeight: K2.buttonH,
    borderRadius: R2.md,
    borderWidth: 1.5,
    borderColor: C2.line2,
    backgroundColor: C2.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: { borderColor: C2.primary, borderWidth: 2 },
  cellInvalid: { borderColor: C2.danger },
  hidden: { position: 'absolute', top: 0, start: 0, end: 0, bottom: 0, opacity: 0.01, color: 'transparent', backgroundColor: 'transparent', outlineWidth: 0 },
  tileHit: { flex: 1, minHeight: K2.nodeSize, maxWidth: 96 },
  tilePressed: { backgroundColor: C2.surfaceAlt, borderRadius: R2.md },
  tileFace: {
    minHeight: K2.nodeSize,
    borderRadius: R2.md,
    borderWidth: 2,
    borderColor: C2.line2,
    backgroundColor: C2.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S2.xs,
  },
  tileSelected: { borderColor: C2.primary, backgroundColor: C2.primarySoft },
  tileCheck: {
    position: 'absolute',
    top: 6,
    end: 6,
    width: 20,
    height: 20,
    borderRadius: R2.pill,
    backgroundColor: C2.white,
    borderWidth: 1.5,
    borderColor: C2.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeHit: { flex: 1, minHeight: 52 },
  gradeFace: {
    minHeight: 52,
    borderRadius: R2.md,
    borderWidth: 2,
    borderColor: C2.line2,
    backgroundColor: C2.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S2.xs,
    paddingHorizontal: S2.sm,
  },
  gradeLocked: { borderColor: C2.line, backgroundColor: C2.surfaceAlt },
  linkHit: { minHeight: K2.touchMin, paddingHorizontal: S2.sm, alignItems: 'center', justifyContent: 'center' },
});
