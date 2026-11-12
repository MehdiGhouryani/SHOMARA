# ADR-0041 — Native infrastructure contracts (AppGraph, scopes, startup, error model, state holders)

- **Date:** 2026-11-13
- **Status:** Accepted (owner-ordered engineering program phase P3 — native infrastructure; no UI redesign; no O1–O13-dependent component)
- **Decision owner:** project owner (program mission 2026-11-13)
- **Related:** ADR-0039 (fully offline product), `docs/architecture/ANDROID_MODULE_GRAPH.md`, `docs/architecture/PACKAGE_BOUNDARIES_FA.md`, `docs/architecture/ANDROID_BUILD_ENVIRONMENT.md`, `harness/WORKLOG.md` (IPA-P3 entry)
- **Evidence:** `harness/WORKLOG.md` IPA-P3 — android:gate PASS, new JVM tests green, `ANDROID_MODULE_GRAPH: PASS` verifier added to static gates.

## Context

The native app (16 Gradle modules) grew organically through N02..N08R. The 2026-11 audit (Phase 0) and this phase's inspection established the exact current state:

- **Composition root exists but the role was unnamed**: `DefaultAppContainer` (manual DI) is built in `ShomaraApplication.onCreate`; nothing owns an application coroutine scope — the DataStore scope was an anonymous `CoroutineScope(Dispatchers.IO)`.
- **No ViewModels exist anywhere**: screens are state-holder composables that receive state via parameters from `ShomaraApp`; the launch gate (`ShomaraLaunchController`) is the only StateFlow producer and is `remember`ed in composition. This is a legitimate UDF shape; what was missing is the CONTRACT (ownership, immutability, scope rules) and a shared primitive for the ad-hoc single-flight logic already shipped in the lesson host (N08-05).
- **Error taxonomy exists but is orphaned**: `AppError` (+ `UserMessageKey`) in `core:common` had zero consumers — no layering (Domain/Data/Presentation), no shared retry policy (the OutboxSyncEngine keeps its own backoff numbers).
- **Startup performs no I/O by construction** (DataStores are lazy), but nothing states or guards that contract.
- **Boundary exceptions are undocumented in code**: feature modules import `core:network`/`core:datastore` types (granted by the module-graph responsibility table) and `feature/lesson/ShomaraAudioCache.kt` imports `core:database` — verifiable only by reading docs.

## Decisions

### 1. `AppGraph` — the named composition root (accepted)

`AppGraph : AppContainer` is the explicit root contract implemented by `DefaultAppContainer`. It adds:
- `applicationScope`: the ONE application-lifetime `CoroutineScope(SupervisorJob + Default + CoroutineName)` created via `ShomaraScopes.applicationScope()`. Supervisor semantics are JVM-tested (a failing child does not cancel siblings). Never cancelled by hand; dies with the process.
- `startup`: the `ShomaraAppStartup` contract (below).
- DataStore storage moves to a dedicated, owned `dataStoreScope` (`SupervisorJob + IO`) instead of an anonymous scope.

Scope ownership table (normative): **Application** = `applicationScope`/`dataStoreScope` (graph-owned) · **Screen** = `rememberCoroutineScope()` (composition-owned, cancelled with the UI) · **Feature global scopes are forbidden** — I/O dispatchers are always injected (`Dispatchers.Main` in non-`:app` main sources is verifier-banned).

### 2. `ShomaraAppStartup` — essential vs deferred (accepted)

Essential steps run synchronously in `onCreate`; they wire and log only — file/network/content/audio/CMS work is forbidden (offline content is bundled and the package engine is an O2-gated Phase-4 component, not a startup dependency). Deferred steps are registered (id only) and execute lazily on first real use. A failing essential step is logged (`startup.essential.failed` + step id) and swallowed: diagnostics must not kill launch. Today: one essential step (`log-runtime-mode`), zero deferred — the contract is real and JVM-tested (ordered execution, swallow-on-failure, deferred-never-at-launch).

### 3. `ShomaraErrorModel` — three layers over the canonical leaf (accepted)

`AppError` remains the canonical leaf taxonomy. `ShomaraError` adds the layering the UI must distinguish: **Domain** (a product/learning rule said no — never auto-retried), **Data** (wraps `AppError` — retry follows the shared policy), **Presentation** (surface failure — recovery is re-render; incident id minted). `ShomaraRetryPolicy.decide` maps every leaf to an automatic-retry decision, **reusing the shipped OutboxSyncEngine numbers** (750ms base / 300s cap / 8 attempts — reused, not invented; unification is recorded debt). The automatic-retry policy is NOT the child-visible retry control, which stays a calm deliberate CTA (AGENTS §6). Privacy contract: errors and their logs carry identifiers only — no answers, correctness, names, or payloads (CONTENT-008/018; `SafeAppLogger` enforces keys).

### 4. `ShomaraStateHolder` + `SingleFlightExecutor` (accepted)

`ShomaraStateHolder<S>` names the state contract (immutable value, `StateFlow`, explicit lifecycle owner, UI renders/never owns truth). `SingleFlightExecutor` extracts the per-key duplicate-collapse primitive the lesson host had inlined (N08-05): concurrent duplicates collapse onto the running operation; cancellation frees the key; different keys are independent. JVM tests cover duplicate/cancel/independence/supervisor semantics on a deterministic `StandardTestDispatcher` scope. ViewModels are NOT introduced wholesale: the state-holder shape stays, and per-screen ViewModel adoption is recorded debt (no behavior or visual change was warranted here).

### 5. Static architecture guard (accepted)

`scripts/verify-android-module-graph.mjs` joins `verify:static:all` (now 92 gates) and enforces, against real Kotlin sources: no `GlobalScope` in main sources; `Dispatchers.Main` banned outside `:app`; features must not import `okhttp3`/`androidx.datastore`/`core:database`/`:sync`; `:sync` importable only by `:app`/`:sync`; no feature-to-feature imports; feature imports of `core:network`/`core:datastore` are limited to a **dated, shrink-only allowlist** (6 entries with reasons: lesson orchestrators, onboarding session orchestration incl. the debug-only OTP provider, N07-04 audio cache). New violations fail the verifier; stale allowlist entries are reported and must be removed.

## Consequences

- Dependency direction is now machine-checked, not only documented.
- The composition root, scopes and startup contract are named and tested — future phases (Room via O4, package engine via O2, evaluator via O1) wire into `AppGraph`/`ShomaraAppStartup` instead of inventing new roots.
- `AppError`/`ShomaraError` adoption by existing flows (LessonGateway, LaunchController) is a recorded migration debt, not a silent no-op.

## Recorded debts (shrink-only allowlist + migrations)

1. `feature/lesson` orchestrators and `feature/onboarding` session classes import `core:network`/`core:datastore` types — extract interfaces into `core:model` when O3/O4 land (allowlist shrinks then).
2. `ShomaraAudioCache.kt` sits over `core:database` — move behind a data boundary in the O4 phase.
3. Retry-policy constants are mirrored (not shared) between `core:common` and `:sync` — unify when O3 retires `:sync`.
4. `AppError`/`ShomaraError` are adopted by no production flow yet — wire into gateway/launch flows in the next behavior-touching change.
5. Per-screen ViewModel adoption — pattern and tests exist; screens migrate opportunistically without visual change.
6. `ShomaraAppStartup` has no deferred steps yet — content package/audio steps register there in Phase 4+ (O2-gated).
