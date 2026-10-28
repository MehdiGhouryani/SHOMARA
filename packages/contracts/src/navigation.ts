/**
 * Canonical child-facing information architecture.
 *
 * The shell intentionally has only three primary destinations. Secondary
 * surfaces (achievements and parent tools) live inside Profile, while lesson
 * and unit screens remain drill-down routes from Path.
 */
export type ChildTabId = 'PATH' | 'PRACTICE' | 'PROFILE';

export type ChildScreenId =
  | 'S01' | 'S02' | 'S03' | 'S04' | 'S05' | 'S06'
  | 'S07' | 'S08' | 'S09' | 'S10' | 'S11' | 'S12' | 'S13'
  | 'S14' | 'S15' | 'S16'
  | 'S17' | 'S18' | 'S19' | 'S20'
  | 'S21' | 'S22' | 'S23' | 'S24';

export type ChildScreenSurfaceStatus = 'ACTIVE' | 'EMBEDDED' | 'ADULT_ONLY' | 'DEFERRED' | 'REMOVED';

export interface ChildTabDefinition {
  id: ChildTabId;
  label: string;
  shortLabel: string;
  screenIds: readonly ChildScreenId[];
  defaultScreenId: ChildScreenId;
}

export const CHILD_PRIMARY_NAV: readonly ChildTabDefinition[] = [
  {
    id: 'PATH',
    label: 'مسیر',
    shortLabel: 'مسیر',
    screenIds: ['S07', 'S08', 'S09', 'S10', 'S11', 'S12', 'S13'],
    defaultScreenId: 'S07',
  },
  {
    id: 'PRACTICE',
    label: 'تمرین',
    shortLabel: 'تمرین',
    screenIds: ['S14'],
    defaultScreenId: 'S14',
  },
  {
    id: 'PROFILE',
    label: 'من',
    shortLabel: 'من',
    screenIds: ['S19', 'S20', 'S21'],
    defaultScreenId: 'S19',
  },
] as const;

/** Screen lifecycle in the current child product. IDs are retained for traceability. */
export const CHILD_SCREEN_SURFACE_STATUS: Readonly<Record<ChildScreenId, ChildScreenSurfaceStatus>> = {
  S01: 'ACTIVE',
  S02: 'ACTIVE',
  S03: 'ACTIVE',
  S04: 'ACTIVE',
  S05: 'ACTIVE',
  S06: 'ACTIVE',
  S07: 'ACTIVE',
  S08: 'EMBEDDED',
  S09: 'ACTIVE',
  S10: 'ACTIVE',
  S11: 'ACTIVE',
  S12: 'ACTIVE',
  S13: 'ACTIVE',
  S14: 'ACTIVE',
  S15: 'DEFERRED',
  S16: 'DEFERRED',
  S17: 'EMBEDDED',
  S18: 'EMBEDDED',
  S19: 'ACTIVE',
  S20: 'ACTIVE',
  S21: 'ACTIVE',
  S22: 'ADULT_ONLY',
  S23: 'ADULT_ONLY',
  S24: 'ADULT_ONLY',
} as const;

export const CHILD_TAB_BY_SCREEN: Readonly<Record<ChildScreenId, ChildTabId>> = {
  S01: 'PATH', S02: 'PATH', S03: 'PATH', S04: 'PATH', S05: 'PATH', S06: 'PATH',
  S07: 'PATH', S08: 'PATH', S09: 'PATH', S10: 'PATH', S11: 'PATH', S12: 'PATH', S13: 'PATH',
  S14: 'PRACTICE', S15: 'PRACTICE', S16: 'PRACTICE',
  S17: 'PROFILE', S18: 'PROFILE', S19: 'PROFILE', S20: 'PROFILE', S21: 'PROFILE',
  S22: 'PROFILE', S23: 'PROFILE', S24: 'PROFILE',
};

export const CHILD_DEFAULT_SCREEN_BY_TAB: Readonly<Record<ChildTabId, ChildScreenId>> = Object.fromEntries(
  CHILD_PRIMARY_NAV.map((tab) => [tab.id, tab.defaultScreenId])
) as Record<ChildTabId, ChildScreenId>;

export function childTabForScreen(screenId: string): ChildTabId {
  return CHILD_TAB_BY_SCREEN[screenId as ChildScreenId] ?? 'PATH';
}

export const CHILD_PRIMARY_TAB_COUNT = CHILD_PRIMARY_NAV.length;
