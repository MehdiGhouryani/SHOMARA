# ARCHITECTURE.md — معماری، مرزها و قراردادها

> این فایل جای 34 سند در سه خانوادهٔ `docs/architecture`, `docs/reference`, `docs/api` را گرفته است.
> هر بخش از یک سند اصلی آمده و نام آن سند را دارد؛ متن کامل هر سند در تاریخ گیت قابل بازیابی است.
> تراکم: تکرار و قالب خالی حذف شده، خطوط قرارداد و قاعده نگه داشته شده‌اند.

## Adult Projection API Contract

**Adult Projection API Contract**
**Parent**
- GET /api/v1/parent/:parentAccountId/children
- GET /api/v1/parent/:parentAccountId/today
**Teacher**
- GET /api/v1/teacher/:teacherAccountId/classes
- GET /api/v1/teacher/:teacherAccountId/classes/:classId
- GET /api/v1/teacher/:teacherAccountId/students/:learningIdentityId
- GET /api/v1/teacher/:teacherAccountId/needs-attention
- GET /api/v1/teacher/:teacherAccountId/recheck-queue
- POST /api/v1/teacher/students/:learningIdentityId/observations
**Authorization**
- Development adapter checks the same boundaries expected in production:
- - Parent â†’ related child only.
- - Teacher â†’ own class learners only.
- Production implementation must enforce via Supabase Auth + server-side authorization + RLS.
**Projection fields**
- Parent Today:
- - today summary
- - current station
- - skills snapshot
- - recent learning
- - simple home activity
- - assignment status
- Teacher Student Snapshot:
- - recent evidence summary
- - current decision
- - recommended next action
- - recent interventions
**Observation**
- Observation payload is append-only source data with explicit provenance:
- "teacherAccountId": "...",
- "classId": "...",
- "observation": "..."

_منبع: `docs/api/API_ADULT_PROJECTION_CONTRACT.md`_

## Assignment API Contract

**Assignment API Contract**
**Create Assignment**
- `POST /api/v1/assignments`
- "id": "assignment_...",
- "classId": "...",
- "authorAccountId": "...",
- "learnerIds": ["...", "..."],
- "sharedObjective": "...",
- "sharedOutcome": "...",
- "stationIds": ["ST01"],
- "adaptationMode": "BOUNDED_ADAPTIVE",
- "startsAt": "2026-09-24T18:00:00.000Z",
- "dueAt": null,
- "completionRule": "STATION_PASS"
**Publish**
- `POST /api/v1/assignments/:assignmentId`
- "action": "PUBLISH",
- "learnerIds": ["child-01", "child-02"]
**Recheck**
- `POST /api/v1/assignment-instances/:instanceId/recheck`
- "requestedByAccountId": "teacher-01",
- "reason": "ÛŒÚ© Ø¨Ø§Ø± Ø¯ÛŒÚ¯Ø± Ø¨Ø±Ø±Ø³ÛŒ Ø´ÙˆØ¯"
**Recheck completion (teacher only)**
- `POST /api/v1/assignment-instances/:instanceId/recheck/complete` â€” body `{ "recheckId": "..." }`. Only the assignment author or a teacher of its class. This is the only way an instance leaves `NEEDS_RECHECK` (â†’ `COMPLETED` if every target station was passed, else `ACTIVE`). Recheck cannot be requested for `CANCELLED`/`EXPIRED` instances or when one is already pending (HTTP 409).
**Completion is server-authoritative**
- `POST /api/v1/assignment-instances/:instanceId/outcome` is **retired (HTTP 410)**. A learner can never report completion. The server marks an instance `COMPLETED` only after its own verified station pass (`completionRule: STATION_PASS`, every station in `target.stationIds` passed). Skill-only targets are not auto-completed.
**Child Assignment View**
- `GET /api/v1/learning-identities/:learningIdentityId/assignments`
- Returns assignment metadata plus the child-specific instance. It does not expose raw class-wide learning data.

_منبع: `docs/api/API_ASSIGNMENT_CONTRACT.md`_

## Content Delivery API Contract

**Content Delivery API Contract**
**Manifest**
- `GET /api/v1/content/manifest?gradeId={gradeId}`
- Response: `ContentManifest`
**Package**
- `GET /api/v1/content/packages/{packageId}`
- The route returns package bytes. Response headers include package ID and SHA-256 checksum.
**Entitlement**
- `GET /api/v1/content/entitlements/{packageId}`
- Header: `x-learning-identity-id`.
- Production implementation must use authenticated identity plus server-side authorization/RLS. Development uses `DEV_GRANT` only outside production.
**Assignment content requirement**
- `GET /api/v1/assignments/{assignmentId}/content`
- Production implementation resolves `assignment_required_packages`; the current development route is intentionally a non-authoritative fixture.
**Client rules**
- - Never trust a package URL without a manifest record.
- - Never mark a package usable before checksum verification.
- - Never download future content by default.
- - Never treat entitlement as equivalent to local cache presence.
- - Package cache is disposable; canonical content access is server authoritative.

_منبع: `docs/api/API_CONTENT_DELIVERY_CONTRACT.md`_

## E2E / Release API Contract

**E2E / Release API Contract**
**Critical endpoints under E2E**
- | Endpoint | Method | Purpose |
- | `/api/v1/content/manifest?gradeId=G1` | GET | Independent manifest retrieval |
- | `/api/v1/learning/sessions` | POST | Start version-pinned session |
- | `/api/v1/assignments` | POST | Create bounded teacher assignment |
- | `/api/v1/assignments/:id` | POST | Publish assignment to learners |
- | `/api/v1/sync/batch` | POST | Idempotent offline action sync |
- | `/api/v1/parent/:id/today` | GET | Parent projection |
- | `/api/v1/teacher/:id/classes` | GET | Teacher class projection |
**E2E invariants**
- 1. Manifest does not require full-grade content download.
- 2. Session pins Grade + Curriculum + Skill Graph versions.
- 3. Assignment does not duplicate content packages.
- 4. Sync batch is capped at 20 actions.
- 5. Duplicate idempotency keys do not create duplicate learning records.
- 6. Parent/Teacher responses are projections, not new learning truths.
- 7. Client cannot directly set Mastery, Station Pass or Learning State.

_منبع: `docs/api/API_E2E_RELEASE_CONTRACT.md`_

## Learning Runtime API Contract

