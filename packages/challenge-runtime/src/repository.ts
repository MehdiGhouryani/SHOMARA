import type { StationChallengeDefinition } from '@math/contracts';
import type { ChallengeRewardEligibilityRecord, ChallengeRunRecord, StoredRoundSubmission } from './types';

/**
 * Persistence port for the challenge layer. It stores orchestration state only
 * (runs, round bookkeeping, idempotency receipts, reward eligibility); attempts,
 * evidence and learning state stay in the Learning Runtime repository.
 */
export interface ChallengeRepository {
  withTransaction<T>(work: (tx: ChallengeRepository) => Promise<T>): Promise<T>;
  getDefinition(challengeId: string): Promise<StationChallengeDefinition | null>;
  getActiveDefinitionForStation(stationId: string): Promise<StationChallengeDefinition | null>;
  getRun(runId: string): Promise<ChallengeRunRecord | null>;
  getRunByIdempotency(clientIdempotencyKey: string): Promise<ChallengeRunRecord | null>;
  saveRun(run: ChallengeRunRecord): Promise<void>;
  getRoundSubmission(clientIdempotencyKey: string): Promise<StoredRoundSubmission | null>;
  saveRoundSubmission(submission: StoredRoundSubmission): Promise<void>;
  hasHint(hintKey: string): Promise<boolean>;
  saveHint(hintKey: string): Promise<void>;
  getRewardEligibility(learningIdentityId: string, challengeCode: string): Promise<ChallengeRewardEligibilityRecord | null>;
  /** Must enforce uniqueness on (learningIdentityId, challengeCode); throws REWARD_ELIGIBILITY_EXISTS. */
  saveRewardEligibility(record: ChallengeRewardEligibilityRecord): Promise<void>;
  allocateEncounterSequence(sessionId: string): Promise<number>;
}

export class InMemoryChallengeRepository implements ChallengeRepository {
  private definitions = new Map<string, StationChallengeDefinition>();
  private runs = new Map<string, ChallengeRunRecord>();
  private runsByKey = new Map<string, string>();
  private submissions = new Map<string, StoredRoundSubmission>();
  private hints = new Set<string>();
  private eligibility = new Map<string, ChallengeRewardEligibilityRecord>();
  private sequences = new Map<string, number>();

  constructor(private readonly sequenceStart = 1000) {}

  registerDefinition(def: StationChallengeDefinition): void { this.definitions.set(def.id, clone(def)); }

  async withTransaction<T>(work: (tx: ChallengeRepository) => Promise<T>): Promise<T> { return work(this); }
  async getDefinition(id: string) { return this.definitions.get(id) ?? null; }
  async getActiveDefinitionForStation(stationId: string) {
    const active = [...this.definitions.values()].filter((d) => d.stationId === stationId && d.status === 'ACTIVE').sort((a, b) => b.version - a.version);
    return active[0] ?? null;
  }
  async getRun(id: string) { const r = this.runs.get(id); return r ? clone(r) : null; }
  async getRunByIdempotency(key: string) { const id = this.runsByKey.get(key); return id ? this.getRun(id) : null; }
  async saveRun(run: ChallengeRunRecord) { this.runs.set(run.id, clone(run)); this.runsByKey.set(run.clientIdempotencyKey, run.id); }
  async getRoundSubmission(key: string) { const s = this.submissions.get(key); return s ? clone(s) : null; }
  async saveRoundSubmission(s: StoredRoundSubmission) {
    if (this.submissions.has(s.clientIdempotencyKey)) throw new Error('IDEMPOTENCY_RACE_RETRY');
    this.submissions.set(s.clientIdempotencyKey, clone(s));
  }
  async hasHint(key: string) { return this.hints.has(key); }
  async saveHint(key: string) { this.hints.add(key); }
  async getRewardEligibility(learningIdentityId: string, challengeCode: string) { return this.eligibility.get(`${learningIdentityId}:${challengeCode}`) ?? null; }
  async saveRewardEligibility(record: ChallengeRewardEligibilityRecord) {
    const k = `${record.learningIdentityId}:${record.challengeCode}`;
    if (this.eligibility.has(k)) throw new Error('REWARD_ELIGIBILITY_EXISTS');
    this.eligibility.set(k, { ...record });
  }
  async allocateEncounterSequence(sessionId: string) {
    const next = (this.sequences.get(sessionId) ?? this.sequenceStart) + 1;
    this.sequences.set(sessionId, next);
    return next;
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
