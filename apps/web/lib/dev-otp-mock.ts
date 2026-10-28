/**
 * Development-only OTP mock (owner request, 2026-10-27): local onboarding must not block on the
 * missing OTP provider. Mirrors the established dev-power pattern (A5/ALLOW_DEV_PRINCIPAL):
 * active ONLY when ALL three hold — NODE_ENV is not production, the operator explicitly set
 * ALLOW_DEV_OTP_MOCK=1, and no real provider is configured. Production always fails closed.
 */
export const DEV_OTP_CODE = '123456';
export const DEV_MOCK_ACCESS_TOKEN = 'dev-mock-access-token';

export function devOtpMockAllowed(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.ALLOW_DEV_OTP_MOCK === '1' &&
    !process.env.AUTH_OTP_PROVIDER_URL?.trim()
  );
}
