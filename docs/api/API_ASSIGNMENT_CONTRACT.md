# Assignment API Contract

## Create Assignment

`POST /api/v1/assignments`

```json
{
  "id": "assignment_...",
  "classId": "...",
  "authorAccountId": "...",
  "learnerIds": ["...", "..."],
  "sharedObjective": "...",
  "sharedOutcome": "...",
  "stationIds": ["ST01"],
  "adaptationMode": "BOUNDED_ADAPTIVE",
  "startsAt": "2026-09-24T18:00:00.000Z",
  "dueAt": null,
  "completionRule": "STATION_PASS"
}
```

## Publish

`POST /api/v1/assignments/:assignmentId`

```json
{
  "action": "PUBLISH",
  "learnerIds": ["child-01", "child-02"]
}
```

## Recheck

`POST /api/v1/assignment-instances/:instanceId/recheck`

```json
{
  "requestedByAccountId": "teacher-01",
  "reason": "یک بار دیگر بررسی شود"
}
```

## Recheck completion (teacher only)

`POST /api/v1/assignment-instances/:instanceId/recheck/complete` — body `{ "recheckId": "..." }`. Only the assignment author or a teacher of its class. This is the only way an instance leaves `NEEDS_RECHECK` (→ `COMPLETED` if every target station was passed, else `ACTIVE`). Recheck cannot be requested for `CANCELLED`/`EXPIRED` instances or when one is already pending (HTTP 409).

## Completion is server-authoritative

`POST /api/v1/assignment-instances/:instanceId/outcome` is **retired (HTTP 410)**. A learner can never report completion. The server marks an instance `COMPLETED` only after its own verified station pass (`completionRule: STATION_PASS`, every station in `target.stationIds` passed). Skill-only targets are not auto-completed.

## Child Assignment View

`GET /api/v1/learning-identities/:learningIdentityId/assignments`

Returns assignment metadata plus the child-specific instance. It does not expose raw class-wide learning data.
