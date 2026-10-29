# SHOMARA N02 Android environment hardening checkpoint

- Snapshot: `SNAP-20261028-NATIVE-N02-ENVIRONMENT-HARDENING`
- Branch: `native/n02-foundation`
- Status: `N02 IN_PROGRESS — 9/10; N02-07 BLOCKED_ENV`
- Scope: make the remaining Android gate deterministic; no N03 implementation and no APK/AAB

## Delivered

1. Cross-platform Node preflight for JDK 17, SDK root and a valid API 37 `android.jar`.
2. Machine-readable `READY`/`BLOCKED_ENV` result with a safe `--allow-blocked` evidence mode.
3. GitHub runner pinned to Ubuntu 24.04 instead of the moving `ubuntu-latest` label.
4. Explicit stable `platforms;android-37` installation with Android CLI first and official `sdkmanager` fallback.
5. Fail-closed preflight before Gradle test/lint/compile.
6. Canonical environment runbook and synchronized roadmap, ledger, resume and static verifier.

## Verified here

- Real environment result: Java 17 PASS; SDK root FAIL; API 37 FAIL; overall `BLOCKED_ENV`.
- Positive preflight path: PASS against an isolated valid JAR fixture under a temporary SDK root.
- Wrapper attempt: FAIL with `Network is unreachable`; both known Gradle `.part` caches are zero bytes.
- Package build and typecheck all 9 workspaces: PASS.
- Vitest: 65 files / 502 tests PASS.
- Android foundation, content, skill, design and repository/harness gates: PASS.
- Static suite: 81/86; only the five unchanged Chromium flow/parity gates remain `BLOCKED_ENV`.

## Honest boundary

No compile, lint or Kotlin unit result is claimed. The next executable action is `npm run android:preflight` on a runner with Android platform 37 and repository access, followed by `./gradlew test lint :app:compileDebugKotlin --stacktrace`. Only then may N02 close and N03 start.
