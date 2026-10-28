import { describe, expect, it } from 'vitest';
import {
  SCHEMA_VERSION,
  createInitialState,
  decideEntry,
  isStationPassed,
  markStationPassed,
  markStationStarted,
  parseState,
  shouldFastTrack,
  updateChildAvatarPreset,
  grantJumpUnlock,
  isJumpUnlocked,
  reconcileAuthoritativeProgression,
  validateProfile,
} from './appStateCore';

const profile = { childName: 'آرش', gradeId: 'G1', consentAt: '2026-09-29T10:00:00.000Z' };
const valid = () => JSON.stringify(createInitialState(profile, true));

describe('decideEntry — first run vs returning', () => {
  it('no file => NEW', () => expect(decideEntry(null)).toEqual({ kind: 'NEW' }));
  it('valid file => RETURNING with the same state', () => {
    const d = decideEntry(valid());
    expect(d.kind).toBe('RETURNING');
    if (d.kind === 'RETURNING') {
      expect(d.state.profile.childName).toBe('آرش');
      expect(d.state.placementFastTrack).toBe(true);
    }
  });
  it('empty file => RECOVER (never silently NEW)', () => expect(decideEntry('  ')).toEqual({ kind: 'RECOVER', reason: 'CORRUPT' }));
  it('invalid JSON => RECOVER', () => expect(decideEntry('{oops')).toEqual({ kind: 'RECOVER', reason: 'CORRUPT' }));
  it('wrong shape => RECOVER', () => expect(decideEntry('{"schemaVersion":1}')).toEqual({ kind: 'RECOVER', reason: 'CORRUPT' }));
  it('newer schema (downgrade) => RECOVER/NEWER_VERSION so it is never overwritten blindly', () => {
    const newer = JSON.stringify({ ...createInitialState(profile, false), schemaVersion: SCHEMA_VERSION + 1 });
    expect(decideEntry(newer)).toEqual({ kind: 'RECOVER', reason: 'NEWER_VERSION' });
  });
  it('rejects unknown grade, empty name, bad terms timestamp', () => {
    expect(validateProfile({ ...profile, gradeId: 'G9' })).toBeNull();
    expect(validateProfile({ ...profile, childName: '   ' })).toBeNull();
    expect(validateProfile({ ...profile, childName: 'x'.repeat(21) })).toBeNull();
    expect(validateProfile({ ...profile, consentAt: 'not-a-date' })).toBeNull();
  });
  it('rejects malformed progress entries', () => {
    const bad = JSON.parse(valid());
    bad.progress = { ST1: { passed: true, lastSeq: 0 } };
    expect(parseState(JSON.stringify(bad)).ok).toBe(false);
    bad.progress = { ST01: { passed: 'yes', lastSeq: 0 } };
    expect(parseState(JSON.stringify(bad)).ok).toBe(false);
  });
});

describe('placement fast-track is one-shot (E1 regression)', () => {
  it('applies before the station is started', () => {
    expect(shouldFastTrack(createInitialState(profile, true), 'ST01')).toBe(true);
  });
  it('is consumed once the station is started — review/retry no longer skips teaching', () => {
    const started = markStationStarted(createInitialState(profile, true), 'ST01', '2026-09-29T11:00:00.000Z');
    expect(shouldFastTrack(started, 'ST01')).toBe(false);
  });
  it('never applies when placement did not earn it', () => {
    expect(shouldFastTrack(createInitialState(profile, false), 'ST01')).toBe(false);
  });
  it('markStationStarted is idempotent (keeps the first timestamp)', () => {
    const a = markStationStarted(createInitialState(profile, true), 'ST01', '2026-09-29T11:00:00.000Z');
    const b = markStationStarted(a, 'ST01', '2026-09-30T00:00:00.000Z');
    expect(b).toBe(a);
  });
});

