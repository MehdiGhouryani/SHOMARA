#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { buildBookPagesIndex, buildCurriculumIndex, expectedIndexes } from './generate-content-indexes.mjs';

const root = process.cwd();
const library = path.join(root, 'content-library');
const read = (relative) => fs.readFileSync(path.join(library, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));

assert.ok(fs.existsSync(library), 'content-library is missing');
assert.ok(!fs.existsSync(path.join(root, 'CONTENT_LIBRARY')), 'obsolete CONTENT_LIBRARY path returned');

const hashes = json('derived/source-sha256.json').sha256;
const originalNames = fs.readdirSync(path.join(library, 'originals')).sort();
assert.deepEqual(originalNames, Object.keys(hashes).sort(), 'original inventory differs from recorded provenance');
for (const [name, expected] of Object.entries(hashes)) {
  const bytes = fs.readFileSync(path.join(library, 'originals', name));
  const actual = crypto.createHash('sha256').update(bytes).digest('hex');
  assert.equal(actual, expected, `byte-protected original changed: ${name}`);
}

const stations = json('derived/stations-index.json').stations;
const patterns = json('derived/game-patterns-index.json').patterns;
const audio = json('derived/audio-index.json');
const audit = json('derived/source-audit.json');
assert.equal(stations.length, 25);
assert.equal(new Set(stations.map(({ id }) => id)).size, 25);
assert.equal(patterns.length, 15);
assert.equal(new Set(patterns.map(({ id }) => id)).size, 15);
assert.equal(audit.inventory.originalFiles, 10);
assert.equal(audit.inventory.bookUnits, 25);
assert.equal(audit.inventory.workPages, 150);
assert.equal(audit.inventory.proposedSkills, 100);
assert.equal(audit.inventory.completePilotStations.join(','), 'ST07');
assert.equal(audit.inventory.remainingStationSpecs, 24);
assert.equal(audit.inventory.audioBinaries, 0);
assert.equal(buildBookPagesIndex().pages.length, 150);
assert.equal(buildCurriculumIndex().stations.flatMap(({ skills }) => skills).length, 100);
for (const [name, expected] of expectedIndexes()) {
  const file = path.join(library, 'derived', name);
  assert.ok(fs.existsSync(file), `missing generated index: ${name}`);
  assert.equal(fs.readFileSync(file, 'utf8'), expected, `generated index drift: ${name}`);
}

let audioRows = 0;
const allAudioIds = new Set();
for (const [name, metadata] of Object.entries(audio.manifests)) {
  const text = read(`originals/${name}`).replace(/^\uFEFF/, '');
  const lines = text.trim().split(/\r?\n/);
  assert.equal(lines[0], 'id,kind,text_display,text_tts,voice,rate,status,used_by,notes');
  assert.equal(lines.length - 1, metadata.count);
  for (const line of lines.slice(1)) {
    const fields = line.split(',');
    assert.equal(fields.length, 9, `unsupported CSV shape in ${name}`);
    assert.equal(fields[6], 'draft', `non-draft source row needs explicit review: ${fields[0]}`);
    assert.ok(!allAudioIds.has(fields[0]), `duplicate audio ID: ${fields[0]}`);
    allAudioIds.add(fields[0]);
  }
  audioRows += metadata.count;
}
assert.equal(audioRows, 232);
assert.equal(audit.inventory.audioMetadataRows, audioRows);
assert.equal(audio.uniqueAcrossFiles, true);

const issueIds = audit.issues.map(({ id }) => id);
assert.deepEqual(issueIds, Array.from({ length: 18 }, (_, index) => `CONTENT-${String(index + 1).padStart(3, '0')}`));
assert.equal(new Set(issueIds).size, issueIds.length);
assert.ok(audit.issues.some(({ type, status }) => type === 'SOURCE_CONFLICT' && status === 'OPEN'));
const sourceAudit = read('integration/SOURCE_AUDIT.md');
for (const issueId of issueIds) assert.ok(sourceAudit.includes(`\`${issueId}\``), `${issueId} missing from human-readable source audit`);

const authoringGaps = read('integration/AUTHORING_CONTRACT_GAPS.md');
for (const requiredBoundary of [
  'AuthoringStation',
  'PublishedStationPackage',
  'ChildLessonProjection',
  'audio asset',
  'RBAC',
  'answer-stripping',
]) assert.ok(authoringGaps.includes(requiredBoundary), `authoring contract boundary missing: ${requiredBoundary}`);

const stage4 = read('originals/shomara-stage4-architecture.md');
const stage5 = read('originals/shomara-stage5-shared-references.md');
const stage6 = read('originals/shomara-stage6-spec-format.md');
const stage7 = read('originals/shomara-stage7-pilot-ST07.md');
assert.ok(stage4.includes('۵ سؤال و قبولی ۴ از ۵'), 'CONTENT-002 evidence changed');
assert.ok(stage7.includes('question_count: 1'), 'CONTENT-002 pilot evidence changed');
assert.ok(stage5.includes('خط راست از پایین به بالا برای ۱ پذیرفته'), 'CONTENT-001 evidence changed');
assert.ok(stage7.includes('فلش جهت (بالا به پایین)'), 'CONTENT-001 pilot evidence changed');
assert.ok(stage5.includes('draft` ← `generated` ← `listened` ← `approved'), 'CONTENT-013 audio lifecycle evidence changed');
assert.ok(stage6.includes('draft | validated | reviewed | approved'), 'CONTENT-015 station lifecycle evidence changed');
assert.ok(stage5.includes('۹×۹ (ST12 به بعد)'), 'CONTENT-016 curriculum-scope evidence changed');
assert.ok(stage5.includes('صدا همیشه موجود باشد'), 'CONTENT-017 T11 evidence changed');
assert.ok(stage5.includes('itemId، پاسخ، درست؟، مدت'), 'CONTENT-018 telemetry evidence changed');

for (const required of [
  'INTEGRATION_GATE.md',
  'integration/REPO_COMPATIBILITY.md',
  'integration/SOURCE_AUDIT.md',
  'integration/PHASE_INTEGRATION.md',
  'integration/AUTHORING_CONTRACT_GAPS.md',
]) assert.ok(fs.existsSync(path.join(library, required)), `missing ${required}`);

const allowedExtensions = new Set(['.md', '.csv', '.json']);
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else assert.ok(allowedExtensions.has(path.extname(entry.name)), `unexpected binary/artifact in content-library: ${path.relative(root, target)}`);
  }
};
walk(library);

console.log(`CONTENT_LIBRARY: PASS (${originalNames.length} protected originals, ${stations.length} stations, ${patterns.length} patterns, ${audioRows} draft audio rows, ${issueIds.length} audited issues)`);
console.log('NOTE: source validation does not imply curriculum, pronunciation, asset, child-test or production approval.');
