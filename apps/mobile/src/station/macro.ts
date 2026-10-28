import type { StationStage } from './types';

/**
 * The child sees 5 calm macro stages, not 12 encounters (SoT §8):
 * کشف / با هم تمرین / بازی / خودت انجام بده / مهارتت را نشان بده.
 */
export const MACRO_LABELS = ['کشف می‌کنیم', 'با هم تمرین می‌کنیم', 'بازی می‌کنیم', 'خودت انجام بده', 'مهارتت را نشان بده'] as const;

export function macroIndex(stage: StationStage): number | null {
  switch (stage) {
    case 'LEARN':
      return 0;
    case 'GUIDED':
      return 1;
    case 'GAME_PATTERN':
    case 'GAME_COUNT':
      return 2;
    case 'INDEPENDENT':
    case 'REVIEW':
      return 3;
    case 'TRANSFER':
    case 'CHECK_A':
    case 'CHECK_B':
    case 'MASTERY_CHECK':
    case 'RECOVERY':
    case 'RECHECK':
    case 'SIGNATURE_CHALLENGE':
      return 4;
    default:
      return null; // ENTRY / RESULT / COMPLETE are not macro stages
  }
}

/** How many of the 5 segments are filled. RESULT keeps the previous stage's fill; COMPLETE = all. */
export function macroFilled(stage: StationStage, previous: StationStage | null): number {
  if (stage === 'COMPLETE') return MACRO_LABELS.length;
  if (stage === 'ENTRY') return 0;
  const idx = macroIndex(stage === 'RESULT' ? (previous ?? 'LEARN') : stage);
  return idx === null ? 0 : idx + 1;
}

export function macroLabel(stage: StationStage, previous: StationStage | null): string {
  if (stage === 'COMPLETE') return 'تمام شد!';
  const idx = macroIndex(stage === 'RESULT' ? (previous ?? 'LEARN') : stage);
  return idx === null ? '' : MACRO_LABELS[idx]!;
}
