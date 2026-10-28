// Golden immutability: the parity goldens (pages-v1/goldens/*.png + rects.json) are the reference the pixel
// gate compares against, so they may only change deliberately (`npm run parity:goldens` = regeneration, then
// `node scripts/verify-parity-goldens-pinned.mjs --update-pin` with a reviewed git diff). This verifier pins
// their SHA-256 hashes and fails when a golden drifted without a re-pin (H1).
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const GOLD = path.join(process.cwd(), 'docs/design-handoff-2026-10/pages-v1/goldens');
const PIN = path.join(GOLD, 'checksums.json');

function hashFile(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function current() {
  const entries = {};
  for (const name of fs.readdirSync(GOLD).filter((f) => f.endsWith('.png') || f === 'rects.json').sort()) {
    entries[name] = hashFile(path.join(GOLD, name));
  }
  return entries;
}

if (process.argv.includes('--update-pin')) {
  fs.writeFileSync(PIN, JSON.stringify(current(), null, 2) + '\n');
  console.log(`PIN UPDATED: ${Object.keys(current()).length} goldens pinned in ${path.relative(process.cwd(), PIN)}`);
  process.exit(0);
}

if (!fs.existsSync(PIN)) {
  console.error(`MISSING_PIN: ${path.relative(process.cwd(), PIN)} (run with --update-pin after a deliberate regeneration)`);
  process.exit(1);
}
const pinned = JSON.parse(fs.readFileSync(PIN, 'utf8'));
const live = current();
const drifted = Object.keys(live).filter((k) => pinned[k] !== live[k]);
const missing = Object.keys(pinned).filter((k) => !(k in live));
const unpinned = Object.keys(live).filter((k) => !(k in pinned));
if (drifted.length || missing.length || unpinned.length) {
  for (const k of drifted) console.error(`DRIFTED: ${k} (pinned ${String(pinned[k]).slice(0, 12)}…, on disk ${String(live[k]).slice(0, 12)}…)`);
  for (const k of missing) console.error(`MISSING: ${k} is pinned but absent`);
  for (const k of unpinned) console.error(`UNPINNED: ${k} has no pinned hash`);
  console.error('Goldens are immutable inputs. If the change is deliberate: npm run parity:goldens, review the git diff, then node scripts/verify-parity-goldens-pinned.mjs --update-pin.');
  process.exit(1);
}
console.log(`Goldens pinned: ${Object.keys(live).length} files match checksums.json`);
