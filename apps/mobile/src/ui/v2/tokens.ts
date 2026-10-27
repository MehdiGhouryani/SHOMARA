import type { TextStyle } from 'react-native';
import { TOKENS } from '@math/design-system';

/**
 * UI V2 token reader (D-021): the single authoritative source is `packages/design-system`
 * → `tokens.json` group `v2` (warm garden palette, WCAG-checked pairs). Never write a raw
 * hex value in a V2 component or screen. V1 groups remain for unmigrated surfaces.
 */
const v2 = TOKENS.v2;

export const C2 = v2.color;

const SPACES = v2.space;
export const S2 = {
  xs: SPACES[0] ?? 4,
  sm: SPACES[1] ?? 8,
  md: SPACES[2] ?? 12,
  lg: SPACES[3] ?? 16,
  xl: SPACES[4] ?? 20,
  xxl: SPACES[5] ?? 24,
  xxxl: SPACES[6] ?? 32,
  huge: SPACES[7] ?? 40,
} as const;

export const R2 = {
  sm: v2.radius.sm,
  md: v2.radius.md,
  lg: v2.radius.lg,
  xl: v2.radius.xl,
  pill: v2.radius.pill,
} as const;

export const M2 = {
  fast: v2.motion.duration.fast,
  base: v2.motion.duration.base,
  slow: v2.motion.duration.slow,
  spring: v2.motion.spring,
  pressScale: v2.motion.pressScale,
} as const;

export const K2 = {
  touchMin: v2.component.touchMin,
  buttonH: v2.component.buttonH,
  nodeSize: v2.component.nodeSize,
  nodeCurrent: v2.component.nodeCurrent,
  edge: v2.component.edge,
  trayBead: v2.component.trayBead,
  progressH: v2.component.progressH,
  topBarH: v2.component.topBarH,
} as const;

/**
 * Clay depth (DESIGN MASTER §2 intensity scale): numbers only — fill/border resolve through C2
 * (soft = surface + line, featured = amberSoft + amber, highlight = white). One featured hero per
 * viewport; body text and math labels stay flat.
 */
export const CL2 = {
  levels: v2.clay.levels,
  soft: v2.clay.soft,
  featured: v2.clay.featured,
} as const;

export type ClayLevel = 'soft' | 'featured';


type V2Type = typeof v2.type;
type TypeKey = keyof V2Type;

/** V2 type scale as ready TextStyle (Vazirmatn family is applied app-wide). */
export function type2(key: TypeKey): TextStyle {
  const t = v2.type[key];
  return {
    fontSize: t.fontSize,
    lineHeight: t.lineHeight,
    fontWeight: t.weight === '800' ? '800' : t.weight === '700' ? '700' : '600',
  } as TextStyle;
}
