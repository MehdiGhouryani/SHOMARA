# Learning Runtime API Contract

## 1. Start Session

`POST /api/v1/learning/sessions`

Development body:

```json
{
  "learningIdentityId": "child-1",
  "relationshipContextId": "platform",
  "gradeId": "G1",
  "curriculumVersionId": "G1-CV1",
  "skillGraphVersionId": "G1-SG1",
  "sessionType": "LEARNING"
}
```

Server returns a canonical Session with pinned versions.

## 2. Create Encounter

`POST /api/v1/learning/sessions/{sessionId}/encounters`

```json
{
  "contentVersionId": "G1-ST01-CHECK-001",
  "stationId": "G1-ST01",
  "skillId": "G1-SK001",
  "learningRole": "MASTERY_CHECK",
  "experienceForm": "CHALLENGE",
  "sequence": 1
}
```

Server validates Session version pins and Content Version integrity.

## 3. Submit Attempt

`POST /api/v1/learning/attempts/submit`

```json
{
  "learningIdentityId": "child-1",
  "relationshipContextId": "platform",
  "sessionId": "session-id",
  "encounterId": "encounter-id",
  "attemptNumber": 1,
  "clientIdempotencyKey": "installation-id:attempt-id",
  "answers": [
    { "answerIndex": 0, "answerPayload": 3 }
  ]
}
```

Response contains:

- Attempt + evaluation
- Evidence reference/data
- current Learning State
- Learning Decision
- Learning Plan
- Station Pass status
- Recheck flag
- semantic event for animation/UI

## Authorization boundary

These development routes intentionally use a dev-only identity adapter. Production authentication/authorization must be connected to Supabase Auth + server-side relationship authorization before release.
