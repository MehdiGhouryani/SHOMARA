// Content-spec validator (phase P4, spec R-08): reproduces the 11 validation rules of
// docs/content-spec/grade1/shomara-stage6-spec-format.md §5 against the ST07 pilot's YAML blocks and both
// audio CSVs, and self-tests the same rule engine on negative fixtures (each must trigger exactly one rule).
// Rule ids match the spec table order: R1..R11 (R10 is a warning, the rest are errors).
// Usage: node scripts/verify-content-spec.mjs            (validate the real files + self-test fixtures)
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = process.cwd();
const SPEC = path.join(ROOT, 'docs/content-spec/grade1');
const read = (p) => fs.readFileSync(p, 'utf8');

// ---------- parsing ----------
function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    const row = {};
    header.forEach((h, i) => { row[h] = (cells[i] ?? '').trim(); });
    return row;
  });
}

function extractYamlBlocks(md) {
  const blocks = [];
  const re = /```yaml\r?\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(md)) !== null) blocks.push({ raw: m[1], startLine: md.slice(0, m.index).split('\n').length });
  return blocks.map((b) => ({ ...b, data: yaml.load(b.raw) }));
}

function extractMdTable(md, headingRe, idFirstColRe) {
  // The markdown table under a heading matching headingRe; rows whose first cell matches idFirstColRe.
  const at = md.search(headingRe);
  if (at < 0) return [];
  const rows = [];
  let started = false;
  for (const line of md.slice(at).split(/\r?\n/)) {
    if (started && line.startsWith('#')) break; // the next section heading ends the table
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 3 || line.includes('---')) continue;
    const id = cells[1].replace(/`/g, '');
    if (idFirstColRe.test(id)) {
      rows.push({ id, cells: cells.slice(2, -1).map((c) => c.replace(/`/g, '')) });
      started = true;
    }
  }
  return rows;
}

// ---------- the 11 rules ----------
const FORBIDDEN_WORDS = ['غلط', 'اشتباه'];
const FORBIDDEN_ART = ['ستاره', 'تاج', 'سکه', 'جام', 'قلب', 'آتش'];
const TEMPLATE_OK = /^T(0[1-9]|1[0-5])$/;
const wordCount = (t) => (t.trim() ? t.trim().split(/\s+/).length : 0);
const digitToEn = (t) => t.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

export function validateContentSpec(input) {
  const errors = [];
  const warnings = [];
  const err = (rule, msg) => errors.push({ rule, msg });
  const warn = (rule, msg) => warnings.push({ rule, msg });

  const stationCsv = input.stationCsv.map((r) => ({ ...r, source: 'station-csv' }));
  const globalCsv = input.globalCsv.map((r) => ({ ...r, source: 'global-csv' }));
  const allLines = [...stationCsv, ...globalCsv];

  // R1: no digits or Latin letters in spoken text.
  for (const row of allLines) {
    if (/[0-9A-Za-z]/.test(row.text_tts ?? '')) err('R1', `${row.source} ${row.id}: Latin letter or digit in text_tts "${row.text_tts}"`);
  }
  // R2: forbidden words in spoken or display text.
  for (const row of allLines) {
    for (const field of ['text_tts', 'text_display']) {
      for (const w of FORBIDDEN_WORDS) {
        if ((row[field] ?? '').includes(w)) err('R2', `${row.source} ${row.id}: forbidden word "${w}" in ${field}`);
      }
    }
  }
  // R3: spoken text word budget (10; problem narration "nr" 14).
  for (const row of allLines) {
    const limit = row.kind === 'nr' ? 14 : 10;
    if (wordCount(row.text_tts ?? '') > limit) err('R3', `${row.source} ${row.id}: text_tts has ${wordCount(row.text_tts ?? '')} words (limit ${limit})`);
  }
  // R4: display text word budget (10).
  for (const row of allLines) {
    if (wordCount(row.text_display ?? '') > 10) err('R4', `${row.source} ${row.id}: text_display has ${wordCount(row.text_display ?? '')} words (limit 10)`);
  }
  // R5: display numerals must be within the station's taught numbers.
  const allowed = input.allowedNumerals ?? [];
  const maxAllowed = allowed.length ? Math.max(...allowed) : -1;
  for (const row of stationCsv) {
    for (const num of digitToEn(row.text_display ?? '').match(/\d+/g) ?? []) {
      if (Number(num) > maxAllowed) err('R5', `station-csv ${row.id}: display numeral ${num} exceeds the station's taught numbers (${allowed.join(',') || 'none'})`);
    }
  }
  // R6: no duplicate ids (audio lines, assets, items).
  const yamlItemIds = [];
  for (const block of input.yamlBlocks) {
    const walk = (node) => {
      if (Array.isArray(node)) { node.forEach(walk); return; }
      if (node && typeof node === 'object') {
        if (typeof node.id === 'string') yamlItemIds.push(node.id);
        Object.values(node).forEach(walk);
      }
    };
    walk(block.data);
  }
  const assetIds = input.assets.map((a) => a.id);
  const itemUniverse = new Set(yamlItemIds);
  const seen = new Map();
  for (const id of [...allLines.map((r) => r.id), ...assetIds, ...yamlItemIds]) {
    seen.set(id, (seen.get(id) ?? 0) + 1);
    if (seen.get(id) === 2) err('R6', `duplicate id "${id}"`);
  }
  // R7: game templates must be T01..T15 (yaml template values + the roster in the identity block).
  for (const block of input.yamlBlocks) {
    const walk = (node, key) => {
      if (Array.isArray(node)) { node.forEach((n) => walk(n, key)); return; }
      if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) {
          if (k === 'template' || k === 'templates') {
            const values = Array.isArray(v) ? v : [v];
            for (const t of values) if (typeof t === 'string' && !TEMPLATE_OK.test(t)) err('R7', `template "${t}" is outside T01..T15 (yaml block at line ${block.startLine})`);
          }
          walk(v, k);
        }
      }
    };
    walk(block.data, null);
  }
  // R8: every audio/asset reference must exist. Audio refs may end with ".*" (a family of shared lines).
  const audioUniverse = new Set(allLines.map((r) => r.id));
  const assetUniverse = new Set(assetIds);
  const refSeen = new Set();
  const familyOk = (ref) => [...audioUniverse].some((id) => id.startsWith(ref.slice(0, -1)));
  for (const block of input.yamlBlocks) {
    const walk = (node, parentKey) => {
      if (Array.isArray(node)) { node.forEach((n) => walk(n, parentKey)); return; }
      if (node && typeof node === 'object') { for (const [k, v] of Object.entries(node)) walk(v, k); return; }
      if (typeof node !== 'string' || parentKey === 'id') return; // ids declare, they do not reference
      for (const ref of node.match(/(ST\d{2}|G|N|O|W)\.[A-Za-z0-9._*-]+/g) ?? []) {
        if (ref.endsWith('.*')) {
          if (!familyOk(ref)) err('R8', `audio family "${ref}" has no lines (yaml block at line ${block.startLine})`);
        } else if (!audioUniverse.has(ref) && !itemUniverse.has(ref)) {
          err('R8', `audio line "${ref}" does not exist (yaml block at line ${block.startLine})`);
        }
        refSeen.add(ref.endsWith('.*') ? ref.slice(0, -1) : ref);
      }
      for (const ref of node.match(/(OBJ|GLYPH|UI|PAT|CH)\.[A-Za-z0-9._-]+/g) ?? []) {
        if (!assetUniverse.has(ref)) err('R8', `asset "${ref}" is not declared in the assets table (yaml block at line ${block.startLine})`);
      }
    };
    walk(block.data);
  }
  // R9: no forbidden art elements in asset descriptions (whole tokens: «جام» in «جامدادی» is a pencil case).
  const ZWNJ = String.fromCharCode(8204);
  for (const asset of input.assets) {
    const tokens = (asset.desc ?? '').split(/[\s،؛:.()«»\-]+/).flatMap((t) => t.split(ZWNJ));
    for (const w of FORBIDDEN_ART) {
      if (tokens.includes(w)) err('R9', `asset ${asset.id}: forbidden art element "${w}" in description`);
    }
  }
  // R10 (warning): every station audio line should be referenced somewhere in the yaml.
  for (const row of stationCsv) {
    if (!refSeen.has(row.id) && ![...refSeen].some((r) => row.id.startsWith(r))) {
      warn('R10', `station line ${row.id} is not referenced by any yaml block`);
    }
  }
  // R11: the section-4 pool must hold at least 12 items.
  if (input.poolCount !== null && input.poolCount < 12) err('R11', `the section-4 pool has ${input.poolCount} items (minimum 12)`);

  return { errors, warnings };
}

