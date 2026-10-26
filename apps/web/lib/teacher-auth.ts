import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getSupabaseAuthUser, supabaseRestSelect } from './supabase-http';
import { devPrincipalAllowed } from './request-principal';

export interface TeacherAuthSession {
  accountId: string;
  username: string;
  displayName: string;
  roles: string[];
  accessToken?: string;
  isTeacher: boolean;
}

const TEACHER_COOKIE_NAME = 'math_teacher_session';
const TEACHER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const MIN_SESSION_SECRET_LENGTH = 32;
/** Non-production convenience only. Never used when NODE_ENV === 'production'. */
const DEV_ONLY_SESSION_SECRET = 'dev-only-teacher-session-secret-do-not-use-in-production';

/**
 * Fail-closed (R-006): production requires an explicit TEACHER_SESSION_SECRET (>= 32 chars).
 * There is no hardcoded production fallback and the Supabase service-role key is never reused as an HMAC key.
 */
function sessionSecret(): string | null {
  const configured = process.env.TEACHER_SESSION_SECRET;
  if (configured && configured.length >= MIN_SESSION_SECRET_LENGTH) return configured;
  if (process.env.NODE_ENV !== 'production') return DEV_ONLY_SESSION_SECRET;
  return null;
}

function signSession(payload: string): string {
  const secret = sessionSecret();
  if (!secret) throw new Error('TEACHER_SESSION_SECRET_MISSING');
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function encodeSession(session: TeacherAuthSession): string {
  const payload = JSON.stringify({
    accountId: session.accountId,
    username: session.username,
    displayName: session.displayName,
    roles: session.roles,
    exp: Math.floor(Date.now() / 1000) + TEACHER_SESSION_TTL_SECONDS,
  });
  return `${Buffer.from(payload).toString('base64url')}.${signSession(payload)}`;
}

// Approved development / seed accounts for robust local & testing execution.
// Never usable in production: see devTeacherSeedsAllowed() below. The password is the
// literal dev credential and is compared for real (no "any password of length >= 4" shortcut).
const DEV_TEACHER_SEEDS: Record<string, { accountId: string; displayName: string; role: string; password: string }> = {
  'teacher_zahra': {
    accountId: 'teacher-account-01',
    displayName: 'مریم کریمی (آموزگار)',
    role: 'TEACHER',
    password: 'TeacherPass123!',
  },
  'teacher-dev-01': {
    accountId: 'teacher-dev-01',
    displayName: 'آموزگار نمونه پایه اول',
    role: 'TEACHER',
    password: 'TeacherPass123!',
  },
  'parent_user': {
    accountId: 'parent-dev-01',
    displayName: 'ولی دانش‌آموز',
    role: 'PARENT', // Non-teacher account to test strict rejection
    password: 'ParentPass123!',
  },
};

/**
 * Fail-closed (R-006 / wave A1): the seed-account path only exists when BOTH hold:
 * NODE_ENV is not "production" AND the operator explicitly set ALLOW_DEV_TEACHER_SEEDS=1.
 * Evaluated per call (never cached at module load).
 */
export function devTeacherSeedsAllowed(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_TEACHER_SEEDS === '1';
}

/**
 * Maps a teacher username to standard auth email
 */
export function usernameToAuthEmail(username: string): string {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return `${clean}@teacher.local`;
}

/**
 * Authenticates teacher credentials against real Auth & database roles
 */
export async function authenticateTeacher(
  usernameInput: string,
  passwordInput: string
): Promise<TeacherAuthSession> {
  const username = usernameInput.trim();
  const password = passwordInput.trim();

  if (!username) {
    throw new Error('USERNAME_REQUIRED: لطفاً نام کاربری را وارد نمایید.');
  }
  if (!password) {
    throw new Error('PASSWORD_REQUIRED: لطفاً رمز عبور را وارد نمایید.');
  }

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 1. Supabase Auth Production Path
  if (isSupabaseConfigured) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '');
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const authEmail = usernameToAuthEmail(username);

    // Call Supabase Auth endpoint
    const tokenRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: authEmail,
        password: password,
      }),
      cache: 'no-store',
    });

    if (!tokenRes.ok) {
      throw new Error('INVALID_CREDENTIALS: نام کاربری یا رمز عبور اشتباه است.');
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token as string;
    const authUser = await getSupabaseAuthUser(accessToken);

    // Read roles strictly from database (account_roles table)
    const dbRoles = await supabaseRestSelect<{ role: string; status: string }>(
      accessToken,
      'account_roles',
      {
        account_id: `eq.${authUser.id}`,
        status: 'eq.ACTIVE',
        select: 'role,status',
      }
    );

    const roles = dbRoles.map((r) => r.role);
    const isTeacher = roles.includes('TEACHER') || roles.includes('ADMIN');

    if (!isTeacher) {
      throw new Error('TEACHER_ROLE_REQUIRED: این حساب کاربری دسترسی معلمان را ندارد.');
    }

    const session: TeacherAuthSession = {
      accountId: authUser.id,
      username,
      displayName: authUser.email?.split('@')[0] || username,
      roles,
      accessToken,
      isTeacher: true,
    };

    return session;
  }

  // 2. Dev / Testing mode authentication (explicitly enabled only; never in production).
  // Fail closed with the same generic credential error so the enabled/disabled state and the
  // existence of seed accounts are not distinguishable from a wrong password.
  if (!devTeacherSeedsAllowed()) {
    throw new Error('INVALID_CREDENTIALS: نام کاربری یا رمز عبور اشتباه است.');
  }

  const devAccount = DEV_TEACHER_SEEDS[username] || DEV_TEACHER_SEEDS[username.toLowerCase()];

  if (!devAccount) {
    throw new Error('INVALID_CREDENTIALS: نام کاربری یا رمز عبور اشتباه است.');
  }

  // Check role: Only accounts with TEACHER role are allowed
  if (devAccount.role !== 'TEACHER') {
    throw new Error('TEACHER_ROLE_REQUIRED: این حساب کاربری دسترسی معلمان را ندارد.');
  }

  // Real credential comparison (constant-time); the placeholder is never accepted as validation.
  const given = Buffer.from(password);
  const expected = Buffer.from(devAccount.password);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    throw new Error('INVALID_CREDENTIALS: نام کاربری یا رمز عبور اشتباه است.');
  }

  return {
    accountId: devAccount.accountId,
    username,
    displayName: devAccount.displayName,
    roles: [devAccount.role],
    isTeacher: true,
  };
}

