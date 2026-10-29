#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_ROOTS = ['apps/mobile', 'apps/web', 'packages', 'scripts'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const EXCLUDED_DIRS = new Set(['node_modules', 'dist', 'build', '.next', '.expo', 'coverage', 'out', 'dist-flow']);
const importPatterns = [
  /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g,
  /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
];

function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && EXCLUDED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

function importsFrom(text) {
  const found = new Set();
  for (const pattern of importPatterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) found.add(match[1]);
  }
  return [...found].sort();
}

function resolveRelative(importer, specifier) {
  if (!specifier.startsWith('.')) return null;
  const base = path.resolve(path.dirname(importer), specifier);
  const extension = path.extname(base);
  const sourceBase = ['.js', '.jsx', '.mjs', '.cjs'].includes(extension) ? base.slice(0, -extension.length) : base;
  const candidates = [
    base,
    ...[...SOURCE_EXTENSIONS].map((ext) => `${sourceBase}${ext}`),
    ...[...SOURCE_EXTENSIONS].map((ext) => `${base}${ext}`),
    ...[...SOURCE_EXTENSIONS].map((ext) => path.join(sourceBase, `index${ext}`)),
    ...[...SOURCE_EXTENSIONS].map((ext) => path.join(base, `index${ext}`)),
  ];
  return candidates.find((file) => fs.existsSync(file) && fs.statSync(file).isFile()) ?? null;
}

