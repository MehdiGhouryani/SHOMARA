#!/usr/bin/env node
/**
 * Curriculum Matrix generator (P9) — the versioned 25-station matrix with HONEST per-field
 * status, derived from content-library/derived/stations-index.json + the authoring artifacts.
 * Fields (owner P9 mission): learning goal+prereq / skill mapping / P1-P5 progression / teaching
 * method / guided practice / applied activity (game) / assessment / transfer+spiral review /
 * hint+recovery policy / canonical text+audio IDs / asset IDs+description / accessibility copy /
 * validator evidence / content version.
 *
 * NO field value is invented: ST07 carries its real prototype state; the other 24 stations carry
 * NOT_AUTHORED for every content field. The matrix is the AUTHORING PLAN, not fake content.
 */
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT, readJson } from './context.mjs';

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

function stationRow(stationId) {
  const isPilot = stationId === 'ST07';
  const authoringFile = path.join(CONTENT, 'authoring', 'stations', `${stationId}.json`);
  const transcribed = fs.existsSync(authoringFile);
  return {
    stationId,
    workingTitle: WORKING_TITLES[stationId] ?? '',
    lifecycle: isPilot ? 'MAPPED_TO_REPO' : 'SOURCE_ONLY',
    fields: Object.fromEntries(FIELDS.map((field) => [field, isPilot ? 'PROTOTYPE_DRAFT' : 'NOT_AUTHORED'])),
    ...(isPilot ? { prototypeNotes: {
      structurallyTranscribed: 'content-library/authoring/stations/ST07.json',
      transcribedFields: ['prerequisites', 'evaluatorConfig.items (P2 anchors)', 'taughtNumerals', 'declaredItemCounts', 'audioManifest', 'assetPolicy', 'rightsModeration'],
      gaps: ['O1 evaluator model', 'O2 final schema', 'O7 budget', 'CONTENT-009/010 assets', 'CONTENT-014 policy', 'stage-mapping confirmation'],
    } } : {}),
  };
}

export function buildMatrix() {
  const stations = readJson('content-library/derived/stations-index.json').stations.map((s) => s.id);
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    matrixVersion: 'curriculum-matrix:v1 (honest status, pre-authoring)',
    totalStations: stations.length,
    authoredStations: 1,
    notAuthoredStations: stations.length - 1,
    fields: FIELDS,
    batches: Object.fromEntries(Object.entries(BATCHES).map(([b, def]) => [b, { ...def, status: 'PLANNED', reviewRoles: ['curriculum', 'persian_pronunciation', 'accessibility', 'rights_moderation'] }])),
    stations: stations.map(stationRow),
  };
}
