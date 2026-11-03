#!/usr/bin/env node
// N08-01 route/state ledger audit — verifies that every Expo route file and
// every web app page is classified in SCREEN_LEDGER.csv (100% classification),
// and that the ledger references only files that actually exist.
// Mirrors verify-repository-harness style: exit 0 PASS / 2 BLOCKED.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.isFile()) acc.push(full);
  }
  return acc;
}

// 1. Collect all Expo route files (app/**/*.tsx excluding non-route directories)
const expoAppDir = path.join(root, 'apps', 'mobile', 'app');
const expoRoutes = walk(expoAppDir, [])
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => path.relative(root, f).replaceAll('\\', '/'));

// 2. Collect all web pages
const webAppDir = path.join(root, 'apps', 'web', 'app');
const webRoutes = walk(webAppDir, [])
  .filter((f) => f.endsWith('page.tsx'))
  .map((f) => path.relative(root, f).replaceAll('\\', '/'));

// 3. Parse ledger. source_path (column 2) is free-form: may contain ' + ' joins
//    and parenthetical view names. We check file existence by extracting token
//    candidates that look like real paths (contain '/' or known extensions).
const ledgerPath = path.join(root, 'design', 'playbook', 'quality', 'SCREEN_LEDGER.csv');
const ledgerLines = fs.readFileSync(ledgerPath, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('route_id'));
const pathToken = /(?:apps|packages|src)\/[A-Za-z0-9_\-./[\]]+\.(?:tsx|ts|csv)/g;
for (const line of ledgerLines) {
  const cells = line.split(',');
  if (cells.length < 2) { failures.push(`LEDGER_ROW_MALFORMED:${line.slice(0, 60)}`); continue; }
  for (const token of cells[1].match(pathToken) ?? []) {
    const resolved = token.startsWith('apps/') || token.startsWith('packages/') ? token : `apps/mobile/${token}`;
    if (!fs.existsSync(path.join(root, resolved))) failures.push(`LEDGER_PATH_MISSING:${token}`);
  }
}

// 4. Every Expo route must appear in the ledger; every web page must appear too.
//    The web app is the CMS/admin+parity surface for the same product routes;
//    N08-01 classifies them alongside the child app.
const ledgerText = fs.readFileSync(ledgerPath, 'utf8');
const ledgerRouteIds = new Set();
for (const line of ledgerLines) {
  ledgerRouteIds.add(line.split(',')[0]?.trim());
}
for (const route of expoRoutes) {
  if (!ledgerText.includes(route)) failures.push(`EXPO_ROUTE_UNCLASSIFIED:${route}`);
}
for (const route of webRoutes) {
  if (!ledgerText.includes(route)) failures.push(`WEB_ROUTE_UNCLASSIFIED:${route}`);
}

if (failures.length) {
  console.error('N08_01_LEDGER_AUDIT: BLOCKED');
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log(`N08_01_LEDGER_AUDIT: PASS (${expoRoutes.length} expo routes, ${webRoutes.length} web routes, ${ledgerLines.length} ledger rows, all classified)`);
