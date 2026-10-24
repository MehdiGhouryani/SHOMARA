import { describe, expect, it } from 'vitest';
import { ConfiguredEvaluator } from '../evaluator';
import { hasStationPass, isQualifyingCheck } from '../policies';
import type { RuntimeContentVersion, StationCheckRecord } from '../types';

const evaluator = new ConfiguredEvaluator();

function content(expectedAnswers: unknown[]): RuntimeContentVersion {
  return {
    id: 'cv-golden',
    gradeId: 'G1',
    stationId: 'G1-ST01',
    skillId: 'G1-SK001',
    learningRole: 'INDEPENDENT_PRACTICE',
    experienceForm: 'MINI_GAME',
    interactionType: 'CHOICE',
    answerSchema: { type: 'choice' },
    evaluatorConfig: { expectedAnswers, version: 'configured-v1', maxScore: expectedAnswers.length },
  };
}

const check = (sessionId: string, correctCount: number, passedCheck = true): StationCheckRecord => ({
  id: `check-${sessionId}-${correctCount}`,
  learningIdentityId: 'li-1',
  stationId: 'station-1',
  sessionId,
  encounterId: `enc-${sessionId}`,
  attemptId: `attempt-${sessionId}-${correctCount}`,
  correctCount,
  totalCount: 5,
  passedCheck,
  checkGroup: 'STATION_PASS',
  createdAt: '2026-10-03T12:00:00.000Z',
});

describe('P02 golden learning runtime vectors', () => {
  it('accepts a single exact answer', () => {
    const result = evaluator.evaluate(content([1]), [{ answerIndex: 1, answerPayload: 1 }]);
    expect(result.accepted).toBe(true);
    expect(result.correct).toBe(true);
    expect(result.score).toBe(1);
    expect(result.maxScore).toBe(1);
  });

  it('rejects a single wrong answer without inventing a pass', () => {
    const result = evaluator.evaluate(content([1]), [{ answerIndex: 0, answerPayload: 0 }]);
    expect(result.accepted).toBe(true);
    expect(result.correct).toBe(false);
    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(1);
  });

  it('evaluates five-question mastery exactly', () => {
    const answers = [0, 1, 2, 3, 4].map((index) => ({ answerIndex: index, answerPayload: index }));
    const result = evaluator.evaluate(content([0, 1, 2, 3, 4]), answers);
    expect(result.correct).toBe(true);
    expect(result.score).toBe(5);
    expect(result.maxScore).toBe(5);
  });

  it('compares nested answer payloads structurally', () => {
    const payload = { selected: ['A', 'B'], value: 2 };
    const result = evaluator.evaluate(content([payload]), [{ answerIndex: 0, answerPayload: { value: 2, selected: ['A', 'B'] } }]);
    expect(result.correct).toBe(true);
  });

  it('keeps partial multi-answer work below a full correctness result', () => {
    const answers = [0, 1, 2, 9].map((index) => ({ answerIndex: index, answerPayload: index }));
    const result = evaluator.evaluate(content([0, 1, 2, 3]), answers);
    expect(result.accepted).toBe(true);
    expect(result.correct).toBe(false);
    expect(result.score).toBe(3);
    expect(result.maxScore).toBe(4);
  });

  it('does not treat one qualifying check as station pass', () => {
    expect(isQualifyingCheck(check('s1', 4))).toBe(true);
    expect(hasStationPass([check('s1', 4)])).toBe(false);
    expect(hasStationPass([check('s1', 4), check('s1', 5)])).toBe(false);
    expect(hasStationPass([check('s1', 4), check('s2', 4)])).toBe(true);
  });

  it('requires two distinct qualifying sessions even when many checks exist', () => {
    expect(hasStationPass([check('s1', 4), check('s1', 4), check('s1', 4)])).toBe(false);
    expect(hasStationPass([check('s1', 4), check('s2', 4), check('s3', 3, false)])).toBe(true);
  });
});
