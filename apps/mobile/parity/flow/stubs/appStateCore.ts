type S = { passed?: string[]; resume?: Record<string, { stage: string }>; jumpUnlockedStationIds?: string[] } | null | undefined;
export const isStationPassed = (state: S, id: string) => state?.passed?.includes(id) ?? false;
export const getResume = (state: S, id: string) => state?.resume?.[id] ?? null;
export const isJumpUnlocked = (state: S, id: string) => state?.jumpUnlockedStationIds?.includes(id) ?? false;

export const DEFAULT_CHILD_AVATAR_PRESET_ID = 'sun';
