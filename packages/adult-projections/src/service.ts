import type { AssignmentService } from '@math/assignment-runtime';
import type { AdultProjectionRepository, RecheckQueueProjection } from './repository.js';
import type { ParentTodayProjection, TeacherClassSummary, TeacherNeedsAttentionProjection, TeacherRecheckQueueItem, TeacherStudentListItem, TeacherStudentSnapshot, TeacherObservationRecord } from './types.js';

function id(prefix:string){ return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`; }

export class AdultProjectionService {
  constructor(private readonly repo: AdultProjectionRepository, private readonly assignments: AssignmentService) {}

  private async assignmentStatusForLearner(learningIdentityId:string){
    const items = await this.assignments.listForLearner(learningIdentityId);
    return items.map(({assignment,instance}) => ({assignmentId:assignment.id,instanceId:instance.id,objective:assignment.sharedObjective,status:instance.status,dueAt:assignment.dueAt}));
  }

  async getParentToday(parentAccountId:string):Promise<ParentTodayProjection>{
    const children = await this.repo.listRelatedChildren(parentAccountId);
    if(children.length !== 1) throw new Error(children.length === 0 ? 'CHILD_NOT_FOUND' : 'MULTIPLE_CHILDREN_UNSUPPORTED_IN_V1_SCREEN');
    const learningIdentityId = children[0];
    if (!learningIdentityId) throw new Error('CHILD_NOT_FOUND');
    const [displayName,station,skills,recent,meaningful,assignments] = await Promise.all([
      this.repo.getDisplayName(learningIdentityId), this.repo.getCurrentStation(learningIdentityId), this.repo.getSkills(learningIdentityId), this.repo.getRecentLearning(learningIdentityId), this.repo.getMeaningfulReturn(learningIdentityId), this.assignmentStatusForLearner(learningIdentityId)
    ]);
    const checksPassed = recent.filter((item) => item.outcome === 'CORRECT' || item.outcome === 'RECHECK').length;
    return {
      child:{learningIdentityId,displayName},
      today:{encountersCompleted:recent.length,checksPassed,meaningfulReturn:meaningful},
      progress:{currentStation:station.code,stationLabel:station.title},
      skills,
      nextStep:{title:'یک تمرین کوتاه دیگر',reason:'ادامه مسیر فعلی بدون تغییر دستی Path',actionCode:'CONTINUE'},
      recentLearning:recent,
      simpleHomeActivity:skills.some((skill) => skill.bucket==='NEEDS_REVIEW') ? {title:'بازی الگو در خانه',description:'۳ الگوی ساده را با مهره یا اسباب‌بازی کامل کنید.'} : {title:'الگو بسازید',description:'یک الگوی دو مرحله‌ای بسازید و از کودک بخواهید ادامه‌اش دهد.'},
      assignments,
    };
  }

  async listTeacherClasses(teacherAccountId:string):Promise<TeacherClassSummary[]>{
    const classIds = await this.repo.listClassesForTeacher(teacherAccountId); const out:TeacherClassSummary[]=[];
    for(const classId of classIds){ const learners=await this.repo.listLearnersInClass(classId); let review=0,attention=0; for(const learner of learners){ const skills=await this.repo.getSkills(learner); if(skills.some(s=>s.bucket==='NEEDS_REVIEW')) review++; const decision=await this.repo.getCurrentDecision(learner); if(decision?.step==='RECOVERY' || decision?.step==='RECHECK') attention++; } out.push({classId,className:await this.repo.getClassName(classId),studentCount:learners.length,needsReviewCount:review,needsAttentionCount:attention}); }
    return out;
  }

  async listTeacherStudents(teacherAccountId:string,classId:string):Promise<TeacherStudentListItem[]>{
    const classIds=await this.repo.listClassesForTeacher(teacherAccountId); if(!classIds.includes(classId)) throw new Error('FORBIDDEN_CLASS');
    const learners=await this.repo.listLearnersInClass(classId); const out:TeacherStudentListItem[]=[];
    for(const learner of learners){ const skills=await this.repo.getSkills(learner); const decision=await this.repo.getCurrentDecision(learner); const status=skills.some(s=>s.bucket==='NEEDS_REVIEW')?'NEEDS_REVIEW':skills.some(s=>s.bucket==='BUILDING')?'BUILDING':'STRENGTH'; out.push({learningIdentityId:learner,displayName:await this.repo.getDisplayName(learner),currentStation:(await this.repo.getCurrentStation(learner)).code,status,needsAttention:decision?.step==='RECOVERY'||decision?.step==='RECHECK',recentDecision:decision?.step ?? 'CONTINUE'}); }
    return out;
  }

  async getTeacherStudentSnapshot(teacherAccountId:string,learningIdentityId:string):Promise<TeacherStudentSnapshot>{
    if(!(await this.repo.hasTeacherAccess(teacherAccountId,learningIdentityId))) throw new Error('FORBIDDEN_STUDENT');
    const classIds=await this.repo.listClassesForTeacher(teacherAccountId); const studentClasses:string[]=[]; for(const classId of classIds) if((await this.repo.listLearnersInClass(classId)).includes(learningIdentityId)) studentClasses.push(classId);
    const [displayName,currentStation,skills,recent,decision,observations]=await Promise.all([this.repo.getDisplayName(learningIdentityId),this.repo.getCurrentStation(learningIdentityId),this.repo.getSkills(learningIdentityId),this.repo.getRecentLearning(learningIdentityId),this.repo.getCurrentDecision(learningIdentityId),this.repo.listObservations(learningIdentityId)]);
    const assignmentItems=await this.assignments.listForLearner(learningIdentityId);
    return {learningIdentityId,displayName,classIds:studentClasses,currentStation,skills,recentEvidence:recent,currentDecision:decision,recommendedNextAction:decision?.step==='RECOVERY'?'مرور و تمرین مجدد با بازنمایی ساده‌تر':'ادامه مسیر فعلی',recentInterventions:[...assignmentItems.slice(0,3).map(({assignment})=>({type:'ASSIGNMENT' as const,label:assignment.sharedObjective,at:assignment.startsAt})),...observations.slice(0,3).map((o)=>({type:'OBSERVATION' as const,label:o.observation,at:o.createdAt}))]};
  }

  async getNeedsAttention(teacherAccountId:string):Promise<TeacherNeedsAttentionProjection>{
    const classes=await this.repo.listClassesForTeacher(teacherAccountId); const all:TeacherStudentListItem[]=[];
    for(const classId of classes){ const students=await this.listTeacherStudents(teacherAccountId,classId); all.push(...students.filter((s)=>s.needsAttention||s.status==='NEEDS_REVIEW')); }
    const dedup=[...new Map(all.map((s)=>[s.learningIdentityId,s])).values()]; return {students:dedup};
  }

  async getRecheckQueue(teacherAccountId:string):Promise<TeacherRecheckQueueItem[]>{ const items=await this.repo.listRechecksForTeacher(teacherAccountId); return items.map((item)=>({instanceId:item.instance.id,assignmentId:item.assignment.id,learningIdentityId:item.instance.learningIdentityId,studentName:item.studentName,reason:item.reason,requestedAt:item.requestedAt})); }

  async addTeacherObservation(input:{teacherAccountId:string;learningIdentityId:string;classId?:string|null;observation:string}):Promise<TeacherObservationRecord>{
    if(!(await this.repo.hasTeacherAccess(input.teacherAccountId,input.learningIdentityId))) throw new Error('FORBIDDEN_STUDENT');
    if(!input.observation.trim()) throw new Error('OBSERVATION_REQUIRED');
    const record:TeacherObservationRecord={id:id('obs'),teacherAccountId:input.teacherAccountId,learningIdentityId:input.learningIdentityId,classId:input.classId ?? null,observation:input.observation.trim(),provenance:{source:'TEACHER',recordedBy:input.teacherAccountId},createdAt:new Date().toISOString()};
    await this.repo.saveObservation(record); return record;
  }

  async seedRecheckQueueFromAssignments(teacherAccountId:string):Promise<void>{ const out:RecheckQueueProjection[]=[]; const classIds=await this.repo.listClassesForTeacher(teacherAccountId); for(const classId of classIds){ const learners=await this.repo.listLearnersInClass(classId); for(const learner of learners){ const items=await this.assignments.listForLearner(learner); for(const item of items){ if(item.instance.status==='NEEDS_RECHECK'){ out.push({id:`rq_${item.instance.id}`,assignmentInstanceId:item.instance.id,assignment:item.assignment,instance:item.instance,studentName:await this.repo.getDisplayName(learner),requestedByAccountId:item.assignment.authorAccountId,reason:String(item.instance.completionPayload.reason ?? '')||null,status:'REQUESTED',requestedAt:item.instance.recheckRequestedAt ?? new Date().toISOString(),completedAt:null}); } } } } (this.repo as unknown as {setRecheckQueue?: (items:RecheckQueueProjection[])=>void}).setRecheckQueue?.(out); }
}
