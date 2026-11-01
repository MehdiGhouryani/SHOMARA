/**
 * N06-01/09/11 — 3-tier content projection boundary (authoring contract gaps §1/§2/§5).
 *
 * Three DISTINCT models:
 *   AuthoringStation       (backend/CMS): answers, evaluator, mastery proposals, provenance.
 *   PublishedStationPackage (content delivery): locked version, asset refs, checksum, server evaluator ref.
 *   ChildLessonProjection  (API/Android): prompt, visible options, interaction config, audio IDs.
 *
 * NOTHING from {answer, evaluatorConfig, pass_threshold, next step, reviewer identity} may ever
 * reach ChildLessonProjection — the [projectForChild] stripper + [projectionViolations] validator
 * enforce it, and the Vitest snapshot tests pin it.
 */
export const CONTENT_LIFECYCLE_STAGES = [
  'SOURCE_ONLY',
  'MAPPED_TO_REPO',
  'STAGED',
  'VALIDATED',
  'HUMAN_REVIEWED',
  'APPROVED',
  'ENABLED',
] as const;
export type ContentLifecycleStage = (typeof CONTENT_LIFECYCLE_STAGES)[number];

export const AUDIO_LIFECYCLE_STAGES = [
  'DRAFT',
  'GENERATED_OR_UPLOADED',
  'TECHNICALLY_VALIDATED',
  'LISTENED',
  'RIGHTS_CLEARED',
  'APPROVED',
  'PUBLISHED',
] as const;
export type AudioLifecycleStage = (typeof AUDIO_LIFECYCLE_STAGES)[number];

/** CONTENT-015: four distinct review roles; `reviewed` alone is never sufficient. */
export const REVIEW_ROLES = ['curriculum', 'persian_pronunciation', 'accessibility', 'rights_moderation'] as const;
export type ReviewRole = (typeof REVIEW_ROLES)[number];

/** P1..P5 macro stages mapped onto the server-owned state machine names. */
export const MACRO_STAGES = ['P1_DISCOVER', 'P2_GUIDED', 'P3_GAME', 'P4_ASSESSMENT', 'P5_TRANSFER'] as const;
export type MacroStage = (typeof MACRO_STAGES)[number];

/** Hints are allowed in P1..P3 scaffolding and strictly banned in P4/P5 (CONTENT-003). */
export const HINTS_ALLOWED_STAGES: readonly MacroStage[] = ['P1_DISCOVER', 'P2_GUIDED', 'P3_GAME'];
export const HINT_BANNED_STAGES: readonly MacroStage[] = ['P4_ASSESSMENT', 'P5_TRANSFER'];
export const HINT_KEYS = ['h1', 'h2', 'h3', 'hint', 'hints'] as const;

/** Audio is EXPECTED_NEVER_BLOCKING everywhere including T11 (CONTENT-017). */
export const AUDIO_POLICY = 'EXPECTED_NEVER_BLOCKING' as const;

/** Server-owned versioned config (CONTENT-002/014); the client never hardcodes these. */
export interface ServerLearningConfig {
  configVersion: number;
  stationJumpQuestionCount: number;
  chapterJumpQuestionCount: number;
  masteryPassThreshold: string;
  traceToleranceDp: number;
  audioPolicy: typeof AUDIO_POLICY;
}

export const SERVER_LEARNING_CONFIG: ServerLearningConfig = Object.freeze({
  configVersion: 1,
  stationJumpQuestionCount: 1,
  chapterJumpQuestionCount: 5,
  masteryPassThreshold: '3/4',
  traceToleranceDp: 28,
  audioPolicy: AUDIO_POLICY,
});

export interface ReviewEvidence {
  role: ReviewRole;
  reviewerId: string;
  decidedAt: string;
}

export interface PrerequisiteEdge {
  fromStationId: string;
  toStationId: string;
}

/** Tier 1 — backend/CMS only. Never serialized to any client surface. */
export interface AuthoringStation {
  stationId: string;
  lifecycle: ContentLifecycleStage;
  evaluatorConfig: Record<string, unknown>;
  passThreshold: string;
  reviewEvidence: ReviewEvidence[];
  prerequisites: PrerequisiteEdge[];
  provenance: Record<string, unknown>;
  /** Prose is author-facing description only; behavior is the typed [behaviorId]. */
  advanceProse: string;
  interactionProse: string;
  behaviorId: string;
}

