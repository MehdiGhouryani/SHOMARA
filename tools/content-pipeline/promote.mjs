#!/usr/bin/env node
/**
 * ContentPromotionGate (P7) — the lifecycle state machine with enforced gates and evidence.
 *
 * SOURCE_ONLY → MAPPED_TO_REPO → STAGED → VALIDATED → HUMAN_REVIEWED → APPROVED → ENABLED
 *
 * A promotion is NEVER a status edit: each transition requires (a) the correct predecessor,
 * (b) stage-specific evidence, and (c) an append-only ledger record ({from,to,at,actor,evidence}).
 * The two HUMAN gates (HUMAN_REVIEWED, APPROVED) require a review-evidence file with all four
 * distinct roles — the tool can NEVER write it (the file must be produced by the human review).
 * ENABLED additionally requires a signed-package marker from the owner's release process
 * (signing is owner-side; the pipeline never holds private keys — ADR-0043).
 */
import fs from 'node:fs';
import path from 'node:path';
import { AUTHORING, PIPELINE_STATE, readJson, writeJson } from './lib/context.mjs';

const ORDER = ['SOURCE_ONLY', 'MAPPED_TO_REPO', 'STAGED', 'VALIDATED', 'HUMAN_REVIEWED', 'APPROVED', 'ENABLED'];

export function loadLedger(ledgerFile = PIPELINE_STATE) {
  if (!fs.existsSync(ledgerFile)) return { schemaVersion: 1, transitions: [] };
  return readJson(ledgerFile);
}

export function currentState(ledger, stationId) {
  const relevant = ledger.transitions.filter((t) => t.stationId === stationId);
  if (relevant.length === 0) return 'SOURCE_ONLY';
  return relevant[relevant.length - 1].to;
}

function reviewEvidenceFor(stationId) {
  const file = path.join(AUTHORING, 'review', `${stationId}.review.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * Attempts a transition. Returns { ok, reason } — never mutates on refusal.
 * options.evidence: { actor, note } for tool-driven steps; HUMAN gates read the review file.
 */
export async function promote(stationId, to, options = {}) {
  const { contracts } = await import('./lib/contracts-loader.mjs');
  const contractsMod = await contracts();
  const ledgerFile = options.ledgerFile ?? PIPELINE_STATE;
  const ledger = loadLedger(ledgerFile);
  const from = currentState(ledger, stationId);
  const fromIndex = ORDER.indexOf(from);
  const toIndex = ORDER.indexOf(to);
  if (toIndex < 0) return { ok: false, reason: `unknown lifecycle stage '${to}'` };
  if (toIndex !== fromIndex + 1) {
    return { ok: false, reason: `transition ${from} → ${to} skips stages (lifecycle is strictly sequential)` };
  }

  const authoringFile = path.join(AUTHORING, 'stations', `${stationId}.json`);
  if (!fs.existsSync(authoringFile)) return { ok: false, reason: `no authoring artifact for ${stationId}` };

  const { validateStation } = await import('./lib/context.mjs');
  const validation = await validateStation(authoringFile);
  const blocking = validation.violations.filter((v) =>
    !['review-roles', 'rights-moderation'].includes(v.rule)); // these gate the HUMAN stages below
  if (blocking.length > 0) {
    return { ok: false, reason: `validator refuses: ${blocking.map((v) => `${v.rule}`).join(', ')}` };
  }

  switch (to) {
    case 'MAPPED_TO_REPO': {
      // Typed artifact exists + provenance anchors verified by the validator (source-hash rules ran).
      break;
    }
    case 'STAGED': {
      if (from !== 'MAPPED_TO_REPO') return { ok: false, reason: `STAGED requires MAPPED_TO_REPO, found ${from}` };
      break;
    }
    case 'VALIDATED': {
      // VALIDATED = the MACHINE validation is complete. Review roles/rights gate the HUMAN
      // stages below — they are expected violations at this point, never blockers here.
      const machineBlockers = validation.violations.filter((v) => !['review-roles', 'rights-moderation'].includes(v.rule));
      if (machineBlockers.length > 0) {
        return { ok: false, reason: `VALIDATED requires a clean machine run; violations: ${machineBlockers.map((v) => v.rule).join(', ')}` };
      }
      break;
    }
    case 'HUMAN_REVIEWED': {
      const evidence = reviewEvidenceFor(stationId);
      if (!evidence) return { ok: false, reason: 'HUMAN_REVIEWED requires a review-evidence file the TOOL cannot write (content-library/authoring/review/<id>.review.json)' };
      const violations = contractsMod.reviewRoleViolations(evidence.evidence ?? []);
      if (violations.length > 0) return { ok: false, reason: `review evidence incomplete: ${violations.join('; ')}` };
      const artifact = validation.artifact;
      if ((artifact.provenance?.rightsModeration ?? '') !== 'APPROVED') {
        return { ok: false, reason: 'HUMAN_REVIEWED requires rightsModeration=APPROVED in the authoring artifact' };
      }
      break;
    }
    case 'APPROVED': {
      const evidence = reviewEvidenceFor(stationId);
      if (!evidence) return { ok: false, reason: 'APPROVED requires the human review-evidence file' };
      const violations = contractsMod.reviewRoleViolations(evidence.evidence ?? []);
      if (violations.length > 0) return { ok: false, reason: `APPROVED requires all four review roles: ${violations.join('; ')}` };
      break;
    }
    case 'ENABLED': {
      const marker = path.join(AUTHORING, 'packages', `${stationId}.signed.json`);
      if (!fs.existsSync(marker)) {
        return { ok: false, reason: 'ENABLED requires the OWNER-SIGNED package marker (content-library/authoring/packages/<id>.signed.json) from the release process — the pipeline never signs' };
      }
      const markerJson = JSON.parse(fs.readFileSync(marker, 'utf8'));
      if (!markerJson.signature || !markerJson.manifestSha256) {
        return { ok: false, reason: 'signed marker must carry signature + manifestSha256' };
      }
      break;
    }
    default:
      return { ok: false, reason: `unhandled stage ${to}` };
  }

  ledger.transitions.push({
    stationId,
    from,
    to,
    at: new Date().toISOString(),
    actor: options.actor ?? 'content-pipeline',
    evidence: options.evidence ?? { kind: to === 'HUMAN_REVIEWED' || to === 'APPROVED' ? 'human-review-file' : 'tool-run' },
  });
  writeJson(ledgerFile, ledger);
  return { ok: true, from, to };
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('promote.mjs')) {
  const [stationId, to, actor] = process.argv.slice(2);
  if (!stationId || !to) {
    console.log('usage: node tools/content-pipeline/promote.mjs <STxx> <STAGE> [actor]');
    console.log('stages:', ORDER.join(' → '));
    process.exit(2);
  }
  promote(stationId, to, { actor: actor ?? 'operator' }).then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  });
}
