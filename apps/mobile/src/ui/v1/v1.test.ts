import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ICONS, ICON_NAMES } from './icons';
import { C, UI, typeStyle } from './tokens';
import { CHARACTER_SIZE } from './characterSizes';

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
  const f = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

describe('v1 icons', () => {
  it('has the icons the approved pages use', () => {
    for (const n of ['chevronBack', 'lock', 'close', 'check', 'retry', 'speaker', 'book', 'bolt', 'route', 'person', 'settings', 'trophy', 'medal', 'chest']) {
      expect(ICON_NAMES).toContain(n);
    }
  });
  it('every icon has valid geometry', () => {
    for (const name of ICON_NAMES) {
      const nodes = ICONS[name];
      expect(nodes.length, name).toBeGreaterThan(0);
      for (const n of nodes) {
        if (n.t === 'path') expect(n.d.length, name).toBeGreaterThan(3);
        if (n.t === 'circle') [n.cx, n.cy, n.r].forEach((v) => expect(Number.isFinite(v), name).toBe(true));
        if (n.t === 'rect') [n.x, n.y, n.width, n.height, n.rx].forEach((v) => expect(Number.isFinite(v), name).toBe(true));
      }
    }
  });
});

describe('v1 tokens (ADR-0035 palette)', () => {
  it('maps the page color names to the approved palette', () => {
    expect(C.primary).toBe('#2B5C7A');
    expect(C.primaryEdge).toBe('#1F4459');
    expect(C.amber).toBe('#E3A33B');
    expect(C.amberEdge).toBe('#B07A2A');
    expect(C.canvas).toBe('#F5F7F8');
    expect(C.ink).toBe('#1B2A36');
    expect(C.error).toBe('#A94438');
    expect(C.violet).toBe('#7462E6');
  });
  it('keeps text pairs at WCAG AA (4.5:1)', () => {
    const pairs: Array<[string, string, string]> = [
      ['ink on canvas', C.ink, C.canvas],
      ['ink2 on canvas', C.ink2, C.canvas],
      ['white on primary', C.white, C.primary],
      ['onAmber on amber', C.onAmber, C.amber],
      ['onPrimaryC on primaryC', C.onPrimaryC, C.primaryC],
      ['error on errorC', C.error, C.errorC],
      ['onVioletC on violetC', C.onVioletC, C.violetC],
      ['onNeutralC on neutralC', C.onNeutralC, C.neutralC],
      ['ink2 on surfaceV', C.ink2, C.surfaceV],
    ];
    for (const [name, fg, bg] of pairs) expect(contrast(fg, bg), name).toBeGreaterThanOrEqual(4.5);
  });
  it('keeps touch targets at or above the product minimums', () => {
    expect(UI.button.minHeight).toBeGreaterThanOrEqual(56);
    expect(UI.button.textButtonMinHeight).toBeGreaterThanOrEqual(48);
    expect(UI.control.iconButton).toBeGreaterThanOrEqual(48);
    expect(UI.control.inputHeight).toBeGreaterThanOrEqual(56);
  });
  it('type roles follow the design guide sizes', () => {
    expect(typeStyle('h1')).toEqual({ fontSize: 28, lineHeight: 40, fontWeight: '600' });
    expect(typeStyle('body')).toEqual({ fontSize: 18, lineHeight: 28, fontWeight: '400' });
    expect(typeStyle('caption').fontSize).toBe(14);
    for (const k of Object.keys(UI.type) as Array<keyof typeof UI.type>) expect(UI.type[k].fontSize).toBeGreaterThanOrEqual(14);
  });
  it('uses exactly two font weights', () => {
    const weights = new Set(Object.values(UI.type).map((t) => t.weight));
    expect([...weights].sort()).toEqual([400, 600]);
  });
});

describe('v1 character art', () => {
  it('has a size entry for every image file and nothing else', () => {
    const dir = path.join(__dirname, '../../../assets/characters-v1');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.webp')).map((f) => f.replace('.webp', '')).sort();
    expect(Object.keys(CHARACTER_SIZE).sort()).toEqual(files);
  });
});