/** Tier 2 — content delivery: locked, checksummed, evaluator stays server-referenced. */
export interface PublishedStationPackage {
  stationId: string;
  packageVersion: number;
  checksum: string;
  lifecycle: Extract<ContentLifecycleStage, 'APPROVED' | 'ENABLED'>;
  evaluatorServerRef: string;
  audioAssetIds: string[];
  prerequisites: PrerequisiteEdge[];
  macroStages: MacroStage[];
}

/** Tier 3 — the only shape a child client may ever hold. */
export interface ChildLessonProjection {
  stationId: string;
  packageVersion: number;
  macroStages: MacroStage[];
  prompt: string;
  visibleOptions: string[];
  interactionConfig: Record<string, unknown>;
  audioAssetIds: string[];
  audioPolicy: typeof AUDIO_POLICY;
  accessibilityCopy: string;
}

/** Answer-key surface keys that must never appear in any child projection. */
export const FORBIDDEN_PROJECTION_KEYS = [
  'answer',
  'answers',
  'answerKey',
  'answer_key',
  'correctIndex',
  'correctAnswer',
  'evaluatorConfig',
  'evaluator_config',
  'pass_threshold',
  'passThreshold',
  'nextStep',
  'reviewer',
  'reviewerId',
  'reviewEvidence',
  'provenance',
  'h1',
  'h2',
  'h3',
  'hint',
  'hints',
] as const;

/** CONTENT-018: telemetry carries minimal IDs only — never answers, correctness, or child PII. */
export interface AttemptTelemetry {
  sessionId: string;
  encounterId: string;
  interactionId: string;
  choiceId: string | null;
  macroStage: MacroStage;
}

export function telemetryViolations(telemetry: AttemptTelemetry): string[] {
  const violations: string[] = [];
  const entries = Object.entries(telemetry as unknown as Record<string, unknown>);
  for (const [key, value] of entries) {
    if (FORBIDDEN_PROJECTION_KEYS.includes(key as (typeof FORBIDDEN_PROJECTION_KEYS)[number])) {
      violations.push(`telemetry.${key}`);
    }
    if (typeof value === 'string' && key !== 'sessionId' && key !== 'encounterId' && key !== 'interactionId' && key !== 'choiceId' && key !== 'macroStage') {
      violations.push(`telemetry.${key} (unknown field)`);
    }
  }
  return violations;
}

/** CONTENT-015: typed behavior ID replaces prose advance/interaction. */
export function behaviorIdFor(macroStage: MacroStage, interaction: 'tap' | 'trace' | 'drag' | 'listen' | 'select'): string {
  return `${macroStage}_${interaction.toUpperCase()}`;
}

/** CONTENT-015: Stage-6 prose states map onto the canonical lifecycle at import. */
export function canonicalStageFromLegacy(legacy: 'draft' | 'validated' | 'reviewed' | 'approved'): ContentLifecycleStage {
  switch (legacy) {
    case 'draft': return 'STAGED';
    case 'validated': return 'VALIDATED';
    case 'reviewed': return 'HUMAN_REVIEWED';
    case 'approved': return 'APPROVED';
  }
}

/** Validator: at least one review per role, all four roles covered (CONTENT-015). */
export function reviewRoleViolations(evidence: ReviewEvidence[]): string[] {
  const seen = new Set(evidence.map((e) => e.role));
  const violations: string[] = [];
  for (const role of REVIEW_ROLES) {
    if (!seen.has(role)) violations.push(`missing review role: ${role}`);
  }
  if (evidence.some((e) => !e.reviewerId.trim())) violations.push('review evidence with empty reviewerId');
  return violations;
}

