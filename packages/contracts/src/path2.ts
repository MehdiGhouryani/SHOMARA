/** Canonical continuous Path 2.0 presentation contract. */
import type { ProgressionNodeStatus } from './progression';

export type PathNodeVisualKind = 'LESSON' | 'PRACTICE' | 'REVIEW' | 'CHALLENGE' | 'JUMP' | 'CHECKPOINT';

export interface PathHeaderRule {
  kicker: string;
  title: string;
  progress: string;
}

export const PATH_2_PRESENTATION_VERSION = '2026-10-03-path-2.1' as const;

export const PATH_2_HEADER: PathHeaderRule = {
  kicker: 'واحد {number}',
  title: 'unit.title',
  progress: '{completed} از {total}',
} as const;



export const PATH_NODE_KIND_BY_STATION: Readonly<Record<string, PathNodeVisualKind>> = {
  ST01: 'LESSON',
  ST02: 'PRACTICE',
  ST03: 'LESSON',
  ST04: 'PRACTICE',
  ST05: 'CHALLENGE',
  ST06: 'LESSON',
  ST07: 'LESSON',
  ST08: 'PRACTICE',
  ST09: 'LESSON',
  ST10: 'CHALLENGE',
  ST11: 'LESSON',
  ST12: 'PRACTICE',
  ST13: 'LESSON',
  ST14: 'PRACTICE',
  ST15: 'CHALLENGE',
  ST16: 'LESSON',
  ST17: 'PRACTICE',
  ST18: 'LESSON',
  ST19: 'PRACTICE',
  ST20: 'CHALLENGE',
  ST21: 'LESSON',
  ST22: 'PRACTICE',
  ST23: 'LESSON',
  ST24: 'PRACTICE',
  ST25: 'CHALLENGE',
} as const;

export function pathNodeKind(stationId: string): PathNodeVisualKind {
  return PATH_NODE_KIND_BY_STATION[stationId] ?? 'LESSON';
}

export const PATH_NODE_LABELS: Readonly<Record<ProgressionNodeStatus, string>> = {
  COMPLETED: 'تمام شد',
  CURRENT: 'اینجا هستی',
  AVAILABLE: 'آماده',
  LOCKED: 'بعداً',
  NOT_DOWNLOADED: 'آماده‌سازی',
  SYNC_PENDING: 'همگام‌سازی',
} as const;

/** Clearer secondary status for path chrome (Phase B). */
export const PATH_NODE_STATUS_HINT: Readonly<Record<ProgressionNodeStatus, string>> = {
  COMPLETED: 'تمام کردی',
  CURRENT: 'همین را ادامه بده',
  AVAILABLE: 'می‌توانی شروع کنی',
  LOCKED: 'اول ایستگاه‌های قبل',
  NOT_DOWNLOADED: 'یک بار آماده می‌کنیم',
  SYNC_PENDING: 'در حال ذخیره',
} as const;

export interface PathFocusStation {
  id: string;
  number: number;
  title: string;
  status: ProgressionNodeStatus;
}

export interface PathFocusModel {
  /** Station the child should open next (or resume). */
  focus: PathFocusStation | null;
  /** True when the whole path is completed. */
  pathComplete: boolean;
  completedCount: number;
  totalCount: number;
  /** Short Persian lines for the "now" card. */
  hereLabelFa: string;
  nextLabelFa: string;
  progressLabelFa: string;
}

const FOCUS_PRIORITY: readonly ProgressionNodeStatus[] = [
  'CURRENT',
  'SYNC_PENDING',
  'NOT_DOWNLOADED',
  'AVAILABLE',
];

/**
 * Pure path orientation: where am I, what is next, is the path done?
 * UI-only helper — does not change learning truth.
 */
export function buildPathFocus(args: {
  stations: readonly { id: string; number: number; title: string }[];
  statuses: Readonly<Record<string, ProgressionNodeStatus>>;
}): PathFocusModel {
  const totalCount = args.stations.length;
  let completedCount = 0;
  let focus: PathFocusStation | null = null;

  for (const station of args.stations) {
    const status = args.statuses[station.id] ?? 'LOCKED';
    if (status === 'COMPLETED') completedCount += 1;
  }

  for (const want of FOCUS_PRIORITY) {
    const hit = args.stations.find((s) => (args.statuses[s.id] ?? 'LOCKED') === want);
    if (hit) {
      focus = {
        id: hit.id,
        number: hit.number,
        title: hit.title,
        status: want,
      };
      break;
    }
  }

  const pathComplete = totalCount > 0 && completedCount >= totalCount;
  const progressLabelFa = `${completedCount} از ${totalCount}`;

  if (pathComplete) {
    return {
      focus: null,
      pathComplete: true,
      completedCount,
      totalCount,
      hereLabelFa: 'مسیر این پایه را تمام کردی',
      nextLabelFa: 'می‌توانی از تمرین دوباره بازی کنی',
      progressLabelFa,
    };
  }

  if (!focus) {
    return {
      focus: null,
      pathComplete: false,
      completedCount,
      totalCount,
      hereLabelFa: 'مسیر در حال آماده‌سازی است',
      nextLabelFa: 'کمی بعد دوباره سر بزن',
      progressLabelFa,
    };
  }

  return {
    focus,
    pathComplete: false,
    completedCount,
    totalCount,
    hereLabelFa: `ایستگاه ${focus.number}: ${focus.title}`,
    nextLabelFa: PATH_NODE_STATUS_HINT[focus.status],
    progressLabelFa,
  };
}

export function pathFocusViolations(model: PathFocusModel): string[] {
  const v: string[] = [];
  if (model.totalCount < 0) v.push('NEGATIVE_TOTAL');
  if (model.completedCount > model.totalCount) v.push('COMPLETED_GT_TOTAL');
  if (model.pathComplete && model.focus !== null) v.push('COMPLETE_WITH_FOCUS');
  if (!model.pathComplete && model.totalCount > 0 && model.completedCount === model.totalCount) {
    v.push('ALL_DONE_BUT_NOT_FLAGGED');
  }
  return v;
}

export const JUMP_RULES = {
  entry: 'UNIT_BOUNDARY',
  questions: 5,
  passThreshold: 0.8,
  targetScope: 'NEXT_UNIT_FIRST_STATION',
  serverAuthoritative: true,
  failedAction: 'RETURN_TO_PATH',
  passedAction: 'OPEN_TARGET_STATION',
  allowRevisitSkippedStations: true,
} as const;

export const CHILD_SURFACE_RULES = {
  primaryNavCount: 3,
  primaryNav: ['PATH', 'PRACTICE', 'PROFILE'] as const,
  profileSecondary: ['AVATAR', 'SETTINGS', 'PARENT'] as const,
  teacherInChildShell: false,
  currenciesInChildShell: false,
  duplicateLearningTabs: false,
} as const;
