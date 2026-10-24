/** Canonical adult-facing surface. Teacher product is intentionally separate. */
export const ADULT_SURFACE_VERSION = '2026-10-03-adult-1.0' as const;

export type AdultSurfaceId = 'PARENT' | 'SETTINGS';

export const ADULT_PRIMARY_SURFACES = [
  { id: 'PARENT', label: 'گزارش کودک', purpose: 'فهمیدن روند یادگیری و حمایت در خانه.' },
] as const;

export const CHILD_SECONDARY_SURFACES = [
  { id: 'SETTINGS', label: 'تنظیمات', route: '/settings' },
  { id: 'PARENT', label: 'والدین', route: '/parent', requiresAdultGate: true },
] as const;

export const ADULT_REMOVED_FROM_PARENT_REPORT = [
  'TEACHER_LOGIN',
  'ASSIGNMENTS',
  'LEADERBOARD',
  'FRIENDS',
  'CURRENCIES',
  'CHILD_LEARNING_CONTROLS',
] as const;

export const PARENT_REPORT_SECTIONS = [
  'TODAY',
  'CURRENT_PROGRESS',
  'SKILLS',
  'RECENT_LEARNING',
  'HOME_ACTIVITY',
] as const;

export const SETTINGS_SECTIONS = [
  'LEARNING',
  'ACCESSIBILITY',
] as const;

export interface ParentReportProjection {
  child: { displayName: string };
  today: { encountersCompleted: number };
  progress: { currentStation: string; stationLabel: string };
  skills: Array<{ skillCode: string; title: string; bucket: 'STRENGTH' | 'BUILDING' | 'NEEDS_REVIEW'; retention: string }>;
  nextStep: { title: string; reason: string };
  recentLearning: Array<{ summary: string; stationCode: string; outcome: string }>;
  simpleHomeActivity: { title: string; description: string } | null;
}
