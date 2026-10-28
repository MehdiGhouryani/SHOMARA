import type { AssignmentInstanceRecord, AssignmentRecord, RecheckRecord } from './types.js';

export interface AssignmentRepository {
  saveAssignment(record: AssignmentRecord): Promise<void>;
  getAssignment(id: string): Promise<AssignmentRecord | null>;
  saveInstance(record: AssignmentInstanceRecord): Promise<void>;
  getInstance(id: string): Promise<AssignmentInstanceRecord | null>;
  listInstances(assignmentId: string): Promise<AssignmentInstanceRecord[]>;
  listInstancesForLearner(learningIdentityId: string): Promise<AssignmentInstanceRecord[]>;
  saveRecheck(record: RecheckRecord): Promise<void>;
  getRecheck(id: string): Promise<RecheckRecord | null>;
}

export class InMemoryAssignmentRepository implements AssignmentRepository {
  private assignments = new Map<string, AssignmentRecord>();
  private instances = new Map<string, AssignmentInstanceRecord>();
  private rechecks = new Map<string, RecheckRecord>();

  async saveAssignment(record: AssignmentRecord): Promise<void> { this.assignments.set(record.id, record); }
  async getAssignment(id: string): Promise<AssignmentRecord | null> { return this.assignments.get(id) ?? null; }
  async saveInstance(record: AssignmentInstanceRecord): Promise<void> { this.instances.set(record.id, record); }
  async getInstance(id: string): Promise<AssignmentInstanceRecord | null> { return this.instances.get(id) ?? null; }
  async listInstances(assignmentId: string): Promise<AssignmentInstanceRecord[]> {
    return [...this.instances.values()].filter((item) => item.assignmentId === assignmentId);
  }
  async listInstancesForLearner(learningIdentityId: string): Promise<AssignmentInstanceRecord[]> {
    return [...this.instances.values()].filter((item) => item.learningIdentityId === learningIdentityId);
  }
  async saveRecheck(record: RecheckRecord): Promise<void> { this.rechecks.set(record.id, record); }
  async getRecheck(id: string): Promise<RecheckRecord | null> { return this.rechecks.get(id) ?? null; }
}
