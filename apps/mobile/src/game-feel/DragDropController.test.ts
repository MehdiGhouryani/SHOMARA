import { describe, expect, it } from 'vitest';
import { centerOf, defaultDropOptions, distance, evaluateDrop, evaluateDropWith, feedbackEventForDrop, pointInsideRect } from './DragDropController';

describe('DragDropController', () => {
  const target = { x: 10, y: 20, width: 100, height: 80 };

  it('detects points inside a target', () => {
    expect(pointInsideRect({ x: 50, y: 40 }, target)).toBe(true);
    expect(pointInsideRect({ x: 0, y: 40 }, target)).toBe(false);
  });

  it('supports a small forgiving drop radius around the target', () => {
    const center = centerOf(target);
    expect(distance(center, { x: 62, y: 62 })).toBeLessThan(20);
    expect(evaluateDrop({ x: 62, y: 62 }, target, 20)).toBe('ACCEPTED');
    expect(evaluateDrop({ x: 180, y: 180 }, target, 20)).toBe('OUTSIDE');
  });

  it('does not invent a rejected learning answer', () => {
    expect(evaluateDrop({ x: 5, y: 5 }, target)).toBe('OUTSIDE');
  });

  it('distinguishes a target hit that is intentionally rejected', () => {
    expect(evaluateDrop({ x: 50, y: 50 }, { x: 0, y: 0, width: 100, height: 100 }, 0, false)).toBe('REJECTED');
  });

  it('reports a near miss just outside the target edge', () => {
    expect(evaluateDrop({ x: 5, y: 40 }, target, 0, true, 10)).toBe('NEAR_MISS');
    expect(evaluateDrop({ x: -20, y: 40 }, target, 0, true, 10)).toBe('OUTSIDE');
  });

  it('uses child-friendly default forgiveness proportional to target size', () => {
    const options = defaultDropOptions(target);
    expect(options.acceptanceRadius).toBeCloseTo(14.4);
    expect(options.nearMissMargin).toBeCloseTo(28);
    expect(evaluateDropWith({ x: -10, y: 60 }, target, options)).toBe('NEAR_MISS');
    expect(evaluateDropWith({ x: 60, y: 60 }, target, { ...options, canAccept: false })).toBe('REJECTED');
  });

  it('maps every placement result to a shared interaction feedback event', () => {
    expect(feedbackEventForDrop('ACCEPTED')).toBe('DROP_ACCEPTED');
    expect(feedbackEventForDrop('REJECTED')).toBe('DROP_REJECTED');
    expect(feedbackEventForDrop('NEAR_MISS')).toBe('DROP_NEAR_MISS');
    expect(feedbackEventForDrop('OUTSIDE')).toBe('DROP_OUTSIDE');
  });
});
