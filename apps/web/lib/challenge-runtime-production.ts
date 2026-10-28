import { supabaseRpc } from './supabase-http';

type ChallengeRpcClient = {
  station(stationCode: string): Promise<Record<string, unknown>>;
  start(input: { sessionId: string; challengeDefinitionId: string; idempotencyKey: string }): Promise<Record<string, unknown>>;
  submit(input: { runId: string; roundIndex: number; attemptNumber: number; idempotencyKey: string; answers: unknown[] }): Promise<Record<string, unknown>>;
  hint(input: { runId: string; roundIndex: number; hintIndex: number; idempotencyKey: string }): Promise<Record<string, unknown>>;
  finish(runId: string): Promise<Record<string, unknown>>;
  run(runId: string): Promise<Record<string, unknown>>;
};

/**
 * Thin HTTP boundary for the P04 server-authoritative challenge RPCs.
 * It deliberately exposes no evaluator config or answer key and never evaluates locally.
 */
export class SupabaseChallengeRuntimeProduction implements ChallengeRpcClient {
  constructor(private readonly accessToken: string) {}

  station(stationCode: string) {
    return supabaseRpc<Record<string, unknown>>(this.accessToken, 'runtime_get_station_challenge', {
      p_station_code: stationCode,
    });
  }

  start(input: { sessionId: string; challengeDefinitionId: string; idempotencyKey: string }) {
    return supabaseRpc<Record<string, unknown>>(this.accessToken, 'runtime_start_challenge', {
      p_session_id: input.sessionId,
      p_challenge_definition_id: input.challengeDefinitionId,
      p_start_idempotency_key: input.idempotencyKey,
    });
  }

  submit(input: { runId: string; roundIndex: number; attemptNumber: number; idempotencyKey: string; answers: unknown[] }) {
    return supabaseRpc<Record<string, unknown>>(this.accessToken, 'runtime_submit_challenge_round', {
      p_run_id: input.runId,
      p_round_index: input.roundIndex,
      p_attempt_number: input.attemptNumber,
      p_idempotency_key: input.idempotencyKey,
      p_request_fingerprint: 'SERVER_COMPUTED',
      p_answers: input.answers,
    });
  }

  hint(input: { runId: string; roundIndex: number; hintIndex: number; idempotencyKey: string }) {
    return supabaseRpc<Record<string, unknown>>(this.accessToken, 'runtime_request_challenge_hint', {
      p_run_id: input.runId,
      p_round_index: input.roundIndex,
      p_hint_index: input.hintIndex,
      p_idempotency_key: input.idempotencyKey,
    });
  }

  finish(runId: string) {
    return supabaseRpc<Record<string, unknown>>(this.accessToken, 'runtime_finish_challenge', {
      p_run_id: runId,
      p_reason: 'EXITED',
    });
  }

  run(runId: string) {
    return supabaseRpc<Record<string, unknown>>(this.accessToken, 'runtime_get_challenge_run', {
      p_run_id: runId,
    });
  }
}

export function productionChallengeRuntime(accessToken?: string): SupabaseChallengeRuntimeProduction {
  if (!accessToken) throw new Error('AUTH_BEARER_REQUIRED');
  return new SupabaseChallengeRuntimeProduction(accessToken);
}
