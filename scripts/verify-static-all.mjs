#!/usr/bin/env node
/**
 * Runs every executable static/regression verifier in scripts/ and fails if any is red.
 * Script names are tool names only (ROADMAP_PHASES.md 0.10.1); they never define phase order.
 * Some verifiers import package dist/ output, so run `npm run build:packages` first.
 *
 * P1 (2026-11-12): `--core` runs the same discovery minus the BROWSER-GATED verifiers only
 * (Chromium-dependent flows/parity — see browserGated below). `verify:static:all` (default)
 * still runs everything; `verify:static:core` exists so CI can make the non-browser static
 * gates REQUIRED while browser flows stay informational until the runner is stable.
 * The browser list is pinned here, not derived by import sniffing.
 */
import { readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const coreMode = process.argv.slice(2).includes('--core');
// Excluded: dev.mjs is a dev server, generate-design-system-css.mjs and parity-goldens.mjs are GENERATORS (they
// rewrite generated output; goldens must only change deliberately via `npm run parity:goldens`, guarded by
// verify-parity-goldens-pinned.mjs), run-p02-gates.mjs is orchestrated separately, probe-v2-widths.mjs is the
// responsive 360/390/412 probe TOOL (minutes of Chromium per run — executed and recorded per batch, like the
// generators), verify-android-environment.mjs and android-build.mjs are fail-closed HOST BUILD tools (run explicitly and in Native CI,
// not an environment-independent static verifier), and this file cannot run itself.
const excluded = new Set(['android-build.mjs', 'dev.mjs', 'generate-design-system-css.mjs', 'parity-goldens.mjs', 'run-p02-gates.mjs', 'verify-static-all.mjs', 'verify-android-environment.mjs', 'probe-v2-widths.mjs']);
// Verifiers that import scripts/lib/browser.mjs (@playwright/test chromium) or playwright directly.
// These FAIL honestly without Chromium (no skip) — in --core mode they are out of scope, in the
// default mode and in the informational CI job they still run.
const browserGated = new Set(['flow-run.mjs', 'flow-path-run.mjs', 'flow-station-run.mjs', 'flow-tabs-run.mjs', 'parity-run.mjs', 'verify-phase10.mjs']);
if (coreMode) for (const name of browserGated) excluded.add(name);
const needsDist = ['learning-runtime', 'offline-sync', 'adult-projections', 'assignment-runtime']
  .filter((p) => !existsSync(join(root, 'packages', p, 'dist', 'index.js')));
if (needsDist.length) {
  console.error(`Missing package build output for: ${needsDist.join(', ')}. Run \`npm run build:packages\` first.`);
  process.exit(2);
}
const scripts = readdirSync(join(root, 'scripts')).filter((f) => f.endsWith('.mjs') && !excluded.has(f)).sort();
// Some verifiers import contracts .ts source directly (type stripping). That is unflagged on Node >= 22.18
// (the documented toolchain, see AGENTS.md); older 22.x needs the experimental flag to run the same checks.
const [major, minor] = process.versions.node.split('.').map(Number);
const nodeFlags = major === 22 && minor < 18 ? ['--experimental-strip-types'] : [];
if (nodeFlags.length) console.log(`note: Node ${process.versions.node} < 22.18 — running verifiers with --experimental-strip-types`);
const results = scripts.map((file) => {
  // Browser-backed scripts (parity, flow-*) launch Chromium; on slow or loaded Windows machines two of them
  // were observed dying mid-run at the 120s ceiling while passing standalone in ~30s (wave E, 2026-10-27).
  // 300s is headroom only — no assertion, threshold or expectation changes.
  const r = spawnSync(process.execPath, [...nodeFlags, join('scripts', file)], { cwd: root, encoding: 'utf8', timeout: 300_000 });
  const ok = r.status === 0;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) console.log((r.stdout + r.stderr).split('\n').slice(-12).join('\n'));
  return ok;
});
const failed = results.filter((ok) => !ok).length;
console.log(`\n${coreMode ? 'STATIC_CORE' : 'STATIC_ALL'}: ${failed === 0 ? 'PASS' : 'FAIL'} (${results.length - failed}/${results.length})${coreMode ? ' [browser-gated excluded: ' + browserGated.size + ' — still required in verify:static:all]' : ''}`);
process.exitCode = failed === 0 ? 0 : 1;
