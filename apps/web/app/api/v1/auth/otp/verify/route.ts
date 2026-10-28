import { NextResponse } from 'next/server';
import { callOtpProvider, otpRateLimitResponse } from '@/lib/otp-proxy';
import { DEV_MOCK_ACCESS_TOKEN, DEV_OTP_CODE, devOtpMockAllowed } from '@/lib/dev-otp-mock';

/** Provider seam: verification must be server-authoritative; never accept arbitrary local OTPs —
 *  except the explicitly flagged dev mock's fixed code (dev-otp-mock.ts), never in production. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { phoneNumber?: string; otpCode?: string };
  const phoneNumber = String(body.phoneNumber ?? '').trim();
  const otpCode = String(body.otpCode ?? '').trim();
  if (!phoneNumber || !/^\d{6}$/.test(otpCode)) {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'شماره و کد شش‌رقمی لازم است.' }, { status: 400 });
  }

  if (devOtpMockAllowed()) {
    const limited = otpRateLimitResponse(request, 'verify', phoneNumber);
    if (limited) return limited;
    if (otpCode !== DEV_OTP_CODE) {
      return NextResponse.json({ code: 'OTP_VERIFY_FAILED', message: 'کد ورود درست نیست.' }, { status: 401 });
    }
    return NextResponse.json({ code: 'OK', accessToken: DEV_MOCK_ACCESS_TOKEN }, { status: 200 });
  }

  const provider = process.env.AUTH_OTP_PROVIDER_URL?.trim();
  if (!provider) {
    return NextResponse.json(
      { code: 'AUTH_PROVIDER_NOT_CONFIGURED', message: 'تأیید کد ورود هنوز به سرویس احراز هویت متصل نشده است.' },
      { status: 503 },
    );
  }

  const limited = otpRateLimitResponse(request, 'verify', phoneNumber);
  if (limited) return limited;
  return callOtpProvider(provider, '/otp/verify', { phoneNumber, otpCode }, { code: 'OTP_VERIFY_FAILED', message: 'تأیید کد ورود ناموفق بود.' });
}
