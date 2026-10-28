import type { AnswerSubmission, EvaluationResult, RuntimeContentVersion } from './types.js';

export interface Evaluator {
  evaluate(content: RuntimeContentVersion, answers: AnswerSubmission[]): EvaluationResult;
}

export class ConfiguredEvaluator implements Evaluator {
  evaluate(content: RuntimeContentVersion, answers: AnswerSubmission[]): EvaluationResult {
    const cfg = content.evaluatorConfig;
    const evaluatorVersion = String(cfg.version ?? 'v1');
    const expected = Array.isArray(cfg.expectedAnswers) ? cfg.expectedAnswers : [cfg.expectedAnswer];
    const actual = answers.map((a) => a.answerPayload);
    const maxScore = Number(cfg.maxScore ?? expected.length ?? 1) || 1;
    const correctCount = expected.reduce((count, expectedAnswer, index) => {
      const answer = actual[index];
      return count + (deepEqual(answer, expectedAnswer) ? 1 : 0);
    }, 0);
    const score = Math.min(correctCount, maxScore);
    const correct = expected.length === 0 ? false : correctCount === expected.length && actual.length === expected.length;

    return {
      accepted: answers.length > 0,
      correct,
      score,
      maxScore,
      evaluatorVersion,
      feedbackCode: correct ? 'CORRECT' : 'TRY_AGAIN',
      payload: {
        correctCount,
        answerCount: actual.length,
        interactionType: content.interactionType,
      },
    };
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ak = Object.keys(a as Record<string, unknown>).sort();
    const bk = Object.keys(b as Record<string, unknown>).sort();
    return ak.length === bk.length && ak.every((key, i) => key === bk[i] && deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
  }
  return false;
}
