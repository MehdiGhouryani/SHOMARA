import { NextResponse } from 'next/server';

/**
 * Retired. Assignment completion is decided by the server from verified STATION_PASS evidence
 * (see AssignmentRuntimeService.recordStationPass, called from the attempt-submit route).
 * A learner-reported outcome is never trusted. Teachers resolve NEEDS_RECHECK via the recheck routes.
 */
async function retired() {
  return NextResponse.json(
    { code: 'ASSIGNMENT_OUTCOME_ENDPOINT_RETIRED', message: 'Assignment completion is computed by the server and cannot be reported by the client.' },
    { status: 410 },
  );
}

export const POST = retired;
export const PUT = retired;
export const PATCH = retired;
