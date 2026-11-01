import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CMS_ROLES,
  DRAFT_STATUS,
  UNPUBLISHED_NO_BINARY,
  AudioAssetVersion,
  buildReports,
  draftFromCsvRow,
  importDraftRows,
  publishWithChecksum,
  rollbackToStage,
  sha256Hex,
  transitionStage,
} from '../cms-audio';

function extraGlobalRows(): Array<Record<string, string>> {
  return Array.from({ length: 179 }, (_, i) => ({
    id: `G.ok.${String(i + 1).padStart(2, '0')}`,
    kind: 'feedback',
    text_display: `بازخورد ${i + 1}`,
    text_tts: `بازخورد ${i + 1}`,
    voice: 'fa-IR-DilaraNeural',
    status: 'draft',
    used_by: 'global',
  }));
}
const st07Rows: Array<Record<string, string>> = Array.from({ length: 53 }, (_, i) => ({
  id: `ST07.S.row${String(i + 1).padStart(2, '0')}`,
  kind: 'prompt',
  text_display: `درس ۷ سطر ${i + 1}`,
  text_tts: `درس ۷ سطر ${i + 1}`,
  voice: 'fa-IR-DilaraNeural',
  status: 'draft',
  used_by: 'ST07',
}));

describe('N07-08 draft audio import (232 rows, DRAFT-locked)', () => {
  it('imports 179 + 53 = 232 rows idempotently', () => {
    const first = importDraftRows([...st07Rows, ...extraGlobalRows()]);
    expect(first.size).toBe(232);
    const second = importDraftRows([...st07Rows, ...extraGlobalRows()]);
    expect(second).toEqual(first); // idempotent
  });

  it('locks every record to DRAFT / UNPUBLISHED_NO_BINARY with provider hint only', () => {
    const registry = importDraftRows([...st07Rows, ...extraGlobalRows()]);
    for (const draft of registry.values()) {
      expect(draft.scriptStatus).toBe(DRAFT_STATUS);
      expect(draft.providerVoiceHint).toBe('fa-IR-DilaraNeural');
      const serialized = JSON.stringify(draft);
      expect(serialized).not.toContain('publishState');
      expect(serialized).not.toContain('voiceProfileId');
      expect(serialized).not.toContain('sha256');
    }
    expect(UNPUBLISHED_NO_BINARY).toBe('UNPUBLISHED_NO_BINARY');
  });

  it('rejects rows without an id and deduplicates identical ids', () => {
    expect(() => draftFromCsvRow({})).toThrow('DRAFT_IMPORT_REJECTED');
    const deduped = importDraftRows([{ id: 'x' }, { id: 'x', kind: 'reward' }]);
    expect(deduped.size).toBe(1);
    expect(deduped.get('x')?.purpose).toBe('reward'); // last wins, idempotent
  });
});

