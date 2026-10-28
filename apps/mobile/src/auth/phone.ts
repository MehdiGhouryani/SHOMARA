import { normalizeDigits } from '@math/contracts';
import { toFa } from '../ui/digits';

/**
 * V1 is Iran-first. Keep the UI-friendly local number separate from the
 * canonical E.164-ish value sent to the auth backend.
 *
 * Accepted examples:
 *   09121234567 -> 9121234567
 *   9121234567  -> 9121234567
 *   989121234567 / +989121234567 -> 9121234567
 */
export function normalizeIranMobileInput(input: string): string {
  let digits = normalizeDigits(input).replace(/\D/g, '');
  if (digits.startsWith('0098')) digits = digits.slice(4);
  else if (digits.startsWith('98')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export function isValidIranMobileInput(input: string): boolean {
  const local = normalizeIranMobileInput(input);
  return /^9\d{9}$/.test(local);
}

export function toIranE164(input: string): string {
  const local = normalizeIranMobileInput(input);
  return `+98${local}`;
}

export function formatIranMobile(input: string): string {
  const local = normalizeIranMobileInput(input);
  if (!local) return '';
  if (local.length <= 3) return local;
  if (local.length <= 6) return `${local.slice(0, 3)} ${local.slice(3)}`;
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}

/** Confirmation text on the code page. Format follows the approved page: ۰۹۱۲***۶۷۸۹ (first four and last four digits). */
export function maskIranMobile(input: string): string {
  const local = normalizeIranMobileInput(input);
  if (local.length !== 10) return `${toFa('09')}${'*'.repeat(9)}`;
  return `${toFa(`09${local.slice(1, 3)}`)}***${toFa(local.slice(-4))}`;
}
