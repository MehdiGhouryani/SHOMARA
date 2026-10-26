/**
 * Mobile runtime configuration.
 *
 * Production and market-apk builds MUST receive an HTTPS API base through
 * EXPO_PUBLIC_API_BASE_URL and fail closed without one. The EAS preview
 * profile is the only exception (D-019): an internal device-test APK built
 * with no API URL runs the on-device local-content preview — content ships in
 * the bundle, no server is contacted, and the UI must never present a server
 * decision, sync or progress that did not happen. Localhost is intentionally
 * available only in dev.
 */
const raw = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');

export const API_BASE_URL = raw || (__DEV__ ? 'http://localhost:3000' : '');

const RELEASE_CHANNEL = (process.env.EXPO_PUBLIC_RELEASE_CHANNEL ?? '').trim();

/** True only for the EAS `preview` profile artifact (the internal device-test APK). */
export function isPreviewRelease(): boolean {
  return !__DEV__ && RELEASE_CHANNEL === 'preview';
}

/**
 * Preview build with no configured API base: the app runs on bundled local
 * content. It never points at localhost and never reaches a server, so no
 * screen may claim a connection, sync or server-driven evaluation.
 */
export function isLocalContentPreview(): boolean {
  return isPreviewRelease() && !API_BASE_URL;
}

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
  if (!isProductionApiSafe()) return 'اتصال سرویس یادگیری امن نیست. لطفاً نسخهٔ رسمی برنامه را نصب کنید.';
  return null;
}
