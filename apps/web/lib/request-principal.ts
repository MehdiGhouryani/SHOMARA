import { getSupabaseAuthUser, supabaseRestSelect } from './supabase-http';

export type PrincipalMode = 'DEV_ONLY' | 'SUPABASE_AUTH';

export interface RequestPrincipal {
  mode: PrincipalMode;
  accountId: string;
  learningIdentityId: string;
  accessToken?: string;
  authUserId: string;
}

export interface AccountPrincipal {
  mode: PrincipalMode;
  accountId: string;
  authUserId: string;
  accessToken?: string;
  roles: string[];
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

/**
 * Dev headers (x-dev-*) are honoured only when BOTH hold: NODE_ENV is not "production" AND the
 * operator explicitly set ALLOW_DEV_PRINCIPAL=1. A request that carries a Bearer token never uses
 * dev headers. Evaluated per call (never cached at module load).
 */
export function devPrincipalAllowed(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_PRINCIPAL === '1';
}

const DEV_ALLOWED_ROLES = new Set(['PARENT', 'TEACHER']);

function devLearningIdentity(request: Request): RequestPrincipal {
  const learningIdentityId =
    request.headers.get('x-dev-learning-identity-id')?.trim() || 'child-dev-01';
  const accountId =
    request.headers.get('x-dev-account-id')?.trim() || 'child-account-dev-01';
  return { mode: 'DEV_ONLY', accountId, learningIdentityId, authUserId: accountId };
}

function devAccount(request: Request, defaultRole = 'PARENT'): AccountPrincipal {
  const accountId =
    request.headers.get('x-dev-account-id')?.trim() ||
    (defaultRole === 'TEACHER' ? 'teacher-dev-01' : 'parent-dev-01');
  const customRoles = request.headers.get('x-dev-roles');
  const requested = customRoles
    ? customRoles.split(',').map((x) => x.trim().toUpperCase()).filter((role) => DEV_ALLOWED_ROLES.has(role))
    : [defaultRole];
  // Dev headers can never mint elevated roles (ADMIN is ignored); fall back to the default role.
  const roles = requested.length > 0 ? requested : [defaultRole];
  return { mode: 'DEV_ONLY', accountId, authUserId: accountId, roles };
}

async function authAccount(request: Request): Promise<AccountPrincipal> {
  const token = bearerToken(request);
  if (!token) {
    if (devPrincipalAllowed()) return devAccount(request);
    throw new Error('AUTH_BEARER_REQUIRED');
  }
  const user = await getSupabaseAuthUser(token);
  const roles = await supabaseRestSelect<{ role: string }>(token, 'account_roles', {
    account_id: `eq.${user.id}`,
    status: 'eq.ACTIVE',
    select: 'role',
  });
  return {
    mode: 'SUPABASE_AUTH',
    accountId: user.id,
    authUserId: user.id,
    accessToken: token,
    roles: roles.map((x) => x.role),
  };
}

async function authLearning(request: Request): Promise<RequestPrincipal> {
  if (!bearerToken(request) && devPrincipalAllowed()) {
    return devLearningIdentity(request);
  }
  const account = await authAccount(request);
  if (!account.accessToken) throw new Error('AUTH_BEARER_REQUIRED');
  const identities = await supabaseRestSelect<{ id: string }>(account.accessToken, 'learning_identities', {
    account_id: `eq.${account.accountId}`,
    status: 'eq.ACTIVE',
    select: 'id',
    limit: '2',
  });
  if (identities.length !== 1) throw new Error(identities.length === 0 ? 'LEARNING_IDENTITY_NOT_FOUND' : 'LEARNING_IDENTITY_NOT_UNIQUE');
  const learningIdentityId = identities[0]?.id;
  if (!learningIdentityId) throw new Error('LEARNING_IDENTITY_NOT_FOUND');
  return {
    mode: account.mode,
    accountId: account.accountId,
    authUserId: account.authUserId,
    accessToken: account.accessToken,
    learningIdentityId,
  };
}

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function requireRequestPrincipal(request: Request): Promise<RequestPrincipal> {
  if (!bearerToken(request)) {
    if (devPrincipalAllowed()) return devLearningIdentity(request);
    throw new Error('AUTH_BEARER_REQUIRED');
  }
  if (!isSupabaseConfigured()) throw new Error('SUPABASE_CONFIG_MISSING');
  return authLearning(request);
}

export async function requireRequestAccountPrincipal(request: Request, requiredRole?: string): Promise<AccountPrincipal> {
  if ((bearerToken(request) || process.env.NODE_ENV === 'production') && !isSupabaseConfigured()) {
    throw new Error('SUPABASE_CONFIG_MISSING');
  }
  const principal = await authAccount(request);
  if (requiredRole && !principal.roles.includes(requiredRole) && !principal.roles.includes('ADMIN')) {
    throw new Error('ROLE_REQUIRED');
  }
  return principal;
}

export function assertBodyIdentityMatches(principal: RequestPrincipal, bodyLearningIdentityId?: string): string {
  if (bodyLearningIdentityId && bodyLearningIdentityId !== principal.learningIdentityId) throw new Error('IDENTITY_CONTEXT_MISMATCH');
  return principal.learningIdentityId;
}

export function assertPathAccountMatches(principal: AccountPrincipal, accountId: string): void {
  if (accountId !== principal.accountId && !principal.roles.includes('ADMIN')) {
    throw new Error('ACCOUNT_CONTEXT_MISMATCH');
  }
}