/**
 * Sets secure HTTP session cookie
 */
export async function setTeacherSessionCookie(session: TeacherAuthSession) {
  const cookieStore = await cookies();

  cookieStore.set(TEACHER_COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TEACHER_SESSION_TTL_SECONDS,
  });
}

/**
 * Clears teacher session cookie
 */
export async function clearTeacherSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(TEACHER_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Reads and verifies teacher session from cookie or Authorization header
 */
export async function getTeacherSessionFromRequest(request?: Request): Promise<TeacherAuthSession | null> {
  // 1. Check Authorization Bearer header if provided
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      // Dev tokens share the dev-principal guard (A5): non-production AND ALLOW_DEV_PRINCIPAL=1.
      // An internet-reachable deployment that only forgot NODE_ENV can no longer mint a teacher.
      if (token.startsWith('dev-token-') && devPrincipalAllowed()) {
        return {
          accountId: token.replace('dev-token-', ''),
          username: 'teacher',
          displayName: 'معلم تایید شده',
          roles: ['TEACHER'],
          accessToken: token,
          isTeacher: true,
        };
      }
    }
  }

  // 2. Check Cookie
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(TEACHER_COOKIE_NAME)?.value;
  if (!rawCookie) {
    return null;
  }

  try {
    const [encodedPayload, signature] = rawCookie.split('.');
    if (!encodedPayload || !signature) return null;
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const expected = signSession(payload);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const decoded = JSON.parse(payload) as { accountId?: string; roles?: string[]; exp?: number; username?: string; displayName?: string };
    if (!decoded.accountId || !Array.isArray(decoded.roles) || !decoded.exp || decoded.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    const isTeacher = decoded.roles.includes('TEACHER') || decoded.roles.includes('ADMIN');
    if (!isTeacher) {
      return null;
    }

    return {
      accountId: decoded.accountId,
      username: decoded.username || 'teacher',
      displayName: decoded.displayName || 'معلم',
      roles: decoded.roles,
      isTeacher: true,
    };
  } catch {
    return null;
  }
}
