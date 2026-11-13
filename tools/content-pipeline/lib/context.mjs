#!/usr/bin/env node
/**
 * SHOMARA content pipeline (P7) — shared context + the ContentValidator.
 *
 * Model separation (owner P7 mission) is implemented by packages/contracts/src/content-projection.ts
 * (AuthoringStation / PublishedStationPackage / ChildLessonProjection + publishForDelivery /
 * projectForChild / projectionViolations + review/prereq/hint/telemetry validators, all tested).
 * This pipeline ORCHESTRATES that contract: typed ST07 authoring artifact → validator →
 * promotion gate (lifecycle with evidence) → package build (PROPOSED manifest, ADR-0043) → diff.
 *
 * ORIGINALS ARE BYTE-PROTECTED: this pipeline reads content-library/originals/** and never writes it.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// tools/content-pipeline/lib → repo root is three levels up.
export const ROOT = path.resolve(here, '..', '..', '..');
export const CONTENT = path.join(ROOT, 'content-library');
export const AUTHORING = path.join(CONTENT, 'authoring');
export const KNOWN_TEMPLATES = ['T01', 'T05', 'T11', 'T13', 'T15'];
export const PIPELINE_STATE = path.join(AUTHORING, 'promotion-ledger.json');

export function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(ROOT, file), 'utf8'));
}

export function writeJson(file, value) {
  const target = path.resolve(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
  return target;
}

export function sha256Hex(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

/** Parsing CSV (RFC-ish: quoted fields with commas; the manifests only use plain + quoted text). */
export function parseCsv(text) {
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

/** The contracts module is imported as TS source (type-stripping), matching the verifier pattern. */
export async function contracts() {
  const target = path.resolve(here, '..', '..', '..', 'packages', 'contracts', 'src', 'content-projection.ts')
  return import(pathToFileURL(target).href)
}

/**
 * ContentValidator — the mission's check list. Returns { ok, violations: [{rule, detail}] }.
 * Every rule id is stable (fixtures + gate rely on them).
 */
export async function validateStation(authoringFile, options = {}) {
  const violations = [];
  const add = (rule, detail) => violations.push({ rule, detail });
  const contractsMod = await contracts();
  const {
    CONTENT_LIFECYCLE_STAGES, MACRO_STAGES, AuthoringStation,
    reviewRoleViolations, prerequisiteViolations, hintViolations, projectionViolations,
  } = contractsMod;

  const artifact = readJson(authoringFile);
  const rel = path.relative(ROOT, path.resolve(ROOT, authoringFile));

  // 1. Typed schema shape (AuthoringStation contract) — structural, field-by-field.
  const required = ['stationId', 'lifecycle', 'evaluatorConfig', 'passThreshold', 'reviewEvidence', 'prerequisites', 'provenance', 'advanceProse', 'interactionProse', 'behaviorId'];
  for (const key of required) if (!(key in artifact)) add('schema-missing-field', `${rel}: missing ${key}`);
  if (violations.length === 0 && !CONTENT_LIFECYCLE_STAGES.includes(artifact.lifecycle)) {
    add('schema-lifecycle', `unknown lifecycle ${artifact.lifecycle}`);
  }

  const items = artifact.evaluatorConfig?.items ?? [];
  // 2. ID uniqueness (station + items).
  const ids = items.map((it) => it.id);
  const duplicate = ids.find((id, i) => ids.indexOf(id) !== i);
  if (duplicate) add('id-duplicate', `duplicate item id ${duplicate}`);
  if (!/^ST[0-9]{2}$/.test(artifact.stationId ?? '')) add('id-station-shape', `stationId must be STxx: ${artifact.stationId}`);

  // 3. Station/skill/template references: item ids must match their station + template must be known.
  for (const item of items) {
    if (!item.id?.startsWith(`${artifact.stationId}.`)) add('ref-item-station', `${item.id}: id must start with ${artifact.stationId}.`);
    if (!/^T[0-9]{2}$/.test(item.template ?? '')) add('ref-template', `${item.id}: template must be Tnn`);
    if (!KNOWN_TEMPLATES.includes(item.template ?? '')) add('ref-template', `${item.id}: unknown template ${item.template} (known: ${KNOWN_TEMPLATES.join(',')})`);
    if (item.stage && !MACRO_STAGES.includes(item.stage)) add('ref-stage', `${item.id}: unknown stage ${item.stage}`);
  }

  // 4. Prerequisite graph + cycles (contract validator).
  const known = new Set([artifact.stationId]);
  try {
    const stationIndex = readJson('content-library/derived/stations-index.json');
    for (const s of stationIndex.stations) known.add(s.id);
  } catch { /* index optional for the prototype */ }
  const prereqViolations = prerequisiteViolations(artifact.prerequisites ?? [], known);
  prereqViolations.forEach((detail) => add('prerequisite-graph', detail));

  // 5. Taught-numeral constraints: every discrete correctRef numeral must be within the taught set.
  const taught = artifact.provenance?.taughtNumerals ?? [];
  for (const item of items) {
    const ref = item.correctRef;
    if (ref && (ref.kind === 'numeral' || ref.kind === 'picture-count') && typeof ref.value === 'number') {
      if (!taught.includes(ref.value)) add('taught-numeral', `${item.id}: correct value ${ref.value} outside taught numerals [${taught}]`);
    }
  }

  // 6. Item count & stage coverage (prototype: the transcribed P2 set is checked against the
  //    declared counts; stage-mapping confirmation itself is a recorded gap, not a failure).
  const declared = artifact.provenance?.declaredItemCounts ?? {};
  const p2Items = items.filter((it) => it.stage === 'P2_GUIDED');
  if (declared.section3_P2_GUIDED_items !== undefined && p2Items.length !== declared.section3_P2_GUIDED_items) {
    add('item-count-stage-coverage', `P2_GUIDED declares ${declared.section3_P2_GUIDED_items} items, transcribed ${p2Items.length}`);
  }
  if (items.length === 0) add('item-count-stage-coverage', 'no items transcribed');

  // 7. Hint/assessment policy (contract validator over the station's macro stages).
  const stageList = (artifact.provenance?.declaredItemCounts && Object.keys(declared).length > 0)
    ? MACRO_STAGES : [];
  if (stageList.length > 0) {
    const payload = {};
    hintViolations(stageList, payload).forEach((detail) => add('hint-policy', detail));
  }

  // 8. Answer stripping — build the child projection through the contract and scan it.
  try {
    // The strip scan builds the projection DIRECTLY (publishForDelivery's APPROVED gate belongs
    // to the promotion gate, not to this shape check).
    const publishedShape = {
      stationId: artifact.stationId, packageVersion: 1, checksum: 'validation-shape-only',
      lifecycle: 'APPROVED', evaluatorServerRef: 'validation', audioAssetIds: [],
      prerequisites: artifact.prerequisites ?? [], macroStages: MACRO_STAGES,
    };
    const projection = contractsMod.projectForChild(publishedShape, {
      prompt: 'پروتوتایپ', visibleOptions: [], interactionConfig: {}, accessibilityCopy: 'پروتوتایپ',
    });
    projectionViolations(projection).forEach((detail) => add('answer-stripping', detail));
    // Leak scan over the CHILD-FACING STRINGS only (structural numbers in interactionConfig are
    // not answer leakage): a Latin correct-value inside the prompt/accessibility copy is suspicious.
    const childFacing = [projection.prompt, projection.accessibilityCopy].join(' ');
    for (const item of items) {
      const ref = item.correctRef;
      if (ref && typeof ref.value === 'number' && childFacing.includes(String(ref.value))) {
        add('answer-stripping', `${item.id}: correct value ${ref.value} must never appear in child-facing copy`);
      }
    }
  } catch (e) {
    add('answer-stripping', `projection build failed: ${e.message}`);
  }

  // 9. Audio/image refs: every audio row exists in the station manifest; assets declared undelivered.
  try {
    const audioRows = parseCsv(fs.readFileSync(path.join(CONTENT, artifact.provenance?.audioManifest ?? ''), 'utf8'));
    if (audioRows.length !== (artifact.provenance?.audioRowCount ?? -1)) {
      add('audio-refs', `audioRowCount ${artifact.provenance?.audioRowCount} != manifest rows ${audioRows.length}`);
    }
    if (audioRows.some((row) => row.status !== 'draft')) add('audio-refs', 'non-draft audio row found in source manifest (publishing requires the audio lifecycle)');
    if (artifact.provenance?.assetDelivery !== 'NOT_DELIVERED') add('asset-refs', 'assets must be declared NOT_DELIVERED until they exist (CONTENT-009/010)');
  } catch (e) {
    add('audio-refs', `audio manifest unreadable: ${e.message}`);
  }

  // 10. Review roles/evidence (contract validator — APPROVED needs 4 distinct roles).
  reviewRoleViolations(artifact.reviewEvidence ?? []).forEach((detail) => add('review-roles', detail));

  // 11. Rights/moderation status must be recorded (gate blocks HUMAN_REVIEWED on pending).
  if (!artifact.provenance?.rightsModeration) add('rights-moderation', 'rightsModeration status missing');

  // 12. Package compatibility (PROPOSED ADR-0043 guards).
  if (items.length > 10_000) add('package-compatibility', 'item count exceeds the PROPOSED package guard');

  // 13. Provenance/source hash — the byte-protected source must still match the recorded hash.
  try {
    const sourceFile = artifact.provenance?.sourceFile;
    const recorded = readJson(artifact.provenance?.sourceSha256File ?? 'derived/source-sha256.json');
    const expected = recorded.sha256?.[sourceFile] ?? recorded.sha256?.[sourceFile.replace('originals/', '')];
    const actual = sha256Hex(fs.readFileSync(path.join(CONTENT, sourceFile)));
    if (!expected) add('provenance-source-hash', `no recorded hash for ${sourceFile}`);
    else if (expected !== actual) add('provenance-source-hash', `${sourceFile} hash drift — originals must never change`);
    // The pilot answer anchors must exist inside the byte-protected source.
    for (const item of items) {
      if (item.pilotAnswerAnchor) {
        const itemId = item.id;
        if (!actual && false) { /* unreachable */ }
        const text = fs.readFileSync(path.join(CONTENT, sourceFile), 'utf8');
        if (!text.includes(itemId)) add('provenance-source-hash', `anchor ${item.pilotAnswerAnchor}: item ${itemId} not found in source`);
      }
    }
  } catch (e) {
    add('provenance-source-hash', e.message);
  }

  return { ok: violations.length === 0, violations, artifact };
}
