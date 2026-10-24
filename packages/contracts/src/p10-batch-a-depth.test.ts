
import { describe, expect, it } from 'vitest';
import { P10_BATCH_A_DEPTH, p10BatchADepthViolations } from './p10-batch-a-depth';

describe('P10 Batch A depth', () => {
  it('has no structural violations', () => {
    expect(p10BatchADepthViolations()).toEqual([]);
  });
  it('uses playable engine template for all four stations', () => {
    expect(P10_BATCH_A_DEPTH.every((c) => c.gameCode === 'G1-GAME-001')).toBe(true);
    expect(P10_BATCH_A_DEPTH).toHaveLength(4);
  });
  it('has 3x3 variants per challenge', () => {
    for (const c of P10_BATCH_A_DEPTH) {
      expect(c.rounds).toHaveLength(3);
      for (const r of c.rounds) expect(r.variants).toHaveLength(3);
    }
  });
});