describe('jump unlock projection', () => {
  it('adds a valid station once and survives JSON round-trip', () => {
    const s = grantJumpUnlock(createInitialState(profile, false), 'ST06');
    expect(isJumpUnlocked(s, 'ST06')).toBe(true);
    expect(grantJumpUnlock(s, 'ST06')).toBe(s);
    const back = decideEntry(JSON.stringify(s));
    expect(back.kind).toBe('RETURNING');
    if (back.kind === 'RETURNING') expect(back.state.jumpUnlockedStationIds).toEqual(['ST06']);
  });
  it('migrates schema v1 without inventing unlocks', () => {
    const s = createInitialState(profile, false);
    const v1 = JSON.parse(JSON.stringify(s));
    v1.schemaVersion = 1;
    delete v1.jumpUnlockedStationIds;
    const back = decideEntry(JSON.stringify(v1));
    expect(back.kind).toBe('RETURNING');
    if (back.kind === 'RETURNING') expect(back.state.jumpUnlockedStationIds).toEqual([]);
  });
});

describe('child avatar profile update', () => {
  it('changes only the avatar projection and preserves progress/profile identity', () => {
    const s = markStationPassed(createInitialState({ ...profile, avatarPresetId: 'sun' }, false), 'ST01', '2026-09-29T12:00:00.000Z');
    const next = updateChildAvatarPreset(s, 'cloud');
    expect(next.profile.avatarPresetId).toBe('cloud');
    expect(next.profile.childName).toBe(s.profile.childName);
    expect(next.progress).toEqual(s.progress);
  });
  it('is idempotent', () => {
    const s = createInitialState(profile, false);
    expect(updateChildAvatarPreset(s, 'sun')).toBe(s);
  });
});

describe('progress', () => {
  it('markStationPassed sets passed and keeps startedAt', () => {
    const s = markStationPassed(createInitialState(profile, false), 'ST01', '2026-09-29T12:00:00.000Z');
    expect(isStationPassed(s, 'ST01')).toBe(true);
    expect(s.progress.ST01?.startedAt).toBe('2026-09-29T12:00:00.000Z');
  });
  it('round-trips through JSON', () => {
    const s = markStationPassed(createInitialState(profile, true), 'ST01', '2026-09-29T12:00:00.000Z');
    const back = decideEntry(JSON.stringify(s));
    expect(back.kind).toBe('RETURNING');
    if (back.kind === 'RETURNING') expect(back.state).toEqual(s);
  });
  it('isStationPassed handles null state', () => expect(isStationPassed(null, 'ST01')).toBe(false));
});

import { dailyGoalDone, getResume, localDay, recordActivity, setResume, starsEarned, RESUMABLE_STAGES } from './appStateCore';

describe('mid-station resume (E2)', () => {
  const base = () => createInitialState(profile, false);
  const point = { stage: 'CHECK_A' as const, checks: 1, passAchieved: false, sessionId: 'session-1', encounterId: 'encounter-7' };
  it('stores and returns the resume point', () => {
    const s = setResume(base(), 'ST01', point, '2026-09-29T12:00:00.000Z');
    expect(getResume(s, 'ST01')).toEqual(point);
    expect(s.progress.ST01?.startedAt).toBe('2026-09-29T12:00:00.000Z');
  });
  it('survives a JSON round-trip (app killed and reopened)', () => {
    const s = setResume(base(), 'ST01', { ...point, stage: 'RECOVERY', skillId: 'G1-SK009' }, '2026-09-29T12:00:00.000Z');
    const back = decideEntry(JSON.stringify(s));
    expect(back.kind).toBe('RETURNING');
    if (back.kind === 'RETURNING') expect(getResume(back.state, 'ST01')).toEqual({ ...point, stage: 'RECOVERY', skillId: 'G1-SK009' });
  });
  it('is idempotent when nothing changed (no needless disk writes)', () => {
    const a = setResume(base(), 'ST01', point, '2026-09-29T12:00:00.000Z');
    expect(setResume(a, 'ST01', point, '2026-09-30T00:00:00.000Z')).toBe(a);
  });
  it('null clears it', () => {
    const a = setResume(base(), 'ST01', point, '2026-09-29T12:00:00.000Z');
    expect(getResume(setResume(a, 'ST01', null, '2026-09-29T13:00:00.000Z'), 'ST01')).toBeNull();
  });
  it('passing the station clears the resume point and keeps passed', () => {
    const a = setResume(base(), 'ST01', point, '2026-09-29T12:00:00.000Z');
    const p = markStationPassed(a, 'ST01', '2026-09-29T14:00:00.000Z');
    expect(getResume(p, 'ST01')).toBeNull();
    expect(isStationPassed(p, 'ST01')).toBe(true);
  });
  it('rejects a corrupt resume (unknown stage, bad checks)', () => {
    const s = setResume(base(), 'ST01', point, '2026-09-29T12:00:00.000Z');
    const j = JSON.parse(JSON.stringify(s));
    j.progress.ST01.resume.stage = 'HACK';
    expect(parseState(JSON.stringify(j)).ok).toBe(false);
    j.progress.ST01.resume.stage = 'CHECK_A';
    j.progress.ST01.resume.checks = 9;
    expect(parseState(JSON.stringify(j)).ok).toBe(false);
  });
  it('RESULT/ENTRY/COMPLETE are not resumable (transient)', () => {
    for (const t of ['ENTRY', 'RESULT', 'COMPLETE']) expect((RESUMABLE_STAGES as readonly string[]).includes(t)).toBe(false);
  });
});

