type Flow = {
  completed: { profile: unknown; fastTrack: boolean } | null;
  state: unknown;
  passedStations: string[];
  preferenceSets: Array<[string, boolean]>;
  avatarPresetSets: Array<string>;
};
const flow = () => (window as unknown as { __flow: Flow }).__flow;
export function useAppState() {
  return {
    entry: { kind: 'NEW' as const },
    preferences: { sound: true, motion: false, largeText: false, haptics: false, gentleReminders: false },
    // Wiring recorders for the settings/avatar screens; the value flip itself is React state mechanics.
    setPreference: (key: string, value: boolean) => { flow().preferenceSets.push([key, value]); },
    updateAvatarPreset: (id: string) => { flow().avatarPresetSets.push(id); },
    state: flow().state,
    reconcileProgression: () => undefined,
    saveResume: () => undefined,
    startStation: () => undefined,
    passStation: (id: string) => {
      flow().passedStations.push(id);
      // Same effect the real reducer has: the station's local progress turns passed.
      const state = flow().state as { progress: Record<string, { passed: boolean }> };
      state.progress[id] = { ...(state.progress[id] ?? { passed: false }), passed: true };
    },
    completeOnboarding: async (profile: unknown, fastTrack: boolean) => {
      flow().completed = { profile, fastTrack };
      return true;
    },
  };
}
