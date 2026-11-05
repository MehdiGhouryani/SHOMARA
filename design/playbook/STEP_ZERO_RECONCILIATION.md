# Step Zero — Reconciliation Record (SHOMARA, N08)

Status: RECORD ONLY. This file does not change any ledger status, does not
close any task, and does not move, rename, or delete any file.
No UI code, no drawable, and no deletion is included in this step-zero branch.

Base: `main` at `8f4411185ecd43581f19074d88c5b986633a82fc`
Working branch in roadmap: `native/n08-ux-completion`
Current task in roadmap: `N08-06`

## 1. Counting rule for N08 — must be recorded, not assumed

- `harness/roadmap.json` (live read, 2026-11-05) for N08:
  5 DONE (N08-01, N08-02, N08-03, N08-04, N08-05)
  + 1 DONE_WITH_BLOCKER (N08-13)
  + 1 IN_PROGRESS (N08-08)
  + 6 TODO (N08-06, N08-07, N08-09, N08-10, N08-11, N08-12)
  = 13 tasks in total.
- `START_HERE.md` says `N08_7_OF_13_DONE`.
- The seventh item is only explained if N08-15 is counted:
  N08-15 (splash / launch state / DEBUG-only simulated OTP) exists in code
  and in `harness/WORKLOG.md` as IN_PROGRESS, but it is absent from
  `harness/roadmap.json` and from `START_HERE.md`.
- Rule to apply when the ledger is next updated (not yet applied here):
  register N08-15 in `roadmap.json` with its real status, then make
  `START_HERE.md` and `roadmap.json` show the same number. Until then,
  neither "6 of 13" nor "7 of 13" is quoted as the verified count.
- A task being DONE is not the same as a backlog row being TESTED_NATIVE.
  A row in `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv`
  changes only with evidence for that row.

## 2. N08-15 — real status, not guessed

- Implemented in debug: splash artwork via `ShomaraSplashDrawables`,
  launch cream `#FDF4E5` (different from canvas `#FFF8EF`),
  artwork 941x1672, never stretched, cropped, or redrawn.
- DEBUG OTP provider is compiler-isolated: it lives only in the debug
  source set, the release wiring reports a null factory, and the
  simulated `sim-dev-session` token is rejected in production.
- Verifier `scripts/verify-demo-auth-isolation.mjs` explains the
  `verify:static:all` count moving from 89 to 90. That is a count change,
  not a contradiction — but the current count still needs a local run
  to be confirmed (see §9).

## 3. TalkBack — conflict recorded as unresolved

- `START_HERE.md` top table, row M13 (2026-11-04), says the N08-02
  TalkBack REAL gesture walkthrough blocker was closed on an emulator.
- Snapshot entries in the same file say the real TalkBack gesture path
  is honestly still `NATIVE_PENDING` and only semantics tests exist.
- This step-zero record does NOT claim TalkBack PASS.
  TalkBack is a device gate, not a semantics gate. Its status stays
  `UNVERIFIED` / `NATIVE_PENDING` until a device run is reported.
- Invariant to check in that device run (from MASTER_EXECUTION):
  a touchable locked node must be read as "locked", not as "disabled".

## 4. Characters — three layers, kept separate

- Handoff source: 5 families x 18 files = 90 WebP in
  `docs/design-handoff-2026-10/assets/characters/` (Dana, Fandogh,
  Main, Number, Roka), 800x800 with alpha, under 70KB.
- Runtime today: only 4 drawables in
  `apps/android/core/designsystem/src/main/res/drawable-nodpi/`
  (`shomara_char_main_01.webp`, `shomara_char_main_10.webp`,
  `shomara_char_number_01.webp`, `shomara_char_number_17.webp`),
  plus `shomara_splash_artwork.png` (which must stay untouched).
- Enum today (`ShomaraCharacter.kt`): only Main and Number, poses 1-18.
  Dana, Fandogh, and Roka are in the ADR-0035 cast but not in the enum.
- Proposed canonical runtime path (NOT applied yet):
  `apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_<family>_<NN>.webp`
  with the whitelist in `ShomaraCharacterDrawables.kt`.
  Existing 4 files are not renamed in step zero.
