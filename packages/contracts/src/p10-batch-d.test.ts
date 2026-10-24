
import { describe, expect, it } from 'vitest';
import { P10_BATCH_D_CHALLENGES, P10_BATCH_D_STATIONS, p10BatchDProgress, p10BatchDViolations } from './p10-batch-d';
describe('P10 Batch D', () => {
  it('covers ST16–ST20', () => {
    expect(p10BatchDViolations()).toEqual([]);
    expect(P10_BATCH_D_CHALLENGES.map((c) => c.stationId)).toEqual([...P10_BATCH_D_STATIONS]);
  });
  it('gate open', () => expect(p10BatchDProgress().batchGate).toBe('OPEN'));
});
