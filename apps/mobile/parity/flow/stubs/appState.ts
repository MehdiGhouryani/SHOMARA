type Flow = { completed: { profile: unknown; fastTrack: boolean } | null; state: unknown; passedStations: string[] };
const flow = () => (window as unknown as { __flow: Flow }).__flow;
export function useAppState() {
  return {
    entry: { kind: 'NEW' as const },
    preferences: { sound: true, motion: false, largeText: false, haptics: false, gentleReminders: false },
    state: flow().state,
    reconcileProgression: () => undefined,
    saveResume: () => undefined,
    startStation: () => undefined,
    passStation: (id: string) => flow().passedStations.push(id),
    completeOnboarding: async (profile: unknown, fastTrack: boolean) => {
      flow().completed = { profile, fastTrack };
      return true;
    },
  };
}