- Runtime-vs-handoff sha256 / dimensions / alpha were not compared
  here; the word "lossless" in code comments is not repeated as fact
  until that comparison is done locally or from the repo files.
- Main / Number / Roka background-removal artefacts (faint foot shadow;
  Roka also a faint piece near the tail and a pink shadow under the
  foot) are a format issue for the designer, not a design change.
  Use the current files meanwhile, only where the page contract allows.

## 5. Me avatar — separate system, pending owner decision

- `ShomaraMeScreen` default avatar comes from an abstract preset
  catalog (sun / leaf / cloud / moon; default = sun), not from a
  character WebP. The catalog mirrors `CHILD_AVATAR_PRESETS`.
- The preset system and the character system stay separate until the
  owner decides whether Me migrates to character poses. No character
  pose is presented as an avatar preset in step zero.

## 6. Stale text in ZCODE.md — to be replaced, not silently ignored

- `ZCODE.md` still says: until N02-07 is really green, do not change
  any `NATIVE_PENDING` row and do not start N03.
- The current phase is N08. That paragraph must be replaced with a
  reference to the current N08 status when the ledger update is made.
  `design/playbook/ZCODE_MASTER_PROMPT.md` must be aligned at the same
  time, or a later agent will return to N02.

## 7. Font and splash — resolved facts, open supply

- Expo Vazirmatn is an npm dependency loaded via expo-font
  (400 / 600 only), not a committed TTF. The Native font gap remains:
  Native needs an owner-approved TTF in `res/font`; a random download
  is forbidden (ADR-0037).
- Splash artwork usage is confirmed (see §2). The P1 Welcome hero
  image prompt is a separate image; it does not replace the splash file.

## 8. N09 / N10 and content scope — summary only

- `docs/roadmap/SHOMARA_NATIVE_ROADMAP_FA.md` gives N09 (Cutover) and
  N10 (Release Readiness) only as summary gates, with no detailed
  gate text. They are not usable as an execution checklist yet.
- Only ST07 is a complete content pilot. The other 24 stations are
  not authored; N08-09 cannot start until N08-08 closes.
- Migrations total exactly 74 (0001-0074). Reward / mission /
  achievement concepts in migrations are server-side only and are
  not permission to show rewards in the child UI.

## 9. Still open — must be recorded as OPEN, not solved

- Owner decisions N08-08: CONTENT-005, CONTENT-006, CONTENT-007, CONTENT-016.
- Owner-approved Vazirmatn TTF; real transparent output for
  Main / Number / Roka; roles for Dana / Fandogh / Roka.
- Numeric pose-to-page mapping (see POSE_TO_PAGE_MAPPING_DRAFT.md).
- Persian digit / equation convention, confirmed with a Persian
  maths teacher; the `missions` decision; P4 threshold 3 of 4
  (draft under CONTENT-014); drawing tolerance (blocked on
  CONTENT-001 / 011).
- Local verification, still required before step zero closes:
  `git status --short --branch`, `git log -3 --oneline`,
  `node tools/harness.mjs validate`, `status`, `next`, `resume`,
  `npm run verify:static:all` (final verifier count),
  `git branch --show-current`, `git log --oneline main..HEAD`,
  `git log --oneline HEAD..main`, and whether
  `native/n08-ux-completion` is ahead of, behind, or equal to `main`.
  If no device is available, the result is BLOCKED_ENV, not a static PASS.
  A browser screenshot is never Native proof.

## 10. Guardrails for the stages that follow

Precedence: child safety -> product contract / server truth ->
approved content -> SHOMARA Design System -> inspiration principles ->
page taste. Tokens only from `packages/design-system/src/tokens.json`
block `v2` (canvas `#FFF8EF`, primary `#0C7A54`); never hand-edit
generated token files. Duolingo is principles only: adopt the linear
one-task lesson, manual no-timer progression, completed / current /
locked triple encoding, and a single bottom action; adapt with an
RTL-mirrored path, one calm progress bar (no %, no score), and kind
immediate feedback; reject lives, punitive streaks, stars-as-currency,
coins / gems, shops, loot boxes, leaderboards, quests, expiring timers,
and child-facing badges. Skills per stage: shomara-product-design,
shomara-design-system, shomara-screen-execution, shomara-android-build,
shomara-learning-content, as applicable.
