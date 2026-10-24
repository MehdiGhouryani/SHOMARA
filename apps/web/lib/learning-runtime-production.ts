import { supabaseRpc } from './supabase-http';
import type {
  AnswerSubmission,
  EncounterRecord,
  LearningPlanRecord,
  LearningStateRecord,
  SessionRecord,
  SubmitAttemptCommand,
  SubmitAttemptResult,
  AttemptRecord,
  EvidenceRecord,
  LearningDecisionRecord,
} from '@math/learning-runtime';

type RawSubmit = {
  idempotent: boolean;
  attempt: Record<string, unknown>;
  evidence: Record<string, unknown> | null;
  learningState: Record<string, unknown>;
  decision: Record<string, unknown>;
  plan: Record<string, unknown>;
  stationPass: boolean;
  recheckRequired: boolean;
  semanticEvent: SubmitAttemptResult['semanticEvent'];
};

function rawAttempt(value: Record<string, unknown>): AttemptRecord {
  return {
    id: String(value.id),
    encounterId: String(value.encounter_id),
    attemptNumber: Number(value.attempt_number),
    clientIdempotencyKey: String(value.client_idempotency_key),
    status: value.status as AttemptRecord['status'],
    answers: Array.isArray(value.answers)
      ? value.answers.map((item) => {
          const row = item as Record<string, unknown>;
          return { answerIndex: Number(row.answerIndex), answerPayload: row.answerPayload };
        })
      : [],
    evaluation: value.evaluation_payload
      ? {
          accepted: Boolean((value.evaluation_payload as Record<string, unknown>).accepted ?? value.accepted),
          correct: Boolean((value.evaluation_payload as Record<string, unknown>).correct ?? false),
          score: Number((value.evaluation_payload as Record<string, unknown>).score ?? value.score ?? 0),
          maxScore: Number((value.evaluation_payload as Record<string, unknown>).maxScore ?? value.max_score ?? 0),
          evaluatorVersion: String((value.evaluation_payload as Record<string, unknown>).evaluatorVersion ?? value.evaluator_version),
          feedbackCode: String((value.evaluation_payload as Record<string, unknown>).feedbackCode ?? (Boolean((value.evaluation_payload as Record<string, unknown>).correct ?? false) ? 'CORRECT' : 'TRY_AGAIN')),
          payload: value.evaluation_payload as Record<string, unknown>,
        }
      : undefined,
    startedAt: String(value.started_at),
    submittedAt: value.submitted_at ? String(value.submitted_at) : undefined,
  };
}

function rawEvidence(value: Record<string, unknown>): EvidenceRecord {
  return {
    id: String(value.id),
    learningIdentityId: String(value.learning_identity_id),
    sessionId: String(value.session_id),
    encounterId: String(value.encounter_id),
    attemptId: String(value.attempt_id),
    skillId: String(value.skill_id),
    contentVersionId: String(value.content_version_id),
    relationshipContextId: String(value.relationship_context_id),
    evidenceType: String(value.evidence_type),
    quality: value.quality as EvidenceRecord['quality'],
    payload: (value.payload ?? {}) as Record<string, unknown>,
    occurredAt: String(value.occurred_at),
    ...(value.source_type ? { sourceType: String(value.source_type) } : {}),
    ...(value.actor_account_id ? { actorAccountId: String(value.actor_account_id) } : {}),
    ...(value.evidence_kind ? { evidenceKind: String(value.evidence_kind) } : {}),
    ...(value.provenance && typeof value.provenance === 'object' ? { provenance: value.provenance as Record<string, unknown> } : {}),
    ...(value.client_installation_id ? { clientInstallationId: String(value.client_installation_id) } : {}),
    ...(value.client_event_id ? { clientEventId: String(value.client_event_id) } : {}),
  };
}

function rawState(value: Record<string, unknown>): LearningStateRecord {
  return {
    learningIdentityId: String(value.learning_identity_id),
    skillId: String(value.skill_id),
    relationshipContextId: String(value.relationship_context_id),
    state: value.state as LearningStateRecord['state'],
    revision: Number(value.revision),
    retentionState: value.retention_state as LearningStateRecord['retentionState'],
    lastEvidenceAt: String(value.last_evidence_at),
    confidence: Number(value.confidence),
    uncertainty: Number(value.uncertainty),
    reviewNeed: Boolean(value.review_need),
    recoveryNeed: Boolean(value.recovery_need),
  };
}

