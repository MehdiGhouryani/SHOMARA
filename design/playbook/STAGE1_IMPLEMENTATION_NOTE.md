# Stage 1 Implementation Note — Entry / Shell / States (Families 01-05, 17, 16)

Branch: `step-zero/n08-reconciliation` (PR #3, draft)
Rule for this batch, per the owner's changed workflow: a large batch is
implemented and completed first; the owner then gives ONE local report.
No local report was requested for any small change in this batch, and
no ledger was changed: no edit to `START_HERE.md`,
`harness/roadmap.json`, `harness/WORKLOG.md`, or any backlog/ledger,
and no row was moved to `TESTED_NATIVE`. Those happen only after the
owner's local report, with evidence for the same row.

## What was already correct (read, verified, left unchanged)

- `ShomaraTheme`: RTL pinned at the root, maths LTR opt-in, all values
  through generated `ShomaraTokens`; font stays `FontFamily.Default`
  until the owner supplies an approved Vazirmatn TTF (ADR-0037).
- `ShomaraTokens.kt` / `tokens.generated.ts`: generated — never
  hand-edited in this batch.
- Splash (`ShomaraSplashDrawables` / `ShomaraSplashScreen` /
  `ShomaraSplashSpec`): untouched. Artwork 941x1672, launch cream
  `#FDF4E5`, never stretched or cropped.
- Character whitelist: unchanged. Only the 4 shipped drawables are
  used, always pose 1 in this batch; no new pose was invented.
- `ShomaraButton` / `ShomaraTextField` / `ShomaraOtp` / `ShomaraDialog` /
  `ShomaraFeedback`: 48dp minimum touch target (56dp button minimum),
  LTR OTP cells with per-digit TalkBack labels, persistent field
  labels, warm non-shaming feedback, state never carried by colour
  alone, duplicate-tap guard.
- `ShomaraChildShell`: canonical three tabs (مسیر / تمرین / من),
  re-select is a no-op, Back is deterministic.
- `ProfileContract` / `ProfilePlacement` / `OnboardingA11y`: avatar
  default stays the abstract sun preset (not a character pose),
  locked grades are explained and never selectable, placement
  decision stays server-authoritative.
- `MainActivity`: single activity, edge-to-edge, canonical canvas
  root. `FoundationScreen` is not a child page and was left unchanged
  so its existing test surface is not disturbed.

## Changes in this batch (all on the step-zero branch)

1. `ccf1269` — NEW `apps/android/core/designsystem/.../ShomaraStateSurface.kt`
   Family 16 shared state surface: Loading renders a static page
   placeholder (fixed bars, no animation, so reduced-motion safe by
   construction); Offline / Error / Empty render one title, one body,
   one primary retry CTA, at most one ghost escape. A character is
   optional, small, and static. No state is decided here; the caller
   owns the kind, copy, and whether retry is real.
2. `a841a1d` — same file: optional warm `hint` slot (Recovery
   banner), added so the launch recovery copy is preserved exactly.
3. `0ff1eac` — `apps/android/app/.../launch/ShomaraLaunchGate.kt`
   Family 16: launch recovery is now rendered through
   `ShomaraStateSurface` with the same copy (Offline/Error titles,
   bodies, hints, "تلاش دوباره", "شروع از اول"), same Main pose 1
   Lesson character, same retrying behaviour. No copy changed.
4. `4f4babf` — `feature/onboarding/WelcomePhone.kt`
   Family 01: Welcome character moves from Hero (180dp) to Lesson
   (84dp) — a small, static character. The hero of the screen is the
   welcome message and the single primary CTA, not the artwork.
5. `1fc3f31` — `feature/onboarding/ProfileScreens.kt`
   Family 04: profile guide moves from Lesson to Inline (72dp, the
   smallest slot) so it never overwhelms the form; it is a guide, not
   an avatar option — avatar options stay the abstract preset
   catalog (default sun).
   Family 05: the Number Hero character is removed from the
   placement screen entirely, because family 05 has no character by
   contract. Placement copy, skip behaviour, and the
   server-authoritative decision are unchanged.
6. `7610b5f` — `core/designsystem/ShomaraNavigation.kt`
   Family 17: an unselected tab now announces "انتخاب نشده" to
   TalkBack instead of having no state. Locked tabs still announce
   "قفل: …", never "disabled". Tab order, labels, 56dp touch height,
   and the re-select guard are unchanged.
7. `47d74ab` — `feature/onboarding/OnboardingHost.kt`
   Family 03: OTP step gains a real Resend button (reuses the server
   request, so the server throttle banner with remaining seconds IS
   the cooldown — no client-invented cooldown duration, and the code
   is never logged) and a Paste button (reuses
   `ShomaraOtpState.fillFromCode`, keeping digits in LTR cell order).
   The onboarding root gains `imePadding`, so the bottom CTA on the
   phone step is never hidden by the keyboard. OTP stays character-
   free, LTR, with the existing keypad.

## Guardrails honoured in every change

- Colours / spacing / shape only from v2 tokens
  (canvas `#FFF8EF`, primary `#0C7A54`); no magic values added.
- Minimum touch target 48dp; preferred inset 24dp; normal-text
  contrast >= 4.5:1 via token pairs; reduced motion real.
- RTL root with maths LTR; no mirroring of digit order, number
  lines, or operation order.
- No mastery / unlock / Station Pass / answer-correctness logic in
  UI; no answer key in the child client; no lives, punitive streaks,
  stars-as-currency, coins / gems, shops, loot boxes, leaderboards,
  child-facing badges, expiring timers, or guilt / loss language.
- No file deleted, no drawable moved or renamed, no splash change,
  no generated-file edit.

## Files read only by search / grep, not fully read, therefore not edited

- `ShomaraSplashScreen.kt`, `ShomaraSplashSpec.kt`,
  `ShomaraMotion.kt`, `ShomaraReducedMotion.kt`,
  `ShomaraBackHandler.kt`, `ShomaraCard` / `ShomaraChoiceTile`
  (referenced by ProfileScreens): their public contracts were
  confirmed by search, but their full bodies were not re-read in
  this batch, so no change was made to them. They are candidates
  for a full read in the next batch if a change there becomes
  necessary.

## Still required: the owner's single local report (not yet done)

Because no Android build runs in this environment, NO gate below is
claimed PASS. After pulling this branch, the owner runs once and
reports:
- `git status --short --branch`, `git log -3 --oneline`,
  `node tools/harness.mjs validate`, `status`, `next`, `resume`
- `npm run verify:static:all` (final verifier count),
  `npm run build:packages`, `npm run typecheck:all`, `npx vitest run`
- `npm run android:doctor`, `npm run android:gate`
  (unit / lint / compile evidence, exit codes)
- Native screenshots at 360 / 390 / 412dp plus 200% font, for:
  Welcome, Phone, OTP (incl. resend + paste), Profile, Placement,
  shell tabs, launch recovery, and the new state surface
  (loading / offline / error / empty)
- Device TalkBack walkthrough (including the new unselected-tab
  announcement and locked-tab "قفل" announcement), predictive back,
  process recreation, and the phone-step CTA with the keyboard open
- Confirmation that `native/n08-ux-completion` vs `main` and the
  step-zero ledger edits (START_HERE / roadmap / WORKLOG) are still
  pending, as recorded in STEP_ZERO_RECONCILIATION.md

Only after that report may backlog rows move to TESTED_NATIVE, and
only for rows with evidence for that row. Stage 2 (path / station
start, families 06-07) starts only after Stage 1 closes that way.
