# Adult Projection API Contract

## Parent

```text
GET /api/v1/parent/:parentAccountId/children
GET /api/v1/parent/:parentAccountId/today
```

## Teacher

```text
GET /api/v1/teacher/:teacherAccountId/classes
GET /api/v1/teacher/:teacherAccountId/classes/:classId
GET /api/v1/teacher/:teacherAccountId/students/:learningIdentityId
GET /api/v1/teacher/:teacherAccountId/needs-attention
GET /api/v1/teacher/:teacherAccountId/recheck-queue
POST /api/v1/teacher/students/:learningIdentityId/observations
```

## Authorization

Development adapter checks the same boundaries expected in production:
- Parent → related child only.
- Teacher → own class learners only.

Production implementation must enforce via Supabase Auth + server-side authorization + RLS.

## Projection fields

Parent Today:
- child
- today summary
- current station
- skills snapshot
- next step
- recent learning
- simple home activity
- assignment status

Teacher Student Snapshot:
- student
- class IDs
- current station
- skills snapshot
- recent evidence summary
- current decision
- recommended next action
- recent interventions

## Observation

Observation payload is append-only source data with explicit provenance:

```json
{
  "teacherAccountId": "...",
  "classId": "...",
  "observation": "..."
}
```