describe('gentle daily goal + stars (no streak, no penalty)', () => {
  it('localDay formats using the local calendar', () => expect(localDay(new Date(2026, 8, 5))).toBe('2026-09-05'));
  it('daily goal is done only for the recorded day, and recording is idempotent', () => {
    const s = createInitialState(profile, false);
    expect(dailyGoalDone(s, '2026-09-29')).toBe(false);
    const a = recordActivity(s, '2026-09-29');
    expect(dailyGoalDone(a, '2026-09-29')).toBe(true);
    expect(dailyGoalDone(a, '2026-09-30')).toBe(false);
    expect(recordActivity(a, '2026-09-29')).toBe(a);
  });
  it('rejects a malformed lastActiveDay', () => {
    const j = JSON.parse(JSON.stringify(recordActivity(createInitialState(profile, false), '2026-09-29')));
    j.lastActiveDay = '29/09/2026';
    expect(parseState(JSON.stringify(j)).ok).toBe(false);
  });
  it('stars come only from passed learning stations', () => {
    expect(starsEarned(null)).toBe(0);
    const s = createInitialState(profile, false);
    expect(starsEarned(s)).toBe(0);
    expect(starsEarned(markStationPassed(s, 'ST01', '2026-09-29T12:00:00.000Z'))).toBe(1);
  });
});


describe('authoritative progression reconciliation', () => {
  it('marks only server-confirmed stations as passed and mirrors granted jumps', () => {
    const local = markStationStarted(createInitialState(profile, false), 'ST01', '2026-10-03T12:00:00.000Z');
    const next = reconcileAuthoritativeProgression(local, { completedStationIds: ['ST01', 'ST05'], jumpUnlockedStationIds: ['ST06'] });
    expect(next.progress.ST01?.passed).toBe(true);
    expect(next.progress.ST01?.startedAt).toBe('2026-10-03T12:00:00.000Z');
    expect(next.progress.ST05?.passed).toBe(true);
    expect(next.jumpUnlockedStationIds).toEqual(['ST06']);
  });

  it('does not clear local resume continuity when server confirms completion elsewhere', () => {
    const local = setResume(createInitialState(profile, false), 'ST03', { stage: 'CHECK_A', checks: 1, passAchieved: false, sessionId: 's1', encounterId: 'e1' }, '2026-10-03T12:00:00.000Z');
    const next = reconcileAuthoritativeProgression(local, { completedStationIds: ['ST01'], jumpUnlockedStationIds: [] });
    expect(getResume(next, 'ST03')).toEqual(local.progress.ST03?.resume);
    expect(next.progress.ST01?.passed).toBe(true);
  });

  it('removes a locally optimistic pass that the server does not confirm', () => {
    const local = markStationPassed(createInitialState(profile, false), 'ST04', '2026-10-03T12:00:00.000Z');
    const next = reconcileAuthoritativeProgression(local, { completedStationIds: ['ST01'], jumpUnlockedStationIds: [] });
    expect(next.progress.ST04?.passed).toBe(false);
    expect(next.progress.ST04?.startedAt).toBe('2026-10-03T12:00:00.000Z');
    expect(next.progress.ST01?.passed).toBe(true);
  });

  it('is idempotent when the authoritative snapshot matches the projection', () => {
    const local = grantJumpUnlock(markStationPassed(createInitialState(profile, false), 'ST01', '2026-10-03T12:00:00.000Z'), 'ST06');
    expect(reconcileAuthoritativeProgression(local, { completedStationIds: ['ST01'], jumpUnlockedStationIds: ['ST06'] })).toBe(local);
  });
});
