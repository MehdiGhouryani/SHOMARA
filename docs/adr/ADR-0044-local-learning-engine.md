# ADR-0044 — Local learning engine: API, state machine, decision seams (P6)

- **Date:** 2026-11-13
- **Status:** Engine infrastructure ACCEPTED; **learning decisions are GATED** — O1 (evaluator model), O3 (gateway removal) and CONTENT-014 (mastery/unlock/jump policy) remain OPEN, so the engine ships with fail-closed seams and NO invented thresholds. Prerequisite check recorded: the owner P6 mission requires O1/O3/O2-final approved — they are NOT, therefore this phase delivers the decision-neutral engine + seams, exactly per the mission's own no-invention rule.
- **Related:** ADR-0039 §2 (local truth), ADR-0041 (module map: `:core:learning`), ADR-0042 (durable store), gap G-16–G-19, CONTENT-001/002/003/011/014/017, `packages/learning-runtime/src/policies.ts` (recorded DRAFT reference)
- **Evidence:** `harness/WORKLOG.md` IPA-P6 — engine+policy tests green, Room v3 migration + idempotent attempt persistence green, android:gate PASS.

## 1. Engine API (:core:learning — pure decision code, Android-free)

| Component | API surface | Decision seam |
|---|---|---|
| `LocalLessonEngine` | createSession / presentEncounter / submitAttempt / advanceStage / suspend / resume / abandon | evaluator injected (O1); no auto-advance (ADR-0039 §6) |
| `LocalLessonEvaluator` (SPI) | evaluate(EvaluationRequest): EvaluationOutcome | **O1 seam** — `UnconfiguredEvaluator` fails closed; three O1 options map onto implementations |
| `TemplateRegistry` | register / require(templateId, templateVersion) | version mismatch = fail-closed; adapters versioned + independently tested |
| `ProgressionEngine` | nextActionAfter / isUnlocked | **CONTENT-014 gate** — PolicyGate refuses unapproved |
| `MasteryEngine` | evaluateMastery(evidence) | same gate; evidence = IDs-only outcomes |
| `PrerequisiteGraph` | prerequisitesOf / missingPrerequisites / detectCycle | edges from content; cycles/unknown-prereq = construction-time failure |
| `HintPolicyEngine` | hintsAllowed / validHintIndex | recorded ban: P4/P5 (ShomaraMacroStages.HINT_BANNED); ladder depth = content-owned (CONTENT-003 open) |
| `RecoverySelector` | mistakeEncounters / replayQueue | selection mechanical (ADR-0039 §6 mistake repetition); assessment excluded |
| `SessionCheckpointManager` | suspendSession / resumeSession / clear | resume refuses rule-version mismatch; checkpoint = IDs only |
| `VersionedLearningConfigRepository` | isApproved / ruleVersionFor | recorded server-era drafts + `isApproved=false` until evidence |

## 2. State machine

```text
Session:  CREATED → ACTIVE ⇄ INTERRUPTED → COMPLETED | ABANDONED
Encounter: (presentEncounter) → PRESENTED → submitAttempt → outcome recorded (IDs-only) → completedEncounterIds+
Stage:    stageCursor walks P1_DISCOVER → P2_GUIDED → P3_GAME → P4_ASSESSMENT → P5_TRANSFER
          (manual advance only; content-provided order; cannot walk backwards past cursor)
Resume:   checkpoint(sessionId, IDs, stageCursor, mistakes, ruleVersion) → version gate → rehydrate
```

## 3. Evaluator registry + golden fixtures

- `TemplateRegistry` = the evaluator/template registry seam; golden fixtures live in `LocalLessonEngineTest` (replay script) + `LearningPoliciesTest` — driven by EXPLICIT test tables (ScriptedEvaluator, TEST data only). **No golden fixture encodes shipped policy**: real golden fixtures per template arrive with the O1-chosen evaluator (ADR-0043 test-vector pattern applies).
- Determinism contract: same (packageVersion, item, response, configVersion) → identical outcome — enforced for the ENGINE (pure functions, no clocks/randomness); the O1 implementation must prove it per template (mission list).

## 4. Persistence integration (Room v3, ADR-0042 discipline)

- `lesson_sessions` + `lesson_attempts` (unique `attemptKey`) — **IDs + outcome only** (CONTENT-018; ForbiddenFieldGuard upstream). Migration `MIGRATION_2_3` row-preserving, schema `3.json` exported; migration covered by the same builder-based validation pattern.
- `RoomLessonRecordRepository.recordAttempt` = session-upsert-if-absent + attempt-insert in ONE transaction; duplicate `attemptKey` = idempotent no-op returning false (tested, incl. process-death reopen).

## 5. Decision seams — what stays open and where it plugs in

| Seam | Owner decision | Plug-in point | Refusal today |
|---|---|---|---|
| Correctness model | O1 (3 options) | `LocalLessonEvaluator` implementations | `UnconfiguredEvaluator` throws |
| Gateway removal | O3 | app wiring (engine never touches a server) | sessions local-only |
| Mastery/unlock/jump values | CONTENT-014 (+CONTENT-011 calibration) | `LearningConfigRepository.isApproved` | `PolicyNotApprovedException` |
| Hint ladder depth/content | CONTENT-003 | content-provided ladder depth | index outside ladder refused |

## 6. Template coverage — uncovered decisions (recorded, owner P6 mission deliverable)

| Template | Engine coverage today | Uncovered decision |
|---|---|---|
| T15 choice | response shape + scripted evaluation contract | O1 (key model) + per-template proof |
| T01 count/select | structural guards (taught-numeral ceiling stays in feature adapters) | **tray placement evaluation** — needs O1 per-template proof (recorded gap N08R-09) |
| T13 trace | structural | **stroke evaluation** — needs O1 per-template proof (recorded gap N08R-09) |
| T05 match/sort | structural | **match correctness model** — needs O1 per-template proof |
| T11 audio | CONTENT-017 rule mirrored in resolvers | approval of the recorded conflict resolution (O12) |

## 7. What is deliberately NOT done

- No O1 evaluator implementation, no adopted thresholds (recorded drafts stay REFERENCE data), no Stage-pass/recovery POLICY computation, no app wiring (UI keeps its current server-driven flow until O3 lands), no jump policy (CONTENT-014).
