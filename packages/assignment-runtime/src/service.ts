import type { AssignmentRepository } from './repository.js';
import type { AssignmentInstanceRecord, AssignmentRecord, CreateAssignmentInput, RecheckRecord } from './types.js';

function id(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export class AssignmentRuntimeError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'AssignmentRuntimeError'; }
}

export class AssignmentService {
  constructor(private readonly repo: AssignmentRepository) {}

  async createDraft(input: CreateAssignmentInput): Promise<{ assignment: AssignmentRecord; instances: AssignmentInstanceRecord[] }> {
    if (!input.classId || !input.authorAccountId || !input.sharedObjective.trim()) {
      throw new AssignmentRuntimeError('VALIDATION_ERROR', 'classId, authorAccountId and sharedObjective are required');
    }
    if ((input.boundary.target.skillIds?.length ?? 0) === 0 && (input.boundary.target.stationIds?.length ?? 0) === 0) {
      throw new AssignmentRuntimeError('TARGET_REQUIRED', 'At least one skill or station target is required');
    }
    if (input.dueAt && new Date(input.dueAt).getTime() < new Date(input.startsAt).getTime()) {
      throw new AssignmentRuntimeError('DATE_ORDER_INVALID', 'dueAt cannot be before startsAt');
    }

    const assignment: AssignmentRecord = {
      id: input.id,
      classId: input.classId,
      authorAccountId: input.authorAccountId,
      sharedObjective: input.sharedObjective.trim(),
      sharedOutcome: input.sharedOutcome?.trim() || null,
      boundary: input.boundary,
      startsAt: input.startsAt,
      dueAt: input.dueAt ?? null,
      status: 'DRAFT',
      revision: 1,
      completionRule: input.completionRule ?? 'STATION_PASS',
      createdAt: new Date().toISOString(),
    };
    await this.repo.saveAssignment(assignment);
    return { assignment, instances: [] };
  }

  async publish(assignmentId: string, learnerIds: string[]): Promise<{ assignment: AssignmentRecord; instances: AssignmentInstanceRecord[] }> {
    const assignment = await this.repo.getAssignment(assignmentId);
    if (!assignment) throw new AssignmentRuntimeError('ASSIGNMENT_NOT_FOUND', 'Assignment not found');
    if (assignment.status !== 'DRAFT' && assignment.status !== 'PUBLISHED') {
      throw new AssignmentRuntimeError('INVALID_STATUS', `Cannot publish assignment from ${assignment.status}`);
    }
    if (learnerIds.length === 0) throw new AssignmentRuntimeError('LEARNERS_REQUIRED', 'At least one learner is required');

    assignment.status = 'PUBLISHED';
    assignment.revision += 1;
    await this.repo.saveAssignment(assignment);

    const existing = await this.repo.listInstances(assignmentId);
    const byLearner = new Set(existing.map((item) => item.learningIdentityId));
    for (const learnerId of [...new Set(learnerIds)]) {
      if (byLearner.has(learnerId)) continue;
      await this.repo.saveInstance({
        id: id('ainst'),
        assignmentId,
        learningIdentityId: learnerId,
        status: 'PENDING',
        personalizedPlanRef: null,
        completionPayload: {
          sharedOutcome: assignment.sharedOutcome,
          target: assignment.boundary.target,
          adaptationMode: assignment.boundary.adaptationMode,
        },
        instanceRevision: 1,
        createdAt: new Date().toISOString(),
        completedAt: null,
        recheckRequestedAt: null,
      });
    }

    const instances = await this.repo.listInstances(assignmentId);
    return { assignment, instances };
  }

  async listForLearner(learningIdentityId: string): Promise<Array<{ assignment: AssignmentRecord; instance: AssignmentInstanceRecord }>> {
    const instances = await this.repo.listInstancesForLearner(learningIdentityId);
    const result: Array<{ assignment: AssignmentRecord; instance: AssignmentInstanceRecord }> = [];
    for (const instance of instances) {
      const assignment = await this.repo.getAssignment(instance.assignmentId);
      if (assignment && assignment.status !== 'CANCELLED') result.push({ assignment, instance });
    }
    return result;
  }

  async markActive(assignmentInstanceId: string): Promise<AssignmentInstanceRecord> {
    const instance = await this.repo.getInstance(assignmentInstanceId);
    if (!instance) throw new AssignmentRuntimeError('INSTANCE_NOT_FOUND', 'Assignment instance not found');
    if (instance.status !== 'PENDING' && instance.status !== 'ACTIVE') {
      throw new AssignmentRuntimeError('INVALID_INSTANCE_STATUS', `Cannot activate ${instance.status}`);
    }
    instance.status = 'ACTIVE';
    instance.instanceRevision += 1;
    await this.repo.saveInstance(instance);
    return instance;
  }

