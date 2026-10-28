const isProduction = process.env.NODE_ENV === 'production';

export function assertLearningRuntimeBackendReady(): void {
  if (isProduction && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    throw new Error('SUPABASE_CONFIG_MISSING');
  }
  if (isProduction && process.env.MATH_RUNTIME_BACKEND !== 'postgres') {
    throw new Error('RUNTIME_BACKEND_NOT_CONFIGURED');
  }
}

/**
 * The adult-projection and assignment repositories currently exist ONLY as in-memory
 * implementations. Env flags alone must never make production claim readiness: data would be
 * lost on restart and differ between serverless instances. Until a persistent repository ships
 * (flip these constants), production fails closed. ALLOW_EPHEMERAL_ADULT_STORE=1 is an explicit,
 * deliberate override for staging demos only.
 */
const PERSISTENT_ADULT_REPO_IMPLEMENTED = false;
const PERSISTENT_ASSIGNMENT_REPO_IMPLEMENTED = false;

function ephemeralStoreAcknowledged(): boolean {
  return process.env.ALLOW_EPHEMERAL_ADULT_STORE === '1';
}

export function assertAdultProjectionBackendReady(): void {
  if (!isProduction) return;
  if (!PERSISTENT_ADULT_REPO_IMPLEMENTED && !ephemeralStoreAcknowledged()) throw new Error('ADULT_BACKEND_NOT_CONFIGURED');
  if (process.env.MATH_ADULT_BACKEND !== 'postgres' || process.env.MATH_ADULT_PROJECTION_REPO !== 'supabase-rest-v1') {
    throw new Error('ADULT_BACKEND_NOT_CONFIGURED');
  }
}

export function assertAssignmentBackendReady(): void {
  if (!isProduction) return;
  if (!PERSISTENT_ASSIGNMENT_REPO_IMPLEMENTED && !ephemeralStoreAcknowledged()) throw new Error('ASSIGNMENT_BACKEND_NOT_CONFIGURED');
  if (process.env.MATH_ASSIGNMENT_BACKEND !== 'postgres' || process.env.MATH_ASSIGNMENT_REPO !== 'supabase-rest-v1') {
    throw new Error('ASSIGNMENT_BACKEND_NOT_CONFIGURED');
  }
}

export function assertContentBackendReady(): void {
  if (isProduction && process.env.MATH_CONTENT_BACKEND !== 'postgres') {
    throw new Error('CONTENT_BACKEND_NOT_CONFIGURED');
  }
}

