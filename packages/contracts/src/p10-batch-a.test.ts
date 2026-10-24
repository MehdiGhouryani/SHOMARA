
import { describe, expect, it } from 'vitest';
import {
  P10_BATCH_A_CHALLENGES,
  p10BatchAContentMatrix,
  p10BatchAProgress,
  p10BatchAViolations,
  P10_BATCH_A_STATIONS,
} from './p10-batch-a';

describe('P10 Batch A', () => {
  it('covers ST02–ST05 with no catalog violations', () => {
    expect(p10BatchAViolations()).toEqual([]);
    expect(P10_BATCH_A_CHALLENGES.map((c) => c.stationId)).toEqual([...P10_BATCH_A_STATIONS]);
  });

  it('maps every challenge to real G1 skills and PRACTICE evidence posture', () => {
    for (const c of P10_BATCH_A_CHALLENGES) {
      expect(c.primarySkillIds.every((s) => s.startsWith('G1-SK'))).toBe(true);
      expect(c.evaluatorVersion.length).toBeGreaterThan(5);
      expect(c.educationalReview).toBe('PENDING_HUMAN_SIGN_OFF');
    }
  });

  it('exposes content matrix rows for educational review', () => {
    const matrix = p10BatchAContentMatrix();
    expect(matrix).toHaveLength(4);
    expect(matrix.every((r) => r.evidencePolicy === 'PRACTICE_EVIDENCE')).toBe(true);
  });

  it('keeps batch gate open until human sign-off', () => {
    const progress = p10BatchAProgress();
    expect(progress.batchGate).toBe('OPEN');
    expect(progress.deviceSmoke).toBe('PENDING');
  });
});
