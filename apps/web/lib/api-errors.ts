export function apiErrorStatus(error: unknown): number {
  const typedCode = error instanceof Error ? (error as unknown as { code?: unknown }).code : undefined;
  const code = error instanceof Error ? (typeof typedCode === 'string' ? typedCode : error.message) : 'UNKNOWN_ERROR';
  if (code === 'AUTH_BEARER_REQUIRED' || code === 'AUTH_INVALID_TOKEN' || code === 'AUTH_PROVIDER_ERROR' || code === 'AUTH_REQUIRED' || code === 'DEV_PRINCIPAL_REQUIRED' || code === 'DEV_ACCOUNT_PRINCIPAL_REQUIRED' || code.startsWith('SUPABASE_RPC_401') || code.startsWith('SUPABASE_REST_401')) return 401;
  if (code === 'ROLE_REQUIRED' || code.endsWith('CONTEXT_MISMATCH') || code === 'FORBIDDEN' || code === 'FORBIDDEN_CLASS' || code === 'LEARNER_OUTSIDE_CLASS' || code === 'RELATIONSHIP_CONTEXT_FORBIDDEN' || code === 'CLIENT_INSTALLATION_FORBIDDEN' || code.startsWith('SUPABASE_RPC_403') || code.startsWith('SUPABASE_REST_403')) return 403;
  if (code.endsWith('NOT_FOUND') || code === 'INSTANCE_NOT_FOUND' || code === 'ASSIGNMENT_NOT_FOUND' || code === 'SESSION_NOT_FOUND' || code === 'JUMP_ASSESSMENT_NOT_FOUND' || code === 'PACKAGE_NOT_FOUND') return 404;
  if (code === 'INVALID_INSTANCE_STATUS' || code === 'INVALID_RECHECK_STATUS' || code === 'SESSION_ABANDONED' || code === 'SESSION_NOT_ACTIVE' || code === 'JUMP_PREREQUISITE_NOT_MET' || code === 'ENCOUNTER_SEQUENCE_CONFLICT' || code === 'IDEMPOTENCY_CONTEXT_MISMATCH') return 409;
  if (code === 'CONTENT_NOT_PRODUCTION_APPROVED' || code === 'CONTENT_PRESENTATION_MISSING' || code === 'CONTENT_PRESENTATION_INVALID' || code === 'SUPABASE_CONFIG_MISSING' || code === 'RUNTIME_BACKEND_NOT_CONFIGURED' || code === 'ADULT_BACKEND_NOT_CONFIGURED' || code === 'ASSIGNMENT_BACKEND_NOT_CONFIGURED' || code === 'CONTENT_BACKEND_NOT_CONFIGURED' || code.startsWith('SUPABASE_RPC_5') || code.startsWith('SUPABASE_REST_5') || code === 'ASSIGNMENT_BACKEND_NOT_CONFIGURED' || code === 'CONTENT_BACKEND_NOT_CONFIGURED') return 503;
  return 400;
}

/**
 * Client-safe error message. Known machine codes (and typed runtime errors) are returned as-is;
 * anything unrecognised (internal exceptions) is replaced by a generic message so internals never leak.
 */
export function publicErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return 'REQUEST_FAILED';
  const typedCode = (error as { code?: unknown }).code;
  if (typeof typedCode === 'string') return typedCode;
  return apiErrorStatus(error) === 400 && !/^[A-Z][A-Z0-9_]+$/.test(error.message) ? 'REQUEST_FAILED' : error.message;
}
