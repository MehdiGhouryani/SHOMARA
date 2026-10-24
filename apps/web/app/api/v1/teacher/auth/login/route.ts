import { NextResponse } from 'next/server';
import {
  authenticateTeacher,
  setTeacherSessionCookie,
} from '@/lib/teacher-auth';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { code: 'INVALID_PAYLOAD', message: 'اطلاعات ارسالی نامعتبر است.' },
        { status: 400 }
      );
    }

    const { username, password } = body as { username?: string; password?: string };

    if (!username || !password) {
      return NextResponse.json(
        { code: 'CREDENTIALS_REQUIRED', message: 'لطفاً نام کاربری و رمز عبور را وارد کنید.' },
        { status: 400 }
      );
    }

    const normalizedUser = String(username).trim().toLowerCase();
    const byUser = checkRateLimit(`teacher-login:user:${normalizedUser}`, { max: 5, windowMs: 15 * 60_000, lockMs: 15 * 60_000 });
    const byIp = checkRateLimit(`teacher-login:ip:${clientIp(request)}`, { max: 30, windowMs: 15 * 60_000, lockMs: 15 * 60_000 });
    if (!byUser.allowed || !byIp.allowed) {
      const retryAfter = Math.max(byUser.retryAfterSeconds, byIp.retryAfterSeconds);
      return NextResponse.json(
        { code: 'RATE_LIMITED', message: 'تعداد تلاش‌های ورود زیاد بود. کمی بعد دوباره تلاش کنید.', retryAfterSeconds: retryAfter },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const session = await authenticateTeacher(username, password);

    // Set secure HTTP session cookie
    await setTeacherSessionCookie(session);

    return NextResponse.json({
      success: true,
      message: 'ورود با موفقیت انجام شد.',
      session: {
        accountId: session.accountId,
        username: session.username,
        displayName: session.displayName,
        roles: session.roles,
        isTeacher: true,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'خطای سرور در احراز هویت';
    if (msg.includes('TEACHER_SESSION_SECRET_MISSING')) {
      // Server misconfiguration: never expose details, never issue an unsigned/weakly signed session.
      return NextResponse.json(
        { code: 'AUTH_NOT_CONFIGURED', message: 'ورود معلم فعلاً در دسترس نیست.' },
        { status: 503 }
      );
    }
    // Credential failure and missing teacher role are deliberately indistinguishable (no account enumeration).
    const isDenied = msg.includes('TEACHER_ROLE_REQUIRED') || msg.includes('INVALID_CREDENTIALS');
    if (isDenied) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'نام کاربری یا رمز عبور درست نیست.' },
        { status: 401 }
      );
    }
    // Unknown failures: never return the raw error text; log it server-side only.
    console.error('TEACHER_LOGIN_FAILED', msg);
    return NextResponse.json(
      { code: 'AUTH_ERROR', message: 'ورود در حال حاضر ممکن نیست. دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}
