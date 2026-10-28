import { runtimeStore } from '@/lib/learning-runtime';
import { assignmentRuntime } from '@/lib/assignment-runtime';

/**
 * Server-authoritative assignment completion. Call only after the learning runtime itself reported
 * stationPass. Best-effort: a failure here must never lose or fail the learner's attempt.
 * The encounter lookup currently resolves only against the in-memory runtime store; production wiring
 * arrives together with the persistent assignment repository (see START_HERE, open item).
 */
export async function recordAssignmentStationPass(learningIdentityId: string, encounterId: string): Promise<void> {
  try {
    const encounter = await runtimeStore.repo.getEncounter(encounterId);
    if (encounter?.stationId) await assignmentRuntime.service.recordStationPass(learningIdentityId, encounter.stationId);
  } catch (error) {
    console.error('ASSIGNMENT_STATION_PASS_RECORD_FAILED', error instanceof Error ? error.message : error);
  }
}
