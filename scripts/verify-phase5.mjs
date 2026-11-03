import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// Portability: grep(1) is not available on every host (Windows without Git usr/bin on PATH).
// Equivalent recursive scan implemented in Node with the SAME scope, exclusions and
// case-insensitivity as the previous `grep -Rni` invocation; severity is unchanged.
const EXCLUDED_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.gradle']);
const SCAN_ROOTS = ['apps', 'packages'];

function scanForbiddenReferences(needle, roots, excludedDirs) {
  const hits = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (excludedDirs.has(entry.name)) continue;
        walk(target);
      } else if (entry.isFile()) {
        const text = fs.readFileSync(target, 'utf8');
        const lines = text.split(/\r?\n/);
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(needle.toLowerCase())) {
            hits.push(`${path.relative(process.cwd(), target)}:${index + 1}:${line.trim()}`);
          }
        });
      }
    }
  };
  for (const root of roots) {
    const absolute = path.join(process.cwd(), root);
    if (fs.existsSync(absolute)) walk(absolute);
  }
  return hits;
}

const root = process.cwd();
const required = [
  'packages/learning-runtime/src/index.ts',
  'packages/learning-runtime/src/engine.ts',
  'packages/learning-runtime/src/evaluator.ts',
  'packages/learning-runtime/src/policies.ts',
  'packages/learning-runtime/src/repository.ts',
  'supabase/migrations/0023_learning_runtime_execution.sql',
  'apps/web/app/api/v1/learning/sessions/route.ts',
  'apps/web/app/api/v1/learning/sessions/[sessionId]/encounters/route.ts',
  'apps/web/app/api/v1/learning/attempts/submit/route.ts',
  'docs/api/API_LEARNING_RUNTIME_CONTRACT.md',
  'docs/adr/ADR-0003-server-authoritative-learning-runtime.md',
  'docs/history/PACKAGE_MANIFEST_PHASE_5.json',
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing: ${file}`);
}
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'packages/learning-runtime/package.json'), 'utf8'));
if (packageJson.name !== '@math/learning-runtime') throw new Error('Runtime package name mismatch');
const allFiles = fs.readdirSync(path.join(root, 'supabase/migrations')).sort();
if (!allFiles.includes('0023_learning_runtime_execution.sql')) throw new Error('Phase 5 migration missing');
for (const base of ['Unity', 'Unity3D']) {
  // Source scan only: generated Gradle output (apps/android/**/build, .gradle caches) is
  // reproducible tooling output, not implementation (AGENTS §4), and must not fail the scan
  // after a real `npm run android:gate` run.
  const hits = scanForbiddenReferences(base, SCAN_ROOTS, EXCLUDED_DIRS);
  if (hits.length > 0) throw new Error(`Forbidden Unity reference in implementation: ${hits.join('\n')}`);
}
execFileSync('node', ['scripts/runtime-tests.mjs'], { cwd: root, stdio: 'inherit' });
console.log('[PASS] Phase 5 static verification + runtime tests');
