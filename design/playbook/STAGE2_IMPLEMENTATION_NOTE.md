# Stage 2 Implementation Note — Path / Station Start (Families 06-07)

Branch: `step-zero/n08-reconciliation` (PR #3, draft)
Rule for this batch, per the owner's changed workflow: a large batch is
implemented and completed first; the owner then gives ONE local report.
No local report was requested for any small change in this batch, and
no ledger was changed: no edit to `START_HERE.md`,
`harness/roadmap.json`, `harness/WORKLOG.md`, or any backlog/ledger,
and no row was moved to `TESTED_NATIVE`. Those happen only after the
owner's local report, with evidence for the same row.
Stage 1 (families 01-05, 17, 16) is on the same branch; see
`STAGE1_IMPLEMENTATION_NOTE.md`. Stage 2 does not start N08-09: the
other 24 stations are not authored until N08-08 closes.

## Changes in this batch

1. `1b7ed19` — `apps/android/feature/path/.../ShomaraPathGraph.kt`
   Family 06, presentation only (no logic change):
   - Header with one calm progress layer: a track filled from the
     layout start (right in RTL), fraction rendered from the
     server-provided completed set only, and visible text
     "ایستگاه‌های باقی‌مانده: X" in Persian digits, or "مسیر کامل شد"
     when none remain. No %, no score, no second progress layer.
   - Static cameo: Main pose 1, Inline slot, decorative, from the
     4 shipped drawables. The hero remains the single Current node.
   - Node rows: minimum touch height `ComponentTouchMin` (48dp),
     a 48dp node circle (ordinal in Persian digits, or ✓ for
     completed/perfect), and a visible state label under each title,
     so state is never carried by colour alone. TalkBack labels are
     unchanged. Only the Current node uses Featured depth; completed
     (review) nodes do not shine, so review is not a separate shiny
     mode. Locked nodes stay tappable with the locked explanation.
   - RTL note in code: Row order starts on the right, progress fill
     aligns to layout start, digit strings and operation order are
     never mirrored. Offline still maps every node to Locked in the
     existing logic (kept, because `ShomaraPathGraphTest` asserts it)
     and the existing offline banner explains it.

2. `7b60d28` — `apps/android/feature/path/.../ShomaraStationStart.kt`
   Family 07, presentation only (no logic change):
   - Character in a frame: Main pose 1, Inline slot, static, inside
     a bordered SurfaceAlt frame next to the title. No new pose.
   - Concise lesson goal: the catalog working title itself is the
     goal line, with the existing metadata line
     (station ordinal / 25 — chapter label). No goal description was
     invented, and no unauthored station is faked as available.
   - Locked state: exactly one dismissing action. The
     "متوجه شدم" CTA already dismisses, so the separate "بستن"
     button is now omitted when locked. Ready/Resume keep one
     primary CTA plus the ghost close (one primary, not two).
   - Jump sheet targets: minimum touch height `ComponentTouchMin`
     (48dp) and a visible state label under each title, so jump
     state is not colour/border only. Jump candidates still stay
     inside the station's own chapter, locked targets still cannot
     be confirmed, and offline/error still block confirmation.

## What was read and deliberately left unchanged, and why

- `ShomaraPathGraphLogic` / `ShomaraStationStartLogic` / jump logic:
  server truth, single Current, perfect-implies-completed, locked
  tappability, and the offline-to-Locked mapping are all existing
  behaviour covered by `ShomaraPathGraphTest` and
  `ShomaraStationStartTest`. Changing them would change product
  logic, not presentation, and would break those tests.
- Station titles: provisional working titles from
  `ShomaraStationCatalog` (CONTENT-004). No new title was invented.
- `ShomaraTokens.kt` / generated files: never hand-edited.
- Splash artwork, character whitelist, and all ledgers: untouched.
- `ShomaraChildShellHost`: read only in search results; its path
  hosting was not changed in this batch, because the path screen
  itself carries the family 06 changes. If shell-level path wiring
  needs a change in a later batch, that file must first be read
  in full.

## Files not fully read, therefore not edited

- `ShomaraChildShellHost.kt` (full text not re-read in this batch;
  only its path-related role was confirmed via search).
- Any file outside `feature/path` other than the design-system
  character/token APIs already verified in Stage 1.

## Guardrails applied

Tokens v2 only (canvas `#FFF8EF`, primary `#0C7A54`); no magic
values added (all sizes/spacings come from `ShomaraTokens`);
minimum touch 48dp; contrast via existing token pairs; reduced
motion untouched (no new animation was added); RTL root with
maths LTR; no mastery/unlock/Station Pass/answer logic in UI;
no answer key in the child client; no lives, punitive streaks,
stars-as-currency, coins/gems, shops, loot boxes, leaderboards,
child-facing badges, expiring timers, "one more lesson" nudges,
or guilt/loss language. No file deleted, no drawable moved or
renamed, no pose invented.

## Remaining for the owner's single local report (NO PASS claimed)

No Android build was run in this environment, so no gate below is
claimed green. After pulling the branch, the owner reports in one
round:
- `git status --short --branch`, `git log -3 --oneline`,
  `node tools/harness.mjs validate`, `status`, `next`, `resume`
- `npm run verify:static:all` (final verifier count),
  `npm run build:packages`, `npm run typecheck:all`, `npx vitest run`
- `npm run android:doctor`, `npm run android:gate` (unit/lint/compile
  with exit codes)
- Native screenshots at 360/390/412dp plus 200% font for: path
  (fresh / current / completed / locked / offline, with the new
  progress header and node circles), station start (ready /
  resume / locked with the single dismiss action / offline / error),
  and the jump sheet
- Device TalkBack walkthrough: locked nodes read as "قفل", not
  "غیرفعال"; current node announced as current; progress header
  announced as remaining stations, not a percentage or score
- The still-pending step-zero ledger edits (START_HERE / roadmap /
  WORKLOG) and the `native/n08-ux-completion` vs `main` comparison
  from `STEP_ZERO_RECONCILIATION.md`

Only after that report may backlog rows move to `TESTED_NATIVE`,
and only for rows with evidence for that row. Stage 3 (player for
ST07 only, families 08-11 and intro 13) starts only after Stage 2
is closed in the same way.
