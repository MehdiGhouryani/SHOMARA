import { describe, it, expect } from 'vitest';
import { ConfiguredEvaluator } from '../evaluator';
import type { RuntimeContentVersion, AnswerSubmission } from '../types';

describe('ConfiguredEvaluator', () => {
  const evaluator = new ConfiguredEvaluator();

  const mockContent: RuntimeContentVersion = {
    id: 'cv-g1-sk01-v1',
    gradeId: 'G1',
    stationId: 'ST01',
    skillId: 'G1-SK01',
    learningRole: 'INDEPENDENT_PRACTICE',
    experienceForm: 'PUZZLE',
    interactionType: 'COUNT',
    answerSchema: { type: 'object' },
    evaluatorConfig: {
      version: 'v1',
      expectedAnswer: 5,
      maxScore: 1,
    },
  };

  it('evaluates correct answer correctly', () => {
    const answers: AnswerSubmission[] = [{ answerIndex: 0, answerPayload: 5 }];
    const result = evaluator.evaluate(mockContent, answers);

    expect(result.accepted).toBe(true);
    expect(result.correct).toBe(true);
    expect(result.score).toBe(1);
    expect(result.maxScore).toBe(1);
    expect(result.feedbackCode).toBe('CORRECT');
  });

  it('evaluates wrong answer correctly', () => {
    const answers: AnswerSubmission[] = [{ answerIndex: 0, answerPayload: 3 }];
    const result = evaluator.evaluate(mockContent, answers);

    expect(result.accepted).toBe(true);
    expect(result.correct).toBe(false);
    expect(result.score).toBe(0);
    expect(result.feedbackCode).toBe('TRY_AGAIN');
  });

  it('handles array/object deep equal comparison', () => {
    const patternContent: RuntimeContentVersion = {
      ...mockContent,
      evaluatorConfig: {
        version: 'v1',
        expectedAnswers: [{ color: 'blue', seq: 1 }, { color: 'yellow', seq: 2 }],
        maxScore: 2,
      },
    };

    const correctAnswers: AnswerSubmission[] = [
      { answerIndex: 0, answerPayload: { color: 'blue', seq: 1 } },
      { answerIndex: 1, answerPayload: { color: 'yellow', seq: 2 } },
    ];

    const result = evaluator.evaluate(patternContent, correctAnswers);

    expect(result.correct).toBe(true);
    expect(result.score).toBe(2);
    expect(result.maxScore).toBe(2);
  });
});
