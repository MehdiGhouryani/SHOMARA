/**
 * Client-boundary sanitizer for learning encounter payloads (wave A3).
 *
 * `content_versions.evaluator_config` holds the answer key (e.g. `expectedAnswers`). The
 * server-side evaluator consumes it inside the runtime RPCs; no client payload ever needs it
 * (the same boundary `FORBIDDEN_CLIENT_ANSWER_KEYS` in @math/contracts enforces for challenge
 * definitions). Server responses here strip those keys at every depth, keeping everything else
 * byte-for-byte intact, so learning truth stays server-authoritative while the answer key
 * never reaches the child client.
 */
const CLIENT_FORBIDDEN_KEYS = new Set([
  'evaluatorConfig',
  'evaluator_config',
  'expectedAnswers',
  'expected_answers',
  'answerKey',
  'answer_key',
  'correctIndex',
  'correctOption',
  'solution',
]);

export function stripAnswerKeyFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => stripAnswerKeyFields(item));
  if (!value || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (CLIENT_FORBIDDEN_KEYS.has(key)) continue;
    out[key] = stripAnswerKeyFields(item);
  }
  return out;
}

export function toClientEncounter<T>(encounter: T): T {
  return stripAnswerKeyFields(encounter) as T;
}
