#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { validateRoadmap, loadRoadmap } from '../tools/harness.mjs';
import { buildDependencyAudit, buildDependencySnapshot } from '../tools/dependency-audit.mjs';

const root = process.cwd();
const roadmap = loadRoadmap();
const result = validateRoadmap(roadmap);
assert.deepEqual(result.errors, [], `roadmap errors:\n${result.errors.join('\n')}`);

const required = [
  'AGENTS.md', 'START_HERE.md', 'ZCODE.md', 'docs/README.md',
  'docs/roadmap/PHASE_CHECKLISTS_FA.md',
  'docs/architecture/REPOSITORY_MAP_FA.md',
  'docs/architecture/PACKAGE_BOUNDARIES_FA.md',
  'docs/architecture/DESIGN_SYSTEM_MIGRATION_FA.md',
  'harness/roadmap.json', 'harness/file-ledger.json',
  'harness/dependency-map.json', 'harness/WORKLOG.md',
];
for (const file of required) assert.ok(fs.existsSync(path.join(root, file)), `missing canonical file: ${file}`);

const forbiddenRoot = ['README_INSTALL_FIRST.md', 'PACKAGE_CONTENTS.md', 'SHOMARA_ZCODE_MASTER_PLAN_FA.md', 'metadata.json'];
for (const file of forbiddenRoot) assert.ok(!fs.existsSync(path.join(root, file)), `obsolete root file returned: ${file}`);
assert.ok(!fs.existsSync(path.join(root, 'parity-out-expo')), 'generated parity-out-expo must not exist');

const ledger = JSON.parse(fs.readFileSync(path.join(root, 'harness/file-ledger.json'), 'utf8'));
assert.equal(ledger.schemaVersion, 1);
assert.ok(ledger.entries.length >= 30, 'file ledger is unexpectedly incomplete');
const ledgerPaths = new Set(ledger.entries.map((entry) => entry.path));
for (const file of forbiddenRoot) assert.ok(ledgerPaths.has(file), `deleted file missing from ledger: ${file}`);
assert.ok(ledgerPaths.has('apps/mobile/src/path/PathBanner.tsx'), 'dead-code deletion missing from ledger');

const storedDependencyMap = JSON.parse(fs.readFileSync(path.join(root, 'harness/dependency-map.json'), 'utf8'));
const liveDependencyMap = buildDependencySnapshot(buildDependencyAudit());
assert.deepEqual(storedDependencyMap, liveDependencyMap, 'dependency map drift; regenerate and review it');
assert.equal(storedDependencyMap.counts.deepWorkspaceImports, 0, 'deep workspace imports are forbidden');

const nvm = fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
assert.equal(nvm, '22.22.0');
assert.equal(pkg.engines.node, '>=22.18 <23');
assert.equal(lock.packages[''].engines.node, pkg.engines.node);

const start = fs.readFileSync(path.join(root, 'START_HERE.md'), 'utf8');
assert.match(start, new RegExp(`current_phase: ${roadmap.currentPhase}`));
assert.match(start, new RegExp(`current_task: ${roadmap.currentTask}`));

console.log(`REPOSITORY_HARNESS: PASS (${result.tasks.size} tasks, ${ledger.entries.length} ledger entries, ${storedDependencyMap.counts.importEdges} dependency edges)`);
