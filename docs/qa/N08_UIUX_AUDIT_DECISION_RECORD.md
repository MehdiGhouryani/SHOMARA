# N08 UI/UX Pro Max audit — decision record (2026-11-04)

Scope: all 17 Native page families, audited against `design/MASTER.md`,
`design/INSPIRATION_GUARDRAILS.md`, `design/playbook/PAGE_UIUX_BLUEPRINT.md`,
`design/playbook/ROUTE_REGISTRY.md`, `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv`
and `design/playbook/NATIVE_IMPLEMENTATION.md`.

Method: UI/UX Pro Max (design-system-first decision method) filtered through SHOMARA's existing
tokens and contracts. **No redesign.** Every finding below was reproduced before being classified,
and every fix cites the command that proves it.

---

## 1. The finding that shapes everything else: the backlog is stale, not the UI

`NATIVE_IMPLEMENTATION_BACKLOG.csv` reports **20/20 rows `NATIVE_PENDING`**, and every row lists
`N02-07` in `blocked_by`. But `N02-07` has been **`DONE`** since 2026-10-31:

```
$ node -e "...find N02-07..."
N02-07 [DONE] Foundation gate
evidence: npm run android:gate PASS (exit 0, 2026-10-31, local machine: JDK 17 Temurin + D:\SDK ...)
```

So the backlog's status column is measuring a blocker that no longer exists. Concretely, these
screens now render on a real device (verified this session with `uiautomator dump`, not from source):

| family | route | device evidence |
|---|---|---|
| 01 onboarding welcome | `onboarding` | `به شومارا خوش آمدی!` + `ادامه` (bounding boxes captured at 100% and 200%) |
| 08/09 lesson player | `lesson/{stationId}` | `ایستگاه ST07 — مرحلهٔ P1_DISCOVER` + exit CTA |
| 17 cross-route states | — | exit-confirm and unavailable banners rendered on device |

**Decision: ADOPT the audit, REJECT bulk status flipping.** Flipping 20 rows to `DONE` from a
screenshot would repeat exactly the dishonesty this mission exists to remove. A row becomes
`NATIVE_VERIFIED` only when its own `exit_evidence` column is satisfied. What changed instead is
`blocked_by`: `N02-07` is removed where it is the *only* remaining blocker, and the real remaining
dependency is named.

---

## 2. P0 — broken or misleading, fixed this session

| # | family | defect | proof it was real | fix |
|---|---|---|---|---|
| P0-1 | 01 onboarding (all steps) | App **could not launch**: every step route navigated to a destination absent from the graph | `FATAL EXCEPTION: IllegalArgumentException: Navigation destination that matches route onboarding/welcome cannot be found` | `AppNavigationRoutes` guard + `RegisteredRoutesTest` (6 assertions) |
| P0-2 | 01, 02, 17 | **Every deep link dead**: manifest declared only `mathlearning://foundation` | `adb: Activity not started, unable to resolve Intent { dat=mathlearning://lesson/... }` | all four hosts declared + `DeepLinkManifestTest` (negative-controlled) |
| P0-3 | 17 cross-route | **Root was not RTL**: `ShomaraTheme` never provided `LocalLayoutDirection` | two instrumented tests fail without it | `CompositionLocalProvider` in `ShomaraTheme` |
| P0-4 | 08/09 lesson | System **back destroyed the child's place** with no confirmation while the on-screen button asked | zero `BackHandler` registrations existed; device back exited instantly | `ShomaraBackLogic` + device proof (back #1 asks, #2 stays) |
| P0-5 | 15 settings | **Fake success**: `onSave` announced «ذخیره شد.» while persisting nothing | `onSave = { startSave().onSaveSuccess() }` with `remember`-only state | real `PreferencesSettingsStore` (DataStore) |
| P0-6 | 08/09 lesson | **Fake answer submitted**: hardcoded `choiceId = "opt-1"` | source + debug button «ثبت پاسخ نمونه» | id from real options; honest unavailable state |
| P0-7 | 15 settings | Reduced-motion toggle **could not take effect** (theme wrapped twice, overriding the flag) | `ShomaraApp` wrapped its own default `ShomaraTheme()` | activity owns the theme; `LocalShomaraReducedMotion` |
| P0-8 | 08/09 lesson | **Infinite stage loop** at the final stage (`coerceAtMost` clamped to itself) | 2 negative-controlled tests | `ShomaraLessonStageWalk.next` returns null |

---

## 3. P1 — high user impact, fixed this session

