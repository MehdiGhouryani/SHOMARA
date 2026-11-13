#!/usr/bin/env node
/**
 * Content pipeline verifier (P7) — joins verify:static:all.
 *  1. The REAL ST07 authoring artifact validates CLEAN (prototype scope).
 *  2. The REAL promotion ledger is well-formed and ST07 sits at MAPPED_TO_REPO (transcription only).
 *  3. Promotion gates: VALIDATED passes on a TEMP ledger; HUMAN_REVIEWED is refused without the
 *     human evidence file (the tool can never write it); ENABLED is refused without the signed marker.
 *  4. Every NEGATIVE fixture is rejected with its expected rule id.
 *  5. The leaked-projection fixture trips the contract's projectionViolations (CONTENT-008).
 *  6. build-package REFUSES at MAPPED_TO_REPO (publishing requires APPROVED/ENABLED).
 *  7. ORIGINALS untouched: every recorded source hash still matches (byte-protection holds).
 */
import fs from 'node:fs';
import path from 'node:path';
import { validateStation, contracts, ROOT, CONTENT } from '../tools/content-pipeline/lib/context.mjs';
import { currentState, loadLedger, promote } from '../tools/content-pipeline/promote.mjs';
import { buildPackage } from '../tools/content-pipeline/build-package.mjs';
import crypto from 'node:crypto';

const violations = [];
const expect = (cond, rule, detail) => { if (!cond) violations.push(`${rule}: ${detail}`); };

// 1. Real artifact: at MAPPED_TO_REPO the ONLY expected violations are the four review-roles
//    (no human review has happened — that is exactly what the lifecycle gates next).
const real = await validateStation('content-library/authoring/stations/ST07.json');
const nonReview = real.violations.filter((v) => v.rule !== 'review-roles');
expect(nonReview.length === 0, 'st07-validate', JSON.stringify(real.violations));
expect(real.violations.filter((v) => v.rule === 'review-roles').length === 4, 'st07-review-roles-pending', 'expected exactly the 4 role gaps');

// 2. Ledger well-formed + the state must be a legitimate machine-reachable stage
//    (P9 promoted ST07 to VALIDATED via the real gates — the verifier follows the LEDGER,
//    never a hardcoded stage).
const ledger = loadLedger();
expect(ledger.schemaVersion === 1, 'ledger-schema', 'schemaVersion must be 1');
const MACHINE_STAGES = new Set(['SOURCE_ONLY', 'MAPPED_TO_REPO', 'STAGED', 'VALIDATED']);
const st07State = currentState(ledger, 'ST07');
expect(MACHINE_STAGES.has(st07State), 'st07-state', `ST07 is ${st07State} (must remain machine-reachable until human review)`);
for (const t of ledger.transitions) {
  expect(typeof t.at === 'string' && typeof t.actor === 'string' && !!t.evidence, 'ledger-evidence', `${t.stationId} ${t.from}->${t.to}`);
}

