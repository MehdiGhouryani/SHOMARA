#!/usr/bin/env node
/**
 * Station-spec validator (DT-80/81) — the MACHINE behind stage6 §5's automatic rules.
 *
 * Until now the "گزارش اعتبارسنجی خودکار" section of a station spec was an unverified CLAIM.
 * This script makes it real. It cross-checks three artifacts per station:
 *   1. the spec markdown (audio table §۸, asset table §۹, item ids, templates, pool size);
 *   2. the audio manifest CSV (shape, TTS rules, forbidden words, word budgets, digit policy);
 *   3. the typed authoring JSON (item anchors exist in the spec, declared counts match reality).
 *
 * Rules implemented (stage6-spec-format.md §۵ — severity per the reference):
 *   ERROR  ascii digit or Latin letter in text_tts
 *   ERROR  forbidden word (غلط / اشتباه) in text_tts or text_display
 *   ERROR  text_tts longer than 10 words (kind nr: 14)
 *   ERROR  text_display longer than 10 words
 *   ERROR  displayed numeral beyond the station's policy (ST01..ST06: NO ascii digit at all;
 *          ST07+: only taught numerals may appear in text_display)
 *   ERROR  duplicate id (audio row, asset, item)
 *   ERROR  template outside T01..T15
 *   ERROR  reference to a missing audio line or asset
 *   ERROR  forbidden art element in an asset description (ستاره/تاج/سکه/جام/قلب/آتش as prize
 *          symbols — «ستارهٔ دریایی» as a natural scene object is allowed and checked contextually)
 *   ERROR  assessment pool smaller than 12 items
 *   WARN   audio line without any reference from the spec
 *
 * Usage: node scripts/verify-station-spec.mjs ST01 [ST07 …]
 * Without args it validates every authored station (authoring/stations/specs/*.md).
 * The ST07 pilot spec in originals/ can be passed explicitly; it is READ-ONLY (byte-protected)
 * and violations found there are reported as findings, never edited.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content-library');
const read = (p) => fs.readFileSync(path.resolve(ROOT, p), 'utf8');

const FORBIDDEN_WORDS = ['غلط', 'اشتباه'];
// Forbidden PRIZE/CELEBRATION art elements (product contract). The word-boundary guard keeps natural
// scene vocabulary honest: «جامدادی» (pencil case) is not a trophy «جام», and a «ستارهٔ دریایی»
// (starfish) is not a prize star. Verified against both the ST07 pilot and ST01 spec.
const FORBIDDEN_ART = [
  { word: 'ستاره', allow: ['ستارهٔ دریایی', 'ستاره‌ی دریایی', 'ستاره دریایی'] },
  { word: 'تاج' }, { word: 'سکه' }, { word: 'جام', boundary: true }, { word: 'قلب' }, { word: 'آتش' },
];
const TEMPLATES = new Set(Array.from({ length: 15 }, (_, i) => `T${String(i + 1).padStart(2, '0')}`));
// Stations that introduce no numeral glyphs (stage4: numerals start at ST07; ST01–ST06 display none).
const NO_NUMERAL_STATIONS = new Set(['ST01', 'ST02', 'ST03', 'ST04', 'ST05', 'ST06']);

const countWords = (s) => s.trim().split(/\s+/).filter(Boolean).length;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  const header = rows.shift().map((h) => h.replace(/^\uFEFF/, ''));
  return rows.filter((r) => r.some((c) => c.length > 0)).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

/** Extract the markdown table of a section like "## ۸. جدول صدا" (id | … ). */
function extractTable(md, sectionHeader) {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === sectionHeader || l.trim().startsWith(`${sectionHeader} `) || l.trim().startsWith(`${sectionHeader}‌`));
  if (start < 0) return [];
  const rows = [];
  let i = start + 1;
  while (i < lines.length && !/^##\s/.test(lines[i])) {
    const line = lines[i].trim();
    if (/^\|/.test(line) && !/^\|[\s|:-]+\|?$/.test(line)) {
      const cells = line.slice(1, line.endsWith('|') ? -1 : undefined).split('|').map((c) => c.trim());
      rows.push(cells);
    }
    i += 1;
  }
  return rows.slice(1); // drop the header row
}

