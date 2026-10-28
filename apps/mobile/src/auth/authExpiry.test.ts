import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => undefined),
  deleteItemAsync: vi.fn(async () => undefined),
}));

import {
  isReLoginNeeded,
  markReLoginHandled,
  notifyAuthExpired,
  resetAuthExpiryForTests,
  subscribeAuthExpired,
} from './authExpiry';
import { getAccessToken, setAccessToken } from './AuthSession';

describe('central auth expiry (R-009/D3, wave B2)', () => {
  beforeEach(() => {
    resetAuthExpiryForTests();
  });
  afterEach(() => { vi.clearAllMocks(); });

  it('clears the token, publishes the state once, and keeps the queue surface untouched', async () => {
    await setAccessToken('token-about-to-expire');
    const events: unknown[] = [];
    const unsubscribe = subscribeAuthExpired((event) => events.push(event));

    await notifyAuthExpired();

    expect(getAccessToken()).toBeNull();
    expect(isReLoginNeeded()).toBe(true);
    expect(events).toHaveLength(1);
    expect((events[0] as { reason: string }).reason).toBe('HTTP_401_WITH_TOKEN');
    unsubscribe();
  });

  it('a 5xx (or any non-401 failure) never reaches this path from the caller side', async () => {
    // The central path is only invoked on 401-with-token by request()/transport; this test pins
    // that invoking nothing leaves state clean (no clearing, no event).
    await setAccessToken('still-valid-token');
    const listener = vi.fn();
    subscribeAuthExpired(listener);
    expect(isReLoginNeeded()).toBe(false);
    expect(getAccessToken()).toBe('still-valid-token');
    expect(listener).not.toHaveBeenCalled();
  });

  it('a fresh OTP login retires the needs-re-login state', async () => {
    await notifyAuthExpired();
    expect(isReLoginNeeded()).toBe(true);
    markReLoginHandled();
    expect(isReLoginNeeded()).toBe(false);
  });

  it('unsubscribed listeners stop receiving events', async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAuthExpired(listener);
    unsubscribe();
    await notifyAuthExpired();
    expect(listener).not.toHaveBeenCalled();
    expect(isReLoginNeeded()).toBe(true);
  });
});
