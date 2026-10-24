#!/usr/bin/env node
/**
 * Runs every executable static/regression verifier in scripts/ and fails if any is red.
 * Script names are tool names only (ROADMAP_PHASES.md 0.10.1); they never define phase order.
 * Some verifiers import package dist/ output, so run `npm run build:packages` first.
 */
import { readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const excluded = new Set(['dev.mjs', 'generate-design-system-css.mjs', 'run-p02-gates.mjs', 'verify-static-all.mjs']);
const needsDist = ['learning-runtime', 'offline-sync', 'adult-projections', 'assignment-runtime']
  .filter((p) => !existsSync(join(root, 'packages', p, 'dist', 'index.js')));
if (needsDist.length) {
  console.error(`Missing package build output for: ${needsDist.join(', ')}. Run \`npm run build:packages\` first.`);
  process.exit(2);
}
const scripts = readdirSync(join(root, 'scripts')).filter((f) => f.endsWith('.mjs') && !excluded.has(f)).sort();
const results = scripts.map((file) => {
  const r = spawnSync(process.execPath, [join('scripts', file)], { cwd: root, encoding: 'utf8', timeout: 120_000 });
  const ok = r.status === 0;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) console.log((r.stdout + r.stderr).split('\n').slice(-12).join('\n'));
  return ok;
});
const failed = results.filter((ok) => !ok).length;
console.log(`\nSTATIC_ALL: ${failed === 0 ? 'PASS' : 'FAIL'} (${results.length - failed}/${results.length})`);
process.exitCode = failed === 0 ? 0 : 1;
