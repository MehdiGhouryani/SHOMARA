import { describe, it, expect } from 'vitest';
import {
  updateLearningState,
  isQualifyingCheck,
  hasStationPass,
  shouldRequireRecovery,
  nextStateForAttempt,
  STATION_CHECK_TOTAL_ITEMS,
  STATION_CHECK_REQUIRED_CORRECT,
} from '../policies';
import type { EvaluationResult, LearningStateRecord, StationCheckRecord } from '../types';

describe('Learning Runtime Policies & State Transitions', () => {
  const now = new Date().toISOString();

  const correctEval: EvaluationResult = {
    accepted: true,
    correct: true,
    score: 1,
    maxScore: 1,
    evaluatorVersion: 'v1',
    feedbackCode: 'CORRECT',
    payload: {},
  };

  const wrongEval: EvaluationResult = {
    accepted: true,
    correct: false,
    score: 0,
    maxScore: 1,
    evaluatorVersion: 'v1',
    feedbackCode: 'TRY_AGAIN',
    payload: {},
  };

  describe('updateLearningState mathematical soundness', () => {
    it('creates initial state with positive evidence (confidence=0.70, uncertainty=0.30, state=BUILDING)', () => {
      const state = updateLearningState(null, correctEval, now);

      expect(state.confidence).toBe(0.70);
      expect(state.uncertainty).toBe(0.30);
      expect(state.state).toBe('BUILDING');
      expect(state.revision).toBe(1);
      expect(state.retentionState).toBe('FRESH');
      expect(state.reviewNeed).toBe(false);
      expect(state.recoveryNeed).toBe(false);
    });

    it('transitions to STRONG when confidence reaches 0.80+', () => {
      const prev: LearningStateRecord = {
        learningIdentityId: 'child-1',
        skillId: 'G1-SK01',
        relationshipContextId: 'ctx-1',
        state: 'BUILDING',
        revision: 1,
        retentionState: 'FRESH',
        lastEvidenceAt: now,
        confidence: 0.70,
        uncertainty: 0.30,
        reviewNeed: false,
        recoveryNeed: false,
      };

      const updated = updateLearningState(prev, correctEval, now);

      expect(updated.confidence).toBe(0.85); // 0.70 + 0.15
      expect(updated.uncertainty).toBe(0.15); // 1 - 0.85
      expect(updated.state).toBe('STRONG');
      expect(updated.revision).toBe(2);
    });

    it('caps confidence at 0.95 maximum', () => {
      const prev: LearningStateRecord = {
        learningIdentityId: 'child-1',
        skillId: 'G1-SK01',
        relationshipContextId: 'ctx-1',
        state: 'STRONG',
        revision: 3,
        retentionState: 'FRESH',
        lastEvidenceAt: now,
        confidence: 0.90,
        uncertainty: 0.10,
        reviewNeed: false,
        recoveryNeed: false,
      };

      const updated = updateLearningState(prev, correctEval, now);

      expect(updated.confidence).toBe(0.95); // Capped at 0.95
      expect(updated.uncertainty).toBe(0.05);
      expect(updated.state).toBe('STRONG');
    });

    it('transitions to NEEDS_REVIEW upon negative evidence and decreases confidence by 0.25', () => {
      const prev: LearningStateRecord = {
        learningIdentityId: 'child-1',
        skillId: 'G1-SK01',
        relationshipContextId: 'ctx-1',
        state: 'STRONG',
        revision: 2,
        retentionState: 'FRESH',
        lastEvidenceAt: now,
        confidence: 0.85,
        uncertainty: 0.15,
        reviewNeed: false,
        recoveryNeed: false,
      };

      const updated = updateLearningState(prev, wrongEval, now);

      expect(updated.confidence).toBe(0.60); // 0.85 - 0.25
      expect(updated.uncertainty).toBe(0.40);
      expect(updated.state).toBe('NEEDS_REVIEW');
      expect(updated.reviewNeed).toBe(true);
      expect(updated.recoveryNeed).toBe(true);
    });

    it('floors confidence at 0.05 minimum', () => {
      const prev: LearningStateRecord = {
        learningIdentityId: 'child-1',
        skillId: 'G1-SK01',
        relationshipContextId: 'ctx-1',
        state: 'NEEDS_REVIEW',
        revision: 1,
        retentionState: 'AT_RISK',
        lastEvidenceAt: now,
        confidence: 0.10,
        uncertainty: 0.90,
        reviewNeed: true,
        recoveryNeed: true,
      };

      const updated = updateLearningState(prev, wrongEval, now);

      expect(updated.confidence).toBe(0.05); // Floored at 0.05
      expect(updated.uncertainty).toBe(0.95);
      expect(updated.state).toBe('NEEDS_REVIEW');
    });
  });

  describe('Station check and pass rules', () => {
    it('validates qualifying station checks correctly (4 out of 5 required)', () => {
      expect(isQualifyingCheck({ totalCount: STATION_CHECK_TOTAL_ITEMS, correctCount: STATION_CHECK_REQUIRED_CORRECT })).toBe(true);
      expect(isQualifyingCheck({ totalCount: STATION_CHECK_TOTAL_ITEMS, correctCount: 5 })).toBe(true);
      expect(isQualifyingCheck({ totalCount: STATION_CHECK_TOTAL_ITEMS, correctCount: 3 })).toBe(false);
      expect(isQualifyingCheck({ totalCount: 4, correctCount: 4 })).toBe(false); // Must be 5 items
    });

    it('evaluates station pass (requires at least 2 qualifying checks across 2 distinct sessions)', () => {
      const checks: StationCheckRecord[] = [
        {
          id: 'chk-1',
          learningIdentityId: 'child-1',
          sessionId: 'sess-1',
          encounterId: 'enc-1',
          attemptId: 'att-1',
          stationId: 'ST01',
          checkGroup: 'STATION_PASS',
          correctCount: 4,
          totalCount: 5,
          passedCheck: true,
          createdAt: now,
        },
        {
          id: 'chk-2',
          learningIdentityId: 'child-1',
          sessionId: 'sess-2',
          encounterId: 'enc-2',
          attemptId: 'att-2',
          stationId: 'ST01',
          checkGroup: 'STATION_PASS',
          correctCount: 5,
          totalCount: 5,
          passedCheck: true,
          createdAt: now,
        },
      ];

      expect(hasStationPass(checks)).toBe(true);

      // Same session should not qualify for station pass
      const sameSessionChecks: StationCheckRecord[] = [
        { ...checks[0]!, sessionId: 'sess-1' },
        { ...checks[1]!, sessionId: 'sess-1' },
      ];

      expect(hasStationPass(sameSessionChecks)).toBe(false);
    });
  });

  describe('nextStateForAttempt decision logic', () => {
    it('returns STATION_PASS if station pass achieved', () => {
      expect(nextStateForAttempt(correctEval, true)).toBe('STATION_PASS');
    });

    it('returns RECOVERY when attempt is incorrect and recovery is required', () => {
      expect(shouldRequireRecovery(wrongEval)).toBe(true);
      expect(nextStateForAttempt(wrongEval, false)).toBe('RECOVERY');
    });

    it('returns CONTINUE when attempt is correct without station pass', () => {
      expect(nextStateForAttempt(correctEval, false)).toBe('CONTINUE');
    });
  });
});
