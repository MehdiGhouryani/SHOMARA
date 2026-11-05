# Stage 5 Implementation Note — Global Hardening: Full Review of All Pages (Families 01-17)

Branch: `step-zero/n08-reconciliation`, draft PR #3. This note is not a
ledger and changes no status. No local or device gate was run here, so
no PASS is claimed; gates below are for the owner's single local report
round, which comes after this batch (the owner currently takes no action).

## Batching rule applied in this stage (new owner instruction)

Files in this stage were written in ONE push (push_files), not one
commit per file, so the number of GitHub approval cards is minimised.
This stage does not stop for a local report or a separate approval:
after Stage 5 the work is ready for the next stage, and the local
report round belongs to the owner, in one round, after the batch.

## What was re-read first, in full

Skills: shomara-product-design, shomara-design-system,
shomara-screen-execution, shomara-android-build; `design/MASTER.md`,
`design/INSPIRATION_GUARDRAILS.md`, step-zero reconciliation, pose
mapping draft, IMAGE_REGISTRY, and Stage 1-4 notes. Files re-read in
full for this audit: ShomaraStateSurface, ShomaraLaunchGate,
WelcomePhone, ProfileScreens, OnboardingHost, ShomaraNavigation,
ShomaraPathGraph, ShomaraStationStart, ShomaraLessonStageChrome,
ShomaraChallengeIntro, ShomaraLessonHost, ShomaraPracticeHub,
ShomaraMeScreen, ShomaraSettingsScreen, ShomaraParentBoundary,
ShomaraChildShellHost, plus the Stage 1 gap files now closed:
ShomaraMotion, ShomaraReducedMotion, ShomaraSplashScreen,
ShomaraSplashSpec, ShomaraBackHandler, ShomaraCard, ShomaraButton,
ShomaraTheme, ShomaraCharacter, and the ShomaraMeTest.

## Changes in this batch (one push; display + one wiring fix, no logic change otherwise)

1. Me-avatar wiring — FIXED (the Stage 4 open item), not just displayed
   - `ShomaraChildShellHost.kt`: the Me tab now collects
     `settingsStore.state` (with `ShomaraSettingsSnapshot.Defaults`
     as the initial value, exactly like the settings tab) and builds
     `ShomaraMeFacts` with
     `ShomaraMeAvatarWiring.resolve(persistedMe.avatarId)` instead of
     the catalog default. Before this change every child always saw
     "sun" in Me, even after choosing "moon" in settings.
   - `ShomaraMeScreen.kt`: new pure resolver
     `ShomaraMeAvatarWiring.resolve(persistedAvatarId)` — known ids
     resolve verbatim, unknown ids fall back to the catalog default
     instead of crashing the Me surface. The store already validates
     ids, so the fallback is defensive only. The old comment claiming
     the host passes the default is replaced with the Stage 5 fact.
   - `ShomaraMeTest.kt`: two new tests — "moon resolves to moon
     (label ماه), sun resolves to sun" (the "chosen moon survives
     relaunch and shows in Me" wiring test at resolver level) and
     "unknown id falls back to the catalog default". A full Compose
     relaunch test on a device/emulator remains for the local round:
     choose moon, relaunch, open Me, confirm the label reads moon.
     That device step is NOT claimed here.

2. Path (family 06) — inset and TalkBack unification
   - `ShomaraPathGraph.kt`: screen inset 16dp -> 24dp, spacing
     12dp -> 16dp, matching Stage 4 language. Screen title and
     chapter labels gain TalkBack heading semantics.
   - Node TalkBack: content = station title, state = state label for
     EVERY state (previously state was only announced for Current).
     A locked node is now announced as locked, a completed node as
     completed, and so on — never colour alone, never "disabled".

3. Lesson host (families 08-11) — inset unification
   - `ShomaraLessonHost.kt`: screen inset 16dp -> 24dp, spacing
     12dp -> 16dp, matching Stage 4 language. No logic, no banner,
     no submit-gate change.

