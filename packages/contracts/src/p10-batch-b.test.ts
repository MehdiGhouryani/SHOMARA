
import { describe, expect, it } from 'vitest';
import {
  P10_BATCH_B_CHALLENGES,
  P10_BATCH_B_STATIONS,
  p10BatchBProgress,
  p10BatchBViolations,
} from './p10-batch-b';

describe('P10 Batch B', () => {
  it('covers ST06–ST10 with no violations', () => {
    expect(p10BatchBViolations()).toEqual([]);
    expect(P10_BATCH_B_CHALLENGES.map((c) => c.stationId)).toEqual([...P10_BATCH_B_STATIONS]);
  });

  it('keeps educational gate open', () => {
    expect(p10BatchBProgress().batchGate).toBe('OPEN');
  });
});
