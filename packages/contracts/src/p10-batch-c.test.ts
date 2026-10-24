
import { describe, expect, it } from 'vitest';
import { P10_BATCH_C_CHALLENGES, P10_BATCH_C_STATIONS, p10BatchCProgress, p10BatchCViolations } from './p10-batch-c';

describe('P10 Batch C', () => {
  it('covers ST11–ST15', () => {
    expect(p10BatchCViolations()).toEqual([]);
    expect(P10_BATCH_C_CHALLENGES.map((c) => c.stationId)).toEqual([...P10_BATCH_C_STATIONS]);
  });
  it('gate stays open', () => {
    expect(p10BatchCProgress().batchGate).toBe('OPEN');
  });
});
