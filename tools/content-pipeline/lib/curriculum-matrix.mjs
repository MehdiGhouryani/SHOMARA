#!/usr/bin/env node
/**
 * Curriculum Matrix generator (P9) — the versioned 25-station matrix with HONEST per-field
 * status, derived from content-library/derived/stations-index.json + the authoring artifacts.
 * Fields (owner P9 mission): learning goal+prereq / skill mapping / P1-P5 progression / teaching
 * method / guided practice / applied activity (game) / assessment / transfer+spiral review /
 * hint+recovery policy / canonical text+audio IDs / asset IDs+description / accessibility copy /
 * validator evidence / content version.
 *
 * NO field value is invented: a station that has a spec + typed transcription carries
 * PROTOTYPE_DRAFT (with its real ledger lifecycle); every other station carries NOT_AUTHORED for
 * every content field. The matrix is the AUTHORING PLAN, not fake content.
 *
 * DT-80: stations are derived from the REAL promotion ledger + artifacts (ST07 pilot, ST01
 * authored spec) instead of a hard-coded pilot flag.
 */
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT, AUTHORING, readJson } from './context.mjs';

export const BATCHES = {
  A: { stations: ['ST01', 'ST02', 'ST03', 'ST04', 'ST05', 'ST06'] },
  B: { stations: ['ST08', 'ST09', 'ST10', 'ST11', 'ST12'] },
  C: { stations: ['ST13', 'ST14', 'ST15', 'ST16', 'ST17'] },
  D: { stations: ['ST18', 'ST19', 'ST20', 'ST21', 'ST22'] },
  E: { stations: ['ST23', 'ST24', 'ST25'] },
};

const FIELDS = [
  'learningGoalAndPrereq', 'skillMapping', 'progressionP1P5', 'teachingMethod',
  'guidedPractice', 'appliedGame', 'assessment', 'transferSpiralReview',
  'hintRecoveryPolicy', 'canonicalTextAudioIds', 'assetIdsDescription',
  'accessibilityCopy', 'validatorEvidence', 'contentVersion',
];

const WORKING_TITLES = Object.fromEntries(
  readJson('content-library/derived/stations-index.json').stations.map((s) => [s.id, s.workingTitle]),
);

// Pilot specs authored during the research stage live in the byte-protected originals (they are
// research outputs, pre-dating the authoring tree). Authored specs from DT-80 onward live in
// authoring/stations/specs/. Both count as authored; neither is promoted past the ledger.
const PILOT_SPECS = {
  ST07: 'originals/shomara-stage7-pilot-ST07.md',
};

function ledgerState(stationId, ledger) {
  const relevant = (ledger.transitions ?? []).filter((t) => t.stationId === stationId);
  if (relevant.length === 0) return 'SOURCE_ONLY';
  return relevant[relevant.length - 1].to;
}

function stationRow(stationId, ledger) {
  const authoringFile = path.join(AUTHORING, 'stations', `${stationId}.json`);
  const specFile = path.join(AUTHORING, 'stations', 'specs', `${stationId}.md`);
  const transcribed = fs.existsSync(authoringFile);
  const pilotSpec = PILOT_SPECS[stationId];
  const authored = transcribed && (fs.existsSync(specFile) || (pilotSpec && fs.existsSync(path.join(CONTENT, pilotSpec))));
  return {
    stationId,
    workingTitle: WORKING_TITLES[stationId] ?? '',
    lifecycle: ledgerState(stationId, ledger),
    fields: Object.fromEntries(FIELDS.map((field) => [field, authored ? 'PROTOTYPE_DRAFT' : 'NOT_AUTHORED'])),
    ...(authored ? { prototypeNotes: {
      ...(pilotSpec && !fs.existsSync(specFile) ? { pilotSpec: `content-library/${pilotSpec}` } : { authoredSpec: `content-library/authoring/stations/specs/${stationId}.md` }),
      structurallyTranscribed: `content-library/authoring/stations/${stationId}.json`,
      transcribedFields: ['prerequisites', 'evaluatorConfig.items (P2 anchors)', 'taughtNumerals/countableRange', 'declaredItemCounts', 'audioManifest', 'assetPolicy', 'rightsModeration'],
      gaps: ['O1 evaluator model', 'O2 final schema', 'O7 budget', 'CONTENT-009/010 assets', 'CONTENT-014 policy', 'stage-mapping confirmation'],
    } } : {}),
  };
}

export function buildMatrix() {
  const stations = readJson('content-library/derived/stations-index.json').stations.map((s) => s.id);
  // One ledger read for the whole matrix (was 25 reads — one per station row).
  const ledgerFile = path.join(AUTHORING, 'promotion-ledger.json');
  const ledger = fs.existsSync(ledgerFile)
    ? readJson('content-library/authoring/promotion-ledger.json')
    : { transitions: [] };
  const rows = stations.map((id) => stationRow(id, ledger));
  const authoredStations = rows.filter((r) => r.fields.learningGoalAndPrereq === 'PROTOTYPE_DRAFT').length;
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    matrixVersion: 'curriculum-matrix:v2 (honest status, derived from ledger + artifacts)',
    totalStations: stations.length,
    authoredStations,
    notAuthoredStations: stations.length - authoredStations,
    fields: FIELDS,
    batches: Object.fromEntries(Object.entries(BATCHES).map(([b, def]) => [b, { ...def, status: 'PLANNED', reviewRoles: ['curriculum', 'persian_pronunciation', 'accessibility', 'rights_moderation'] }])),
    stations: rows,
  };
}
