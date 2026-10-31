import { describe, expect, it } from 'vitest';
import { NODE_CANONICAL_MAPPINGS } from '../learning-api-client';
import { findAnswerKeyLeaks } from '@math/contracts';

/**
 * Bundle-level answer-key isolation (ADR-0037 item 1.1): the static client mapping used to
 * carry hardcoded `expectedIndex` values, which is how answer indices reached the production
 * client chunk. These tests pin the invariant that the client module can never carry them.
 */
describe('client mapping answer-key isolation', () => {
  it('carries no expectedIndex (or any answer-key field) in any mapping entry', () => {
    const entries = Object.values(NODE_CANONICAL_MAPPINGS);
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(Object.keys(entry)).not.toContain('expectedIndex');
      expect(findAnswerKeyLeaks(entry)).toEqual([]);
    }
  });

  it('serialises to JSON with no answer-key fields (what the bundle would embed)', () => {
    const serialized = JSON.stringify(NODE_CANONICAL_MAPPINGS);
    for (const key of ['expectedIndex', 'evaluatorConfig', 'expectedAnswers', 'answerKey', 'correctAnswer', 'solution', 'scoringRubric']) {
      expect(serialized).not.toContain(key);
    }
  });
});