// 3. Gate behaviour on a TEMP ledger (never mutating the real one).
const tempLedger = { schemaVersion: 1, transitions: structuredClone(ledger.transitions) };
const tempFile = path.join(ROOT, 'tools/content-pipeline/fixtures/temp-ledger.json');
fs.writeFileSync(tempFile, JSON.stringify(tempLedger, null, 2));
// The simulation uses an injected TEMP ledger seeded FROM the real state — the real ledger is
// never touched. The NEXT stage is simulated dynamically (P9 promoted ST07 to VALIDATED via the
// real gates; the verifier follows the ledger, never a hardcoded stage). HUMAN gates must refuse;
// two-step skips must refuse.
const ledgerOptions = { actor: 'verifier', evidence: { kind: 'verifier-run' }, ledgerFile: tempFile };
const NEXT = { SOURCE_ONLY: 'MAPPED_TO_REPO', MAPPED_TO_REPO: 'STAGED', STAGED: 'VALIDATED', VALIDATED: 'HUMAN_REVIEWED' };
try {
  const nextStage = NEXT[st07State];
  if (nextStage && nextStage !== 'HUMAN_REVIEWED') {
    const advanced = await promote('ST07', nextStage, { ...ledgerOptions });
    expect(advanced.ok, 'gate-next-machine', advanced.reason ?? '');
  }
  const human = await promote('ST07', 'HUMAN_REVIEWED', { actor: 'verifier', ledgerFile: tempFile });
  expect(!human.ok && /HUMAN_REVIEWED requires/.test(human.reason ?? ''), 'gate-human-refused', human.reason ?? '');
  const enabled = await promote('ST07', 'ENABLED', { actor: 'verifier', ledgerFile: tempFile });
  expect(!enabled.ok && (/skips stages/.test(enabled.reason ?? '') || /signed/.test(enabled.reason ?? '')), 'gate-enabled-refused', enabled.reason ?? '');
} finally {
  fs.rmSync(tempFile, { force: true });
}
// The REAL ledger state must be untouched by the simulation (whatever stage it honestly holds).
expect(currentState(loadLedger(), 'ST07') === st07State, 'ledger-untouched', 'simulation leaked into the real ledger');

// 4. Negative fixtures.
const negativesDir = path.join(ROOT, 'tools/content-pipeline/fixtures/negative');
const expectedRules = {
  'duplicate-id': 'id-duplicate',
  'prereq-cycle': 'prerequisite-graph',
  'prereq-unknown': 'prerequisite-graph',
  'taught-numeral': 'taught-numeral',
  'unknown-template': 'ref-template',
  'source-hash-drift': 'provenance-source-hash',
  'item-count-drift': 'item-count-stage-coverage',
};
for (const [name, rule] of Object.entries(expectedRules)) {
  const result = await validateStation(path.join(negativesDir, `${name}.json`));
  expect(!result.ok, `negative-${name}`, 'fixture was accepted');
  expect(result.violations.some((v) => v.rule === rule), `negative-${name}`, `expected rule ${rule}, got ${result.violations.map((v) => v.rule).join(',')}`);
}

// 5. Leaked projection fixture trips the contract guard (CONTENT-008).
const contractsMod = await contracts();
const leaked = JSON.parse(fs.readFileSync(path.join(negativesDir, 'leaked-projection.json'), 'utf8'));
expect(contractsMod.projectionViolations(leaked).length > 0, 'negative-leaked-projection', 'contract guard missed the leak');

// 6. build-package refuses a non-APPROVED lifecycle (publishForDelivery throws REVIEW_ROLES_INCOMPLETE).
let buildAttempt;
try { buildAttempt = await buildPackage('ST07', 1); } catch (e) { buildAttempt = { ok: false, reason: String(e.message) }; }
expect(!buildAttempt.ok, 'build-refuses-unapproved', buildAttempt.reason ?? JSON.stringify(buildAttempt.diffReport ?? {}));
expect(/REVIEW_ROLES_INCOMPLETE|lifecycle/i.test(buildAttempt.reason ?? ''), 'build-refusal-reason', buildAttempt.reason ?? '');

// 7. Originals byte-protection still holds (belt & braces with verify-content-library).
const recorded = JSON.parse(fs.readFileSync(path.join(CONTENT, 'derived/source-sha256.json'), 'utf8')).sha256;
for (const [rel, expectedHash] of Object.entries(recorded)) {
  const file = path.join(CONTENT, 'originals', rel);
  if (!fs.existsSync(file)) { violations.push(`provenance-originals: missing ${rel}`); continue; }
  const actual = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  expect(actual === expectedHash, 'provenance-originals', `hash drift on ${rel}`);
}

if (violations.length > 0) {
  console.log(violations.map((v) => `VIOLATION ${v}`).join('\n'));
  console.log(`CONTENT_PIPELINE: FAIL (${violations.length})`);
  process.exit(1);
}
console.log('CONTENT_PIPELINE: PASS (ST07 clean, gates enforced, 7 negative fixtures rejected, leak guard active, originals intact)');
