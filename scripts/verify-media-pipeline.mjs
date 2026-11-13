#!/usr/bin/env node
/**
 * Media pipeline verifier (P9) — joins verify:static:all.
 * Uses a TEMP registry file (never the real one) and REAL WAV fixtures generated in-place:
 *  - a genuine sine-tone WAV is ACCEPTED (real audio: format sniffed, duration parsed, RMS > 0);
 *  - an all-zero (silent) WAV is REJECTED (audio-silence — a silent file is never an asset);
 *  - a hash-mismatch entry is REJECTED;
 *  - a placeholder-named file is REJECTED;
 *  - a missing file is REJECTED;
 *  - the honest inventory: 232 DRAFT audio rows, zero binaries, zero station images;
 *  - the Missing/Orphan/Impact reporter runs with consistent numbers (53 ST07 audio, 36 images).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { loadRegistry, saveRegistry, registerAsset, AssetRejected } from '../tools/content-pipeline/lib/media.mjs';
import { report } from '../tools/content-pipeline/lib/report-missing.mjs';

const violations = [];
const expect = (cond, rule, detail) => { if (!cond) violations.push(`${rule}: ${detail}`); };

const tempDir = fs.mkdtempSync('media-verify-');
const tempRegistry = path.join(tempDir, 'registry.json');
const registry = loadRegistry(tempRegistry);

// --- fixture synthesis: a REAL 0.5s sine WAV (actual audio, not silence) ---
function makeWav(samples, sampleRate = 8000) {
  const dataLength = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + dataLength, 4); buffer.write('WAVE', 8);
  buffer.write('fmt ', 12); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22); buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34); buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  samples.forEach((s, i) => buffer.writeInt16LE(s, 44 + i * 2));
  return buffer;
}
const tone = Array.from({ length: 4000 }, (_, i) => Math.round(12000 * Math.sin((2 * Math.PI * 440 * i) / 8000)));
const silence = Array.from({ length: 4000 }, () => 0);
const toneWav = makeWav(tone);
const silenceWav = makeWav(silence);
const toneFile = path.join(tempDir, 'st07-p1-real-tone.wav');
const silenceFile = path.join(tempDir, 'st07-silence.wav');
fs.writeFileSync(toneFile, toneWav);
fs.writeFileSync(silenceFile, silenceWav);

// 1. Real tone registers with parsed duration + recomputed hash.
const record = registerAsset(registry, {
  assetId: 'ST07.P1.s01.a', kind: 'audio', file: toneFile,
  source: 'synthesized-fixture (test only — never a delivered product asset)',
  recordedBy: 'media-pipeline-verifier', rightsStatus: 'PENDING_REVIEW',
  sha256: crypto.createHash('sha256').update(toneWav).digest('hex'),
});
expect(record.durationSec > 0.4 && record.durationSec < 0.6, 'audio-duration', String(record.durationSec));
expect(record.sha256.length === 64, 'audio-hash', record.sha256);

// 2. Silence is rejected.
let caught = null;
try { registerAsset(registry, { assetId: 'ST07.silence', kind: 'audio', file: silenceFile, source: 'fixture', recordedBy: 'v', rightsStatus: 'PENDING_REVIEW' }); } catch (e) { caught = e; }
expect(caught instanceof AssetRejected && caught.message.includes('audio-silence'), 'audio-silence', caught?.message ?? 'not rejected');

// 3. Hash mismatch is rejected.
caught = null;
try { registerAsset(registry, { assetId: 'ST07.hashdrift', kind: 'audio', file: toneFile, source: 'fixture', recordedBy: 'v', rightsStatus: 'PENDING_REVIEW', sha256: 'deadbeef'.repeat(4) }); } catch (e) { caught = e; }
expect(caught?.message.includes('hash-mismatch'), 'hash-mismatch', caught?.message ?? 'not rejected');

// 4. Placeholder-named file is rejected.
const placeholderFile = path.join(tempDir, 'st07-placeholder.png');
fs.writeFileSync(placeholderFile, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
caught = null;
try { registerAsset(registry, { assetId: 'ST07.placeholder', kind: 'image', file: placeholderFile, source: 'fixture', recordedBy: 'v', rightsStatus: 'PENDING_REVIEW' }); } catch (e) { caught = e; }
expect(caught?.message.includes('placeholder-marker'), 'placeholder-marker', caught?.message ?? 'not rejected');

// 5. Missing file is rejected.
caught = null;
try { registerAsset(registry, { assetId: 'ST07.missing', kind: 'audio', file: path.join(tempDir, 'not-there.wav'), source: 'fixture', recordedBy: 'v', rightsStatus: 'PENDING_REVIEW' }); } catch (e) { caught = e; }
expect(caught?.message.includes('file-missing'), 'file-missing', caught?.message ?? 'not rejected');

// 6. Image dims parsed.
const png = Buffer.alloc(33);
png[0] = 0x89; png.write('PNG', 1); png.writeUInt32BE(320, 16); png.writeUInt32BE(240, 20);
const imgFile = path.join(tempDir, 'obj-sun.png');
fs.writeFileSync(imgFile, png);
const imageRecord = registerAsset(registry, { assetId: 'OBJ.sun', kind: 'image', file: imgFile, source: 'fixture', recordedBy: 'v', rightsStatus: 'PENDING_REVIEW' });
expect(imageRecord.width === 320 && imageRecord.height === 240, 'image-dims', `${imageRecord.width}x${imageRecord.height}`);

// 7. The honest inventory (metadata reality unchanged).
const inventory = report(tempRegistry);
expect(inventory.metadataReality.draftAudioRows === 232, 'inventory-audio-rows', String(inventory.metadataReality.draftAudioRows));
expect(inventory.metadataReality.audioBinaries === 0, 'inventory-binaries', 'must be zero');
expect(inventory.metadataReality.stationImageAssets === 0, 'inventory-images', 'must be zero');
expect(inventory.missing.st07AudioBinaries.length === 53, 'missing-st07-audio', String(inventory.missing.st07AudioBinaries.length));
expect(inventory.missing.st07ImageAssets.length > 0, 'missing-st07-images', String(inventory.missing.st07ImageAssets.length));
expect(inventory.impact.ST07.blocks.length >= 3, 'impact-st07', 'gates blocked by undelivered media');

fs.rmSync(tempDir, { recursive: true, force: true });
if (violations.length > 0) {
  console.log(violations.map((v) => `VIOLATION ${v}`).join('\n'));
  console.log(`MEDIA_PIPELINE: FAIL (${violations.length})`);
  process.exit(1);
}
console.log('MEDIA_PIPELINE: PASS (real tone accepted w/ parsed duration, silence/hash/placeholder/missing rejected, honest inventory 232/0/0, ST07 impact 53 audio + images)');
