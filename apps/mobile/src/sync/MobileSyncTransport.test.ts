import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('expo-crypto', () => ({ CryptoDigestAlgorithm: {}, digestStringAsync: async () => 'x' }));
vi.mock('./FileSyncQueueStore', () => ({ FileSyncQueueStore: class {} }));
vi.mock('../auth/AuthSession', () => ({ getAuthHeaders: () => ({ Authorization: 'Bearer expired' }) }));

import { OfflineSyncManager, InMemorySyncQueueStore } from '@math/offline-sync';
import { MobileSyncTransport } from './MobileSyncManager';

const action = { id: 'a1', clientInstallationId: 'i', learningIdentityId: 'c', operationType: 'SUBMIT_ATTEMPT' as const, idempotencyKey: 'k1', payload: {} };
const respond = (status: number, body: unknown = {}) => { (globalThis as unknown as { fetch: unknown }).fetch = async () => new Response(JSON.stringify(body), { status }); };

describe('MobileSyncTransport keeps learner attempts', () => {
  // React Native defines __DEV__; without it the transport would throw ReferenceError and every case would trivially look like RETRY.
  beforeAll(() => { (globalThis as unknown as { __DEV__: boolean }).__DEV__ = false; });
  afterEach(() => { vi.unstubAllGlobals(); });

  for (const status of [401, 403, 408, 429, 500, 503]) {
    it(`HTTP ${status} is retried, never permanently rejected`, async () => {
      respond(status);
      const store = new InMemorySyncQueueStore();
      const manager = new OfflineSyncManager(store, new MobileSyncTransport('http://x', 'i', undefined));
      await manager.enqueue(action);
      await manager.flush();
      expect((await store.snapshot())[0]?.status).toBe('RETRY');
    });
  }

  it('delivers the queued attempt after the session is restored', async () => {
    respond(401);
    const store = new InMemorySyncQueueStore();
    const manager = new OfflineSyncManager(store, new MobileSyncTransport('http://x', 'i', undefined));
    await manager.enqueue(action);
    await manager.flush();
    const [item] = await store.snapshot();
    await store.update({ ...item!, nextRetryAt: new Date(0).toISOString() });
    respond(200, { results: [{ status: 'ACKED', idempotencyKey: 'k1' }] });
    expect((await manager.flush()).acked).toBe(1);
  });

  it('a malformed request (HTTP 400) is the only permanent rejection', async () => {
    respond(400);
    const store = new InMemorySyncQueueStore();
    const manager = new OfflineSyncManager(store, new MobileSyncTransport('http://x', 'i', undefined));
    await manager.enqueue(action);
    await manager.flush();
    expect((await store.snapshot())[0]?.status).toBe('REJECTED');
  });
});
