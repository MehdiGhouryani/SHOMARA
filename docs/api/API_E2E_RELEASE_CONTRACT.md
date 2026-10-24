# E2E / Release API Contract

## Critical endpoints under E2E

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/content/manifest?gradeId=G1` | GET | Independent manifest retrieval |
| `/api/v1/learning/sessions` | POST | Start version-pinned session |
| `/api/v1/assignments` | POST | Create bounded teacher assignment |
| `/api/v1/assignments/:id` | POST | Publish assignment to learners |
| `/api/v1/sync/batch` | POST | Idempotent offline action sync |
| `/api/v1/parent/:id/today` | GET | Parent projection |
| `/api/v1/teacher/:id/classes` | GET | Teacher class projection |

## E2E invariants

1. Manifest does not require full-grade content download.
2. Session pins Grade + Curriculum + Skill Graph versions.
3. Assignment does not duplicate content packages.
4. Sync batch is capped at 20 actions.
5. Duplicate idempotency keys do not create duplicate learning records.
6. Parent/Teacher responses are projections, not new learning truths.
7. Client cannot directly set Mastery, Station Pass or Learning State.
