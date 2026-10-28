import { describe, expect, it } from 'vitest';
import { isValidOtp, isValidPhone } from './onboarding';

describe('phone validation accepts local and international Iranian mobile', () => {
  it('accepts the local 09xxxxxxxxx format users actually type', () => {
    expect(isValidPhone('09302144747')).toBe(true);
    expect(isValidPhone('09123456789')).toBe(true);
    expect(isValidPhone('۰۹۱۲۳۴۵۶۷۸۹')).toBe(true);
    expect(isValidPhone('0912 345 6789')).toBe(true);
  });

  it('keeps accepting international forms', () => {
    expect(isValidPhone('+989123456789')).toBe(true);
    expect(isValidPhone('989123456789')).toBe(true);
  });

  it('still rejects malformed numbers', () => {
    expect(isValidPhone('09123')).toBe(false);
    expect(isValidPhone('12345678901234567')).toBe(false);
    expect(isValidPhone('abcdefghijk')).toBe(false);
    expect(isValidPhone('')).toBe(false);
  });

  it('keeps the six-digit OTP rule', () => {
    expect(isValidOtp('123456')).toBe(true);
    expect(isValidOtp('۱۲۳۴۵۶')).toBe(true);
    expect(isValidOtp('12345')).toBe(false);
  });
});
