import { describe, expect, it } from 'vitest';
import { toEn, toFa } from './digits';

describe('digits', () => {
  it('Latin -> Persian', () => expect(toFa(1204)).toBe('۱۲۰۴'));
  it('Arabic-Indic -> Persian', () => expect(toFa('٣٤')).toBe('۳۴'));
  it('keeps non-digits', () => expect(toFa('سؤال 1 از 2')).toBe('سؤال ۱ از ۲'));
  it('Persian/Arabic -> Latin for parsing input', () => expect(toEn('۲۴٥')).toBe('245'));
});
