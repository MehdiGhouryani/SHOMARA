import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

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
  try {
    const hits = execFileSync('grep', ['-Rni', '--exclude-dir=node_modules', '--exclude-dir=.next', '--exclude-dir=dist', base, 'apps', 'packages'], { cwd: root, encoding: 'utf8' });
    if (hits.trim()) throw new Error(`Forbidden Unity reference in implementation: ${hits}`);
  } catch (error) {
    if (error?.status === 1) continue;
    throw error;
  }
}
execFileSync('node', ['scripts/runtime-tests.mjs'], { cwd: root, stdio: 'inherit' });
console.log('[PASS] Phase 5 static verification + runtime tests');
