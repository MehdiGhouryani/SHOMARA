/**
 * N08-13 — CMS audio admin panel backend (apps/web side).
 *
 * The governance core (RBAC transitions, LISTEN_REVIEW_REQUIRED, checksums,
 * impact/orphan/missing reports) is the tested module in
 * `packages/content-delivery/src/cms-audio.ts`; this file is a thin repository
 * adapter that:
 *  1. seeds 232 DRAFT script rows idempotently from content-library CSVs
 *     (originals are read-only and byte-protected — never written);
 *  2. persists scripts, binary asset versions and audit entries in memory for
 *     dev, with a fail-closed production gate until a Supabase-backed
 *     repository ships (same pattern as runtime-gates.ts);
 *  3. maps account roles (ADMIN/TEACHER) onto the CMS review roles.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  AUDIO_PUBLISH_STAGES,
  CMS_ROLES,
  DRAFT_STATUS,
  UNPUBLISHED_NO_BINARY,
  draftFromCsvRow,
  importDraftRows,
  transitionStage,
  rollbackToStage,
  buildReports,
  sha256Hex,
  type AudioAssetVersion,
  type AudioScriptMetadata,
  type AssetWithAudit,
  type AuditEntry,
  type CmsRole,
  type EditorialReports,
} from '@math/content-delivery';

export { AUDIO_PUBLISH_STAGES, CMS_ROLES, DRAFT_STATUS, UNPUBLISHED_NO_BINARY };

/** Account role → CMS editorial role. Only ADMIN/TEACHER map; child/parent never. */
export function cmsRoleForAccountRole(accountRole: string): CmsRole | null {
  switch (accountRole) {
    case 'ADMIN': return 'PUBLISHER_ADMIN';
    case 'TEACHER': return 'CURRICULUM_REVIEWER';
    default: return null;
  }
}

// ---------------------------------------------------------------------------
// Script registry (seeded, DRAFT-locked)
// ---------------------------------------------------------------------------

function readCsvRows(relative: string): Array<Record<string, string>> {
  const candidates = [
    path.resolve(process.cwd(), '..', '..', relative),
    path.resolve(process.cwd(), relative),
    path.resolve(process.cwd(), 'apps', 'web', '..', '..', relative),
  ];
  const file = candidates.find((candidate) => fs.existsSync(/*turbopackIgnore: true*/ candidate));
  if (!file) throw new Error('AUDIO_CSV_NOT_FOUND');
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0]!.split(',');
  return lines.slice(1).map((line) => {
    const fields = line.split(',');
    const row: Record<string, string> = {};
    for (const header of headers) row[header] = fields[headers.indexOf(header)] ?? '';
    return row;
  });
}

/** Idempotent seed from the two CSV manifests (232 rows, all DRAFT). */
export function seedScriptRegistry(): Map<string, AudioScriptMetadata> {
  const rows = [
    ...readCsvRows('content-library/originals/shomara-global-audio-manifest.csv'),
    ...readCsvRows('content-library/originals/shomara-ST07-audio-manifest.csv'),
  ];
  return importDraftRows(rows);
}

export interface ScriptWithVersions {
  script: AudioScriptMetadata;
  assets: Array<AssetWithAudit>;
}

// ---------------------------------------------------------------------------
// In-memory admin repository (dev/staging only; production fails closed)
// ---------------------------------------------------------------------------

const PERSISTENT_AUDIO_ADMIN_REPO_IMPLEMENTED = false;

function assertAudioAdminBackendReady(): void {
  if (process.env.NODE_ENV === 'production' && !PERSISTENT_AUDIO_ADMIN_REPO_IMPLEMENTED) {
    throw new Error('AUDIO_ADMIN_BACKEND_NOT_CONFIGURED');
  }
}

class InMemoryAudioAdminRepository {
  private scripts = seedScriptRegistry();
  private readonly assets = new Map<string, AssetWithAudit>();
  private readonly scriptVersions = new Map<string, Array<{ textDisplay: string; textTts: string; editedAt: string; editorAccountId: string }>>();

  listScripts(filter?: { station?: string; kind?: string; hasBinary?: boolean }): Array<ScriptWithVersions> {
    assertAudioAdminBackendReady();
    const result: Array<ScriptWithVersions> = [];
    for (const [audioId, script] of this.scripts) {
      if (filter?.station && !audioId.startsWith(filter.station)) continue;
      if (filter?.kind && script.purpose !== filter.kind) continue;
      const holder = this.assets.get(audioId);
      if (filter?.hasBinary === true && !holder) continue;
      if (filter?.hasBinary === false && holder) continue;
      result.push({ script: { ...script }, assets: holder ? [this.snapshotHolder(holder)] : [] });
    }
    return result.sort((a, b) => a.script.audioId.localeCompare(b.script.audioId));
  }

  getScriptDetail(audioId: string): { script: AudioScriptMetadata; assets: Array<AssetWithAudit>; history: Array<{ textDisplay: string; textTts: string; editedAt: string; editorAccountId: string }> } | null {
    assertAudioAdminBackendReady();
    const script = this.scripts.get(audioId);
    if (!script) return null;
    const holder = this.assets.get(audioId);
    return {
      script: { ...script },
      assets: holder ? [this.snapshotHolder(holder)] : [],
      history: [...(this.scriptVersions.get(audioId) ?? [])],
    };
  }

