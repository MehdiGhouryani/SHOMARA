import { StyleSheet, Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps, type StyleProp, type TextStyle } from 'react-native';
import { scaledFontSize } from '@math/contracts';
import { useAppState } from '../state/AppStateContext';

/**
 * Vazirmatn (SoT §27.2). Android needs one font family per weight, so we map
 * fontWeight -> family and neutralise the synthetic weight.
 * Phase F: largeText scales type; RTL defaults for Persian.
 */
// ADR-0035: the UI uses exactly two weights, 400 and 600. `bold` and `black` stay as aliases of the
// semibold family so legacy call sites keep rendering until their screens are redesigned.
export const FONT = {
  regular: 'Vazirmatn_400Regular',
  semibold: 'Vazirmatn_600SemiBold',
  bold: 'Vazirmatn_600SemiBold',
  black: 'Vazirmatn_600SemiBold',
} as const;

function familyFor(weight: unknown): string {
  const w = Number(weight === 'bold' ? 700 : weight === 'normal' || weight === undefined ? 400 : weight);
  return w >= 600 ? FONT.semibold : FONT.regular;
}

function useLargeText(): boolean {
  try {
    const { preferences } = useAppState();
    return Boolean(preferences?.largeText);
  } catch {
    return false;
  }
}

function applyTypeScale(style: StyleProp<TextStyle>, largeText: boolean): TextStyle | null {
  if (!largeText) return null;
  const flat = StyleSheet.flatten(style) ?? {};
  if (typeof flat.fontSize === 'number') {
    return {
      fontSize: scaledFontSize(flat.fontSize, true),
      lineHeight:
        typeof flat.lineHeight === 'number' ? scaledFontSize(flat.lineHeight, true) : undefined,
    };
  }
  return null;
}

export function Text({ style, ...rest }: TextProps) {
  const largeText = useLargeText();
  const flat = StyleSheet.flatten(style) ?? {};
  const scale = applyTypeScale(style, largeText);
  return (
    <RNText
      {...rest}
      style={[
        { textAlign: 'right', writingDirection: 'rtl' },
        style,
        scale,
        { fontFamily: familyFor(flat.fontWeight), fontWeight: 'normal' },
      ]}
    />
  );
}

export function TextInput({ style, ...rest }: TextInputProps) {
  const largeText = useLargeText();
  const flat = StyleSheet.flatten(style) ?? {};
  const scale = applyTypeScale(style as StyleProp<TextStyle>, largeText);
  return (
    <RNTextInput
      {...rest}
      style={[
        { textAlign: 'right', writingDirection: 'rtl' },
        style,
        scale,
        { fontFamily: familyFor(flat.fontWeight), fontWeight: 'normal' },
      ]}
    />
  );
}
