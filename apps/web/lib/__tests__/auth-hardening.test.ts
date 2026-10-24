import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Live view of process.env (the afterEach hook replaces process.env, so never capture the object itself).
const env = new Proxy({} as Record<string, string | undefined>, {
  get: (_t, key: string) => process.env[key],
  set: (_t, key: string, value) => { process.env[key] = value as string; return true; },
  deleteProperty: (_t, key: string) => { delete process.env[key]; return true; },
});
function req(headers: Record<string, string> = {}) { return new Request('http://x/api', { headers }); }

describe('dev principal hardening (A5)', () => {
  const original = { ...process.env };
  beforeEach(() => { vi.resetModules(); delete env.ALLOW_DEV_PRINCIPAL; env.NODE_ENV = 'test'; });
  afterEach(() => { process.env = { ...original }; });

  it('refuses dev headers unless ALLOW_DEV_PRINCIPAL=1 is set explicitly', async () => {
    const { requireRequestPrincipal, requireRequestAccountPrincipal } = await import('../request-principal');
    await expect(requireRequestPrincipal(req({ 'x-dev-learning-identity-id': 'victim' }))).rejects.toThrow('AUTH_BEARER_REQUIRED');
    await expect(requireRequestAccountPrincipal(req({ 'x-dev-roles': 'TEACHER' }), 'TEACHER')).rejects.toThrow('AUTH_BEARER_REQUIRED');
  });

  it('honours dev headers only with the flag, and never mints ADMIN', async () => {
    env.ALLOW_DEV_PRINCIPAL = '1';
    const { requireRequestPrincipal, requireRequestAccountPrincipal } = await import('../request-principal');
    expect((await requireRequestPrincipal(req({ 'x-dev-learning-identity-id': 'child-9' }))).learningIdentityId).toBe('child-9');
    await expect(requireRequestAccountPrincipal(req({ 'x-dev-roles': 'ADMIN' }), 'TEACHER')).rejects.toThrow('ROLE_REQUIRED');
    const teacher = await requireRequestAccountPrincipal(req({ 'x-dev-roles': 'ADMIN,TEACHER' }), 'TEACHER');
    expect(teacher.roles).toEqual(['TEACHER']);
  });

  it('never trusts dev headers when a Bearer token is present', async () => {
    env.ALLOW_DEV_PRINCIPAL = '1';
    env.NEXT_PUBLIC_SUPABASE_URL = '';
    const { requireRequestPrincipal } = await import('../request-principal');
    await expect(requireRequestPrincipal(req({ authorization: 'Bearer garbage', 'x-dev-learning-identity-id': 'victim' }))).rejects.toThrow('SUPABASE_CONFIG_MISSING');
  });

  it('never allows dev principal in production even with the flag', async () => {
    env.NODE_ENV = 'production';
    env.ALLOW_DEV_PRINCIPAL = '1';
    const { devPrincipalAllowed } = await import('../request-principal');
    expect(devPrincipalAllowed()).toBe(false);
  });
});

describe('persistence gates fail closed', () => {
  const original = { ...process.env };
  beforeEach(() => { vi.resetModules(); });
  afterEach(() => { process.env = { ...original }; });

  it('production refuses in-memory adult/assignment stores even when env flags look right', async () => {
    env.NODE_ENV = 'production';
    env.MATH_ASSIGNMENT_BACKEND = 'postgres'; env.MATH_ASSIGNMENT_REPO = 'supabase-rest-v1';
    env.MATH_ADULT_BACKEND = 'postgres'; env.MATH_ADULT_PROJECTION_REPO = 'supabase-rest-v1';
    delete env.ALLOW_EPHEMERAL_ADULT_STORE;
    const gates = await import('../runtime-gates');
    expect(() => gates.assertAssignmentBackendReady()).toThrow('ASSIGNMENT_BACKEND_NOT_CONFIGURED');
    expect(() => gates.assertAdultProjectionBackendReady()).toThrow('ADULT_BACKEND_NOT_CONFIGURED');
  });

  it('explicit staging override still needs the backend flags', async () => {
    env.NODE_ENV = 'production';
    env.ALLOW_EPHEMERAL_ADULT_STORE = '1';
    delete env.MATH_ASSIGNMENT_BACKEND;
    const gates = await import('../runtime-gates');
    expect(() => gates.assertAssignmentBackendReady()).toThrow('ASSIGNMENT_BACKEND_NOT_CONFIGURED');
    env.MATH_ASSIGNMENT_BACKEND = 'postgres'; env.MATH_ASSIGNMENT_REPO = 'supabase-rest-v1';
    expect(() => gates.assertAssignmentBackendReady()).not.toThrow();
  });
});
