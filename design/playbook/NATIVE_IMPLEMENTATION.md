# Native implementation contract — Kotlin + Jetpack Compose

Read this file for N02–N10 Android work after `design/MASTER.md` and the relevant page contract.

For theme, token or shared component work, `skills/shomara-design-system/SKILL.md` and `COMPONENT_READINESS.md` are also mandatory.

## Screen structure

Each feature exposes immutable `UiState`, sealed user `Action`/`Intent`, a ViewModel or presenter, and a stateless route-level composable. Composables render state and emit events; they do not call network/database clients or calculate learning truth.

```text
Route → ViewModel → UseCase → Repository → local/remote source
  └──── immutable UiState ←───────────────┘
```

Use a single activity, explicit navigation destinations and public feature APIs. Keep implementation dependencies between feature modules forbidden.

## Required foundations

- Edge-to-edge from the first activity; consume insets deliberately.
- Predictive-back-compatible navigation; no raw back-key interception.
- Saved state only for reconstructable UI/navigation values; domain progress comes from repository/server truth.
- Structured error types mapped to child-safe UI messages; internal detail stays in privacy-safe logs.
- Dependency injection at module boundaries; no service locator inside composables.
- All dependency and plugin versions pinned in the version catalog; no dynamic versions.

## Compose rules

- Use Material semantics and SHOMARA tokens, not Material defaults as the visible brand.
- Hoist state; use stable keys for lists; avoid side effects during composition.
- Represent one-off navigation/messages through explicit effect handling, not booleans that replay after recreation.
- Add previews for meaningful normal/error/large-text/RTL states using deterministic fixtures.
- Keep animation cancelable and driven by state; respect system animator/reduced-motion preference.

## Test layers

1. Pure unit tests for reducers/use cases/error mapping.
2. ViewModel tests with deterministic dispatchers and fake repositories.
3. Compose semantics tests for label/role/state/action and critical navigation.
4. Screenshot tests at 360/390/412dp plus large text for representative screens.
5. Instrumented/device journeys for IME, process recreation, TalkBack, predictive back, audio/haptics and performance.

Never replace a missing device gate with a screenshot-only claim. Record `NATIVE_PENDING` and the exact executable command.

## Migration rule

Migrate one route family at a time. First lock the Expo behavior/contract, then implement Native state and UI, compare critical states, run gates and update the ledger. Retire Expo/V1/V2 only after zero-consumer proof and a replacement gate.
