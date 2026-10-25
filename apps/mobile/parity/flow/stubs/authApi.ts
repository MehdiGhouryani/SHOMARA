type Flow = { otpRequests: string[]; verifications: Array<[string, string]> };
const flow = () => (window as unknown as { __flow: Flow }).__flow;
// The URL hash picks a network condition (#otp=netfail | ratelimit), mirroring the real authApi outcomes
// (apps/mobile/src/auth/authApi.ts): offline/provider failure and server rate limit both surface as the
// screen's calm error line - these scenarios prove that path with the real screen.
const otpMode = () => new URLSearchParams(window.location.hash.slice(1)).get('otp') ?? 'ok';
export async function requestOtp(phone: string) {
  flow().otpRequests.push(phone);
  if (otpMode() === 'netfail') return { ok: false as const, code: 'NETWORK_UNAVAILABLE', message: 'اتصال به سرویس ورود برقرار نشد. دوباره تلاش کن.' };
  return { ok: true as const };
}
export async function verifyOtp(phone: string, code: string) {
  flow().verifications.push([phone, code]);
  if (otpMode() === 'ratelimit' && code !== '123456') return { ok: false as const, code: 'RATE_LIMITED', message: 'برای درخواست کد جدید کمی صبر کن و دوباره تلاش کن.' };
  return code === '123456' ? { ok: true as const } : { ok: false as const, message: 'کد نادرست است.' };
}
