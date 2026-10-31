# Android Native module graph — N04 onboarding foundation

```text
app
 ├─ core:common
 ├─ core:model
 ├─ core:designsystem
 ├─ core:network
 ├─ core:datastore
 └─ feature:onboarding
      ├─ core:common
      ├─ core:model
      ├─ core:designsystem
      ├─ core:network
      └─ core:datastore

core:testing
 ├─ core:common
 └─ core:model
```

No feature-to-feature imports exist; `:feature:onboarding` is the only feature so far and depends
only on public core APIs (AGENTS §5). `:app` is the composition root and wires every module.

## Responsibilities

| Module | Owns | Must not own |
|---|---|---|
| `app` | Application, Activity, composition root, top-level navigation (NavHost, launch route) | learning rules, repositories, DTOs, answer evaluation |
| `core:common` | safe error taxonomy, logging contracts, platform-neutral utilities | UI, child data, network clients |
| `core:model` | validated stable identifiers, shared domain value types (launch states, grade/avatar catalogs) | API payloads, storage entities, UI state |
| `core:designsystem` | generated tokens (ShomaraTokens), theme, canonical component families | feature logic, network, storage |
| `core:network` | HTTP auth gateway (OkHttp OTP API), network error taxonomy, client-side throttle | token persistence, UI, business rules |
| `core:datastore` | DataStore-backed `ShomaraTokenStore`, fail-closed restore/expiry policy | HTTP, UI, feature logic |
| `feature:onboarding` | onboarding state machine, routes, screens, auth-session orchestration | sibling features, repositories |
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
  (scans `:core:designsystem`, `:app` and `apps/android/feature/**` production sources)
- Wrapper/toolchain: `cd apps/android && ./gradlew --version`
- Full foundation: `npm run android:gate`
- Debug package when explicitly requested: `npm run android:assemble:debug`
- Device/semantics: `cd apps/android && ./gradlew connectedDebugAndroidTest` when SDK/emulator exists.
