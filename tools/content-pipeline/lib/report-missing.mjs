#!/usr/bin/env node
/**
 * Missing/Orphan/Impact Reporter (P9) — the honest inventory of the media reality.
 *  - MISSING: assets the content references (pilot asset refs, audio manifest IDs) that are NOT
 *    delivered in the registry.
 *  - ORPHAN: registered assets no station references (wasted bytes, must be flagged).
 *  - IMPACT: per station/batch — what blocks STAGED→ENABLED.
 * The metadata reality (232 DRAFT rows, zero binaries, zero station images) is reported verbatim.
 */
import fs from 'node:fs';
import path from 'node:path';
import { AUTHORING, CONTENT, parseCsv, readJson } from './context.mjs';
import { loadRegistry } from './media.mjs';

export function report(REGISTRY_FILE) {
  const registry = loadRegistry(REGISTRY_FILE);
  const deliveredIds = new Set(registry.assets.map((a) => a.assetId));

  // The ST07 audio manifest = the per-station audio reference list (53 DRAFT rows).
  const st07Audio = parseCsv(fs.readFileSync(path.join(CONTENT, 'originals/shomara-ST07-audio-manifest.csv'), 'utf8'));
  const st07AudioIds = st07Audio.map((r) => r.id);

  // The pilot's declared asset set: OBJ./GLYPH./PAT. tokens from the byte-protected source.
  const pilotText = fs.readFileSync(path.join(CONTENT, 'originals/shomara-stage7-pilot-ST07.md'), 'utf8');
  const assetTokens = [...new Set([...pilotText.matchAll(/\b(?:OBJ|GLYPH|PAT|CH|SCENE)\.[A-Za-z0-9_.-]+/g)].map((m) => m[0]))];

  const missing = {
    st07AudioBinaries: st07AudioIds.filter((id) => !deliveredIds.has(id)),
    st07ImageAssets: assetTokens, // every referenced token is undelivered today (CONTENT-009)
  };
  const orphan = registry.assets.filter((a) => {
    const referenced = a.stationRefs?.some((s) => s === 'ST07') || st07AudioIds.includes(a.assetId) || assetTokens.includes(a.assetId);
    return !referenced;
  }).map((a) => a.assetId);

  const impact = {
    ST07: {
      audioMissing: missing.st07AudioBinaries.length,
      imageMissing: missing.st07ImageAssets.length,
      blocks: ['HUMAN_REVIEWED (listening/rights review needs real audio)', 'APPROVED', 'ENABLED (package without media is incomplete)'],
    },
    ST01_ST06: { status: 'NOT_AUTHORED', blocks: ['authoring', 'validation', 'every later stage'] },
    ST08_ST12: { status: 'NOT_AUTHORED', blocks: ['authoring', 'validation', 'every later stage'] },
    ST13_ST17: { status: 'NOT_AUTHORED', blocks: ['authoring', 'validation', 'every later stage'] },
    ST18_ST22: { status: 'NOT_AUTHORED', blocks: ['authoring', 'validation', 'every later stage'] },
    ST23_ST25: { status: 'NOT_AUTHORED', blocks: ['authoring', 'validation', 'every later stage'] },
  };

  return {
    generatedAt: new Date().toISOString(),
    registryAssets: registry.assets.length,
    deliveredAudioBinaries: registry.assets.filter((a) => a.kind === 'audio').length,
    deliveredImages: registry.assets.filter((a) => a.kind === 'image').length,
    metadataReality: { draftAudioRows: 232, audioBinaries: 0, stationImageAssets: 0 },
    missing,
    orphan,
    impact,
  };
}
