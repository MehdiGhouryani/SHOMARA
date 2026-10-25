# Independent Review — Stage U closing (`ui/u8-closing`)

- **Date:** 2026-10-25
- **Reviewer role:** independent, read-only vs the author's checkout. All analysis and gate re-runs were done in a detached review worktree at `../review-u8` (`git worktree add --detach ../review-u8 c4a19f5`; the branch itself was checked out in the author's worktree, so a detached checkout of the same commit was used — identical tree).
- **Branch under review:** `ui/u8-closing` = `c4a19f5`, lineage verified exactly as claimed:
  `main 8206cff` ← `ui/h1-toolchain cf70961` ← `ui/u5b-question-wiring d6bed8f` ← `ui/u6-result-challenge 8fbe510` ← `ui/u7-practice-me c228937` ← `ui/u8-closing c4a19f5` (each commit's parent = previous tip; `git log --format="%h %p"` confirms).
- **Review environment:** Windows, Node `v22.16.0` (same as the author's machine, per the evidence logs), `npm ci` exit 0 (fresh install in the review worktree).
- **Not done (by instruction):** no `parity:goldens` run, no merge, no writes to the author's checkout. This report is the only file written.

---

## CHECK 1 — Environment truth

**Node version and the "deferred" claim — both true, no contradiction.**
- Evidence log `docs/archive/evidence/2026-10-25/u8-static-all.log:5` records: `note: Node 22.16.0 < 22.18 — running verifiers with --experimental-strip-types`.
- The mechanism, added in H1 (`scripts/verify-static-all.mjs:23-29`): for Node `major === 22 && minor < 18` every verifier is spawned with `--experimental-strip-types`, because some verifiers (phase-a/b) import contracts `.ts` source directly; on Node ≥ 22.18 type stripping is unflagged. The same checks run either way; only the flag differs.
- Therefore "every gate passed on Node 22.16.0" and "installing Node ≥ 22.18 is deferred to the owner (START_HERE §6.15 DEFERRED list)" are simultaneously true: the older Node runs the identical assertions with an experimental flag; the upgrade removes the flag dependency, it does not unlock any skipped check. The review rerun (below) printed the same note.

**Gate re-run in the review worktree — every number reproduces the author's table (START_HERE §3, SNAP-20261025-01):**

| Gate | Author's claim | Review rerun | Match |
|---|---|---|---|
| `npm ci` | exit 0 | exit 0 | ✔ |
| `build:packages` | exit 0 | exit 0 | ✔ |
| `typecheck:all` (9 workspaces) | all exit 0 | exit 0 | ✔ |
| `npx vitest run` | 420/420 (53 files) | **420 passed (53 files)** | ✔ |
| `verify:static:all` | 74/74 | **74/74** (same Node note) | ✔ |
| `npm run parity` | 29/29 | **29/29** | ✔ |
| `flow:onboarding` | 28/28 | **28/28** | ✔ |
| `flow:path` | 29/29 | **29/29** | ✔ |
| `flow:station` | 48/48 | **48/48** | ✔ |
| `flow:tabs` | 14/14 | **14/14** | ✔ |
| web build (`next build`) | exit 0 | exit 0 | ✔ |

No difference found. (Metro bundle was not in the re-run list; the author's `u8-expo-export.log` shows a real Android Hermes bundle, 1965 modules.)

## CHECK 2 — Learning rules (highest risk)

**Scope of the diff into learning surfaces** (`git diff main..ui/u8-closing -- apps/mobile/src packages`):
- `packages/`: only `packages/design-system/src/tokens.json` (+85 lines, measured token groups `ui.result`, `ui.challenge`, `ui.practice`, `ui.me`). **No contract changed** — `packages/contracts` is untouched.
- `apps/mobile/src/station/runtimeApi.ts`: 28 changed lines, **all content copy** («ستاره»→«مهره» per D-004; E02 option labels from star glyphs to numerals). The `submitAttempt` implementation, its payload, and the idempotency key derivation (`station01:v2:{installationId}:{sessionId}:{encounterId}:{contentVersionId}:{attemptNumber}`, `runtimeApi.ts:427`) are unchanged.
- `apps/mobile/src/station/StationFlow.tsx`: the substantive wiring change (D-001/D-002), analysed below.
- `apps/mobile/src/station/LessonPlayerChrome.tsx`: one-line display fallback for `SIGNATURE_CHALLENGE` (see CHECK 5).

**D-002 before/after — did server-visible behaviour change?** Yes, in one documented way; no, in every way that matters for learning truth.

- The submit call itself is **byte-identical** before and after (main `StationFlow.tsx` ~line 132 vs u8 `StationFlow.tsx:153`): `submitAttempt({ sessionId, encounterId, content: target, answer: { answerIndex, answerPayload: answerIndex }, attemptNumber })`, followed by the unchanged `setAttemptNumber((value) => value + 1)`. Since the key embeds `attemptNumber`, every submit — including a retry — carries a fresh attempt number and a fresh idempotency key, exactly as D-002 words it. No retry logic was added to the transport; the sheet's «دوباره امتحان کن» only clears the selection (`StationFlow.tsx:622-625`), and the next honest submit happens through the same unchanged `answerContent`.
- What changed is *client navigation after* the server's answer, and only for the three encounters on the approved pages (`QUESTION_ENCOUNTER_IDS = {E02, E04, E05}`, `StationFlow.tsx:50`):
  1. **D-001:** the stage transition that used to run inside `answerContent` now waits for the feedback sheet's action (`advanceAfterAnswer`). One submit per «بررسی» tap, as before; a selection sends nothing.
  2. **D-002:** a wrong answer whose server decision is `CONTINUE`/`STATION_PASS` may now lead to a **second submit on the same encounter** (attemptNumber+1). On `main`, a wrong E02/E04/E05 answer never re-submitted — the client advanced unconditionally. Also on `main`, the client **ignored** `selectedStep` for E04/E05 and always opened the next content; u8 follows a `RECOVERY`/`RECHECK` redirect. Both are the recorded, reversible delegated decisions D-001/D-002 (START_HERE §4), each with a named restore condition.
- This is **not** a BLOCKER: the client still never decides correctness or the next step — it reads `outcome.correct` and `outcome.selectedStep` from the server (`StationFlow.tsx:224, 242, 605-606`; grep over all new views/containers shows every `correct` reference reads the server outcome; `QuestionView`'s `choose|correct|retry` phase is display-only). The behaviour is pinned by the flow gate: `scripts/flow-station-run.mjs:154` asserts the retry is a second honest attempt (`attemptNumber === 2`, fresh idempotency key) and `:240` asserts idempotency-key uniqueness across the whole station. The mock learning server lives only in the parity flow harness (`apps/mobile/parity/flow/stubs/config-runtime.ts`) — a test-network edge stub, allowed by AGENTS §6 — and its simplified stationPass policy is honestly declared in START_HERE §6.13.

**`answerCheck` (E07/E08 multi-question path), recovery/recheck content routing for E07/E08/E10, and the `syncPending` handling are unchanged** (context-only in the diff).

## CHECK 3 — Scope

- **D-012/D-014 (chapter names / derived behaviours):** `apps/mobile/src/path/**`, `apps/mobile/src/pathModel*` and `packages/contracts/**` have an **empty diff** `main..u8` — no station or chapter name, no derived behaviour was touched in this branch. The D-012 choice (real contract names, design-order colours) was implemented in U3, i.e. it is already part of `main` and recorded in START_HERE §4/U-Q10. Note for the record: the review brief's referenced authority `docs/content-spec/README.md` (R-06) **does not exist in this repository** (no `docs/content-spec/` directory); no change was needed to stay inside it.
- **D-008 (E11 stays on the old renderer):** confirmed. E11 is not in `QUESTION_ENCOUNTER_IDS` (`StationFlow.tsx:50`), so the transfer encounter keeps the legacy renderer; START_HERE §6.15 lists the tray-less E11 page as DEFERRED. The flow gate drives that path: `scripts/flow-station-run.mjs:210` ("E11 transfer (legacy options) → E12 final mastery check") inside the 48/48 run.
- **Content and docs immutability:** `content/` — no changes. `supabase/` — no changes. `apps/web` — only `package.json` (script/dedup changes from H1). Under `docs/`, the only non-evidence change is a **new** file `docs/design-handoff-2026-10/pages-v1/goldens/checksums.json` (the H1 immutability pin). No golden PNG and no `rects.json` changed.

## CHECK 4 — Verifier weakening

Nothing was weakened to make a gate pass. Per-file table (effective assertion deltas from `git diff main..u8-closing -- scripts`):

| File | Before → after | Removed assertions | New waivers |
|---|---|---|---|
| `flow-run`, `flow-path-run`, `parity-run`, `runtime-tests`, `independent-verification` | unchanged | none (file-URL portability only) | — |
| `verify-phase2`, `verify-phase3`, `verify-uiux-phase6`, `verify-uiux-phase7` (root part) | unchanged | none (`URL.pathname` → `fileURLToPath`) | — |
| `verify-mobile-release` | unchanged | none (path-separator normalisation) | — |
| `verify-phase-d-practice-habit` | 6 hub markers + ONE_TAP_CARD → 3 contract markers + STREAK_IN_GOAL + HUB_CORE unchanged; `featureCard`/`habitLine` behind waiver; ONE_TAP_CARD accepts `onStart` or `onPress` to the same `openStation(recommended.stationId)`; «شروع همین حالا» static-literal dropped but now asserted behaviourally by `flow:tabs:52-53` (rendered button + navigation) | 2 source-literal checks (waived) | `practice-habit-card` |
| `verify-phase-e-me-surface` | 4 markers → 2 unchanged on `profile.tsx`; «دستاورد واقعی» and «با پیشرفت مسیر» **retargeted** to `strings.fa.ts` (where AGENTS rule 5 requires copy to live); new check `CHILD_ACHIEVEMENTS.map` added | none (relocated) | `profile-counter-copy`, `profile-action-subtitle` |
| `verify-uiux-phase7` | MIN_TOUCH_TARGET literal-grep skipped under waiver; behaviour still enforced by `apps/mobile/src/ui/touchTargets.test.ts` (48dp minimum, app-wide, runs in vitest) | 1 literal check (waived) | `practice-touch-tokens` |
| `verify-uiux-phase7-5` | «دیدن مسیر» required in web **and** mobile → web only under waiver; the tab bar replaces the link (flow:tabs checks navigation) | 1 half-check (waived) | `practice-see-path` |
| `verify-ui-v1-path` | `tabbar-variants` check re-pointed: was "both `soft` and `outlined` exist", now "no `variant` prop, `tabOutlined` present, `barHeight` present" — locking the **new** D-011 intent; both versions assert `barHeight` | none (intent moved with a recorded decision) | — |
| `verify-static-all` | no verifier removed; only adds the Node<22.18 flag logic | none | — |
| `parity-goldens` | now refuses to run without `--write` (deliberate-only generator) | none (generator, not verifier; removed from the static sweep in H1) | — |
| New: `verify-parity-goldens-pinned`, `verify-ui-v1-result`, `verify-ui-v1-tabs`, `flow-tabs-run`, extended `verify-ui-v1-question`, extended `flow-station-run` | +5 verifier components, +88 flow checks, +9 flow checks vs main | — | — |

**The five `tabs-waivers.mjs` entries** (all pinned by `verify-ui-v1-tabs.mjs:41-42` — `waivers-pinned` + `waivers-have-restore-plan`; each has verifier, feature, stillVerified, restoreIn):

| id | Justifying design page | Where the behaviour is still asserted |
|---|---|---|
| `practice-habit-card` | `13-practice.html` (rows + one start button; no habit card) | `verify-phase-d` lines 35/41/47/52/54: contract markers, STREAK_IN_GOAL, HUB_CORE, ONE_TAP_CARD |
| `practice-touch-tokens` | `13-practice.html` (built from ui/v1) | `touchTargets.test.ts` (48dp, vitest 420) |
| `practice-see-path` | `13-practice.html` (no path link; three tabs replace it) | web half kept in `verify-uiux-phase7-5`; navigation in `flow:tabs` |
| `profile-counter-copy` | `14-me.html` (n-of-25 progress replaces counters) | strings.fa.ts assertion in `verify-phase-e`; `S.me.achievementsA11y`; five locked rows asserted in `flow:tabs:66` |
| `profile-action-subtitle` | `14-me.html` | strings.fa.ts assertion in `verify-phase-e`; action rows asserted in `flow:tabs:67` |

**Goldens:** no golden or `rects.json` changed since `main` (diff shows only the new `checksums.json`). The pin verifier passes in the review worktree: `Goldens pinned: 20 files match checksums.json` (exit 0).

**Deliberate-deviation bookkeeping note (R-2):** removing specimen `tabbar-13` + its manifest entry (parity 30→29) is the D-011 decision made visible: pages 13/14 goldens draw the 84px soft bar, while the app now intentionally renders the 106px outlined bar everywhere. The deviation is recorded in three places (D-011, §6.15, manifest notes for `practice`/`me` which compare `.body` only) and the outlined bar itself is still pixel-pinned by `tabbar-05` against the newest approved page 05. Unlike the five Stage-U exceptions it is **not** entered in a waiver file; see R-2.

## CHECK 5 — Claimed fixes

- **Challenge player header crash (u6):** `LessonPlayerChrome.tsx` now falls back for `SIGNATURE_CHALLENGE`, which is not a key of the contract's `LESSON_STAGE_META` (`main` had `const meta = LESSON_STAGE_META[stage];` → undefined → crash). Regression guard: `verify-ui-v1-result.mjs:41` (`wiring:chrome-has-challenge-fallback`) greps exactly `LESSON_STAGE_META[stage] ?? {`. Proven discriminative: `git show d6bed8f:apps/mobile/src/station/LessonPlayerChrome.tsx | grep -c "LESSON_STAGE_META[stage] ?? {"` = **0** (would fail), current file = 1 (passes). The u6 flow:station scenario additionally drives the challenge player in a real browser (it was the crash reporter). Satisfied.
- **`practiceListLimit` counting error (u7):** old code `slice(0, Math.max(listCap - 1, 0))` treated the cap as *total* rows (G1: recommended + 1 secondary = 2 rows); new code counts secondary rows (`PracticeHubScreen.tsx:43-44`, G1: 3 rows like page 13). Regression guard: `flow:tabs` «13: locked row explains when it opens» (`flow-tabs-run.mjs:51`) requires the third row («شکل‌ها را پیدا کن», the `shape-explore` game that the old slice provably cut); the parity specimen `tabs-practice` also pins the three-row body. The guard ships in the same commit as the fix, so it never ran red in CI — but it demonstrably discriminates parent (2 rows) from fix (3 rows). Satisfied, with the caveat recorded as R-3.

## CHECK 6 — Honest status

No BLOCKER. Every mention of device/TalkBack in START_HERE is in an UNVERIFIED/DEFERRED/Phase-4 context (§3 «اجرا نشده», §5 D6, §6.10/6.12/6.14/6.15 «اثبات‌نشده»/DEFERRED lists). There is no claim of "device verified", "TalkBack verified", "production verified" anywhere; "Duolingo" appears only as a legacy component name (`DuolingoLessonModal`), and the interaction-pattern inspiration in §6.12 is explicitly labelled as inspiration, not verification. The §3 UNVERIFIED/BLOCKED row is present and consistent with the per-phase lists. One nuance: §6.13 states the chrome crash "would crash in the real app for every challenge-first station" — this is a code-derived inference (missing contract key), reasonable and backed by the browser flow, but not a device observation.

## CHECK 7 — Quality scan of new/changed files

Scanned: `AchievementRow.tsx`, `Confetti.tsx`, `ListRow.tsx`, `TabBar.tsx`, `StageResultView.tsx`, `ChallengeIntroView.tsx`, `PracticeView.tsx`, `MeView.tsx`, `StationFlow.tsx`, `PracticeHubScreen.tsx`, `strings.fa.ts`, `LessonPlayerChrome.tsx`.

- **Raw hex/rgba/px:** none in components/views (verifiers lock this too; only token files carry values).
- **English user-facing text / Western digits in Persian strings:** none (`strings.fa.ts` values all Persian; no Western digit inside a Persian string; Persian digits rendered through `toFa`).
- **Stars/hearts/streak/XP/gems/coins/leagues:** none in child-facing new code. The streak guard in `verify-phase-d` (`STREAK_IN_GOAL`, line 41) is untouched. The only «ستاره» occurrences removed — content copy migrated to «مهره» per D-004 (server-content migration itself DEFERRED and recorded).
- **Wrong-answer styling:** page 10's `.fb.soft` is reproduced with `neutralC` container + amber button (`FeedbackSheet.tsx:22-30`); `OptionButton` documents «warm, never red»; no `state.error` is used for feedback. The challenge hero disc (`ChallengeIntroView.tsx:51`, `C.errorC`) is the page 12 design colour itself (`#F7E1DD` = the page's `--error-c`, mapped via token `state.errorSoft`) — decorative, matches the approved page exactly, not feedback styling.

---

## Findings

| ID | Severity | Where | Evidence | Recommended action |
|---|---|---|---|---|
| R-1 | MINOR | `parity-out-expo/` (125 files, ~7.96 MB, added in c4a19f5; 0 on main) | Metro/expo-export build output (Hermes `.hbc`, hashed assets) committed to git; `.gitignore` covers `apps/mobile/parity/out/` etc. but not this path; AGENTS §7 forbids committing build output | Before merge to main: add `parity-out-expo/` to `.gitignore` and `git rm -r --cached parity-out-expo`, commit. (Or the owner explicitly accepts a pinned bundle snapshot, but that contradicts AGENTS §7.) |
| R-2 | MINOR | `apps/mobile/parity/manifest.json` (`tabbar-13` removal), `scripts/verify-ui-v1-path.mjs:31` | The D-011 deviation (app outlined bar vs soft bar in goldens 13/14) is recorded in D-011, §6.15 and manifest notes — but not in the named-waiver pattern (`path/station/tabs-waivers`) the project uses for deliberate design deviations | Add one waiver-style entry (or a line in tabs-waivers) naming D-011, what is still verified (`tabbar-05` pins the outlined bar; 13/14 bodies pinned via `.body`), and the restore condition (owner reverts D-011). Owner should confirm D-011 in the already-planned D-001..D-015 review. |
| R-3 | MINOR | u6/u7 bug fixes | Both regression guards (`verify-ui-v1-result.mjs:41`; `flow-tabs-run.mjs:51`) were introduced **with** their fixes, so they never failed in CI; their discriminative power is proven analytically here (parent blob grep = 0; old slice renders 2 rows vs asserted 3rd row) | Optional: keep as is; a small unit test on the row composition would make the practiceListLimit guard executable in vitest. |
| R-4 | INFO | Review brief | The brief cites `docs/content-spec/README.md` (R-06) as the station/chapter-name authority; that path does not exist in the repo. No chapter/station-name change exists in `main..u8` anyway (`src/path`, `packages/contracts` untouched; D-012 recorded) | None for this merge; the owner may want to add the content-spec doc or correct the reference. |
| R-5 | INFO | D-002 behaviour | Server-visible client behaviour changed in the documented D-002 direction (possible second honest submit, attemptNumber+1, fresh idempotency key; RECOVERY/RECHECK redirects now followed for E02/E04/E05, previously ignored). Learning truth preserved and flow-pinned (`flow-station-run.mjs:154,240`) | No action; owner confirmation of D-001..D-015 is already the declared next step in START_HERE §12. |

## Verdict

**ACCEPT WITH FIXES.**

The branch does what it claims, and the claims are reproducible: all six hashes and the lineage match; every gate number re-run in a clean worktree matches the START_HERE table exactly; no contract, migration, content file, golden or verifier assertion was weakened; the five waivers follow the pinned pattern; the two claimed bug fixes are real and guarded; the status prose is honest about what is unverified.

Before merging to main, required (both small, mechanical):
1. **R-1:** stop tracking and ignore `parity-out-expo/` (AGENTS §7 hygiene).
2. **R-2:** record the D-011 tab-bar deviation in the named-waiver pattern (or obtain explicit owner sign-off on D-011 first — the owner review of D-001..D-015 is already the declared next step).

R-3/R-4/R-5 are observations; no action blocks the merge. This reviewer did not merge and did not modify the author's checkout.
