import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-crypto', () => ({ CryptoDigestAlgorithm: {}, digestStringAsync: async () => 'x' }));
vi.mock('./FileSyncQueueStore', () => ({ FileSyncQueueStore: class {} }));
vi.hoisted(() => {
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
});
vi.mock('../auth/AuthSession', () => ({ getAuthHeaders: () => ({ Authorization: 'Bearer t' }) }));
vi.mock('../auth/authExpiry', () => ({ notifyAuthExpired: async () => undefined }));

import type { OfflineSyncAction, SyncReceipt } from '@math/offline-sync';
import { MobileSyncTransport } from './MobileSyncManager';

function makeAction(i: number): OfflineSyncAction {
  const now = new Date().toISOString();
  return {
    id: `a${i}`,
    clientInstallationId: 'i1',
    learningIdentityId: 'child-1',
    operationType: 'SUBMIT_ATTEMPT',
    idempotencyKey: `k${i}`,
    payload: {},
    status: 'SYNCING',
    attemptCount: 1,
    createdAt: now,
    updatedAt: now,
  };
}

describe('MobileSyncTransport sendBatch (wave C)', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('sends all actions in one request body and returns position-aligned receipts', async () => {
    const bodies: unknown[] = [];
    (globalThis as unknown as { fetch: unknown }).fetch = vi.fn(async (_url: string, init?: { body?: string }) => {
      bodies.push(JSON.parse(init?.body ?? '{}'));
      const actions = (bodies[bodies.length - 1] as { actions: OfflineSyncAction[] }).actions;
      return new Response(JSON.stringify({ results: actions.map((a) => ({ status: 'ACKED', idempotencyKey: a.idempotencyKey })) }), { status: 200 });
    });

    const transport = new MobileSyncTransport('http://x', 'i1', undefined);
    const receipts = await transport.sendBatch([makeAction(0), makeAction(1), makeAction(2)]);

    expect(bodies).toHaveLength(1);
    expect((bodies[0] as { actions: unknown[] }).actions).toHaveLength(3);
    expect(receipts.map((r) => r.status)).toEqual(['ACKED', 'ACKED', 'ACKED']);
    expect(receipts.map((r) => r.idempotencyKey)).toEqual(['k0', 'k1', 'k2']);
  });

  it('maps a batch-level HTTP failure onto every action with the same transient rule', async () => {
    (globalThis as unknown as { fetch: unknown }).fetch = vi.fn(async () => new Response('nope', { status: 503 }));
    const transport = new MobileSyncTransport('http://x', 'i1', undefined);
    const receipts: SyncReceipt[] = await transport.sendBatch([makeAction(0), makeAction(1)]);
    expect(receipts).toHaveLength(2);
    expect(receipts.every((r) => r.status === 'RETRY' && r.errorCode === 'HTTP_503')).toBe(true);
  });

  it('a malformed batch response leaves every action retryable', async () => {
    (globalThis as unknown as { fetch: unknown }).fetch = vi.fn(async () => new Response(JSON.stringify({ unexpected: true }), { status: 200 }));
    const transport = new MobileSyncTransport('http://x', 'i1', undefined);
    const receipts = await transport.sendBatch([makeAction(0)]);
    expect(receipts[0]).toMatchObject({ status: 'RETRY', errorCode: 'SYNC_RESPONSE_INVALID' });
  });
});
