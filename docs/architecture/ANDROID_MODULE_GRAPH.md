# Android Native module graph — N02 foundation

```text
app
 ├─ core:common
 └─ core:model

core:testing
 ├─ core:common
 └─ core:model
```

## Responsibilities

| Module | Owns | Must not own |
|---|---|---|
| `app` | Application, Activity, composition root, top-level navigation | learning rules, repositories, DTOs, answer evaluation |
| `core:common` | safe error taxonomy, logging contracts, platform-neutral utilities | UI, child data, network clients |
| `core:model` | validated stable identifiers and shared domain value types | API payloads, storage entities, UI state |
| `core:testing` | reusable fakes/fixtures for tests | production implementations |

Feature, domain and data modules will be added only by their roadmap tasks. A feature may depend on public core/domain APIs, never another feature implementation. `app` wires dependencies but contains no feature business logic.

## Dependency injection

N02 uses constructor injection and one `AppContainer` composition root. This is an explicit DI strategy, not a service locator inside UI. A framework such as Hilt requires a later ADR when the dependency graph justifies its build/plugin cost.

## Verification

- Host readiness: `npm run android:doctor`
- Static foundation gate: `npm run verify:android-foundation`
- Wrapper/toolchain: `cd apps/android && ./gradlew --version`
- Full foundation: `npm run android:gate`
- Debug package when explicitly requested: `npm run android:assemble:debug`
- Device/semantics: `cd apps/android && ./gradlew connectedDebugAndroidTest` when SDK/emulator exists.
