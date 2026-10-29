#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const library = path.join(root, 'content-library');
const originals = path.join(library, 'originals');
const derived = path.join(library, 'derived');

const toAsciiNumber = (value) => Number(value.replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))));
const stable = (value) => `${JSON.stringify(value, null, 2)}\n`;

export function buildBookPagesIndex() {
  const source = fs.readFileSync(path.join(originals, 'shomara-stage1-study.md'), 'utf8');
  const pages = Array.from(source.matchAll(/^### (U(\d{2})-P(\d{2})) · (.+?) \(PDF ([۰-۹0-9]+)\)$/gm), (match) => ({
    id: match[1],
    unit: Number(match[2]),
    pageInUnit: Number(match[3]),
    title: match[4],
    pdfPage: toAsciiNumber(match[5]),
  }));
  assert.equal(pages.length, 150, 'stage1 must yield exactly 150 work pages');
  assert.equal(new Set(pages.map(({ id }) => id)).size, 150, 'stage1 page IDs must be unique');
  return {
    schemaVersion: 1,
    generatedFrom: 'originals/shomara-stage1-study.md',
    sourceState: 'SOURCE_ONLY',
    pages,
  };
}

export function buildCurriculumIndex() {
  const source = fs.readFileSync(path.join(originals, 'shomara-stage4-architecture.md'), 'utf8');
  const headings = Array.from(source.matchAll(/^### (ST\d{2}) · (.+)$/gm));
  const stations = headings.map((heading, index) => {
    const start = heading.index + heading[0].length;
    const end = index + 1 < headings.length ? headings[index + 1].index : source.indexOf('\n## ۷.', start);
    const body = source.slice(start, end < 0 ? source.length : end);
    const chapter = body.match(/- \*\*فصل:\*\*\s*([۰-۹0-9]+)/);
    const bookUnit = body.match(/\*\*بخش کتاب:\*\*\s*([۰-۹0-9]+)/);
    const plate = body.match(/لوحه PDF ([۰-۹0-9]+)/);
    const workPages = body.match(/صفحه‌های کار PDF ([^)]+)/);
    const prerequisiteLine = body.match(/- \*\*پیش‌نیاز:\*\*\s*(.+)/);
    const representations = body.match(/- \*\*نمایش‌ها:\*\*\s*(.+)/);
    const skills = Array.from(body.matchAll(/- `(SK-ST\d{2}-\d+)`\s+(.+)/g), (match) => ({ id: match[1], text: match[2].trim() }));
    assert.ok(chapter && bookUnit && plate && workPages && prerequisiteLine && representations, `incomplete station card ${heading[1]}`);
    assert.equal(skills.length, 4, `${heading[1]} must define four skills`);
    return {
      id: heading[1],
      workingTitle: heading[2].trim(),
      chapter: toAsciiNumber(chapter[1]),
      bookUnit: toAsciiNumber(bookUnit[1]),
      platePdfPage: toAsciiNumber(plate[1]),
      workPagesPdf: workPages[1].trim(),
      prerequisites: Array.from(prerequisiteLine[1].matchAll(/ST\d{2}/g), (match) => match[0]),
      representations: representations[1].split('←').map((value) => value.trim()),
      hasNamingMismatch: body.includes('**ناهمخوانی نام:**'),
      skills,
      approval: 'unverified',
    };
  });
  assert.equal(stations.length, 25, 'stage4 must yield exactly 25 stations');
  assert.equal(stations.flatMap(({ skills }) => skills).length, 100, 'stage4 must yield exactly 100 skills');
  assert.deepEqual(stations.map(({ bookUnit }) => bookUnit), Array.from({ length: 25 }, (_, index) => index + 1));
  return {
    schemaVersion: 1,
    generatedFrom: 'originals/shomara-stage4-architecture.md',
    sourceState: 'SOURCE_ONLY',
    stations,
  };
}

export function expectedIndexes() {
  return new Map([
    ['book-pages-index.json', stable(buildBookPagesIndex())],
    ['curriculum-index.json', stable(buildCurriculumIndex())],
  ]);
}

function run(mode) {
  assert.ok(['--check', '--write'].includes(mode), 'usage: generate-content-indexes.mjs --check|--write');
  for (const [name, expected] of expectedIndexes()) {
    const file = path.join(derived, name);
    if (mode === '--write') fs.writeFileSync(file, expected);
    else {
      assert.ok(fs.existsSync(file), `missing generated index ${name}`);
      assert.equal(fs.readFileSync(file, 'utf8'), expected, `generated index drift: ${name}`);
    }
  }
  console.log(`CONTENT_INDEXES: PASS (${mode === '--write' ? 'generated' : 'no drift'}; 150 pages, 25 stations, 100 skills)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run(process.argv[2] ?? '--check');
