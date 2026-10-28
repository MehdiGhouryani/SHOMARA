#!/usr/bin/env node
/**
 * Phase B — path orientation gate (where am I / what next).
 */
import { isWaived, waiverNote } from './lib/path-waivers.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const failures = [];
const ok = (m) => console.log(`PASS  ${m}`);
const fail = (m) => {
  failures.push(m);
  console.error(`FAIL  ${m}`);
};

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

for (const rel of [
  'packages/contracts/src/path2.ts',
  'packages/contracts/src/path-focus.test.ts',
  'apps/mobile/app/(tabs)/index.tsx',
]) {
  if (!exists(rel)) fail(`MISSING:${rel}`);
}
ok('required files present');

const path2 = await import(pathToFileURL(path.join(root, 'packages/contracts/src/path2.ts')).href);
if (typeof path2.buildPathFocus !== 'function') fail('MISSING_BUILD_PATH_FOCUS');
if (!path2.PATH_NODE_STATUS_HINT?.CURRENT) fail('MISSING_STATUS_HINT');

const stations = [
  { id: 'ST01', number: 1, title: 'A' },
  { id: 'ST02', number: 2, title: 'B' },
];
const focused = path2.buildPathFocus({
  stations,
  statuses: { ST01: 'COMPLETED', ST02: 'CURRENT' },
});
if (focused.focus?.id !== 'ST02') fail('FOCUS_NOT_CURRENT');
if (path2.pathFocusViolations(focused).length) fail('FOCUS_VIOLATIONS');

const done = path2.buildPathFocus({
  stations,
  statuses: { ST01: 'COMPLETED', ST02: 'COMPLETED' },
});
if (!done.pathComplete || done.focus !== null) fail('COMPLETE_STATE_BAD');
ok('buildPathFocus pure logic');

// Labels must be child-clear (Phase B rewrite)
if (path2.PATH_NODE_LABELS.CURRENT !== 'اینجا هستی') fail('CURRENT_LABEL');
if (path2.PATH_NODE_LABELS.LOCKED !== 'بعداً') fail('LOCKED_LABEL');
ok('status labels oriented');

// The status hints moved into the path model (they are the nodes' accessibility hints).
const ui = read('apps/mobile/app/(tabs)/index.tsx') + '\n' + read('apps/mobile/src/path/pathModel.ts');
const uiRequired = isWaived('now-card') ? ['buildPathFocus', 'PATH_NODE_STATUS_HINT'] : ['buildPathFocus', 'nowCard', 'PATH_NODE_STATUS_HINT', 'unitHeaderActive', 'الان اینجا'];
if (isWaived('now-card')) console.log(waiverNote('now-card'));
for (const m of uiRequired) {
  if (!ui.includes(m)) fail(`UI_MISSING:${m}`);
}
ok('path screen orientation UI wired');

if (failures.length) {
  console.error('\nPHASE_B_PATH_FOCUS: BLOCKED');
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('\nPHASE_B_PATH_FOCUS: PASS');
process.exit(0);
