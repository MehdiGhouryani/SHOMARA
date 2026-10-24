/**
 * Client-safe challenge presentation helpers (P10 readiness / Phase 0+1).
 *
 * Guardrails:
 * - Never include evaluator_config, expectedAnswers, or any answer key.
 * - Presentation is display-only: title, options, display/sequence stem.
 * - Pure functions only — safe for contracts package and client imports.
 */

export const CHALLENGE_PRESENTATION_VERSION = '2026-10-05-presentation-v1' as const;

/** Shape stored under content_versions.metadata.presentation (server seed). */
export interface ContentPresentationMetadata {
  title?: string;
  options?: readonly string[];
  /** P10 depth stem text (e.g. "توپ روی قفسهٔ بالا"). */
  display?: string;
  /** ST01 pattern stem tokens (e.g. ["Y","B","Y","B","?"]). */
  sequence?: readonly string[];
  questions?: readonly unknown[];
  visualCount?: number;
}

/** What the child UI may render for one challenge encounter. No answer key. */
export interface ClientChallengePresentation {
  title: string | null;
  options: readonly string[];
  /** Preferred stem for generic MC (P10). */
  display: string | null;
  /** Pattern tokens for ST01-style pattern challenges. */
  sequence: readonly string[] | null;
  visualCount: number | null;
}

export const EMPTY_CLIENT_PRESENTATION: ClientChallengePresentation = {
  title: null,
  options: [],
  display: null,
  sequence: null,
  visualCount: null,
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

/**
 * Extract client-safe presentation from content_versions.metadata (or equivalent).
 * Accepts either `{ presentation: {...} }` or a bare presentation object.
 * Ignores unknown keys; never reads evaluator fields.
 */
export function extractClientPresentation(
  metadata: unknown,
): ClientChallengePresentation {
  if (!metadata || typeof metadata !== 'object') {
    return { ...EMPTY_CLIENT_PRESENTATION, options: [] };
  }

  const root = metadata as Record<string, unknown>;
  const raw =
    root.presentation && typeof root.presentation === 'object'
      ? (root.presentation as Record<string, unknown>)
      : root;

  const title =
    typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : null;
  const options = asStringArray(raw.options);
  const display =
    typeof raw.display === 'string' && raw.display.trim()
      ? raw.display.trim()
      : null;
  const sequenceRaw = asStringArray(raw.sequence);
  const sequence = sequenceRaw.length > 0 ? sequenceRaw : null;
  const visualCount =
    typeof raw.visualCount === 'number' && Number.isFinite(raw.visualCount)
      ? raw.visualCount
      : null;

  return { title, options, display, sequence, visualCount };
}

/**
 * Canonical station code (ST01…ST25) → challenge definition UUID.
 * Must match st01-slice + p10-batch-*-depth definitionId values and SQL seeds.
 */
export const STATION_CHALLENGE_DEFINITION_IDS: Readonly<Record<string, string>> = {
  ST01: '2f050000-0000-4000-8000-000000000001',
  ST02: '2f0a0000-0000-4000-8000-000000000002',
  ST03: '2f0a0000-0000-4000-8000-000000000003',
  ST04: '2f0a0000-0000-4000-8000-000000000004',
  ST05: '2f0a0000-0000-4000-8000-000000000005',
  ST06: '2f0b0000-0000-4000-8000-000000000006',
  ST07: '2f0b0000-0000-4000-8000-000000000007',
  ST08: '2f0b0000-0000-4000-8000-000000000008',
  ST09: '2f0b0000-0000-4000-8000-000000000009',
  ST10: '2f0b0000-0000-4000-8000-000000000010',
  ST11: '2f0c0000-0000-4000-8000-000000000011',
  ST12: '2f0c0000-0000-4000-8000-000000000012',
  ST13: '2f0c0000-0000-4000-8000-000000000013',
  ST14: '2f0c0000-0000-4000-8000-000000000014',
  ST15: '2f0c0000-0000-4000-8000-000000000015',
  ST16: '2f0d0000-0000-4000-8000-000000000016',
  ST17: '2f0d0000-0000-4000-8000-000000000017',
  ST18: '2f0d0000-0000-4000-8000-000000000018',
  ST19: '2f0d0000-0000-4000-8000-000000000019',
  ST20: '2f0d0000-0000-4000-8000-000000000020',
  ST21: '2f0e0000-0000-4000-8000-000000000021',
  ST22: '2f0e0000-0000-4000-8000-000000000022',
  ST23: '2f0e0000-0000-4000-8000-000000000023',
  ST24: '2f0e0000-0000-4000-8000-000000000024',
  ST25: '2f0e0000-0000-4000-8000-000000000025',
} as const;

/** Normalize common station identifiers to ST01…ST25 codes. */
export function normalizeStationCode(stationIdOrCode: string): string | null {
  const raw = stationIdOrCode.trim().toUpperCase();
  if (/^ST(0[1-9]|1\d|2[0-5])$/.test(raw)) return raw;
  // UUID suffix pattern used in seeds: ...00000000000N
  const m = raw.match(/0000000000(\d{2})$/);
  if (m) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 25) return `ST${String(n).padStart(2, '0')}`;
  }
  // G1-ST01 style
  const g = raw.match(/G1-ST(0[1-9]|1\d|2[0-5])/);
  if (g) return `ST${g[1]}`;
  return null;
}

/**
 * Resolve challenge definition id for a station.
 * Returns null when the station has no seeded Signature Challenge.
 */
export function challengeDefinitionIdForStation(
  stationIdOrCode: string,
): string | null {
  const code = normalizeStationCode(stationIdOrCode);
  if (!code) return null;
  return STATION_CHALLENGE_DEFINITION_IDS[code] ?? null;
}

export function hasStationChallenge(stationIdOrCode: string): boolean {
  return challengeDefinitionIdForStation(stationIdOrCode) !== null;
}
