import { describe, expect, it } from 'vitest';
import { feedbackForEvent } from './feedback';

describe('feedback contract', () => {
  it('keeps wrong answers encouraging rather than punitive', () => {
    const spec = feedbackForEvent('ANSWER_WRONG');
    expect(spec.tone).toBe('ENCOURAGE');
    expect(spec.characterState).toBe('ENCOURAGE');
    expect(spec.blocksInput).toBe(false);
  });

  it('uses celebration only for meaningful progression events', () => {
    for (const event of ['STATION_PASS', 'MILESTONE', 'REWARD_GRANTED'] as const) {
      expect(feedbackForEvent(event).tone).toBe('CELEBRATE');
    }
    expect(feedbackForEvent('ANSWER_CORRECT').tone).not.toBe('CELEBRATE');
  });

  it('never blocks the child for ordinary answer feedback', () => {
    expect(feedbackForEvent('ANSWER_CORRECT').blocksInput).toBe(false);
    expect(feedbackForEvent('ANSWER_WRONG').blocksInput).toBe(false);
    expect(feedbackForEvent('HINT_OPENED').blocksInput).toBe(false);
  });
});

describe('feedback re-export', () => {
  it('is the shared contract dictionary, not a mobile fork', async () => {
    const contracts = await import('@math/contracts');
    expect(feedbackForEvent('ANSWER_CORRECT')).toBe(contracts.FEEDBACK_BY_SEMANTIC_EVENT.ANSWER_CORRECT);
  });
});
