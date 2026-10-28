import type { TextStyle } from 'react-native';
import { TOKENS } from '@math/design-system';

/**
 * Design-page color names (the names used inside the approved pages' CSS) mapped onto the
 * single token source `packages/design-system/src/tokens.json`. Never write a hex value in a screen.
 */
const c = TOKENS.color;
export const UI = TOKENS.ui;

export const C = {
  canvas: c.bg.canvas,
  surface: c.bg.surface,
  surfaceV: c.bg.subtle,
  ink: c.text.primary,
  ink2: c.text.secondary,
  line: c.border.subtle,
  line2: c.border.default,
  outline: c.border.strong,
  primary: c.brand.primary,
  primaryEdge: c.brand.primaryDark,
  primaryC: c.brand.primarySoft,
  onPrimaryC: UI.onColor.primaryContainer,
  amber: c.brand.secondary,
  amberEdge: c.brand.secondaryDark,
  onAmber: UI.onColor.amber,
  neutralC: c.brand.secondarySoft,
  onNeutralC: UI.onColor.neutralContainer,
  error: c.state.error,
  errorC: c.state.errorSoft,
  violet: c.brand.violet,
  violetC: c.brand.violetSoft,
  onVioletC: c.brand.violetDark,
  white: c.text.inverse,
} as const;

/** Gradient stops as fixed top-to-bottom pairs (JSON arrays are typed as string[]). */
const pair = (a: readonly string[]): readonly [string, string] => [a[0] ?? '#000000', a[1] ?? '#000000'];
export const GRADIENT = {
  amber: pair(UI.gradient.amber),
  primary: pair(UI.gradient.primary),
  secondary: pair(UI.gradient.secondary),
} as const;

export type UiTypeName = keyof typeof UI.type;

/** Text style for one of the page type roles (font family is chosen by AppText from the weight). */
export function typeStyle(name: UiTypeName): TextStyle {
  const t = UI.type[name];
  return { fontSize: t.fontSize, lineHeight: t.lineHeight, fontWeight: t.weight >= 600 ? '600' : '400' };
}
