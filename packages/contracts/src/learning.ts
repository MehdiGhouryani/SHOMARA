export type Role = 'CHILD' | 'PARENT' | 'TEACHER' | 'ADMIN';

export type SessionType = 'LEARNING' | 'DIAGNOSTIC' | 'RECOVERY' | 'REVIEW';

export type SessionStatus =
  | 'CREATED'
  | 'ACTIVE'
  | 'INTERRUPTED'
  | 'COMPLETED'
  | 'ABANDONED';

export type AssignmentStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED';

export type AssignmentInstanceStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'NEEDS_RECHECK'
  | 'EXPIRED'
  | 'CANCELLED';

export type CacheClass = 'CURRENT' | 'NEXT' | 'RECENT' | 'FUTURE';

export type LearningSemanticEvent =
  | 'SESSION_START'
  | 'EXPLAIN'
  | 'ANSWER_CORRECT'
  | 'ANSWER_WRONG'
  | 'HINT_OPENED'
  | 'RECOVERY'
  | 'STATION_PASS'
  | 'MILESTONE'
  | 'REWARD_GRANTED';

export interface VersionPin {
  gradeId: string;
  curriculumVersionId: string;
  skillGraphVersionId: string;
}

export interface AssignmentTarget {
  skillIds?: string[];
  stationIds?: string[];
}

export interface AssignmentBoundary {
  target: AssignmentTarget;
  adaptationMode: 'OPEN_ADAPTIVE' | 'BOUNDED_ADAPTIVE' | 'PINNED';
}

export interface AssignmentSummary {
  id: string;
  classId: string;
  status: AssignmentStatus;
  sharedObjective: string;
  sharedOutcome: string;
  boundary: AssignmentBoundary;
  startsAt: string;
  dueAt: string | null;
  revision: number;
}

export type OfflineOperationType = 'SUBMIT_ATTEMPT' | 'SESSION_RESUME' | 'SESSION_UPDATE' | 'EVENT_INGEST';
export type OfflineSyncStatus = 'PENDING' | 'SYNCING' | 'RETRY' | 'ACKED' | 'REJECTED';