4. Station start / jump sheet (family 07) — spacing and TalkBack
   - `ShomaraStationStart.kt`: sheet spacing 8dp -> 12dp; jump-sheet
     title gains heading semantics; every jump target now announces
     its state label, plus "؛ انتخاب شد" when selected (previously
     only the selected row announced anything). Sheet padding stays
     16dp: a sheet is not a full screen, and 16dp is its documented
     frame — changing it to 24dp would not make it more standard.

5. Settings avatar grid (family 15) — 200%-font fix, no target shrink
   - `ShomaraSettingsScreen.kt`: the avatar row now fills the width,
     each tile takes equal weight with a MINIMUM height of 72dp
     instead of a fixed 72dp size, so at 200% font the tile grows
     taller instead of clipping its label. Width at 360dp stays
     ~76dp (360 - 32 insets - 24 gaps, / 4), so no target drops
     below 48dp. The unused `size` import was removed.
   - The 16dp screen inset in settings stays, for the documented
     reason: 4 x 72dp tiles + 3 x 8dp gaps = 312dp, which exactly
     fills a 360dp screen at 24dp insets with no slack.

6. Deliberately NOT changed, with reasons
   - `OnboardingHost.kt` root inset stays 16dp: it is a frame, and
     its child screens already carry their own 24dp inset, so the
     total onboarding inset is already generous. Raising the frame
     to 24dp would make it 48dp total and drift FROM the other
     screens, not toward them.
   - `ShomaraSplashScreen.kt`, `ShomaraMotion.kt`,
     `ShomaraReducedMotion.kt`, `ShomaraBackHandler.kt`,
     `ShomaraCard.kt`, `ShomaraButton.kt`, `ShomaraTheme.kt`:
     read in full in this batch (closing the Stage 1 gap), found
     correct, left unchanged. Splash motion is already gated:
     under reduced motion it snaps to a fixed band and no tween
     runs at all; the Native client ships almost no decorative
     motion anywhere else.
   - No adapter / journey / submit / gate / parent-gate logic, no
     station content, no splash artwork, no character whitelist,
     no generated token file was touched.

## Audits (results recorded, not PASS claims)

- Token audit: grep over all Stage 1-5 edited files found NO
  `Color(0xFF` literal and NO raw `.dp` size in screen code (the
  only `.dp` uses are in `ShomaraTheme.kt`, converting token levels
  to elevations, which is the token system itself). All colours,
  spacings, radii, and touch sizes come from `ShomaraTokens`.
  Result: PASS by source inspection only; a lint/compile run in
  the local round is still required.
- TalkBack audit: screen and section titles carry heading
  semantics in Welcome/OTP-adjacent surfaces, StateSurface,
  Path (now, including chapter labels), LessonStageChrome,
  Practice, Me, Settings, ParentBoundary, and Splash brand line.
  Unselected tab announces "انتخاب نشده", locked tab/node
  announces "قفل", never "غیرفعال". Selected avatar announces
  "انتخاب‌شده" in three ways (tick, TalkBack, text line).
  Locked practice reason is visible and announced via its row
  description. Device walkthrough still required.
- Reduced-motion audit: no new animation was added in any stage
  1-5 file. The only tween in the reviewed set is the splash
  progress bar, and it is fully suppressed under reduced motion
  (snap, no tween). StateSurface loading is a static placeholder
  by construction. Assessment chrome has no motion at all.
- RTL / maths-direction audit: RTL root, maths LTR, path fill from
  layout start (right in RTL), digit strings and operation order
  never mirrored, OTP cells LTR, number tiles LTR. No violation
  found in the reviewed files.
