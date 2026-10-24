import rawTokens from './tokens.json';

export const DESIGN_SYSTEM_VERSION = rawTokens.schemaVersion;
export const TOKENS = rawTokens;

/**
 * Backward-compatible web token shape while the application migrates legacy components.
 * New code should import TOKENS from @math/design-system.
 */
export const DESIGN_TOKENS = {
  colors: {
    brand: {
      primary: rawTokens.color.brand.primary,
      primaryDark: rawTokens.color.brand.primaryDark,
      primaryLight: rawTokens.color.brand.primarySoft,
      secondary: rawTokens.color.brand.secondary,
      secondaryDark: rawTokens.color.brand.secondaryDark,
      secondaryLight: rawTokens.color.brand.secondarySoft,
    },
    status: {
      success: rawTokens.color.state.success,
      successLight: rawTokens.color.state.successSoft,
      successBorder: rawTokens.color.brand.emerald,
      retry: rawTokens.color.state.warning,
      retryLight: rawTokens.color.state.warningSoft,
      retryBorder: rawTokens.color.brand.secondary,
      info: rawTokens.color.state.info,
      infoLight: rawTokens.color.state.infoSoft,
    },
    neutral: {
      white: rawTokens.color.bg.surface,
      cream: rawTokens.color.bg.canvas,
      offWhite: rawTokens.color.bg.subtle,
      charcoal: rawTokens.color.text.primary,
      slate: rawTokens.color.text.secondary,
      grayMuted: rawTokens.color.text.muted,
      border: rawTokens.color.border.subtle,
    },
  },
  typography: {
    fonts: {
      display: `${rawTokens.font.family}, ${rawTokens.font.fallback}`,
      body: `${rawTokens.font.family}, ${rawTokens.font.fallback}`,
      math: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
    },
    sizes: {
      xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px', xxl: '28px', huge: '40px'
    },
    weights: { regular: '400', semibold: '600', bold: '700', black: '800' },
  },
  radius: {
    none: '0px', xs: '8px', sm: '12px', md: '16px', lg: '20px', xl: '24px', full: '999px',
  },
  spacing: {
    none: '0px', xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px',
  },
  shadows: {
    soft: rawTokens.shadow.sm,
    card: rawTokens.shadow.md,
    flat: {
      primary: rawTokens.shadow.tactilePrimary,
      secondary: rawTokens.shadow.tactileSecondary,
      success: rawTokens.shadow.tactileSuccess,
      retry: rawTokens.shadow.tactileSecondary,
      neutral: rawTokens.shadow.tactileNeutral,
      active: 'none',
    },
  },
} as const;

export type DesignTokens = typeof TOKENS;
export type DesignColor = keyof DesignTokens['color'];
export type DesignSpace = keyof DesignTokens['space'];
export type DesignRadius = keyof DesignTokens['radius'];
export type DesignType = keyof DesignTokens['type'];
export * from './digits';
