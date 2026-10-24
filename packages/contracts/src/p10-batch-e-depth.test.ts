import { describe, expect, it } from 'vitest';
import { P10_BATCH_E_DEPTH, p10BatchEDepthViolations, p10PlayableCoverageSummary } from './p10-batch-e-depth';
describe('P10 Batch E depth', () => {
  it('structure', () => {
    expect(p10BatchEDepthViolations()).toEqual([]);
    expect(P10_BATCH_E_DEPTH).toHaveLength(5);
  });
  it('25 playable stations claimed', () => {
    expect(p10PlayableCoverageSummary().playableDefinitionStations).toBe(25);
    expect(p10PlayableCoverageSummary().p10Status).toBe('IN_PROGRESS');
    expect(p10PlayableCoverageSummary().educationalSignOffComplete).toBe(false);
  });
});
