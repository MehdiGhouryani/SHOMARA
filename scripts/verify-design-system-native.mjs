/**
 * N03-07 zero-raw-token guard for the Native design system (COMPONENT_READINESS «geometry از
 * token canonical، بدون magic value»).
 *
 * Scans the Kotlin sources of :core:designsystem and :app and fails on:
 *  - raw color literals (0xFFxxxxxx / Color(0x...)) outside the generated ShomaraTokens.kt;
 *  - raw dp/sp literals outside ShomaraTokens.kt (0.dp structural zeros are allowed);
 *  - raw FontWeight(n) constructions outside ShomaraTokens.kt;
 *  - banned child-safety terms (AGENTS rule 8) anywhere in the design system.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (message) => { console.error(`NATIVE_DESIGN_GUARD: FAIL — ${message}`); process.exit(1); };

const scanRoots = ['apps/android/core/designsystem/src/main/kotlin', 'apps/android/app/src/main/kotlin', 'apps/android/feature'];
const generatedFile = 'ShomaraTokens.kt';

const files = [];
for (const dir of scanRoots) {
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.kt') && !path.relative(root, full).split(path.sep).includes('test')) files.push(full);
    }
  };
  walk(dir);
}
if (files.length === 0) fail('no Kotlin files found to scan');

const allowed = new Set(['0.dp']);
const hexViolations = [];
const sizeViolations = [];
const weightViolations = [];
const termViolations = [];
const bannedTerms = [/ستاره/u, /\bstars?\b/i, /\bcoins?\b/i, /\bLives\b/, /سکه/u, /لیدربرد/u, /leaderboard/i, /loot/i];

for (const file of files) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const src = fs.readFileSync(file, 'utf8');
  const isGenerated = rel.endsWith(generatedFile);
  const lines = src.split(/\r?\n/);
  lines.forEach((line, i) => {
    const at = `${rel}:${i + 1}`;
    if (!isGenerated) {
      if (/Color\(0x|0xFF[0-9A-Fa-f]{6}/.test(line) && !line.trimStart().startsWith('//')) hexViolations.push(at);
      const sizeMatches = line.matchAll(/(\d+(?:\.\d+)?)\.(dp|sp)\b/g);
      for (const m of sizeMatches) if (!allowed.has(`${m[1]}.${m[2]}`)) sizeViolations.push(`${at} (${m[0]})`);
      if (/FontWeight\(\s*\d/.test(line)) weightViolations.push(at);
    }
    if (bannedTerms.some((rx) => rx.test(line))) termViolations.push(at);
  });
}

if (hexViolations.length) fail(`raw color literals outside ${generatedFile}: ${hexViolations.join(', ')}`);
if (sizeViolations.length) fail(`raw dp/sp literals outside ${generatedFile}: ${sizeViolations.join(', ')}`);
if (weightViolations.length) fail(`raw FontWeight constructions outside ${generatedFile}: ${weightViolations.join(', ')}`);
if (termViolations.length) fail(`banned child-safety terms in design system: ${termViolations.join(', ')}`);

console.log(`NATIVE_DESIGN_GUARD: PASS (${files.length} Kotlin files, zero raw tokens, zero banned terms)`);
