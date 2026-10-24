import { describe, expect, it } from 'vitest';

import { BadgeReveal, HintReveal, RewardReveal, UnlockReveal } from './RevealPrimitives';

describe('reveal primitives', () => {
  it('exports the shared reward, badge, unlock and hint primitives', () => {
    expect(typeof RewardReveal).toBe('function');
    expect(typeof BadgeReveal).toBe('function');
    expect(typeof UnlockReveal).toBe('function');
    expect(typeof HintReveal).toBe('function');
  });
});
