import { NextResponse } from 'next/server';
import { checkRateLimit, clientIp } from './rate-limit';

const PROVIDER_TIMEOUT_MS = 8_000;
/** Only these provider fields ever reach the client (the mobile app reads exactly these). */
const ALLOWED_RESPONSE_FIELDS = ['code', 'message', 'accessToken', 'access_token', 'token', 'retryAfterSeconds'] as const;

export function sanitizeProviderPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') return {};
  const source = payload as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const field of ALLOWED_RESPONSE_FIELDS) {
    const value = source[field];
    if (typeof value === 'string' || typeof value === 'number') out[field] = value;
  }
  return out;
}

function normalizePhone(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/\D/g, '');
}

export function otpRateLimitResponse(request: Request, kind: 'start' | 'verify', phoneNumber: string): NextResponse | null {
  const phone = normalizePhone(phoneNumber);
  const ip = clientIp(request);
  const rules = kind === 'start'
    ? { phone: { max: 5, windowMs: 10 * 60_000, lockMs: 15 * 60_000 }, ip: { max: 20, windowMs: 10 * 60_000, lockMs: 15 * 60_000 } }
    : { phone: { max: 5, windowMs: 15 * 60_000, lockMs: 15 * 60_000 }, ip: { max: 30, windowMs: 15 * 60_000, lockMs: 15 * 60_000 } };
  const byPhone = checkRateLimit(`otp:${kind}:phone:${phone}`, rules.phone);
  const byIp = checkRateLimit(`otp:${kind}:ip:${ip}`, rules.ip);
  if (byPhone.allowed && byIp.allowed) return null;
  const retryAfter = Math.max(byPhone.retryAfterSeconds, byIp.retryAfterSeconds);
  return NextResponse.json(
    { code: 'RATE_LIMITED', message: 'تعداد تلاش‌ها زیاد بود. کمی بعد دوباره تلاش کنید.', retryAfterSeconds: retryAfter },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}

export async function callOtpProvider(provider: string, path: '/otp/start' | '/otp/verify', body: Record<string, unknown>, failure: { code: string; message: string }): Promise<NextResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const response = await fetch(`${provider.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = sanitizeProviderPayload(await response.json().catch(() => ({})));
    // Never forward arbitrary provider status codes; collapse unknown ones to a safe set.
    const status = response.ok ? 200 : response.status === 400 || response.status === 401 || response.status === 403 || response.status === 429 ? response.status : 502;
    if (!response.ok && !payload.code) payload.code = failure.code;
    if (!response.ok && !payload.message) payload.message = failure.message;
    return NextResponse.json(payload, { status });
  } catch {
    return NextResponse.json(failure, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
