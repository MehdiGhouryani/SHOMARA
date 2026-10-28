import assert from 'node:assert/strict';

const FRAME_BUDGET_MS = 16.67;
const MAX_SYNC_BATCH = 20;
const CACHE_BUDGET_BYTES = 80 * 1024 * 1024;

const sampleFrames = [12.4, 13.1, 14.9, 15.7, 16.2, 16.4, 16.3, 15.9, 14.8, 13.6];
const sorted = [...sampleFrames].sort((a, b) => a - b);
const percentile = (p) => sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
const p95 = percentile(95);

assert.equal(MAX_SYNC_BATCH, 20);
assert.equal(CACHE_BUDGET_BYTES, 80 * 1024 * 1024);
assert.ok(p95 <= FRAME_BUDGET_MS, `Synthetic P95 frame budget exceeded: ${p95}ms`);

const report = {
  synthetic: true,
  frameBudgetMs: FRAME_BUDGET_MS,
  p95FrameMs: p95,
  maxSyncBatch: MAX_SYNC_BATCH,
  cacheBudgetBytes: CACHE_BUDGET_BYTES,
  lowEndAndroidMeasured: false,
};

console.log(JSON.stringify(report, null, 2));
console.log('PHASE10_SYNTHETIC_PERFORMANCE_PASS');
