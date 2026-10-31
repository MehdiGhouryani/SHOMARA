import { describe, expect, it } from 'vitest';
import { stripAnswerKeyFields, toClientEncounter } from '../learning-client-content';
import { findAnswerKeyLeaks } from '@math/contracts';

describe('learning client content sanitiser (allowlist, ADR-0037 item 1.2)', () => {
  it('keeps only the enumerated client encounter/content keys', () => {
    const encounter = {
      id: 'enc-1',
      sessionId: 's-1',
      sequence: 2,
      stationId: 'G1-ST01',
      skillId: 'G1-SK001',
      contentVersionId: 'cv-1',
      learningRole: 'INSTRUCTION',
      experienceForm: 'CONVERSATION_EXPLANATION',
      status: 'ACTIVE',
      content: {
        id: 'cv-1',
        prompt: 'چند مهره می‌بینی؟',
        interactionType: 'TAP',
        presentation: { title: 'شکار شمارش', options: ['۲', '۳', '۴'] },
      },
    };
    const out = toClientEncounter(encounter) as typeof encounter;
    expect(out).toEqual(encounter);
    // The contract's own leak scanner agrees the client payload is clean.
    expect(findAnswerKeyLeaks(out)).toEqual([]);
  });

  it('drops evaluator/answer-key fields and any unknown key by construction', () => {
    const encounter = {
      id: 'enc-1',
      sequence: 2,
      content: {
        id: 'cv-1',
        prompt: 'چند مهره می‌بینی؟',
        answerSchema: { kind: 'single-choice' },
        evaluatorConfig: { expectedAnswers: [1], version: 'v1' },
        expectedIndex: 1,
        expected_answers: 'leak-at-any-casing-style',
        scoringRubric: { pass: 1 },
        metadata: { presentation: { title: 'شکار شمارش' } },
      },
    };
    const out = toClientEncounter(encounter) as typeof encounter;
    expect(out.content.evaluatorConfig).toBeUndefined();
    expect(out.content.expectedIndex).toBeUndefined();
    expect(out.content.expected_answers).toBeUndefined();
    expect(out.content.scoringRubric).toBeUndefined();
    // Unknown structural keys (answerSchema, metadata) never reach the client either.
    expect(out.content.answerSchema).toBeUndefined();
    expect((out.content as Record<string, unknown>).metadata).toBeUndefined();
    expect(out.content.prompt).toBe(encounter.content.prompt);
    expect(findAnswerKeyLeaks(out)).toEqual([]);
  });

  it('strips answer-key keys at every depth inside authored display containers', () => {
    const encounter = {
      id: 'enc-1',
      content: {
        prompt: 'p',
        interactionType: 'MULTIPLE_CHOICE',
        presentation: {
          title: 't',
          questions: [{ display: '۱+۱', expectedIndex: 2, solution: '۲' }],
          options: ['الف', 'ب'],
        },
        options: [{ label: 'الف', correctAnswer: true }],
      },
    };
    const out = toClientEncounter(encounter) as typeof encounter;
    const presentation = out.content.presentation as { questions: Array<Record<string, unknown>> };
    expect(presentation.questions[0]?.expectedIndex).toBeUndefined();
    expect(presentation.questions[0]?.solution).toBeUndefined();
    expect(presentation.questions[0]?.display).toBe('۱+۱');
    expect((out.content.options as Array<Record<string, unknown>>)[0]?.correctAnswer).toBeUndefined();
    expect((out.content.options as Array<Record<string, unknown>>)[0]?.label).toBe('الف');
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