**Learning Runtime API Contract**
**1. Start Session**
- `POST /api/v1/learning/sessions`
- Development body:
- "learningIdentityId": "child-1",
- "relationshipContextId": "platform",
- "gradeId": "G1",
- "curriculumVersionId": "G1-CV1",
- "skillGraphVersionId": "G1-SG1",
- "sessionType": "LEARNING"
- Server returns a canonical Session with pinned versions.
**2. Create Encounter**
- `POST /api/v1/learning/sessions/{sessionId}/encounters`
- "contentVersionId": "G1-ST01-CHECK-001",
- "stationId": "G1-ST01",
- "skillId": "G1-SK001",
- "learningRole": "MASTERY_CHECK",
- "experienceForm": "CHALLENGE",
- "sequence": 1
- Server validates Session version pins and Content Version integrity.
**3. Submit Attempt**
- `POST /api/v1/learning/attempts/submit`
- "sessionId": "session-id",
- "encounterId": "encounter-id",
- "attemptNumber": 1,
- "clientIdempotencyKey": "installation-id:attempt-id",
- "answers": [
- { "answerIndex": 0, "answerPayload": 3 }
- Response contains:
- - Attempt + evaluation
- - Evidence reference/data
- - current Learning State
- - Learning Decision
- - Learning Plan
- - Station Pass status
- - Recheck flag
- - semantic event for animation/UI
**Authorization boundary**
- These development routes intentionally use a dev-only identity adapter. Production authentication/authorization must be connected to Supabase Auth + server-side relationship authorization before release.

_منبع: `docs/api/API_LEARNING_RUNTIME_CONTRACT.md`_

## Offline Sync API Contract

**Offline Sync API Contract**
**POST /api/v1/sync/batch**
- - `X-Client-Installation-Id` required.
- "actions": [
- "id": "local-action-id",
- "clientInstallationId": "installation-id",
- "learningIdentityId": "learning-id",
- "operationType": "SUBMIT_ATTEMPT",
- "idempotencyKey": "unique-operation-key",
- "payload": {},
- "status": "PENDING",
- "attemptCount": 0,
- "createdAt": "2026-09-24T00:00:00.000Z",
- "updatedAt": "2026-09-24T00:00:00.000Z"
- "results": [
- "status": "ACKED",
- "response": {}
**Result semantics**
- - `ACKED`: canonical server processing accepted the operation.
- - `DUPLICATE`: operation already accepted; client may safely remove local copy.
- - `RETRY`: transient condition; keep local action.
- - `REJECTED`: permanent contract/auth/content error; keep auditable failure state and do not loop forever.
**Content cache semantics**
- `CURRENT / NEXT / RECENT / FUTURE` remain a local delivery policy. Cache state is not Learning Truth.

_منبع: `docs/api/API_OFFLINE_SYNC_CONTRACT.md`_

## API Surface Registry (Mobile â†” Backend)

**API Surface Registry (Mobile â†” Backend)**
**Phase:** B1 (draft, living document)
**Date:** 2026-10-06
**Rule:** Mobile learning path must only call routes listed here (or Supabase RPC equivalents documented below).
- Client entrypoint: `apps/mobile/src/station/runtimeApi.ts`
- Contracts: `packages/contracts`, `packages/learning-runtime`, `packages/challenge-runtime`
**1. Auth & installation**
- | Client capability | Method / path (HTTP) | Notes |
- | Request OTP | auth API module | Iran mobile |
- | Verify OTP | auth API module | Issues access token |
- | Hydrate token | local secure store | Not learning truth |
- | Register installation | `POST /api/v1/client/installations` | Device binding |
**2. Learning runtime**
- | Client capability | Method / path | Server authority |
- | Start station session | `POST /api/v1/learning/sessions` | Pins grade / curriculum / graph versions |
- | Resume session | runtime resume (RPC / HTTP) | Snapshot + latest encounter |
- | Create encounter | `POST /api/v1/learning/sessions/{id}/encounters` | Content version integrity |
- | Submit attempt | `POST /api/v1/learning/attempts/submit` | Evaluation + evidence + decision |
- | Progression snapshot | progression endpoint / `runtime_get_progression_snapshot` | completed + jump unlocks |
- Detailed shapes: `API_LEARNING_RUNTIME_CONTRACT.md`
**3. Signature challenge**
- | Client capability | Preferred server surface | Notes |
- | Start challenge | `runtime_start_challenge` | sessionId + definitionId + idempotency |
- | Submit round | `runtime_submit_challenge_round` | answers fingerprint; no client grading |
- | Request hint | `runtime_request_challenge_hint` | Level-aware |
- | Finish / exit | `runtime_finish_challenge` | Does **not** set station pass |
- | Read run | `runtime_get_challenge_run` / `challenge_run_view` | Presentation only (0072) |
**Guardrail:** Challenge results are practice evidence, never mastery/station completion.
- SQL foundations: `0055`, `0056`, `0072`
**4. Content delivery**
- | Client capability | Path area | Notes |
- | Manifest | content API | Per grade |
- | Entitlement | ` /api/v1/content/entitlements/{packageId}` | |
- | Download package | content manager | Checksum / channel |
- See `API_CONTENT_DELIVERY_CONTRACT.md`
**5. Engagement (infra only)**
- | Client capability | Area | Notes |
- | Mission hub | mission RPC / API | P06 |
- | Achievements | collection projection | P07 |
- | Avatar workshop | avatar save / get | P08 |

_منبع: `docs/api/API_SURFACE_REGISTRY.md`_

## ADR Reconciliation â€” Phase P2 (ÙØ§Ø² Ù…Ø¹Ù…Ø§Ø±ÛŒ Ùˆ ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§Ø› Ø¨Ø¯ÙˆÙ† Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ Ú©Ø¯)

**ADR Reconciliation â€” Phase P2 (ÙØ§Ø² Ù…Ø¹Ù…Ø§Ø±ÛŒ Ùˆ ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§Ø› Ø¨Ø¯ÙˆÙ† Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ Ú©Ø¯)**
- - **ØªØ§Ø±ÛŒØ®:** 2026-11-13 Â· **Ø´Ø§Ø®Ù‡:** `infra/p2-adr-reconciliation` (Ø§Ø² `infra/p1-ci-stabilization@d0da740`)
- - **Ù…Ø£Ù…ÙˆØ±ÛŒØª Ù…Ø§Ù„Ú©:** Ù‡Ù…â€ŒØ¢Ø´ØªÛŒ Ú©Ø§Ù…Ù„ Ù…Ø¹Ù…Ø§Ø±ÛŒ Ø­ÙˆÙ„ ADR-0039 (Ù…Ø­ØµÙˆÙ„ Ú©ÙˆØ¯Ú© Ú©Ø§Ù…Ù„Ø§Ù‹ Ø¢ÙÙ„Ø§ÛŒÙ†)Ø› Ù‡ÛŒÚ† Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ Ø¨Ø²Ø±Ú¯ Ú©Ø¯Ø› Ù‡ÛŒÚ† Ø§Ø¬Ø±Ø§ÛŒ ÙØ§Ø²Ù‡Ø§ÛŒ 3â€“6 ØªØ§ ØªØµÙˆÛŒØ¨ O1/O2/O3/O4.
- - **ØªØ£ÛŒÛŒØ¯ ÙˆØ±ÙˆØ¯ÛŒâ€ŒÙ‡Ø§ (Ø¨Ø¯ÙˆÙ† ØªÚ©Ø±Ø§Ø± Ù…Ù…ÛŒØ²ÛŒ):** commit Ø§Ø¯Ø¹Ø§Ø´Ø¯Ù‡Ù” `f0b6823` **Ù…ÙˆØ¬ÙˆØ¯ Ùˆ ancestor of HEAD Ø§Ø³Øª** (merge-base check) Ùˆ Ù‡Ø± Ù¾Ù†Ø¬ Ø³Ù†Ø¯ Phase 0 Ø¯Ø± clone ÙØ¹Ø§Ù„ Ø­Ø§Ø¶Ø±Ù†Ø¯: `INFRASTRUCTURE_{GAP_REGISTER,TARGET_ARCHITECTURE,EXECUTION_ROADMAP,OWNER_DECISIONS,BASELINE_…
- - **Ù‡Ù…Ø±Ø§Ù‡ Ø§ÛŒÙ† Ø³Ù†Ø¯:** Register Ø²Ù†Ø¯Ù‡Ù” ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§ Ø¯Ø± `INFRASTRUCTURE_OWNER_DECISIONS_FA.md` (v2 Ø¨Ø§ ÙˆØ¶Ø¹ÛŒØª OPEN/PROPOSED/APPROVED/REJECTED).
**1. ADR Reconciliation Map**
- ÙˆØ¶Ø¹ÛŒØªâ€ŒÙ‡Ø§: **GOVERNING** (Ù‚Ø§Ù†ÙˆÙ† Ø­Ø§Ú©Ù…) Â· **AMENDED** (Ø¯Ø± Ø§ÛŒÙ† ÙØ§Ø² Ø­Ø¯Ø§Ù‚Ù„ÛŒ Ø§ØµÙ„Ø§Ø­ Ø´Ø¯) Â· **STATUS-NOTE** (ÛŒØ§Ø¯Ø¯Ø§Ø´Øª Superseded-byØŒ Ù…ØªÙ† ØªØ§Ø±ÛŒØ®ÛŒ Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡) Â· **ALREADY-RECONCILED** Â· **FROZEN-PENDING** (Ù‚Ø§Ù†ÙˆÙ† Ù‚Ø¯ÛŒÙ…ÛŒ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯ ÙˆÙ„ÛŒ Ø§Ø¬Ø±Ø§ÛŒ Ø¢…
- | Ø§Ø«Ø± / Ø³Ù†Ø¯ | Ù‚Ø§Ù†ÙˆÙ† Ù‚Ø¨Ù„ Ø§Ø² P2 | ØªØ¹Ø§Ø±Ø¶ Ø¨Ø§ ADR-0039 | Ø§Ù‚Ø¯Ø§Ù… P2 | ÙˆØ¶Ø¹ÛŒØª Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡ |
- | ADR-0039 (2026-11-05) | â€” | â€” | Ù…Ø±Ø¬Ø¹ | GOVERNING |
- | ADR-0003 Server-Authoritative | Learning truth = Platform runtime | Ú©Ø§Ù…Ù„ Ø®Ù„Ø§Ù Â§2 ADR-0039 | ÛŒØ§Ø¯Ø¯Ø§Ø´Øª Status Ø¨Ø§ Ø§Ø±Ø¬Ø§Ø¹ SUPERSEDED-IN-PARTâ†’ADR-0039Ø› Ù…ØªÙ† ØªØ§Ø±ÛŒØ®ÛŒ Ø­ÙØ¸Ø› Ø³Ø±Ù†ÙˆØ´Øª Ø§Ø³ØªÚ© Ø³Ø±ÙˆØ± â†’ O6 | STATUS-NOTE |
- | ADR-0036 (identity/minSdk 24) | app id + API 24 | Ù†Ø¯Ø§Ø±Ø¯ | â€” | COMPATIBLE |
- | ADR-0037 (Track A beta lock) | milestones Ù…ØªØµÙ„ Ø¨Ù‡ backendØŒ OTPØŒ sync | Track A Ú©Ù„Ø§ÛŒÙ†Øª Ø§Ú©Ø³Ù¾ÙˆÛŒ Ù…ØªØµÙ„ Ø¨Ù‡ Ø³Ø±ÙˆØ± Ø§Ø³ØªØ› ÙØ§Ø²Ù‡Ø§ÛŒ backend Ø¢Ù† Ø¨Ø§ ADR-0039 Ø¬Ù…Ø¹â€ŒØ´Ø¯Ù†ÛŒ Ù†ÛŒØ³Øª | **ÙˆÛŒØ±Ø§ÛŒØ´ Ù†Ø´Ø¯**Ø› Ø¢ÛŒØªÙ…â€ŒÙ‡Ø§ÛŒ Ø§Ù…Ù†ÛŒØªÛŒ P0 Ø®ÙˆØ¯Ø´ Ù…Ø¹ØªØ¨Ø± Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ø› Ù‡Ø± Ø§…
- | ADR-0038 (splash/launch/DEBUG OTP N08-15) | Ù…Ø³ÛŒØ± OTP Ø¯Ø± launch | OTP Ø¯Ø± Phase 2 Ø¨Ø±Ù†Ø§Ù…Ù‡ (Ù¾Ø³ Ø§Ø² O5) Ø­Ø°Ù Ù…ÛŒâ€ŒØ´ÙˆØ¯ | â€” | COMPATIBLE (ØªØ§ Ø¢Ù†â€ŒÙ‡Ù†Ú¯Ø§Ù… fail-closed ÙØ¹Ù„ÛŒ Ù…Ø¹ØªØ¨Ø±) |
- | ADR-0040 (UI amendments) | Ù‚ÙˆØ§Ø¹Ø¯ Clay/TalkBack/Ã— | Ù†Ø¯Ø§Ø±Ø¯ (Ù‡Ù…â€ŒØ±Ø§Ø³ØªØ§ Ø¨Ø§ Â§6 ADR-0039) | â€” | COMPATIBLE |
- | AGENTS.md Â§3-Ù‚5 | Â«ÙÙ‚Ø· server-authoritative Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯Â» | Ø®Ù„Ø§Ù Â§2 | **AMENDED:** Â«ÙÙ‚Ø· Ø§Ø² Ù…Ù†Ø¨Ø¹ Ø­Ù‚ÛŒÙ‚Øª Ù…Ø­ØµÙˆÙ„ (Ù¾Ú©ÛŒØ¬ bundle + Ø§Ø±Ø²ÛŒØ§Ø¨ Ù…Ø­Ù„ÛŒ Ù†Ø³Ø®Ù‡â€ŒØ¯Ø§Ø± â€” ADR-0039)â€¦Â» | Ø¨Ø§Ø²: Ø¬Ø²Ø¦ÛŒØ§Øª evaluator = O1 |
- | AGENTS.md Â§3-Ù‚6 | Â«answer key Ùˆ evaluator ÙˆØ§Ø±Ø¯ Ú©Ù„Ø§ÛŒÙ†Øª Ú©ÙˆØ¯Ú© Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯Â» | Ø³Ø§Ø²Ú¯Ø§Ø± ÙˆÙ„ÛŒ Ù…Ø¨Ù‡Ù… Ø¯Ø± Ù…Ø¯Ù„ Ø¬Ø¯ÛŒØ¯ | **AMENDED:** Ú©Ù„ÛŒØ¯ Ù‡Ø±Ú¯Ø² ÙˆØ§Ø±Ø¯ Ù¾Ø±ÙˆØ¬Ú©Ø´Ù†/DB/Ù„Ø§Ú¯/telemetryØ› ÙÙ‚Ø· Ø¯Ø± Ù„Ø§ÛŒÙ‡Ù” Ø§Ø±Ø²ÛŒØ§Ø¨ Ù…Ø­Ù„ÛŒ (CONTENT-008/018) | Ø¨Ø³ØªÙ‡ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù…
- | AGENTS.md Â§5 | Â«repository Ù‡Ù…Ø§Ù‡Ù†Ú¯ÛŒ local/remoteØ› sync Ù‚Ø§Ø¨Ù„ retryÂ» | Ù…Ø³ÛŒØ± Ú©ÙˆØ¯Ú© Ø´Ø¨Ú©Ù‡ Ù†Ø¯Ø§Ø±Ø¯ | **AMENDED:** Ù‡Ù…Ø§Ù‡Ù†Ú¯ÛŒ local/packagedØ› ØµÙØ± ÙˆØ§Ø¨Ø³ØªÚ¯ÛŒ Ø´Ø¨Ú©Ù‡ | â€” |
- | AGENTS.md Â§6 (Ø³Ø·Ø± Ø§Ù„Ù‡Ø§Ù… Duolingo) | Â«Ø§Ù„Ù‡Ø§Ù… Ù…Ø­Ø¯ÙˆØ¯ Ø¨Ù‡ Ø§ØµÙˆÙ„Â» | Â§6 ADR-0039 Ù…Ø¯Ù„ Ø³Ø§Ø®ØªØ§Ø±ÛŒ Duolingo Ø±Ø§ Ù…ØµÙˆØ¨ Ú©Ø±Ø¯Ù‡ | **ÙˆÛŒØ±Ø§ÛŒØ´ Ù†Ø´Ø¯** â€” Ø¨Ù‡ ledger UI ÙØ§Ø² Ù…ÙˆØ§Ø²ÛŒ N08R Ù…ÙˆÚ©ÙˆÙ„ (Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ø§Ø² ØªØµØ§Ø¯Ù… Ø¨Ø§ ÙØ§Ø² Ø¨ØµØ±ÛŒ ÙØ¹Ø§Ù„ Ù…Ø§Ù„Ú©) | DEFERRED-UI-LE…
- | START_HERE.md Â§7 | Â«Learning Truthâ€¦ Ø³Ø±ÙˆØ±ÛŒÂ» | Ø®Ù„Ø§Ù Â§2 | **AMENDED** (Û± Ø³Ø·Ø± Ø¨Ø§ Ø§Ø±Ø¬Ø§Ø¹ ADR-0039 + O1) | â€” |
- | START_HERE.md Â§6e (Ø¹Ù†Ø§ÙˆÛŒÙ† ÙØ§Ø²Ù‡Ø§ÛŒ Ø¨Ø³ØªÙ‡Ù” N06/N07) | Â«Server TruthÂ» Ø¯Ø± Ø¹Ù†ÙˆØ§Ù†â€ŒÙ‡Ø§ÛŒ ØªØ§Ø±ÛŒØ®ÛŒ | Ø±Ú©ÙˆØ±Ø¯ ÙØ§Ø²Ù‡Ø§ÛŒ Ø¨Ø³ØªÙ‡ | Ø­ÙØ¸ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† ØªØ§Ø±ÛŒØ® | HISTORICAL-KEEP |
- | README.md | Â«server-authoritativeÂ» | Ø®Ù„Ø§Ù Â§1 | **AMENDED** (Û± Ø³Ø·Ø±) | â€” |
- | ZCODE.md | flow harness | Ù†Ø¯Ø§Ø±Ø¯ | â€” | KEEP |
- | PACKAGE_BOUNDARIES_FA.md:26 | Â«repository Ù…Ø±Ø² local/remoteÂ» | Ø®Ù„Ø§Ù Ù…Ø¯Ù„ Ø¢ÙÙ„Ø§ÛŒÙ† | **AMENDED:** Ù‡Ù…Ø§Ù‡Ù†Ú¯ÛŒ Room/DataStore â†” Ù¾Ú©ÛŒØ¬ bundle | â€” |
- | skills/shomara-product-design:27 | Â«server-authoritativeÂ» | Ø®Ù„Ø§Ù Â§2 | **AMENDED** (local source authoritative) | â€” |

_منبع: `docs/architecture/ADR_RECONCILIATION_P2_FA.md`_

## Android build environment contract

**Android build environment contract**
- Ø§ÛŒÙ† Ø³Ù†Ø¯ runbook Ù‚Ø§Ø¨Ù„â€ŒØªÚ©Ø±Ø§Ø± `N02-07` Ø§Ø³Øª. static source checks Ø¬Ø§ÛŒ compile/lint/unit ÙˆØ§Ù‚Ø¹ÛŒ Ø±Ø§ Ù†Ù…ÛŒâ€ŒÚ¯ÛŒØ±Ù†Ø¯.
**Ø­Ø¯Ø§Ù‚Ù„ Ù…Ø­ÛŒØ·**
- | Ø¬Ø²Ø¡ | Ù…Ù‚Ø¯Ø§Ø± Ø§Ù„Ø²Ø§Ù…â€ŒØ´Ø¯Ù‡ | Ø±ÙˆØ´ ØªØ´Ø®ÛŒØµ |
- |---|---:|---|
- | JDK | 17 | `java -version` |
- | Android SDK root | `ANDROID_SDK_ROOT` ÛŒØ§ `ANDROID_HOME` | Ù…Ø³ÛŒØ± Ù…ÙˆØ¬ÙˆØ¯ |
- | Compile platform | `platforms;android-37.0` (Ù†Ø§Ù… Ù¾Ú©ÛŒØ¬ upstream) | `platforms/android-37/android.jar` ÛŒØ§ `platforms/android-37.<minor>/android.jar` Ø¨Ø§ signature Ù…Ø¹ØªØ¨Ø± ZIP/JAR |
- | Gradle | wrapper 9.6.0 Ø¨Ø§ checksum Ù¾ÛŒÙ†â€ŒØ´Ø¯Ù‡ | ÙÙ‚Ø· `apps/android/gradlew` |
- | Repository access | Google MavenØŒ Maven Central Ùˆ Gradle distribution | resolve ÙˆØ§Ù‚Ø¹ÛŒ dependency |
- > **P1 (2026-11-12):** Ø§Ù†Ø¯ÛŒØ³ Ø±Ø³Ù…ÛŒ SDK Ú¯ÙˆÚ¯Ù„ Ø¯ÛŒÚ¯Ø± Ù¾Ú©ÛŒØ¬ `platforms;android-37` Ø±Ø§ Ù…Ù†ØªØ´Ø± Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯ â€” Ù¾Ú©ÛŒØ¬â€ŒÙ‡Ø§ÛŒ API 37 Ø¨Ù‡â€ŒØµÙˆØ±Øª `android-37.0`/`37.1`/`37.2` Ù‡Ø³ØªÙ†Ø¯Ø› Ù‡Ù…ÛŒÙ† Ù†Ø§Ù‡Ù…Ø§Ù‡Ù†Ú¯ÛŒ Ù†Ø§Ù…ØŒ gate Ú©Ø§ØªÙ„ÛŒÙ† Ø¯Ø± CI Ø±Ø§ unreachable Ú©Ø±Ø¯Ù‡ Ø¨ÙˆØ¯ (Ø«Ø¨Øª…
- ØªÙ…Ø§Ù… buildÙ‡Ø§ÛŒ Native Ø§Ø² root Ùˆ Ø§Ø² harness ÙˆØ§Ø­Ø¯ Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯:
- npm run android:doctor
- Ø®Ø±ÙˆØ¬ÛŒ ÙÙ‚Ø· ÛŒÚ©ÛŒ Ø§Ø² `READY` ÛŒØ§ `BLOCKED_ENV` Ø§Ø³Øª. Ø¨Ø±Ø§ÛŒ Ø«Ø¨Øª Ú¯Ø²Ø§Ø±Ø´ ØªØ´Ø®ÛŒØµÛŒ Ø¨Ø¯ÙˆÙ† ØªØ¨Ø¯ÛŒÙ„ blocker Ø¨Ù‡ Ù…ÙˆÙÙ‚ÛŒØª:
- npm run android:doctor -- --allow-blocked
- Ú¯Ø²Ø§Ø±Ø´ Ù…Ø§Ø´ÛŒÙ†ÛŒ Ø¯Ø± `build-reports/android/doctor.json` ØªÙˆÙ„ÛŒØ¯ Ùˆ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† generated output Ø§Ø² Git Ø®Ø§Ø±Ø¬ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- `JAVA_HOME` Ø¯Ø± ØµÙˆØ±Øª ØªÙ†Ø¸ÛŒÙ…ØŒ Ù‡Ù… Ø¨Ø±Ø§ÛŒ Ø¨Ø±Ø±Ø³ÛŒ Java Ùˆ Ù‡Ù… Ø¨Ø±Ø§ÛŒ wrapper Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯. Ù…Ø³ÛŒØ± SDK ØµØ±ÛŒØ­ Ø¯Ø± environment Ø§ÙˆÙ„ÙˆÛŒØª Ø¯Ø§Ø±Ø¯Ø› Ø¯Ø± discovery Ø®ÙˆØ¯Ú©Ø§Ø±ØŒ Ù†ØµØ¨ Ø¯Ø§Ø±Ø§ÛŒ platform 37 Ø¨Ø± Ù¾ÙˆØ´Ù‡Ù” Ù†Ø§Ù‚Øµ Ø§ÙˆÙ„ÙˆÛŒØª Ù…ÛŒâ€ŒÚ¯ÛŒØ±Ø¯. harness Ù…Ø³ÛŒØ± SD…
**Ù†ØµØ¨ compile platform Ø¯Ø± CI**
- workflow Ù…Ø³ØªÙ‚ÛŒÙ…Ø§Ù‹ `sdkmanager` Ø±Ø³Ù…ÛŒ Ø±Ø§ Ø±ÙˆÛŒ stable channel ÙØ±Ù…Ø§Ù† Ù…ÛŒâ€ŒØ¯Ù‡Ø¯ Ùˆ package Ø¯Ù‚ÛŒÙ‚ `platforms;android-37.0` Ø±Ø§ Ù†ØµØ¨ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ (P1 2026-11-12Ø› Ù†Ø§Ù… Ù‚Ø¯ÛŒÙ…ÛŒ `platforms;android-37` Ø¯Ø± Ø§Ù†Ø¯ÛŒØ³ upstream ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯). NDK Ùˆ emulator Ø¯Ø± Ø§ÛŒÙ† gate Ù†ØµØ¨ Ù†Ù…Û…
**Ù¾ÛŒÙ† Ù¾Ù„ØªÙØ±Ù… â€” Package ID Ø¯Ù‚ÛŒÙ‚ Ùˆ ÛŒÚ©Ø³Ø§Ù† Ø¯Ø± Ù‡Ù…Ù‡Ù” Ù…Ø­ÛŒØ·â€ŒÙ‡Ø§**
- - **Ù¾ÛŒÙ† Ø«Ø§Ø¨Øª (ØªØ§Ø±ÛŒØ® Ù…Ø¨Ù†Ø§ 2026-11-13):** `platforms;android-37.0` â€” revision `2`ØŒ Ù†Ø§Ù… Ù†Ù…Ø§ÛŒØ´ÛŒ Â«Android SDK Platform 37.0Â».
- - **Ø§Ø«Ø¨Ø§Øª Ø²Ù†Ø¯Ù‡:** `sdkmanager --list --channel=0` Ø¨Ø§ cmdline-tools `22.0` Ø§Ø¬Ø±Ø§ Ø´Ø¯ (exit 0): Ø®Ø±ÙˆØ¬ÛŒ Ø´Ø§Ù…Ù„ `platforms;android-36 | 2` Ùˆ `platforms;android-37.0 | 2` Ø§Ø³Øª Ùˆ **Ù‡ÛŒÚ† `platforms;android-37` ÛŒØ§ 37.1/37.2 Ø¯Ø± stable channel ÙÙ‡Ø±Ø³Øª Ù†Ø´Ø¯Ù‡**. Ù¾ÛŒØ´â€ŒØªØ± fetch Ù…Ø³ØªÙ‚ÛŒÙ……
- - **Ù‡ÙˆÛŒØªØŒ Ù†Ù‡ Ù†Ø§Ù… Ù¾ÙˆØ´Ù‡:** preflight Ù¾Ú©ÛŒØ¬ Ø±Ø§ Ø§Ø² `package.xml` Ø¯Ø§Ø®Ù„ Ù¾ÙˆØ´Ù‡Ù” platform ØªØ£ÛŒÛŒØ¯ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ (`path="platforms;android-37.0"`) â€” Ú†ÛŒØ¯Ù…Ø§Ù† legacy Â«inconsistent locationÂ» (Ù¾Ú©ÛŒØ¬ 37.0 Ø¯Ø± Ù¾ÙˆØ´Ù‡Ù” `android-37`ØŒ Ù‡Ù…Ø§Ù† Ø­Ø§Ù„Øª Ù…ÙˆØ¬ÙˆØ¯ Ø±ÙˆÛŒ Ù…Ø§Ø´ÛŒÙ† Ù…Ø§Ù„Ú…
- - **compileSdk:** Ø¹Ø¯Ø¯ ØµØ­ÛŒØ­ `37` Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯ (AGP 9.4 Ø­Ø¯Ø§Ú©Ø«Ø± API 37)Ø› Ù†Ø³Ø®Ù‡Ù” minor Ù†ØµØ¨â€ŒØ´Ø¯Ù‡ Ù…Ø³ØªÙ‚Ù„ Ø§Ø² compileSdk Ø§Ø³Øª Ùˆ Ø¯Ø± ÛŒÚ© Ø«Ø§Ø¨Øª (`PINNED_PLATFORM_PACKAGE`) Ùˆ ÛŒÚ© env ÙˆØ§Ø±ÛŒØ¨Ù„ workflow Ù¾ÛŒÙ† Ø´Ø¯Ù‡ Ø§Ø³Øª.

_منبع: `docs/architecture/ANDROID_BUILD_ENVIRONMENT.md`_

## Android Native module graph â€” N07 offline content foundation Â· Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ P3 (ADR-0041, 2026-11-13)

**Android Native module graph â€” N07 offline content foundation Â· Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ P3 (ADR-0041, 2026-11-13)**
- â”œâ”€ core:common
- â”œâ”€ core:model
- â”œâ”€ core:designsystem
- â”œâ”€ core:network
- â”œâ”€ core:datastore
- â”œâ”€ core:database
- â”œâ”€ feature:onboarding
- â”‚    â”œâ”€ core:common
- â””â”€ core:datastore
- core:testing
- â””â”€ core:model
- No feature-to-feature imports exist; `:app` is the composition root (`AppGraph`, ADR-0041) and
- wires every module. These rules are machine-checked by `scripts/verify-android-module-graph.mjs`
- (part of `verify:static:all`): no `GlobalScope` in main sources; `Dispatchers.Main` banned outside
- `:app`; features must not import `okhttp3`/`androidx.datastore`/`core:database`/`:sync`; `:sync`
- importable only by `:app`/`:sync`; no feature-to-feature imports; feature imports of
- `core:network`/`core:datastore` are limited to a dated, shrink-only allowlist (6 entries).
**Scope ownership (ADR-0041)**
- | Scope | Owner | Lifecycle | Notes |

_منبع: `docs/architecture/ANDROID_MODULE_GRAPH.md`_

## Ø¨Ø±Ù†Ø§Ù…Ù‡Ù” ÛŒÚ©Ù¾Ø§Ø±Ú†Ù‡â€ŒØ³Ø§Ø²ÛŒ Design System Ø¯Ø± Ù…Ù‡Ø§Ø¬Ø±Øª Native

**Ø¨Ø±Ù†Ø§Ù…Ù‡Ù” ÛŒÚ©Ù¾Ø§Ø±Ú†Ù‡â€ŒØ³Ø§Ø²ÛŒ Design System Ø¯Ø± Ù…Ù‡Ø§Ø¬Ø±Øª Native**
**ÙˆØ¶Ø¹ÛŒØª Ú©Ø´Ùâ€ŒØ´Ø¯Ù‡**
- - token source ÙØ¹Ù„ÛŒ: `packages/design-system/src/tokens.json`.
- - UI V1: 22 Ù…ØµØ±Ùâ€ŒÚ©Ù†Ù†Ø¯Ù‡Ù” Ø®Ø§Ø±Ø¬ÛŒ Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡ Ùˆ Ù…Ø¬Ù…ÙˆØ¹Ù‡Ù” parity/golden ÙˆØ§Ø¨Ø³ØªÙ‡.
- - UI V2: 22 Ù…ØµØ±Ùâ€ŒÚ©Ù†Ù†Ø¯Ù‡Ù” Ø®Ø§Ø±Ø¬ÛŒ Ùˆ routeÙ‡Ø§ÛŒ ÙØ¹Ø§Ù„ Expo.
- - `ui/v2/Character.tsx` Ù‡Ù†ÙˆØ² Ø¨Ù‡ asset mapping Ø¯Ø± V1 ÙˆØ§Ø¨Ø³ØªÙ‡ Ø§Ø³ØªØ› Ø¨Ù†Ø§Ø¨Ø±Ø§ÛŒÙ† V1 Ø±Ø§ Ù†Ù…ÛŒâ€ŒØªÙˆØ§Ù† Ù¾ÙˆØ´Ù‡â€ŒØ§ÛŒ Ø­Ø°Ù Ú©Ø±Ø¯.
- - Ù‡ÛŒÚ† deep import Ø§Ø² workspaceÙ‡Ø§ÛŒ `@math/*` Ú©Ø´Ù Ù†Ø´Ø¯Ø› Ù…Ø±Ø² package ÙØ¹Ù„ÛŒ Ø³Ø§Ù„Ù… Ø§Ø³Øª.
- Ø§Ø¹Ø¯Ø§Ø¯ authoritative Ø¯Ø± `harness/dependency-map.json` Ùˆ audit ØªÚ©Ø±Ø§Ø±Ù¾Ø°ÛŒØ± Ø¯Ø± `tools/dependency-audit.mjs` Ù‚Ø±Ø§Ø± Ø¯Ø§Ø±Ù†Ø¯.
**Ù…Ù‚ØµØ¯ V3**
- ÙˆØ±ÙˆØ¯ÛŒ ØªØµÙ…ÛŒÙ… N03 Ø§Ø² `skills/shomara-design-system/SKILL.md` Ùˆ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ componentÙ‡Ø§ Ø§Ø² `design/playbook/COMPONENT_READINESS.md` Ù…ÛŒâ€ŒØ¢ÛŒØ¯. Ø§Ù†ØªØ®Ø§Ø¨â€ŒÙ‡Ø§ÛŒ Ø§Ù„Ù‡Ø§Ù…ÛŒ ÙÙ‚Ø· Ù¾Ø³ Ø§Ø² ÙÛŒÙ„ØªØ± `design/INSPIRATION_GUARDRAILS.md` Ù…Ø¹ØªØ¨Ø±Ù†Ø¯.
- 1. `packages/design-system/src/tokens.json` Ù…ÙˆÙ‚ØªØ§Ù‹ canonical Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯.
- 2. schema Ù…Ø³ØªÙ‚Ù„ Ø¨Ø±Ø§ÛŒ color/type/space/radius/elevation/motion/touch/illustration Ø³Ø§Ø®ØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- 3. codegen Ø¯Ùˆ Ø®Ø±ÙˆØ¬ÛŒ Ù…ÛŒâ€ŒØ¯Ù‡Ø¯:
- - TypeScript Ø¨Ø±Ø§ÛŒ Web/Expo legacyØ›
- - Kotlin Ø¨Ø±Ø§ÛŒ `apps/android/core/designsystem`.
- 4. ÙØ§ÛŒÙ„ generated Ø¯Ø³ØªÛŒ ÙˆÛŒØ±Ø§ÛŒØ´ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ùˆ drift verifier Ø¯Ø§Ø±Ø¯.
- 5. tokenÙ‡Ø§ semantic Ù‡Ø³ØªÙ†Ø¯Ø› Ù†Ø§Ù… V1/V2 ÙˆØ§Ø±Ø¯ API Ø¯Ø§Ø¦Ù…ÛŒ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
**ØªØ±ØªÛŒØ¨ Ù…Ù‡Ø§Ø¬Ø±Øª**
**Ù…ÙˆØ¬ A â€” ØªØ«Ø¨ÛŒØª Ù…Ù†Ø¨Ø¹**
- - schema Ùˆ validation Ø¨Ø±Ø§ÛŒ JSON Ù…ÙˆØ¬ÙˆØ¯Ø›
- - Ø«Ø¨Øª raw/missing/duplicate tokenÙ‡Ø§Ø›
- - Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± Ø¨ØµØ±ÛŒ route.
**Ù…ÙˆØ¬ B â€” Compose primitives**
- - `ShomaraTheme` Ùˆ component catalogØ›

_منبع: `docs/architecture/DESIGN_SYSTEM_MIGRATION_FA.md`_

## Ú¯Ø²Ø§Ø±Ø´ baseline ÙÙ†ÛŒ SHOMARA â€” Ø§Ø±Ø²ÛŒØ§Ø¨ÛŒ Ø§Ø¬Ø±Ø§ÛŒÛŒ Ù…Ù…ÛŒØ²ÛŒ Ø²ÛŒØ±Ø³Ø§Ø®Øª (Phase 0)

**Ú¯Ø²Ø§Ø±Ø´ baseline ÙÙ†ÛŒ SHOMARA â€” Ø§Ø±Ø²ÛŒØ§Ø¨ÛŒ Ø§Ø¬Ø±Ø§ÛŒÛŒ Ù…Ù…ÛŒØ²ÛŒ Ø²ÛŒØ±Ø³Ø§Ø®Øª (Phase 0)**
- - **ØªØ§Ø±ÛŒØ® Ø§Ø¬Ø±Ø§:** 2026-11-12 Â· **HEAD:** `aa2805c` (`merge: native UI/UX chain â€” page-02..page-17 audit ledgers + N08R Duolingo-level refinement`)
- - **Ø´Ø§Ø®Ù‡Ù” Ù…Ù…ÛŒØ²ÛŒ:** `audit/infrastructure-phase0` (Ø§ÛŒØ¬Ø§Ø¯Ø´Ø¯Ù‡ Ø§Ø² `main` ØªÙ…ÛŒØ²) Â· **Ø­Ø¬Ù… Ù…Ø®Ø²Ù† ÙØ¹Ø§Ù„:** ~Û±.Û´k ÙØ§ÛŒÙ„ (Ø¨Ø¯ÙˆÙ† .git/node_modules)
- - **Ø­Ø§Ú©Ù…ÛŒØª:** `harness: validate` = HARNESS_VALID (118 tasks, 12 phases)Ø› ÙˆØ¶Ø¹ÛŒØª ÙØ¹Ù„ÛŒ harness = N08R/N08R-10Ø› Ù…Ø£Ù…ÙˆØ±ÛŒØª Ø§ÛŒÙ† Ù†Ø´Ø³Øª Ø¨Ø± Ù…Ø¨Ù†Ø§ÛŒ Ø¯Ø³ØªÙˆØ± Ù…Ø³ØªÙ‚ÛŒÙ… Ù…Ø§Ù„Ú© (Ù…Ù…ÛŒØ²ÛŒ Ø²ÛŒØ±Ø³Ø§Ø®Øª) Ø§Ø¬Ø±Ø§ Ø´Ø¯ Ùˆ N08R-02/10 Ø±Ø§ Ø¬Ù„Ùˆ Ù†Ù…ÛŒâ€ŒØ²Ù†Ø¯.
**1. Ù…Ø­ÛŒØ· Ùˆ Ù†Ø³Ø®Ù‡â€ŒÙ‡Ø§**
- | Ù…Ø¤Ù„ÙÙ‡ | Ù…Ù‚Ø¯Ø§Ø± |
- | OS | Windows 10.0.22631 (win32) Â· Git Bash |
- | Node Ù…Ø­Ù„ÛŒ | v24.22.1 â€” **Ø®Ø§Ø±Ø¬ Ø§Ø² Ù¾ÛŒÙ† engines `<23`** (Ù‡Ø´Ø¯Ø§Ø±Ø› CI Ù¾ÛŒÙ† `.nvmrc` = 22.22.0 Ø±Ø§ Ù…ÛŒâ€ŒÚ¯ÛŒØ±Ø¯) |
- | JDK | 17 (Temurin 17.0.20.1+1) |
- | Android SDK | `D:\SDK` â€” Ù¾Ú©ÛŒØ¬ `android-37.0` Ø¯Ø± Ù¾ÙˆØ´Ù‡â€ŒØ§ÛŒ Ø¨Ù‡ Ù†Ø§Ù… `android-37` (Ù‡Ø´Ø¯Ø§Ø± sdkmanager: inconsistent locationØ› Ø±ÛŒØ´Ù‡Ù” ØªÙØ§ÙˆØª Ù…Ø­Ù„ÛŒ/CI Ø¯Ø± G-01) |
- | Gradle | wrapper 9.6.0 Ø¨Ø§ SHA-256 Ù¾ÛŒÙ†â€ŒØ´Ø¯Ù‡ Â· AGP 9.4.0 Â· Kotlin 2.4.10 |
- | UI | Jetpack Compose BOM 2026.08.00 Â· Û±Û¶ Ù…Ø§Ú˜ÙˆÙ„ Gradle Ø¯Ø± `apps/android` Â· 175 ÙØ§ÛŒÙ„ Kotlin (~23,870 Ø®Ø·) |
- | TypeScript | 9 workspace Â· 73 ÙØ§ÛŒÙ„ vitest / 564 ØªØ³Øª Â· 90 verifier static |
**2. ÙØ±Ù…Ø§Ù†â€ŒÙ‡Ø§ÛŒ baseline â€” exit code Ø¯Ù‚ÛŒÙ‚ (Ø§Ø¬Ø±Ø§ÛŒ 2026-11-12)**
- | ÙØ±Ù…Ø§Ù† | exit | Ù†ØªÛŒØ¬Ù‡ |
- |---|---:|---|
- | `node tools/harness.mjs validate` | 0 | HARNESS_VALID (118 tasks, 12 phases) |
- | `node tools/harness.mjs status` / `next` / `resume` | 0 | current: N08R / N08R-10Ø› next â†’ N08R-02 |
- | `npm run build:packages` | 0 | PASS |
- | `npm run typecheck:all` | 0 | Ù‡Ø± Û¹ workspace PASS |
- | `npx vitest run` | 0 | 73 ÙØ§ÛŒÙ„ / 564 ØªØ³Øª PASS (ÙØ§ÛŒÙ„ Û·Û´Ù… ÛŒØªÛŒÙ… â€” G-04) |
- | `npm run verify:static:all` | 0 | STATIC_ALL: PASS (90/90) Ø´Ø§Ù…Ù„ Ù‡Ø± Û· gate Ù…Ø±ÙˆØ±Ú¯Ø±ÛŒ |
- | `npm run verify:content-library` | 0 | PASS (10 protected originals, 25 stations, 15 patterns, 232 draft audio rows, 18 audited issues) |
- | `npm run verify:migrations` | 0 | PASS (74 migrations, latest=0074_audio_cms_tables.sql) |

_منبع: `docs/architecture/INFRASTRUCTURE_BASELINE_REPORT_FA.md`_

## Ù†Ù‚Ø´Ù‡Ù” Ø±Ø§Ù‡ Ø§Ø¬Ø±Ø§ÛŒ Ø²ÛŒØ±Ø³Ø§Ø®Øª SHOMARA â€” Phase 0 ØªØ§ 6 (ÙˆØ§Ø¨Ø³ØªÚ¯ÛŒâ€ŒØ¢Ú¯Ø§Ù‡)

**Ù†Ù‚Ø´Ù‡Ù” Ø±Ø§Ù‡ Ø§Ø¬Ø±Ø§ÛŒ Ø²ÛŒØ±Ø³Ø§Ø®Øª SHOMARA â€” Phase 0 ØªØ§ 6 (ÙˆØ§Ø¨Ø³ØªÚ¯ÛŒâ€ŒØ¢Ú¯Ø§Ù‡)**
- - **ØªØ§Ø±ÛŒØ®:** 2026-11-12 Â· **Ù…Ø¨Ù†Ø§:** commit `aa2805c` Â· **ÙˆØ¶Ø¹ÛŒØª:** Ù†Ù‚Ø´Ù‡Ù” Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ÛŒØ› Ù‡Ø± ÙØ§Ø² ÙÙ‚Ø· Ø¨Ø§ gate ÙØ§Ø² Ù‚Ø¨Ù„ Ø´Ø±ÙˆØ¹ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- - **Ù‡Ù…Ø§Ù‡Ù†Ú¯ÛŒ Ø¨Ø§ ADR-0039 Â§7:** Ù†Ù‚Ø´Ù‡Ù” ÙØ§Ø²Ù‡Ø§ Ù‡Ù…Ø§Ù† ØªØ±ØªÛŒØ¨ ADR-0039 Ø§Ø³Øª Ø¨Ø§ ØªÙÚ©ÛŒÚ© Ù…Ù‡Ù†Ø¯Ø³ÛŒ Ø±ÛŒØ²ØªØ±. Ù‡ÛŒÚ† ÙØ§Ø² Ø¨Ø¯ÙˆÙ† gate Ù‚Ø¨Ù„ÛŒ Ùˆ ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§ÛŒ Ù…Ø³Ø¯ÙˆØ¯Ú©Ù†Ù†Ø¯Ù‡Ù” Ø®ÙˆØ¯Ø´ Ø´Ø±ÙˆØ¹ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- - **Ù‚ÙˆØ§Ø¹Ø¯ Ø«Ø§Ø¨Øª:** Ø´Ø§Ø®Ù‡Ù” Ù…Ø³ØªÙ‚Ù„ Ù‡Ø± ÙØ§Ø²Ø› Ú©Ø§Ø± Ù…Ø³ØªÙ‚ÛŒÙ… Ø±ÙˆÛŒ main Ù…Ù…Ù†ÙˆØ¹Ø› PASS ÙÙ‚Ø· Ø¨Ø§ ÙØ±Ù…Ø§Ù†+exit code+evidenceØ› Ø­Ø°Ù ÙÙ‚Ø· Ø¨Ø§ consumer-proofØ› Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ Ø§Ø³Ù†Ø§Ø¯ canonical ÙÙ‚Ø· ÛŒÚ© Ù†Ø³Ø®Ù‡Ù” ÛŒÚ©ØªØ§.
**Phase 0 â€” Ø¹Ù…ÙˆÙ…ÛŒâ€ŒØ³Ø§Ø²ÛŒ Ù…Ù…ÛŒØ²ÛŒØŒ Ø±ÙØ¹ P0 Ù…Ú©Ø§Ù†ÛŒÚ©ÛŒ Ùˆ Ù‡Ù…â€ŒØ±Ø§Ø³ØªØ§Ø³Ø§Ø²ÛŒ Ø­Ø§Ú©Ù…ÛŒØª (ÙÙˆØ±ÛŒØ› Ø¨Ø¯ÙˆÙ† ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú©)**
- | # | Ú©Ø§Ø± | Ø®Ø±ÙˆØ¬ÛŒ/Ú¯ÛŒØª |
- | P0-1 | Ø«Ø¨Øª Ûµ Ø³Ù†Ø¯ Ù…Ù…ÛŒØ²ÛŒ Ø§ÛŒÙ† Ù…Ø¬Ù…ÙˆØ¹Ù‡ Ø±ÙˆÛŒ Ø´Ø§Ø®Ù‡Ù” audit Ùˆ Ø¨Ø§Ø²Ø¨ÛŒÙ†ÛŒ Ù…Ø§Ù„Ú© | Ù‡Ù…ÛŒÙ† Ø§Ø³Ù†Ø§Ø¯Ø› Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± Ú©Ø¯ |
- | P0-2 | Ø±ÙØ¹ G-01: Ù†ØµØ¨ `platforms;android-37.0` Ø¯Ø± `android-native.yml` + Ú¯Ø³ØªØ±Ø´ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ preflight Ø¨Ù‡ `android-37/37.x` (`verify-android-environment.mjs`) + Ù‡Ù…â€ŒØ±Ø§Ø³ØªØ§Ø³Ø§Ø²ÛŒ ADR-0036/`ANDROID_BUILD_ENVIRONMENT.md` | ÛŒÚ© Ø§Ø¬Ø±Ø§ÛŒ CI ØªØ§ `android:gate` PASSØ› preflight Ù…Ø­Ù„ÛŒ READY |
- | P0-3 | Ø±ÙØ¹ G-02: ØªÙÚ©ÛŒÚ© job required Â«static-coreÂ» Ø§Ø² job Ø§Ø·Ù„Ø§Ø¹Ø§ØªÛŒ Ù…Ø±ÙˆØ±Ú¯Ø±ÛŒ Ø¯Ø± `ci.yml`Ø› Ø­Ø°Ù continue-on-error Ø§Ø² Ø¨Ø®Ø´ required | Ø´Ú©Ø³Øª Ø¹Ù…Ø¯ÛŒ verifier ØºÛŒØ±Ù…Ø±ÙˆØ±Ú¯Ø±ÛŒ â†’ CI Ù‚Ø±Ù…Ø² (negative control) |
- | P0-4 | G-03: upload artifact Ú¯Ø²Ø§Ø±Ø´â€ŒÙ‡Ø§ÛŒ gate/lint/testØ› G-04: repair ØªØ³Øª ÛŒØªÛŒÙ… vitest + verifier Ø´Ù…Ø§Ø±Ø´ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§Ø› G-05: dependabot + ÛŒÚ© job audit Ø²Ù…Ø§Ù†â€ŒØ¨Ù†Ø¯ÛŒâ€ŒØ´Ø¯Ù‡ | CI green Ø¨Ø§ artifact |
- | P0-5 | Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ú¯Ø§Ù… Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ ledger (G-08): ÙÙ‡Ø±Ø³Øª Ø¯Ù‚ÛŒÙ‚ Ø±Ø¯ÛŒÙâ€ŒÙ‡Ø§ÛŒ server-authoritative Ø¯Ø± AGENTS/START_HERE/PACKAGE_BOUNDARIES/ADR-0003/roadmap Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù¾ÛŒÙˆØ³Øª Ø§ÛŒÙ† Ø³Ù†Ø¯ â€” Ø§Ø¬Ø±Ø§ÛŒ Ù…ØªÙ† Ù¾Ø³ Ø§Ø² ØªØµÙ…ÛŒÙ… O6/O13 ØªØ§ Ù…ØªÙ† Ø¬Ø¯ÛŒØ¯ ÛŒÚ©â€ŒØ¨Ø§Ø±Ù‡ Ùˆ Ø…
**DoD ÙØ§Ø² 0:** CI Ø¯Ùˆ workflow Ø¨Ø§ gate required ÙˆØ§Ù‚Ø¹Ø§Ù‹ greenØ› Ø§Ø³Ù†Ø§Ø¯ Ù…Ù…ÛŒØ²ÛŒ ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú©Ø› Ù‡ÛŒÚ† ØªØºÛŒÛŒØ± Ù…Ø¹Ù…Ø§Ø±ÛŒ Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ù‡.
**Phase 1 â€” Ø§Ø³Ú©Ù„Øª Ø¢ÙÙ„Ø§ÛŒÙ† (ST07 pilot) â€” Ù…Ø³Ø¯ÙˆØ¯Ú©Ù†Ù†Ø¯Ù‡: O1ØŒ O2ØŒ O4ØŒ CONTENT-014ØŒ (O7 Ø¨Ø±Ø§ÛŒ Ø¨ÙˆØ¯Ø¬Ù‡Ù” Ø­Ø¬Ù…)**
- | # | Ú©Ø§Ø± | Ú¯ÛŒØª/ØªØ³Øª |
- | P1-0 | Ú¯Ø§Ù… Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ ledger (G-08/P0-5) â€” Ù‡Ù…â€ŒØ²Ù…Ø§Ù† Ø¨Ø§ Ø´Ø±ÙˆØ¹ P1 | ÛŒÚ© commitØ› verifierÙ‡Ø§ÛŒ static Ø³Ø¨Ø² |
- | P1-1 | `:core:contentpackage` â€” ÙØ±Ù…Øª O2: manifest schema Ù†Ø³Ø®Ù‡â€ŒØ¯Ø§Ø±ØŒ Ø§Ù…Ø¶Ø§ÛŒ Ù…Ù†ÙØµÙ„ + Ú©Ù„ÛŒØ¯ Ù¾ÛŒÙ†â€ŒØ´Ø¯Ù‡ + Ú†Ø±Ø®Ø´ØŒ verify Ú©Ø§Ù…Ù„ØŒ ÙØ¹Ø§Ù„â€ŒØ³Ø§Ø²ÛŒ Ø§ØªÙ…ÛŒÚ© ÙØ§ÛŒÙ„â€ŒØ³ÛŒØ³ØªÙ…ØŒ rollback Ù¾Ø§ÛŒØ¯Ø§Ø±ØŒ corruption/missing-asset fail-closedØŒ Ø¨ÙˆØ¯Ø¬Ù‡Ù” Ø­Ø¬Ù… O7 | negative control…
- | P1-2 | `:core:database` Room ÙˆØ§Ù‚Ø¹ÛŒ `[O4]`: Ø§Ø³Ú©ÛŒÙ…Ø§ÛŒ Ø³Ù†Ø¯ Ù‡Ø¯Ù Â§3ØŒ migration Ù¾Ø§ÛŒØ¯Ø§Ø±ØŒ FK/indexØŒ transactionØŒ downgrade/corrupt fail-closed Ø±ÙˆÛŒ Ø¯ÛŒØ³Ú© | ØªØ³Øª Robolectric/instrumented Ø±ÙˆÛŒ SQLite ÙˆØ§Ù‚Ø¹ÛŒØ› Ø±Ø¯ÛŒÙâ€ŒÙ‡Ø§ Ù¾Ø³ Ø§Ø² upgrade Ø­ÙØ¸ |
- | P1-3 | `:core:learning` Ù…ÙˆØªÙˆØ± Ù…Ø­Ù„ÛŒ `[O1]` + Ù‚ÙˆØ§Ø¹Ø¯ Ù†Ø³Ø®Ù‡â€ŒØ¯Ø§Ø± (CONTENT-014/CALIBRATION_V1): Ø§Ø±Ø²ÛŒØ§Ø¨ per-templateØŒ hint/attempt policyØŒ determinism | ØªØ³Øª Ù‚Ø·Ø¹ÛŒ determinismØ› snapshot Â«Ù¾Ø±ÙˆØ¬Ú©Ø´Ù† Ø¨Ø¯ÙˆÙ† answerÂ» Ø¨Ø±Ø§ÛŒ Ù‡Ø± adapterØ› T13/T01 evaluation Ù…Ø³ÛŒØ± Ø§Ø«Ø¨Ø§Øª per-t…
- | P1-4 | cutover M1/M2/M3: Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ†ÛŒ gateway stub Ø¨Ø§ Ø§Ø±Ø²ÛŒØ§Ø¨ Ù…Ø­Ù„ÛŒ `[O3]`Ø› path stateFor Ø§Ø² Ù¾ÛŒØ´Ø±ÙØª RoomØ› Ø­Ø°Ù wiring Ø¯Ø³ØªÛŒ ST07 Ø§Ø² debug Ø¨Ù‡ Ù¾Ú©ÛŒØ¬ ÙˆØ§Ù‚Ø¹ÛŒ | journey ØªØ³Øª ST07 Ø¢ÙÙ„Ø§ÛŒÙ† Ø§Ø² teach ØªØ§ result Ø¨Ø§ Ù‚Ø·Ø¹ Ù…ÛŒØ§Ù†Ù‡ Ùˆ resume |
- | P1-5 | gate ÙØ§Ø²: `android:gate` + ØªØ³Øªâ€ŒÙ‡Ø§ÛŒ Ø¬Ø¯ÛŒØ¯ + ÛŒÚ© Ø§Ø¬Ø±Ø§ÛŒ Ø±ÙˆÛŒ Ø¯Ø³ØªÚ¯Ø§Ù‡/Ø§Ù…ÙˆÙ„Ø§ØªÙˆØ± Ù…ÙˆØ¬ÙˆØ¯ (Ø¨Ø¯ÙˆÙ† Ø³Ø§Ø®Øª emulator Ø¬Ø¯ÛŒØ¯) + Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ START_HERE/WORKLOG Ø¨Ø§ evidence | DoD: ST07 Ú©Ø§Ù…Ù„Ø§Ù‹ Ø¢ÙÙ„Ø§ÛŒÙ† Ù‚Ø§Ø¨Ù„â€ŒØ§Ø¬Ø±Ø§ÛŒ Ø±ÙˆÛŒ build debugØ› release Ù‡Ù†Ùˆ…
**Phase 2 â€” Ø­Ø°Ù Ø³Ø±ÙˆØ± Ùˆ Ù‡ÙˆÛŒØª Ù…Ø­Ù„ÛŒ â€” Ù…Ø³Ø¯ÙˆØ¯Ú©Ù†Ù†Ø¯Ù‡: Phase 1 + O5**
- - P2-1 Ø­Ø°Ù Ø²Ù†Ø¬ÛŒØ±Ù‡Ù” OTP/token/session/debug OTP + probe Ø³Ø±ÙˆØ± launch (`ShomaraOtpApi`, `ShomaraRealOtpProvider`, `ShomaraDebugOtpProvider`, `PreferencesTokenStore`)Ø› Ú©ÙˆØªØ§Ù‡â€ŒØ´Ø¯Ù† onboarding Ø¨Ù‡ Ù…Ø¯Ù„ Ù…Ø­Ù„ÛŒ (Ø®Ø§Ù†ÙˆØ§Ø¯Ù‡Ù” 03 Ø­Ø°Ù Ø¯Ø± UI Ø·Ø¨Ù‚ ADR-0039 Â§7).
- - P2-2 profile Ù…Ø­Ù„ÛŒ + Ú†Ù†Ø¯/ØªÚ© Ù¾Ø±ÙˆÙØ§ÛŒÙ„ `[O5]` + Parent PIN Ù‡Ø´â€ŒØ´Ø¯Ù‡ fail-closed + ParentGate Ø¨Ø§ verifier Ù…Ø­Ù„ÛŒ.
- - P2-3 Ø­Ø°Ù `:sync` Ùˆ transport Ø¢Ù†â€ŒÙ„Ø§ÛŒÙ† + `ShomaraRuntimeConfig` + `LessonGateway` HTTP `[O3-b]`Ø› Ø¨Ø§Ø²Ù†Ø´Ø³ØªÙ‡Ù” `:core:network` (ÛŒØ§ Ù†Ú¯Ø§Ù‡â€ŒØ¯Ø§Ø´Øª ØµÙØ±-Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø¨Ø§ ADR).

_منبع: `docs/architecture/INFRASTRUCTURE_EXECUTION_ROADMAP_FA.md`_

## Ø«Ø¨Øª Ø´Ú©Ø§Ùâ€ŒÙ‡Ø§ÛŒ Ø²ÛŒØ±Ø³Ø§Ø®Øª SHOMARA (Phase 0 â€” Ù…Ù…ÛŒØ²ÛŒ ÙÙ†ÛŒ)

**Ø«Ø¨Øª Ø´Ú©Ø§Ùâ€ŒÙ‡Ø§ÛŒ Ø²ÛŒØ±Ø³Ø§Ø®Øª SHOMARA (Phase 0 â€” Ù…Ù…ÛŒØ²ÛŒ ÙÙ†ÛŒ)**
- - **ØªØ§Ø±ÛŒØ®:** 2026-11-12 Â· **Ù…Ø¨Ù†Ø§:** commit `aa2805c` Ø±ÙˆÛŒ Ø´Ø§Ø®Ù‡Ù” `audit/infrastructure-phase0` (Ø§Ø² `main`)
- - **Ù†ÙˆØ¹ Ù…Ø£Ù…ÙˆØ±ÛŒØª:** Ù…Ù…ÛŒØ²ÛŒ Ø²ÛŒØ±Ø³Ø§Ø®Øª ØºÛŒØ±-Ø¨ØµØ±ÛŒ Ùˆ Ù†Ù‚Ø´Ù‡Ù” Ø±Ø§Ù‡ Ø§Ø¬Ø±Ø§Ø› Ø¨Ø¯ÙˆÙ† Ø¨Ø§Ø²Ø·Ø±Ø§Ø­ÛŒ UI
- - **Ù…Ø±Ø¬Ø¹ ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú©:** `docs/adr/ADR-0039-fully-offline-content-and-duolingo-copy-ui.md` (Ù…Ø­ØµÙˆÙ„ Ú©Ø§Ù…Ù„Ø§Ù‹ Ø¢ÙÙ„Ø§ÛŒÙ†Ø› Ù¾Ú©ÛŒØ¬ Ù…Ø­ØªÙˆØ§ÛŒ bundle + Ø§Ø±Ø²ÛŒØ§Ø¨ Ù…Ø­Ù„ÛŒ)
- - **Ù‚Ø§Ø¹Ø¯Ù‡:** Ù‡ÛŒÚ† Ø´Ú©Ø§ÙÛŒ Ø¨Ø¯ÙˆÙ† Ø´ÙˆØ§Ù‡Ø¯ `file:line` Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡Ø› Ù‡ÛŒÚ† ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú©ÛŒ Ø¬Ø¹Ù„ Ù†Ø´Ø¯Ù‡Ø› ÙˆØ¶Ø¹ÛŒØªâ€ŒÙ‡Ø§ ÙÙ‚Ø· Ø¨Ø§ evidence Ø¹ÙˆØ¶ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.
- - **Ù‡Ù…Ø±Ø§Ù‡Ø§Ù† Ø§ÛŒÙ† Ø³Ù†Ø¯:** `INFRASTRUCTURE_TARGET_ARCHITECTURE_FA.md`ØŒ `INFRASTRUCTURE_EXECUTION_ROADMAP_FA.md`ØŒ `INFRASTRUCTURE_OWNER_DECISIONS_FA.md`ØŒ `INFRASTRUCTURE_BASELINE_REPORT_FA.md`
- Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ Ø´Ø¯Øª:
- - **P0** = Ù…Ø³Ø¯ÙˆØ¯Ú©Ù†Ù†Ø¯Ù‡Ù” ÙÙˆØ±ÛŒØ› Ø¨Ø¯ÙˆÙ† Ø±ÙØ¹Ø´ Ù‡ÛŒÚ† gate Ù‚Ø§Ø¨Ù„â€ŒØ§Ø¹ØªÙ…Ø§Ø¯ ÛŒØ§ Ù…Ø­ØµÙˆÙ„ Ù‚Ø§Ø¨Ù„â€ŒØ§Ø¬Ø±Ø§ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯.
- - **P1** = Ø±ÛŒØ³Ú© Ù…Ø¹Ù…Ø§Ø±ÛŒ/Ø§Ù…Ù†ÛŒØªÛŒ/Ø­Ø§Ú©Ù…ÛŒØªÛŒ Ø¬Ø¯ÛŒØ› Ù‚Ø¨Ù„ Ø§Ø² Phase 1 Ø¨Ø§ÛŒØ¯ Ù…Ø³ÛŒØ±Ø´ Ù…Ø´Ø®Øµ Ø´ÙˆØ¯.
- - **P2** = Ø´Ú©Ø§Ù ÙˆØ§Ù‚Ø¹ÛŒ Ø¨Ø§ Ø¨Ø±Ù†Ø§Ù…Ù‡Ù” Ø§Ø¬Ø±Ø§ÛŒ Ù…Ø´Ø®Øµ Ø¯Ø± ÙØ§Ø²Ù‡Ø§ÛŒ Ø¨Ø¹Ø¯ÛŒ.
- - **P3** = Ø¨Ù‡Ø¨ÙˆØ¯ Ú©ÛŒÙÛŒ/Ù¾Ø§Ú©Ø³Ø§Ø²ÛŒ.
**A. CI/CD Ùˆ Release Engineering**
**G-01 Â· P0 Â· gate Ú©Ø§ØªÙ„ÛŒÙ† Ø¯Ø± GitHub Actions Ù‡Ø±Ú¯Ø² Ø§Ø¬Ø±Ø§ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯ (Ù†ØµØ¨ SDK Ù†Ø§Ù…ÙˆØ¬ÙˆØ¯)**
- - **Ø´ÙˆØ§Ù‡Ø¯:** `.github/workflows/android-native.yml:49-56` Ú¯Ø§Ù… Â«Install compile SDK 37Â» ÙØ±Ù…Ø§Ù† `sdkmanager --channel=0 "platforms;android-37"` Ø±Ø§ Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Ø§Ù†Ø¯ÛŒØ³ Ø±Ø³Ù…ÛŒ SDK Ú¯ÙˆÚ¯Ù„ (`repository2-3.xml`) Ù¾Ú©ÛŒØ¬ÛŒ Ø¨Ù‡ Ù†Ø§Ù… `platforms;android-37` Ù†Ø¯Ø§Ø±Ø¯Ø› ÙÙ‚Ø· `android-37.0`ØŒ…
- - **Ú†Ø±Ø§ Ù…Ø­Ù„ÛŒ Ø³Ø¨Ø² Ø§Ø³Øª:** Ø±ÙˆÛŒ Ù…Ø§Ø´ÛŒÙ† Ù…Ø§Ù„Ú© `D:\SDK\platforms\android-37\android.jar` ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø±Ø¯ (Ù¾Ú©ÛŒØ¬ `android-37.0` Ø¯Ø± Ù¾ÙˆØ´Ù‡â€ŒØ§ÛŒ Ø¨Ù‡ Ù†Ø§Ù… `android-37`Ø› sdkmanager Ù‡Ø´Ø¯Ø§Ø± Â«inconsistent locationÂ» Ù…ÛŒâ€ŒØ¯Ù‡Ø¯) â€” Ù¾Ø³ preflight Ù…Ø­Ù„ÛŒ Ù¾Ø§Ø³ Ù…ÛŒâ€ŒØ´ÙˆØ¯ ÙˆÙ„ÛŒ CI Ù…
- - **Ù†Ø§Ø³Ø§Ø²Ú¯Ø§Ø±ÛŒ Ù†Ø±Ù…â€ŒØ§ÙØ²Ø§Ø±ÛŒ ruled-out:** AGP 9.4.0 Ø­Ø¯Ø§Ú©Ø«Ø± API 37 Ø±Ø§ Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ØŒ Gradle Ø­Ø¯Ø§Ù‚Ù„ 9.6.0 Ùˆ JDK Ø­Ø¯Ø§Ù‚Ù„ 17 â€” Ù‡Ø± Ø³Ù‡ Ø¨Ø§ Ù¾ÛŒÙ†â€ŒÙ‡Ø§ÛŒ repo (`apps/android/gradle/libs.versions.toml:5-7`ØŒ wrapper 9.6.0ØŒ JDK 17 Ø¯Ø± workflow) Ù…Ù†Ø·Ø¨Ù‚â€ŒØ§Ù†Ø¯. Ù…Ø…
- - **Ø§Ø«Ø± Ú©Ø§Ø±Ø¨Ø±/Ù…Ø­ØµÙˆÙ„:** Ù‡ÛŒÚ† Ø§Ø¬Ø±Ø§ÛŒ CI Ø§Ø² gate Ú©Ø§ØªÙ„ÛŒÙ† (ØªØ³Øª/lint/compile) Ø¹Ø¨ÙˆØ± Ù†Ú©Ø±Ø¯Ù‡ Ø§Ø³ØªØ› Â«Ø³Ø¨Ø² Ø¨ÙˆØ¯Ù†Â» Android CI Ø§Ø«Ø¨Ø§Øªâ€ŒÙ†Ø§Ù¾Ø°ÛŒØ± Ø§Ø³ØªØ› PRÙ‡Ø§ÛŒ Android Ø¨Ø¯ÙˆÙ† gate ÙˆØ§Ù‚Ø¹ÛŒ merge Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯ (ÛŒØ§ Ù‡Ù…ÛŒØ´Ù‡ Ù‚Ø±Ù…Ø²Ù†Ø¯).
- - **Ø±Ø§Ù‡â€ŒØ­Ù„ (Ù…Ú©Ø§Ù†ÛŒÚ©ÛŒØŒ Ø¨Ø¯ÙˆÙ† ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú©):** Ø¯Ø± workflow Ù†ØµØ¨ `platforms;android-37.0` (ÛŒØ§ Ø¬Ø¯ÛŒØ¯ØªØ±ÛŒÙ† 37.x Ù¾Ø§ÛŒØ¯Ø§Ø±)Ø› Ù‡Ù…Ø²Ù…Ø§Ù† Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ preflight Ø¯Ø± `scripts/verify-android-environment.mjs:60,70` Ø§Ø² `platforms/android-37/android.jar` Ø¨Ù‡ Ù¾Ø°ÛŒØ±Ø´ `android-37` ÛŒ…
- - **ÙˆØ§Ø¨Ø³ØªÚ¯ÛŒ:** G-12 (upload artifact Ø¨Ø±Ø§ÛŒ evidence). **Ù…Ø¹ÛŒØ§Ø± Ù¾Ø°ÛŒØ±Ø´:** ÛŒÚ© Ø§Ø¬Ø±Ø§ÛŒ GitHub Actions Ú©Ù‡ ØªØ§ `android:gate` Ø¨Ø±ÙˆØ¯ Ùˆ PASS Ø«Ø¨Øª Ú©Ù†Ø¯Ø› preflight Ù…Ø­Ù„ÛŒ Ùˆ CI Ù‡Ø± Ø¯Ùˆ READY.
- - **ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú© Ù„Ø§Ø²Ù…:** Ø®ÛŒØ±. **ÙˆØ¶Ø¹ÛŒØª:** OPEN (Ø¯Ø³ØªÙˆØ± ØµØ±ÛŒØ­ Â§10 Ù…Ø£Ù…ÙˆØ±ÛŒØª: diagnose & fix).
**G-02 Â· P1 Â· Ø´Ú©Ø³Øª static gate Ø¯Ø± CI Ø¨Ù‡ Â«Ø³Ø¨Ø²Â» ØªØ¨Ø¯ÛŒÙ„ Ù…ÛŒâ€ŒØ´ÙˆØ¯**
- - **Ø´ÙˆØ§Ù‡Ø¯:** `.github/workflows/ci.yml:27` Ø±ÙˆÛŒ Ú©Ù„ job `visual-and-static` â€`continue-on-error: true` Ø§Ø³Øª. Ø§ÛŒÙ† job Ø¹Ù„Ø§ÙˆÙ‡ Ø¨Ø± Ù…Ø±ÙˆØ±Ú¯Ø±ÛŒâ€ŒÙ‡Ø§ `npm run verify:static:all` (ci.yml:37-38) Ø±Ø§ Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ú©Ù‡ **90 verifier** Ø§Ø² Ø¬Ù…Ù„Ù‡ Ù…ÙˆØ§Ø±Ø¯ Ø§Ù…Ù†ÛŒØªÛŒ Ø±Ø§ Ù…ÛŒâ€ŒØ¯ÙˆØ¯: `…
- - **Ø§Ø«Ø±:** Ø´Ú©Ø³Øª Ù‡Ø± verifier Ø§Ù…Ù†ÛŒØªÛŒ/Ù…Ø¹Ù…Ø§Ø±ÛŒ Ø¯Ø± check-run Ø³Ø¨Ø² Ø¯ÛŒØ¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ù…Ø±Ø² Â«requiredÂ» ÙÙ‚Ø· job `core` (build/typecheck/vitest) Ø§Ø³Øª.
- - **Ø±Ø§Ù‡â€ŒØ­Ù„:** ØªÙÚ©ÛŒÚ©: ÛŒÚ© job required Â«static-coreÂ» Ø¨Ø±Ø§ÛŒ verifierÙ‡Ø§ÛŒ ØºÛŒØ±Ù…Ø±ÙˆØ±Ú¯Ø±ÛŒØŒ Ùˆ ÙÙ‚Ø· gateÙ‡Ø§ÛŒ Chromium/parity Ø¯Ø± job Ø§Ø·Ù„Ø§Ø¹Ø§ØªÛŒ Ø¨Ù…Ø§Ù†Ù†Ø¯ ØªØ§ ÙˆÙ‚ØªÛŒ runner Ø³Ø¨Ø² Ø´ÙˆØ¯Ø› Ø³Ù¾Ø³ Ø­Ø°Ù `continue-on-error`.

_منبع: `docs/architecture/INFRASTRUCTURE_GAP_REGISTER_FA.md`_

## Owner Decision Register â€” SHOMARA (v2ØŒ Ø²Ù†Ø¯Ù‡ â€” ÙØ§Ø² P2)

**Owner Decision Register â€” SHOMARA (v2ØŒ Ø²Ù†Ø¯Ù‡ â€” ÙØ§Ø² P2)**
- - **ØªØ§Ø±ÛŒØ® Ø¨Ø§Ø²Ù†Ú¯Ø±ÛŒ:** 2026-11-13 Â· **Ø´Ø§Ø®Ù‡:** `infra/p2-adr-reconciliation`
- - **Ù…Ù†Ø¨Ø¹ ØªØµÙ…ÛŒÙ… Ø­Ø§Ú©Ù…:** ADR-0039 (Ù…Ø­ØµÙˆÙ„ Ú©ÙˆØ¯Ú© Ú©Ø§Ù…Ù„Ø§Ù‹ Ø¢ÙÙ„Ø§ÛŒÙ†). **Ù‡Ù…Ø±Ø§Ù‡:** `ADR_RECONCILIATION_P2_FA.md`.
- - **Ø­Ú©Ù…Ø±Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª:** `OPEN` = Ù…Ù†ØªØ¸Ø± Ø´Ø±ÙˆØ¹ ØªØµÙ…ÛŒÙ… Â· `PROPOSED` = Ø¨Ø³ØªÙ‡Ù” Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ Ù…Ù‡Ù†Ø¯Ø³ÛŒ Ø«Ø¨Øª Ø´Ø¯Ù‡ Ùˆ Ù…Ù†ØªØ¸Ø± Ù…Ø§Ù„Ú© Â· `APPROVED/REJECTED` ÙÙ‚Ø· Ø¨Ø§ Ø¨ÛŒØ§Ù†ÛŒÙ‡Ù” ØµØ±ÛŒØ­ Ù…Ø§Ù„Ú© + ØªØ§Ø±ÛŒØ® + evidence (ADR ÛŒØ§ START_HERE) ØªØºÛŒÛŒØ± Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Ù‡ÛŒÚ† Ø¹Ø§Ù…Ù„/…
- - **Ø±ÛŒØ³Ú©â€ŒÙ‡Ø§ Ø¯Ø± Ù‡Ø± Ø¨Ù„ÙˆÚ©:** ðŸ”’ Ø§Ù…Ù†ÛŒØª Â· ðŸ›  Ù†Ú¯Ù‡Ø¯Ø§Ø±ÛŒ Â· ðŸš¢ Ø§Ù†ØªØ´Ø§Ø± Â· ðŸ§’ ØªØ¬Ø±Ø¨Ù‡Ù” Ú©ÙˆØ¯Ú©.
**O1 â€” Ù…Ø¯Ù„ Answer Key / Ø§Ø±Ø²ÛŒØ§Ø¨ Ù…Ø­Ù„ÛŒ â€” **STATE: OPEN** (Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ Ù…Ù‡Ù†Ø¯Ø³ÛŒ Ø«Ø¨Øª Ø´Ø¯Ø› Ù…Ø³Ø¯ÙˆØ¯Ú©Ù†Ù†Ø¯Ù‡Ù” P5)**
- - **Ú¯Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§:** (1) Ú©Ù„ÛŒØ¯ Ø¯Ø± APK Ø¯Ø§Ø®Ù„ Ù„Ø§ÛŒÙ‡Ù” Ø§Ø±Ø²ÛŒØ§Ø¨ Ø¬Ø¯Ø§ â€” Ø³Ø§Ø¯Ù‡â€ŒØªØ±ÛŒÙ†Ø› Ù¾Ø§Ø³Ø® Ù‚Ø§Ø¨Ù„ Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ø² APK Ø§Ø³Øª. (2) Ø§Ø±Ø²ÛŒØ§Ø¨ Ø¨Ø¯ÙˆÙ† Ú©Ù„ÛŒØ¯ Ù‚Ø§Ø¨Ù„â€ŒØ§Ø³ØªØ®Ø±Ø§Ø¬ â€” Ø§Ø«Ø¨Ø§Øª per-template (T01/T05/T13 Ù…Ù…Ú©Ù†Ø› T15 ÙÙ‚Ø· Ø§Ú¯Ø± Ú¯Ø²ÛŒÙ†Ù‡Ù” Ø¯Ø±Ø³Øª Ø§Ø²…
- - **Trade-off:** (1) Ø³Ø±ÛŒØ¹â€ŒØªØ±ÛŒÙ† Ù…Ø³ÛŒØ± release ÙˆÙ„ÛŒ Ø¨ÛŒØ´ØªØ±ÛŒÙ† Ø³Ø·Ø­ Ù…ÙˆØ§Ø¬Ù‡Ù‡Ø› (2) Ø§Ù…Ù†â€ŒØªØ±ÛŒÙ† ÙˆÙ„ÛŒ Ù‡Ø²ÛŒÙ†Ù‡Ù” Ø§Ø«Ø¨Ø§Øª Ùˆ Ù…Ø­Ø¯ÙˆØ¯ÛŒØª templateØ› (3) Ù…ÛŒØ§Ù†Ù‡ â€” Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ schema Ù¾Ø§Ø±Ø§Ù…ØªØ±Ù…Ø­ÙˆØ± Ø¯Ø± O2.
- - **Ø±ÛŒØ³Ú©:** ðŸ”’ (1) Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ù¾Ø§Ø³Ø® Ø§Ø² APK debug/release Ø¨Ø§ obfuscation Ù†Ø§Ù‚Øµ Â· ðŸ›  (2) Ø¯Ùˆ Ù…Ø³ÛŒØ± Ø§Ø±Ø²ÛŒØ§Ø¨ÛŒ per-template ØªØ³Øª Ø¨ÛŒØ´ØªØ±ÛŒ Ù…ÛŒâ€ŒØ®ÙˆØ§Ù‡Ø¯ Â· ðŸš¢ (3) schema Ù¾Ø§Ø±Ø§Ù…ØªØ±ÛŒ Ø¨Ø§ÛŒØ¯ Ø¯Ø± O2 Ù‚ÙÙ„ Ø´ÙˆØ¯ ÙˆÚ¯Ø±Ù†Ù‡ Ø¯Ùˆ Ø¨Ø§Ø± migration Ù…ÛŒâ€ŒØ´ÙˆØ¯ Â· ðŸ§’ Ù‡ÛŒÚ†â€Œ…
- - **Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ Ù…Ù‡Ù†Ø¯Ø³ÛŒ (ØºÛŒØ±Ù…ØµÙˆØ¨):** (3)+(2) ØªØ±Ú©ÛŒØ¨ÛŒ â€” Ù‡Ø± Ø¬Ø§ Ø¯Ø±Ø³ØªÛŒ Ø§Ø² Ù¾Ø§Ø±Ø§Ù…ØªØ± Ù…Ø´ØªÙ‚â€ŒÙ¾Ø°ÛŒØ± Ø§Ø³Øª Ø§Ø² Ù¾Ø§Ø±Ø§Ù…ØªØ±Ø› ÙˆÚ¯Ø±Ù†Ù‡ Ú©Ù„ÛŒØ¯ ÙÙ‚Ø· Ø¯Ø± Ù„Ø§ÛŒÙ‡Ù” Ø§Ø±Ø²ÛŒØ§Ø¨ Ø¬Ø¯Ø§ Ø¨Ø§ snapshot-test Â«Ù¾Ø±ÙˆØ¬Ú©Ø´Ù† Ø¨Ø¯ÙˆÙ† answerÂ» Ø¨Ø±Ø§ÛŒ Ù‡Ø± adapter.
- - **Ø¨Ø§Ø² Ù…ÛŒâ€ŒÚ©Ù†Ø¯:** P5 (Ù…ÙˆØªÙˆØ±)ØŒ P4 (schema Ù¾Ø§Ø±Ø§Ù…ØªØ±ÛŒ) Â· **Ø¨Ø³ØªÙ‡:** CONTENT-008 Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù…Ø±Ø² Ø§Ø¬Ø±Ø§ÛŒÛŒ.
- - **Ø³Ø§Ø¨Ù‚Ù‡Ù” ÙˆØ¶Ø¹ÛŒØª:** OPEN Ø§Ø² Phase 0.
**O2 â€” ÙØ±Ù…Øª/Ø§Ø³Ú©ÛŒÙ…Ø§ÛŒ Ù¾Ú©ÛŒØ¬ Ù…Ø­ØªÙˆØ§ Ùˆ Ù…Ø¯Ù„ Ø§Ù…Ø¶Ø§ â€” **STATE: OPEN â€” PROPOSED** (Ø§Ø³Ú©ÛŒÙ…Ø§ÛŒ DRAFT Ø¯Ø± ADR-0043 Â§2 Ø«Ø¨Øª Ø´Ø¯Ø› Ù…Ú©**
- - **Ú¯Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§:** (a) ØªØ£ÛŒÛŒØ¯ Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ ADR-0039 Â§4 (manifest + stations/audio/images + SHA-256 Ù‡Ø± ÙØ§ÛŒÙ„ + checksum Ú©Ù„) + Ø§Ù…Ø¶Ø§ÛŒ Ù…Ù†ÙØµÙ„ Ø±ÙˆÛŒ manifest Ø¨Ø§ Ú©Ù„ÛŒØ¯ Ø¹Ù…ÙˆÙ…ÛŒ Ù¾ÛŒÙ†â€ŒØ´Ø¯Ù‡ Ø¯Ø± APK Ùˆ Ú†Ø±Ø®Ø´ Ú©Ù„ÛŒØ¯Ø› (b) Ø§Ù…Ø¶Ø§ÛŒ Ú©Ø§Ù†ØªÛŒÙ†Ø± Ú©Ù„ Ù¾Ú©ÛŒØ¬ (single blob) â€” Ø§Ø¹…
- - **Trade-off:** (a) Ø§Ø³ØªØ§Ù†Ø¯Ø§Ø±Ø¯ Ùˆ Ù…Ø±Ø­Ù„Ù‡â€ŒØ¨Ù‡â€ŒÙ…Ø±Ø­Ù„Ù‡ Ù‚Ø§Ø¨Ù„â€ŒØªÙˆØ³Ø¹Ù‡Ø› (b) Ø³Ø§Ø¯Ù‡ Ø¯Ø± verify ÙˆÙ„ÛŒ Ø³Ù†Ú¯ÛŒÙ† Ø¯Ø± buildØ› (c) Ø±Ø¯ â€” Ø¯Ø± Ù…Ø­ØµÙˆÙ„ Ø¢ÙÙ„Ø§ÛŒÙ† ØªÙ†Ù‡Ø§ Ù…Ø±Ø² Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ø³Øª.
- - **Ø±ÛŒØ³Ú©:** ðŸ”’ (c) Ø¯Ø³ØªÚ©Ø§Ø±ÛŒ Ù…Ø­ØªÙˆØ§ Ù‚Ø§Ø¨Ù„â€ŒÚ©Ø´Ù Ù†ÛŒØ³Øª Â· ðŸ›  (a) Ú†Ø±Ø®Ø´ Ú©Ù„ÛŒØ¯ Ùˆ Ù†Ú¯Ù‡â€ŒØ¯Ø§Ø±ÛŒ pinned key Ø¯Ø± repo Ù…Ø±Ø² Ø¯Ø§Ø±Ø¯ Â· ðŸš¢ (a/b) Ù‡Ø± Ø¯Ùˆ Ø¨Ø§ÛŒØ¯ Ø§Ø² Ø§Ø¬Ø±Ø§ÛŒ CI Ø¨Ø§ Ù¾Ú©ÛŒØ¬ ÙˆØ§Ù‚Ø¹ÛŒ Ø¹Ø¨ÙˆØ± Ú©Ù†Ù†Ø¯ Â· ðŸ§’ corruption/missing asset Ø¨Ø§ÛŒØ¯ Ø³Ø·Ø­ Ø®Ø·Ø§ÛŒ Øµ…
- - **Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ Ù…Ù‡Ù†Ø¯Ø³ÛŒ (ØºÛŒØ±Ù…ØµÙˆØ¨):** (a) â€” Ø§Ù…Ø¶Ø§ÛŒ Ù…Ù†ÙØµÙ„ + Ù¾ÛŒÙ† Ú©Ù„ÛŒØ¯ + Ú†Ø±Ø®Ø´Ø› Ù¾ÛŒÙ† Ù¾Ù„ØªÙØ±Ù… P1 Ø§Ù„Ú¯ÙˆÛŒ Â«Ù‡ÙˆÛŒØª Ø«Ø§Ø¨ØªÂ» Ø±Ø§ Ù†Ø´Ø§Ù† Ø¯Ø§Ø¯Ù‡.
- - **Ø¨Ø§Ø² Ù…ÛŒâ€ŒÚ©Ù†Ø¯:** P4 Ùˆ schema Ù¾Ø§Ø±Ø§Ù…ØªØ±ÛŒ O1(3) Â· **Ø¨Ø³ØªÙ‡:** G-13/G-14.
**O3 â€” Ø³Ø±Ù†ÙˆØ´Øª LessonGateway â€” **STATE: OPEN** (Ù…Ø³Ø¯ÙˆØ¯Ú©Ù†Ù†Ø¯Ù‡Ù” cutover Ø§Ø±Ø²ÛŒØ§Ø¨)**
- - **Ú¯Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§:** (a) Ù†Ú¯Ù‡â€ŒØ¯Ø§Ø´ØªÙ† interface Ø¨Ø§ Ù¾ÛŒØ§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ù…Ø­Ù„ÛŒ â€” ØªØºÛŒÛŒØ± Ø­Ø¯Ø§Ù‚Ù„ÛŒ host/journeyØŒ Ù†Ø§Ù… Ú¯Ù…Ø±Ø§Ù‡â€ŒÚ©Ù†Ù†Ø¯Ù‡ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ø› (b) Ø­Ø°Ù Ùˆ `LocalLessonEvaluator` ØµØ±ÛŒØ­ â€” ØªÙ…ÛŒØ²ØªØ±ØŒ ØªØºÛŒÛŒØ± Ø¨Ø²Ø±Ú¯â€ŒØªØ± Ø¯Ø± host.
- - **Trade-off:** (a) Ú©Ù…â€ŒØ±ÛŒØ³Ú© Ø¨Ø±Ø§ÛŒ N08R ÙØ¹Ø§Ù„Ø› (b) Ø¨Ø§ Ù…Ø¹Ù…Ø§Ø±ÛŒ Ù‡Ø¯Ù Â§2 Ùˆ Ø³Ø·Ø­ Ø°Ù‡Ù†ÛŒ Ù…ÙˆØªÙˆØ± P5 Ù‡Ù…â€ŒØ®ÙˆØ§Ù†â€ŒØªØ±.
- - **Ø±ÛŒØ³Ú©:** ðŸ›  (a) Ø¯Ùˆ Ù…Ø¹Ù†Ø§ÛŒ Â«GatewayÂ» Ø¯Ø± Ú©Ø¯ Ø¨Ø±Ø§ÛŒ ÛŒÚ© Ø³Ø§Ù„ Ø¢ÛŒÙ†Ø¯Ù‡ Â· ðŸš¢ Ù‡Ø± Ø¯Ùˆ Ø¨ÛŒâ€ŒØ§Ø«Ø± Ø¨Ø± release ØªØ§ Ù…Ø­ØªÙˆØ§ (P4/P7) Ø¨ÛŒØ§ÛŒØ¯ Â· ðŸ”’ Ù…Ø±Ø² answer-key Ø¯Ø± Ù‡Ø± Ø¯Ùˆ Ø¨Ø§ÛŒØ¯ snapshot-test Ø´ÙˆØ¯ Â· ðŸ§’ Ø¨ÛŒâ€ŒØ§Ø«Ø±.
- - **Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ Ù…Ù‡Ù†Ø¯Ø³ÛŒ (ØºÛŒØ±Ù…ØµÙˆØ¨):** (b) Ù…Ø·Ø§Ø¨Ù‚ Ù…Ø·Ø§Ù„Ø¹Ù‡Ù” Ø¢ÙÙ„Ø§ÛŒÙ†Ø› idempotency-key Ù‚Ø·Ø¹ÛŒ Ø¨Ø±Ø§ÛŒ Ù‡ÙˆÛŒØª attempt Ø­ÙØ¸ Ø´ÙˆØ¯.

_منبع: `docs/architecture/INFRASTRUCTURE_OWNER_DECISIONS_FA.md`_

## Ù…Ø¹Ù…Ø§Ø±ÛŒ Ù‡Ø¯Ù Ø²ÛŒØ±Ø³Ø§Ø®Øª SHOMARA (Ù†Ø³Ø®Ù‡Ù” Phase 0 â€” Ø¨Ø±Ø§ÛŒ ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú©)

**Ù…Ø¹Ù…Ø§Ø±ÛŒ Ù‡Ø¯Ù Ø²ÛŒØ±Ø³Ø§Ø®Øª SHOMARA (Ù†Ø³Ø®Ù‡Ù” Phase 0 â€” Ø¨Ø±Ø§ÛŒ ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú©)**
- - **ØªØ§Ø±ÛŒØ®:** 2026-11-12 Â· **Ù…Ø¨Ù†Ø§:** commit `aa2805c` Â· **ÙˆØ¶Ø¹ÛŒØª:** Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ ÙÙ†ÛŒØ› Ù‡Ø± Ø¨Ø®Ø´Ù ÙˆØ§Ø¨Ø³ØªÙ‡ Ø¨Ù‡ ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú© Ø¨Ø§ Ø¨Ø±Ú†Ø³Ø¨ `[O?]` Ù…Ø´Ø®Øµ Ø§Ø³Øª Ùˆ ØªØ§ ØªØ£ÛŒÛŒØ¯ØŒ Ù¾ÛŒØ§Ø¯Ù‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- - **Ù…Ø¨Ù†Ø§ÛŒ ØªØµÙ…ÛŒÙ…:** ADR-0039 (Ù…Ø­ØµÙˆÙ„ Ú©Ø§Ù…Ù„Ø§Ù‹ Ø¢ÙÙ„Ø§ÛŒÙ†Ø› Ù¾Ú©ÛŒØ¬ Ù…Ø­ØªÙˆØ§ÛŒ bundle + Ø§Ø±Ø²ÛŒØ§Ø¨ Ù…Ø­Ù„ÛŒØ› UI Ù…Ø¯Ù„ Duolingo Ø¨Ø§ Ù…Ø±Ø²Ù‡Ø§ÛŒ Â§6). ADR-0003 ÙÙ‚Ø· Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† ØªØ§Ø±ÛŒØ®Ú†Ù‡Ù” Ø¯ÙˆØ±Ù‡Ù” Ø³Ø±ÙˆØ± Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª.
- - **Ø¢Ù†Ú†Ù‡ Ø¹ÙˆØ¶ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯:** single-activity + Compose + UDF + ViewModel/state immutable + Design System ÙˆØ§Ø­Ø¯ + Ù‚ÙˆØ§Ø¹Ø¯ child-safe (Ø¨Ø¯ÙˆÙ† Ø³ØªØ§Ø±Ù‡/Ø¬Ø§Ù†/Ø³Ú©Ù‡/leaderboard) + Ù…Ø±Ø² CONTENT-008/018.
**1. Ø§ØµÙˆÙ„ Ù¾Ù†Ø¬â€ŒÚ¯Ø§Ù†Ù‡Ù” Ù‡Ø¯Ù**
- 1. **Ù…Ø­ØªÙˆØ§ÛŒ Ø¯Ø±Ø³ÛŒ ÙÙ‚Ø· Ø§Ø² Ù¾Ú©ÛŒØ¬ bundle Ù…ÛŒâ€ŒØ¢ÛŒØ¯** â€” Ù†Ù‡ Ø§Ø² Ú©Ø¯ØŒ Ù†Ù‡ Ø§Ø² Ø´Ø¨Ú©Ù‡. Ù†Ø³Ø®Ù‡Ù” Ù¾Ú©ÛŒØ¬ Ù…Ø³ØªÙ‚Ù„ Ø§Ø² Ù†Ø³Ø®Ù‡Ù” Ø§Ù¾ Ú¯Ø²Ø§Ø±Ø´â€ŒÙ¾Ø°ÛŒØ± Ø§Ø³Øª (ADR-0039 Â§1).
- 2. **Ø­Ù‚ÛŒÙ‚Øª ÛŒØ§Ø¯Ú¯ÛŒØ±ÛŒ Ø±ÙˆÛŒ Ø¯Ø³ØªÚ¯Ø§Ù‡ Ø§Ø³Øª Ùˆ Ù¾Ø§ÛŒØ¯Ø§Ø± Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯** â€” Room Ø¨Ø±Ø§ÛŒ Ø¯Ø§Ø¯Ù‡Ù” Ø³Ø§Ø®ØªØ§Ø±ÛŒØ§ÙØªÙ‡Ø› DataStore ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø³Ø¨Ú© `[O4]`.
- 3. **Ù…ÙˆØªÙˆØ± ÛŒØ§Ø¯Ú¯ÛŒØ±ÛŒ pure Ùˆ ØªØ³Øªâ€ŒÙ¾Ø°ÛŒØ± Ø¨ÛŒØ±ÙˆÙ† Ø§Ø² Compose Ø§Ø³Øª** â€” determinism Ø¨Ø±Ø§ÛŒ `(packageVersion, item, inputs, config)`.
- 4. **Ù…Ø±Ø² answer-key Ù†Ø³Ø®Ù‡Ù” Ù…Ø¹Ù…Ø§Ø±ÛŒ Ø¯Ø§Ø±Ø¯ØŒ Ù†Ù‡ Ø§Ø³ØªØ«Ù†Ø§ÛŒ Ù…ÙˆØ±Ø¯ÛŒ** â€” authoring/published/child-projection/evaluator Ú†Ù‡Ø§Ø± Ù„Ø§ÛŒÙ‡Ù” Ø¬Ø¯Ø§ `[O1]`.
- 5. **Ø´Ø¨Ú©Ù‡ Ø¯Ø± Ú©Ù„Ø§ÛŒÙ†Øª Ú©ÙˆØ¯Ú© ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯** â€” Ù‡ÛŒÚ† permission Ùˆ transport Ø´Ø¨Ú©Ù‡ Ø¯Ø± Ù…Ø³ÛŒØ± ÛŒØ§Ø¯Ú¯ÛŒØ±ÛŒØ› fail-closed Ø¨Ù‡â€ŒØµÙˆØ±Øª Ø·Ø±Ø§Ø­ÛŒâ€ŒØ´Ø¯Ù‡ (Ù†Ù‡ ØªØµØ§Ø¯ÙÛŒ).
**2. Ù†Ù‚Ø´Ù‡Ù” Ù…Ø§Ú˜ÙˆÙ„ Ù‡Ø¯Ù (Android)**
- :app                    â†’ composition rootØŒ NavHostØŒ shellØŒ launch gate
- :core:common            â†’ logger/error taxonomy (Ù…ÙˆØ¬ÙˆØ¯)
- :core:model             â†’ Ù…Ø¯Ù„ Ø¯Ø§Ù…Ù†Ù‡ (Ù…ÙˆØ¬ÙˆØ¯Ø› Ú¯Ø³ØªØ±Ø´ Ø¨Ø§ Ù…Ø­ØªÙˆØ§ÛŒ Ù¾Ú©ÛŒØ¬)
- :core:designsystem      â†’ token/theme/component (Ù…ÙˆØ¬ÙˆØ¯)
- :core:datastore         â†’ ÙÙ‚Ø· settings/checkpoint Ø³Ø¨Ú© (ØªØºÛŒÛŒØ± scope)
- :core:database          â†’ Room ÙˆØ§Ù‚Ø¹ÛŒ: progress/packages/attempts/sessions [O4]
- :core:contentpackage    â†’ Ø¬Ø¯ÛŒØ¯: loader/verifier/activation/registry Ù¾Ú©ÛŒØ¬ [O2]
- :core:learning          â†’ Ø¬Ø¯ÛŒØ¯: Ù…ÙˆØªÙˆØ± Ø§Ø±Ø²ÛŒØ§Ø¨ + Ù‚ÙˆØ§Ø¹Ø¯ Ù†Ø³Ø®Ù‡â€ŒØ¯Ø§Ø± [O1]
- :feature:*              â†’ ÙÙ‚Ø· UI Ùˆ eventØ› Ù‡ÛŒÚ† ØªØµÙ…ÛŒÙ… mastery
- :sync                   â†’ Ø¨Ø§Ø²Ù†Ø´Ø³ØªÙ‡ Ù¾Ø³ Ø§Ø² O3/O6 (Ú©Ø¯ Ø¯ÙˆØ±Ù‡Ù” Ø³Ø±ÙˆØ±)
- :core:network           â†’ Ø¨Ø§Ø²Ù†Ø´Ø³ØªÙ‡ Ù¾Ø³ Ø§Ø² O3 (ÙÙ‚Ø· Ø§Ú¯Ø± authoring tool Ø¬Ø¯Ø§ Ù†Ø®ÙˆØ§Ø³ØªØ´)
- Ù‚ÙˆØ§Ø¹Ø¯ Ù…Ø±Ø² Ù‡Ù…Ø§Ù† `PACKAGE_BOUNDARIES_FA.md` Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯ Ø¨Ø§ ÛŒÚ© Ø§ØµÙ„Ø§Ø­: Ù…Ø±Ø² repository Ø¯ÛŒÚ¯Ø± Â«local/remoteÂ» Ù†ÛŒØ³ØªØ› Â«local/packagedÂ» Ø§Ø³Øª (Ø§ØµÙ„Ø§Ø­ Ù…ØªÙ† Ø¯Ø± Ú¯Ø§Ù… Ø¨Ø§Ø²Ù†ÙˆÛŒØ³ÛŒ ledger â€” G-08).
**3. Ù„Ø§ÛŒÙ‡Ù” Ø¯Ø§Ø¯Ù‡ (Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ØŒ Ù…Ø´Ù…ÙˆÙ„ O4)**
- Room (ØªØ®Ù…ÛŒÙ† Û¹ Ø¬Ø¯ÙˆÙ„Ø› Ù†Ø§Ù…â€ŒÙ‡Ø§ Ù‚Ø·Ø¹ÛŒ Ù†ÛŒØ³ØªÙ†Ø¯):

_منبع: `docs/architecture/INFRASTRUCTURE_TARGET_ARCHITECTURE_FA.md`_

## O6 Decision Pack â€” Ø³Ø±Ù†ÙˆØ´Øª Backend/Supabase/apps-web (P11)

**O6 Decision Pack â€” Ø³Ø±Ù†ÙˆØ´Øª Backend/Supabase/apps-web (P11)**
- - **ØªØ§Ø±ÛŒØ®:** 2026-11-14 Â· **ÙˆØ¶Ø¹ÛŒØª O6:** **OPEN** â€” Ø·Ø¨Ù‚ Ù…Ø£Ù…ÙˆØ±ÛŒØª ØµØ±ÛŒØ­ Ù…Ø§Ù„Ú©ØŒ **ÙÙ‚Ø· Ø§ÛŒÙ† Decision Pack ØªÙ‡ÛŒÙ‡ Ø´Ø¯Ø› Ù‡ÛŒÚ† Ø­Ø°ÙØŒ Ù‡ÛŒÚ† Ú¯Ø³ØªØ±Ø´ production Ùˆ Ù‡ÛŒÚ† ØªØºÛŒÛŒØ±ÛŒ Ø¯Ø± runtime Ú©ÙˆØ¯Ú© Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯Ù‡**.
- - **ÙˆØ¶Ø¹ÛŒØª child runtime (Ø¨ÛŒâ€ŒØªØºÛŒÛŒØ± Ø¯Ø± Ù‡Ø± Ø³Ù‡ Ú¯Ø²ÛŒÙ†Ù‡):** Ú©Ù„Ø§ÛŒÙ†Øª Ú©ÙˆØ¯Ú© ØµÙØ± ÙˆØ§Ø¨Ø³ØªÚ¯ÛŒ Backend Ø¯Ø§Ø±Ø¯ (URLÙ‡Ø§ nullØŒ Ø¨Ø¯ÙˆÙ† INTERNET permissionØŒ Ù…ÙˆØªÙˆØ± + Ù¾Ú©ÛŒØ¬â€ŒØ§Ù†Ø¬ÛŒÙ† Ø¢ÙÙ„Ø§ÛŒÙ† Ø¯Ø± P5/P6/P8 Ø§Ø«Ø¨Ø§Øª Ø´Ø¯Ù†Ø¯). Ø§ÛŒÙ† Decision Pack ÙÙ‚Ø· Ø³Ù…Øª authoring/server Ø…
- - **Inventory Ù…Ø§Ø´ÛŒÙ†â€ŒØ®ÙˆØ§Ù†:** `docs/architecture/o6-pack/inventory.json` â€” **Û´Û¹ API route Â· Û·Û´ migration Â· Û¸ ÙØ§ÛŒÙ„ InMemory repo** (ØªÙˆÙ„ÛŒØ¯ Ø¨Ø§ `node tools/o6-inventory.mjs`).
**Ú¯Ø²ÛŒÙ†Ù‡Ù” A â€” Retain Backend/CMS as independent authoring service**
**Ù…ÙÙ‡ÙˆÙ…:** Supabase + apps/web Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ø³Ø±ÙˆÛŒØ³ authoring/Ù…Ø¯ÛŒØ±ÛŒØª Ø¨Ø²Ø±Ú¯Ø³Ø§Ù„ Ø²Ù†Ø¯Ù‡ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ù†Ø¯Ø› child runtime Ú©Ø§Ù…Ù„Ø§Ù‹ Ù…Ø³ØªÙ‚Ù„ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯ (Ø¢Ù…Ø§Ø¯Ù‡ Ø§Ø³Øª).
**Ú©Ø§Ø±Ù‡Ø§ÛŒ Ù„Ø§Ø²Ù… (endpoint-by-endpoint / migration-by-migration):**
- 1. **Persistence:** Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ†ÛŒ Û¸ ÙØ§ÛŒÙ„ InMemory repo (adult-projections/assignment-runtime/challenge-runtime/offline-sync/admin-audio/learning-runtime/teacher-applications) Ø¨Ø§ repoÙ‡Ø§ÛŒ persistent Ø±ÙˆÛŒ Supabase â€” Ø¨Ø§ Integration test Ø±ÙˆÛŒ Local Supabase.
- 2. **Audio admin:** Ø¬Ø¯Ø§Ø³Ø§Ø²ÛŒ audio metadata/versions/audit trail Ø§Ø² Ø¨Ø§ÛŒÙ†Ø±ÛŒØ› Object Storage ÙˆØ§Ù‚Ø¹ÛŒ + signed upload/download + size/type validation + checksum verification (Ø§Ù„Ú¯ÙˆÛŒ sha256 Ø¢Ù…Ø§Ø¯Ù‡ Ø¯Ø± P5/P7).
- 3. **Ø§Ù…Ù†ÛŒØª Ø³Ø±Ø§Ø³Ø±ÛŒ:** RBAC (Û´ Ù†Ù‚Ø´ Ù…ÙˆØ¬ÙˆØ¯ Ø¯Ø± contracts) + RLS Ø¨Ø±Ø§ÛŒ Ù‡Ø± Ø¬Ø¯ÙˆÙ„ + session expiry + CSRF + rate limit Ø³Ø±Ø§Ø³Ø±ÛŒ + audit logging â€” Ø¨Ø§ Integration test Ø¨Ø±Ø§ÛŒ Admin/Teacher/Parent/Child.
- 4. **Migrations:** Ø§Ø¬Ø±Ø§ÛŒ Û·Û´ migration Ø±ÙˆÛŒ Local Supabase (migration-by-migration) Ø³Ù¾Ø³ Staging/Prod Ø¨Ø§ deploy separation.
- 5. **Backup/Restore** + Ù…Ø­ÛŒØ·â€ŒÙ‡Ø§ÛŒ Dev/Staging/Prod Ø¬Ø¯Ø§.
- 6. **Ø­ÙØ¸ Ù…Ø´Ø±ÙˆØ·:** APIÙ‡Ø§ÛŒ child learning ÙÙ‚Ø· Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ø§Ø¨Ø²Ø§Ø± Ø¨Ø²Ø±Ú¯Ø³Ø§Ù„/Ù…Ø¯ÛŒØ±ÛŒØª Ø­ÙØ¸ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯Ø› **Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø¯Ø± lesson runtime Ù…Ù…Ù†ÙˆØ¹ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ø¯** (ADR-0039).
**Ø¨Ø±Ø¢ÙˆØ±Ø¯ ÙˆØ§Ù‚Ø¹ÛŒ:** Ø¨Ø²Ø±Ú¯â€ŒØªØ±ÛŒÙ† Ú¯Ø²ÛŒÙ†Ù‡ â€” ÛŒÚ© Ø¨Ø±Ù†Ø§Ù…Ù‡Ù” backend Ú©Ø§Ù…Ù„ (Ù…Ø¹Ø§Ø¯Ù„ Ú†Ù†Ø¯ ÙØ§Ø²). Ø¨Ø±Ø§ÛŒ Ù…Ø­ØµÙˆÙ„Ù Ú©Ø§Ù…Ù„Ø§Ù‹ Ø¢ÙÙ„Ø§ÛŒÙ†Ù Ú©ÙˆØ¯Ú©ØŒ value Ú©Ù…ØªØ± Ø§Ø² Ù‡Ø²ÛŒÙ†Ù‡ Ø§Ø³Øª Ù…Ú¯Ø± CMS Ø³Ø§Ø²Ù…Ø§Ù†ÛŒ/Ú†Ù†Ø¯-Ù…Ø¯Ø±Ø³Ù‡â€ŒØ§ÛŒ Ù‡Ø¯Ù Ø¨Ø§Ø´Ø¯.
**Ú¯Ø²ÛŒÙ†Ù‡Ù” B â€” Authoring Ù…Ø­Ù„ÛŒ/offline + Ù¾Ú©ÛŒØ¬ Ø§Ù…Ø¶Ø§Ø´Ø¯Ù‡Ù” exportableØ› Ø¨Ø§Ø²Ù†Ø´Ø³ØªÚ¯ÛŒ Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ runtime Ø³Ø±ÙˆØ±  â­ Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ ÙÙ†**
**Ù…ÙÙ‡ÙˆÙ…:** Supabase/apps/web runtime Ù…Ø³ÛŒØ± Ø¨Ø§Ø²Ù†Ø´Ø³ØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯Ø› authoring Ù…Ø­Ù„ÛŒ Ø¨Ø§ Ø®Ø±ÙˆØ¬ÛŒ Ù¾Ú©ÛŒØ¬ Ø§Ù…Ø¶Ø§Ø´Ø¯Ù‡ â€” **Ø²ÛŒØ±Ø³Ø§Ø®ØªØ´ Ø§Ø² P7 Ø¢Ù…Ø§Ø¯Ù‡ Ø§Ø³Øª**: `tools/content-pipeline` (typed ST07 artifact + validator Û±Û³ rule + promotion gate Û· Ù…Ø±Ø­Ù„Ù‡â€ŒØ§ÛŒ Ø¨Ø§ ledger + Pack…
**Ú©Ø§Ø±Ù‡Ø§ÛŒ Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡ Ø¨Ø±Ø§ÛŒ ØªÚ©Ù…ÛŒÙ„ B:**
- 1. Authoring Workflow UI Ø­Ø¯Ø§Ù‚Ù„ÛŒ (CLI ÙØ¹Ù„ÛŒ Ú©Ø§ÙÛŒ Ø¨Ø±Ø§ÛŒ Ù…Ø±Ø§Ø­Ù„ Ù…Ø§Ø´ÛŒÙ†Ø› ÙØ±Ù… Ø§Ù†Ø³Ø§Ù†ÛŒ Ø¨Ø±Ø§ÛŒ review evidence).
- 2. **Export Package** Ø¨Ø§ Ø§Ù…Ø¶Ø§: PackageBuilder Ù…ÙˆØ¬ÙˆØ¯ Ø®Ø±ÙˆØ¬ÛŒ Ù…ÛŒâ€ŒØ¯Ù‡Ø¯Ø› Ú¯Ø§Ù… Ø§Ù…Ø¶Ø§ = Ù…Ø§Ù„Ú© Ø¨Ø§ Ú©Ù„ÛŒØ¯ Ø®ØµÙˆØµÛŒ Ø®Ø§Ø±Ø¬ Ø§Ø² repo (ADR-0043 Â§1) â€” Ø§Ø¨Ø²Ø§Ø± `sign` CLI Ø§Ø¶Ø§ÙÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯ (Ú©Ù„ÛŒØ¯ ÙÙ‚Ø· Ù…Ø­ÛŒØ· Ù…Ø§Ù„Ú©).
- 3. Archive: `apps/web` + `packages/*-runtime` runtime paths + `supabase/migrations` Ø¨Ù‡ `archive/backend-2026/` (git mvØ› Ø¨Ø¯ÙˆÙ† Ø­Ø°Ù) + deprecation README per item.
- 4. Dependency map: `tools/o6-inventory.mjs` Ù‡Ø± Ø§Ø¬Ø±Ø§ Ø¨Ù‡â€ŒØ±ÙˆØ² Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› verifier R11 Ø§Ø¶Ø§ÙÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯: Ù‡ÛŒÚ† import Ø§Ø² archive/** Ø¯Ø± Ú©Ø¯ Ø²Ù†Ø¯Ù‡.
- 5. Retire ØªØ±ØªÛŒØ¨ÛŒ (ÙÙ‚Ø· Ù¾Ø³ Ø§Ø² ØªØ£ÛŒÛŒØ¯ Ù…Ø§Ù„Ú©ØŒ Ù‡Ø± Ú¯Ø§Ù… ÛŒÚ© commit Ù‚Ø§Ø¨Ù„ Ø¨Ø§Ø²Ø¨ÛŒÙ†ÛŒ): auth/otp â†’ learning/* â†’ sync/batch â†’ missions/worlds/collection â†’ teacher/* â†’ admin/audio â†’ content packages (Ù†Ú¯Ù‡â€ŒØ¯Ø§Ø´Øª Ø§Ú¯Ø± authoring Ø¨Ù‡ Ø¢Ù†â€ŒÙ‡Ø§ Ø³ÙˆØ®Øªâ€ŒØ±Ø³Ø§Ù†ÛŒ Ù…ÛŒâ€ŒÚ©Ù†Ø…
- 6. Û·Û´ migration: archive + Ù†Ú¯Ù‡â€ŒØ¯Ø§Ø´Øª Ø¯Ø± repo (Ù‡ÛŒÚ† SQL Ù¾Ø§Ú© Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯)Ø› retirement plan per-table Ø¯Ø± Ù‡Ù…ÛŒÙ† pack.
**Ø±ÛŒØ³Ú©:** Ù†Ú¯Ù‡â€ŒØ¯Ø§Ø±ÛŒ Ø¯Ùˆ Ø§Ø³ØªÚ© Ù…ÙˆÙ‚Øª ØªØ§ Ø§ØªÙ…Ø§Ù… retireØ› ØªÛŒÙ… authoring Ø¨Ø§ÛŒØ¯ Ø¨Ø§ CLI Ú©Ø§Ø± Ú©Ù†Ø¯.

_منبع: `docs/architecture/O6_DECISION_PACK_FA.md`_

## Ø¨Ø³ØªÙ‡Ù” ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú© â€” O5: Ù‡ÙˆÛŒØª Ù…Ø­Ù„ÛŒ ØªÚ©â€ŒÙ¾Ø±ÙˆÙØ§ÛŒÙ„ ÛŒØ§ Ú†Ù†Ø¯Ù¾Ø±ÙˆÙØ§ÛŒÙ„

**Ø¨Ø³ØªÙ‡Ù” ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú© â€” O5: Ù‡ÙˆÛŒØª Ù…Ø­Ù„ÛŒ ØªÚ©â€ŒÙ¾Ø±ÙˆÙØ§ÛŒÙ„ ÛŒØ§ Ú†Ù†Ø¯Ù¾Ø±ÙˆÙØ§ÛŒÙ„**
- - ØªØ§Ø±ÛŒØ® ØªÙ‡ÛŒÙ‡: 2026-11-18
- - ÙˆØ¶Ø¹ÛŒØª: **Ø¨Ø±Ø§ÛŒ ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú©Ø› Ù‡ÛŒÚ† Ú¯Ø²ÛŒÙ†Ù‡â€ŒØ§ÛŒ Ø¯Ø± Ø§ÛŒÙ† Ø³Ù†Ø¯ ØªØµÙˆÛŒØ¨ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.**
- - Ø­Ø§Ú©Ù…: `docs/architecture/INFRASTRUCTURE_OWNER_DECISIONS_FA.md`ØŒ Ø¨Ø®Ø´ O5.
- - Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ù…Ø­ØµÙˆÙ„: ADR-0039 (Accepted, 2026-11-05) â€” Ú©Ø§Ù…Ù„Ø§Ù‹ Ø¢ÙÙ„Ø§ÛŒÙ†ØŒ Ø¨Ø¯ÙˆÙ† Ø­Ø³Ø§Ø¨/Ø³Ø±ÙˆØ±Ø› Ù‡ÙˆÛŒØª Ú©ÙˆØ¯Ú© Ùˆ PIN ÙˆØ§Ù„Ø¯ Ú©Ø§Ù…Ù„Ø§Ù‹ Ù…Ø­Ù„ÛŒ.
- - Ù‡Ø¯Ù: Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ø§Ø² migration Ø³Ù†Ú¯ÛŒÙ† progress Ùˆ Ø­ÙØ¸ privacy Ùˆ Ø¬Ø¯Ø§Ø³Ø§Ø²ÛŒ Ø¯Ø§Ø¯Ù‡Ù” Ú©ÙˆØ¯Ú©Ø§Ù†.
**1. ØªØµÙ…ÛŒÙ… Ù…ÙˆØ±Ø¯Ù†ÛŒØ§Ø²**
- O5 Ù…ÛŒâ€ŒÙ¾Ø±Ø³Ø¯ launch Ø§Ù¾ Ø¨Ø±Ø§ÛŒ ÛŒÚ© Ú©ÙˆØ¯Ú© Ù…Ø­Ù„ÛŒ Ø§Ø³Øª ÛŒØ§ Ú†Ù†Ø¯ Ú©ÙˆØ¯Ú© Ø¨Ø§ Ø§Ù†ØªØ®Ø§Ø¨ Ù¾Ø±ÙˆÙØ§ÛŒÙ„ Ø¯Ø± launch.
- | Ú¯Ø²ÛŒÙ†Ù‡ | ØªØ¬Ø±Ø¨Ù‡ | Ù…Ø²ÛŒØª | Ù‡Ø²ÛŒÙ†Ù‡/Ø±ÛŒØ³Ú© |
- | A â€” ØªÚ©â€ŒÙ¾Ø±ÙˆÙØ§ÛŒÙ„ Ø¯Ø± Ù†Ø³Ø®Ù‡Ù” Ø§ÙˆÙ„ | ÛŒÚ© Ù¾Ø±ÙˆÙØ§ÛŒÙ„ Ù…Ø­Ù„ÛŒ ÙØ¹Ø§Ù„Ø› Ø¨Ø¯ÙˆÙ† ØµÙØ­Ù‡Ù” Ø§Ù†ØªØ®Ø§Ø¨ Ù¾Ø±ÙˆÙØ§ÛŒÙ„ Ø¯Ø± launch | Ø³Ø§Ø¯Ù‡â€ŒØªØ±ÛŒÙ† onboardingØŒ Ú©Ù…ØªØ±ÛŒÙ† Ø§Ø­ØªÙ…Ø§Ù„ ÙˆØ±ÙˆØ¯ Ø¨Ù‡ Ø¯Ø§Ø¯Ù‡Ù” Ú©ÙˆØ¯Ú© Ø¯ÛŒÚ¯Ø±ØŒ Ù…Ø³ÛŒØ± Ú©ÙˆØªØ§Ù‡â€ŒØªØ± Ø¨Ø±Ø§ÛŒ cutover Ø¢ÙÙ„Ø§ÛŒÙ† | Ø®Ø§Ù†…
- | B â€” Ú†Ù†Ø¯Ù¾Ø±ÙˆÙØ§ÛŒÙ„ Ø¨Ø§ Ø§Ù†ØªØ®Ø§Ø¨ Ø¯Ø± launch | ÙÙ‡Ø±Ø³Øª Ù†Ø§Ù…/Ø¢ÙˆØ§ØªØ§Ø±Ø› Ø§Ù†ØªØ®Ø§Ø¨ Ú©ÙˆØ¯Ú© Ù¾ÛŒØ´ Ø§Ø² Ù†Ù…Ø§ÛŒØ´ Home Ùˆ Ù‡Ø± progress | Ù…Ù†Ø§Ø³Ø¨ Ù…Ø¯Ø±Ø³Ù‡/Ø®Ø§Ù†ÙˆØ§Ø¯Ù‡Ù” Ú†Ù†Ø¯Ú©ÙˆØ¯Ú©ÛŒØŒ Ø¬Ø¯Ø§Ø³Ø§Ø²ÛŒ Ø¯Ø±Ø³Øª Ù¾ÛŒØ´Ø±ÙØª Ùˆ ØªÙ†Ø¸ÛŒÙ…Ø§Øª | ØµÙØ­Ù‡Ù” Ø§Ù†ØªØ®Ø§Ø¨ Ùˆ Ù…Ø¯ÛŒØ±ÛŒØª Ù¾Ø±Ùˆ…
**Ù…ØªÙ† Ù…Ù†Ø¨Ø¹ O5:** Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ Ù…Ù‡Ù†Ø¯Ø³ÛŒ Ù…ÙˆØ¬ÙˆØ¯ Ø¨Ø±Ø§ÛŒ Ù†Ø³Ø®Ù‡Ù” Ø§ÙˆÙ„ Ú¯Ø²ÛŒÙ†Ù‡Ù” A Ø§Ø³ØªØŒ Ø¨Ø§ schema Ø¯Ø§Ø±Ø§ÛŒ `childProfileId` Ø§Ø² Ø±ÙˆØ² Ø§ÙˆÙ„ ØªØ§ B Ø¨Ø¹Ø¯Ø§Ù‹ Ø¨Ø¯ÙˆÙ† migration ØªØ®Ø±ÛŒØ¨ÛŒ Ø¨Ø§Ø² Ø¨Ù…Ø§Ù†Ø¯. Ø§ÛŒÙ† Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ Ù…Ø§Ù„Ú©Ø§Ù†Ù‡ ØªØµÙˆÛŒØ¨ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
**2. Ø´ÙˆØ§Ù‡Ø¯ ÙØ¹Ù„ÛŒ Ù…Ø®Ø²Ù†**
- | Ù…Ø­Ù„ | ÙˆØ¶Ø¹ÛŒØª ÙØ¹Ù„ÛŒ | Ù¾ÛŒØ§Ù…Ø¯ |
- | `PreferencesProfileDraftStore` | DataStore draft Ø´Ø§Ù…Ù„ name/avatarId/gradeIdØ› ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ resume ÙØ±Ù… Ù†Ø§Ù‚Øµ | Ø§ÛŒÙ† draftØŒ Ù¾Ø±ÙˆÙØ§ÛŒÙ„ ÙˆØ§Ù‚Ø¹ÛŒ/ÙØ¹Ø§Ù„ Ù†ÛŒØ³Øª Ùˆ identity Ù¾Ø§ÛŒØ¯Ø§Ø± ØªÙˆÙ„ÛŒØ¯ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯ |
- | `progress_projections` | Room PK = (learningIdentityId, stationId)Ø› Ù…Ø¯Ù„ Ø¯Ø§Ù…Ù†Ù‡ Ø¢Ù† Ø±Ø§ Ø¢Ø®Ø±ÛŒÙ† projection ØªØ£ÛŒÛŒØ¯Ø´Ø¯Ù‡ ØªØ¹Ø±ÛŒÙ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ | Ù‡Ù†ÙˆØ² identity Ù…Ø­Ù„ÛŒ Ú©ÙˆØ¯Ú© Ø¨Ù‡ Ø¢Ù† Ù…ØªØµÙ„ Ù†ÛŒØ³ØªØ› Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² token ÛŒØ§ Ù†Ø§Ù… Ú©ÙˆØ¯Ú© Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† ID Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª |
- | `LearningEntities.kt` | comment Ùˆ schema ØµØ±ÛŒØ­Ø§Ù‹ Ø¬Ø¯ÙˆÙ„ profile Ø±Ø§ Ø¨Ù‡ O5 Ù…ÙˆÚ©ÙˆÙ„ Ú©Ø±Ø¯Ù‡â€ŒØ§Ù†Ø¯ | Ø§ÙØ²ÙˆØ¯Ù† Ø¬Ø¯ÙˆÙ„ Ù¾ÛŒØ´ Ø§Ø² Ø±Ø£ÛŒ O5 Ø¨Ø±Ø®Ù„Ø§Ù Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ ÙØ¹Ù„ÛŒ schema Ø§Ø³Øª |
- | `ParentPinManager` | PBKDF2-HMAC-SHA256 + salt Ùˆ lockout Ø±ÙˆÛŒ interface | concrete local profile store Ùˆ ParentGate wiring Ù‡Ù†ÙˆØ² Ø§Ø«Ø¨Ø§Øª Ù†Ø´Ø¯Ù‡ |
- | `ShomaraChildShellHost` | progress default Ø¨Ù‡ Ø­Ø§Ù„Øª unresolved fail-closed ØªØºÛŒÛŒØ± Ú©Ø±Ø¯Ù‡Ø› Path Ùˆ Practice ØªØ§ resolve Ø´Ø¯Ù† snapshotØŒ Loading Ù…ÛŒâ€ŒÙ…Ø§Ù†Ù†Ø¯ | Ø§ÛŒÙ† guard Ù…Ø§Ù†Ø¹ Ù†Ù…Ø§ÛŒØ´ Fresh/Locked Ø³Ø§Ø®ØªÚ¯ÛŒ Ø§Ø³ØªØŒ Ø§Ù…Ø§ local identity/progress Ù‡Ù†ÙˆØ² ØªÙˆÙ„ÛŒØ¯ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯ |
**3. ØªÙˆØµÛŒÙ‡Ù” Ù…Ù‡Ù†Ø¯Ø³ÛŒ ØºÛŒØ±Ù…ØµÙˆØ¨**
**Ú¯Ø²ÛŒÙ†Ù‡ A Ø¨Ø±Ø§ÛŒ release Ø§ÙˆÙ„ØŒ Ø¨Ø§ Ù‚Ø§Ø¨Ù„ÛŒØª Ù…Ù‡Ø§Ø¬Ø±Øª Ø¨Ù‡ B Ø§Ø² Ø·Ø±ÛŒÙ‚ Ø´Ù†Ø§Ø³Ù‡Ù” Ù¾Ø±ÙˆÙØ§ÛŒÙ„ Ø¯Ø± schema.**
- 1. ØªØµÙ…ÛŒÙ… ØµØ±ÛŒØ­ Ù…Ø­ØµÙˆÙ„ ADR-0039ØŒ local-only Ø§Ø³ØªØ› Ø­Ø³Ø§Ø¨ ÛŒØ§ Ø¨Ø§Ø²ÛŒØ§Ø¨ÛŒ Ø³Ø±ÙˆØ±ÛŒ Ø±Ø§Ù‡â€ŒØ­Ù„ Ù†ÛŒØ³Øª.
- 2. Ø³Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ø§ÙˆÙ„ÛŒÙ† Ø§Ø¬Ø±Ø§ Ø¨Ø±Ø§ÛŒ Ú©ÙˆØ¯Ú© Ùˆ ÙˆØ§Ù„Ø¯ Ù…Ù‡Ù…â€ŒØªØ± Ø§Ø² ÙˆØ±ÙˆØ¯ Ø²ÙˆØ¯Ù‡Ù†Ú¯Ø§Ù… Ø¨Ù‡ Ù…Ø¯ÛŒØ±ÛŒØª Ø®Ø§Ù†ÙˆØ§Ø¯Ù‡Ù” Ú†Ù†Ø¯Ù¾Ø±ÙˆÙØ§ÛŒÙ„ÛŒ Ø§Ø³Øª.
- 3. schema Ø¨Ø§ÛŒØ¯ Ø§Ø² Ø§Ø¨ØªØ¯Ø§ Ù‡Ø± Ø±Ø¯ÛŒÙ progress/session/attempt Ø±Ø§ Ø¨Ù‡ ÛŒÚ© `childProfileId` Ù¾Ø§ÛŒØ¯Ø§Ø± Ù†Ø³Ø¨Øª Ø¯Ù‡Ø¯Ø› Ø¯Ø± Ø¢ÛŒÙ†Ø¯Ù‡ Ù…ÛŒâ€ŒØªÙˆØ§Ù† Ú†Ù†Ø¯ Ø±Ø¯ÛŒÙ Ù¾Ø±ÙˆÙØ§ÛŒÙ„ Ø±Ø§ Ø¨Ø¯ÙˆÙ† Ø§Ù†ØªÙ‚Ø§Ù„ progress Ø§Ø² Ø´Ù†Ø§Ø³Ù‡â€ŒÙ‡Ø§ÛŒ Ù…Ø¨Ù‡Ù… ÙˆØ§Ø±Ø¯ Ú©Ø±Ø¯.

_منبع: `docs/architecture/OWNER_DECISION_BRIEF_O5_LOCAL_PROFILE_FA.md`_

## Ù…Ø±Ø² package Ùˆ module Ø¯Ø± SHOMARA

**Ù…Ø±Ø² package Ùˆ module Ø¯Ø± SHOMARA**
**ÙˆØ¶Ø¹ÛŒØª ÙØ¹Ù„ÛŒ TypeScript**
- - `contracts`: type/schema/policy Ù…Ø´ØªØ±Ú©Ø› Ø¨Ø¯ÙˆÙ† UIØŒ network client ÛŒØ§ secret.
- - `learning-runtime`: orchestration ÛŒØ§Ø¯Ú¯ÛŒØ±ÛŒØ› ØªØµÙ…ÛŒÙ… Ù†Ù‡Ø§ÛŒÛŒ Ø³Ø±ÙˆØ± Ø±Ø§ Ø¬Ø¹Ù„ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
- - `challenge-runtime`: Ù…Ù†Ø·Ù‚ challenge Ø¬Ø¯Ø§ Ø§Ø² mastery/station pass.
- - `assignment-runtime` Ùˆ `adult-projections`: Ø³Ø·Ø­ Ø¨Ø²Ø±Ú¯Ø³Ø§Ù„Ø› ÙˆØ§Ø±Ø¯ child UI Ù†Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.
- - `offline-sync`: queue/retry/idempotencyØ› Ø¨Ø¯ÙˆÙ† ÙˆØ§Ø¨Ø³ØªÚ¯ÛŒ Ø¨Ù‡ React/Expo.
- - `content-delivery`: manifest/asset deliveryØ› Ø¨Ø¯ÙˆÙ† ØªØµÙ…ÛŒÙ… correctness.
- - `design-system`: tokenØŒ Ø§Ø¹Ø¯Ø§Ø¯ ÙØ§Ø±Ø³ÛŒ Ùˆ primitiveÙ‡Ø§ÛŒ Ù…Ø³ØªÙ‚Ù„ Ø§Ø² feature.
- - `apps/mobile`: adapter Ùˆ UI legacyØ› source of truth Ø¯Ø§Ù…Ù†Ù‡ Ù†ÛŒØ³Øª.
- - `apps/web`: API/adult surfaceØ› Ø§Ø² internals Ú©Ù„Ø§ÛŒÙ†Øª import Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
**Ù‚ÙˆØ§Ø¹Ø¯ Native Ø§Ø² N02**
- feature:* -> core:model, core:designsystem, core:common
- feature:* -> domain use cases (public API only)
- data:*    -> core:network, core:database, core:datastore
- ui        -X-> network/database implementation
- feature:A -X-> feature:B implementation
- - DTOØŒ entity Ùˆ domain model Ø³Ù‡ Ù…ÙÙ‡ÙˆÙ… Ø¬Ø¯Ø§ Ù‡Ø³ØªÙ†Ø¯.
- - repository ØªÙ†Ù‡Ø§ Ù…Ø±Ø² Ù‡Ù…Ø§Ù‡Ù†Ú¯ÛŒ Ø¯Ø§Ø¯Ù‡ Ø§Ø³ØªØ› Ø¯Ø± Ù…Ø¯Ù„ Ø¢ÙÙ„Ø§ÛŒÙ† (ADR-0039) Ø¨ÛŒÙ† local (Room/DataStore) Ùˆ Ù¾Ú©ÛŒØ¬ Ù…Ø­ØªÙˆØ§ÛŒ bundle â€” Ø¨Ø¯ÙˆÙ† remote Ø¯Ø± Ù…Ø³ÛŒØ± Ú©ÙˆØ¯Ú©.
- - ViewModel state immutable Ùˆ eventÙ‡Ø§ explicit Ù‡Ø³ØªÙ†Ø¯.
- - navigation argument ÙÙ‚Ø· ID Ù¾Ø§ÛŒØ¯Ø§Ø± Ø§Ø³ØªØŒ Ù†Ù‡ object Ø¨Ø²Ø±Ú¯ ÛŒØ§ answer key.
- - tokenÙ‡Ø§ÛŒ Kotlin Ùˆ TypeScript Ø§Ø² ÛŒÚ© JSON canonical ØªÙˆÙ„ÛŒØ¯ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.
- - Ø´Ù†Ø§Ø³Ù‡Ù” Android Ø¯Ø± ADR-0036 Ø±ÙˆÛŒ `com.mathlearning.app` ØªØ«Ø¨ÛŒØª Ø´Ø¯ ØªØ§ Ù‡ÙˆÛŒØª Ù†ØµØ¨ ÙØ¹Ù„ÛŒ Ø­ÙØ¸ Ø´ÙˆØ¯Ø› namespace Ù…Ø§Ú˜ÙˆÙ„â€ŒÙ‡Ø§ Ø²ÛŒØ± `com.mathlearning.*` Ù‚Ø±Ø§Ø± Ù…ÛŒâ€ŒÚ¯ÛŒØ±Ø¯.
**Naming**
- - ÙØ§ÛŒÙ„ component/view Ø¨Ø§ PascalCaseØŒ utility Ø¨Ø§ camelCase Ùˆ test Ú©Ù†Ø§Ø± source.

_منبع: `docs/architecture/PACKAGE_BOUNDARIES_FA.md`_

## Ù†Ù‚Ø´Ù‡Ù” repository Ùˆ Ø·Ø¨Ù‚Ù‡â€ŒØ¨Ù†Ø¯ÛŒ Ù…Ø³ÛŒØ±Ù‡Ø§

**Ù†Ù‚Ø´Ù‡Ù” repository Ùˆ Ø·Ø¨Ù‚Ù‡â€ŒØ¨Ù†Ø¯ÛŒ Ù…Ø³ÛŒØ±Ù‡Ø§**
- Ø§ÛŒÙ† Ø³Ù†Ø¯ Ù…Ø±Ø²Ù‡Ø§ÛŒ Ø³Ø·Ø­ Ø¨Ø§Ù„Ø§ Ø±Ø§ ØªÙˆØ¶ÛŒØ­ Ù…ÛŒâ€ŒØ¯Ù‡Ø¯Ø› ÙˆØ¶Ø¹ÛŒØª Ù…Ø§Ø´ÛŒÙ†ÛŒ Ùˆ ØªØµÙ…ÛŒÙ… Ø­Ø°Ù Ø¯Ø± `harness/file-ledger.json` Ø§Ø³Øª.
- | Ù…Ø³ÛŒØ± | Ù†Ù‚Ø´ | ÙˆØ¶Ø¹ÛŒØª Ø¯Ø± Ù…Ù‡Ø§Ø¬Ø±Øª |
- | `apps/mobile` | Ú©Ù„Ø§ÛŒÙ†Øª Expo ÙØ¹Ù„ÛŒ Ùˆ baseline Ø±ÙØªØ§Ø±ÛŒ | `LEGACY_ACTIVE` ØªØ§ cutover |
- | `apps/web` | Web demoØŒ API Ùˆ Ø³Ø·Ø­ Ø¨Ø²Ø±Ú¯Ø³Ø§Ù„ | `ACTIVE` |
- | `apps/android` | Ù…Ù‚ØµØ¯ Android Native | Ø§Ø² N02 Ø§ÛŒØ¬Ø§Ø¯ Ù…ÛŒâ€ŒØ´ÙˆØ¯ |
- | `packages/contracts` | Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯Ù‡Ø§ÛŒ Ù…Ø´ØªØ±Ú© Ùˆ policy | `ACTIVE_PROTECTED` |
- | `packages/*-runtime` | Ù…Ù†Ø·Ù‚ Ø¯Ø§Ù…Ù†Ù‡ Ùˆ runtime | `ACTIVE_PROTECTED` |
- | `packages/design-system` | token source ÙØ¹Ù„ÛŒ | `ACTIVE_MIGRATION_SOURCE` |
- | `supabase` | migration Ùˆ backend schema | `ACTIVE_PROTECTED` |
- | `content` | dev content packs | `ACTIVE_RESTRICTED` |
- | `content-library` | originals Ù…Ø­Ø§ÙØ¸Øªâ€ŒØ´Ø¯Ù‡ØŒ index Ù…Ø´ØªÙ‚ Ùˆ integration gateØ› Ù†Ù‡ runtime | `DRAFT_RESTRICTED` |
- | `design` | Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ø¨Ø±Ù†Ø¯ØŒ ÙÛŒÙ„ØªØ± Ø§Ù„Ù‡Ø§Ù…ØŒ component readiness Ùˆ playbook Ø§Ø¬Ø±Ø§ÛŒ UI/UX | `ACTIVE_GUIDANCE` |
- | `skills` | Ú†Ù‡Ø§Ø± workflow Ù…Ø³ØªÙ‚Ù„ Ùˆ triggerÙ¾Ø°ÛŒØ± Ø¨Ø§ agent metadata | `CANONICAL_ACTIVE` |
- | `project-design-v2` | pipeline ÙØ¹Ø§Ù„ asset/character | `ACTIVE_GENERATOR` |
- | `docs/design-handoff-2026-10` | golden Ùˆ Ù…Ø±Ø¬Ø¹ V1 | `LEGACY_ACTIVE` ØªØ§ Ù…Ù‡Ø§Ø¬Ø±Øª verifier |
- | `docs/archive` | evidence ØªØ§Ø±ÛŒØ®ÛŒ | `HISTORICAL` |
- | `docs/history` | manifestÙ‡Ø§ÛŒ Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡ ØªÙˆØ³Ø· verifier | `LEGACY_ACTIVE` |
- | `scripts` | gateÙ‡Ø§ Ùˆ Ø§Ø¨Ø²Ø§Ø±Ù‡Ø§ÛŒ legacy | `ACTIVE_MIXED`Ø› Ù…Ø±Ø­Ù„Ù‡â€ŒØ§ÛŒ Ù…Ù‡Ø§Ø¬Ø±Øª Ø´ÙˆØ¯ |
- | `harness` + `tools/harness.mjs` | Ø§Ø¯Ø§Ù…Ù‡â€ŒÙ¾Ø°ÛŒØ±ÛŒ Ùˆ task graph | `CANONICAL_ACTIVE` |
**ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ canonical Ø±ÛŒØ´Ù‡**
- - `README.md`: Ù…Ø¹Ø±ÙÛŒ Ú©ÙˆØªØ§Ù‡.
- - `AGENTS.md`: Ù‚ÙˆØ§Ù†ÛŒÙ† Ù¾Ø§ÛŒØ¯Ø§Ø± Ø¹Ø§Ù…Ù„â€ŒÙ‡Ø§.
- - `START_HERE.md`: ÙˆØ¶Ø¹ÛŒØª Ø§Ù†Ø³Ø§Ù†ÛŒ Ø±ÙˆØ².

_منبع: `docs/architecture/REPOSITORY_MAP_FA.md`_

## SHOMARA â€” Deep Transformation Decision Register

**SHOMARA â€” Deep Transformation Decision Register**
- - ØªØ§Ø±ÛŒØ® Ù…Ø¨Ù†Ø§: 2026-11-17
- - Ø´Ø§Ø®Ù‡Ù” Ø§Ø¬Ø±Ø§: `work/shomara-deep-transformation`
- - Ù…Ø¨Ù†Ø§ÛŒ Ø«Ø§Ø¨Øª: `infra/p14b-home-ui@6cd0e7ac7e69d6d5a6117f38ccbcb9b2bc69eb8c`
- - ÙˆØ¶Ø¹ÛŒØª: **Ø¯Ø± Ø­Ø§Ù„ Ø§Ø¬Ø±Ø§Ø› Ø§ÛŒÙ† Ø³Ù†Ø¯ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† ADRÙ‡Ø§ÛŒ Ù…ØµÙˆØ¨ ÛŒØ§ ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú© Ù†ÛŒØ³Øª.**
- - Ù‚Ø§Ø¹Ø¯Ù‡: ÙˆØ¶Ø¹ÛŒØª `OPEN` ÙÙ‚Ø· Ø¨Ø§ ØªØµÙ…ÛŒÙ… ØµØ±ÛŒØ­ Ù…Ø§Ù„Ú© ØªØºÛŒÛŒØ± Ù…ÛŒâ€ŒÚ©Ù†Ø¯. ØªÙˆØµÛŒÙ‡Ù” ÙÙ†ÛŒØŒ ØªØµÙ…ÛŒÙ… Ù…ØµÙˆØ¨ Ù…Ø­Ø³ÙˆØ¨ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
**1. Ø®Ù„Ø§ØµÙ‡Ù” ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§**
- | Ø­ÙˆØ²Ù‡ | ÙˆØ¶Ø¹ÛŒØª | ØªØµÙ…ÛŒÙ… ÙØ¹Ù„ÛŒ |
- | Kotlin + Jetpack Compose / single activity | KEEP | Ù…Ø³ÛŒØ± Native Ø­ÙØ¸ Ø´ÙˆØ¯Ø› ØªØºÛŒÛŒØ± framework/replatform Ø¯Ø± Ø§ÛŒÙ† Ù…Ø£Ù…ÙˆØ±ÛŒØª Ù„Ø§Ø²Ù… Ù†ÛŒØ³Øª. |
- | Room Ø¨Ø±Ø§ÛŒ Ø¯Ø§Ø¯Ù‡Ù” Ø³Ø§Ø®ØªØ§Ø±ÛŒØ§ÙØªÙ‡ + DataStore Ø¨Ø±Ø§ÛŒ ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø³Ø¨Ú© | KEEP | Ø¨Ø§ O4 Ù…ØµÙˆØ¨ Ùˆ ADR-0042 Ù‡Ù…Ø³Ùˆ Ø§Ø³Øª. |
- | Ù…Ù†Ø¨Ø¹ Ø­Ù‚ÛŒÙ‚Øª ÛŒØ§Ø¯Ú¯ÛŒØ±ÛŒ Ø¢ÙÙ„Ø§ÛŒÙ†: Ù¾Ú©ÛŒØ¬ Ù†Ø³Ø®Ù‡â€ŒØ¯Ø§Ø± + evaluator Ù…Ø­Ù„ÛŒ | KEEP / OPEN | Ù…Ø±Ø² Ù…Ø¹Ù…Ø§Ø±ÛŒ Ø­ÙØ¸Ø› O1/O2 Ù‡Ù†ÙˆØ² ØªØµÙ…ÛŒÙ… Ù…Ø§Ù„Ú© Ù…ÛŒâ€ŒØ®ÙˆØ§Ù‡Ø¯ Ùˆ release package ÙˆØ§Ù‚Ø¹ÛŒ Ù…ÙˆØ¬ÙˆØ¯ Ù†ÛŒØ³Øª. |
- | Home: grade/chapter Ø«Ø§Ø¨Øª Ùˆ Ø´Ù…Ø§Ø±Ø´ ØµÙØ± | REVISE | Ø§Ø² Host Ø­Ø°Ù Ø´Ø¯Ø› Ø¨Ø¯ÙˆÙ† identity/progress ÙˆØ§Ù‚Ø¹ÛŒ Ù†Ø¨Ø§ÛŒØ¯ Ù†Ù…Ø§ÛŒØ´ Ø¯Ø§Ø¯Ù‡ Ø´ÙˆØ¯. |
- | Home: Continue Card Ø¯Ø± Ú©Ù†Ø§Ø± Current node | REVISE | Ø§Ø² Host Ø­Ø°Ù Ø´Ø¯Ø› Ù‡Ø± Ø¯Ùˆ ÛŒÚ© Station Start Sheet Ø±Ø§ Ø¨Ø§Ø² Ù…ÛŒâ€ŒÚ©Ø±Ø¯Ù†Ø¯ Ùˆ CTA ØªÚ©Ø±Ø§Ø±ÛŒ Ø¨ÙˆØ¯Ù†Ø¯. |
- | Ú¯Ø±Ø§Ù Ù…Ø³ÛŒØ± Ùˆ Station Start Sheet | KEEP | Ú¯Ø±Ø§Ù/Ù‚ÙÙ„/Ø¨Ø±Ú¯Ù‡Ù” Ø´Ø±ÙˆØ¹ Ø­ÙØ¸ Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯Ø› Ù…Ø³ÛŒØ± Ø§ØµÙ„ÛŒ Home Ø§Ø³Øª. |
- | Ø«Ø¨Øª Lesson Attempt Ø¯Ø± Room | REVISE â†’ IMPLEMENTED, UNVERIFIED | Ø§Ú©Ù†ÙˆÙ† session + attempt Ø¯Ø± ÛŒÚ© transaction Ùˆ Ø¨Ø§ idempotency Ø§ØªÙ…ÛŒÚ© Ø«Ø¨Øª Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯Ø› ØªØ³Øª Ø¬Ø¯ÛŒØ¯ Ù†ÙˆØ´ØªÙ‡ Ø´Ø¯Ù‡ ÙˆÙ„ÛŒ Ù‡Ù†ÙˆØ² Ø§Ø¬Ø±Ø§ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª. |
- | ØªØ²Ø±ÛŒÙ‚ LessonRecordRepository Ø¯Ø± composition root | REVISE â†’ IMPLEMENTED, UNVERIFIED | Ø§Ø² container ÙˆØ§Ù‚Ø¹ÛŒ Ø¨Ù‡ `MainActivity â†’ ShomaraApp â†’ LessonHost` ØªØ²Ø±ÛŒÙ‚ Ø´Ø¯Ø› compile/device Ù‡Ù†ÙˆØ² ØªØ£ÛŒÛŒØ¯ Ù†Ø´Ø¯Ù‡. |
- | Ù…Ø­ØµÙˆÙ„ Ú©Ø§Ù…Ù„Ø§Ù‹ Ø¢ÙÙ„Ø§ÛŒÙ† / no server | KEEP (OWNER-APPROVED, ADR-0039) | ØªØµÙ…ÛŒÙ… 2026-11-05: Ù…Ø­ØªÙˆØ§ÛŒ bundle + evaluator Ù…Ø­Ù„ÛŒ + Ù¾Ø±ÙˆÙØ§ÛŒÙ„ Ù…Ø­Ù„ÛŒØ› Phone/OTP Ø¯Ø± Ù…Ø­ØµÙˆÙ„ Ù†Ù‡Ø§ÛŒÛŒ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯ Ùˆ Ø¯Ø± Phase 2 Ù¾Ø³ Ø§Ø² O5 Ø­Ø°Ù Ù…ÛŒâ€ŒØ´ÙˆØ¯. |
- | O1 evaluator / O2 package schema / O3 LessonGateway | OPEN | ØªØµÙ…ÛŒÙ… ÛŒØ§ ØªØ£ÛŒÛŒØ¯ Ù‚Ø¨Ù„ÛŒ Ù…Ø§Ù„Ú© Ù„Ø§Ø²Ù… Ø§Ø³ØªØ› UI Ø­Ù‚ Ø¯ÙˆØ± Ø²Ø¯Ù† Ø¢Ù† Ø±Ø§ Ù†Ø¯Ø§Ø±Ø¯. |
- | O5 local identity / single vs multi profile | OPEN | ØªØ§ ØªØ¹ÛŒÛŒÙ† identity Ù†Ù…ÛŒâ€ŒØªÙˆØ§Ù† ProgressRepository Ø±Ø§ Ø¨Ù‡ Home ÙˆØµÙ„ Ú©Ø±Ø¯ ÛŒØ§ Ø§Ø² token Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† identity Ø§Ø³ØªÙØ§Ø¯Ù‡ Ú©Ø±Ø¯. |
- | O6 CMS/backend | OPEN | retirement/retain Ø¨Ø¯ÙˆÙ† Ø±Ø£ÛŒ Ù…Ø§Ù„Ú© Ù…Ù…Ù†ÙˆØ¹ Ø§Ø³Øª. |
- | O7 package/media budget | OPEN | Ø³Ù‚Ù Ù†Ù‡Ø§ÛŒÛŒ Ø¨Ø¯ÙˆÙ† Ø§Ù†Ø¯Ø§Ø²Ù‡â€ŒÚ¯ÛŒØ±ÛŒ assetÙ‡Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ø¬Ø¹Ù„ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯. |
- | Ù…Ø­ØªÙˆØ§ÛŒ Û²Û´ Ø§ÛŒØ³ØªÚ¯Ø§Ù‡ + media Ø§Ù†Ø³Ø§Ù†ÛŒ/Ø¯Ø§Ø±Ø§ÛŒ Ø­Ù‚ | BLOCKED_EXTERNAL | ØªØ£Ù„ÛŒÙØŒ ØµÙˆØª/ØªØµÙˆÛŒØ± ÙˆØ§Ù‚Ø¹ÛŒØŒ Ø­Ù‚ÙˆÙ‚ Ùˆ Ø¨Ø§Ø²Ø¨ÛŒÙ†ÛŒ Ø§Ù†Ø³Ø§Ù†ÛŒ Ø®Ø§Ø±Ø¬ Ø§Ø² ØªÙˆØ§Ù† ØªØºÛŒÛŒØ± Ú©Ø¯ Ø®ÙˆØ¯Ú©Ø§Ø± Ø§Ø³Øª. |
- | Ø­Ø°Ù V1/Expo Ùˆ verifierÙ‡Ø§ÛŒ legacy | DEFERRED | ÙÙ‚Ø· Ø¨Ø¹Ø¯ Ø§Ø² parity route-by-route Ùˆ Ø§Ø«Ø¨Ø§Øª consumer-free. |
- | HomePathScreen / HomeUiState Ù…ÙˆØ§Ø²ÛŒ | OPEN | Ø§Ø³ØªÙØ§Ø¯Ù‡Ù” Ø²Ù†Ø¯Ù‡Ù” Ø¢Ù†â€ŒÙ‡Ø§ Ø¨Ø§ÛŒØ¯ Ø¨Ø§ reference scan Ú©Ø§Ù…Ù„ Ø§Ø«Ø¨Ø§Øª Ø´ÙˆØ¯Ø› Ø­Ø°Ù Ø¹Ø¬ÙˆÙ„Ø§Ù†Ù‡ Ù…Ù…Ù†ÙˆØ¹. |

_منبع: `docs/architecture/SHOMARA_DEEP_TRANSFORMATION_DECISIONS_FA.md`_

## Adult Surface

**Adult Surface**
**Status**
- Current supporting adult-surface contract; child onboarding authentication remains phone OTP only.
**Purpose**
- The adult surface exists to help a parent understand and support learning. It is not a second learner dashboard.
**Child shell rule**
- The child product exposes exactly three primary destinations: Ù…Ø³ÛŒØ± / ØªÙ…Ø±ÛŒÙ† / Ù…Ù†.
- Teacher login, teacher portal, assignments, leaderboard, friends, and learning currencies do not appear in the child shell.
**Parent report sections**
- 2. Current progress
- 3. Skills needing attention / building / strength
- 4. Recent learning
- 5. One simple activity for home
**Deliberate removals**
- The parent report does not expose teacher workflows, assignment management, ranking, social feed, or controls that directly change learning truth.
**Authorization**
- Parent access is a UX boundary, not a second authentication mechanism in the child onboarding flow. Server endpoints must authorize the parent account and child relationship independently.
**Settings**
- Settings are child-secondary and contain only learning and accessibility preferences. Account/teacher/subscription/product-management surfaces are not mixed into the child Settings page.
**Teacher**
- Teacher authentication and teacher workflow are not part of the child product or the current parent report. Existing teacher APIs are preserved for a possible separate Teacher product.

_منبع: `docs/reference/ADULT_SURFACE.md`_

## Child Product Surface

**Child Product Surface**
**Status:** Current supporting contract
**Date:** 2026-10-03
**Scope:** learner-facing Web + Mobile UI
**Product rule**
- The child experience should answer three questions immediately:
- 1. Where do I learn next? â†’ **Ù…Ø³ÛŒØ±**
- 2. Where do I practise? â†’ **ØªÙ…Ø±ÛŒÙ†**
- 3. What have I earned and who am I? â†’ **Ù…Ù†**
- Primary navigation is intentionally limited to three destinations.
- | Primary destination | Purpose | Active screens |
- | Ù…Ø³ÛŒØ± | guided learning path, unit, station and lesson | S07â€“S13 |
- | ØªÙ…Ø±ÛŒÙ† | short repeatable practice grounded in the path | S14 |
- | Ù…Ù† | identity, real progress, achievements, appearance, settings and parent access | S17â€“S21 |
**Profile surface**
- Profile is a compact identity surface with exactly four groups:
- - Identity: avatar, name, grade.
- - Progress: completed stations and unlocked achievements.
- - Achievements: the current five-item milestone baseline; the authoritative achievement registry expands in roadmap P07.
- - Actions: `ØªØºÛŒÛŒØ± Ø¸Ø§Ù‡Ø±`, `ØªÙ†Ø¸ÛŒÙ…Ø§Øª` and protected `ÙˆØ§Ù„Ø¯ÛŒÙ†`.
- Achievement detail (S18) is secondary and uses a dialog/sheet from Profile. Appearance (S20) is a secondary child route entered from Profile.
**Secondary / embedded learning surfaces**
- - **Ø¯Ø³ØªØ§ÙˆØ±Ø¯Ù‡Ø§ (S17)** stays on Profile; it is not a primary tab.
- - **Ø¯Ø³ØªØ§ÙˆØ±Ø¯ Ø¬Ø²Ø¦ÛŒØ§Øª (S18)** is a secondary detail dialog/sheet.
- - **Ù…Ù‡Ø§Ø±Øªâ€ŒÙ‡Ø§ (S15)** is learning evidence, not a separate navigation destination.
- - **Ù…Ø±ÙˆØ± Ù…ÙÙ‡ÙˆÙ…ÛŒ (S16)** belongs inside learning/practice context, not a parallel curriculum.
- - **ØªÙ†Ø¸ÛŒÙ…Ø§Øª (S21)** is a secondary child surface. **ÙˆØ§Ù„Ø¯ÛŒÙ†** remains outside the child screen taxonomy and stays behind an adult gate.
**Removed from the child product shell**
- These must not create learner-facing navigation entries:
- - Teacher login / teacher portal
- - Leaderboards / leagues / rankings
- - School assignments
- - Friends feed / social gallery
- - Companion gallery
- - Animation lab / developer demos
- - Persistent streak, XP, gems or daily-goal widgets
- - Spendable reward currency
- - Standalone Treasure/Backpack surface
- Backend services for adult/teacher workflows may remain. Their existence must never create a child-visible entry.
**Achievements**
- Achievements are meaningful learning milestones. The current Profile implementation exposes a five-item baseline. Roadmap P07 will replace this limited registry with the authoritative achievement registry while preserving Profile as the primary collection surface.
- | ID | Title | Unlocks when |
- | A01 | Ø´Ù…Ø§Ø±Ø´â€ŒÚ¯Ø± | ST01 complete |
- | A02 | Ø¬Ù‡Øªâ€ŒÛŒØ§Ø¨ | ST02 complete |
- | A03 | Ø¹Ø¯Ø¯Ø³Ø§Ø² | ST03 complete |
- | A04 | Ø´Ú©Ù„â€ŒØ´Ù†Ø§Ø³ | ST04 complete |
- | A05 | Ø­Ø³Ø§Ø¨Ú¯Ø± | ST05 complete |
- No XP, gems, streak, league, rank, mastery tier, or fabricated percentage is displayed.
**Avatar**
- S20 is a secondary route from Profile. It intentionally stays small:
- `Preview â†’ choose preset â†’ save / cancel`
- Avatar identity is separate from the Companion cast.
**Station naming / header**
- Learner-facing names are fixed:
- | ID | Name |
- | ST01 | Ø´Ù…Ø§Ø±Ø´ Ùˆ Ø§Ù„Ú¯Ùˆ |
- | ST02 | Ø¬Ø§ÛŒÚ¯Ø§Ù‡ Ùˆ Ø¬Ù‡Øª |
- | ST03 | Ø¹Ø¯Ø¯ Ùˆ Ø¬Ù…Ø¹ |
- | ST04 | Ø´Ú©Ù„â€ŒÙ‡Ø§ Ùˆ ÙˆÛŒÚ˜Ú¯ÛŒâ€ŒÙ‡Ø§ |
- | ST05 | Ø¬Ù…Ø¹ Ùˆ ØªÙØ±ÛŒÙ‚ |

_منبع: `docs/reference/CHILD_PRODUCT_SURFACE.md`_

## Current Dependency & Architecture Matrix

**Current Dependency & Architecture Matrix**
**Status:** Current supporting reference
**Authority:** `ROADMAP_PHASES.md` for execution order; ADR/contracts for locked architecture.
- | Area | Current decision | Verification/source |
- | Backend | Modular monolith with Supabase/PostgreSQL boundary | ADR-0003 + current code/migrations |
- | Web | Next.js + React + TypeScript; secondary validation surface | workspace manifests + current routes |
- | Mobile | React Native + Expo + Expo Router + TypeScript; Android-first | mobile manifest + Expo config |
- | Animation | Rive for production character motion where approved; Reanimated for UI motion | ADR-0002 + animation runtime source spec |
- | Database | PostgreSQL via Supabase migrations | `supabase/migrations/` |
- | Auth | Supabase Auth with production phone OTP onboarding | onboarding contract + auth runtime |
- | Content delivery | Manifest + versioned package + checksum + CURRENT/NEXT/RECENT/FUTURE cache policy | content contract + content-delivery package |
- | Learning truth | Server-authoritative Learning Runtime | ADR-0003 + learning-runtime package + migrations |
- | Assignments | Adult/teacher projection and assignment services remain outside the child shell | adult/assignment contracts + server routes |
- | Offline sync | At-least-once client queue with idempotent server handling; no second learning authority | offline-sync package + offline API contract |
- | Cache authority | Local cache state is disposable; entitlement/content access remains server-authoritative | content contract + mobile content manager |
- | Performance | 60 FPS target for standard child interactions; low-end Android profiling required before pilot | animation runtime + release QA |
- | Accessibility | RTL-first, explicit reduced-motion support, large-text/device QA, non-color-only state communication | design system + onboarding/path contracts |
- | Engine boundary | No Unity/Unreal/Godot; reusable React Native/Web game templates on top of Learning Runtime | ADR-0001 + game/engagement source |
**Rule**
- Do not add a dependency because a benchmark product uses it. Add it only when the product requirement, current platform constraints, and maintenance cost are documented in the active roadmap/ADR/contract set.

_منبع: `docs/reference/DEPENDENCY_MATRIX.md`_

## Ø´Ù…Ø§Ø±Ø§ â€” Design System Reference

**Ø´Ù…Ø§Ø±Ø§ â€” Design System Reference**
- Ø§ÛŒÙ† ÙØ§ÛŒÙ„ Ù…Ø±Ø¬Ø¹ Ø§Ù†Ø³Ø§Ù†ÛŒ Design System Ø§Ø³Øª. Ù…Ù†Ø¨Ø¹ Ø§Ø¬Ø±Ø§ÛŒÛŒ tokenÙ‡Ø§ Ø¯Ø± `packages/design-system/src/tokens.json` Ù‚Ø±Ø§Ø± Ø¯Ø§Ø±Ø¯.
**Repository layout**
- packages/design-system/
- src/tokens.json              # Source of truth
- src/index.ts                 # Typed exports + legacy bridge
- apps/web/app/design-tokens.generated.css
**Generated Web CSS variables â€” do not edit directly**
- apps/web/components/ui/
**Web primitives**
- apps/mobile/src/ui/design-system/
**Native adapter + primitives**
- docs/reference/DESIGN_SYSTEM.md
**Human-readable contract**
**Non-negotiable rules**
- - New colors, spacing, radii, sizes and type scales MUST come from Design System tokens.
- - Child-facing UI remains Persian-first and RTL.
- - Vazirmatn is the product UI font.
- - Interactive controls target at least 48px/dp.
- - Amber is used for reward/secondary emphasis; error semantics use explicit error tokens and text, not color alone.
- - Reduced motion follows both OS preference and explicit app setting.
- - Existing legacy aliases in `apps/web/app/globals.css` are migration-only.
**Change process**
- 1. Change `packages/design-system/src/tokens.json`.
- 2. Run `npm run design-system:generate`.
- 3. Run `npm run verify:uiux:p3`.
- 4. Update component consumers and evidence documents in the same change.

_منبع: `docs/reference/DESIGN_SYSTEM.md`_

## Lesson Player Contract

**Lesson Player Contract**
- Ø§ÛŒÙ† Ø³Ù†Ø¯ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ø§Ø¬Ø±Ø§ÛŒÛŒ ØªØ¬Ø±Ø¨Ù‡ Ø¯Ø±Ø³ Ø¨Ø±Ø§ÛŒ Web Ùˆ Mobile Ø§Ø³Øª.
**Ø§ØµÙˆÙ„**
- - Ù¾Ø§Ø³Ø® Ø¢Ù…ÙˆØ²Ø´ÛŒ ÙÙ‚Ø· Ø¨Ø§ Ù†ØªÛŒØ¬Ù‡ server-authoritative Ù…Ø¹ØªØ¨Ø± Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- - Ø¯Ø± assessment Ø´Ø®ØµÛŒØª companion Ù†Ù…Ø§ÛŒØ´ Ø¯Ø§Ø¯Ù‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
- - feedback Ø¨Ø§ÛŒØ¯ ÛŒÚ© action Ø§ØµÙ„ÛŒ Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´Ø¯.
- - Ø®Ø·Ø§ÛŒ Ø´Ø¨Ú©Ù‡ Ù†Ø¨Ø§ÛŒØ¯ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù…ÙˆÙÙ‚ÛŒØª Ø¢Ù…ÙˆØ²Ø´ÛŒ Ù†Ù…Ø§ÛŒØ´ Ø¯Ø§Ø¯Ù‡ Ø´ÙˆØ¯.
- - Ø®Ø±ÙˆØ¬ Ø§Ø² Ø¯Ø±Ø³ Ø¯Ø± Ù…ÛŒØ§Ù†Ù‡ Ù…Ø³ÛŒØ± Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ ØªØ£ÛŒÛŒØ¯ Ø§Ø³Øª.
- - progress ØµØ±ÙØ§Ù‹ ÙˆØ¶Ø¹ÛŒØª journey Ø±Ø§ Ù†Ø´Ø§Ù† Ù…ÛŒâ€ŒØ¯Ù‡Ø¯ Ùˆ Ù…Ø¹Ø§Ø¯Ù„ mastery Ù†ÛŒØ³Øª.
- - recovery Ùˆ recheck stateÙ‡Ø§ÛŒ Ù…Ø³ØªÙ‚Ù„ Ù‡Ø³ØªÙ†Ø¯.
**States**
- `ENTRY â†’ TEACH â†’ PRACTICE â†’ ASSESSMENT â†’ RECOVERY/RECHECK â†’ RESULT â†’ COMPLETE`
**Shared source**
- - `packages/contracts/src/lesson.ts`
- - Web: `LessonPlayerHeader`, `LessonFeedback`
- - Mobile: `LessonPlayerChrome`, `LessonFeedbackCard`

_منبع: `docs/reference/LESSON_PLAYER_CONTRACT.md`_

## Mobile Local State Contract

**Mobile Local State Contract**
- The Android app stores a device-local projection for onboarding, resume, avatar and UI preferences.
**Schema**
- `apps/mobile/src/state/appStateCore.ts` is the source of truth. The current local schema is `3`.
- Schema 3 adds:
- preferences.sound
- preferences.motion
- preferences.largeText
- When a schema 1/2 file is read, missing preferences migrate in memory to the safe defaults:
- - motion: on
- - large text: off
- The app then persists the next state write at schema 3.
**Security boundary**
- Authentication tokens are not stored in this document. Access tokens are persisted with Expo SecureStore. Learning truth, station pass and Jump authorization remain server-authoritative; the local document is only a UI/progress projection.
**Recovery**
- Unknown future schema versions are preserved as a backup and put through the recovery/first-run path. Corrupt documents are also backed up before reset.

_منبع: `docs/reference/MOBILE_LOCAL_STATE.md`_

## Onboarding Contract â€” S01â€“S07

**Onboarding Contract â€” S01â€“S07**
**Canonical sequence**
- `S01 Welcome â†’ S02 Phone â†’ S03 OTP â†’ S04 Grade â†’ S05 Child Profile â†’ S06 Optional Placement â†’ S07 Path`
- Phone OTP is the only authentication method in the current mobile-first release. There is no separate parent/adult authentication gate in onboarding.
- The placement result is a starting-point suggestion only. It does not grant stars, mastery, or other rewards.
**Data boundary**
- No child profile field is durably persisted before phone verification and completion of onboarding. The short-lived form/session state may remain in memory or session scope only. `consentAt` is retained for compatibility as a timestamp for onboarding terms acceptance; it is not evidence of parent authentication.
**Authentication truth**
- Phone OTP is provider-backed. The UI must never accept a locally invented OTP or report success when the provider is unavailable. Guest, Google, and email are not part of the current onboarding UI.
**Grade truth**
- The onboarding catalog currently exposes only grades with published content in the staged environment. At the current baseline that is G1. Future grade selection is visibly unavailable rather than navigable to empty content.
**Avatar truth**
- The child avatar is an identity preset owned by the child profile. It is not a companion character. Companion characters (Aria, Qbo, Dana, Jiko) remain contextual learning guides.
**Accessibility**
- RTL is mandatory. Phone/OTP fields are LTR. Primary actions are at least 52dp/56px depending on platform. Selected state is not communicated by color alone. Reduced motion must not block access to any action.
**Required states**
- `default, loading, invalid, provider unavailable, expired OTP, rate limit, offline, retry, empty, save failure, returning, recover`

_منبع: `docs/reference/ONBOARDING_CONTRACT.md`_

## Package Delivery Standard

**Package Delivery Standard**
- Every project handoff is a **complete snapshot**, not a delta-only patch.
- Each snapshot must include:
- 1. All implementation files accumulated so far.
- 2. All source/design/spec MD files already accepted into the project.
- 3. All migrations and seeds accumulated so far.
- 4. All shared contracts and API client code.
- 5. All new files from the current phase.
- 6. Verification scripts/tests for completed phases.
- 7. A phase revision note.
- 8. A snapshot manifest stating what was included and what was not runtime-verified.
- A later snapshot supersedes the previous snapshot as the working handoff, but previous ZIPs remain useful historical checkpoints.

_منبع: `docs/reference/PACKAGE_DELIVERY_STANDARD.md`_

## Path 2.1 Visual Rules

**Path 2.1 Visual Rules**
**Status:** Canonical
**Scope:** Learner-facing Path on Web + Mobile
**Visual hierarchy**
- The Path is the primary learning surface. It is one continuous scroll, grouped into Units, with a single current position.
**Unit header**
- - `ÙˆØ§Ø­Ø¯ N`
- - short Unit title
- - completed/total count
- Do not place long learning objectives or explanatory paragraphs in the header.
**Station node kinds**
- The station identity is communicated by the icon shape, while status is communicated by state treatment.
- | Kind | Meaning | Icon treatment |
- | LESSON | core learning step | book |
- | PRACTICE | repeatable practice | sparkles |
- | CHALLENGE | unit-end challenge | trophy |
- | REVIEW | review step | refresh |
- State wins over kind for the semantic status: completed = check, locked = lock, not-downloaded = download, sync-pending = sync.
**Path geometry**
- Station rows alternate right/left through the whole 25-station path. Connectors are diagonal/curved and there is no central vertical spine.
**Jump**
- Jump appears at a Unit boundary, not between arbitrary stations. It opens a five-question assessment. The server scores it. Four correct answers are required to open the target Unit's first station. Failed assessment returns the learner to the Path.
- Successful jump does not mark skipped stations complete. Skipped stations remain revisit-able.
**Primary actions**
- Only the current station gets an inline `Ø§Ø¯Ø§Ù…Ù‡ Ø¨Ø¯Ù‡` action. Other accessible stations are opened directly; locked stations explain the prerequisite without exposing technical identifiers.
**Responsive rule**
- The same semantic Path is rendered on Web and Mobile. Layout may change, but order, statuses, Unit grouping, Jump rules, and station titles do not.

_منبع: `docs/reference/PATH_2_1_VISUAL_RULES.md`_

## Path 2.1 Contract

**Path 2.1 Contract**
- Date: 2026-10-03
- Status: Frozen current path contract
**Child navigation**
- Primary destinations are exactly:
- 2. ØªÙ…Ø±ÛŒÙ†
- No teacher, social, currency, shop, leaderboard, or backpack surfaces may appear in the child shell.
**Continuous path**
- - The Grade 1 path contains 25 learner stations grouped into 5 units.
- - Units are rendered in one continuously scrollable surface.
- - Station nodes alternate left/right across the complete 25-station sequence (the alternation does not reset at a unit boundary).
- - A unit header is the visual anchor for each five-station group.
- - A checkpoint appears between units.
- - Current, completed, available, locked, not-downloaded, and sync-pending states are distinct.
- - A skipped station remains revisit-able after a successful jump.
- - Completing a jump target moves the learner cursor forward; skipped earlier stations remain available for review.
**Jump**
- - Jump is offered at a unit boundary after the previous unit is completed.
- - Every jump is a distinct 5-question assessment.
- - Passing requires at least 4/5.
- - The client does not contain the answer key.
- - Server validation is authoritative.
- - Passing opens only the first station of the next unit.
- - Failing does not change learning progress and returns the learner to the path.
- - Jump has no XP/gems/streak currency reward.
**Station presentation**
- Stations also have a visual kind contract exported from `packages/contracts/src/path2.ts`; Web and Mobile use the same mapping for lesson, practice, review and challenge node iconography.
- Header is intentionally compact:
- Ø§ÛŒØ³ØªÚ¯Ø§Ù‡ {number}
- {station.title}
- {minutes} Ø¯Ù‚ÛŒÙ‚Ù‡
- Long explanatory copy belongs inside the lesson, not in navigation chrome.
**Login / entry**
- - The child-facing shell does not expose teacher login.
- - Login presents only working authentication methods.
- - Disabled providers are not rendered as interactive choices.
- - Technical screen IDs are never visible to the learner.
- - Guest entry, when present, is tertiary and still uses the adult gate.
**Profile / settings**
- `Ù…Ù†` contains identity, real progress, achievements, appearance, settings, and adult access. Settings is secondary, not a primary tab.
- Current child settings are limited to sound, motion, and text size; future notification controls must not be rendered until they are implemented.
**Visual direction**
- The product uses a Persian-first neutral canvas with a green primary identity and semantic secondary accents. The palette is owned by `packages/design-system/src/tokens.json`; screen-specific hardcoded brand colors are prohibited.

_منبع: `docs/reference/PATH_2_CONTRACT.md`_

## Practice Hub Contract

**Practice Hub Contract**
**Purpose**
- Practice is a supporting learning surface, not a second progression system.
**Canonical visible surface**
- - S14 â€” Practice / short games
- Skills (S15) and concept review (S16) remain curriculum data and may be rendered inside learning/progress experiences later. They are not primary child navigation surfaces in the current product shell.
**Visible layout**
- 1. One recommended practice action.
- 2. A small list of short games.
- 3. One secondary action back to Path.
**Rules**
- 1. Practice may expose opportunities already grounded in the current curriculum/path.
- 2. Practice must not unlock or bypass locked stations.
- 3. Practice must not infer mastery, percentages, streaks, or rewards from local UI state.
- 4. Practice must not create a second navigation hierarchy for skills/concepts.
- 5. Interactive controls use shared Design System touch targets.
- 6. Web and Mobile consume the same contract.
**Path grounding**
- `canOpenPracticeStation()` allows:
- - stations already completed;
- - the first uncompleted station.
- Everything later in the sequence returns the learner to Path. This is a UX guard, not a security boundary; authoritative learning remains server-side.

_منبع: `docs/reference/PRACTICE_HUB_CONTRACT.md`_

## Profile / Achievement / Avatar Contract

**Profile / Achievement / Avatar Contract**
**Status:** Current supporting contract
**Date:** 2026-10-03
**Scope:** learner-facing Web + Mobile
**Profile hierarchy**
- `Ù…Ù†` is the identity and progress surface. It contains exactly four visual groups:
- 1. Identity â€” avatar, name, grade.
- 2. Progress â€” completed stations and unlocked achievements.
- 3. Achievements â€” the current five-item milestone baseline; the authoritative achievement registry expands in roadmap P07.
- 4. Actions â€” `ØªØºÛŒÛŒØ± Ø¸Ø§Ù‡Ø±` and protected `ÙˆØ§Ù„Ø¯ÛŒÙ†`.
- No teacher, social, companion, currency, league, assignment, or developer surface belongs here.
**Achievements**
- Achievements are milestone trophies earned from completed learning stations. They remain on Profile rather than becoming a primary navigation destination. Each item can open a secondary detail sheet/dialog (S18) without introducing a new navigation branch.
- | ID | Title | Station | Icon |
- | A01 | Ø´Ù…Ø§Ø±Ø´â€ŒÚ¯Ø± | ST01 | count |
- | A02 | Ø¬Ù‡Øªâ€ŒÛŒØ§Ø¨ | ST02 | direction |
- | A03 | Ø¹Ø¯Ø¯Ø³Ø§Ø² | ST03 | number |
- | A04 | Ø´Ú©Ù„â€ŒØ´Ù†Ø§Ø³ | ST04 | shape |
- | A05 | Ø­Ø³Ø§Ø¨Ú¯Ø± | ST05 | calculation |
- The UI does not invent XP, gems, streaks, leagues, ranking, tiers, or percentage mastery.
**Avatar Workshop**
- S20 is a secondary child route entered from Profile. It is intentionally small:
- `Preview â†’ choose preset â†’ save / cancel`
- The current implementation provides four canonical presets. Selection is a child profile projection and does not change learning truth.
**Visual direction**
- The design borrows broad principles from Duolingo's documented product craft work: consistent headers, a small intentional type hierarchy, purposeful whitespace, simplified navigation, and achievement collections presented as milestone rewards on the learner profile. It does **not** reuse Duolingo's branded artwork, copy, or proprietary assets.

_منبع: `docs/reference/PROFILE_ACHIEVEMENT_AVATAR_CONTRACT.md`_

## Progression Contract

**Progression Contract**
- Ø§ÛŒÙ† ÙØ§ÛŒÙ„ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ø§Ø¬Ø±Ø§ÛŒÛŒ ØªØ¬Ø±Ø¨Ù‡ `Path â†’ Unit â†’ Station Start â†’ Station` Ø§Ø³Øª. Ù…Ù†Ø¨Ø¹ executable Ø¢Ù† `packages/contracts/src/progression.ts` Ø§Ø³Øª.
**Status semantics**
- | ÙˆØ¶Ø¹ÛŒØª | Ù…Ø¹Ù†ÛŒ |
- | COMPLETED | Ø§ÛŒØ³ØªÚ¯Ø§Ù‡ Ø·Ø¨Ù‚ truth Ù…Ø¹ØªØ¨Ø± Ú©Ø§Ù…Ù„ Ø´Ø¯Ù‡ Ø§Ø³Øª. |
- | CURRENT | Ù‚Ø¯Ù… Ø§ØµÙ„ÛŒ ÙØ¹Ù„ÛŒ Ú©ÙˆØ¯Ú© Ø§Ø³Øª. |
- | AVAILABLE | Ø¯Ø± ØµÙˆØ±Øª ÙˆØ¬ÙˆØ¯ Ù…Ø­ØªÙˆØ§ Ø¢Ù…Ø§Ø¯Ù‡ Ø´Ø±ÙˆØ¹ Ø§Ø³Øª. |
- | LOCKED | Ù¾ÛŒØ´â€ŒÙ†ÛŒØ§Ø² ÛŒØ§Ø¯Ú¯ÛŒØ±ÛŒ Ú©Ø§Ù…Ù„ Ù†Ø´Ø¯Ù‡Ø› Ø¨Ø§ Ø¯Ø§Ù†Ù„ÙˆØ¯ Ø§Ø´ØªØ¨Ø§Ù‡ Ù†Ø´ÙˆØ¯. |
- | NOT_DOWNLOADED | Ù¾ÛŒØ´â€ŒÙ†ÛŒØ§Ø² Ø¨Ø§Ø² Ø§Ø³Øª Ø§Ù…Ø§ Ø¨Ø³ØªÙ‡ Ù…Ø­ØªÙˆØ§ Ø±ÙˆÛŒ Ø¯Ø³ØªÚ¯Ø§Ù‡ Ø¢Ù…Ø§Ø¯Ù‡ Ù†ÛŒØ³Øª. |
- | SYNC_PENDING | Ù†ØªÛŒØ¬Ù‡ Ù…Ø­Ù„ÛŒ Ù‡Ù†ÙˆØ² authoritative sync Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª. |
- `LOCKED`, `NOT_DOWNLOADED` Ùˆ `SYNC_PENDING` ÙÙ‚Ø· Ø¨Ø§ ØªØºÛŒÛŒØ± Ø±Ù†Ú¯ Ù†Ù…Ø§ÛŒØ´ Ø¯Ø§Ø¯Ù‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯Ø› Ù…ØªÙ† ÙˆØ¶Ø¹ÛŒØª Ø¨Ø§ÛŒØ¯ Ù‡Ù…Ø±Ø§Ù‡ Ø¢Ù†Ù‡Ø§ ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´Ø¯.
**Canonical flow**
- `S07 Path â†’ S08 Unit â†’ S09 Station Start â†’ S10 Lesson`
- Ù¾Ø±Ø´ Ø§Ø² S08/S07 ÙÙ‚Ø· Ø¨Ù‡ S13 Ù…ÛŒâ€ŒØ±ÙˆØ¯ Ùˆ Ø®ÙˆØ¯Ø´ Ù‡ÛŒÚ† unlock Ø¬Ø¹Ù„ÛŒ Ø§Ù†Ø¬Ø§Ù… Ù†Ù…ÛŒâ€ŒØ¯Ù‡Ø¯. ØªØµÙ…ÛŒÙ… Ø¨Ø§Ø²Ø´Ø¯Ù† Ø¨Ø§ÛŒØ¯ Ø§Ø² learning runtime Ù…Ø¹ØªØ¨Ø± Ø¨ÛŒØ§ÛŒØ¯.

_منبع: `docs/reference/PROGRESSION_CONTRACT.md`_

