/**
 * N07-05/08/09 — CMS publishing contract, draft audio import, and editorial governance.
 * TypeScript side (packages/content-delivery): the CMS is the SYSTEM OF RECORD for the audio
 * pipeline; the Kotlin side consumes verified packages only.
 *
 * Hard rules:
 *  - AudioScriptMetadata (draft scripts) and binary AudioAssetVersion are STRICTLY separate.
 *  - Every imported draft row is locked: scriptStatus=DRAFT, publishState=UNPUBLISHED_NO_BINARY.
 *  - voiceProfileId is abstract; provider names survive only as non-authoritative hints.
 *  - No auto-approval, no fake TTS-binary claims, zero hardcoded URLs.
 *  - Missing binary audio NEVER blocks a lesson (visible Persian text fallback).
 */
import { createHash } from 'node:crypto';

export const AUDIO_PUBLISH_STAGES = [
  'DRAFT',
  'GENERATED_OR_UPLOADED',
  'TECHNICALLY_VALIDATED',
  'LISTENED',
  'RIGHTS_CLEARED',
  'APPROVED',
  'PUBLISHED',
] as const;
export type AudioPublishStage = (typeof AUDIO_PUBLISH_STAGES)[number];

export const CMS_ROLES = [
  'CURRICULUM_REVIEWER',
  'PERSIAN_PRONUNCIATION_REVIEWER',
  'ACCESSIBILITY_REVIEWER',
  'RIGHTS_MODERATOR',
  'PUBLISHER_ADMIN',
] as const;
export type CmsRole = (typeof CMS_ROLES)[number];

export const DRAFT_STATUS = 'DRAFT';
export const UNPUBLISHED_NO_BINARY = 'UNPUBLISHED_NO_BINARY';

/** Script metadata (draft CSV row): text + purpose, NO binary claims. */
export interface AudioScriptMetadata {
  audioId: string;
  purpose: string;
  textDisplay: string;
  textTts: string;
  scriptStatus: typeof DRAFT_STATUS;
  usedBy: string[];
  /** CONTENT-006/013: provider hint is NON-authoritative metadata, never a voice identity. */
  providerVoiceHint: string;
}

/** Binary asset version (created only when a real TTS/upload binary exists). */
export interface AudioAssetVersion {
  audioId: string;
  assetVersion: number;
  format: string;
  durationMs: number;
  sha256: string;
  sourceKind: 'TTS' | 'HUMAN_UPLOAD';
  voiceProfileId: string;
  rightsStatus: string;
  moderationStatus: string;
  reviewEvidence: Array<{ actorId: string; role: CmsRole; timestampIso: string; reason: string }>;
  publishState: AudioPublishStage;
  /** Script binding hashes for the impact report (set when a binary is generated from a script). */
  scriptSha256?: string;
  boundTextSha256?: string;
}

/** CSV row → draft metadata (idempotent import, DRAFT-locked). */
export function draftFromCsvRow(row: Record<string, string>): AudioScriptMetadata {
  const audioId = (row.id ?? '').trim();
  if (!audioId) throw new Error('DRAFT_IMPORT_REJECTED: empty audioId');
  return {
    audioId,
    purpose: (row.kind ?? 'prompt').trim(),
    textDisplay: (row.text_display ?? '').trim(),
    textTts: (row.text_tts ?? row.text_display ?? '').trim(),
    scriptStatus: DRAFT_STATUS,
    usedBy: (row.used_by ?? '').split(';').map((x) => x.trim()).filter((x) => x.length > 0),
    providerVoiceHint: (row.voice ?? '').trim(),
  };
}

/** Idempotent importer: same rows in → identical registry out; DRAFT lock enforced. */
export function importDraftRows(rows: Array<Record<string, string>>): Map<string, AudioScriptMetadata> {
  const registry = new Map<string, AudioScriptMetadata>();
  for (const row of rows) {
    const draft = draftFromCsvRow(row);
    registry.set(draft.audioId, draft);
  }
  return registry;
}

export function sha256Hex(bytes: Uint8Array | string): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/** RBAC transition table: which role may move an asset into which stage. */
const TRANSITION_ROLES: Record<AudioPublishStage, CmsRole> = {
  DRAFT: 'PUBLISHER_ADMIN',
  GENERATED_OR_UPLOADED: 'PUBLISHER_ADMIN',
  TECHNICALLY_VALIDATED: 'PUBLISHER_ADMIN',
  LISTENED: 'PERSIAN_PRONUNCIATION_REVIEWER',
  RIGHTS_CLEARED: 'RIGHTS_MODERATOR',
  APPROVED: 'CURRICULUM_REVIEWER',
  PUBLISHED: 'PUBLISHER_ADMIN',
};

