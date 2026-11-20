#!/usr/bin/env node
/**
 * verify-magic-squares.mjs — every T08 (magic square) block in authored station specs
 * must have a machine-verified UNIQUE solution: the givens admit exactly one completion
 * under the block's rule (3x3: rows+cols; 4x4: rows+cols+2x2 boxes).
 *
 * Usage: node scripts/verify-magic-squares.mjs [STxx ...]   (default: all authoring specs)
 * Exit 0 = all unique; exit 1 = any duplicate-solution, invalid, or mismatched block.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SPECS_DIR = path.resolve(here, '..', 'content-library', 'authoring', 'stations', 'specs');

const args = process.argv.slice(2);
const stations = args.length ? args : readdirSync(SPECS_DIR)
  .filter((f) => /^ST\d{2}\.md$/.test(f))
  .map((f) => f.replace(/\.md$/, ''));

/** Count completions of a partial n x n grid. rules: {rows, cols, boxes}. Returns -1 for invalid givens. */
function solveCount(n, givens, { boxes }) {
  const boxSize = boxes ? Math.sqrt(n) : n; // boxes only used when exact sqrt exists
  const useBoxes = boxes && Number.isInteger(boxSize) && boxSize > 1 && boxSize < n;
  const row = Array(n).fill(0), col = Array(n).fill(0), box = Array(n).fill(0);
  const grid = Array.from({ length: n }, () => Array(n).fill(-1));
  const boxIdx = (r, c) => useBoxes ? Math.floor(r / boxSize) * boxSize + Math.floor(c / boxSize) : 0;
  for (const g of givens) {
    if (g.r < 0 || g.r >= n || g.c < 0 || g.c >= n || g.v < 0 || g.v >= n) return -1;
    const bit = 1 << g.v, b = boxIdx(g.r, g.c);
    if (grid[g.r][g.c] !== -1) { if (grid[g.r][g.c] !== g.v) return -1; continue; }
    grid[g.r][g.c] = g.v;
    if (row[g.r] & bit || col[g.c] & bit || (useBoxes && box[b] & bit)) return -1;
    row[g.r] |= bit; col[g.c] |= bit; if (useBoxes) box[b] |= bit;
  }
  let count = 0;
  const bt = (i) => {
    if (count > 1) return;
    if (i === n * n) { count += 1; return; }
    const r = Math.floor(i / n), c = i % n, b = boxIdx(r, c);
    if (grid[r][c] !== -1) { bt(i + 1); return; }
    for (let v = 0; v < n; v += 1) {
      const bit = 1 << v;
      if (row[r] & bit || col[c] & bit || (useBoxes && box[b] & bit)) continue;
      grid[r][c] = v; row[r] |= bit; col[c] |= bit; if (useBoxes) box[b] |= bit;
      bt(i + 1);
      grid[r][c] = -1; row[r] &= ~bit; col[c] &= ~bit; if (useBoxes) box[b] &= ~bit;
      if (count > 1) return;
    }
  };
  bt(0);
  return count;
}

/** Parse `key: [[a, b], [c, d]]` nested-array value from a single line (bare-word tokens). */
function parseMatrix(line) {
  const m = line.match(/\[\s*\[(.*)\]\s*\]/);
  if (!m) return null;
  return m[1].split('],').map((row) => row.replace(/[[\]]/g, '').split(',').map((t) => t.trim()).filter(Boolean));
}

