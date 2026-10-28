
import { describe, expect, it } from 'vitest';
import { P10_BATCH_B_DEPTH, p10BatchBDepthViolations } from './p10-batch-b-depth';
describe('P10 Batch B depth', () => {
  it('structure ok', () => {
    expect(p10BatchBDepthViolations()).toEqual([]);
    expect(P10_BATCH_B_DEPTH).toHaveLength(5);
    expect(P10_BATCH_B_DEPTH.every((c) => c.gameCode === 'G1-GAME-001')).toBe(true);
  });
});