| # | family | defect | fix |
|---|---|---|---|
| P1-1 | all | 200% font scale clipped button labels (fixed height 56dp + `maxLines=1`) | `defaultMinSize` + token padding + no line cap |
| P1-2 | 03 OTP | cell was `.size(48dp)` around a 40sp digit → clip at 200% | `weight(1f)` + `defaultMinSize` |
| P1-3 | 09/10 | manipulatives sized by `.size()` around 40sp labels | `defaultMinSize` + padding |
| P1-4 | all | `ShomaraTopBar` title overlapped the Back button at large text | `Row` with weighted title + reserved slots |
| P1-5 | 17 | no system-wide reduced-motion signal; infinite progress ignored the platform setting | `ShomaraMotionLogic` (preference OR animator scale 0) |
| P1-6 | 08/09 | stale interruption banner persisted after recovery | `ShomaraLessonBannerPolicy` |
| P1-7 | 08/09 | fast double tap could submit twice | `ShomaraLessonSubmitGate` single-flight |

---

## 4. P2 — real, deliberately NOT fixed this session

| # | family | issue | why deferred |
|---|---|---|---|
| P2-1 | 13 practice | `ShomaraPracticeHubScreen(items = emptyList(), recent = emptyList())` — hub is permanently empty | needs the practice-set data source; fixing the UI alone would fake content |
| P2-2 | 10/11 | lesson has no rendered option list (server projection absent) | dependency, not UI; now stated honestly instead of faking `opt-1` |
| P2-3 | 14 challenge | `ShomaraChallengeSession` has no UI surface at all | depends on server contract UI-014 |
| P2-4 | 16 avatar workshop | no surface; `verified-assets` blocker | owner asset decision |
| P2-5 | 18 guardian | `ShomaraParentGate(verifier = null)` fails closed | needs credentials (owner) |
| P2-6 | 05 placement | type-scale tokens deferred to the page contract | needs a contract decision |
| P2-7 | 04 profile setup | persistence exists (`ProfileDraftStore`) but screen wiring unverified | needs a journey test |
| P2-8 | 06 tab shell | settings/parent reached via nested routes, not tabs | works; revisit with the tab contract |

---

## 5. P3 — cosmetic / consistency, no user-blocking impact

- P3-1: banner kinds are chosen per call site; a small mapping helper would make them uniform.
- P3-2: `ShomaraLessonHost` composes its chrome inline instead of a reusable `LessonChrome`.
- P3-3: several screens pass `modifier` inconsistently (`fillMaxSize` inside vs. outside).
- P3-4: no screenshot baseline set yet for regression diffing (only ad-hoc captures).

---

## 6. Adopted / adapted / rejected from UI/UX Pro Max

**ADOPTED**
- *Essential text never truncates.* Authority for removing `maxLines=1` from action buttons. The
  Pro Max rule marks essential-label truncation **Critical**. Action labels wrap; only decorative
  text may clamp.
- *Every state names where you are, do, what happens next.* Used to justify the
  `awaitingServerStage` and unavailable-options surfaces instead of an inert button.
- *One primary CTA per decision.* The exit-confirm surface keeps exactly two choices (leave/stay)
  and no third path.
- *Reduced motion is a first-class preference, not an afterthought.* Two independent signals.
- *Never a dead end.* Every failure path has a retry or a stated reason; the stage walk stops
  honestly instead of looping.

**ADAPTED**
- *Motion as feedback.* Pro Max would add micro-animations broadly. SHOMARA has **zero** decorative
  animation and this was kept: for a 6–7-year-old with attention goals, still is a feature. The
  contract was encoded (`ShomaraCelebrationGate`) so future celebratory motion cannot stack.
- *Haptics on correct answers.* Widely recommended by Pro Max. **Not implemented**: `CONTENT-007`
  (`hapticsPolicy`) is `OWNER_DECISION_PENDING`. Inventing a default would fabricate a product
  decision. The gate stays documented and open.
- *Toast/snackbar for save feedback.* Replaced by an inline state that reflects the real write
  result, because a toast can claim success that did not happen (exactly defect P0-5).

**REJECTED**
- *Adding a progress percentage / streak counter to make the UI feel "alive".* Violates AGENTS §3.8
  (no punitive streak) and §3.5 (mastery is server-owned). Progress stays server-driven.
- *Redesigning the visual identity to match a reference app.* Explicitly out of scope; SHOMARA's
  identity, palette and learning architecture are preserved.
- *Registering five onboarding step routes to make the crash go away.* It would have "fixed" P0-1
  while contradicting `ROUTE_REGISTRY.md`. The registry is authoritative; the navigation was wrong.
- *Using `didOverflowWidth` as a clipping assertion.* Measured to be `true` even under an unbounded
  width constraint the child never experiences, so it is a false-positive signal.

---

## 7. What this record does NOT claim

- Screenshots exist only as ad-hoc `uiautomator` dumps and PNG captures under `build-reports/`
  (gitignored). No committed baseline set, so P3-4 stands.
- `SCREEN_LEDGER.csv` `native_screenshot` remains `NATIVE_PENDING` for 19 rows. That column is
  accurate and was **not** flipped.
- Real TalkBack gesture walkthrough is still `NATIVE_PENDING`; only semantics tests exist.
- The practice hub, challenge, avatar workshop and guardian surface are **not** functional, and the
  backlog keeps saying so.