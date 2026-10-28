import { describe, expect, it } from 'vitest';
import { apiErrorStatus, publicErrorMessage } from '../api-errors';

/** Route contract (wave A5/A6): known machine codes stay actionable, unknown internals never leak. */
describe('central API error mapping', () => {
  it('keeps known machine codes and their HTTP status', () => {
    expect(apiErrorStatus(new Error('AUTH_BEARER_REQUIRED'))).toBe(401);
    expect(apiErrorStatus(new Error('ROLE_REQUIRED'))).toBe(403);
    expect(apiErrorStatus(new Error('SESSION_NOT_FOUND'))).toBe(404);
    // NOTE: endsWith('CONTEXT_MISMATCH') (403) matches before the 409 list, so this code maps to
    // 403 today; downstream retry logic treats both as non-retryable. Recorded as a note in the
    // wave A report — not changed in this wave (behavior-preserving hardening only).
    expect(apiErrorStatus(new Error('IDEMPOTENCY_CONTEXT_MISMATCH'))).toBe(403);
    expect(apiErrorStatus(new Error('SUPABASE_RPC_503'))).toBe(503);
    expect(apiErrorStatus(new Error('SUPABASE_REST_500'))).toBe(503);
    expect(apiErrorStatus(new Error('totally unexpected'))).toBe(400);
  });

  it('returns machine codes unchanged so offline-sync retry classification keeps working', () => {
    expect(publicErrorMessage(new Error('SUPABASE_RPC_503'))).toBe('SUPABASE_RPC_503');
    expect(publicErrorMessage(new Error('NETWORK_UNREACHABLE'))).toBe('NETWORK_UNREACHABLE');
    expect(publicErrorMessage(new Error('HTTP_429'))).toBe('HTTP_429');
  });

  it('replaces unknown internal messages with a generic code (never leaks internals)', () => {
    expect(publicErrorMessage(new Error('getaddrinfo ENOTFOUND db.xxx.supabase.co'))).toBe('REQUEST_FAILED');
    expect(publicErrorMessage(new Error('INVALID_CREDENTIALS: پیام فارسی داخلی'))).toBe('REQUEST_FAILED');
    expect(publicErrorMessage('not-an-error')).toBe('REQUEST_FAILED');
  });

  it('prefers a typed error code property when present', () => {
    const typed = Object.assign(new Error('whatever internals'), { code: 'SESSION_NOT_ACTIVE' });
    expect(publicErrorMessage(typed)).toBe('SESSION_NOT_ACTIVE');
    expect(apiErrorStatus(typed)).toBe(409);
  });
});
