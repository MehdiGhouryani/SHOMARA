# Stage 4 Implementation Note — Practice / Profile / Settings / Guardian (Families 12, 14, 15)

Branch: `step-zero/n08-reconciliation`, draft PR #3. This note is not a
ledger and changes no status. No local or device gate was run here, so
no PASS is claimed; gates below are for the owner's later single local
report round, when the owner decides to act (the owner currently takes
no action).

## Beauty standard applied (what "principled, beautiful, attractive, standard" meant here)

- One focal object per screen, generous empty space, one primary CTA
  per decision state, and Clay used only semantically: soft borders
  for rows/cards, one featured header card in Me only, never depth on
  text, never depth as the only carrier of meaning, no pervasive
  blur or low-contrast shadow, no container for everything.
- Canvas `#FFF8EF`, primary `#0C7A54`, all colours/spacings/radii from
  v2 tokens only; no magic values added (checked: no `Color(0xFF` in
  any edited file). Vazirmatn stays `FontFamily.Default` until the
  owner supplies an approved TTF — the font is not faked.
- Preferred inset 24dp, minimum touch 48dp, normal-text contrast
  >= 4.5:1 via token pairs, reduced motion real (no new animation
  was added), RTL root with maths LTR, TalkBack headings on screen
  titles and section titles, and state never carried by colour alone.
- States reuse the Stage 1 `ShomaraStateSurface` / `ShomaraPagePlaceholder`
  language: static page placeholder for loading, banners for offline /
  error, warm empty guide — no raw developer error page, no endless
  spinner, no busy child-page background.

## What was read first, in full

Skills: shomara-product-design, shomara-design-system,
shomara-screen-execution, shomara-android-build; `design/MASTER.md`,
`design/INSPIRATION_GUARDRAILS.md`, step-zero reconciliation, pose
mapping draft, Stage 1/2/3 notes; `ShomaraPracticeHub.kt`,
`ShomaraPracticeCatalog.kt`, `ShomaraMeScreen.kt`,
`ShomaraSettingsScreen.kt`, `ShomaraParentBoundary.kt`,
`ShomaraChildShellHost.kt` (full text, including the parent-gate
wiring and the settings seeding fix), `ShomaraStateSurface.kt`,
`ShomaraCharacter.kt` (slots and `ShomaraCharacterImage` signature),
`ShomaraTokens.kt` (token names only, never edited), and the avatar
catalog in `Onboarding.kt` (sun / leaf / cloud / moon, default sun).

## Changes (display only; no logic, no state machine, no gate rule changed)

1. `ShomaraPracticeHub.kt` — family 12
   - Inset 16dp -> 24dp, vertical spacing 12dp -> 16dp.
   - Section headings with TalkBack heading semantics: "تمرین‌های
     قابل انجام" before available items, "تمرین‌های اخیر" upgraded
     from Caption to Body as a real section heading.
   - Practice rows gain an explicit minimum touch height of
     `ComponentTouchMin` (48dp).
   - Loading now shows the static `ShomaraPagePlaceholder` under its
     banner instead of a banner alone.
   - The hub list now scrolls (`verticalScroll`), so a 25-item list
     cannot clip on a small screen — this was a pre-existing layout
     risk, fixed here without changing any item or state logic.
   - No character (family 12 forbids it), no placeholder grid, locked
     items keep their warm reason and stay non-tappable as before;
     no unauthored station is faked as available.

2. `ShomaraMeScreen.kt` — family 14
   - Inset 16dp -> 24dp, spacing 12dp -> 16dp, screen title is a
     TalkBack heading.
   - The header card is the single featured surface: PrimarySoft with
     a primary border, child name, server progress line
     ("X از Y ایستگاه کامل شده" — no %, no score, no second
     progress layer), plus one small static Main pose 1 Inline
     character, decorative only. It is a guide, NOT the avatar.
   - The avatar preset was carried in `facts.avatar` but never
     rendered; it is now rendered as its label ("آواتار من: …").
     See the open item below: the shell host currently passes the
     default preset for every child, so this label reads "sun"
     until that wiring is fixed — that wiring is NOT claimed here.
   - Loading shows the static placeholder; Me rows gain a 48dp
     minimum touch height. No dark dashboard, no badge/star/streak.

