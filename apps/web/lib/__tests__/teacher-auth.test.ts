import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';

// Live view of process.env (the afterEach hook replaces process.env, so never capture the object itself).
const env = new Proxy({} as Record<string, string | undefined>, {
  get: (_t, key: string) => process.env[key],
  set: (_t, key: string, value) => { process.env[key] = value as string; return true; },
  deleteProperty: (_t, key: string) => { delete process.env[key]; return true; },
});

// getTeacherSessionFromRequest/setTeacherSessionCookie read the request cookie store through
// next/headers; tests drive a plain in-memory store through the same seam.
vi.mock('next/headers', () => ({ cookies: vi.fn() }));
import { cookies } from 'next/headers';
const cookieMock = vi.mocked(cookies);

function useCookieStore(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  cookieMock.mockReturnValue({
    get: (name: string) => (store.has(name) ? { name, value: store.get(name)! } : undefined),
    set: (name: string, value: string) => { store.set(name, value); },
  } as unknown as ReturnType<typeof cookies>);
  return store;
}

function signWithSecret(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function cookieValue(payloadObj: Record<string, unknown>, secret: string): string {
  const payload = JSON.stringify(payloadObj);
  return `${Buffer.from(payload).toString('base64url')}.${signWithSecret(payload, secret)}`;
}

const SESSION_COOKIE = 'math_teacher_session';
const TEST_SECRET = 'test-teacher-session-secret-0123456789abcdef';

describe('teacher seed accounts fail closed (wave A1)', () => {
  const original = { ...process.env };
  beforeEach(() => {
    vi.resetModules();
    delete env.ALLOW_DEV_TEACHER_SEEDS;
    delete env.ALLOW_DEV_PRINCIPAL;
    delete env.NEXT_PUBLIC_SUPABASE_URL;
    delete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    env.NODE_ENV = 'test';
    useCookieStore();
  });
  afterEach(() => { process.env = { ...original }; vi.restoreAllMocks(); });

  it('never mints a seed session in production, even with the dev flag set', async () => {
    env.NODE_ENV = 'production';
    env.ALLOW_DEV_TEACHER_SEEDS = '1';
    const { authenticateTeacher } = await import('../teacher-auth');
    await expect(authenticateTeacher('teacher_zahra', 'TeacherPass123!')).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('refuses seed accounts without the explicit ALLOW_DEV_TEACHER_SEEDS=1 flag', async () => {
    const { authenticateTeacher } = await import('../teacher-auth');
    await expect(authenticateTeacher('teacher_zahra', 'TeacherPass123!')).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('compares the seed password for real: a long-enough wrong password is rejected', async () => {
    env.ALLOW_DEV_TEACHER_SEEDS = '1';
    const { authenticateTeacher } = await import('../teacher-auth');
    await expect(authenticateTeacher('teacher_zahra', 'not-the-password-at-all')).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('admits the teacher seed only with flag AND correct password', async () => {
    env.ALLOW_DEV_TEACHER_SEEDS = '1';
    const { authenticateTeacher } = await import('../teacher-auth');
    const session = await authenticateTeacher('teacher_zahra', 'TeacherPass123!');
    expect(session.accountId).toBe('teacher-account-01');
    expect(session.roles).toEqual(['TEACHER']);
    expect(session.isTeacher).toBe(true);
  });

  it('rejects a non-teacher seed account with the role error', async () => {
    env.ALLOW_DEV_TEACHER_SEEDS = '1';
    const { authenticateTeacher } = await import('../teacher-auth');
    await expect(authenticateTeacher('parent_user', 'ParentPass123!')).rejects.toThrow('TEACHER_ROLE_REQUIRED');
  });

  it('rejects an unknown username with the generic credential error', async () => {
    env.ALLOW_DEV_TEACHER_SEEDS = '1';
    const { authenticateTeacher } = await import('../teacher-auth');
    await expect(authenticateTeacher('no-such-teacher', 'TeacherPass123!')).rejects.toThrow('INVALID_CREDENTIALS');
  });
});

describe('teacher dev bearer tokens (wave A2)', () => {
  const original = { ...process.env };
  beforeEach(() => {
    vi.resetModules();
    delete env.ALLOW_DEV_PRINCIPAL;
    env.NODE_ENV = 'test';
    useCookieStore();
  });
  afterEach(() => { process.env = { ...original }; vi.restoreAllMocks(); });

  const bearer = (token: string) => new Request('http://x/api', { headers: { authorization: `Bearer ${token}` } });

  it('ignores dev-token-* without ALLOW_DEV_PRINCIPAL=1', async () => {
    const { getTeacherSessionFromRequest } = await import('../teacher-auth');
    expect(await getTeacherSessionFromRequest(bearer('dev-token-attacker-account'))).toBeNull();
  });

  it('honours dev-token-* only with the flag in non-production', async () => {
    env.ALLOW_DEV_PRINCIPAL = '1';
    const { getTeacherSessionFromRequest } = await import('../teacher-auth');
    const session = await getTeacherSessionFromRequest(bearer('dev-token-teacher-dev-01'));
    expect(session?.accountId).toBe('teacher-dev-01');
    expect(session?.roles).toEqual(['TEACHER']);
  });

  it('never accepts dev-token-* in production even with the flag', async () => {
    env.NODE_ENV = 'production';
    env.ALLOW_DEV_PRINCIPAL = '1';
    const { getTeacherSessionFromRequest } = await import('../teacher-auth');
    expect(await getTeacherSessionFromRequest(bearer('dev-token-attacker-account'))).toBeNull();
  });
});

describe('teacher session cookie verification (wave A2)', () => {
  const original = { ...process.env };
  beforeEach(() => {
    vi.resetModules();
    env.NODE_ENV = 'test';
    env.TEACHER_SESSION_SECRET = TEST_SECRET;
    useCookieStore();
  });
  afterEach(() => { process.env = { ...original }; vi.restoreAllMocks(); });

  async function loginAndCaptureCookie(): Promise<string> {
    env.ALLOW_DEV_TEACHER_SEEDS = '1';
    const store = useCookieStore();
    const mod = await import('../teacher-auth');
    const session = await mod.authenticateTeacher('teacher_zahra', 'TeacherPass123!');
    await mod.setTeacherSessionCookie(session);
    const raw = store.get(SESSION_COOKIE);
    if (!raw) throw new Error('session cookie was not set');
    return raw;
  }

  it('round-trips a legitimately issued session through encode → verify', async () => {
    const raw = await loginAndCaptureCookie();
    const { getTeacherSessionFromRequest } = await import('../teacher-auth');
    const verified = await getTeacherSessionFromRequest(new Request('http://x/api'));
    expect(verified?.accountId).toBe('teacher-account-01');
    expect(raw).toContain('.');
  });

  it('rejects a tampered payload with the original signature', async () => {
    const raw = await loginAndCaptureCookie();
    const [encoded, signature] = raw.split('.');
    const payload = JSON.parse(Buffer.from(encoded!, 'base64url').toString('utf8')) as Record<string, unknown>;
    payload.accountId = 'attacker-account';
    const forged = `${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${signature}`;
    useCookieStore({ [SESSION_COOKIE]: forged });
    const { getTeacherSessionFromRequest } = await import('../teacher-auth');
    expect(await getTeacherSessionFromRequest(new Request('http://x/api'))).toBeNull();
  });

  it('rejects an expired session', async () => {
    useCookieStore({
      [SESSION_COOKIE]: cookieValue({ accountId: 'a-1', roles: ['TEACHER'], exp: Math.floor(Date.now() / 1000) - 10 }, TEST_SECRET),
    });
    const { getTeacherSessionFromRequest } = await import('../teacher-auth');
    expect(await getTeacherSessionFromRequest(new Request('http://x/api'))).toBeNull();
  });

  it('rejects a signed cookie whose roles carry no teacher role', async () => {
    useCookieStore({
      [SESSION_COOKIE]: cookieValue({ accountId: 'a-1', roles: ['PARENT'], exp: Math.floor(Date.now() / 1000) + 3600 }, TEST_SECRET),
    });
    const { getTeacherSessionFromRequest } = await import('../teacher-auth');
    expect(await getTeacherSessionFromRequest(new Request('http://x/api'))).toBeNull();
  });

  it('fails closed in production without TEACHER_SESSION_SECRET: nothing verifies and issuing throws', async () => {
    env.NODE_ENV = 'production';
    delete env.TEACHER_SESSION_SECRET;
    useCookieStore({
      [SESSION_COOKIE]: cookieValue({ accountId: 'a-1', roles: ['TEACHER'], exp: Math.floor(Date.now() / 1000) + 3600 }, TEST_SECRET),
    });
    const mod = await import('../teacher-auth');
    expect(await mod.getTeacherSessionFromRequest(new Request('http://x/api'))).toBeNull();
    await expect(
      mod.setTeacherSessionCookie({
        accountId: 'a-1', username: 'u', displayName: 'd', roles: ['TEACHER'], isTeacher: true,
      }),
    ).rejects.toThrow('TEACHER_SESSION_SECRET_MISSING');
  });
});
