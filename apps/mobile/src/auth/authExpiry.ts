import { clearAccessToken } from './AuthSession';

/**
 * Central auth-expiry path (R-009 / START_HERE D3, wave B2).
 *
 * A 401 received WHILE holding an access token means the session is no longer valid. Exactly one
 * central path handles it: the token is cleared (memory + SecureStore), a "needs re-login" state is
 * published to subscribers once per expiry, and the offline sync queue plus local progress stay
 * untouched. Call sites must only invoke this when an Authorization header was actually attached —
 * a 401 without a token (or a 5xx) never reaches this path and clears nothing. Re-login itself is
 * OTP and only ever happens in the parent path / next start; nothing in the child lesson flow is
 * interrupted.
 */
export type AuthExpiredReason = 'HTTP_401_WITH_TOKEN';

export interface AuthExpiredEvent {
  reason: AuthExpiredReason;
  at: string;
}

type AuthExpiredListener = (event: AuthExpiredEvent) => void;

let needsReLogin = false;
const listeners = new Set<AuthExpiredListener>();

export async function notifyAuthExpired(reason: AuthExpiredReason = 'HTTP_401_WITH_TOKEN'): Promise<void> {
  needsReLogin = true;
  const event: AuthExpiredEvent = { reason, at: new Date().toISOString() };
  await clearAccessToken();
  for (const listener of listeners) listener(event);
}

export function subscribeAuthExpired(listener: AuthExpiredListener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function isReLoginNeeded(): boolean {
  return needsReLogin;
}

/** Called after a fresh token is stored (OTP login) so the "needs re-login" note retires. */
export function markReLoginHandled(): void {
  needsReLogin = false;
}

/** Test-only reset. */
export function resetAuthExpiryForTests(): void {
  needsReLogin = false;
  listeners.clear();
}
