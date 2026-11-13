#!/usr/bin/env node
/**
 * AssetManifestBuilder + PackageBuilder + ContentDiffReporter (P7).
 *
 * Builds the deliverable artifacts for an APPROVED/ENABLED authoring artifact:
 *   published.json (PublishedStationPackage — via the contract's publishForDelivery),
 *   child-projection.json (via projectForChild + projectionViolations gate),
 *   asset-manifest.json (AssetManifestBuilder — audio rows from the station manifest CSV),
 *   manifest.json (PackageBuilder — the PROPOSED ADR-0043 package manifest: file list +
 *                  sizeBytes + sha256; UNSIGNED — signing is an owner-side release step),
 *   diff-report.json (ContentDiffReporter — authoring→published removals + build-vs-build drift).
 *
 * The gate refuses non-APPROVED lifecycles (the contract's publishForDelivery asserts it).
 */
import fs from 'node:fs';
import path from 'node:path';
import { AUTHORING, CONTENT, parseCsv, readJson, sha256Hex, writeJson } from './lib/context.mjs';

export async function buildPackage(stationId, packageVersion = 1) {
  const { contracts } = await import('./lib/contracts-loader.mjs');
  const contractsMod = await contracts();
  const authoringFile = path.join(AUTHORING, 'stations', `${stationId}.json`);
  const artifact = readJson(authoringFile);
  const macroStages = ['P1_DISCOVER', 'P2_GUIDED', 'P3_GAME', 'P4_ASSESSMENT', 'P5_TRANSFER'];

  const audioRows = parseCsv(fs.readFileSync(path.join(CONTENT, artifact.provenance.audioManifest), 'utf8'));
  // AssetManifestBuilder: the audio asset index (IDs + draft lifecycle evidence — binaries do NOT exist yet, CONTENT-010).
  const assetManifest = {
    stationId,
    generatedAt: new Date().toISOString(),
    audioAssets: audioRows.map((row) => ({
      audioId: row.id,
      kind: row.kind,
      lifecycle: row.status === 'draft' ? 'SOURCE_ONLY' : row.status,
      delivered: false, // CONTENT-010: zero binaries exist — the manifest never claims one
      usedByStages: row.used_by.split(';').map((s) => s.trim()).filter(Boolean),
    })),
    imageAssets: [], // CONTENT-009: zero image assets delivered
    totalAssets: audioRows.length,
  };

  const checksum = sha256Hex(Buffer.from(JSON.stringify(artifact)));
  const published = contractsMod.publishForDelivery(artifact, packageVersion, checksum, macroStages, audioRows.map((r) => r.id));
  const projection = contractsMod.projectForChild(published, {
    prompt: `ایستگاه ${stationId} (PROTOTYPE — prompt from the approved content pipeline)`,
    visibleOptions: [],
    interactionConfig: { packageId: `shomara-${stationId.toLowerCase()}`, schemaVersion: 1 },
    accessibilityCopy: 'پروتوتایپ خط تولید محتوا',
  });
  const projectionIssues = contractsMod.projectionViolations(projection);
  if (projectionIssues.length > 0) {
    return { ok: false, reason: `child projection refused: ${projectionIssues.join('; ')}` };
  }

  const outDir = path.join(AUTHORING, 'build', stationId, String(packageVersion));
  fs.mkdirSync(outDir, { recursive: true });
  writeJson(path.relative(process.cwd(), path.join(outDir, 'published.json')), published);
  writeJson(path.relative(process.cwd(), path.join(outDir, 'child-projection.json')), projection);
  writeJson(path.relative(process.cwd(), path.join(outDir, 'asset-manifest.json')), assetManifest);

  // PackageBuilder (PROPOSED ADR-0043 manifest): the deliverable file set with per-file sha256.
  const packageFiles = [
    { path: 'published.json' }, { path: 'child-projection.json' }, { path: 'asset-manifest.json' },
  ].map((entry) => {
    const bytes = fs.readFileSync(path.join(outDir, entry.path));
    return { path: entry.path, sizeBytes: bytes.length, sha256: sha256Hex(bytes) };
  });
  const manifest = {
    packageId: `shomara-${stationId.toLowerCase()}`,
    packageVersion,
    schemaVersion: 1,
    minAppVersion: '0.1.0',
    stations: [stationId],
    files: packageFiles,
    signing: { keyId: 'PENDING-OWNER-KEY', algorithm: 'SHA256withECDSA' },
    lifecycleEvidence: {
      requiredBy: 'O2 (final schema)',
      promotion: artifact.lifecycle,
      reviewEvidenceCount: artifact.reviewEvidence.length,
      note: 'PROPOSED fields — final names land with O2; the package stays UNSIGNED until the owner signs it',
    },
  };
  writeJson(path.relative(process.cwd(), path.join(outDir, 'manifest.json')), manifest);

  // ContentDiffReporter: what authoring→published REMOVED (the answer surface) + build drift.
  const authoringKeys = Object.keys(artifact);
  const publishedKeys = Object.keys(published);
  const removedFromAuthoring = authoringKeys.filter((k) => !publishedKeys.includes(k));
  const forbiddenLeakCheck = ['evaluatorConfig', 'passThreshold', 'reviewEvidence', 'provenance'].filter((k) => k in published);
  const diffReport = {
    stationId,
    packageVersion,
    authoringKeys,
    publishedKeys,
    removedFromAuthoring,
    forbiddenLeakCheck,
    leakClean: forbiddenLeakCheck.length === 0,
    assetSummary: { audio: assetManifest.audioAssets.length, deliveredBinaries: 0 },
    lifecycle: artifact.lifecycle,
  };
  writeJson(path.relative(process.cwd(), path.join(outDir, 'diff-report.json')), diffReport);

  return { ok: diffReport.leakClean, outDir, manifest, diffReport };
}
