/**
 * Mobile runtime configuration.
 *
 * Production builds MUST receive an HTTPS API base through
 * EXPO_PUBLIC_API_BASE_URL. Localhost is intentionally available only in dev.
 */
const raw = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');

export const API_BASE_URL = raw || (__DEV__ ? 'http://localhost:3000' : '');

export function isApiConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

export function isProductionApiSafe(): boolean {
  if (__DEV__) return true;
  return /^https:\/\//i.test(API_BASE_URL);
}

export function productionConfigError(): string | null {
  if (__DEV__) return null;
  if (!API_BASE_URL) return 'اتصال سرویس یادگیری برای این نسخه تنظیم نشده است.';
  if (!isProductionApiSafe()) return 'اتصال سرویس یادگیری امن نیست. لطفاً نسخه رسمی برنامه را نصب کنید.';
  return null;
}
