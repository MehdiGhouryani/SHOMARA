import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'playwright.config.ts',
  'e2e/web/critical-path.spec.ts',
  'e2e/web/api-critical-path.spec.ts',
  'scripts/performance/phase10-performance.mjs',
  'docs/api/API_E2E_RELEASE_CONTRACT.md',
  'docs/history/SNAPSHOT_MANIFEST_PHASE_10.json',
];
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) throw new Error(`Missing ${rel}`);
}
const specs = [
  fs.readFileSync(path.join(root, 'e2e/web/critical-path.spec.ts'), 'utf8'),
  fs.readFileSync(path.join(root, 'e2e/web/api-critical-path.spec.ts'), 'utf8'),
];
for (const source of specs) {
  for (const marker of ['test(', 'expect(', "'/api/v1/"]) {
    if (!source.includes(marker)) throw new Error(`E2E contract marker missing: ${marker}`);
  }
}
const perf = fs.readFileSync(path.join(root, 'scripts/performance/phase10-performance.mjs'), 'utf8');
for (const marker of ['FRAME_BUDGET_MS', 'MAX_SYNC_BATCH', 'CACHE_BUDGET_BYTES', 'PHASE10_SYNTHETIC_PERFORMANCE_PASS']) {
  if (!perf.includes(marker)) throw new Error(`Performance marker missing: ${marker}`);
}
const docs = fs.readFileSync(path.join(root, 'ROADMAP_PHASES.md'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'docs/qa/ANDROID_STORE_RELEASE_CHECKLIST.md'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'apps/mobile/src/performance/runtimeBudget.ts'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'scripts/performance/phase10-performance.mjs'), 'utf8');
for (const marker of ['FRAME_BUDGET_MS', '16.67', 'low-end Android', 'Pilot', 'No Unity']) {
  if (!docs.includes(marker)) throw new Error(`Phase 10 documentation marker missing: ${marker}`);
}
console.log('PHASE10_STATIC_VERIFICATION_PASS');