describe('N07-05/09 CMS publishing governance (HG-03 approved)', () => {
  const admin = { actorId: 'admin-1', role: 'PUBLISHER_ADMIN' as const };
  const listener = { actorId: 'pron-1', role: 'PERSIAN_PRONUNCIATION_REVIEWER' as const };
  const rights = { actorId: 'rights-1', role: 'RIGHTS_MODERATOR' as const };
  const curriculum = { actorId: 'curr-1', role: 'CURRICULUM_REVIEWER' as const };

  function freshAsset(): { asset: AudioAssetVersion; auditTrail: Array<any> } {
    const asset: AudioAssetVersion = {
      audioId: 'ST07.P1.s01.a',
      assetVersion: 1,
      format: 'ogg',
      durationMs: 1200,
      sha256: sha256Hex('binary'),
      sourceKind: 'TTS',
      voiceProfileId: 'vp-fa-01',
      rightsStatus: 'CLEARED',
      moderationStatus: 'APPROVED',
      reviewEvidence: [],
      publishState: 'GENERATED_OR_UPLOADED',
      boundTextSha256: sha256Hex('درس متن'),
    };
    return { asset, auditTrail: [] };
  }

  it('full RBAC pipeline reaches PUBLISHED only through the role chain in order', () => {
    let holder = freshAsset();
    holder = transitionStage(holder, 'TECHNICALLY_VALIDATED', admin, '2026-11-01T10:00', 'format checked');
    // Skipping stages is rejected before anything else (adjacency check first).
    expect(() => transitionStage(holder, 'RIGHTS_CLEARED', rights, '2026-11-01T10:01', 'skip listen')).toThrow('TRANSITION_REJECTED');
    holder = transitionStage(holder, 'LISTENED', listener, '2026-11-01T10:02', 'heard, correct Persian');
    holder = transitionStage(holder, 'RIGHTS_CLEARED', rights, '2026-11-01T10:03', 'rights ok');
    holder = transitionStage(holder, 'APPROVED', curriculum, '2026-11-01T10:04', 'curriculum ok');
    const { published, packageSha256 } = publishWithChecksum(holder, admin, '2026-11-01T10:05', 'package-bytes');
    expect(published.asset.publishState).toBe('PUBLISHED');
    expect(packageSha256).toBe(sha256Hex('package-bytes'));
    // Audit trail records actor/role/time/reason on every transition (4 transitions + publish).
    expect(published.auditTrail.length).toBe(5);
    for (const entry of published.auditTrail) {
      expect(entry.actorId).toBeTruthy();
      expect(CMS_ROLES).toContain(entry.role);
      expect(entry.timestampIso).toBeTruthy();
      expect(entry.reason).toBeTruthy();
    }
  });

  it('RBAC rejects wrong roles and skipped stages', () => {
    let holder = freshAsset() as any;
    // From GENERATED_OR_UPLOADED the next stage is TECHNICALLY_VALIDATED (admin-only): the
    // listener's role is wrong here.
    expect(() => transitionStage(holder, 'TECHNICALLY_VALIDATED', listener, 't', 'r')).toThrow('RBAC_REJECTED');
    holder = transitionStage(holder, 'TECHNICALLY_VALIDATED', admin, 't', 'r');
    expect(() => transitionStage(holder, 'APPROVED', curriculum, 't', 'skip stages')).toThrow('TRANSITION_REJECTED');
  });

  it('LISTEN_REVIEW_REQUIRED guards RIGHTS_CLEARED when the trail has no pronunciation review', () => {
    // A holder already AT LISTENED but with a FORGED empty trail: advancing to RIGHTS_CLEARED
    // requires evidence that a pronunciation reviewer actually listened (CONTENT-013).
    const forged = { asset: { ...(freshAsset().asset), publishState: 'LISTENED' as const }, auditTrail: [] as Array<any> };
    expect(() => transitionStage(forged, 'RIGHTS_CLEARED', rights, 't', 'rights ok')).toThrow('LISTEN_REVIEW_REQUIRED');
    // With a genuine listen entry in the trail the transition succeeds.
    const honest = { ...forged, auditTrail: [{ actorId: 'pron-1', role: 'PERSIAN_PRONUNCIATION_REVIEWER', fromStage: 'TECHNICALLY_VALIDATED', toStage: 'LISTENED', timestampIso: 't', reason: 'heard' }] };
    const advanced = transitionStage(honest, 'RIGHTS_CLEARED', rights, 't2', 'rights ok');
    expect(advanced.asset.publishState).toBe('RIGHTS_CLEARED');
  });

  it('rollback to a previous stage is admin-only and audited', () => {
    let holder = freshAsset() as any;
    holder = transitionStage(holder, 'TECHNICALLY_VALIDATED', admin, 't1', 'r');
    expect(() => rollbackToStage(holder, 'DRAFT', listener, 't2', 'nope')).toThrow('RBAC_REJECTED');
    const rolled = rollbackToStage(holder, 'DRAFT', admin, 't2', 'script changed');
    expect(rolled.asset.publishState).toBe('DRAFT');
    expect(rolled.auditTrail.length).toBe(2);
    expect(() => rollbackToStage(rolled, 'GENERATED_OR_UPLOADED', admin, 't3', 'forward')).toThrow('ROLLBACK_REJECTED');
  });

  it('reports detect script impact, orphans, and missing binaries', () => {
    const registry = importDraftRows([...st07Rows, { id: 'G.orphan.01', kind: 'feedback', used_by: '' }]);
    const assets = new Map<string, AudioAssetVersion>();
    const done = registry.get('ST07.S.row01')!;
    assets.set('ST07.S.row01', {
      audioId: done.audioId, assetVersion: 1, format: 'ogg', durationMs: 900,
      sha256: sha256Hex('b'), sourceKind: 'TTS', voiceProfileId: 'vp-fa-01',
      rightsStatus: 'CLEARED', moderationStatus: 'APPROVED', reviewEvidence: [],
      publishState: 'PUBLISHED', scriptSha256: sha256Hex('متن قدیمی'), boundTextSha256: sha256Hex('متن قدیمی'),
    });
    const scriptTexts = new Map<string, string>([['ST07.S.row01', 'متن تغییر یافته']]);
    const referenced = new Set(['ST07.S.row01']);
    const reports = buildReports(registry, assets, referenced, scriptTexts);
    expect(reports.impact).toEqual([{ audioId: 'ST07.S.row01', reason: 'script text changed after binary generation' }]);
    // Every registry id not referenced by a station is an orphan: 52 unprefixed ST07 rows + the global row.
    expect(reports.orphans.length).toBe(53);
    expect(reports.orphans).toContain('G.orphan.01');
    // All 54 registry rows lack a PUBLISHED binary (only one exists and its text changed... actually it IS published).
    expect(reports.missingBinaries.length).toBe(53); // registry 54 rows minus the 1 PUBLISHED asset
    expect(reports.missingBinaries.every((m) => m.audioId !== 'ST07.S.row01')).toBe(true);
  });

  it('zero hardcoded http(s) audio URLs in the governance module', () => {
    const src = readFileSync('packages/content-delivery/src/cms-audio.ts', 'utf8');
    expect(src).not.toMatch(/https?:\/\//);
  });
});
