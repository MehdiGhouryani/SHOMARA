#!/usr/bin/env node
/**
 * Verifier-verdict guard (DT-62) — the gates must be able to fail.
 *
 * Thirty-one verifiers collect failures into an array and keep running instead of stopping at the first one. That is
 * a reasonable style, but it is only honest if the final verdict reads that array. A verifier that records a failure
 * and prints PASS anyway is decorative: every green run of it means nothing, and nothing else in this repository would
 * ever notice.
 *
 * This is not hypothetical. Writing the audit that led to this file produced a false accusation first: the check only
 * recognised `process.exitCode = 1` and not `process.exit(1)`, so it named 31 healthy verifiers as suspects. The
 * lesson is the rule below and the shape of this file: look for BOTH ways a Node process reports failure, and refuse
 * to guess when a script's verdict cannot be located at all.
 *
 * Rules:
 *   1. A verifier that pushes into `failures` must read `failures.length` somewhere.
 *   2. It must also be able to exit non-zero - by `process.exit(<expr>)` or by assigning `process.exitCode`.
 *   3. Failures must be printed, not merely counted, so a red run says what is red.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const scriptsDir = path.join(root, 'scripts');
const files = fs.readdirSync(scriptsDir).filter((f) => f.endsWith('.mjs')).sort();

const problems = [];
const checked = [];
for (const file of files) {
  const body = fs.readFileSync(path.join(scriptsDir, file), 'utf8');
  const collects = /failures\s*\.\s*push\s*\(/.test(body);
  if (!collects) continue;
  checked.push(file);

  const readsArray = /failures\s*\.\s*length/.test(body);
  // Both spellings: `process.exitCode = 1` (assignment) and `process.exit(1)` (call).
  const canExitNonZero = /process\.exit(Code)?\s*[=(]/.test(body);
  const printsFailures = /console\.(error|log)\s*\(/.test(body);

  if (!readsArray) problems.push(`${file}: collects failures but never reads failures.length`);
  if (!canExitNonZero) problems.push(`${file}: collects failures but cannot exit non-zero`);
  if (!printsFailures) problems.push(`${file}: collects failures but prints nothing`);
}

for (const p of problems) console.error(`  ${p}`);
assert.equal(
  problems.length,
  0,
  `${problems.length} verifier(s) can record a failure and still report success`,
);

console.log(`VERIFIER_VERDICTS: PASS (${checked.length} verifiers collect failures, all of them can fail honestly)`);
