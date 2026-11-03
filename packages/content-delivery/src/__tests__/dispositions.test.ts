import { describe, expect, it } from 'vitest';
import {
  CALIBRATION_V1,
  CONTENT_DISPOSITIONS,
  OPEN_OWNER_DECISIONS,
  allDispositionsClosed,
  applyCalibration,
  rollbackCalibration,
  st23RequiresConcreteBundles,
  st25IsCapstoneOnly,
  t08GridAllowed,
} from '../dispositions';

const ALL_IDS = Array.from({ length: 18 }, (_, i) => `CONTENT-${String(i + 1).padStart(3, '0')}`);

describe('N08-08 dispositions ledger', () => {
  it('covers exactly the 18 audited CONTENT ids with unique keys', () => {
    expect(Object.keys(CONTENT_DISPOSITIONS).sort()).toEqual(ALL_IDS);
  });

  it('every disposition carries non-empty evidence', () => {
    for (const [id, d] of Object.entries(CONTENT_DISPOSITIONS)) {
      expect(d.evidence.length, `${id} evidence`).toBeGreaterThan(10);
    }
  });

  it('resolves only issues with recorded owner/phase evidence; open decisions stay open', () => {
    // N06 + N07 recorded resolutions in source-audit.json:
    const closedByPhase = [
      'CONTENT-001', 'CONTENT-002', 'CONTENT-003', 'CONTENT-008',
      'CONTENT-014', 'CONTENT-015', 'CONTENT-017', 'CONTENT-018', // N06
      'CONTENT-006', 'CONTENT-010', 'CONTENT-013', // N07 (006 stays open for the final voice choice)
    ];
    for (const id of closedByPhase) {
      if (id === 'CONTENT-006') continue; // final narrator decision is still open
      const decision = CONTENT_DISPOSITIONS[id].decision;
      expect(['RESOLVED', 'RESOLVED_FOR_UI'], `${id} must be closed`).toContain(decision);
    }
    // Honest open list:
    expect(OPEN_OWNER_DECISIONS).toEqual(['CONTENT-005', 'CONTENT-006', 'CONTENT-007', 'CONTENT-016']);
  });

  it('allDispositionsClosed is false while owner decisions are pending', () => {
    expect(allDispositionsClosed()).toBe(false);
  });
});

describe('N08-12 versioned calibration config', () => {
  it('v1 pins the audited initial values (SOURCE_AUDIT CONTENT-011/014/016/007)', () => {
    expect(CALIBRATION_V1.configVersion).toBe(1);
    expect(CALIBRATION_V1.idleReplayMs).toBe(8000);
    expect(CALIBRATION_V1.traceToleranceDp).toBe(28);
    expect(CALIBRATION_V1.transitionFastMs).toBe(250);
    expect(CALIBRATION_V1.transitionMediumMs).toBe(350);
    expect(CALIBRATION_V1.transitionSlowMs).toBe(450);
    expect(CALIBRATION_V1.speechRateDeltaPercent).toBe(-15);
    expect(CALIBRATION_V1.masteryPassThreshold).toBe('3/4');
    expect(CALIBRATION_V1.t08GridMaxSize).toBeLessThan(9); // 9×9 stays out of Grade-1 interactive scope
  });

  it('applyCalibration rejects silent downgrades', () => {
    const v2 = { ...CALIBRATION_V1, configVersion: 2, idleReplayMs: 9000 };
    expect(applyCalibration(CALIBRATION_V1, v2).idleReplayMs).toBe(9000);
    expect(() => applyCalibration(v2, CALIBRATION_V1)).toThrowError(/CALIBRATION_DOWNGRADE_REJECTED/);
  });

  it('applyCalibration rejects invalid versions', () => {
    expect(() => applyCalibration(CALIBRATION_V1, { ...CALIBRATION_V1, configVersion: 0 })).toThrowError(/CALIBRATION_INVALID_VERSION/);
    expect(() => applyCalibration(CALIBRATION_V1, { ...CALIBRATION_V1, configVersion: 1.5 })).toThrowError(/CALIBRATION_INVALID_VERSION/);
  });

  it('rollbackCalibration restores a previous version wholesale and validates it', () => {
    const v2 = applyCalibration(CALIBRATION_V1, { ...CALIBRATION_V1, configVersion: 2, traceToleranceDp: 24 });
    const restored = rollbackCalibration(CALIBRATION_V1);
    expect(restored.traceToleranceDp).toBe(28);
    expect(() => applyCalibration(v2, restored)).toThrowError(/CALIBRATION_DOWNGRADE_REJECTED/);
    expect(() => rollbackCalibration({ ...CALIBRATION_V1, configVersion: -1 })).toThrowError(/CALIBRATION_INVALID_VERSION/);
  });

  it('keeps frozen shapes immutable (no accidental mutation of the shared config)', () => {
    expect(Object.isFrozen(CALIBRATION_V1)).toBe(true);
    expect(Object.isFrozen(CONTENT_DISPOSITIONS)).toBe(true);
    expect(Object.isFrozen(OPEN_OWNER_DECISIONS)).toBe(true);
  });
});

describe('CONTENT-016 curriculum scope gates', () => {
  it('t08GridAllowed accepts progressive sub-grids and rejects 9×9 / invalid sizes', () => {
    expect(t08GridAllowed(3)).toBe(true);
    expect(t08GridAllowed(5)).toBe(true);
    expect(t08GridAllowed(6)).toBe(true);
    expect(t08GridAllowed(9)).toBe(false);
    expect(t08GridAllowed(1)).toBe(false);
    expect(t08GridAllowed(4.5)).toBe(false);
    expect(t08GridAllowed(NaN)).toBe(false);
  });

  it('t08GridAllowed honors a config override (server-rollbackable scope)', () => {
    const wider = { ...CALIBRATION_V1, configVersion: 2, t08GridMaxSize: 9 };
    expect(t08GridAllowed(9, wider)).toBe(true);
    expect(t08GridAllowed(9)).toBe(false);
  });

  it('ST23 requires concrete bundles first and ST25 stays capstone-only', () => {
    expect(st23RequiresConcreteBundles()).toBe(true);
    expect(st25IsCapstoneOnly()).toBe(true);
    const relaxed = { ...CALIBRATION_V1, configVersion: 2, st23Policy: 'DEFERRED_TO_G2', st25Policy: 'DEFERRED_TO_G2' };
    expect(st23RequiresConcreteBundles(relaxed)).toBe(false);
    expect(st25IsCapstoneOnly(relaxed)).toBe(false);
  });
});
