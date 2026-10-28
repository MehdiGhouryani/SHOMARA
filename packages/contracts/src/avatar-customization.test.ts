import { describe, expect, it } from 'vitest';
import {
  G1_COSMETIC_CATALOG,
  applyCategorySelection,
  buildAvatarWorkshopProjection,
  cosmeticCatalogViolations,
  isCosmeticOwned,
  sanitizeAppearance,
  DEFAULT_AVATAR_APPEARANCE,
} from './avatar-customization';

describe('P08 cosmetic catalog', () => {
  it('has no catalog violations', () => {
    expect(cosmeticCatalogViolations()).toEqual([]);
  });

  it('keeps starter base presets always owned', () => {
    const base = G1_COSMETIC_CATALOG.find((c) => c.id === 'cosmetic-base-sun')!;
    expect(isCosmeticOwned(base, new Set())).toBe(true);
  });

  it('locks inventory cosmetics without grant', () => {
    const hat = G1_COSMETIC_CATALOG.find((c) => c.id === 'cosmetic-hat-explorer')!;
    expect(isCosmeticOwned(hat, new Set())).toBe(false);
    expect(isCosmeticOwned(hat, new Set(['G1-R-COS-HAT-EXPLORER']))).toBe(true);
  });
});

describe('sanitizeAppearance', () => {
  it('rejects unequipped locked items', () => {
    const { appearance, rejected } = sanitizeAppearance(
      {
        ...DEFAULT_AVATAR_APPEARANCE,
        hatId: 'cosmetic-hat-explorer',
        backgroundId: 'cosmetic-bg-pattern',
      },
      [],
    );
    expect(appearance.hatId).toBeNull();
    expect(appearance.backgroundId).toBe('cosmetic-bg-default');
    expect(rejected.length).toBeGreaterThan(0);
  });

  it('keeps owned unlock after challenge sticker grant', () => {
    const { appearance, rejected } = sanitizeAppearance(
      {
        ...DEFAULT_AVATAR_APPEARANCE,
        backgroundId: 'cosmetic-bg-pattern',
      },
      ['G1-R-ST01-CH'],
    );
    expect(appearance.backgroundId).toBe('cosmetic-bg-pattern');
    expect(rejected).toEqual([]);
  });
});

describe('workshop projection', () => {
  it('never marks locked items as equipped earned', () => {
    const p = buildAvatarWorkshopProjection(DEFAULT_AVATAR_APPEARANCE, []);
    expect(p.companionCastExcluded).toBe(true);
    expect(p.setsMastery).toBe(false);
    expect(p.impliesMoneyValue).toBe(false);
    const locked = p.items.filter((i) => !i.owned);
    expect(locked.every((i) => i.equipped === false)).toBe(true);
    expect(locked.every((i) => i.lockedLabelFa != null)).toBe(true);
  });

  it('applyCategorySelection ignores locked picks', () => {
    const next = applyCategorySelection(
      DEFAULT_AVATAR_APPEARANCE,
      'HAT',
      'cosmetic-hat-explorer',
      [],
    );
    expect(next.hatId).toBeNull();
  });
});