function rawDecision(value: Record<string, unknown>): LearningDecisionRecord {
  const selected = value.selected_step as Record<string, unknown> | string | undefined;
  const selectedStep = typeof selected === 'string' ? selected : String(selected?.step ?? 'CONTINUE');
  return {
    id: String(value.id),
    learningIdentityId: String(value.learning_identity_id),
    targetSkillId: String(value.target_skill_id),
    relationshipContextId: String(value.relationship_context_id),
    selectedStep: selectedStep as LearningDecisionRecord['selectedStep'],
    objectiveContext: String(value.objective_context ?? ''),
    generationVersion: String(value.generation_version),
    decisionPolicyVersion: String(value.decision_policy_version),
    evidenceRefs: Array.isArray(value.evidence_refs) ? value.evidence_refs.map(String) : [],
    sourceAttemptId: String(value.source_attempt_id),
    status: value.status as LearningDecisionRecord['status'],
    createdAt: String(value.created_at),
  };
}

function rawPlan(value: Record<string, unknown>): LearningPlanRecord {
  return {
    id: String(value.id),
    decisionId: String(value.decision_id),
    learningIdentityId: String(value.learning_identity_id),
    status: value.status as LearningPlanRecord['status'],
    planPayload: (value.plan_payload ?? {}) as Record<string, unknown>,
    createdAt: String(value.created_at),
  };
}

export class SupabaseLearningRuntimeProduction {
  constructor(private readonly accessToken: string) {}

  async startSession(input: {
    gradeCode: string;
    curriculumVersion: string;
    skillGraphVersion: string;
    relationshipContextId?: string;
    sessionType: SessionRecord['sessionType'];
    clientInstallationId?: string;
  }): Promise<SessionRecord> {
    const data = await supabaseRpc<Record<string, unknown>>(this.accessToken, 'runtime_start_session', {
      p_grade_code: input.gradeCode,
      p_curriculum_version: input.curriculumVersion,
      p_skill_graph_version: input.skillGraphVersion,
      p_session_type: input.sessionType,
      p_relationship_context_id: input.relationshipContextId ?? null,
      p_client_installation_id: input.clientInstallationId ?? null,
    });
    return {
      id: String(data.id),
      learningIdentityId: String(data.learningIdentityId),
      relationshipContextId: String(data.relationshipContextId),
      gradeId: String(data.gradeId),
      curriculumVersionId: String(data.curriculumVersionId),
      skillGraphVersionId: String(data.skillGraphVersionId),
      sessionType: data.sessionType as SessionRecord['sessionType'],
      status: data.status as SessionRecord['status'],
      createdAt: String(data.createdAt),
      lastActivityAt: String(data.lastActivityAt),
    };
  }

  async createEncounter(input: {
    sessionId: string;
    sequence: number;
    contentVersionId: string;
    stationCode: string;
    skillCode: string;
    learningObjectiveId?: string | undefined;
  }): Promise<EncounterRecord> {
    const data = await supabaseRpc<Record<string, unknown>>(this.accessToken, 'runtime_create_encounter', {
      p_session_id: input.sessionId,
      p_sequence: input.sequence,
      p_content_version_id: input.contentVersionId,
      p_station_code: input.stationCode,
      p_skill_code: input.skillCode,
      p_learning_role: null,
      p_experience_form: null,
      p_learning_objective_id: input.learningObjectiveId ?? null,
    });
    return data as unknown as EncounterRecord;
  }

  async submitAttempt(command: Omit<SubmitAttemptCommand, 'learningIdentityId' | 'relationshipContextId'> & { relationshipContextId?: string | undefined }): Promise<SubmitAttemptResult> {
    const data = await supabaseRpc<RawSubmit>(this.accessToken, 'runtime_submit_attempt', {
      p_session_id: command.sessionId,
      p_encounter_id: command.encounterId,
      p_attempt_number: command.attemptNumber,
      p_client_idempotency_key: command.clientIdempotencyKey,
      p_answers: command.answers,
    });
    return {
      idempotent: Boolean(data.idempotent),
      attempt: rawAttempt(data.attempt),
      evidence: data.evidence ? rawEvidence(data.evidence) : null,
      learningState: rawState(data.learningState),
      decision: rawDecision(data.decision),
      plan: rawPlan(data.plan),
      stationPass: Boolean(data.stationPass),
      recheckRequired: Boolean(data.recheckRequired),
      semanticEvent: data.semanticEvent,
    };
  }
}

export function productionLearningRuntime(accessToken?: string): SupabaseLearningRuntimeProduction {
  if (!accessToken) throw new Error('AUTH_BEARER_REQUIRED');
  return new SupabaseLearningRuntimeProduction(accessToken);
}
