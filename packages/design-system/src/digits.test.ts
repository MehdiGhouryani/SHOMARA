import { describe, expect, it } from 'vitest';
import { toEnglishDigits, toPersianDigits } from './digits';

describe('toPersianDigits', () => {
  it('converts Latin digits', () => expect(toPersianDigits(1204)).toBe('۱۲۰۴'));
  it('keeps zero visible', () => expect(toPersianDigits(0)).toBe('۰'));
  it('converts Arabic-Indic digits', () => expect(toPersianDigits('٣٤')).toBe('۳۴'));
  it('keeps non-digit text', () => expect(toPersianDigits('سؤال 1 از 2')).toBe('سؤال ۱ از ۲'));
  it('returns empty for null and undefined', () => {
    expect(toPersianDigits(null)).toBe('');
    expect(toPersianDigits(undefined)).toBe('');
  });
});

describe('toEnglishDigits', () => {
  it('converts Persian and Arabic-Indic digits to Latin', () => expect(toEnglishDigits('۲۴٥')).toBe('245'));
  it('returns empty for empty input', () => expect(toEnglishDigits('')).toBe(''));
  it('round-trips with toPersianDigits', () => expect(toEnglishDigits(toPersianDigits('0123456789'))).toBe('0123456789'));
});
