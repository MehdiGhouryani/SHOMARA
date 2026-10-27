import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Live view of process.env (the afterEach hook replaces process.env, so never capture the object itself).
const env = new Proxy({} as Record<string, string | undefined>, {
  get: (_t, key: string) => process.env[key],
  set: (_t, key: string, value) => { process.env[key] = value as string; return true; },
  deleteProperty: (_t, key: string) => { delete process.env[key]; return true; },
});
const post = (url: string, body: unknown) =>
  new Request(`http://x${url}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

describe('dev OTP mock (owner-requested local onboarding mock)', () => {
  const original = { ...process.env };
  beforeEach(() => {
    env.NODE_ENV = 'test';
    env.ALLOW_DEV_OTP_MOCK = '1';
    delete env.AUTH_OTP_PROVIDER_URL;
  });
  afterEach(() => { process.env = { ...original }; });

  it('start answers with the fixed dev code message when the flag is set', async () => {
    const { POST } = await import('@/app/api/v1/auth/otp/start/route');
    const res = await POST(post('/start', { phoneNumber: '09302144747' }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { code: string; message: string };
    expect(body.code).toBe('DEV_MOCK_OTP');
    expect(body.message).toContain('۱۲۳۴۵۶');
  });

  it('verify accepts the fixed dev code and returns an access token', async () => {
    const { POST } = await import('@/app/api/v1/auth/otp/verify/route');
    const res = await POST(post('/verify', { phoneNumber: '09302144747', otpCode: '123456' }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { code: string; accessToken?: string };
    expect(body.code).toBe('OK');
    expect(body.accessToken).toBe('dev-mock-access-token');
  });

  it('verify rejects a wrong code with the generic failure shape', async () => {
    const { POST } = await import('@/app/api/v1/auth/otp/verify/route');
    const res = await POST(post('/verify', { phoneNumber: '09302144747', otpCode: '999999' }));
    expect(res.status).toBe(401);
    expect(((await res.json()) as { code: string }).code).toBe('OTP_VERIFY_FAILED');
  });

  it('fails closed without the explicit flag (same as today)', async () => {
    delete env.ALLOW_DEV_OTP_MOCK;
    const start = await import('@/app/api/v1/auth/otp/start/route');
    const res = await start.POST(post('/start', { phoneNumber: '09302144747' }));
    expect(res.status).toBe(503);
    expect(((await res.json()) as { code: string }).code).toBe('AUTH_PROVIDER_NOT_CONFIGURED');
  });

  it('never activates in production even with the flag', async () => {
    env.NODE_ENV = 'production';
    const start = await import('@/app/api/v1/auth/otp/start/route');
    const res = await start.POST(post('/start', { phoneNumber: '09302144747' }));
    expect(res.status).toBe(503);
  });

  it('steps aside when a real provider is configured', async () => {
    env.AUTH_OTP_PROVIDER_URL = 'https://provider.example';
    const start = await import('@/app/api/v1/auth/otp/start/route');
    const res = await start.POST(post('/start', { phoneNumber: '09302144747' }));
    // With a provider configured the route proxies (this env has no live provider -> 502 failure branch).
    expect([502, 200]).toContain(res.status);
    expect(((await res.json()) as { code: string }).code).not.toBe('DEV_MOCK_OTP');
  });
});
