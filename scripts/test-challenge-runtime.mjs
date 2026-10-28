#!/usr/bin/env node
/**
 * P04 executable gate: runs the Signature Challenge runtime unit tests on plain Node.
 * Bundles the vitest-style test file with esbuild (a transitive dev dependency of vitest/next)
 * and a small shim, so the behavioural tests run even before `npm install` (VD-003).
 * Fails loudly (never silently skips) when esbuild cannot be resolved.
 */
import { createRequire } from 'node:module';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const require = createRequire(join(root, 'package.json'));
let esbuild;
try { esbuild = require('esbuild'); } catch {
  console.error('ESBUILD_NOT_RESOLVABLE: run `npm install` (esbuild ships with vitest/next).');
  process.exit(2);
}
const files = ['packages/challenge-runtime/src/__tests__/challenge.test.ts'];
const out = mkdtempSync(join(tmpdir(), 'challenge-tests-'));
const shimUrl = pathToFileURL(resolve(root, 'scripts/lib/vitest-node-shim.mjs')).href;
let failed = 0;
try {
  for (const file of files) {
    const outfile = join(out, file.replace(/[\\/]/g, '_') + '.mjs');
    await esbuild.build({
      entryPoints: [resolve(root, file)],
      bundle: true, platform: 'node', format: 'esm', target: 'node20', outfile, logLevel: 'error',
      plugins: [{ name: 'vitest-shim', setup(b) { b.onResolve({ filter: /^vitest$/ }, () => ({ path: shimUrl, external: true })); } }],
      alias: {
        '@math/contracts': resolve(root, 'packages/contracts/src/index.ts'),
        '@math/learning-runtime': resolve(root, 'packages/learning-runtime/src/index.ts'),
      },
    });
    const shim = await import(shimUrl);
    await import(pathToFileURL(outfile).href);
    console.log(`# ${file}`);
    failed += await shim.run();
  }
} finally {
  rmSync(out, { recursive: true, force: true });
}
console.log(JSON.stringify({ gate: 'P04-CHALLENGE-RUNTIME-TESTS', status: failed ? 'FAIL' : 'PASS', failed }));
process.exitCode = failed ? 1 : 0;