// ---------- fixtures: each must trigger exactly one rule ----------
const FIXTURES = path.join(ROOT, 'scripts/fixtures/content-spec');
function runFixture(name) {
  const dir = path.join(FIXTURES, name);
  const md = read(path.join(dir, 'station.md'));
  const blocks = extractYamlBlocks(md);
  const csv = parseCsv(read(path.join(dir, 'station.csv')));
  return validateContentSpec({
    stationCsv: csv,
    globalCsv: [],
    yamlBlocks: blocks,
    assets: extractMdTable(md, /^## ۹/m, /^(OBJ|GLYPH|UI|PAT|CH)\./).map(({ id, cells }) => ({ id, desc: cells[1] ?? '' })),
    allowedNumerals: [1, 2],
    poolCount: Number(md.match(/pool-count: (\d+)/)?.[1] ?? 12),
  });
}

function selfTest() {
  const expected = fs.readdirSync(FIXTURES).sort();
  let failed = 0;
  for (const name of expected) {
    const rule = name.replace(/^fixture-/, '');
    const { errors, warnings } = runFixture(name);
    const triggered = [...errors.map((e) => e.rule), ...warnings.map((w) => w.rule)];
    const ok = triggered.length === 1 && triggered[0] === rule;
    console.log(`${ok ? 'PASS' : 'FAIL'} fixture ${name} → ${triggered.join(',') || 'nothing'} (expected ${rule})`);
    if (!ok) failed += 1;
  }
  return failed;
}

// ---------- the real ST07 pilot ----------
const stationMd = read(path.join(SPEC, 'shomara-stage7-pilot-ST07.md'));
const stationCsv = parseCsv(read(path.join(SPEC, 'shomara-ST07-audio-manifest.csv')));
const globalCsv = parseCsv(read(path.join(SPEC, 'shomara-global-audio-manifest.csv')));
const yamlBlocks = extractYamlBlocks(stationMd);
const identity = yamlBlocks[0]?.data ?? {};
const assets = extractMdTable(stationMd, /^## ۹\. دارایی/m, /^(OBJ|GLYPH|UI|PAT|CH)\./).map(({ id, cells }) => ({ id, desc: cells[1] ?? '' }));
// The section-4 pool items: the yaml block that follows the draw_rule block (a bare list of items).
const poolBlock = yamlBlocks.find((b) => Array.isArray(b.data) && b.raw.includes('ST07.F1.'));
const poolCount = poolBlock ? poolBlock.data.length : null;

const fixtureFailures = selfTest();
const { errors, warnings } = validateContentSpec({
  stationCsv,
  globalCsv,
  yamlBlocks,
  assets,
  allowedNumerals: Array.isArray(identity.audio_policy?.display_numerals_allowed) ? identity.audio_policy.display_numerals_allowed : [],
  poolCount,
});

console.log(`\nST07: ${stationCsv.length} station lines, ${globalCsv.length} global lines, ${yamlBlocks.length} yaml blocks, ${assets.length} assets, pool items: ${poolCount}`);
for (const e of errors) console.log(`ERROR ${e.rule} ${e.msg}`);
for (const w of warnings) console.log(`WARN  ${w.rule} ${w.msg}`);
const fail = fixtureFailures + errors.length;
console.log(`\nCONTENT_SPEC: ${fail === 0 ? 'PASS' : 'FAIL'} (errors ${errors.length}, warnings ${warnings.length}, fixtures ${expectedFixtureCount() - fixtureFailures}/${expectedFixtureCount()})`);
process.exit(fail === 0 ? 0 : 1);

function expectedFixtureCount() { return fs.readdirSync(FIXTURES).length; }
