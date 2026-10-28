#!/usr/bin/env node
/**
 * P02-A evidence runner. Executes every reproducible engineering gate in order and
 * writes a JSON evidence record. It never converts a skipped/failed gate into PASS.
 * Usage: node scripts/run-p02-gates.mjs [--skip-install] [--with-mobile-export]
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = new Set(process.argv.slice(2));
const root = process.cwd();
const sh = (cmd) => spawnSync(cmd, { shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const version = (cmd) => { const r = sh(cmd); return r.status === 0 ? r.stdout.trim() : 'UNAVAILABLE'; };

const gates = [
  ['install', existsSync(join(root, 'package-lock.json')) ? 'npm ci' : 'npm install', !args.has('--skip-install')],
  ['build:packages', 'npm run build:packages', true],
  ['mobile:deps:check', 'npm run mobile:deps:check', true],
  ['typecheck:all', 'npm run typecheck:all', true],
  ['test:unit', 'npm run test:unit', true],
  ['verify:p01', 'npm run verify:p01', true],
  ['verify:p02', 'npm run verify:p02', true],
  ['verify:p03', 'npm run verify:p03', true],
  ['verify:migrations', 'npm run verify:migrations', true],
  ['verify:mobile-release', 'npm run verify:mobile-release', true],
  ['verify:static:all', 'npm run verify:static:all', true],
  ['build:web', 'npm run build:web', true],
  ['mobile:export', 'npx --workspace @math/mobile expo export --platform android', args.has('--with-mobile-export')],
];

const results = [];
for (const [id, cmd, enabled] of gates) {
  if (!enabled) { results.push({ id, cmd, status: 'NOT_RUN' }); console.log(`- ${id}: NOT_RUN`); continue; }
  const t0 = Date.now();
  const r = sh(cmd);
  const status = r.status === 0 ? 'PASS' : 'FAIL';
  results.push({ id, cmd, status, exitCode: r.status, ms: Date.now() - t0, tail: (r.stdout + r.stderr).split('\n').slice(-25).join('\n') });
  console.log(`- ${id}: ${status}`);
}

const record = {
  phase: 'P02-A',
  at: new Date().toISOString(),
  env: { node: process.version, npm: version('npm -v'), os: `${process.platform}-${process.arch}`, expo: version('npx --workspace @math/mobile expo --version') },
  lockfilePresent: existsSync(join(root, 'package-lock.json')),
  results,
  verdict: results.every((g) => g.status === 'PASS') ? 'ALL_GATES_PASS' : 'NOT_PASS',
};
const dir = join(root, 'artifacts', 'p02');
mkdirSync(dir, { recursive: true });
const out = join(dir, `p02-gates-${record.at.replace(/[:.]/g, '-')}.json`);
writeFileSync(out, JSON.stringify(record, null, 2));
console.log(`\nP02-A verdict: ${record.verdict}\nEvidence: ${out}`);
process.exitCode = record.verdict === 'ALL_GATES_PASS' ? 0 : 1;
