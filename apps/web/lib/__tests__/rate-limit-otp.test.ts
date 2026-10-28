import { beforeEach, describe, expect, it } from 'vitest';
import { checkRateLimit, resetRateLimitForTests } from '../rate-limit';
import { sanitizeProviderPayload, otpRateLimitResponse } from '../otp-proxy';

beforeEach(() => resetRateLimitForTests());

describe('rate limiter', () => {
  it('blocks after max hits and stays locked until the lock expires', () => {
    const rule = { max: 3, windowMs: 1000, lockMs: 5000 };
    expect(checkRateLimit('k', rule, 0).allowed).toBe(true);
    expect(checkRateLimit('k', rule, 1).allowed).toBe(true);
    expect(checkRateLimit('k', rule, 2).allowed).toBe(true);
    const blocked = checkRateLimit('k', rule, 3);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(checkRateLimit('k', rule, 2000).allowed).toBe(false);
    expect(checkRateLimit('k', rule, 6000).allowed).toBe(true);
  });
});

describe('OTP proxy', () => {
  it('forwards only the whitelisted provider fields', () => {
    const out = sanitizeProviderPayload({ accessToken: 't', message: 'ok', internalDebug: { secret: 1 }, stack: 'x', user: { phone: '09' } });
    expect(out).toEqual({ accessToken: 't', message: 'ok' });
  });

  it('rate limits OTP start per phone with Persian-digit normalisation', async () => {
    const request = new Request('http://x', { headers: { 'x-forwarded-for': '1.2.3.4' } });
    let last: Response | null = null;
    for (let i = 0; i < 6; i += 1) last = otpRateLimitResponse(request, 'start', i % 2 ? '۰۹۱۲۳۴۵۶۷۸۹' : '09123456789');
    expect(last?.status).toBe(429);
    expect(last?.headers.get('Retry-After')).toBeTruthy();
  });
});
