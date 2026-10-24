/**
 * Small in-process sliding-window limiter with a lockout.
 *
 * LIMITATION (documented in START_HERE, open item O-1): state lives in process memory, so on
 * serverless/multi-instance deployments each instance counts separately. It still blocks the
 * common brute-force case against a single instance; a shared store (Supabase table/RPC or edge KV)
 * is required for a global guarantee.
 */
interface Bucket { hits: number[]; lockedUntil: number }

const globalStore = globalThis as typeof globalThis & { __mathRateLimit?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = globalStore.__mathRateLimit ?? new Map();
globalStore.__mathRateLimit = buckets;

export interface RateLimitRule { max: number; windowMs: number; lockMs?: number }
export interface RateLimitResult { allowed: boolean; retryAfterSeconds: number }

export function checkRateLimit(key: string, rule: RateLimitRule, now = Date.now()): RateLimitResult {
  const bucket = buckets.get(key) ?? { hits: [], lockedUntil: 0 };
  if (bucket.lockedUntil > now) {
    buckets.set(key, bucket);
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000) };
  }
  bucket.hits = bucket.hits.filter((t) => now - t < rule.windowMs);
  if (bucket.hits.length >= rule.max) {
    bucket.lockedUntil = now + (rule.lockMs ?? rule.windowMs);
    buckets.set(key, bucket);
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000) };
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  if (buckets.size > 5000) pruneBuckets(now);
  return { allowed: true, retryAfterSeconds: 0 };
}

function pruneBuckets(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.lockedUntil <= now && bucket.hits.every((t) => now - t > 60 * 60 * 1000)) buckets.delete(key);
  }
}

export function resetRateLimitForTests(): void { buckets.clear(); }

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim() || 'unknown';
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
