import { describe, expect, it } from 'vitest';
import { GameFeelController } from './GameFeelController';
import { makeAnimationEvent } from '../animation/semanticEvents';

describe('GameFeelController', () => {
  it('maps correct answers to calm positive feedback', () => {
    const controller = new GameFeelController();
    const state = controller.dispatch(makeAnimationEvent('ANSWER_CORRECT'), 1000);
    expect(state.characterState).toBe('CORRECT');
    expect(state.feedback?.tone).toBe('POSITIVE');
    expect(state.feedback?.blocksInput).toBe(false);
    expect(state.feedbackUntil).toBe(1650);
  });

  it('reserves celebration for meaningful milestones', () => {
    const controller = new GameFeelController();
    const answer = controller.dispatch(makeAnimationEvent('ANSWER_WRONG'), 1000);
    expect(answer.feedback?.tone).toBe('ENCOURAGE');
    const pass = controller.dispatch(makeAnimationEvent('STATION_PASS'), 2000);
    expect(pass.feedback?.tone).toBe('CELEBRATE');
    expect(pass.feedback?.blocksInput).toBe(true);
    expect(pass.feedbackUntil).toBe(3400);
  });


  it('keeps visible answer feedback across an immediate silent transition', () => {
    const controller = new GameFeelController();
    controller.dispatch(makeAnimationEvent('ANSWER_CORRECT'), 1000);
    const next = controller.dispatch(makeAnimationEvent('EXPLAIN'), 1100);
    expect(next.lastEvent?.type).toBe('EXPLAIN');
    expect(next.feedback?.message).toBe('درست بود!');
    expect(next.characterState).toBe('CORRECT');
    expect(next.feedbackUntil).toBe(1650);
  });

  it('returns the character to the latest semantic state after feedback ends', () => {
    const controller = new GameFeelController();
    controller.dispatch(makeAnimationEvent('ANSWER_CORRECT'), 1000);
    controller.dispatch(makeAnimationEvent('EXPLAIN'), 1100);
    const cleared = controller.clearFeedback();
    expect(cleared.characterState).toBe('THINK');
    expect(cleared.lastEvent?.type).toBe('EXPLAIN');
  });

  it('can clear transient feedback without resetting the semantic event', () => {
    const controller = new GameFeelController();
    controller.dispatch(makeAnimationEvent('ANSWER_CORRECT'), 1000);
    const cleared = controller.clearFeedback();
    expect(cleared.feedback).toBeNull();
    expect(cleared.lastEvent?.type).toBe('ANSWER_CORRECT');
    expect(cleared.characterState).toBe('CORRECT');
  });
});

describe('GameFeelController near miss', () => {
  it('treats a near miss as encouragement, not failure or celebration', () => {
    const controller = new GameFeelController();
    const state = controller.dispatch(makeAnimationEvent('NEAR_MISS'), 1000);
    expect(state.characterState).toBe('ENCOURAGE');
    expect(state.feedback?.tone).toBe('ENCOURAGE');
    expect(state.feedback?.blocksInput).toBe(false);
    expect(state.feedbackUntil).toBe(1700);
  });

  it('a later meaningful event replaces an active reaction', () => {
    const controller = new GameFeelController();
    controller.dispatch(makeAnimationEvent('ANSWER_WRONG'), 1000);
    const next = controller.dispatch(makeAnimationEvent('ANSWER_CORRECT'), 1200);
    expect(next.feedback?.tone).toBe('POSITIVE');
    expect(next.characterState).toBe('CORRECT');
  });

  it('expired feedback is not preserved by a silent event', () => {
    const controller = new GameFeelController();
    controller.dispatch(makeAnimationEvent('ANSWER_CORRECT'), 1000);
    const later = controller.dispatch(makeAnimationEvent('EXPLAIN'), 5000);
    expect(later.feedback?.message).toBeUndefined();
    expect(later.characterState).toBe('THINK');
  });
});
