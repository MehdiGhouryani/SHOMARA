export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
export type AssignmentInstanceStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'NEEDS_RECHECK' | 'EXPIRED' | 'CANCELLED';
export type AdaptationMode = 'OPEN_ADAPTIVE' | 'BOUNDED_ADAPTIVE' | 'PINNED';
export type CompletionRule = 'STATION_PASS' | 'OBJECTIVE_MET' | 'RECHECK_PASSED';
export type RecheckStatus = 'REQUESTED' | 'COMPLETED' | 'CANCELLED';

export interface AssignmentTarget {
  skillIds?: string[];
  stationIds?: string[];
}

export interface AssignmentBoundary {
  target: AssignmentTarget;
  adaptationMode: AdaptationMode;
}

export interface AssignmentRecord {
  id: string;
  classId: string;
  authorAccountId: string;
  sharedObjective: string;
  sharedOutcome: string | null;
  boundary: AssignmentBoundary;
  startsAt: string;
  dueAt: string | null;
  status: AssignmentStatus;
  revision: number;
  completionRule: CompletionRule;
  createdAt: string;
}

export interface AssignmentInstanceRecord {
  id: string;
  assignmentId: string;
  learningIdentityId: string;
  status: AssignmentInstanceStatus;
  personalizedPlanRef: string | null;
  completionPayload: Record<string, unknown>;
  instanceRevision: number;
  createdAt: string;
  completedAt: string | null;
  recheckRequestedAt: string | null;
}

export interface RecheckRecord {
  id: string;
  assignmentInstanceId: string;
  requestedByAccountId: string;
  reason: string | null;
  status: RecheckStatus;
  requestedAt: string;
  completedAt: string | null;
}

export interface CreateAssignmentInput {
  id: string;
  classId: string;
  authorAccountId: string;
  learnerIds: string[];
  sharedObjective: string;
  sharedOutcome?: string | null;
  boundary: AssignmentBoundary;
  startsAt: string;
  dueAt?: string | null;
  completionRule?: CompletionRule;
}
