/**
 * Client-boundary sanitiser for learning encounter payloads (wave A3, hardened to an
 * allowlist per ADR-0037 item 1.2 / START_HERE §11 phase 1.1-1.2).
 *
 * `content_versions.evaluator_config` holds the answer key (e.g. `expectedAnswers`). The
 * server-side evaluator consumes it inside the runtime RPCs; no client payload ever needs it.
 *
 * Two layers protect that boundary:
 * 1. A structural allowlist — only the enumerated encounter/content keys of the runtime RPC
 *    response shape (`runtime_create_encounter`, migration 0053) may leave the server. Unknown
 *    keys (today's or future evaluator fields) are dropped by construction.
 * 2. A forbidden-at-any-depth invariant — authored display containers (`presentation`,
 *    `options`, `questions`) pass through verbatim, but any key of the answer-key set is
 *    removed at every depth, so an authoring mistake can never become a leak.
 */

const CLIENT_ENCOUNTER_KEYS = new Set([
  'id',
  'sessionId',
  'sequence',
  'stationId',
  'skillId',
  'learningObjectiveId',
  'contentVersionId',
  'learningRole',
  'experienceForm',
  'status',
  'createdAt',
  'completedAt',
  'content',
]);

const CLIENT_CONTENT_KEYS = new Set([
  'id',
  'title',
  'prompt',
  'stationId',
  'skillId',
  'learningRole',
  'experienceForm',
  'interactionType',
  'contentVersionId',
  'presentation',
  'options',
  'questions',
  'visualCount',
]);

/** Authored display containers: values pass through, minus forbidden keys at any depth. */
const CLIENT_PASSTHROUGH_KEYS = new Set(['presentation', 'options', 'questions']);

const FORBIDDEN_AT_ANY_DEPTH = new Set<string>([
  // The contract list, spelled out so the boundary is auditable in one place:
  'expectedAnswer',
  'expectedAnswers',
  'expected_answers',
  'answerKey',
  'answer_key',
  'correctIndex',
  'correct_index',
  'correctOption',
  'correct_option',
  'solution',
  'evaluatorConfig',
  'evaluator_config',
  // Names observed in real leak reports (ADR-0037 item 1.1) beyond the contract list:
  'expectedIndex',
  'expected_index',
  'correctAnswer',
  'correct_answer',
  'scoringRubric',
  'scoring_rubric',
]);

function stripForbidden(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => stripForbidden(item));
  if (!value || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_AT_ANY_DEPTH.has(key)) continue;
    out[key] = stripForbidden(item);
  }
  return out;
}

function sanitizeLevel(value: unknown, allowed: Set<string>): unknown {
  if (Array.isArray(value)) return value.map((item) => sanitizeLevel(item, allowed));
  if (!value || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (!allowed.has(key) || FORBIDDEN_AT_ANY_DEPTH.has(key)) continue;
    if (CLIENT_PASSTHROUGH_KEYS.has(key)) {
      out[key] = stripForbidden(item);
    } else {
      out[key] = sanitizeLevel(item, key === 'content' ? CLIENT_CONTENT_KEYS : allowed);
    }
  }
  return out;
}

export function stripAnswerKeyFields(value: unknown): unknown {
  return sanitizeLevel(value, CLIENT_ENCOUNTER_KEYS);
}

export function toClientEncounter<T>(encounter: T): T {
  return stripAnswerKeyFields(encounter) as T;
}
