import { describe, expect, it } from 'vitest';
import { loadTokens } from '../../../tools/token-codegen/generate.mjs';

function linearChannel(value: number): number {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const normalized = hex.replace(/^#/, '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    throw new Error(`Expected a six-digit RGB token, received: ${hex}`);
  }
  const [r, g, b] = [0, 2, 4].map((offset) =>
    linearChannel(Number.parseInt(normalized.slice(offset, offset + 2), 16)),
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string): number {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/**
 * Explicit semantic foreground/background pairs used for normal-size text.
 * This guards the canonical token palette against accidental WCAG AA regressions.
 * It is not a substitute for checking every real component state on-device.
 */
const textPairs = [
  ['ink', 'surface'],
  ['ink2', 'surface'],
  ['muted', 'surface'],
  ['danger', 'surface'],
  ['primary', 'surface'],
  ['amberInk', 'amber'],
  ['HomeInk', 'HomeSurface'],
  ['HomeMuted', 'HomeSurface'],
  ['HomeOnViolet', 'HomeViolet'],
  ['HomeOnVioletMuted', 'HomeViolet'],
  ['HomeAmberInk', 'HomeAmber'],
  ['HomeGreen', 'HomeSurface'],
  ['HomeMuted', 'HomeCanvas'],
] as const;

describe('design token text contrast (WCAG AA)', () => {
  const colors = loadTokens().v2.color as Record<string, string>;

  it.each(textPairs)('%s on %s meets 4.5:1', (foregroundKey, backgroundKey) => {
    const foreground = colors[foregroundKey];
    const background = colors[backgroundKey];
    expect(foreground, `missing foreground token: ${foregroundKey}`).toBeDefined();
    expect(background, `missing background token: ${backgroundKey}`).toBeDefined();
    if (!foreground || !background) throw new Error(`Missing color token pair: ${foregroundKey}/${backgroundKey}`);
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