3. `ShomaraSettingsScreen.kt` — family 15
   - Spacing 12dp -> 16dp; titles and section titles are TalkBack
     headings ("آواتار من", "تنظیمات").
   - Selected avatar state is now visible in three ways, never
     colour alone: a visible "✓" tick on the tile, a TalkBack
     content description "… — انتخاب‌شده", and a plain-text line
     "آواتار انتخاب‌شده: …" under the grid.
   - Toggle rows gain a 48dp minimum touch height.
   - Inset stays 16dp, recorded as an adaptive reduction, not a
     mistake: 4 x 72dp tiles + 3 x 8dp gaps = 312dp, which would
     exactly fill a 360dp screen at 24dp insets with no slack.
   - No locked-avatar economy exists in this catalog (all four
     presets are selectable, none implies a purchase), so there was
     no purchase meaning to cut. If the owner ever adds a locked
     avatar, it must be cut from scope if it implies buying — it
     must never be monetised in the child UI.

4. `ShomaraParentBoundary.kt` — family 15 guardian
   - Inset 16dp -> 24dp, spacing 12dp -> 16dp, titles are TalkBack
     headings; the lockout rule is stated honestly before any
     failure ("پس از چند تلاش ناموفق، ورود موقتاً قفل می‌شود.").
   - GATE LOGIC UNTOUCHED: `ShomaraParentGate(verifier = null)` in
     the shell host stays fail-closed; no bypass, no weakened
     check, no credential invented. `missions` stays unreachable
     and legacy. Parent home progress stays a plain count, no score.

5. NEW `design/playbook/IMAGE_REGISTRY.md`
   - The separate image list the owner asked for: P1-P7 plus S1
     (settings/guardian: NOT NEEDED) and an explicit NOT REQUESTED
     section. Every row is PENDING_OWNER with a full design prompt
     and the binding negative rules. No generated image was added
     to any drawable folder in this batch. Generation candidates
     (character-free scenes only): P1, P2, P3, P5, P7. Not
     candidates: P4 and P6 (owner delivery from approved artwork).
     Even candidates ship only after owner review.

## Deliberately not changed

- `ShomaraPracticeCatalog`, `ShomaraPracticeHubLogic`,
  `ShomaraMeLogic`, `ShomaraSettingsState`, `ShomaraParentGate`,
  and all shell-host wiring: logic, state machines, and the
  fail-closed gate are untouched, so existing JVM tests for the
  practice hub, Me, settings, and parent boundary are not disturbed.
- `ShomaraTokens.kt` / `tokens.generated.ts`: generated, never edited.
- Splash artwork, character whitelist, all ledgers: untouched.
- No station other than ST07 is touched in practice content;
  authoring the other 24 stations is not started (N08-09).

## Open items (not solved, not hidden)

- Me avatar wiring: `ShomaraChildShellHost` builds `ShomaraMeFacts`
  with `ShomaraAvatarCatalog.defaultId` for every child, not the
  persisted settings choice. Fixing that means hoisting the
  persisted settings state into the Me tab (the settings tab
  already reads the real DataStore store, with its seeding fix);
  it is a wiring change, not a display change, and it needs a full
  re-read of the host at that time plus a test for "chosen moon
  survives relaunch and shows in Me". Until then, Me's avatar label
  is the caller-provided preset, and this note does not claim it is
  the saved choice.
- Owner decisions N08-08 (CONTENT-005/006/007/016); Vazirmatn TTF;
  real transparent output for Main/Number/Roka; numeric pose
  assignments beyond pose 1; guardian credential/verifier;
  step-zero ledger edits (START_HERE / roadmap / WORKLOG) and the
  `native/n08-ux-completion` vs `main` comparison.
- All IMAGE_REGISTRY rows are PENDING_OWNER.

## Gates still to run (later, in one round, not claimed here)

`git status --short --branch`, `git log -3 --oneline`,
`node tools/harness.mjs validate/status/next/resume`,
`npm run verify:static:all`, `build:packages`, `typecheck:all`,
`vitest run`, `npm run android:doctor`, `npm run android:gate`
(unit/lint/compile with exit codes), Native screenshots at
360/390/412dp plus 200% font for: practice tab (list / locked /
empty / loading / offline), Me (ready with header card and avatar
label / loading / empty), settings (avatar grid with visible
selected tick, toggle, save states), parent gate (idle / failed /
locked-out) and parent home; TalkBack walkthrough (section
headings, selected avatar announced as selected, locked practice
reason read, parent gate never announces a bypass); reduced-motion
and process-recreation checks; and a 360dp check that the settings
avatar grid (4 x 72dp) does not overflow at 200% font.

## Owner emphasis, recorded for Stage 4 and for every later stage

On 2026-11-05 the owner stressed, as a standing instruction for this
stage and for all later stages, that the UI must be reviewed,
rewritten, and improved across ALL stages and ALL pages, because the
current UI is severely weak and has no appeal for children at all.
That emphasis is recorded here and applies beyond Stage 4; it does
not change any guardrail, it raises the bar inside the guardrails.

