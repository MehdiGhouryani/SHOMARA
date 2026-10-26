import { describe, expect, it } from 'vitest';
import { stripAnswerKeyFields, toClientEncounter } from '../learning-client-content';
import { findAnswerKeyLeaks } from '@math/contracts';

describe('learning client content sanitizer (wave A3)', () => {
  it('strips evaluator/answer-key keys at every depth and keeps everything else', () => {
    const encounter = {
      id: 'enc-1',
      sequence: 2,
      content: {
        id: 'cv-1',
        prompt: 'چند مهره می‌بینی؟',
        answerSchema: { kind: 'single-choice' },
        evaluatorConfig: { expectedAnswers: [1], version: 'v1' },
        expected_answers: 'leak-at-any-casing-style',
        metadata: { presentation: { title: 'شکار شمارش', options: ['۲', '۳', '۴'] }, nested: { solution: [3] } },
      },
    };
    const out = toClientEncounter(encounter) as typeof encounter;
    expect(out.content.evaluatorConfig).toBeUndefined();
    expect(out.content.expected_answers).toBeUndefined();
    const meta = out.content.metadata as { presentation?: { title?: string }; nested?: { solution?: number[] } };
    expect(meta.nested?.solution).toBeUndefined();
    expect(out.content.prompt).toBe(encounter.content.prompt);
    expect(out.content.answerSchema).toEqual({ kind: 'single-choice' });
    expect(out.content.metadata).toMatchObject({ presentation: { title: 'شکار شمارش', options: ['۲', '۳', '۴'] } });
    // The contract's own leak scanner agrees the client payload is clean.
    expect(findAnswerKeyLeaks(out)).toEqual([]);
  });

  it('leaves arrays, scalars and nulls intact', () => {
    expect(stripAnswerKeyFields([1, 'x', null, true])).toEqual([1, 'x', null, true]);
    expect(stripAnswerKeyFields('plain')).toBe('plain');
    expect(stripAnswerKeyFields(42)).toBe(42);
    expect(stripAnswerKeyFields(null)).toBeNull();
  });

  it('reports a leak for the raw server payload it is meant to clean', () => {
    const rawServerEncounter = { content: { evaluatorConfig: { expectedAnswers: [0] } } };
    expect(findAnswerKeyLeaks(rawServerEncounter).length).toBeGreaterThan(0);
  });
});
