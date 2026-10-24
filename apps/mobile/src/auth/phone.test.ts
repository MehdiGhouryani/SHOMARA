import { describe, expect, it } from 'vitest';
import { formatIranMobile, isValidIranMobileInput, maskIranMobile, normalizeIranMobileInput, toIranE164 } from './phone';

describe('Iran phone helpers', () => {
  it('normalizes local and international forms to local digits', () => {
    expect(normalizeIranMobileInput('0912 123 4567')).toBe('9121234567');
    expect(normalizeIranMobileInput('+98 912 123 4567')).toBe('9121234567');
    expect(normalizeIranMobileInput('0098-912-123-4567')).toBe('9121234567');
    expect(normalizeIranMobileInput('۹۱۲۱۲۳۴۵۶۷')).toBe('9121234567');
  });

  it('validates Iranian mobile numbers', () => {
    expect(isValidIranMobileInput('09121234567')).toBe(true);
    expect(isValidIranMobileInput('9121234567')).toBe(true);
    expect(isValidIranMobileInput('8121234567')).toBe(false);
    expect(isValidIranMobileInput('912123456')).toBe(false);
  });

  it('creates canonical E.164 form', () => {
    expect(toIranE164('09121234567')).toBe('+989121234567');
  });

  it('formats and masks for the UI', () => {
    expect(formatIranMobile('09121234567')).toBe('912 123 4567');
    // Approved code page shows ۰۹۱۲***۶۷۸۹: first four and last four digits (ADR-0035, page 03).
    expect(maskIranMobile('09121234567')).toBe('۰۹۱۲***۴۵۶۷');
    expect(maskIranMobile('123')).toBe('۰۹*********');
  });
});
