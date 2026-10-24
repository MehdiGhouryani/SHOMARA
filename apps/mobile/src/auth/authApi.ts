import { normalizeDigits, isValidOtp, isValidPhone } from '@math/contracts';
import { API_BASE_URL, productionConfigError } from '../config/runtime';
import { setAccessToken } from './AuthSession';

export type MobileOtpResponse = {
  ok: boolean;
  code?: string;
  message?: string;
  accessToken?: string;
  access_token?: string;
  token?: string;
};

async function post(path: string, body: Record<string, unknown>): Promise<MobileOtpResponse> {
  const configError = productionConfigError();
  if (configError) return { ok: false, code: 'CONFIG_ERROR', message: configError };
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => ({}))) as Partial<MobileOtpResponse>;
    return {
      ok: response.ok,
      ...(typeof payload.code === 'string' ? { code: payload.code } : {}),
      ...(typeof payload.message === 'string' ? { message: payload.message } : {}),
      ...(typeof payload.accessToken === 'string' ? { accessToken: payload.accessToken } : {}),
      ...(typeof payload.access_token === 'string' ? { access_token: payload.access_token } : {}),
      ...(typeof payload.token === 'string' ? { token: payload.token } : {}),
    };
  } catch {
    return { ok: false, code: 'NETWORK_UNAVAILABLE', message: 'اتصال به سرویس ورود برقرار نشد. دوباره تلاش کن.' };
  }
}

export async function requestOtp(phoneNumber: string): Promise<MobileOtpResponse> {
  const phone = normalizeDigits(phoneNumber).trim();
  if (!isValidPhone(phone)) return { ok: false, code: 'VALIDATION_ERROR', message: 'شماره همراه را با فرمت معتبر وارد کن.' };
  return post('/api/v1/auth/otp/start', { phoneNumber: phone });
}

export async function verifyOtp(phoneNumber: string, otpCode: string): Promise<MobileOtpResponse> {
  const phone = normalizeDigits(phoneNumber).trim();
  const otp = normalizeDigits(otpCode).replace(/\D/g, '').slice(0, 6);
  if (!isValidPhone(phone) || !isValidOtp(otp)) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'شماره همراه و کد ۶ رقمی را بررسی کن.' };
  }
  const result = await post('/api/v1/auth/otp/verify', { phoneNumber: phone, otpCode: otp });
  if (!result.ok) return result;
  const token = result.accessToken ?? result.access_token ?? result.token;
  if (!token) return { ok: false, code: 'AUTH_SESSION_MISSING', message: 'ورود تأیید شد اما نشست امن برنامه ساخته نشد. دوباره تلاش کن.' };
  const persisted = await setAccessToken(token);
  if (!persisted) return { ok: false, code: 'AUTH_SESSION_SAVE_FAILED', message: 'نشست امن ذخیره نشد. فضای امن دستگاه را بررسی کن و دوباره تلاش کن.' };
  return result;
}