/** Extract T08 blocks with id + solution + given from spec text. */
function extractBlocks(text) {
  const blocks = [];
  const lines = text.split(/\r?\n/);
  let cur = null;
  for (const line of lines) {
    const idm = line.match(/^- id: (ST\d{2}\.[A-Za-z0-9.]+)\s*$/);
    if (idm) { cur = { id: idm[1], template: null, size: null, rule: [], symbols: [], solution: null, given: null }; blocks.push(cur); continue; }
    if (!cur) continue;
    const tpl = line.match(/^\s+template: (T\d{2})\s*$/);
    if (tpl) cur.template = tpl[1];
    const size = line.match(/^\s+size: (\d)\s*$/);
    if (size) cur.size = Number(size[1]);
    const rule = line.match(/^\s+rule: \[(.*)\]\s*$/);
    if (rule) cur.rule = rule[1].split(',').map((s) => s.trim());
    const syms = line.match(/^\s+symbols: \[(.*)\]\s*$/);
    if (syms) cur.symbols = syms[1].split(',').map((s) => s.trim().replace(/^PAT\./, ''));
    const sol = line.match(/^\s+solution: /);
    if (sol) { const mx = parseMatrix(line); if (mx) cur.solution = mx; }
    const giv = line.match(/^\s+given: \[(.*)\]\s*$/);
    if (giv) {
      cur.given = giv[1].split('},').map((s) => {
        const r = s.match(/r:\s*(\d+)/)[1], c = s.match(/c:\s*(\d+)/)[1], sm = s.match(/s:\s*PAT\.(\w+)/)[1];
        return { r: Number(r) - 1, c: Number(c) - 1, sym: sm };
      });
    }
  }
  return blocks.filter((b) => b.template === 'T08' && b.solution && b.given);
}

let failures = 0, checked = 0;
for (const st of stations) {
  const file = path.join(SPECS_DIR, `${st}.md`);
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { console.error(`FAIL  ${st}: spec not found (${file})`); failures += 1; continue; }
  const blocks = extractBlocks(text);
  if (!blocks.length) { console.log(`SKIP  ${st}: no T08 blocks with solution+given`); continue; }
  for (const b of blocks) {
    checked += 1;
    const n = b.size || b.solution.length;
    if (n !== b.solution.length || b.solution.some((row) => row.length !== n)) { console.error(`FAIL  ${b.id}: solution is not ${n}x${n}`); failures += 1; continue; }
    const idx = new Map(b.symbols.map((s, i) => [s, i]));
    if (idx.size !== n) { console.error(`FAIL  ${b.id}: needs ${n} distinct symbols, got ${idx.size}`); failures += 1; continue; }
    // Full-solution validity + given consistency
    const full = [];
    for (let r = 0; r < n; r += 1) for (let c = 0; c < n; c += 1) {
      const v = idx.get(b.solution[r][c]);
      if (v === undefined) { console.error(`FAIL  ${b.id}: solution symbol "${b.solution[r][c]}" not in symbols list`); failures += 1; r = n; break; }
      full.push({ r, c, v });
    }
    const useBoxes = b.rule.includes('box2x2') || n === 4;
    const fullCount = solveCount(n, full, { boxes: useBoxes });
    if (fullCount !== 1) { console.error(`FAIL  ${b.id}: solution grid itself violates the rule (count=${fullCount})`); failures += 1; continue; }
    const badGiven = b.given.find((g) => idx.get(g.sym) !== idx.get(b.solution[g.r][g.c]));
    if (badGiven) { console.error(`FAIL  ${b.id}: given (${g0fmt(badGiven)}) contradicts solution`); failures += 1; continue; }
    const count = solveCount(n, b.given.map((g) => ({ r: g.r, c: g.c, v: idx.get(g.sym) })), { boxes: useBoxes });
    if (count !== 1) { console.error(`FAIL  ${b.id}: givens admit ${count} completions (must be exactly 1)`); failures += 1; continue; }
    console.log(`OK    ${b.id}: unique solution (${n}x${n}${useBoxes ? ', rows+cols+boxes' : ', rows+cols'})`);
  }
}
function g0fmt(g) { return `r${g.r + 1},c${g.c + 1}=${g.sym}`; }

if (!checked) { console.log('MAGIC_SQUARES: PASS (no T08 blocks found)'); process.exit(0); }
if (failures) { console.error(`MAGIC_SQUARES: FAIL (${failures} of ${checked} blocks invalid or non-unique)`); process.exit(1); }
console.log(`MAGIC_SQUARES: PASS (${checked} block(s) unique — stage6 rule: no guessing)`);
