import { NextResponse } from 'next/server';
import { callOtpProvider, otpRateLimitResponse } from '@/lib/otp-proxy';

/** Provider seam: production wiring lives behind AUTH_OTP_PROVIDER_URL. Never fake a successful OTP send. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { phoneNumber?: string };
  const phoneNumber = String(body.phoneNumber ?? '').trim();
  if (!phoneNumber) return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'شماره همراه الزامی است.' }, { status: 400 });

  const provider = process.env.AUTH_OTP_PROVIDER_URL?.trim();
  if (!provider) {
    return NextResponse.json(
      { code: 'AUTH_PROVIDER_NOT_CONFIGURED', message: 'ارسال کد ورود هنوز به سرویس احراز هویت متصل نشده است.' },
      { status: 503 },
    );
  }

  const limited = otpRateLimitResponse(request, 'start', phoneNumber);
  if (limited) return limited;
  return callOtpProvider(provider, '/otp/start', { phoneNumber }, { code: 'OTP_SEND_FAILED', message: 'ارسال کد ورود ناموفق بود.' });
}
