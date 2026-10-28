import { describe, expect, it } from 'vitest';
import { CHARACTER_STATE_BY_EVENT, type AnimationSemanticEvent } from './animation';
import {
  FEEDBACK_BUDGET_MS,
  FEEDBACK_BY_INTERACTION_EVENT,
  FEEDBACK_BY_SEMANTIC_EVENT,
  INTERACTION_FEEDBACK_EVENTS,
  resolveFeedbackPresentation,
  semanticEventForOutcome,
} from './game-feel';

const semanticEvents = Object.keys(FEEDBACK_BY_SEMANTIC_EVENT) as AnimationSemanticEvent[];
const allSpecs = [...Object.values(FEEDBACK_BY_SEMANTIC_EVENT), ...Object.values(FEEDBACK_BY_INTERACTION_EVENT)];
const ON = { reducedMotion: false, sound: true, haptics: true };

describe('P03 shared game-feel contract', () => {
  it('covers every semantic event and agrees with the character state map', () => {
    expect(semanticEvents.sort()).toEqual((Object.keys(CHARACTER_STATE_BY_EVENT) as AnimationSemanticEvent[]).sort());
    for (const event of semanticEvents) expect(FEEDBACK_BY_SEMANTIC_EVENT[event].characterState).toBe(CHARACTER_STATE_BY_EVENT[event]);
  });

  it('keeps interaction feedback renderer-local (never changes the companion)', () => {
    expect(Object.keys(FEEDBACK_BY_INTERACTION_EVENT).sort()).toEqual([...INTERACTION_FEEDBACK_EVENTS].sort());
    for (const spec of Object.values(FEEDBACK_BY_INTERACTION_EVENT)) {
      expect(spec.characterState).toBeNull();
      expect(spec.blocksInput).toBe(false);
      expect(spec.durationMs).toBeLessThanOrEqual(FEEDBACK_BUDGET_MS.interaction);
    }
  });

  it('keeps answer feedback short and non-blocking; celebration bounded', () => {
    for (const event of ['ANSWER_CORRECT', 'ANSWER_WRONG', 'NEAR_MISS', 'HINT_OPENED', 'RECOVERY', 'EXPLAIN'] as const) {
      expect(FEEDBACK_BY_SEMANTIC_EVENT[event].durationMs).toBeLessThanOrEqual(FEEDBACK_BUDGET_MS.answer);
      expect(FEEDBACK_BY_SEMANTIC_EVENT[event].blocksInput).toBe(false);
    }
    for (const spec of allSpecs) expect(spec.durationMs).toBeLessThanOrEqual(FEEDBACK_BUDGET_MS.celebration);
  });

  it('never celebrates or blocks on a wrong answer or near miss', () => {
    for (const event of ['ANSWER_WRONG', 'NEAR_MISS'] as const) {
      const spec = FEEDBACK_BY_SEMANTIC_EVENT[event];
      expect(spec.tone).toBe('ENCOURAGE');
      expect(spec.motion).not.toBe('CELEBRATE');
      expect(spec.haptic).not.toBe('CELEBRATE');
    }
  });

  it('reserves celebration for meaningful progression events', () => {
    const celebrating = semanticEvents.filter((event) => FEEDBACK_BY_SEMANTIC_EVENT[event].tone === 'CELEBRATE').sort();
    expect(celebrating).toEqual(['MILESTONE', 'REWARD_GRANTED', 'STATION_PASS']);
  });

  it('silent variant: every non-neutral feedback carries visible copy, so audio is never required', () => {
    for (const spec of allSpecs) {
      if (spec.tone !== 'NEUTRAL') expect(typeof spec.message).toBe('string');
      const silent = resolveFeedbackPresentation(spec, { ...ON, sound: false });
      expect(silent.audioCue).toBe('NONE');
      expect(silent.message).toBe(spec.message ?? null);
    }
  });

  it('reduced-motion variant removes animation but keeps message and read window', () => {
    for (const spec of allSpecs) {
      const reduced = resolveFeedbackPresentation(spec, { ...ON, reducedMotion: true });
      expect(reduced.motion).toBe('NONE');
      expect(reduced.visibleMs).toBe(spec.durationMs);
      expect(reduced.message).toBe(spec.message ?? null);
      expect(reduced.blocksInput).toBe(spec.blocksInput);
    }
  });

  it('haptics can be disabled without changing anything else', () => {
    const spec = FEEDBACK_BY_SEMANTIC_EVENT.STATION_PASS;
    const off = resolveFeedbackPresentation(spec, { ...ON, haptics: false });
    expect(off.haptic).toBe('NONE');
    expect(off.motion).toBe(spec.motion);
    expect(off.announcement).toBe(spec.message);
  });

  it('maps authoritative outcomes the same way on every surface', () => {
    expect(semanticEventForOutcome({ correct: true, score: 0 })).toBe('ANSWER_CORRECT');
    expect(semanticEventForOutcome({ correct: false, score: 0.5 })).toBe('NEAR_MISS');
    expect(semanticEventForOutcome({ correct: false, score: 0 })).toBe('ANSWER_WRONG');
    expect(semanticEventForOutcome({ correct: false })).toBe('ANSWER_WRONG');
    expect(semanticEventForOutcome({ correct: false, score: null })).toBe('ANSWER_WRONG');
  });
});
