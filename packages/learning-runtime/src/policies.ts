import type { EvaluationResult, LearningStateName, LearningStateRecord, StationCheckRecord } from './types.js';

export const RUNTIME_POLICY_VERSION = 'phase13-postgres-v1';
export const STATION_PASS_POLICY_VERSION = 'phase15-station-pass-4of5x2-v1';
export const STATION_CHECK_TOTAL_ITEMS = 5;
export const STATION_CHECK_REQUIRED_CORRECT = 4;

export function updateLearningState(previous: LearningStateRecord | null, evaluation: EvaluationResult, now: string, qualifyingCheck = false): LearningStateRecord {
  const positiveEvidence = evaluation.correct || qualifyingCheck;
  const previousConfidence = previous?.confidence ?? 0;
  const confidence = positiveEvidence
    ? Math.min(0.95, previous ? previousConfidence + (evaluation.correct ? 0.15 : 0.10) : (evaluation.correct ? 0.70 : 0.60))
    : Math.max(0.05, previous ? previousConfidence - 0.25 : 0.20);
  const uncertainty = Number((1 - confidence).toFixed(3));
  const state: LearningStateName = positiveEvidence
    ? confidence >= 0.80 ? 'STRONG' : 'BUILDING'
    : 'NEEDS_REVIEW';
  return {
    learningIdentityId: previous?.learningIdentityId ?? '',
    skillId: previous?.skillId ?? '',
    relationshipContextId: previous?.relationshipContextId ?? '',
    state,
    revision: (previous?.revision ?? 0) + 1,
    retentionState: positiveEvidence ? 'FRESH' : (previous?.retentionState ?? 'FRESH'),
    lastEvidenceAt: now,
    confidence,
    uncertainty,
    reviewNeed: !positiveEvidence,
    recoveryNeed: !positiveEvidence,
  };
}

export function isQualifyingCheck(check: Pick<StationCheckRecord, 'correctCount' | 'totalCount'>): boolean {
  return check.totalCount === STATION_CHECK_TOTAL_ITEMS && check.correctCount >= STATION_CHECK_REQUIRED_CORRECT;
}

export function hasStationPass(checks: StationCheckRecord[]): boolean {
  const qualifying = checks.filter((check) => check.checkGroup === 'STATION_PASS' && isQualifyingCheck(check));
  const distinctSessions = new Set(qualifying.map((check) => check.sessionId));
  return qualifying.length >= 2 && distinctSessions.size >= 2;
}

export function shouldRequireRecovery(evaluation: EvaluationResult, qualifyingCheck = false): boolean {
  return evaluation.accepted && !evaluation.correct && !qualifyingCheck;
}

export function nextStateForAttempt(evaluation: EvaluationResult, stationPass: boolean, qualifyingCheck = false): 'CONTINUE' | 'RECOVERY' | 'STATION_PASS' {
  if (stationPass) return 'STATION_PASS';
  if (shouldRequireRecovery(evaluation, qualifyingCheck)) return 'RECOVERY';
  return 'CONTINUE';
}
