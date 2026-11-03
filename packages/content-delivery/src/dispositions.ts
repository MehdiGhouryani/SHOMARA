/**
 * N08-08/N08-12 — all 18 CONTENT dispositions + versioned calibration config.
 *
 * Honesty rules (SOURCE_AUDIT.md §3, shomara-learning-content SKILL.md):
 *  - Only issues with a recorded owner/phase resolution are marked RESOLVED.
 *  - Open owner decisions (CONTENT-004/005/006/007) are marked OWNER_DECISION_PENDING
 *    with the code-level guard that exists today; they are NOT silently closed.
 *  - No content-library/originals/** byte is touched by this module; it is a
 *    machine-readable mirror of the audit ledger, not a source of truth.
 */

// ---------------------------------------------------------------------------
// Disposition outcomes
// ---------------------------------------------------------------------------

/** Fully resolved with recorded evidence (audit n06/n07 resolutions, owner gate). */
export const RESOLVED = 'RESOLVED' as const;
/** Resolved for the UI layer only; final naming stays an owner decision. */
export const RESOLVED_FOR_UI = 'RESOLVED_FOR_UI' as const;
/** Code guard exists; final owner decision is still open and recorded in the audit. */
export const OWNER_DECISION_PENDING = 'OWNER_DECISION_PENDING' as const;

export type DispositionDecision =
  | typeof RESOLVED
  | typeof RESOLVED_FOR_UI
  | typeof OWNER_DECISION_PENDING;

export interface ContentDisposition {
  decision: DispositionDecision;
  /** Evidence pointer; never a substitute for the human-readable SOURCE_AUDIT.md entry. */
  evidence: string;
}

/** The 18 audited issues from content-library/derived/source-audit.json (CONTENT-001..018). */
export const CONTENT_DISPOSITIONS: Readonly<Record<string, ContentDisposition>> = Object.freeze({
  // --- Resolved in N06 (recorded n06Resolutions, 2026-11-01) ---
  'CONTENT-001': {
    decision: RESOLVED,
    evidence: 'n06Resolutions: T13TraceAdapter top-to-bottom stroke for ۱ + traceToleranceDp=28 server config + full tap-checkpoint fallback',
  },
  'CONTENT-002': {
    decision: RESOLVED,
    evidence: 'n06Resolutions: stationJumpQuestionCount=1 / chapterJumpQuestionCount=5 in versioned ServerLearningConfig; client never hardcodes',
  },
  'CONTENT-003': {
    decision: RESOLVED,
    evidence: 'n06Resolutions: hintViolations ban h1/h2/h3 in P4/P5; scaffolding allowed in P1..P3 only',
  },
  'CONTENT-004': {
    decision: RESOLVED_FOR_UI,
    evidence: 'ST01..ST25 fixed IDs from stations-index.json; titles marked provisional; structural chapter labels only — final path copy needs an explicit owner decision (SOURCE_AUDIT OPEN_DECISION)',
  },
  'CONTENT-005': {
    decision: OWNER_DECISION_PENDING,
    evidence: 'GUARD TODAY: neutral pedagogical framing in all coded ST07 adapters; textbook photo/artwork copying is forbidden. Neutral-first vs separate cultural packs: owner decision open (ST08/ST15/ST20/ST23 batches blocked on it)',
  },
  'CONTENT-006': {
    decision: OWNER_DECISION_PENDING,
    evidence: 'GUARD TODAY (n07Resolutions): voiceProfileId abstract; fa-IR-DilaraNeural kept only as non-authoritative providerVoiceHint. Final narrator voice + sample listening: owner decision open',
  },
  'CONTENT-007': {
    decision: OWNER_DECISION_PENDING,
    evidence: 'GUARD TODAY: haptics subtle/none on retry, reducedMotion disables celebratory haptics, SFX requires RIGHTS_CLEARED provenance. Default ON-light vs OFF: owner decision open (Stage5 §9)',
  },
  'CONTENT-008': {
    decision: RESOLVED,
    evidence: 'n06Resolutions: 3-tier projection boundary; deep-stripping projectors throw on answer/evaluator/threshold/reviewer contamination; snapshot tests prove zero leakage',
  },
  'CONTENT-009': {
    decision: RESOLVED,
    evidence: 'CODED_PRIMITIVE_PROVENANCE: ST07 visuals rendered as deterministic Compose canvas primitives; no unverified bitmaps claimed as existing artwork',
  },
  'CONTENT-010': {
    decision: RESOLVED,
    evidence: 'n07Resolutions: AudioScriptMetadata (draft text) strictly separated from binary AudioAssetVersion',
  },
  'CONTENT-011': {
    decision: RESOLVED,
    evidence: 'CALIBRATION_V1 config (this file): idleReplayMs=8000, traceToleranceDp=28, transitions 250/350/450ms, speechRate=-15% — versioned, server-rollbackable; device/child calibration evidence pending (N08-06/07)',
  },
  'CONTENT-012': {
    decision: RESOLVED,
    evidence: '5-batch 24-station staging plan (A: ST01-06, B: ST08-12, C: ST13-17, D: ST18-22, E: ST23-25) with per-batch validators in PHASE_INTEGRATION.md; production starts only after N08-08/12 close',
  },
  'CONTENT-013': {
    decision: RESOLVED,
    evidence: 'n07Resolutions + HG-03: LISTEN_REVIEW_REQUIRED before RIGHTS_CLEARED; RBAC audit trail; admin-only rollback in cms-audio.ts',
  },
  'CONTENT-014': {
    decision: RESOLVED,
    evidence: 'n06Resolutions: server-owned masteryPassThreshold=3/4, non-punitive recovery loop; client renders server nextAction only',
  },
  'CONTENT-015': {
    decision: RESOLVED,
    evidence: 'n06Resolutions: typed behavior IDs (P{1..5}_{INTERACTION}); Stage-6 prose maps to the canonical 7-stage lifecycle; 4 distinct review roles mandatory',
  },
  'CONTENT-016': {
    decision: OWNER_DECISION_PENDING,
    evidence: 'GUARD TODAY: t08GridAllowed caps interactive grids at 6 (5×5/6×6 progressive sub-grids) and ST23/ST25 policies are recorded as config. include/modify/defer for 9×9 T08 and two-digit scope: Grade-1 specialist review required (N08-11)',
  },
  'CONTENT-017': {
    decision: RESOLVED,
    evidence: 'n06Resolutions: AudioPolicy.EXPECTED_NEVER_BLOCKING everywhere incl. T11/T15; visible Persian text fallback mandatory',
  },
  'CONTENT-018': {
    decision: RESOLVED,
    evidence: 'n06Resolutions: telemetry carries only session/encounter/interaction/choice IDs; answers, correctness and child PII never leave the server boundary',
  },
});