  /**
   * Server-authoritative completion: called only by the server after a verified STATION_PASS.
   * The learner can never set completion directly (the old child-facing outcome endpoint is retired).
   * Auto-completion applies to STATION_PASS assignments whose target lists stationIds; the assignment
   * completes when every target station has been passed. Skill-only targets do not auto-complete.
   */
  async recordStationPass(learningIdentityId: string, stationId: string): Promise<AssignmentInstanceRecord[]> {
    const updated: AssignmentInstanceRecord[] = [];
    const instances = await this.repo.listInstancesForLearner(learningIdentityId);
    for (const instance of instances) {
      if (instance.status !== 'PENDING' && instance.status !== 'ACTIVE' && instance.status !== 'NEEDS_RECHECK') continue;
      const assignment = await this.repo.getAssignment(instance.assignmentId);
      if (!assignment || assignment.status === 'CANCELLED' || assignment.status === 'EXPIRED' || assignment.status === 'DRAFT') continue;
      if (assignment.completionRule !== 'STATION_PASS') continue;
      const targets = assignment.boundary.target.stationIds ?? [];
      if (!targets.includes(stationId)) continue;
      const passed = new Set<string>(Array.isArray(instance.completionPayload.passedStationIds) ? (instance.completionPayload.passedStationIds as string[]) : []);
      if (passed.has(stationId) && instance.status !== 'PENDING') continue;
      passed.add(stationId);
      instance.completionPayload = { ...instance.completionPayload, passedStationIds: [...passed] };
      if (instance.status !== 'NEEDS_RECHECK') {
        const allPassed = targets.every((target) => passed.has(target));
        instance.status = allPassed ? 'COMPLETED' : 'ACTIVE';
        if (allPassed) instance.completedAt = new Date().toISOString();
      }
      instance.instanceRevision += 1;
      await this.repo.saveInstance(instance);
      updated.push(instance);
    }
    return updated;
  }

  async requestRecheck(instanceId: string, requestedByAccountId: string, reason?: string | null): Promise<RecheckRecord> {
    const instance = await this.repo.getInstance(instanceId);
    if (!instance) throw new AssignmentRuntimeError('INSTANCE_NOT_FOUND', 'Assignment instance not found');
    if (instance.status === 'CANCELLED' || instance.status === 'EXPIRED') {
      throw new AssignmentRuntimeError('INVALID_INSTANCE_STATUS', `Cannot request recheck for ${instance.status}`);
    }
    if (instance.status === 'NEEDS_RECHECK') {
      throw new AssignmentRuntimeError('INVALID_INSTANCE_STATUS', 'Recheck already requested');
    }
    const record: RecheckRecord = {
      id: id('recheck'),
      assignmentInstanceId: instanceId,
      requestedByAccountId,
      reason: reason?.trim() || null,
      status: 'REQUESTED',
      requestedAt: new Date().toISOString(),
      completedAt: null,
    };
    instance.status = 'NEEDS_RECHECK';
    instance.recheckRequestedAt = record.requestedAt;
    instance.completedAt = null;
    instance.instanceRevision += 1;
    await this.repo.saveInstance(instance);
    await this.repo.saveRecheck(record);
    return record;
  }

  async completeRecheck(recheckId: string): Promise<RecheckRecord> {
    const recheck = await this.repo.getRecheck(recheckId);
    if (!recheck) throw new AssignmentRuntimeError('RECHECK_NOT_FOUND', 'Recheck not found');
    if (recheck.status !== 'REQUESTED') throw new AssignmentRuntimeError('INVALID_RECHECK_STATUS', 'Recheck is not pending');
    recheck.status = 'COMPLETED';
    recheck.completedAt = new Date().toISOString();
    await this.repo.saveRecheck(recheck);

    // Teacher-resolved recheck is the only way out of NEEDS_RECHECK.
    const instance = await this.repo.getInstance(recheck.assignmentInstanceId);
    if (instance && instance.status === 'NEEDS_RECHECK') {
      const assignment = await this.repo.getAssignment(instance.assignmentId);
      const targets = assignment?.boundary.target.stationIds ?? [];
      const passed = new Set<string>(Array.isArray(instance.completionPayload.passedStationIds) ? (instance.completionPayload.passedStationIds as string[]) : []);
      const allPassed = targets.length > 0 && targets.every((target) => passed.has(target));
      instance.status = allPassed ? 'COMPLETED' : 'ACTIVE';
      instance.completedAt = allPassed ? new Date().toISOString() : null;
      instance.recheckRequestedAt = null;
      instance.instanceRevision += 1;
      await this.repo.saveInstance(instance);
    }
    return recheck;
  }
}
