import { describe, expect, it } from 'vitest';
import {
  AUDIO_PUBLISH_STAGES,
  cmsRoleForAccountRole,
  seedScriptRegistry,
  audioAdminRepository,
} from '../admin-audio';

const VALID_SHA256 = 'a'.repeat(64);

/**
 * N08-13 — CMS audio admin panel backend (in-memory dev repository).
 * The governance core is tested in packages/content-delivery; here we prove the
 * web adapter: idempotent 232-row seed, RBAC mapping, panel flows and honest
 * "no fake binaries" behavior.
 */
describe('N08-13 role mapping', () => {
  it('maps ADMIN/TEACHER to CMS roles and never CHILD/PARENT', () => {
    expect(cmsRoleForAccountRole('ADMIN')).toBe('PUBLISHER_ADMIN');
    expect(cmsRoleForAccountRole('TEACHER')).toBe('CURRICULUM_REVIEWER');
    expect(cmsRoleForAccountRole('CHILD')).toBeNull();
    expect(cmsRoleForAccountRole('PARENT')).toBeNull();
  });
});

describe('N08-13 script seed (232 rows, DRAFT-locked)', () => {
  it('seeds exactly 232 unique DRAFT rows from the protected CSVs', () => {
    const registry = seedScriptRegistry();
    expect(registry.size).toBe(232);
    for (const script of registry.values()) {
      expect(script.scriptStatus).toBe('DRAFT');
    }
  });

  it('seed is idempotent and the repository exposes all rows with filters', () => {
    const again = seedScriptRegistry();
    expect(again.size).toBe(232);
    const all = audioAdminRepository.listScripts();
    expect(all.length).toBe(232);
    const st07 = audioAdminRepository.listScripts({ station: 'ST07' });
    expect(st07.length).toBe(53);
    // Global manifest prefix families: G=36, N=101, O=20, W=22 (179 total, audio-index.json).
    const feedback = audioAdminRepository.listScripts({ station: 'G' });
    expect(feedback.length).toBe(36);
    const numerals = audioAdminRepository.listScripts({ station: 'N' });
    expect(numerals.length).toBe(101);
    const withBinary = audioAdminRepository.listScripts({ hasBinary: true });
    expect(withBinary.length).toBe(0); // no binaries exist — honest state
  });
});

