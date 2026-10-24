/**
 * Phase 4 — content quality gates for P10 depth packs.
 * Bounds + answer-position spread (not educational sign-off).
 */
import { describe, expect, it } from 'vitest';
import { P10_BATCH_A_DEPTH, p10BatchADepthViolations } from './p10-batch-a-depth';
import { P10_BATCH_B_DEPTH, p10BatchBDepthViolations } from './p10-batch-b-depth';
import { P10_BATCH_C_DEPTH, p10BatchCDepthViolations } from './p10-batch-c-depth';
import { P10_BATCH_D_DEPTH, p10BatchDDepthViolations } from './p10-batch-d-depth';
import { P10_BATCH_E_DEPTH, p10BatchEDepthViolations, p10PlayableCoverageSummary } from './p10-batch-e-depth';

const ALL = [
  ...P10_BATCH_A_DEPTH,
  ...P10_BATCH_B_DEPTH,
  ...P10_BATCH_C_DEPTH,
  ...P10_BATCH_D_DEPTH,
  ...P10_BATCH_E_DEPTH,
] as const;

describe('P10 depth quality (Phase 4)', () => {
  it('batch structural violation helpers are clean', () => {
    expect(p10BatchADepthViolations()).toEqual([]);
    expect(p10BatchBDepthViolations()).toEqual([]);
    expect(p10BatchCDepthViolations()).toEqual([]);
    expect(p10BatchDDepthViolations()).toEqual([]);
    expect(p10BatchEDepthViolations()).toEqual([]);
  });

  it('every expectedOptionIndex is in range', () => {
    for (const ch of ALL) {
      for (const r of ch.rounds) {
        for (const v of r.variants) {
          expect(v.expectedOptionIndex).toBeGreaterThanOrEqual(0);
          expect(v.expectedOptionIndex).toBeLessThan(v.optionsFa.length);
          expect(v.optionsFa.length).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it('answer positions are not collapsed onto index 0', () => {
    let total = 0;
    let at0 = 0;
    const hist = [0, 0, 0, 0];
    for (const ch of ALL) {
      for (const r of ch.rounds) {
        for (const v of r.variants) {
          total += 1;
          if (v.expectedOptionIndex === 0) at0 += 1;
          if (v.expectedOptionIndex >= 0 && v.expectedOptionIndex < 4) {
            hist[v.expectedOptionIndex] += 1;
          }
        }
      }
    }
    expect(total).toBe(216);
    // Before rebalance ~50%+ were index 0 across batches; require stricter spread.
    expect(at0 / total).toBeLessThan(0.5);
    // At least some mass on index 2+ (items with ≥3 options).
    expect(hist[2] + hist[3]).toBeGreaterThan(30);
    // No single slot monopolizes when multiple slots exist.
    expect(hist[0]).toBeGreaterThan(20);
    expect(hist[1]).toBeGreaterThan(20);
  });

  it('coverage summary reflects rebalance + open human gates', () => {
    const s = p10PlayableCoverageSummary();
    expect(s.playableDefinitionStations).toBe(25);
    expect(s.educationalSignOffComplete).toBe(false);
    expect(s.answerPositionRebalanced).toBe(true);
    expect(s.p10Status).toBe('IN_PROGRESS');
  });
});
