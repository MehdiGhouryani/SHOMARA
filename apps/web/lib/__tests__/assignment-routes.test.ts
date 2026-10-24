import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Live view of process.env (the afterEach hook replaces process.env, so never capture the object itself).
const env = new Proxy({} as Record<string, string | undefined>, {
  get: (_t, key: string) => process.env[key],
  set: (_t, key: string, value) => { process.env[key] = value as string; return true; },
  deleteProperty: (_t, key: string) => { delete process.env[key]; return true; },
});
const post = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`http://x${url}`, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });

describe('assignment and sync routes', () => {
  const original = { ...process.env };
  beforeEach(() => { env.NODE_ENV = 'test'; env.ALLOW_DEV_PRINCIPAL = '1'; });
  afterEach(() => { process.env = { ...original }; });

  it('retires the child-facing outcome endpoint (410)', async () => {
    const { POST } = await import('@/app/api/v1/assignment-instances/[instanceId]/outcome/route');
    const res = await POST();
    expect(res.status).toBe(410);
    expect(((await res.json()) as { code: string }).code).toBe('ASSIGNMENT_OUTCOME_ENDPOINT_RETIRED');
  });

  it('sync/batch never acknowledges unimplemented operations', async () => {
    const { POST } = await import('@/app/api/v1/sync/batch/route');
    const mk = (operationType: string, key: string) => ({ id: key, clientInstallationId: 'i1', learningIdentityId: 'child-dev-01', operationType, idempotencyKey: key, payload: {}, status: 'PENDING', attemptCount: 0, createdAt: '', updatedAt: '' });
    const res = await POST(post('/b', { actions: [mk('EVENT_INGEST', 'e1'), mk('SESSION_RESUME', 's1')] }, { 'x-client-installation-id': 'i1' }));
    const { results } = (await res.json()) as { results: Array<{ status: string; errorCode?: string }> };
    expect(results.map((r) => r.status)).toEqual(['REJECTED', 'REJECTED']);
    expect(results[0]?.errorCode).toBe('SYNC_OPERATION_NOT_IMPLEMENTED');
  });

  it('maps AssignmentRuntimeError codes to proper HTTP statuses', async () => {
    const { apiErrorStatus } = await import('@/lib/api-errors');
    const { AssignmentRuntimeError } = await import('@math/assignment-runtime');
    expect(apiErrorStatus(new AssignmentRuntimeError('INSTANCE_NOT_FOUND', 'x'))).toBe(404);
    expect(apiErrorStatus(new AssignmentRuntimeError('INVALID_INSTANCE_STATUS', 'x'))).toBe(409);
    expect(apiErrorStatus(new Error('FORBIDDEN'))).toBe(403);
  });
});
