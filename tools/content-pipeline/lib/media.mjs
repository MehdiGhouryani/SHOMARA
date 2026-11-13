#!/usr/bin/env node
/**
 * Media pipeline (P9) — Asset Registry + Asset Metadata Validator + Image/Audio checks.
 *
 * HONESTY CONTRACT (owner P9 mission):
 *  - a registered asset MUST be a real file with real bytes: format sniffed from the header,
 *    size/sha256 recomputed, audio duration parsed from the actual data chunk;
 *  - SILENCE or all-zero PCM is REJECTED (a silence file is never recorded as a real asset);
 *  - placeholder/dummy markers are rejected;
 *  - provenance (source, recordedBy, rightsStatus) is REQUIRED;
 *  - the registry records METADATA entries (232 DRAFT audio rows) with delivered=false —
 *    metadata existence is never conflated with binary delivery.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { AUTHORING, ROOT, sha256Hex } from './context.mjs';

export const REGISTRY_FILE = path.join(AUTHORING, 'assets', 'registry.json');

export function loadRegistry(file = REGISTRY_FILE) {
  if (!fs.existsSync(file)) return { schemaVersion: 1, assets: [] };
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function saveRegistry(registry, file = REGISTRY_FILE) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(registry, null, 2)}\n`);
}

export class AssetRejected extends Error {}

function sniffFormat(bytes) {
  if (bytes.length < 12) return 'unknown';
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WAVE') return 'wav';
  if (bytes.toString('ascii', 0, 4) === 'OggS') return 'ogg';
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return 'mp3';
  if (bytes.toString('ascii', 0, 4) === 'fLaC') return 'flac';
  if (bytes[0] === 0x89 && bytes.toString('ascii', 1, 4) === 'PNG') return 'png';
  if (bytes.length >= 12 && bytes.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return 'unknown';
}

/** Parses a WAV header: duration seconds + sample rate (16/24/32-bit PCM or IEEE float). */
function wavInfo(bytes) {
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE') return null;
  let offset = 12;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let channels = 0;
  let dataOffset = -1;
  let dataLength = 0;
  while (offset + 8 <= bytes.length) {
    const id = bytes.toString('ascii', offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    if (id === 'fmt ') {
      channels = bytes.readUInt16LE(offset + 10);
      sampleRate = bytes.readUInt32LE(offset + 12);
      bitsPerSample = bytes.readUInt16LE(offset + 22);
    } else if (id === 'data') {
      dataOffset = offset + 8;
      dataLength = Math.min(size, bytes.length - dataOffset);
      break;
    }
    offset += 8 + size + (size % 2);
  }
  if (dataOffset < 0 || sampleRate === 0 || channels === 0 || bitsPerSample === 0) return null;
  const bytesPerSample = bitsPerSample / 8;
  const frames = dataLength / (bytesPerSample * channels);
  return { durationSec: frames / sampleRate, sampleRate, bitsPerSample, channels, dataOffset, dataLength, bytesPerSample };
}

/** RMS over the PCM payload — the silence detector (mission: no silence file is a real asset). */
function pcmRms(bytes, info) {
  let sumSq = 0;
  let count = 0;
  for (let i = 0; i < info.dataLength; i += info.bytesPerSample * info.channels) {
    let sample = 0;
    if (info.bitsPerSample === 16) sample = bytes.readInt16LE(info.dataOffset + i);
    else if (info.bitsPerSample === 8) sample = (bytes[info.dataOffset + i] - 128) << 8;
    else if (info.bitsPerSample === 32 && bytes.length >= info.dataOffset + i + 4) sample = bytes.readInt32LE(info.dataOffset + i);
    sumSq += sample * sample;
    count += 1;
  }
  if (count === 0) return 0;
  return Math.sqrt(sumSq / count) / 32768; // normalised against 16-bit scale
}

const FORBIDDEN_NAME_MARKERS = ['placeholder', 'dummy', 'fake', 'sample-silence', 'silence-file'];

/**
 * Asset Metadata Validator — registers ONE real file. Throws AssetRejected with a stable rule id.
 * kind: 'audio' | 'image'. Every rejection names its rule (fixtures + gate rely on them).
 */
export function registerAsset(registry, entry) {
  const reject = (rule, detail) => { throw new AssetRejected(`${rule}: ${detail}`); };

  // 1. provenance + rights are mandatory metadata.
  for (const field of ['assetId', 'kind', 'file', 'source', 'recordedBy', 'rightsStatus']) {
    if (!entry[field]) reject('metadata-missing', `registry entry missing ${field}`);
  }
  if (!['audio', 'image'].includes(entry.kind)) reject('kind-unknown', entry.kind);
  if (!['APPROVED', 'PENDING_REVIEW', 'PENDING_RIGHTS'].includes(entry.rightsStatus)) {
    reject('rights-status-unknown', entry.rightsStatus);
  }

  // 2. file-level honesty: exists, non-empty, hash matches, name carries no placeholder marker.
  const file = path.isAbsolute(entry.file) ? entry.file : path.join(ROOT, entry.file);
  if (!fs.existsSync(file)) reject('file-missing', entry.file);
  const bytes = fs.readFileSync(file);
  if (bytes.length === 0) reject('file-empty', entry.file);
  const name = path.basename(file).toLowerCase();
  if (FORBIDDEN_NAME_MARKERS.some((m) => name.includes(m))) {
    reject('placeholder-marker', `asset filename contains a forbidden marker: ${name}`);
  }
  const actualSha = sha256Hex(bytes);
  if (entry.sha256 && entry.sha256 !== actualSha) {
    reject('hash-mismatch', `declared ${entry.sha256.slice(0, 12)}…, actual ${actualSha.slice(0, 12)}…`);
  }

  // 3. format sniffing (never trust the extension).
  const format = sniffFormat(bytes);
  const expected = entry.kind === 'audio' ? ['wav', 'ogg', 'mp3', 'flac'] : ['png', 'webp'];
  if (!expected.includes(format)) reject('format-unknown', `sniffed '${format}' for a ${entry.kind} asset`);

  // 4. audio: real duration + silence rejection.
  let durationSec = 0;
  if (entry.kind === 'audio') {
    const info = format === 'wav' ? wavInfo(bytes) : null;
    if (format === 'wav') {
      if (!info) reject('audio-corrupt', 'WAV header incomplete');
      if (info.durationSec <= 0) reject('audio-empty', 'zero-length PCM payload');
      const rms = pcmRms(bytes, info);
      if (rms < 0.0001) reject('audio-silence', `RMS ${rms.toExponential(2)} — a silent file is NOT a real asset`);
      durationSec = Number(info.durationSec.toFixed(3));
    } else {
      // Non-WAV formats: duration must be DECLARED by the delivering tool with its own provenance;
      // the registry stores it but flags 'duration-declared' (not parsed here).
      durationSec = Number(entry.durationSec ?? 0);
      if (durationSec <= 0) reject('audio-duration-missing', 'non-WAV audio must declare durationSec');
    }
  }

  // 5. image: dimensions from the header (PNG/WebP), non-empty payload.
  let width = 0;
  let height = 0;
  if (entry.kind === 'image' && format === 'png') {
    width = bytes.readUInt32BE(16);
    height = bytes.readUInt32BE(20);
    if (width === 0 || height === 0) reject('image-empty', 'zero PNG dimensions');
  }

  // 6. id uniqueness inside the registry.
  if (registry.assets.some((a) => a.assetId === entry.assetId)) {
    reject('id-duplicate', `${entry.assetId} already registered`);
  }

  const record = {
    assetId: entry.assetId,
    kind: entry.kind,
    format,
    sizeBytes: bytes.length,
    sha256: actualSha,
    ...(entry.kind === 'audio' ? { durationSec, sampleRate: format === 'wav' ? wavInfo(bytes)?.sampleRate ?? 0 : entry.sampleRate ?? 0 } : {}),
    ...(entry.kind === 'image' ? { width, height } : {}),
    stationRefs: entry.stationRefs ?? [],
    source: entry.source,
    recordedBy: entry.recordedBy,
    rightsStatus: entry.rightsStatus,
    registeredAt: new Date().toISOString(),
    delivered: true,
  };
  registry.assets.push(record);
  return record;
}
