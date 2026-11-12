import { describe, expect, it, vi } from 'vitest';

// P1 (2026-11-12): this test file sat orphaned outside every vitest include glob, and once the
// glob was widened it turned out it could never run: react-native ships Flow syntax
// (`import typeof * as ...` in index.js) that vite/rollup cannot parse. The module under test is
// a pure export-surface contract, so the RN rendering stack is mocked at the four seams this
// module touches. The assertions are unchanged — they simply execute now.
vi.mock('react-native', () => ({
  StyleSheet: { create: (styles: Record<string, unknown>) => styles },
  View: () => null,
}));
vi.mock('react-native-reanimated', () => ({
  default: { View: () => null },
  Easing: { out: () => (x: unknown) => x, cubic: () => 'cubic' },
  useAnimatedStyle: () => ({}),
  useSharedValue: () => ({ value: 0 }),
  withSpring: () => 0,
  withTiming: () => 0,
}));
vi.mock('../ui/AppText', () => ({ Text: () => null }));
vi.mock('../ui/design-system/components', () => ({ DSBadge: () => null }));
vi.mock('./feedbackEffects', () => ({
  useFeedbackEffects: () => ({ channels: { reducedMotion: false }, playInteraction: vi.fn(), announce: vi.fn() }),
}));

import { BadgeReveal, HintReveal, RewardReveal, UnlockReveal } from './RevealPrimitives';

describe('reveal primitives', () => {
  it('exports the shared reward, badge, unlock and hint primitives', () => {
    expect(typeof RewardReveal).toBe('function');
    expect(typeof BadgeReveal).toBe('function');
    expect(typeof UnlockReveal).toBe('function');
    expect(typeof HintReveal).toBe('function');
  });
});
