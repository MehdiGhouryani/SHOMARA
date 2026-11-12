# ADR-0042 — Durable learning database (Room/SQLite + DataStore split) — O4 APPROVED

- **Date:** 2026-11-13
- **Status:** Accepted — owner decision **O4 APPROVED** in the P4 mission text (Room/SQLite for structured data; DataStore for light settings; media binaries in app-private storage; Keystore only where a key/secret genuinely requires it). Registered in `INFRASTRUCTURE_OWNER_DECISIONS_FA.md` with the mission as evidence.
- **Decision owner:** project owner
- **Related:** ADR-0039 §8-O4, ADR-0041 (native infrastructure contracts), `docs/architecture/ANDROID_MODULE_GRAPH.md`, gap G-10/G-11 in `INFRASTRUCTURE_GAP_REGISTER_FA.md`
- **Evidence:** `harness/WORKLOG.md` IPA-P4 — Robolectric integration suite over real SQLite (round-trip, process-death reopen, corruption fail-closed, downgrade reject, foreign-schema reject, concurrency/collision, transaction epilogue, CONTENT-008 guard), schema export JSON committed, android:gate PASS.

## Context

`LocalLearningDatabase` was four in-memory `MutableList`s (G-10): every byte of progress, package registry, outbox and audio metadata vanished on process death. Its migration POLICY engine (v1→v2, downgrade reject, corrupt reject, CONTENT-008 forbidden-field guard) was correct in spirit but lived only on volatile objects. All 13 consumer files were mapped before touching anything.

## Decision

### 1. Storage split (approved shape)

| Data | Store | Notes |
|---|---|---|
| Station packages, progress projections, outbox operations, audio-asset metadata, migration history | **Room/SQLite** (`:core:database`) | structured, queried, transactional |
| Settings, profile drafts, lesson checkpoints, tokens (until Phase-2 removal) | **DataStore** (unchanged) | light KV; already durable and tested |
| Media binaries (audio) | **app-private files** | DB stores `localFileRef` + sha256 metadata only — never bytes |
| Keys/secrets | **Keystore** | only when something genuinely needs one (none today) |

### 2. Schema v1 — real needs only

Five tables (see exported `apps/android/core/database/schemas/com.mathlearning.core.database.ShomaraLearningDatabase/1.0.json`):

```erd
station_packages (stationId, version) PK ── index (stationId, isActive)
progress_projections (learningIdentityId, stationId) PK
outbox_operations idempotencyKey PK
audio_assets audioId PK ── index (publishState)
migration_metadata id PK autoGenerate
```

- **Foreign keys deliberately absent in v1** — these are independent registries keyed by EXTERNAL identifiers (stationIds from the content pipeline, audioIds from the CMS, outbox keys from the lesson loop); rows legitimately arrive independently (draft audio metadata precedes any package; progress may be server-verified for a station whose package is not cached). FKs would couple arrival order, not integrity; transactions keep multi-row updates consistent.
- **Deferred tables (documented, not created):** Profile (+preferences) waits for O5 (single vs multi); SkillMastery waits for O1/CONTENT-014 (no producer, no semantics); LessonSession/Encounter/Attempt arrive with the local evaluator loop (P5) — attempt rows must carry IDs-only telemetry (CONTENT-018) and NEVER answers unless O1 approves a separated evaluator model with its own storage. Each arrives as a versioned Room migration with exported schema + migration test.
- **CONTENT-008 boundary at the persistence edge:** `ForbiddenFieldGuard` (moved from `LocalSchema`) rejects forbidden keys (answer/answerKey/evaluatorConfig/passThreshold/nextStep/reviewer/…) in ANY payload before insert — tested at the repository level.

### 3. Contracts and consumers

- Repository INTERFACES live in `:core:model` (`StationPackageRepository`, `ProgressRepository`, `OutboxRepository`, `AudioAssetRepository`) — the domain contracts features/sync program against.
- Room implementations live in `:core:database` (`Room*Repository`) — the ONLY persistence; mapping entity ⇄ domain types; payloads serialized with `ShomaraPayloadJson` (core:common, dependency-free).
- Transactions: `activatePackage` (deactivate-previous + insert-new in ONE transaction — a crash can never leave zero or two active versions); `completeAccepted` (Server-Wins progress upsert + outbox removal in ONE transaction — an accepted send can never be re-drained or lose its progress row).
- Consumers rewired off the in-memory store: `OutboxSyncEngine` + `ManifestActivationEngine` (:sync — now depend on `:core:model` contracts only; `:core:database` dependency dropped), `ShomaraAudioCache` (feature/lesson — database import REMOVED; module-graph allowlist shrunk 6→5), `DraftAudioImporter`, `DefaultAppContainer` (exposes the four repositories; builds `ShomaraLearningDatabase` with NO destructive fallback).
- `LocalLearningDatabase` deleted with consumer-proof; its policy semantics re-proven on real SQLite (downgrade/corrupt/guard).

### 4. Fail-closed policy on real SQLite

No `fallbackToDestructiveMigration`; downgrade → `IllegalStateException` (tested); foreign/future schema identity → integrity verification failure (tested); corrupt file → open failure, file preserved — never silently recreated (tested); honest recovery surface is the app's responsibility (no auto-wipe).

### 5. Version catalog / toolchain pins (proven live)

Room **2.8.5** (+ktx, compiler via **KSP 2.3.13**), Robolectric **4.17** (SDK 34), androidx.test:core 1.6.1 — resolved from Maven Central/Google; host Gradle mirror init script corrected (broken Aliyun gradle-plugin mirror removed from plugin resolution; dependency mirror kept) and the dead local Hiddify proxy in the user `gradle.properties` disabled with dated backups (`*.bak-20261113`) — both host-only files, both documented in WORKLOG.

## Data-loss matrix (what survives which failure — after this phase)

| Scenario | Station packages | Progress | Outbox ops | Audio metadata | Settings/checkpoints (DataStore) | Verdict |
|---|---|---|---|---|---|---|
| Process death / force-stop | ✓ persists (reopen test) | ✓ | ✓ (idempotency key preserved) | ✓ | ✓ (already durable) | zero data loss |
| App upgrade (schema v1→v2 future) | migration required by policy; missing migration = open FAILS, data preserved on disk | ✓ | ✓ | ✓ | ✓ | fail-closed, no wipe |
| App downgrade | open REJECTED (tested) | preserved on disk | preserved | preserved | preserved | fail-closed |
| Foreign/future schema identity | open REJECTED (identity check tested) | preserved | preserved | preserved | preserved | fail-closed |
| Corrupt file bytes (device) | open fails (SQLiteCantOpen/NOTADB) — **device evidence deferred to instrumented phase**; Robolectric's native SQLite silently initializes garbage files (documented divergence) | — | — | — | — | fail-closed by builder contract (no destructive fallback — static gate R7) |
| Uninstall / clear data | ✗ (by Android design) | ✗ | ✗ | ✗ | ✗ | ADR-0039 §5 accepted: no device-to-device recovery; parent-facing statement owed in Phase 2 |
| Media binary corrupt/missing | n/a | n/a | n/a | quarantine + text fallback (CONTENT-017) | — | lesson never blocks |

## Consequences

- Progress, packages, outbox and audio metadata now survive process death (tested).
- The module-graph boundary improved: one dated allowlist entry became stale and was removed.
- Migration discipline for every future schema version: bump `version`, write the Migration, export the schema JSON, add the migration test — all four or the gate is red.
- The data-loss matrix (P4 docs) is the reference for what survives which failure.
