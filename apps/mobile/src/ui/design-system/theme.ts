import { TOKENS } from '@math/design-system';

export const DS = {
  color: TOKENS.color,
  space: TOKENS.space,
  radius: TOKENS.radius,
  size: TOKENS.size,
  type: TOKENS.type,
  font: TOKENS.font,
} as const;

export const RN_SHADOW = {
  card: { shadowColor: DS.color.text.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 3 },
  tactile: { shadowColor: DS.color.brand.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
} as const;