export type ContentIssueId = keyof typeof CONTENT_DISPOSITIONS;

/** Issues whose final owner decision is still open (honest blocker list for N08 gates). */
export const OPEN_OWNER_DECISIONS: readonly ContentIssueId[] = Object.freeze(
  (Object.keys(CONTENT_DISPOSITIONS) as ContentIssueId[]).filter(
    (id) => CONTENT_DISPOSITIONS[id].decision === OWNER_DECISION_PENDING,
  ),
);

/** True only when every audited issue is closed with recorded evidence. */
export function allDispositionsClosed(): boolean {
  return (Object.keys(CONTENT_DISPOSITIONS) as ContentIssueId[]).every(
    (id) => CONTENT_DISPOSITIONS[id].decision === RESOLVED || CONTENT_DISPOSITIONS[id].decision === RESOLVED_FOR_UI,
  );
}

// ---------------------------------------------------------------------------
// N08-12 — versioned calibration config (rollbackable without a new APK)
// ---------------------------------------------------------------------------

export interface CalibrationConfig {
  configVersion: number;
  /** CONTENT-011 budgets. */
  idleReplayMs: number;
  traceToleranceDp: number;
  transitionFastMs: number;
  transitionMediumMs: number;
  transitionSlowMs: number;
  speechRateDeltaPercent: number;
  sessionBudgetMaxMinutes: number;
  stationTargetMinutes: number;
  microBreakMinutes: number;
  /** CONTENT-016 curriculum scope (guards; final scope is an owner/specialist decision). */
  t08GridMaxSize: number;
  t08GridPolicy: string;
  st23Policy: string;
  st25Policy: string;
  /** CONTENT-014 mastery. */
  masteryPassThreshold: string;
  /** CONTENT-007 haptics. */
  hapticsPolicy: string;
}

export const CALIBRATION_V1: CalibrationConfig = Object.freeze({
  configVersion: 1,
  idleReplayMs: 8000,
  traceToleranceDp: 28,
  transitionFastMs: 250,
  transitionMediumMs: 350,
  transitionSlowMs: 450,
  speechRateDeltaPercent: -15,
  sessionBudgetMaxMinutes: 30,
  stationTargetMinutes: 12,
  microBreakMinutes: 3,
  t08GridMaxSize: 6,
  t08GridPolicy: 'MODIFIED_FOR_G1_COGNITIVE_LOAD',
  st23Policy: 'INCLUDED_WITH_CONCRETE_BUNDLES',
  st25Policy: 'INCLUDED_AS_CAPSTONE_BUNDLE_INTRO',
  masteryPassThreshold: '3/4',
  hapticsPolicy: 'OFF_OR_SUBTLE_SYSTEM_FEEDBACK',
});

/** Rollback: restore a previous config version wholesale; the shape is versioned. */
export function rollbackCalibration(previous: CalibrationConfig): CalibrationConfig {
  if (!Number.isInteger(previous.configVersion) || previous.configVersion < 1) {
    throw new Error(`CALIBRATION_INVALID_VERSION: ${previous.configVersion}`);
  }
  return { ...previous };
}

/** Monotonic version guard: a config can never regress to an older version silently. */
export function applyCalibration(current: CalibrationConfig, incoming: CalibrationConfig): CalibrationConfig {
  if (!Number.isInteger(incoming.configVersion) || incoming.configVersion < 1) {
    throw new Error(`CALIBRATION_INVALID_VERSION: ${incoming.configVersion}`);
  }
  if (incoming.configVersion < current.configVersion) {
    throw new Error(`CALIBRATION_DOWNGRADE_REJECTED: ${current.configVersion} → ${incoming.configVersion}`);
  }
  return { ...incoming };
}

// ---------------------------------------------------------------------------
// CONTENT-016 curriculum scope gates
// ---------------------------------------------------------------------------

/** T08 grid: Grade-1 active interactive grid capped at progressive sub-grids (2..max). */
export function t08GridAllowed(size: number, config: CalibrationConfig = CALIBRATION_V1): boolean {
  return Number.isInteger(size) && size >= 2 && size <= config.t08GridMaxSize;
}

/** ST23: two-digit comparison requires concrete place-value bundles first. */
export function st23RequiresConcreteBundles(config: CalibrationConfig = CALIBRATION_V1): boolean {
  return config.st23Policy === 'INCLUDED_WITH_CONCRETE_BUNDLES';
}

/** ST25: numeral 100 only as the capstone celebratory milestone — no arithmetic beyond 100. */
export function st25IsCapstoneOnly(config: CalibrationConfig = CALIBRATION_V1): boolean {
  return config.st25Policy === 'INCLUDED_AS_CAPSTONE_BUNDLE_INTRO';
}
