---
name: shomara-android-build
description: Diagnose, verify, build, or prepare SHOMARA Android Native artifacts. Use for Android SDK/JDK/Gradle setup, CI build failures, N02 foundation gates, debug APK requests, build reports, checksums, signing boundaries, or release-readiness handoff.
---

# SHOMARA Android build skill

Produce reproducible evidence; never turn a missing toolchain into a green result.

## Required workflow

1. Read `AGENTS.md`, `START_HERE.md`, run `node tools/harness.mjs validate` and `node tools/harness.mjs resume`.
2. Read `docs/architecture/ANDROID_BUILD_ENVIRONMENT.md` and the active roadmap task.
3. Run `npm run android:doctor`. If it reports `BLOCKED_ENV`, fix only the named JDK/SDK requirement and rerun.
4. Run `npm run android:gate` for unit/lint/compile evidence.
5. Run `npm run android:assemble:debug` only when a debug APK is requested or the active task permits it.
6. Record command, exit code, generated report path, APK SHA-256 when present, and all unverified device/signing gates.

## Hard boundaries

- Use the checked-in Gradle wrapper and pinned catalog; do not substitute a global Gradle for evidence.
- Do not skip preflight, tests, lint or compile to obtain an APK.
- Do not add secrets, keystores, production config, release signing or publication before N10 and HG-05.
- A debug APK is not store-ready, production-ready or device-tested.
- Do not claim Native success from static source checks, browser tests, previews or a report whose status is `BLOCKED_ENV`/`FAILED`.
- Keep `build-reports/`, `build/`, APK/AAB and local SDK paths generated and untracked.

## Result interpretation

- `READY`: environment only; compilation has not yet passed.
- `PASS`: requested Gradle task set exited zero.
- `BLOCKED_ENV`: required JDK/SDK is absent or invalid; preserve the blocker.
- `FAILED`: toolchain was ready but Gradle or APK verification failed; fix the first real failure.
