export type SkillBucket = 'STRENGTH' | 'BUILDING' | 'NEEDS_REVIEW';

export interface SkillSnapshotItem {
  skillCode: string;
  title: string;
  bucket: SkillBucket;
  retention: 'FRESH' | 'REVIEW_DUE' | 'AT_RISK';
}

export interface RecentLearningItem {
  id: string;
  occurredAt: string;
  stationCode: string;
  skillTitle: string;
  outcome: 'CORRECT' | 'INCORRECT' | 'RECOVERY' | 'RECHECK';
  summary: string;
}

export interface AssignmentStatusItem {
  assignmentId: string;
  instanceId: string;
  objective: string;
  status: string;
  dueAt: string | null;
}

export interface ParentTodayProjection {
  child: { learningIdentityId: string; displayName: string };
  today: { encountersCompleted: number; checksPassed: number; meaningfulReturn: boolean };
  progress: { currentStation: string; stationLabel: string };
  skills: SkillSnapshotItem[];
  nextStep: { title: string; reason: string; actionCode: string };
  recentLearning: RecentLearningItem[];
  simpleHomeActivity: { title: string; description: string } | null;
  assignments: AssignmentStatusItem[];
}

export interface TeacherClassSummary {
  classId: string;
  className: string;
  studentCount: number;
  needsReviewCount: number;
  needsAttentionCount: number;
}

export interface TeacherStudentListItem {
  learningIdentityId: string;
  displayName: string;
  currentStation: string;
  status: 'STRENGTH' | 'BUILDING' | 'NEEDS_REVIEW';
  needsAttention: boolean;
  recentDecision: string;
}

export interface TeacherStudentSnapshot {
  learningIdentityId: string;
  displayName: string;
  classIds: string[];
  currentStation: { code: string; title: string };
  skills: SkillSnapshotItem[];
  recentEvidence: RecentLearningItem[];
  currentDecision: { step: string; objectiveContext: string; createdAt: string } | null;
  recommendedNextAction: string;
  recentInterventions: Array<{ type: 'ASSIGNMENT' | 'RECHECK' | 'OBSERVATION'; label: string; at: string }>;
}

export interface TeacherNeedsAttentionProjection {
  students: TeacherStudentListItem[];
}

export interface TeacherRecheckQueueItem {
  instanceId: string;
  assignmentId: string;
  learningIdentityId: string;
  studentName: string;
  reason: string | null;
  requestedAt: string;
}

export interface TeacherObservationRecord {
  id: string;
  teacherAccountId: string;
  learningIdentityId: string;
  classId: string | null;
  observation: string;
  provenance: { source: 'TEACHER'; recordedBy: string };
  createdAt: string;
}

export interface AdultProjectionPrincipalContext {
  accountId: string;
  role: 'PARENT' | 'TEACHER' | 'ADMIN';
}
