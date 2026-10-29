# ADR-0036 — Android Native foundation

- Status: Accepted for N02
- Date: 2026-10-28
- Decision owner: project owner instruction to continue Native implementation

## Context

SHOMARA is migrating route-by-route from Expo to a fully Native Android client. The foundation must preserve the existing package identity and server contracts, remain reproducible, and avoid importing feature/business logic into the application module.

## Decision

| Setting | Value | Reason |
|---|---|---|
| `applicationId` | `com.mathlearning.app` | Preserve current installed-app identity and Expo package id. |
| namespace | `com.mathlearning.app` | Keep foundation simple; feature/core modules use scoped subpackages. |
| min SDK | 24 | Current AndroidX default baseline; broad device coverage. |
| compile SDK | 37 | Required by current Compose/Navigation artifacts and supported by AGP 9.4. |
| target SDK | 36 | Current app setting and Google Play requirement for new apps/updates from 2026-08-31. |
| JDK | 17 | AGP 9.4 compatibility baseline. |
| AGP | 9.4.0 | Stable release with published compatibility table; built-in Kotlin enabled. |
| Gradle | 9.6.0 | Required by AGP 9.4; distribution checksum pinned. |
| Compose BOM | 2026.08.00 | Stable coordinated Compose dependency set. |

No `org.jetbrains.kotlin.android` plugin is applied: AGP 9 provides built-in Kotlin. The Compose compiler plugin remains pinned to Kotlin 2.4.10. Dynamic dependency versions are forbidden.

## Architecture

- Single activity and Compose navigation.
- Unidirectional state flow; immutable UI state and explicit user actions.
- `app` is composition/navigation only; business rules live outside it.
- `core:common`, `core:model` and `core:testing` establish public foundations.
- Constructor/manual composition-root DI is used initially to keep N02 deterministic. A DI framework requires a later ADR if graph complexity justifies it.
- Progression, correctness, mastery and Station Pass remain server-authoritative.

## Consequences

- API 23 and older devices are not supported by the Native client.
- Android 16 edge-to-edge and predictive-back behavior must be handled from the first screen.
- Expo remains available until route parity and cutover gates are complete.
- Native compile/lint/device evidence remains blocked on machines without Android SDK 37; static structure verification is not a substitute.

## Official references

- AGP compatibility: https://developer.android.com/build/releases/agp-9-4-0-release-notes
- Built-in Kotlin: https://developer.android.com/build/migrate-to-built-in-kotlin
- Compose setup/BOM: https://developer.android.com/develop/ui/compose/setup-compose-dependencies-and-compiler
- AndroidX min SDK policy: https://developer.android.com/jetpack/androidx/versions
- Android 16 behavior: https://developer.android.com/about/versions/16/behavior-changes-16
- Play target API requirement: https://developer.android.com/google/play/requirements/target-sdk
