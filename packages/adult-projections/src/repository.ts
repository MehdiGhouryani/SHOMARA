import type { AssignmentInstanceRecord, AssignmentRecord, RecheckRecord } from '@math/assignment-runtime';
import type { AdultProjectionPrincipalContext, TeacherObservationRecord, SkillSnapshotItem, RecentLearningItem } from './types.js';

export interface AdultProjectionRepository {
  listRelatedChildren(accountId: string): Promise<string[]>;
  listClassesForTeacher(accountId: string): Promise<string[]>;
  listLearnersInClass(classId: string): Promise<string[]>;
  getDisplayName(learningIdentityId: string): Promise<string>;
  getCurrentStation(learningIdentityId: string): Promise<{ code: string; title: string }>;
  getSkills(learningIdentityId: string): Promise<SkillSnapshotItem[]>;
  getRecentLearning(learningIdentityId: string): Promise<RecentLearningItem[]>;
  getCurrentDecision(learningIdentityId: string): Promise<{ step: string; objectiveContext: string; createdAt: string } | null>;
  getMeaningfulReturn(learningIdentityId: string): Promise<boolean>;
  saveObservation(record: TeacherObservationRecord): Promise<void>;
  listObservations(learningIdentityId: string): Promise<TeacherObservationRecord[]>;
  listRechecksForTeacher(accountId: string): Promise<RecheckQueueProjection[]>;
  getClassName(classId: string): Promise<string>;
  hasTeacherAccess(teacherAccountId: string, learningIdentityId: string): Promise<boolean>;
  hasParentAccess(parentAccountId: string, learningIdentityId: string): Promise<boolean>;
}

export interface RecheckQueueProjection extends RecheckRecord {
  assignment: AssignmentRecord;
  instance: AssignmentInstanceRecord;
  studentName: string;
}

export class InMemoryAdultProjectionRepository implements AdultProjectionRepository {
  private readonly parentChildren = new Map<string, string[]>([['parent-dev-01', ['child-dev-01']]]);
  private readonly teacherClasses = new Map<string, string[]>([['teacher-dev-01', ['class-g1-demo']]]);
  private readonly classLearners = new Map<string, string[]>([['class-g1-demo', ['child-dev-01', 'child-dev-02']]]);
  private readonly classNames = new Map<string, string>([['class-g1-demo', 'کلاس اول - نمونه']]);
  private readonly names = new Map<string, string>([['child-dev-01','آرین'],['child-dev-02','سارا']]);
  private readonly stations = new Map<string, {code:string; title:string}>([
    ['child-dev-01',{code:'ST01',title:'شمارش و الگو'}],
    ['child-dev-02',{code:'ST01',title:'شمارش و الگو'}],
  ]);
  private readonly skills = new Map<string, SkillSnapshotItem[]>([
    ['child-dev-01',[
      {skillCode:'G1-SK001',title:'تشخیص الگوی ساده',bucket:'STRENGTH',retention:'FRESH'},
      {skillCode:'G1-SK002',title:'ادامه دادن الگو',bucket:'BUILDING',retention:'FRESH'},
      {skillCode:'G1-SK003',title:'الگوی عددی اولیه',bucket:'NEEDS_REVIEW',retention:'REVIEW_DUE'},
    ]],
    ['child-dev-02',[
      {skillCode:'G1-SK001',title:'تشخیص الگوی ساده',bucket:'BUILDING',retention:'FRESH'},
      {skillCode:'G1-SK002',title:'ادامه دادن الگو',bucket:'STRENGTH',retention:'FRESH'},
    ]],
  ]);
  private readonly recent = new Map<string, RecentLearningItem[]>([
    ['child-dev-01',[
      {id:'ev-1',occurredAt:new Date().toISOString(),stationCode:'ST01',skillTitle:'تشخیص الگوی ساده',outcome:'CORRECT',summary:'الگو را درست ادامه داد.'},
      {id:'ev-2',occurredAt:new Date(Date.now()-3600000).toISOString(),stationCode:'ST01',skillTitle:'الگوی عددی اولیه',outcome:'RECOVERY',summary:'بعد از راهنمایی دوباره تمرین کرد.'},
    ]],
    ['child-dev-02',[
      {id:'ev-3',occurredAt:new Date(Date.now()-7200000).toISOString(),stationCode:'ST01',skillTitle:'ادامه دادن الگو',outcome:'CORRECT',summary:'دو الگوی ساده را درست تشخیص داد.'},
    ]],
  ]);
  private readonly observations = new Map<string, TeacherObservationRecord[]>();
  private readonly decisions = new Map<string, { step:string; objectiveContext:string; createdAt:string }>([
    ['child-dev-01',{step:'RECOVERY',objectiveContext:'Practice',createdAt:new Date().toISOString()}],
    ['child-dev-02',{step:'CONTINUE',objectiveContext:'Practice',createdAt:new Date().toISOString()}],
  ]);
  private rechecks: RecheckQueueProjection[] = [];

  async listRelatedChildren(accountId:string){ return [...(this.parentChildren.get(accountId) ?? [])]; }
  async listClassesForTeacher(accountId:string){ return [...(this.teacherClasses.get(accountId) ?? [])]; }
  async listLearnersInClass(classId:string){ return [...(this.classLearners.get(classId) ?? [])]; }
  async getDisplayName(id:string){ return this.names.get(id) ?? id; }
  async getCurrentStation(id:string){ return this.stations.get(id) ?? {code:'ST01',title:'ایستگاه ۰۱'}; }
  async getSkills(id:string){ return [...(this.skills.get(id) ?? [])]; }
  async getRecentLearning(id:string){ return [...(this.recent.get(id) ?? [])]; }
  async getCurrentDecision(id:string){ return this.decisions.get(id) ?? null; }
  async getMeaningfulReturn(id:string){ return (this.recent.get(id)?.length ?? 0) > 0; }
  async saveObservation(record:TeacherObservationRecord){ const list = this.observations.get(record.learningIdentityId) ?? []; this.observations.set(record.learningIdentityId,[record,...list]); }
  async listObservations(id:string){ return [...(this.observations.get(id) ?? [])]; }
  async getClassName(id:string){ return this.classNames.get(id) ?? id; }
  async hasTeacherAccess(teacherAccountId:string, learningIdentityId:string){ for(const classId of await this.listClassesForTeacher(teacherAccountId)){ if((await this.listLearnersInClass(classId)).includes(learningIdentityId)) return true; } return false; }
  async hasParentAccess(parentAccountId:string, learningIdentityId:string){ return (await this.listRelatedChildren(parentAccountId)).includes(learningIdentityId); }
  setRecheckQueue(items:RecheckQueueProjection[]){ this.rechecks = items; }
  async listRechecksForTeacher(accountId:string){ const allowed = new Set<string>(); for(const classId of await this.listClassesForTeacher(accountId)) for(const learner of await this.listLearnersInClass(classId)) allowed.add(learner); return this.rechecks.filter((item) => allowed.has(item.instance.learningIdentityId)); }
}

export function assertPrincipalRole(context: AdultProjectionPrincipalContext, expected: AdultProjectionPrincipalContext['role']) {
  if (context.role !== expected && context.role !== 'ADMIN') throw new Error('FORBIDDEN_ROLE');
}
