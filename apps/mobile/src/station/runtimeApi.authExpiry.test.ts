import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// runtimeApi reads __DEV__ at module top level, so it must exist before the imports evaluate.
vi.hoisted(() => {
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
});

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => undefined),
  deleteItemAsync: vi.fn(async () => undefined),
}));
vi.mock('expo-crypto', () => ({ CryptoDigestAlgorithm: {}, digestStringAsync: async () => 'k', randomUUID: () => '00000000-0000-4000-8000-000000000001' }));
vi.mock('../sync/FileSyncQueueStore', () => ({ FileSyncQueueStore: class {} }));
vi.mock('../config/runtime', () => ({ API_BASE_URL: 'http://test.local', isProductionApiSafe: () => true }));

import { getAccessToken, setAccessToken } from '../auth/AuthSession';
import { resetAuthExpiryForTests, subscribeAuthExpired } from '../auth/authExpiry';
import { getSignatureChallengeRun } from './runtimeApi';

const respond = (status: number, body: unknown = {}) => {
  (globalThis as unknown as { fetch: unknown }).fetch = async () => new Response(JSON.stringify(body), { status });
};

describe('runtimeApi request() routes 401 through the central auth-expiry path (wave B2)', () => {
  beforeEach(() => {
    resetAuthExpiryForTests();
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

  it('401 WITH a token: token is cleared, state published, error still surfaced as API_401', async () => {
    await setAccessToken('expiring-token');
    const listener = vi.fn();
    subscribeAuthExpired(listener);
    respond(401);

    await expect(getSignatureChallengeRun('run-1')).rejects.toMatchObject({ status: 401 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
  });

  it('401 WITHOUT a token: nothing is cleared and no re-login state is published', async () => {
    await setAccessToken(null);
    const listener = vi.fn();
    subscribeAuthExpired(listener);
    respond(401);

    await expect(getSignatureChallengeRun('run-1')).rejects.toMatchObject({ message: 'API_401' });
    expect(listener).not.toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
  });

  it('5xx with a token: token stays and the expiry path is not taken', async () => {
    await setAccessToken('valid-token');
    const listener = vi.fn();
    subscribeAuthExpired(listener);
    respond(503);

    await expect(getSignatureChallengeRun('run-1')).rejects.toMatchObject({ status: 503 });
    expect(listener).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe('valid-token');
  });
});
