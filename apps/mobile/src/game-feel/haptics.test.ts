import { describe, expect, it } from 'vitest';
import { FEEDBACK_BUDGET_MS, FEEDBACK_BY_INTERACTION_EVENT, FEEDBACK_BY_SEMANTIC_EVENT } from '@math/contracts';
import { HAPTIC_PATTERN, hapticDurationMs, hapticPatternFor } from './haptics';

describe('haptic patterns', () => {
  it('has no vibration for NONE', () => {
    expect(hapticPatternFor('NONE')).toBeNull();
    expect(hapticDurationMs(null)).toBe(0);
  });

  it('keeps every pattern inside the celebration budget', () => {
    for (const pattern of Object.values(HAPTIC_PATTERN)) expect(hapticDurationMs(pattern)).toBeLessThanOrEqual(FEEDBACK_BUDGET_MS.celebration);
  });

  it('keeps wrong-answer nudges softer than success', () => {
    expect(hapticDurationMs(hapticPatternFor(FEEDBACK_BY_SEMANTIC_EVENT.ANSWER_WRONG.haptic))).toBeLessThan(hapticDurationMs(hapticPatternFor(FEEDBACK_BY_SEMANTIC_EVENT.ANSWER_CORRECT.haptic)));
  });

  it('keeps interaction haptics within the interaction budget', () => {
    for (const spec of Object.values(FEEDBACK_BY_INTERACTION_EVENT)) {
      if (spec.haptic === 'CELEBRATE') continue; // reward reveal follows a server grant
      expect(hapticDurationMs(hapticPatternFor(spec.haptic))).toBeLessThanOrEqual(FEEDBACK_BUDGET_MS.interaction);
    }
  });
});
