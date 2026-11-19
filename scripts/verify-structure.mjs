#!/usr/bin/env node
/**
 * Structure gate — keeps the repository's shape a rule instead of a habit.
 *
 * Every cleanup round in this repository ended the same way: files were deleted and folders merged by hand,
 * nothing stopped the next round from re-growing them. This verifier states the shape once and fails when the
 * tree drifts from it.
 *
 * Four rules, each one learned from a real defect found in this repo:
 *   1. Top-level entries are an allowlist. A new root folder should be a decision, not an accident.
 *   2. Every Gradle module that settings.gradle.kts includes must contain at least one Kotlin source file.
 *      :core:testing was included for weeks after its only file was deleted, and nothing noticed.
 *   3. Every Kotlin file's `package` must match its directory under kotlin/. The invariant held by luck.
 *   4. No tracked file may look like a backup or editor leftover (`*~`, `*.bak`, `.DS_Store`, ...).
 *
 * Deliberately NOT asserted here: how many files a folder holds. A Kotlin package directory with one file is
 * correct, and a rule that pushes files together to satisfy a count would damage the package==path invariant
 * this file exists to protect.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const fail = (msg) => {
  console.error(`STRUCTURE: FAIL — ${msg}`);
  process.exitCode = 1;
};
const ok = (msg) => console.log(`  ok  ${msg}`);

const tracked = execSync('git ls-files', { cwd: root, encoding: 'utf8' })
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);

// ---------------------------------------------------------------- 1. top-level allowlist
const allowedTopLevel = new Set([
  '.github', 'apps', 'content-library', 'design', 'docs', 'e2e', 'harness', 'packages',
  'scripts', 'supabase', 'tools',
]);
const allowedRootFiles = new Set([
  '.editorconfig', '.env.example', '.gitattributes', '.gitignore', '.npmrc', '.nvmrc',
  'AGENTS.md', 'README.md', 'ROADMAP_PHASES.md', 'START_HERE.md', 'ZCODE.md',
  'package-lock.json', 'package.json', 'playwright.config.ts', 'tsconfig.base.json', 'vitest.config.mjs',
]);

const topLevel = new Set(tracked.map((f) => (f.includes('/') ? f.split('/')[0] : f)));
for (const entry of topLevel) {
  // A dot does not make an entry a file: `.github` is a folder. Ask the tree instead of guessing.
  const isFolder = statSync(join(root, entry), { throwIfNoEntry: false })?.isDirectory() ?? false;
  if (isFolder) {
    if (!allowedTopLevel.has(entry)) fail(`unexpected top-level folder "${entry}" — add it here deliberately`);
  } else if (!allowedRootFiles.has(entry)) {
    fail(`unexpected root file "${entry}" — move it into a folder or add it deliberately`);
  }
}
ok(`top-level entries within the allowlist (${topLevel.size})`);

// ---------------------------------------------------------------- 2. no empty Gradle module
const settings = readFileSync(join(root, 'apps/android/settings.gradle.kts'), 'utf8');
const modules = [...settings.matchAll(/include\("(:[^"]+)"\)/g)].map((m) => m[1]);
const moduleDir = (m) => join(root, 'apps/android', m.replace(/:/g, '/'));
let empties = 0;
for (const m of modules) {
  const dir = moduleDir(m);
  const sources = tracked.filter((f) => f.startsWith(relative(root, dir).split(sep).join('/') + '/') && f.endsWith('.kt'));
  if (sources.length === 0) {
    fail(`module ${m} is included but contains no Kotlin source`);
    empties += 1;
  }
}
if (empties === 0) ok(`every included module has Kotlin source (${modules.length} modules)`);

// ---------------------------------------------------------------- 3. package matches path
const kotlinFiles = tracked.filter((f) => f.includes('/src/') && f.endsWith('.kt') && f.includes('/kotlin/'));
let mismatched = 0;
for (const f of kotlinFiles) {
  // A UTF-8 BOM in front of `package` would make the match below silently miss, leaving the file unchecked.
  // Strip it, and treat "no package declaration" as a failure rather than a skip, so the check cannot be
  // bypassed by a file it merely fails to parse.
  const body = readFileSync(join(root, f), 'utf8').replace(/^\uFEFF/, '');
  const decl = body.match(/^package\s+([\w.]+)/m);
  const expected = f.split('/kotlin/')[1].split('/').slice(0, -1).join('.');
  if (!decl) {
    fail(`no package declaration found in ${f} (expected ${expected})`);
    mismatched += 1;
    if (mismatched > 5) break;
    continue;
  }
  if (decl[1] !== expected) {
    fail(`package/path mismatch: ${f} declares ${decl[1]} but sits in ${expected}`);
    mismatched += 1;
    if (mismatched > 5) break;
  }
}
if (mismatched === 0) ok(`package declarations match their paths (${kotlinFiles.length} files)`);

// ---------------------------------------------------------------- 4. no backup or editor leftovers
const junk = /(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini)$|~$|\.(bak|orig|rej|swp|tmp)$|(^|\/)#.*#$/;
const junkHits = tracked.filter((f) => junk.test(f));
if (junkHits.length) {
  for (const f of junkHits.slice(0, 10)) fail(`backup/editor leftover is tracked: ${f}`);
} else {
  ok('no tracked backup or editor leftovers');
}

console.log(`STRUCTURE: ${process.exitCode ? 'FAIL' : 'PASS'} (${tracked.length} files, ${modules.length} modules)`);