describe('N08-13 panel flows', () => {
  const admin = { accountId: 'admin-test-01', role: 'PUBLISHER_ADMIN' as const };

  it('edits text_display/text_tts and records history; rejects unknown ids', () => {
    const edited = audioAdminRepository.editScript(
      'ST07.P1.s00.pr',
      { textDisplay: 'متن نمایشی تازه', textTts: 'متن گفتاری تازه' },
      admin,
    );
    expect(edited.textDisplay).toBe('متن نمایشی تازه');
    const detail = audioAdminRepository.getScriptDetail('ST07.P1.s00.pr');
    expect(detail?.history.length).toBe(1);
    expect(detail?.history[0]?.editorAccountId).toBe('admin-test-01');
    expect(() => audioAdminRepository.editScript('UNKNOWN.ID', { textDisplay: 'x', textTts: 'y' }, admin)).toThrowError(/AUDIO_SCRIPT_NOT_FOUND/);
  });

  it('rejects fake/invalid binaries (zero duration/bytes, bad checksum) — no TTS claim', () => {
    expect(() => audioAdminRepository.uploadBinary('ST07.P1.s00.pr', {
      sha256: 'not-a-hash', durationMs: 1000, bytes: 100, format: 'opus', sourceKind: 'TTS', voiceProfileId: 'vp-01',
    }, admin)).toThrowError(/AUDIO_BINARY_CHECKSUM_INVALID/);
    expect(() => audioAdminRepository.uploadBinary('ST07.P1.s00.pr', {
      sha256: VALID_SHA256, durationMs: 0, bytes: 100, format: 'opus', sourceKind: 'TTS', voiceProfileId: 'vp-01',
    }, admin)).toThrowError(/AUDIO_BINARY_INVALID/);
    expect(() => audioAdminRepository.uploadBinary('UNKNOWN.ID', {
      sha256: VALID_SHA256, durationMs: 1000, bytes: 100, format: 'opus', sourceKind: 'TTS', voiceProfileId: 'vp-01',
    }, admin)).toThrowError(/AUDIO_SCRIPT_NOT_FOUND/);
  });

  it('uploads a real binary → GENERATED_OR_UPLOADED; transitions enforce RBAC and LISTEN_REVIEW_REQUIRED', () => {
    const holder = audioAdminRepository.uploadBinary('ST07.P1.s01.a', {
      sha256: VALID_SHA256, durationMs: 1400, bytes: 9_500, format: 'opus', sourceKind: 'TTS', voiceProfileId: 'vp-01',
    }, admin);
    expect(holder.asset.publishState).toBe('GENERATED_OR_UPLOADED');
    expect(holder.asset.assetVersion).toBe(1);

    // Skipping straight to RIGHTS_CLEARED is impossible (not the next stage):
    expect(() => audioAdminRepository.transition('ST07.P1.s01.a', 'RIGHTS_CLEARED', admin, 'skip')).toThrowError(/TRANSITION_REJECTED/);
    // Correct ladder, wrong role (PUBLISHER_ADMIN cannot LISTEN):
    expect(() => audioAdminRepository.transition('ST07.P1.s01.a', 'TECHNICALLY_VALIDATED', { accountId: 'x', role: 'CURRICULUM_REVIEWER' }, 'bad role')).toThrowError(/RBAC_REJECTED/);
    // Correct ladder + role:
    const validated = audioAdminRepository.transition('ST07.P1.s01.a', 'TECHNICALLY_VALIDATED', admin, 'checksum + duration verified');
    expect(validated.asset.publishState).toBe('TECHNICALLY_VALIDATED');
    // LISTENED requires the pronunciation reviewer:
    expect(() => audioAdminRepository.transition('ST07.P1.s01.a', 'LISTENED', admin, 'admin tries to listen')).toThrowError(/RBAC_REJECTED/);
    const listened = audioAdminRepository.transition('ST07.P1.s01.a', 'LISTENED', { accountId: 'reviewer-01', role: 'PERSIAN_PRONUNCIATION_REVIEWER' }, 'listened and approved');
    expect(listened.asset.publishState).toBe('LISTENED');
  });

  it('rollback is admin-only and only to a previous stage; full audit trail retained', () => {
    const rolled = audioAdminRepository.rollback('ST07.P1.s01.a', 'GENERATED_OR_UPLOADED', admin, 're-generate with new voice');
    expect(rolled.asset.publishState).toBe('GENERATED_OR_UPLOADED');
    expect(() => audioAdminRepository.rollback('ST07.P1.s01.a', 'PUBLISHED', { accountId: 'x', role: 'CURRICULUM_REVIEWER' }, 'nope')).toThrowError(/RBAC_REJECTED/);
    const detail = audioAdminRepository.getScriptDetail('ST07.P1.s01.a');
    expect(detail?.assets[0]?.auditTrail.length).toBeGreaterThan(3);
    const stages = detail?.assets[0]?.auditTrail.map((entry) => entry.toStage);
    expect(stages).toEqual(expect.arrayContaining(['GENERATED_OR_UPLOADED', 'TECHNICALLY_VALIDATED', 'LISTENED']));
    expect(AUDIO_PUBLISH_STAGES).toContain('LISTENED');
  });

  it('reports surface missing binaries (none PUBLISHED yet) and script-edit invalidation of a bound binary', () => {
    const reports = audioAdminRepository.reports();
    // No asset is PUBLISHED yet → every one of the 232 scripts is missing a playable binary.
    expect(reports.missingBinaries.length).toBe(232);
    // ST07.P1.s00.pr was edited but never had a binary → no impact entry (honest, not noisy).
    expect(reports.impact.length).toBe(0);
    // After re-uploading a binary for the edited script and then editing again → impact fires.
    audioAdminRepository.uploadBinary('ST07.P1.s00.pr', {
      sha256: VALID_SHA256, durationMs: 1200, bytes: 9_000, format: 'opus', sourceKind: 'TTS', voiceProfileId: 'vp-01',
    }, admin);
    audioAdminRepository.editScript('ST07.P1.s00.pr', { textDisplay: 'متن دوم', textTts: 'متن گفتاری دوم' }, admin);
    const after = audioAdminRepository.reports();
    expect(after.impact.length).toBe(1);
    expect(after.impact[0]?.audioId).toBe('ST07.P1.s00.pr');
  });
});
