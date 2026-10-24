import { describe, expect, it } from 'vitest';
import {
  scaleFeedbackDurationMs,
  sessionAttemptFeel,
  sessionCompleteFeel,
  sessionFeelViolations,
} from './session-feel';

describe('session feel (Phase C)', () => {
  it('has no shame / empty copy violations', () => {
    expect(sessionFeelViolations()).toEqual([]);
  });

  it('uses warmer shorter copy for early grades on correct', () => {
    const early = sessionAttemptFeel('CORRECT', 'G1');
    const upper = sessionAttemptFeel('CORRECT', 'G6');
    expect(early.titleFa.length).toBeGreaterThan(0);
    expect(early.actionFa.length).toBeLessThanOrEqual(upper.actionFa.length);
  });

  it('encourages on try-again without failure language', () => {
    const t = sessionAttemptFeel('TRY_AGAIN', 'G1');
    expect(t.bodyFa).not.toMatch(/شکست|باختی|ضعیف/);
  });

  it('complete kinds are distinct', () => {
    expect(sessionCompleteFeel('STATION_PASSED', 'G1').titleFa).not.toEqual(
      sessionCompleteFeel('CHALLENGE_NOT_YET', 'G1').titleFa,
    );
  });

  it('scales duration by band', () => {
    expect(scaleFeedbackDurationMs(1000, 'G1')).toBeGreaterThan(scaleFeedbackDurationMs(1000, 'G6'));
  });
});