function workspacePackages() {
  const result = [];
  for (const group of ['apps', 'packages']) {
    const parent = path.join(ROOT, group);
    if (!fs.existsSync(parent)) continue;
    for (const entry of fs.readdirSync(parent, { withFileTypes: true })) {
      const packageFile = path.join(parent, entry.name, 'package.json');
      if (!entry.isDirectory() || !fs.existsSync(packageFile)) continue;
      const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
      result.push({
        name: pkg.name,
        path: rel(path.dirname(packageFile)),
        internalDependencies: Object.keys(allDeps).filter((name) => name.startsWith('@math/')).sort(),
      });
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

function scanTextReferences(tokens) {
  const roots = ['apps', 'packages', 'scripts', 'docs', 'design', 'content-library', 'skills', 'README.md', 'AGENTS.md', 'START_HERE.md', 'ROADMAP_PHASES.md'];
  const results = Object.fromEntries(tokens.map((token) => [token, []]));
  const visit = (target) => {
    if (!fs.existsSync(target)) return;
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
        if (entry.isDirectory() && EXCLUDED_DIRS.has(entry.name)) continue;
        visit(path.join(target, entry.name));
      }
      return;
    }
    if (stat.size > 1_000_000) return;
    let text;
    try { text = fs.readFileSync(target, 'utf8'); } catch { return; }
    for (const token of tokens) if (text.includes(token)) results[token].push(rel(target));
  };
  for (const root of roots) visit(path.join(ROOT, root));
  for (const token of tokens) results[token] = [...new Set(results[token])].sort();
  return results;
}

export function buildDependencyAudit() {
  const files = SOURCE_ROOTS.flatMap((root) => walk(path.join(ROOT, root))).sort();
  const relativeFiles = new Set(files.map(rel));
  const inbound = new Map([...relativeFiles].map((file) => [file, 0]));
  const imports = [];
  const v1Consumers = [];
  const v2Consumers = [];
  const workspaceImports = [];
  const deepWorkspaceImports = [];

  for (const importer of files) {
    const importerRel = rel(importer);
    const text = fs.readFileSync(importer, 'utf8');
    for (const specifier of importsFrom(text)) {
      const target = resolveRelative(importer, specifier);
      const targetRel = target ? rel(target) : null;
      imports.push({ importer: importerRel, specifier, ...(targetRel ? { target: targetRel } : {}) });
      if (targetRel && inbound.has(targetRel)) inbound.set(targetRel, inbound.get(targetRel) + 1);
      const normalized = targetRel ?? specifier;
      if (normalized.includes('/ui/v1/')) v1Consumers.push({ importer: importerRel, specifier, ...(targetRel ? { target: targetRel } : {}) });
      if (normalized.includes('/ui/v2/')) v2Consumers.push({ importer: importerRel, specifier, ...(targetRel ? { target: targetRel } : {}) });
      if (specifier.startsWith('@math/')) {
        workspaceImports.push({ importer: importerRel, specifier });
        if (specifier.split('/').length > 2) deepWorkspaceImports.push({ importer: importerRel, specifier });
      }
    }
  }

  const zeroInboundCandidates = [...inbound.entries()]
    .filter(([file, count]) => count === 0)
    .map(([file]) => file)
    .filter((file) => /^(apps\/mobile\/src|packages\/[^/]+\/src)\//.test(file))
    .filter((file) => !/(^|\/)(__tests__|test|tests|fixtures)\//.test(file))
    .filter((file) => !/\.(test|spec)\.[^.]+$/.test(file))
    .filter((file) => !/(^|\/)index\.[^.]+$/.test(file))
    .sort();

  const textReferences = scanTextReferences(['/ui/v1/', '/ui/v2/', 'design-handoff-2026-10', 'ROADMAP_PHASES.md']);
  return {
    schemaVersion: 1,
    sourceScopes: SOURCE_ROOTS,
    counts: {
      sourceFiles: files.length,
      importEdges: imports.length,
      v1ImportConsumers: v1Consumers.length,
      v2ImportConsumers: v2Consumers.length,
      workspaceImportEdges: workspaceImports.length,
      deepWorkspaceImports: deepWorkspaceImports.length,
      zeroInboundCandidates: zeroInboundCandidates.length,
    },
    workspaceGraph: workspacePackages(),
    v1Consumers: v1Consumers.sort((a, b) => `${a.importer}:${a.specifier}`.localeCompare(`${b.importer}:${b.specifier}`)),
    v2Consumers: v2Consumers.sort((a, b) => `${a.importer}:${a.specifier}`.localeCompare(`${b.importer}:${b.specifier}`)),
    deepWorkspaceImports: deepWorkspaceImports.sort((a, b) => `${a.importer}:${a.specifier}`.localeCompare(`${b.importer}:${b.specifier}`)),
    zeroInboundCandidates,
    textReferences,
    caveat: 'zeroInboundCandidates are review candidates only; route conventions, server loading, code generation and string-based access can create valid consumers.',
  };
}

export function buildDependencySnapshot(audit = buildDependencyAudit()) {
  const unique = (items) => [...new Set(items)].sort();
  const v1ExternalConsumerFiles = unique(audit.v1Consumers
    .filter((entry) => !entry.importer.startsWith('apps/mobile/src/ui/v1/'))
    .map((entry) => entry.importer));
  const v2ExternalConsumerFiles = unique(audit.v2Consumers
    .filter((entry) => !entry.importer.startsWith('apps/mobile/src/ui/v2/'))
    .map((entry) => entry.importer));
  return {
    schemaVersion: audit.schemaVersion,
    sourceScopes: audit.sourceScopes,
    counts: {
      ...audit.counts,
      v1ExternalConsumerFiles: v1ExternalConsumerFiles.length,
      v2ExternalConsumerFiles: v2ExternalConsumerFiles.length,
    },
    workspaceGraph: audit.workspaceGraph,
    v1ExternalConsumerFiles,
    v2ExternalConsumerFiles,
    deepWorkspaceImports: audit.deepWorkspaceImports,
    zeroInboundCandidates: audit.zeroInboundCandidates,
    textReferences: audit.textReferences,
    caveat: audit.caveat,
  };
}

function main() {
  const audit = buildDependencyAudit();
  const [command = 'summary'] = process.argv.slice(2);
  if (command === 'print') {
    console.log(JSON.stringify(buildDependencySnapshot(audit), null, 2));
    return;
  }
  if (command === 'print-full') {
    console.log(JSON.stringify(audit, null, 2));
    return;
  }
  if (command === 'check') {
    const storedPath = path.join(ROOT, 'harness', 'dependency-map.json');
    const stored = JSON.parse(fs.readFileSync(storedPath, 'utf8'));
    if (JSON.stringify(stored) !== JSON.stringify(buildDependencySnapshot(audit))) {
      console.error('DEPENDENCY_MAP_DRIFT');
      process.exitCode = 1;
      return;
    }
    console.log(`DEPENDENCY_MAP: PASS (${audit.counts.sourceFiles} files, ${audit.counts.importEdges} edges)`);
    return;
  }
  if (command === 'write') {
    const storedPath = path.join(ROOT, 'harness', 'dependency-map.json');
    fs.writeFileSync(storedPath, `${JSON.stringify(buildDependencySnapshot(audit), null, 2)}\n`);
    console.log(`DEPENDENCY_MAP: WROTE (${audit.counts.sourceFiles} files, ${audit.counts.importEdges} edges)`);
    return;
  }
  console.log(JSON.stringify(audit.counts, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