What the higher standard means, in concrete terms, for every page
(families 01-17), and what was already applied to Stage 4 families
12 / 14 / 15 in this batch:

- Clear hierarchy first: one focal object, one primary CTA per
  decision state, section headings that TalkBack can traverse, and
  generous empty space — before any decoration is added. Stage 4
  applied this as: section headings in practice and settings,
  one featured header card only in Me, and 24dp preferred insets
  (16dp in settings only by the documented 312dp-grid arithmetic).
- Warm token colours, never a new palette: canvas `#FFF8EF`,
  primary `#0C7A54`, PrimarySoft header, Surface / SurfaceAlt rows,
  all from v2 tokens. Warmth comes from the canonical palette and
  from generous spacing, not from saturation, busy backgrounds, or
  low-contrast shadows.
- Large tactile targets: 48dp minimum everywhere, 72dp avatar tiles
  in settings, 72dp Inline character slot in Me. In learning
  families the manipulative band stays 72-80dp. A child page is
  never made "attractive" by shrinking targets to fit more
  decoration.
- Calm character cameos ONLY where the page contract allows them:
  small, static, decorative, pose 1 from the 4 shipped drawables.
  Stage 4 applied this in Me only. Practice (12) has no character
  by contract, settings avatars stay the abstract preset system,
  and the guardian surface has no character at all. A cameo that
  is not allowed by the contract is not added for the sake of
  "appeal", and no new pose is invented.
- Semantic Clay depth only: soft borders for rows/cards, one
  featured surface per decision viewport, never depth on text,
  never depth as the only carrier of meaning, no pervasive blur.
  The "delete and see" test from INSPIRATION_GUARDRAILS still
  applies: any decoration whose removal makes the task clearer
  does not come back.

What child appeal must NEVER come from, in any stage:

- Lives / hearts, punitive streaks, stars-as-currency, coins /
  gems, shops, loot boxes, leaderboards / leagues, child-facing
  badges, quests, expiring timers, daily-goal rings for the child,
  guilt-framed reminders, or a flashy assessment. Assessment stays
  the quietest family (dial 2/2/3) in every stage, including Stage 5.
- Reskinned versions of any of the above: a "flower", a "gem-like
  leaf", or a "friendly chest" that functions as currency, a
  streak, or a randomised reward is still rejected.
- Fake progress: a second progress layer, a percentage, a score,
  a badge, or a streak count shown to the child, even if the
  underlying data is real.

How Stage 4 was re-checked against this higher standard:

- Practice: appeal comes from warm PrimarySoft-free calm rows,
  clear section headings, large 48dp rows, a scrollable list, and
  a warm locked reason — not from a character (forbidden here),
  not from a badge, and not from a placeholder grid.
- Me: appeal comes from the single warm header card, the small
  static guide, the child's name, and real progress in words —
  not from a dashboard, a score, or a streak.
- Settings / guardian: appeal comes from clarity — a visible
  selected tick stated in text, calm textual sections, and an
  honest lockout rule — not from decoration on an adult surface.
- Images: appeal is not faked with an image in this batch. Every
  image need is in IMAGE_REGISTRY.md as PENDING_OWNER, and no
  generated image was shipped to runtime.

## What continues in Stage 5 (global hardening)

The full review of ALL pages (families 01-17) continues in Stage 5
(global hardening), under this same higher standard. Stage 5 is
not a new feature stage; it is the pass that re-reads every
family against the checklist above and fixes what Stages 1-4 left
uneven:

- 01-05, 17, 16 (Stage 1): re-check hierarchy, insets, and state
  surfaces after the later stages land, so entry/shell/states do
  not drift from the practice/profile/settings language.
- 06-07 (Stage 2): re-check the path header, node circles, and
  station-start frame against the Stage 4 section-heading and
  touch-target language.
- 08-11, intro 13 (Stage 3): re-check stage chrome, the quiet
  assessment chrome, the result surface, and the challenge intro
  — with assessment staying the quietest family throughout.
- 12, 14, 15 (this stage): re-check practice, Me, settings, and
  the guardian gate together with the shell, including the open
  Me-avatar wiring item above and the 360dp / 200%-font avatar
  grid check.
- Cross-cutting: one token audit (no magic values anywhere),
  one TalkBack traversal audit, one reduced-motion audit, one
  RTL / maths-direction audit, and one "no reward economy"
  audit across all 17 families, before any row moves to
  TESTED_NATIVE. That audit is recorded in the Stage 5 note, not
  claimed here.