  /**
   * Stage5 §1.10: edit text_display / text_tts side by side (shared lines warn via reports).
   * Editing a script invalidates generated binaries (impact report detects via boundTextSha256).
   */
  editScript(
    audioId: string,
    update: { textDisplay: string; textTts: string },
    editor: { accountId: string; role: CmsRole },
  ): AudioScriptMetadata {
    assertAudioAdminBackendReady();
    const script = this.scripts.get(audioId);
    if (!script) throw new Error('AUDIO_SCRIPT_NOT_FOUND');
    if (update.textDisplay.length > 200 || update.textTts.length > 300) throw new Error('AUDIO_SCRIPT_TEXT_TOO_LONG');
    const edited: AudioScriptMetadata = {
      ...script,
      textDisplay: update.textDisplay.trim(),
      textTts: update.textTts.trim(),
    };
    this.scripts.set(audioId, edited);
    const versions = this.scriptVersions.get(audioId) ?? [];
    versions.push({ textDisplay: edited.textDisplay, textTts: edited.textTts, editedAt: new Date().toISOString(), editorAccountId: editor.accountId });
    this.scriptVersions.set(audioId, versions);
    return { ...edited };
  }

  /**
   * Stage5 §1.10 item 4: upload a replacement binary (real TTS/upload file) — creates a NEW
   * asset version with checksum + duration + provenance. No fake binaries.
   */
  uploadBinary(
    audioId: string,
    binary: { sha256: string; durationMs: number; format: string; bytes: number; sourceKind: 'TTS' | 'HUMAN_UPLOAD'; voiceProfileId: string },
    uploader: { accountId: string; role: CmsRole },
  ): AssetWithAudit {
    assertAudioAdminBackendReady();
    const script = this.scripts.get(audioId);
    if (!script) throw new Error('AUDIO_SCRIPT_NOT_FOUND');
    if (binary.bytes <= 0 || binary.durationMs <= 0) throw new Error('AUDIO_BINARY_INVALID');
    if (!/^[a-f0-9]{64}$/.test(binary.sha256)) throw new Error('AUDIO_BINARY_CHECKSUM_INVALID');
    const existing = this.assets.get(audioId);
    const version = (existing?.asset.assetVersion ?? 0) + 1;
    const asset: AudioAssetVersion = {
      audioId,
      assetVersion: version,
      format: binary.format,
      durationMs: binary.durationMs,
      sha256: binary.sha256,
      sourceKind: binary.sourceKind,
      voiceProfileId: binary.voiceProfileId,
      rightsStatus: 'UNSETTLED',
      moderationStatus: 'PENDING',
      reviewEvidence: [],
      publishState: 'GENERATED_OR_UPLOADED',
      scriptSha256: sha256Hex(`${script.audioId}|v${version}`),
      boundTextSha256: sha256Hex(script.textTts),
    };
    const entry: AuditEntry = {
      actorId: uploader.accountId,
      role: uploader.role,
      fromStage: 'DRAFT',
      toStage: 'GENERATED_OR_UPLOADED',
      timestampIso: new Date().toISOString(),
      reason: `upload ${binary.sha256.slice(0, 12)}… (${binary.bytes} bytes, ${binary.durationMs}ms)`,
    };
    const holder: AssetWithAudit = { asset, auditTrail: [entry] };
    this.assets.set(audioId, holder);
    return this.snapshotHolder(holder);
  }

  transition(audioId: string, toStage: (typeof AUDIO_PUBLISH_STAGES)[number], actor: { accountId: string; role: CmsRole }, reason: string): AssetWithAudit {
    assertAudioAdminBackendReady();
    const holder = this.assets.get(audioId);
    if (!holder) throw new Error('AUDIO_ASSET_NOT_FOUND');
    const rolled = transitionStage(holder, toStage, { actorId: actor.accountId, role: actor.role }, new Date().toISOString(), reason);
    this.assets.set(audioId, rolled);
    return this.snapshotHolder(rolled);
  }

  rollback(audioId: string, targetStage: (typeof AUDIO_PUBLISH_STAGES)[number], actor: { accountId: string; role: CmsRole }, reason: string): AssetWithAudit {
    assertAudioAdminBackendReady();
    const holder = this.assets.get(audioId);
    if (!holder) throw new Error('AUDIO_ASSET_NOT_FOUND');
    const rolled = rollbackToStage(holder, targetStage, { actorId: actor.accountId, role: actor.role }, new Date().toISOString(), reason);
    this.assets.set(audioId, rolled);
    return this.snapshotHolder(rolled);
  }

  reports(): EditorialReports {
    assertAudioAdminBackendReady();
    const referenced = new Set<string>();
    for (const script of this.scripts.values()) {
      for (const usage of script.usedBy) referenced.add(usage);
    }
    // Every script row itself counts as referenced (it is addressed by its own audioId).
    for (const audioId of this.scripts.keys()) referenced.add(audioId);
    const assets = new Map<string, AudioAssetVersion>();
    for (const [audioId, holder] of this.assets) assets.set(audioId, { ...holder.asset });
    const scriptTexts = new Map<string, string>();
    for (const [audioId, script] of this.scripts) scriptTexts.set(audioId, script.textTts);
    return buildReports(this.scripts, assets, referenced, scriptTexts);
  }

  private snapshotHolder(holder: AssetWithAudit): AssetWithAudit {
    return { asset: { ...holder.asset }, auditTrail: holder.auditTrail.map((entry) => ({ ...entry })) };
  }
}

export const audioAdminRepository = new InMemoryAudioAdminRepository();