function validateStation(stationId) {
  const errors = [];
  const warnings = [];
  const err = (rule, detail) => errors.push(`${rule}: ${detail}`);
  const warn = (rule, detail) => warnings.push(`${rule}: ${detail}`);

  const isPilot = stationId === 'ST07';
  const specPath = isPilot
    ? 'content-library/originals/shomara-stage7-pilot-ST07.md'
    : `content-library/authoring/stations/specs/${stationId}.md`;
  if (!fs.existsSync(path.join(ROOT, specPath))) { console.log(`SKIP ${stationId} (no spec)`); return { stationId, skipped: true }; }
  const md = read(specPath);

  // Typed JSON (optional at this stage): item anchors + declared counts + taughtNumerals come
  // from the transcription, so the policy needs no per-station hardcoded map here.
  const jsonPath = `content-library/authoring/stations/${stationId}.json`;
  const artifact = fs.existsSync(path.join(ROOT, jsonPath)) ? JSON.parse(read(jsonPath)) : null;
  const taughtNumerals = artifact?.provenance?.taughtNumerals ?? [];

  // ---------- 1. Audio manifest CSV ----------
  const manifestPath = isPilot
    ? 'content-library/originals/shomara-ST07-audio-manifest.csv'
    : `content-library/authoring/stations/specs/${stationId}-audio-manifest.csv`;
  const csvRows = parseCsv(read(manifestPath));
  const csvIds = new Set();
  for (const row of csvRows) {
    if (csvIds.has(row.id)) err('duplicate-audio-id', row.id);
    csvIds.add(row.id);
    if (row.status !== 'draft') err('audio-status', `${row.id}: non-draft row needs explicit review`);
    if (/[0-9]/.test(row.text_tts)) err('digit-in-tts', `${row.id}: "${row.text_tts}"`);
    if (/[A-Za-z]/.test(row.text_tts)) err('latin-in-tts', `${row.id}: "${row.text_tts}"`);
    const words = countWords(row.text_tts);
    const budget = row.kind === 'nr' ? 14 : 10;
    if (words > budget) err('tts-too-long', `${row.id}: ${words} words > ${budget}`);
    if (row.text_display && countWords(row.text_display) > 10) err('display-too-long', `${row.id}: ${countWords(row.text_display)} words > 10`);
    for (const w of FORBIDDEN_WORDS) {
      if (row.text_tts.includes(w) || (row.text_display || '').includes(w)) err('forbidden-word', `${row.id}: "${w}"`);
    }
    // Displayed-numeral policy.
    if (NO_NUMERAL_STATIONS.has(stationId)) {
      if (/[0-9]/.test(row.text_display || '')) err('displayed-numeral', `${row.id}: station ${stationId} displays no numerals at all`);
    } else {
      for (const m of (row.text_display || '').matchAll(/[0-9]+/g)) {
        if (!taughtNumerals.includes(Number(m[0]))) err('displayed-numeral', `${row.id}: numeral ${m[0]} not in taught [${taughtNumerals}]`);
      }
    }
  }

  // ---------- 2. The spec's own audio table (§۸) must match the CSV ----------
  // (one section per spec — the concat was a duplication bug caught on the ST07 pilot)
  const audioTable = extractTable(md, '## ۸. جدول صدا');
  const tableIds = new Set();
  for (const cells of audioTable) {
    const id = (cells[0] || '').replace(/[`]/g, '');
    if (tableIds.has(id)) err('duplicate-audio-id', `table ${id}`);
    tableIds.add(id);
    if (!csvIds.has(id)) err('audio-ref-missing', `table row ${id} absent from the manifest CSV`);
  }
  for (const id of csvIds) if (!tableIds.has(id)) err('audio-ref-missing', `CSV row ${id} absent from the spec §۸ table`);

  // ---------- 3. Asset table (§۹) ----------
  const assetTable = extractTable(md, '## ۹. دارایی‌ها');
  const assetIds = new Set();
  for (const cells of assetTable) {
    const id = (cells[0] || '').replace(/[`]/g, '');
    if (assetIds.has(id)) err('duplicate-asset-id', id);
    assetIds.add(id);
    const desc = cells.slice(2).join(' ');
    for (const { word, allow = [], boundary = false } of FORBIDDEN_ART) {
      if (desc.includes(word)) {
        const allowed = allow.some((a) => desc.includes(a))
          || (boundary && new RegExp(`${word}[\\u0621-\\u064A]`).test(desc)); // e.g. جام+دادی = جامدادی
        if (!allowed) err('forbidden-art', `${id}: "${word}" as a prize/celebration element`);
      }
    }
  }

  // ---------- 4. Item ids, templates, references ----------
  const mdBody = md;
  const itemIds = new Set();
  let duplicateItemId = null;
  for (const m of md.matchAll(/^- id: (ST\d{2}\.[A-Za-z0-9.]+)\s*$/gm)) {
    if (itemIds.has(m[1])) duplicateItemId = m[1];
    itemIds.add(m[1]);
  }
  if (duplicateItemId) err('duplicate-item-id', duplicateItemId);

  // Every template referenced in YAML blocks must be a defined one.
  for (const m of md.matchAll(/^\s+template: (T\d{2})\s*$/gm)) {
    if (!TEMPLATES.has(m[1])) err('unknown-template', m[1]);
  }

  // Every STxx.* / G.* / N.* audio reference in the spec must exist (station ids in the CSV;
  // global ids are the shared manifest's business, checked by verify-content-library).
  for (const m of md.matchAll(new RegExp(`(${stationId}\\.[A-Za-z0-9.]+)`, 'g'))) {
    const ref = m[1].replace(/\.$/, '');
    if (!csvIds.has(ref) && !itemIds.has(ref) && !assetIds.has(ref)) {
      // Not an audio/asset/item id — e.g. a skill id fragment; only ids with dots in known shapes count.
      if (/\.(pr|h1|h2|h3|ok|done|a|b|c|d|e)$/.test(ref)) err('audio-ref-missing', `spec references "${ref}" which is neither an audio row nor an item`);
    }
  }
  // Every OBJ.* / UI.* / PAT.* / GLYPH.* / CH.* reference must exist in the asset table. Wildcard
  // suffixes documented in the spec itself (the ST07 pilot declares `PAT.num*` / `GLYPH.*` in its
  // art-rules note) are resolved as prefixes: any concrete asset starting with the stem counts.
  // Bare stems (UI.card / UI.hand / CH.guide) count when at least one concrete variant exists.
  const seenRefs = new Map();
  for (const m of md.matchAll(/\b(OBJ|UI|PAT|GLYPH|CH)\.[A-Za-z0-9*]+/g)) {
    const ref = m[0].replace(/\.$/, '');
    seenRefs.set(ref, (seenRefs.get(ref) ?? 0) + 1);
  }
  for (const [ref] of seenRefs) {
    if (assetIds.has(ref)) continue;
    if (ref.endsWith('*')) {
      const stem = ref.slice(0, -1);
      if ([...assetIds].some((a) => a.startsWith(stem))) continue;
    } else if (ref.includes('.')) {
      // stem match: UI.card matches UI.card.numeral; only report when NO variant exists.
      const stem = `${ref}.`;
      if ([...assetIds].some((a) => a.startsWith(stem))) continue;
    }
    err('asset-ref-missing', `spec references "${ref}" absent from §۹`);
  }

  // Unreferenced audio rows (warning only, per stage6).
  for (const id of csvIds) {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const uses = (mdBody.match(new RegExp(escapedId, 'g')) || []).length;
    const asRow = (mdBody.match(new RegExp('^\\| `' + escapedId + '`', 'm')) || []).length;
    if (uses <= asRow) warn('audio-unreferenced', `${id} appears only in its own table row`);
  }

  // ---------- 5. Assessment pool ≥ 12 ----------
  const poolMatch = md.match(/## ۵\. بخش ۴[\s\S]*?```yaml([\s\S]*?)```/);
  if (poolMatch) {
    const familySizes = [...poolMatch[1].matchAll(/size: (\d+)/g)].map((m) => Number(m[1]));
    const total = familySizes.reduce((a, b) => a + b, 0);
    if (familySizes.length > 0 && total < 12) err('pool-too-small', `${familySizes.join('+')} = ${total} < 12`);
  }
  const poolItems = [...md.matchAll(/^- id: ST\d{2}\.F\d\./gm)].length;
  if (poolItems > 0 && poolItems < 12) err('pool-too-small', `${poolItems} pool items < 12`);

  // ---------- 6. Typed JSON cross-check ----------
  if (artifact) {
    for (const item of artifact.evaluatorConfig?.items ?? []) {
      if (!md.includes(item.id)) err('json-anchor', `${item.id} not found in the spec`);
    }
    const declared = artifact.provenance?.declaredItemCounts ?? {};
    const p2 = [...md.matchAll(/^- id: ST\d{2}\.P2\.i\d+/gm)].length;
    if (declared.section3_P2_GUIDED_items !== undefined && p2 !== declared.section3_P2_GUIDED_items) {
      err('count-drift', `declared P2 ${declared.section3_P2_GUIDED_items} vs spec ${p2}`);
    }
    const p1 = [...md.matchAll(/^- id: ST\d{2}\.P1\.s\d+/gm)].length;
    if (declared.section2_P1_DISCOVER_steps !== undefined && p1 !== declared.section2_P1_DISCOVER_steps) {
      err('count-drift', `declared P1 ${declared.section2_P1_DISCOVER_steps} vs spec ${p1}`);
    }
    const p5 = [...md.matchAll(/^- id: ST\d{2}\.P5\.i\d+/gm)].length;
    if (declared.section6_P5_or_assessment_items !== undefined && p5 !== declared.section6_P5_or_assessment_items) {
      err('count-drift', `declared P5 ${declared.section6_P5_or_assessment_items} vs spec ${p5}`);
    }
    const fItems = [...md.matchAll(/^- id: ST\d{2}\.F\d\./gm)].length;
    if (declared.section5_P4_pool_items !== undefined && fItems !== declared.section5_P4_pool_items) {
      err('count-drift', `declared pool ${declared.section5_P4_pool_items} vs spec ${fItems}`);
    }
    const rows = artifact.provenance?.audioRowCount;
    if (rows !== undefined && rows !== csvRows.length) err('count-drift', `declared audioRowCount ${rows} vs CSV ${csvRows.length}`);
  }

  return { stationId, errors, warnings, csvRows: csvRows.length, itemIds: itemIds.size };
}

const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const specsDir = path.join(CONTENT, 'authoring', 'stations', 'specs');
const specStations = fs.existsSync(specsDir)
  ? fs.readdirSync(specsDir).filter((f) => f.endsWith('.md')).map((f) => f.replace('.md', ''))
  : [];
// Default: every authored spec + the ST07 pilot (its spec lives in originals, byte-protected and
// read-only here). New stations join the default run the moment their spec file lands.
const stations = args.length > 0 ? args : [...new Set([...specStations, 'ST07'])];

let failed = 0;
for (const id of stations) {
  const r = validateStation(id);
  if (r.skipped) continue;
  const tag = r.errors.length === 0 ? 'PASS' : 'FAIL';
  console.log(`${tag}  station-spec ${id} — audio rows: ${r.csvRows}, unique item ids: ${r.itemIds}, errors: ${r.errors.length}, warnings: ${r.warnings.length}`);
  for (const e of r.errors) console.log(`  ERROR ${e}`);
  for (const w of r.warnings) console.log(`  warn  ${w}`);
  if (r.errors.length > 0) failed += 1;
}
if (failed > 0) {
  console.log(`STATION_SPEC: FAIL (${failed}/${stations.length} stations with errors)`);
  process.exit(1);
}
console.log(`STATION_SPEC: PASS (${stations.length} station spec(s) clean — stage6 §5 rules enforced by machine)`);
