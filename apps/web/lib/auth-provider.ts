export type OtpResult =
  | { ok: true }
  | { ok: false; code: 'AUTH_PROVIDER_NOT_CONFIGURED' | 'OTP_SEND_FAILED' | 'OTP_VERIFY_FAILED'; message: string };

async function call(path: string, payload: Record<string, unknown>, fallbackCode: Extract<OtpResult, { ok: false }>['code']): Promise<OtpResult> {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => ({}))) as { code?: string; message?: string };
    if (!response.ok) {
      const code = body.code === 'AUTH_PROVIDER_NOT_CONFIGURED' ? 'AUTH_PROVIDER_NOT_CONFIGURED' : fallbackCode;
      return { ok: false, code, message: body.message ?? 'سرویس احراز هویت فعلاً در دسترس نیست.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, code: fallbackCode, message: 'اتصال به سرویس احراز هویت برقرار نشد. دوباره تلاش کنید.' };
  }
}

export function requestOtp(phoneNumber: string): Promise<OtpResult> {
  return call('/api/v1/auth/otp/start', { phoneNumber }, 'OTP_SEND_FAILED');
}

export function verifyOtp(phoneNumber: string, otpCode: string): Promise<OtpResult> {
  return call('/api/v1/auth/otp/verify', { phoneNumber, otpCode }, 'OTP_VERIFY_FAILED');
}