- No-reward-economy audit across all 17 families (by source
  search of the edited files): no lives, hearts, punitive streaks,
  stars-as-currency, coins/gems, shops, loot boxes, leaderboards,
  child-facing badges, quests, expiring timers, "one more lesson"
  nudges, or guilt/loss language in any edited surface. The only
  matches are comments and tests explicitly FORBIDDING those
  concepts, plus the result-surface comment "no score, no star".
  Assessment stays the quietest family (dial 2/2/3) in every stage:
  no character, no hint, no celebration cue, flat chrome.
  Progress shown to the child is always one calm layer in words
  (remaining stations, or "X از Y ایستگاه کامل شده") — no %,
  no score, no second layer, no streak count.
- 360dp / 200%-font audit: settings avatar grid fixed as above
  (grows, never clips, never shrinks below 48dp). All other
  reviewed screens already scroll or wrap (StateSurface scrolls,
  PracticeHub scrolls, Splash scrolls, onboarding scrolls in the
  OTP step); a device check at 200% font for every screen is
  still part of the local round, not claimed here.

## Beauty standard, re-checked across all pages

One focal object per screen, one primary CTA per decision state,
generous empty space, warm v2 tokens, large tactile targets
(48dp minimum, 72-80dp manipulatives, 72dp avatar/character slots),
calm character cameos ONLY where the page contract allows them
(pose 1 from the 4 shipped drawables, never a new pose), and Clay
depth only semantically (at most one featured surface per decision
viewport, never on text, never as the only carrier of meaning).
Child appeal in this batch comes from hierarchy, warmth, space,
and tactility — not from decoration, not from rewards, and not
from busyness. No generated image was added to runtime;
IMAGE_REGISTRY stays PENDING_OWNER for every row.

## Open items (not solved, not hidden)

- Owner decisions N08-08 (CONTENT-005/006/007/016); P4 threshold
  3 of 4 draft under CONTENT-014; drawing tolerance blocked on
  CONTENT-001/011; Vazirmatn TTF (owner-supplied); real transparent
  output for Main/Number/Roka; numeric pose assignments beyond
  pose 1; guardian credential/verifier (gate stays fail-closed);
  all IMAGE_REGISTRY rows PENDING_OWNER.
- Step-zero ledger edits (START_HERE / roadmap / WORKLOG) and the
  `native/n08-ux-completion` vs `main` comparison, still pending
  from STEP_ZERO_RECONCILIATION.md.
- Server lesson options for all five stages (still empty),
  server hint content for P2/P3, and the 41 ST07 visual assets
  (described, not delivered) — the real blockers for rendering
  lesson content, not UI polish.
- Files still not fully re-read (from earlier stages, untouched
  here): none of the Stage 1-5 edited files remains unread; files
  outside those stages were not audited in this batch and must be
  read in full before any future edit to them.

## Gates still to run — the owner's single local round, after this batch

No Android build was run here, so NO gate is claimed PASS. After
this batch, in one round, the owner reports: `git status
--short --branch`, `git log -3 --oneline`,
`node tools/harness.mjs validate/status/next/resume`,
`npm run verify:static:all`, `build:packages`, `typecheck:all`,
`vitest run` (including the two new ShomaraMeTest wiring tests),
`npm run android:doctor`, `npm run android:gate` (with exit
codes), Native screenshots at 360/390/412dp plus 200% font for:
Welcome, Phone, OTP, Profile, Placement, shell tabs, launch
recovery, path (fresh/current/completed/locked/offline), station
start (ready/resume/locked/offline/error) and jump sheet, lesson
P1 header, P4 quiet chrome, result surface, challenge intro,
practice (list/locked/empty/loading/offline), Me (with the moon
avatar label after relaunch), settings (avatar grid at 200%
font), parent gate (idle/failed/locked-out) and parent home;
device TalkBack walkthrough (all states announced, never
colour-only); reduced-motion, predictive-back, and
process-recreation checks. Only after that report may backlog
rows move to TESTED_NATIVE, and only for rows with evidence for
that row. Stage 5 does not stop for that report: the work is
ready for the next stage, and the report round belongs to the
owner when the owner decides to act.