/** Validator: prerequisite DAG must be acyclic with all references present. */
export function prerequisiteViolations(edges: PrerequisiteEdge[], knownStationIds: Iterable<string>): string[] {
  const violations: string[] = [];
  const known = new Set(knownStationIds);
  for (const edge of edges) {
    if (!known.has(edge.fromStationId)) violations.push(`unknown prerequisite source: ${edge.fromStationId}`);
    if (!known.has(edge.toStationId)) violations.push(`unknown prerequisite target: ${edge.toStationId}`);
    if (edge.fromStationId === edge.toStationId) violations.push(`self-edge: ${edge.fromStationId}`);
  }
  // Cycle detection (DFS, iterative).
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    adjacency.set(edge.fromStationId, [...(adjacency.get(edge.fromStationId) ?? []), edge.toStationId]);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (node: string): void => {
    if (visited.has(node)) return;
    if (visiting.has(node)) {
      violations.push(`prerequisite cycle at ${node}`);
      return;
    }
    visiting.add(node);
    for (const next of adjacency.get(node) ?? []) visit(next);
    visiting.delete(node);
    visited.add(node);
  };
  for (const node of known) visit(node);
  return violations;
}

/** Validator: hints must never appear in P4/P5 content of a published package/projection (CONTENT-003). */
export function hintViolations(macroStages: readonly MacroStage[], payload: Record<string, unknown>): string[] {
  const violations: string[] = [];
  const touchesBannedStage = macroStages.some((stage) => HINT_BANNED_STAGES.includes(stage));
  if (!touchesBannedStage) return violations;
  const scan = (value: unknown, path: string): void => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => scan(item, `${path}[${index}]`));
      return;
    }
    if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        if (HINT_KEYS.includes(key as (typeof HINT_KEYS)[number])) violations.push(`${path}.${key}`);
        scan(child, `${path}.${key}`);
      }
    }
  };
  scan(payload, '$');
  return violations;
}

/** Deep-stripping projector: Authoring → Published (evaluator stays a server REFERENCE). */
export function publishForDelivery(authoring: AuthoringStation, packageVersion: number, checksum: string, macroStages: readonly MacroStage[], audioAssetIds: readonly string[]): PublishedStationPackage {
  const lifecycleViolations = reviewRoleViolations(authoring.reviewEvidence);
  if (lifecycleViolations.length > 0) throw new Error(`REVIEW_ROLES_INCOMPLETE: ${lifecycleViolations.join(', ')}`);
  if (authoring.lifecycle !== 'APPROVED' && authoring.lifecycle !== 'ENABLED') {
    throw new Error('PUBLISH_REJECTED: station is not APPROVED/ENABLED');
  }
  return {
    stationId: authoring.stationId,
    packageVersion,
    checksum,
    lifecycle: authoring.lifecycle,
    evaluatorServerRef: `server-evaluator://${authoring.stationId}`,
    audioAssetIds: [...audioAssetIds],
    prerequisites: authoring.prerequisites.map((edge) => ({ ...edge })),
    macroStages: [...macroStages],
  };
}

/** Deep-stripping projector: Published → Child (belt-and-braces allowlist shape). */
export function projectForChild(published: PublishedStationPackage, content: { prompt: string; visibleOptions: readonly string[]; interactionConfig: Record<string, unknown>; accessibilityCopy: string }): ChildLessonProjection {
  const projection: ChildLessonProjection = {
    stationId: published.stationId,
    packageVersion: published.packageVersion,
    macroStages: [...published.macroStages],
    prompt: content.prompt,
    visibleOptions: [...content.visibleOptions],
    interactionConfig: JSON.parse(JSON.stringify(content.interactionConfig)) as Record<string, unknown>,
    audioAssetIds: [...published.audioAssetIds],
    audioPolicy: AUDIO_POLICY,
    accessibilityCopy: content.accessibilityCopy,
  };
  const violations = projectionViolations(projection);
  if (violations.length > 0) throw new Error(`PROJECTION_CONTAMINATED: ${violations.join(', ')}`);
  return projection;
}

/** Final invariant scan: no forbidden key at any depth of a child projection. */
export function projectionViolations(projection: ChildLessonProjection): string[] {
  const violations: string[] = [];
  const scan = (value: unknown, path: string): void => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => scan(item, `${path}[${index}]`));
      return;
    }
    if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        if (FORBIDDEN_PROJECTION_KEYS.includes(key as (typeof FORBIDDEN_PROJECTION_KEYS)[number])) violations.push(`${path}.${key}`);
        scan(child, `${path}.${key}`);
      }
    }
  };
  scan(projection, '$');
  if (projection.macroStages.some((stage) => HINT_BANNED_STAGES.includes(stage))) {
    violations.push(...hintViolations(projection.macroStages, projection.interactionConfig).map((v) => `hint-in-P4/P5:${v}`));
  }
  return violations;
}
