export const FRAME_BUDGET_MS = 16.67;
export const MAX_SYNC_BATCH = 20;
export const DEFAULT_CONTENT_CACHE_BUDGET_BYTES = 80 * 1024 * 1024;

export interface FrameSample { durationMs: number; recordedAt: number; }

export function isWithinFrameBudget(sample: FrameSample): boolean {
  return sample.durationMs <= FRAME_BUDGET_MS;
}

export function percentile(samples: FrameSample[], p: number): number {
  if (samples.length === 0) return 0;
  const sorted = samples.map((x) => x.durationMs).sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index] ?? 0;
}
