import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-crypto', () => ({ CryptoDigestAlgorithm: {}, digestStringAsync: async () => 'x' }));
vi.mock('./FileSyncQueueStore', () => ({ FileSyncQueueStore: class {} }));
vi.hoisted(() => {
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
});
const notifyMock = vi.fn(async () => undefined);
vi.mock('../auth/authExpiry', () => ({ notifyAuthExpired: (...args: unknown[]) => notifyMock(...(args as [])) }));
vi.mock('../auth/AuthSession', () => ({
  getAuthHeaders: vi.fn(() => (authHeader.value ? { Authorization: authHeader.value } : {})),
}));
const authHeader: { value: string | null } = { value: 'Bearer expired' };

import { OfflineSyncManager, InMemorySyncQueueStore } from '@math/offline-sync';
import { MobileSyncTransport } from './MobileSyncManager';

const action = { id: 'a1', clientInstallationId: 'i', learningIdentityId: 'c', operationType: 'SUBMIT_ATTEMPT' as const, idempotencyKey: 'k1', payload: {} };
const respond = (status: number, body: unknown = {}) => { (globalThis as unknown as { fetch: unknown }).fetch = async () => new Response(JSON.stringify(body), { status }); };

describe('MobileSyncTransport central auth expiry (wave B2)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    notifyMock.mockClear();
    authHeader.value = 'Bearer expired';
  });

  it('a 401 while holding a token publishes needs-re-login and still keeps the attempt (RETRY)', async () => {
    respond(401);
    const store = new InMemorySyncQueueStore();
    const manager = new OfflineSyncManager(store, new MobileSyncTransport('http://x', 'i', undefined));
    await manager.enqueue(action);
    await manager.flush();
    expect((await store.snapshot())[0]?.status).toBe('RETRY');
    expect(notifyMock).toHaveBeenCalledTimes(1);
  });

  it('a 401 without a token never triggers the expiry path', async () => {
    authHeader.value = null;
    respond(401);
    const store = new InMemorySyncQueueStore();
    const manager = new OfflineSyncManager(store, new MobileSyncTransport('http://x', 'i', undefined));
    await manager.enqueue(action);
    await manager.flush();
    expect(notifyMock).not.toHaveBeenCalled();
  });

  it('a 5xx never triggers the expiry path', async () => {
    respond(503);
    const store = new InMemorySyncQueueStore();
    const manager = new OfflineSyncManager(store, new MobileSyncTransport('http://x', 'i', undefined));
    await manager.enqueue(action);
    await manager.flush();
    expect(notifyMock).not.toHaveBeenCalled();
  });
});
