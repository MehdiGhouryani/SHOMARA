import { NextResponse } from 'next/server';
import { callOtpProvider, otpRateLimitResponse } from '@/lib/otp-proxy';

/** Provider seam: verification must be server-authoritative; never accept arbitrary local OTPs. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { phoneNumber?: string; otpCode?: string };
  const phoneNumber = String(body.phoneNumber ?? '').trim();
  const otpCode = String(body.otpCode ?? '').trim();
  if (!phoneNumber || !/^\d{6}$/.test(otpCode)) {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'شماره و کد شش‌رقمی لازم است.' }, { status: 400 });
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
