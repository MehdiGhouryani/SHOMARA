import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createInitialState, grantJumpUnlock, localDay, markStationPassed, markStationStarted, recordActivity, reconcileAuthoritativeProgression, setResume, updateChildAvatarPreset, updatePreference, type AppPreferences, type AppState, type ChildProfile, type EntryDecision, type ProgressionReconcileInput, type ResumePoint } from './appStateCore';
import { deleteAllData, loadEntry, saveState } from './appStateStore';

interface Ctx {
  /** false until the first read of the state file finished (splash stays up). */
  ready: boolean;
  entry: EntryDecision;
  /** Non-null only when RETURNING. */
  state: AppState | null;
  completeOnboarding: (profile: ChildProfile, fastTrack: boolean) => Promise<boolean>;
  startStation: (stationId: string) => void;
  passStation: (stationId: string) => void;
  /** Remember where the child is (null clears) and count today as an active day. */
  saveResume: (stationId: string, resume: ResumePoint | null) => void;
  grantJumpUnlock: (stationId: string) => void;
  reconcileProgression: (snapshot: ProgressionReconcileInput) => void;
  /** Account-confirmed deletion; the app returns to First Run. */
  resetAll: () => Promise<boolean>;
  updateAvatarPreset: (avatarPresetId: NonNullable<ChildProfile['avatarPresetId']>) => void;
  preferences: AppPreferences;
  setPreference: (key: keyof AppPreferences, value: boolean) => void;
}

const AppStateCtx = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [entry, setEntry] = useState<EntryDecision>({ kind: 'NEW' });
  // Mirror of the latest state so back-to-back updates compose correctly.
  const latest = useRef<AppState | null>(null);

  useEffect(() => {
    let alive = true;
    void loadEntry().then((d) => {
      if (!alive) return;
      latest.current = d.kind === 'RETURNING' ? d.state : null;
      setEntry(d);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const apply = useCallback((next: AppState) => {
    latest.current = next;
    setEntry({ kind: 'RETURNING', state: next });
    void saveState(next);
  }, []);

  const completeOnboarding = useCallback(async (profile: ChildProfile, fastTrack: boolean) => {
    const next = createInitialState(profile, fastTrack);
    const ok = await saveState(next);
    if (ok) {
      latest.current = next;
      setEntry({ kind: 'RETURNING', state: next });
    }
    return ok;
  }, []);

  const startStation = useCallback(
    (stationId: string) => {
      if (!latest.current) return;
      const next = markStationStarted(latest.current, stationId, new Date().toISOString());
      if (next !== latest.current) apply(next);
    },
    [apply]
  );

  const passStation = useCallback(
    (stationId: string) => {
      if (!latest.current) return;
      const next = markStationPassed(latest.current, stationId, new Date().toISOString());
      if (next !== latest.current) apply(next);
    },
    [apply]
  );

  const grantJump = useCallback((stationId: string) => {
    if (!latest.current) return;
    const next = grantJumpUnlock(latest.current, stationId);
    if (next !== latest.current) apply(next);
  }, [apply]);

  const saveResume = useCallback(
    (stationId: string, resume: ResumePoint | null) => {
      if (!latest.current) return;
      const now = new Date();
      const next = recordActivity(setResume(latest.current, stationId, resume, now.toISOString()), localDay(now));
      if (next !== latest.current) apply(next);
    },
    [apply]
  );

  const reconcileProgression = useCallback((snapshot: ProgressionReconcileInput) => {
    if (!latest.current) return;
    const next = reconcileAuthoritativeProgression(latest.current, snapshot);
    if (next !== latest.current) apply(next);
  }, [apply]);

  const updateAvatarPreset = useCallback(
    (avatarPresetId: NonNullable<ChildProfile['avatarPresetId']>) => {
      if (!latest.current) return;
      const next = updateChildAvatarPreset(latest.current, avatarPresetId);
      if (next !== latest.current) apply(next);
    },
    [apply]
  );

  const setPreference = useCallback((key: keyof AppPreferences, value: boolean) => {
    if (!latest.current) return;
    const next = updatePreference(latest.current, key, value);
    if (next !== latest.current) apply(next);
  }, [apply]);

  const resetAll = useCallback(async () => {
    const ok = await deleteAllData();
    if (ok) {
      latest.current = null;
      setEntry({ kind: 'NEW' });
    }
    return ok;
  }, []);

  const value = useMemo<Ctx>(
    () => ({ ready, entry, state: entry.kind === 'RETURNING' ? entry.state : null, completeOnboarding, startStation, passStation, saveResume, grantJumpUnlock: grantJump, reconcileProgression, resetAll, updateAvatarPreset, preferences: entry.kind === 'RETURNING' ? entry.state.preferences : ({ sound: true, motion: true, largeText: false, haptics: true } as AppPreferences), setPreference }),
    [ready, entry, completeOnboarding, startStation, passStation, saveResume, grantJump, reconcileProgression, resetAll, updateAvatarPreset, setPreference]
  );
  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>;
}

export function useAppState(): Ctx {
  const v = useContext(AppStateCtx);
  if (!v) throw new Error('useAppState must be used inside AppStateProvider');
  return v;
}
