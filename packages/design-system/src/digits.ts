/**
 * Digit conversion shared by web and mobile (single implementation).
 * Display: Latin and Arabic-Indic digits -> Persian digits.
 * Parsing: Persian and Arabic-Indic digits -> Latin digits.
 */
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function toPersianDigits(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]!)
    .replace(/[٠-٩]/g, (d) => PERSIAN_DIGITS[ARABIC_INDIC_DIGITS.indexOf(d)]!);
}

export function toEnglishDigits(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC_DIGITS.indexOf(d)));
}
