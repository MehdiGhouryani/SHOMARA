# API Surface Registry (Mobile ↔ Backend)

**Phase:** B1 (draft, living document)  
**Date:** 2026-10-06  
**Rule:** Mobile learning path must only call routes listed here (or Supabase RPC equivalents documented below).

Client entrypoint: `apps/mobile/src/station/runtimeApi.ts`  
Contracts: `packages/contracts`, `packages/learning-runtime`, `packages/challenge-runtime`

---

## 1. Auth & installation

| Client capability | Method / path (HTTP) | Notes |
|-------------------|----------------------|--------|
| Request OTP | auth API module | Iran mobile |
| Verify OTP | auth API module | Issues access token |
| Hydrate token | local secure store | Not learning truth |
| Register installation | `POST /api/v1/client/installations` | Device binding |

---

## 2. Learning runtime

| Client capability | Method / path | Server authority |
|-------------------|---------------|------------------|
| Start station session | `POST /api/v1/learning/sessions` | Pins grade / curriculum / graph versions |
| Resume session | runtime resume (RPC / HTTP) | Snapshot + latest encounter |
| Create encounter | `POST /api/v1/learning/sessions/{id}/encounters` | Content version integrity |
| Submit attempt | `POST /api/v1/learning/attempts/submit` | Evaluation + evidence + decision |
| Progression snapshot | progression endpoint / `runtime_get_progression_snapshot` | completed + jump unlocks |

Detailed shapes: `API_LEARNING_RUNTIME_CONTRACT.md`

---

## 3. Signature challenge

| Client capability | Preferred server surface | Notes |
|-------------------|--------------------------|--------|
| Start challenge | `runtime_start_challenge` | sessionId + definitionId + idempotency |
| Submit round | `runtime_submit_challenge_round` | answers fingerprint; no client grading |
| Request hint | `runtime_request_challenge_hint` | Level-aware |
| Finish / exit | `runtime_finish_challenge` | Does **not** set station pass |
| Read run | `runtime_get_challenge_run` / `challenge_run_view` | Presentation only (0072) |

**Guardrail:** Challenge results are practice evidence, never mastery/station completion.

SQL foundations: `0055`, `0056`, `0072`

---

## 4. Content delivery

| Client capability | Path area | Notes |
|-------------------|-----------|--------|
| Manifest | content API | Per grade |
| Entitlement | ` /api/v1/content/entitlements/{packageId}` | |
| Download package | content manager | Checksum / channel |

See `API_CONTENT_DELIVERY_CONTRACT.md`

---

## 5. Engagement (infra only)

| Client capability | Area | Notes |
|-------------------|------|--------|
| Mission hub | mission RPC / API | P06 |
| Achievements | collection projection | P07 |
| Avatar workshop | avatar save / get | P08 |
| Worlds | world progression | P09 |

Must not introduce XP/gem/streak as learning truth.

---

## 6. Offline sync

| Client capability | Area |
|-------------------|------|
| Queue attempts | offline-sync package |
| Flush on foreground | `flushPendingSync()` |

See `API_OFFLINE_SYNC_CONTRACT.md`

---

## 7. Error handling policy

| Class | Client UX | Log |
|-------|-----------|-----|
| Network | «الان نتوانستم…» retry | yes |
| 401 / auth | re-auth / onboarding | yes |
| 409 idempotency | treat as success if body replayed | yes |
| 4xx validation | friendly retry, no raw codes | yes |
| 5xx | friendly retry | yes + alert staging |

---

## 8. Out of scope for child client

- Teacher portal routes  
- Raw `evaluator_config` / answer keys  
- Direct table access bypassing RPC  

---

## B1 checklist

- [ ] Every `fetch(` in `runtimeApi.ts` mapped to a row above  
- [ ] Challenge HTTP vs RPC path consistent in staging  
- [ ] Error codes documented for submit attempt + challenge submit  
- [ ] Grade pin present on session start for multi-grade readiness  