export interface AuditEntry {
  actorId: string;
  role: CmsRole;
  fromStage: AudioPublishStage;
  toStage: AudioPublishStage;
  timestampIso: string;
  reason: string;
}

export interface AssetWithAudit {
  asset: AudioAssetVersion;
  auditTrail: AuditEntry[];
}

export function transitionStage(
  holder: AssetWithAudit,
  toStage: AudioPublishStage,
  actor: { actorId: string; role: CmsRole },
  timestampIso: string,
  reason: string,
): AssetWithAudit {
  const from = holder.asset.publishState;
  const fromIndex = AUDIO_PUBLISH_STAGES.indexOf(from);
  const toIndex = AUDIO_PUBLISH_STAGES.indexOf(toStage);
  if (toIndex !== fromIndex + 1) {
    throw new Error(`TRANSITION_REJECTED: ${from} → ${toStage} is not the next stage`);
  }
  const requiredRole = TRANSITION_ROLES[toStage];
  if (actor.role !== requiredRole) {
    throw new Error(`RBAC_REJECTED: ${toStage} requires ${requiredRole}, actor has ${actor.role}`);
  }
  // CONTENT-013: entering RIGHTS_CLEARED (or beyond) requires evidence that a pronunciation
  // reviewer actually LISTENED — regardless of how the asset reached its current stage.
  if (toIndex >= AUDIO_PUBLISH_STAGES.indexOf('RIGHTS_CLEARED')) {
    if (!holder.auditTrail.some((entry) => entry.role === 'PERSIAN_PRONUNCIATION_REVIEWER' && entry.toStage === 'LISTENED')) {
      throw new Error('LISTEN_REVIEW_REQUIRED');
    }
  }
  return {
    asset: { ...holder.asset, publishState: toStage },
    auditTrail: [...holder.auditTrail, { actorId: actor.actorId, role: actor.role, fromStage: from, toStage, timestampIso, reason }],
  };
}

/** Reversible publish: PUBLISHED state records a package checksum for rollback. */
export function publishWithChecksum(holder: AssetWithAudit, actor: { actorId: string; role: CmsRole }, timestampIso: string, packageBytes: string): { published: AssetWithAudit; packageSha256: string } {
  const rolled = transitionStage(holder, 'PUBLISHED', actor, timestampIso, `package ${sha256Hex(packageBytes).slice(0, 12)}…`);
  return { published: rolled, packageSha256: sha256Hex(packageBytes) };
}

export function rollbackToStage(holder: AssetWithAudit, targetStage: AudioPublishStage, actor: { actorId: string; role: CmsRole }, timestampIso: string, reason: string): AssetWithAudit {
  if (actor.role !== 'PUBLISHER_ADMIN') throw new Error('RBAC_REJECTED: rollback requires PUBLISHER_ADMIN');
  const currentIndex = AUDIO_PUBLISH_STAGES.indexOf(holder.asset.publishState);
  const targetIndex = AUDIO_PUBLISH_STAGES.indexOf(targetStage);
  if (targetIndex >= currentIndex) throw new Error('ROLLBACK_REJECTED: target is not a previous stage');
  return {
    asset: { ...holder.asset, publishState: targetStage },
    auditTrail: [...holder.auditTrail, { actorId: actor.actorId, role: actor.role, fromStage: holder.asset.publishState, toStage: targetStage, timestampIso, reason }],
  };
}

/** Editorial reports. */
export interface EditorialReports {
  impact: Array<{ audioId: string; reason: string }>;
  orphans: string[];
  missingBinaries: Array<{ audioId: string; usedBy: string[] }>;
}

export function buildReports(
  registry: Map<string, AudioScriptMetadata>,
  assets: Map<string, AudioAssetVersion>,
  referencedAudioIds: ReadonlySet<string>,
  scriptTexts: ReadonlyMap<string, string>,
): EditorialReports {
  const impact: EditorialReports['impact'] = [];
  const orphans: string[] = [];
  const missingBinaries: EditorialReports['missingBinaries'] = [];
  for (const [audioId, draft] of registry) {
    const asset = assets.get(audioId);
    const currentText = scriptTexts.get(audioId) ?? draft.textTts;
    if (asset && asset.scriptSha256 !== undefined) {
      // Script text changed after the binary was generated → binary invalidated.
      if (asset.boundTextSha256 !== undefined && asset.boundTextSha256 !== sha256Hex(currentText)) {
        impact.push({ audioId, reason: 'script text changed after binary generation' });
      }
    }
    if (!referencedAudioIds.has(audioId)) orphans.push(audioId);
    if (!asset || asset.publishState !== 'PUBLISHED') {
      missingBinaries.push({ audioId, usedBy: draft.usedBy });
    }
  }
  return { impact, orphans, missingBinaries };
}
