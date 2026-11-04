# ADR-0038 — Splash, launch-state wiring and DEBUG-only simulated OTP (N08-15)

**Date:** 2026-11-04
**Status:** Accepted (owner-supplied splash artwork + owner instruction to enable a temporary
DEBUG-only OTP simulation, 2026-11-04)
**Related:** ADR-0035 (UI v1 from 2026-10 pages), ADR-0037 (installable beta track lock, L10/I2),
`design/playbook/pages/01_WELCOME_LAUNCH.md`, `docs/product/ONBOARDING_JOURNEY_READINESS_N04.md`

## Context

Three gaps blocked any real exploration of the Native onboarding journey:

1. **No splash at all.** On Android 12+ the OS always shows a *system* splash built from the
   launcher icon and `windowBackground`; the app then jumped straight into the welcome gate. There
   was no branded splash, no splash-theme configuration, and no `core-splashscreen` dependency.
2. **`ShomaraLaunchState` had no producer.** The contract and its tests existed in `:core:model`,
   but `MainActivity` always rendered the app with `startDestination = onboarding` and the only
   "restore" in the client was `ShomaraOnboardingStateHolder.restoreDraft()` (a profile draft, not a
   session). A returning child was therefore sent through the welcome gate again; `Resolving` was
   never published.
3. **No way to reach step 2 of onboarding.** `ShomaraRuntimeConfig.otpEndpoints` is `null`
   (ADR-0037 I2: no backend configured), so every OTP request fails closed with a warm error. That
   is correct production behaviour but makes Phone → OTP → Profile unexplorable.

The owner supplied `SPLASH.png` (941×1672) as the official splash illustration and asked for a
DEBUG-only simulated authentication flow.

## Decision

### 1. Artwork integration (no recreation)

- `SPLASH.png` is copied **byte-for-byte** into
  `core:designsystem/src/main/res/drawable-nodpi/shomara_splash_artwork.png`
  (sha256 `00e771ad6857e1a0bd97bc15e17440cb7f318905fd3317ca9edf6314162ffbc2`,
  1 490 549 bytes). It is rendered with `Image` + `ContentScale.Fit` inside a box whose aspect ratio
  is the artwork's own (`941 / 1672`), so it is never stretched, redrawn or cropped.
- The artwork's background is a warm cream (measured modal colour `(254,245,230)`), which is **not**
  the v2 `canvas` token (`#FFF8EF`). That cream is registered as a token (`v2.color.splashCream` →
  `ShomaraTokens.ColorSplashCream = #FDF4E5`) instead of being hard-coded in the screen, so the
  design-system verifier still governs every colour.
- **No UI text lives inside the artwork.** The wordmark («شمارا») is live Compose text in the
  canonical `Display` style under the hero; the loading line is live `Body` text; the progress
  indicator is the shared `ShomaraProgressBar`.
- **NUMBER is the visual focus**: the delivered composition is shown whole (that is where the
  character sits), and the text block below it is deliberately quiet — `Body`/`Caption` ink at
  `max` widths, a 220 dp determinate bar — so nothing competes with the character.
- The Android **system splash** is configured to match, not replaced: `windowBackground`,
  `colorBackground`, `windowSplashScreenBackground` and `windowSplashScreenIconBackgroundColor` are
  the same cream, and the API 31+ splash uses the existing launcher mark. No `core-splashscreen`
  dependency is added, and no hold API is used.

### 2. Launch-state wiring (real, fail-closed)

- `:app` gains `ShomaraLaunchController` (a real producer) and `ShomaraLaunchGate` (the only
  consumer). The gate is now the NavHost's **start destination** (`AppDestination.LAUNCH`).
- The controller publishes `Resolving`, reads the stored credential through `ShomaraTokenStore`,
  verifies it via `ShomaraAuthSession.restore()` (server probe + expiry window + clear on
  rejection), then maps the observation through `ShomaraLaunchResolver` (`:core:model`).
- Mapping: `Resolving` → splash only; `NewUser`/`RecoverIncompleteProfile` → onboarding;
  **verified** session (`RestoringSession`) → child shell; `Offline`/`Error` → recovery screen with
  a real «تلاش دوباره» and an explicit «شروع از اول».
- **No fake success.** A credential counts only when it was actually verified. With no backend
  configured, restore now returns the new `RestoreOutcome.BackendUnavailable` (neither accepted nor
  refused), which surfaces the configuration error **and keeps the credential** for a future build.
  A genuine server refusal is still `ServerRejected` and is cleared.
- A `NewUser` hand-off waits `NewUserHandoffMs = 600 ms` so the branded splash is visible on a warm
  start instead of flashing for one frame. This is not a delay of child work: resolution has already
  finished, it is bounded, single-shot, and **never applies to a verified session** (that path goes
  straight to the shell).

### 3. DEBUG-only simulated OTP

- `ShomaraDebugOtpProvider` + `ShomaraDebugOtpProviderFactory` live in `:feature:onboarding`
  `src/debug/kotlin` only. `:app` mounts them from `src/debug/.../AuthProviderWiring.kt`, whose
  release counterpart declares `IsDebugBuild = false` and `simulatedProviderFactory = null`. The two
  variants declare the same type, so the isolation is enforced by the compiler, not by an `if`.
  (Measured: `:app:compileReleaseKotlin` fails if the release file references the debug factory.)
- The simulated credential is recognisable (`sim-dev-session.<uuid>`) and is rejected on any
  production path: `ShomaraAuthSession(allowSimulated = false)` refuses it through
  `ShomaraSimulatedCredentialGate` and clears it on restore.
- The fixed development code (`ShomaraSimulatedAuth.DevelopmentCode = "1234"`) is shown on screen in
  a clearly labelled development banner («حالت توسعه: کد پیامک واقعی ارسال نمیشود.») plus a code
  hint, so the flow can never be mistaken for a real SMS.
- The production OTP path is untouched: with `otpEndpoints == null` the real provider still fails
  closed with the configuration error, and an invalid phone number still produces the phone-format
  error first. The two error classes render as distinct messages.
- The simulated provider performs **no network call at all** (asserted by a MockWebServer that
  records zero requests), so no real SMS can be triggered.

## Consequences

- Release builds contain no simulated credential path; debug builds are explicitly identifiable on
  screen and in code.
- `ShomaraLaunchState` finally has a producer and a consumer; the splash gate is the only
  `Resolving` surface.
- The root now paints `ShomaraTokens.ColorCanvas` explicitly, because the launch window's cream
  background would otherwise show through any screen that does not paint its own background.
- **Dependency change (AGENTS rule 11):** `:app` gains `testImplementation(libs.kotlinx.coroutines.test)`
  (version already in the catalog at 1.8.1, already used by other modules) so the launch controller
  can be driven deterministically with `TestScope`. Test-only; no runtime or shipping impact.
- **Contract change (AGENTS rule 11):** `RestoreOutcome` gains `BackendUnavailable` so
  "no backend configured" is never reported as "offline" or "rejected". Existing values keep their
  meaning; `ShomaraTokenPolicy` is unchanged.
- Owner decision still open: whether the DEBUG simulation should remain after I2 (backend
  configured), and whether the 600 ms new-user hand-off is kept.
- Not yet done: device screenshot evidence that the splash is visible (the emulator's capture
  cadence did not catch the splash window), and an instrumented Compose assertion for it.