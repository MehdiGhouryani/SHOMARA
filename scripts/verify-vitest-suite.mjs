#!/usr/bin/env node
/**
 * Static vitest suite integrity (P1, 2026-11-12): every test file that exists on disk must be
 * matched by at least one include glob in vitest.config.mjs. This closes the orphan-test gap
 * where RevealPrimitives.test.tsx existed but every include glob ended in .test.ts, so CI ran
 * 73 of 74 files while a verifier only checked the file's existence.
 *
 * Static only — it never spawns vitest and needs no browser. The glob translation mirrors the
 * tinyglobby semantics vitest uses for these patterns (**, *, {a,b}); a test file the config
 * cannot match is reported as an orphan and the verifier fails.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const configText = fs.readFileSync(path.join(root, 'vitest.config.mjs'), 'utf8');
const includeBlock = configText.match(/include:\s*\[([^\]]*)\]/s);
assert.ok(includeBlock, 'vitest.config.mjs must declare an include array');
const globs = [...includeBlock[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
assert.ok(globs.length > 0, 'vitest include array must not be empty');

function globToRegExp(glob) {
  let source = '';
  for (let i = 0; i < glob.length; i += 1) {
    const ch = glob[i];
    if (ch === '*') {
      if (glob[i + 1] === '*') {
        source += '.*';
        i += glob[i + 2] === '/' ? 2 : 1; // `**/` may also match zero segments
      } else {
        source += '[^/]*';
      }
    } else if (ch === '{') {
      const end = glob.indexOf('}', i);
      assert.ok(end > i, `unbalanced brace in glob: ${glob}`);
      source += `(?:${glob.slice(i + 1, end).split(',').join('|')})`;
      i = end;
    } else if ('\\^$.|?+()[]'.includes(ch)) {
      source += `\\${ch}`;
    } else {
      source += ch;
    }
  }
  return new RegExp(`^${source}$`);
}

const matchers = globs.map(globToRegExp);
const SKIP_DIRS = new Set(['node_modules', 'dist', 'e2e', 'build', '.turbo', '.cache']);
const testFilePattern = /\.(?:test|spec)\.(?:ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;

const orphans = [];
let scanned = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
    } else if (testFilePattern.test(entry.name)) {
      scanned += 1;
      const relative = path.relative(root, path.join(dir, entry.name)).split(path.sep).join('/');
      if (!matchers.some((re) => re.test(relative))) orphans.push(relative);
    }
  }
}
walk(path.join(root, 'packages'));
walk(path.join(root, 'apps'));

assert.ok(scanned > 0, 'no test files found under packages/ or apps/ — walker or layout changed');
assert.deepEqual(orphans, [], `orphan test files not matched by any vitest include glob: ${orphans.join(', ')}`);
console.log(`VITEST_SUITE: PASS (${scanned} test files on disk, ${globs.length} include globs, 0 orphans)`);
