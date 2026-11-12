# Android Native module graph — N07 offline content foundation · به‌روزرسانی P3 (ADR-0041, 2026-11-13)

```text
app
 ├─ core:common
 ├─ core:model
 ├─ core:designsystem
 ├─ core:network
 ├─ core:datastore
 ├─ core:database
 ├─ sync
 ├─ feature:onboarding
 │    ├─ core:common
      ├─ core:model
      ├─ core:designsystem
      ├─ core:network
      └─ core:datastore

core:testing
 ├─ core:common
 └─ core:model
```

No feature-to-feature imports exist; `:app` is the composition root (`AppGraph`, ADR-0041) and
wires every module. These rules are machine-checked by `scripts/verify-android-module-graph.mjs`
(part of `verify:static:all`): no `GlobalScope` in main sources; `Dispatchers.Main` banned outside
`:app`; features must not import `okhttp3`/`androidx.datastore`/`core:database`/`:sync`; `:sync`
importable only by `:app`/`:sync`; no feature-to-feature imports; feature imports of
`core:network`/`core:datastore` are limited to a dated, shrink-only allowlist (6 entries).

## Scope ownership (ADR-0041)

| Scope | Owner | Lifecycle | Notes |
|---|---|---|---|
| Application | `AppGraph.applicationScope` (SupervisorJob + Default) | process | the ONLY app-lifetime async scope; never cancelled by hand |
| DataStore | `AppGraph` private `dataStoreScope` (SupervisorJob + IO) | process | preference-store I/O pool |
| Screen | `rememberCoroutineScope()` | composition | cancelled with the UI; no feature global scopes |
| I/O dispatchers | injected | call site | `Dispatchers.Main` outside `:app` main sources is verifier-banned |

## Responsibilities

| Module | Owns | Must not own |
|---|---|---|
| `app` | Application, Activity, composition root (`AppGraph` + `ShomaraAppStartup`), top-level navigation (NavHost, launch route) | learning rules, repositories, DTOs, answer evaluation |
| `core:common` | error taxonomy (`AppError` leaf + `ShomaraErrorModel` Domain/Data/Presentation + `ShomaraRetryPolicy`), logging contracts, `ShomaraStateHolder`/`SingleFlightExecutor`, `ShomaraScopes` | UI, child data, network clients |
| `core:model` | validated stable identifiers, shared domain value types (launch states, grade/avatar catalogs) | API payloads, storage entities, UI state |
| `core:designsystem` | generated tokens (ShomaraTokens), theme, canonical component families | feature logic, network, storage |
| `core:network` | HTTP auth gateway (OkHttp OTP API), network error taxonomy, client-side throttle | token persistence, UI, business rules |
| `core:datastore` | DataStore-backed `ShomaraTokenStore`, fail-closed restore/expiry policy | HTTP, UI, feature logic |
| `feature:onboarding` | onboarding state machine, routes, screens, auth-session orchestration | sibling features, repositories |
| `feature:path/practice/profile/settings/parent` | child shell tab surfaces (N05) | learning rules, sibling features |
| `feature:lesson` | P1..P5 lesson player, checkpoint, template adapters, lesson gateway usage | mastery decisions, sibling features, direct DB |
| `core:database` | local tables (station packages, progress projection, outbox, audio assets) + migration policy | HTTP, UI, mastery decisions |
| `sync` | idempotent outbox sync engine, backoff, Server-Wins reconcile, manifest activation | UI, lesson rendering |
| `core:testing` | reusable fakes/fixtures for tests | production implementations |

New feature/domain/data modules are added only by their roadmap tasks. A feature may depend on
public core/domain APIs, never another feature implementation. `app` wires dependencies but
contains no feature business logic.

## Dependency injection

Constructor injection with one `AppContainer` composition root (context-scoped DataStore file,
runtime-injected API endpoints — `null` until the production backend exists, which makes every
auth call fail closed). A framework such as Hilt requires a later ADR when the dependency graph
justifies its build/plugin cost.

## Verification

- Host readiness: `npm run android:doctor`
- Static foundation gate: `npm run verify:android-foundation` (requires all 8 module includes)
- Zero-raw-token + child-safety guard: `node scripts/verify-design-system-native.mjs`
  (scans `:core:designsystem`, `:app` and `apps/android/feature/**` production sources; 14 modules)
- Wrapper/toolchain: `cd apps/android && ./gradlew --version`
- Full foundation: `npm run android:gate`
- Debug package when explicitly requested: `npm run android:assemble:debug`
- Device/semantics: `cd apps/android && ./gradlew connectedDebugAndroidTest` when SDK/emulator exists.
