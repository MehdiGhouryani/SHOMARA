import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Live view of process.env (the afterEach hook replaces process.env, so never capture the object itself).
const env = new Proxy({} as Record<string, string | undefined>, {
  get: (_t, key: string) => process.env[key],
  set: (_t, key: string, value) => { process.env[key] = value as string; return true; },
  deleteProperty: (_t, key: string) => { delete process.env[key]; return true; },
});
const post = (rawBody: string, headers: Record<string, string> = {}) =>
  new Request('http://x/api/v1/sync/batch', { method: 'POST', headers: { 'content-type': 'application/json', 'x-client-installation-id': 'i1', ...headers }, body: rawBody });

const validSubmitAction = {
  id: 'a1',
  clientInstallationId: 'i1',
  learningIdentityId: 'child-dev-01',
  operationType: 'SUBMIT_ATTEMPT' as const,
  idempotencyKey: 'station01:v2:i1:s1:e1:cv1',
  payload: {
    learningIdentityId: 'child-dev-01',
    relationshipContextId: 'platform',
    sessionId: 'sess-1',
    encounterId: 'enc-1',
    attemptNumber: 1,
    clientIdempotencyKey: 'station01:v2:i1:s1:e1:cv1',
    answers: [{ answerIndex: 1, answerPayload: 3 }],
  },
  status: 'PENDING',
  attemptCount: 0,
  createdAt: '',
  updatedAt: '',
};

describe('sync/batch server-side payload validation (wave B3)', () => {
  const original = { ...process.env };
  beforeEach(() => { env.NODE_ENV = 'test'; env.ALLOW_DEV_PRINCIPAL = '1'; });
  afterEach(() => { process.env = { ...original }; });

  it('rejects a malformed action permanently (SYNC_ACTION_INVALID) without failing the rest of the batch', async () => {
    const { POST } = await import('@/app/api/v1/sync/batch/route');
    const broken = { ...validSubmitAction, idempotencyKey: 'k2', payload: { ...validSubmitAction.payload, attemptNumber: 9999 } };
    const res = await POST(post(JSON.stringify({ actions: [broken, validSubmitAction] })));
    expect(res.status).toBe(200);
    const { results } = (await res.json()) as { results: Array<{ status: string; errorCode?: string }> };
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ status: 'REJECTED', errorCode: 'SYNC_ACTION_INVALID' });
    // The valid action got past shape validation: it fails later on the unknown encounter
    // (a domain error), not with SYNC_ACTION_INVALID.
    expect(results[1]?.errorCode).toBe('ENCOUNTER_NOT_FOUND');
  });

  it('rejects non-object actions and unknown operation types by shape, not by substring guessing', async () => {
    const { POST } = await import('@/app/api/v1/sync/batch/route');
    const res = await POST(post(JSON.stringify({ actions: [null, { ...validSubmitAction, id: 'a2', idempotencyKey: 'k3', operationType: 'NOT_A_THING' }] })));
    const { results } = (await res.json()) as { results: Array<{ status: string; errorCode?: string }> };
    expect(results[0]).toMatchObject({ status: 'REJECTED', errorCode: 'SYNC_ACTION_INVALID', idempotencyKey: 'UNKNOWN' });
    expect(results[1]).toMatchObject({ status: 'REJECTED', errorCode: 'SYNC_ACTION_INVALID' });
  });

  it('caps the raw body size with 413', async () => {
    const { POST } = await import('@/app/api/v1/sync/batch/route');
    const huge = 'x'.repeat(256 * 1024 + 1);
    const res = await POST(post(JSON.stringify({ actions: [{ ...validSubmitAction, payload: { ...validSubmitAction.payload, sessionId: huge } }] })));
    expect(res.status).toBe(413);
  });

  it('answers malformed JSON with 400 instead of an internal error', async () => {
    const { POST } = await import('@/app/api/v1/sync/batch/route');
    const res = await POST(post('{not json'));
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: string }).code).toBe('SYNC_PAYLOAD_INVALID');
  });

  it('a well-formed action is not blocked by the shape gate', async () => {
    const { POST } = await import('@/app/api/v1/sync/batch/route');
    const res = await POST(post(JSON.stringify({ actions: [validSubmitAction] })));
    const { results } = (await res.json()) as { results: Array<{ status: string; errorCode?: string }> };
    expect(results[0]?.errorCode).toBe('ENCOUNTER_NOT_FOUND');
  });
});
