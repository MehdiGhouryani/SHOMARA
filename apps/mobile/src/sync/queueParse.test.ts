import { describe, expect, it } from 'vitest';
import { parseQueueText } from './queueParse';

const action = (over: Record<string, unknown> = {}) => ({
  id: 'a1', clientInstallationId: 'c', learningIdentityId: 'l', operationType: 'SUBMIT_ATTEMPT',
  idempotencyKey: 'k1', payload: {}, status: 'PENDING', attemptCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', ...over,
});

describe('parseQueueText', () => {
  it('treats empty text as an empty queue', () => { expect(parseQueueText('')).toEqual([]); expect(parseQueueText('  \n')).toEqual([]); });
  it('returns null for truncated or non-array JSON so the caller can quarantine it', () => {
    expect(parseQueueText('[{"id":"a1","status":')).toBeNull();
    expect(parseQueueText('{"id":"a1"}')).toBeNull();
    expect(parseQueueText('null')).toBeNull();
  });
  it('keeps every real status, including ACKED and REJECTED', () => {
    const text = JSON.stringify(['PENDING', 'SYNCING', 'RETRY', 'ACKED', 'REJECTED'].map((status, i) => action({ id: `a${i}`, status })));
    expect(parseQueueText(text)?.map((x) => x.status)).toEqual(['PENDING', 'SYNCING', 'RETRY', 'ACKED', 'REJECTED']);
  });
  it('drops malformed entries without losing valid ones', () => {
    const text = JSON.stringify([action(), { id: 5 }, null, action({ id: 'a2', status: 'BOGUS' }), action({ id: 'a3', idempotencyKey: undefined })]);
    expect(parseQueueText(text)?.map((x) => x.id)).toEqual(['a1']);
  });
});
