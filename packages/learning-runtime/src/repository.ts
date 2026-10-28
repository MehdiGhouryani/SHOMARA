import type {
  AttemptRecord,
  EncounterRecord,
  EvidenceRecord,
  LearningDecisionRecord,
  LearningPlanRecord,
  LearningStateRecord,
  RuntimeContentVersion,
  SessionRecord,
  StationCheckRecord,
} from './types.js';

export interface LearningRuntimeRepository {
  withTransaction<T>(work: (tx: LearningRuntimeRepository) => Promise<T>): Promise<T>;
  getSession(sessionId: string): Promise<SessionRecord | null>;
  saveSession(session: SessionRecord): Promise<void>;
  getEncounter(encounterId: string): Promise<EncounterRecord | null>;
  saveEncounter(encounter: EncounterRecord): Promise<void>;
  getContentVersion(contentVersionId: string): Promise<RuntimeContentVersion | null>;
  getAttemptByIdempotency(clientIdempotencyKey: string): Promise<AttemptRecord | null>;
  getAttemptCount(encounterId: string): Promise<number>;
  saveAttempt(attempt: AttemptRecord): Promise<void>;
  saveEvidence(evidence: EvidenceRecord): Promise<void>;
  getLearningState(learningIdentityId: string, skillId: string, relationshipContextId: string): Promise<LearningStateRecord | null>;
  saveLearningState(state: LearningStateRecord): Promise<void>;
  listStationChecks(learningIdentityId: string, stationId: string): Promise<StationCheckRecord[]>;
  saveStationCheck(check: StationCheckRecord): Promise<void>;
  saveDecision(decision: LearningDecisionRecord): Promise<void>;
  getDecisionByAttemptId(attemptId: string): Promise<LearningDecisionRecord | null>;
  savePlan(plan: LearningPlanRecord): Promise<void>;
  getPlanByDecisionId(decisionId: string): Promise<LearningPlanRecord | null>;
}

export class InMemoryLearningRuntimeRepository implements LearningRuntimeRepository {
  private sessions = new Map<string, SessionRecord>();
  private encounters = new Map<string, EncounterRecord>();
  private content = new Map<string, RuntimeContentVersion>();
  private attempts = new Map<string, AttemptRecord>();
  private idempotency = new Map<string, string>();
  private evidence = new Map<string, EvidenceRecord>();
  private states = new Map<string, LearningStateRecord>();
  private checks = new Map<string, StationCheckRecord>();
  private decisions = new Map<string, LearningDecisionRecord>();
  private decisionsByAttempt = new Map<string, string>();
  private plans = new Map<string, LearningPlanRecord>();

  registerContent(content: RuntimeContentVersion): void { this.content.set(content.id, content); }
  seedSession(session: SessionRecord): void { this.sessions.set(session.id, session); }

  async withTransaction<T>(work: (tx: LearningRuntimeRepository) => Promise<T>): Promise<T> { return work(this); }
  async getSession(sessionId: string): Promise<SessionRecord | null> { return this.sessions.get(sessionId) ?? null; }
  async saveSession(session: SessionRecord): Promise<void> { this.sessions.set(session.id, session); }
  async getEncounter(encounterId: string): Promise<EncounterRecord | null> { return this.encounters.get(encounterId) ?? null; }
  async saveEncounter(encounter: EncounterRecord): Promise<void> { this.encounters.set(encounter.id, encounter); }
  async getContentVersion(contentVersionId: string): Promise<RuntimeContentVersion | null> { return this.content.get(contentVersionId) ?? null; }
  async getAttemptByIdempotency(key: string): Promise<AttemptRecord | null> {
    const id = this.idempotency.get(key);
    return id ? (this.attempts.get(id) ?? null) : null;
  }
  async getAttemptCount(encounterId: string): Promise<number> { return [...this.attempts.values()].filter((a) => a.encounterId === encounterId).length; }
  async saveAttempt(attempt: AttemptRecord): Promise<void> {
    this.attempts.set(attempt.id, attempt);
    this.idempotency.set(attempt.clientIdempotencyKey, attempt.id);
  }
  async saveEvidence(evidence: EvidenceRecord): Promise<void> { this.evidence.set(evidence.id, evidence); }
  async getLearningState(learningIdentityId: string, skillId: string, relationshipContextId: string): Promise<LearningStateRecord | null> {
    return this.states.get(`${learningIdentityId}:${skillId}:${relationshipContextId}`) ?? null;
  }
  async saveLearningState(state: LearningStateRecord): Promise<void> {
    this.states.set(`${state.learningIdentityId}:${state.skillId}:${state.relationshipContextId}`, state);
  }
  async listStationChecks(learningIdentityId: string, stationId: string): Promise<StationCheckRecord[]> {
    return [...this.checks.values()].filter((c) => c.learningIdentityId === learningIdentityId && c.stationId === stationId);
  }
  async saveStationCheck(check: StationCheckRecord): Promise<void> { this.checks.set(check.id, check); }
  async saveDecision(decision: LearningDecisionRecord): Promise<void> {
    this.decisions.set(decision.id, decision);
    if (decision.sourceAttemptId) this.decisionsByAttempt.set(decision.sourceAttemptId, decision.id);
  }
  async getDecisionByAttemptId(attemptId: string): Promise<LearningDecisionRecord | null> {
    const id = this.decisionsByAttempt.get(attemptId);
    return id ? (this.decisions.get(id) ?? null) : null;
  }
  async savePlan(plan: LearningPlanRecord): Promise<void> { this.plans.set(plan.id, plan); }
  async getPlanByDecisionId(decisionId: string): Promise<LearningPlanRecord | null> {
    return [...this.plans.values()].find((plan) => plan.decisionId === decisionId) ?? null;
  }
}
