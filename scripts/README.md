
| erify-verifier-verdicts.mjs | Every verifier that collects failures must be able to report one |# scripts/ — فهرست دامنه‌ای

این پوشه تخت است و **عمداً** می‌ماند: نام هر فایل، دامنهٔ آن را می‌گوید، و جابه‌جایی به زیرپوشه‌ها
۲۷۷ ارجاع مسیری را در ۴۵ فایل می‌شکست — از جمله `harness/WORKLOG.md` و `ROADMAP_PHASES.md` که سابقهٔ
تاریخی‌اند. به‌جای جابه‌جایی، این فهرست نقشه می‌دهد.

**قاعده:** هر `scripts/*.mjs` باید در همین فایل فهرست شود؛ `verify-structure` این را الزام می‌کند.

## Android native (6)

| فایل | نقش |
|---|---|
| `android-build.mjs` | host build tool |
| `verify-android-build-harness.mjs` | POSIX CI invokes the wrapper directly; the executable mode is part of the build contract. |
| `verify-android-environment.mjs` | host build tool, fail-closed |
| `verify-android-foundation.mjs` | DT-49: :core:testing held only FakeAppLogger.kt and nothing depended on it; the module was removed |
| `verify-android-module-graph.mjs` | Static Android architecture guard (P3, ADR-0041) — enforces the module dependency rules of docs/ARCHITECTURE.md against the actual Kotlin sources: R1  |
| `verify-apk-preview.mjs` | APK preview readiness (chore/apk-preview, D-019): the internal device-test APK built with the |

## Design system and tokens (3)

| فایل | نقش |
|---|---|
| `generate-design-system-css.mjs` | generator - rewrites generated CSS |
| `verify-design-governance.mjs` | DT-59: two rows describe surfaces the owner removed on purpose (the guardian area, ADR-0050, and the avatar |
| `verify-design-system-native.mjs` | N03-07 zero-raw-token guard for the Native design system (COMPONENT_READINESS «geometry از token canonical، بدون magic value»). |

## UI, UX and accessibility (23)

| فایل | نقش |
|---|---|
| `probe-v2-widths.mjs` | responsive probe tool, needs Chromium |
| `verify-ui-v1-foundation.mjs` | Static gate for UI v1 foundation (Stage U1, ADR-0035): dependencies, fonts, tokens, primitives rules, |
| `verify-ui-v1-onboarding.mjs` | Static gate for the onboarding area (Stage U2 historical half + D-021 real-screen half). |
| `verify-ui-v1-path.mjs` | Static gate for the path tab. |
| `verify-ui-v1-question.mjs` | Static gate for Stage U5 (question and feedback pages 08 to 10 on UI v1, ADR-0035): the pure views (U5a) |
| `verify-ui-v1-result.mjs` | Static gate for Stage U6 (result page 11 and challenge intro page 12 on UI v1, ADR-0035). |
| `verify-ui-v1-scope.mjs` | Retired with the docs/archive tree cleanup: the archived html is no longer tracked. |
| `verify-ui-v1-station.mjs` | Static gate for the station start (06) and first lesson section (07). |
| `verify-ui-v1-tabs.mjs` | Static gate for Stage U7 (practice page 13 and me page 14 on UI v1, ADR-0035). |
| `verify-ui-v2-foundation.mjs` | UI V2 verification (owner decision D-021): the V2 generation gets its own guard set, replacing the V1 visual assertions for the migrated lesson-slice  |
| `verify-ui-v2-onboarding.mjs` | UI V2 gate for the onboarding/auth migration (owner decision D-021; playbook pages 01–04). |
| `verify-ui-v2-path-station.mjs` | UI V2 gate for the migrated path tab and station start (owner decision D-021, batch: Path + Station Start). |
| `verify-ui-v2-tabs.mjs` | UI V2 gate for the tab content screens (owner decision D-021; playbook pages 12/14/15). |
| `verify-uiux-path2.mjs` | Stage U3: the path logic moved out of the screen into src/path (page geometry and the status-to-node model). |
| `verify-uiux-phase3.mjs` | Stage U3: the tab bar is the v1 TabBar; its colors come from the token names C.primary / C.ink2 (no literals). |
| `verify-uiux-phase4.mjs` | ADR-0037 item 1.7: the dead starsEarned state was removed with zero-consumer proof; the |
| `verify-uiux-phase5.mjs` | — |
| `verify-uiux-phase6.mjs` | D-021 (2026-10-28): the chrome tokenizes through tokens.v2 now; the DS-token half stays for the web-era shell. |
| `verify-uiux-phase7-5.mjs` | — |
| `verify-uiux-phase7.mjs` | — |
| `verify-uiux-phase8.mjs` | — |
| `verify-uiux-phase9.mjs` | — |
| `verify-ux-p10-final.mjs` | — |

## Content pipeline and media (7)

| فایل | نقش |
|---|---|
| `generate-content-indexes.mjs` | — |
| `verify-answer-key-boundary.mjs` | Wave A3/A9 static guard: answer-key boundary + RLS coverage. |
| `verify-content-library.mjs` | — |
| `verify-content-pipeline.mjs` | Content pipeline verifier (P7) — joins verify:static:all. |
| `verify-station-spec.mjs` | Station-spec validator (DT-81) — stage6 §5 rules by machine: TTS/display budgets, no digits for ST01–ST06, forbidden words/art, id/audio/asset reference integrity, pool ≥ 12, declared-count drift. Joins verify:static:all. |
| `verify-magic-squares.mjs` | Magic-square uniqueness gate (DT-82) — every T08 block in authored specs must admit exactly one solution (3×3 rows+cols; 4×4 rows+cols+2×2 boxes) via full backtracking solver; kills guess-requiring rounds at authoring time. |
| `verify-media-pipeline.mjs` | Media pipeline verifier (P9) — joins verify:static:all. |
| `verify-migrations-static.mjs` | B0 extended guards — challenge runtime + presentation enrichment (0055/0056/0072/0073) |

## Parity and browser flows (8)

| فایل | نقش |
|---|---|
| `flow-path-run.mjs` | Interaction test of the REAL path tab (react-native-web in Chromium, app dependencies stubbed and recorded). |
| `flow-run.mjs` | Interaction test of the REAL onboarding screen (react-native-web in Chromium, native/app dependencies |
| `flow-station-run.mjs` | Interaction test of the REAL station start screen (page 06) and the real lesson player's first section (page 07): |
| `flow-tabs-run.mjs` | Interaction test of the REAL practice and me tabs (pages 13 and 14 on UI v1): react-native-web in |
| `parity-build.mjs` | Bundles apps/mobile/parity/entry.tsx for the browser with react-native-web (no Metro, no app routes). |
| `parity-goldens.mjs` | generator - rewrites pinned goldens |
| `parity-run.mjs` | Visual parity: renders each specimen with react-native-web and compares it, pixel by pixel, with the |
| `verify-phase10.mjs` | — |

## Repository, docs and harness (3)

| فایل | نقش |
|---|---|
| `independent-verification.mjs` | 1. |
| `verify-repository-harness.mjs` | P1 hardening (2026-11-12): a running Node outside the repo pin must never be silent. |
| `verify-structure.mjs` | Structure gate — keeps the repository's shape a rule instead of a habit. |
| `verify-verifier-verdicts.mjs` | A verifier that collects failures must be able to report one |

## Phase and feature ledgers (41)

| فایل | نقش |
|---|---|
| `test-phase9.mjs` | — |
| `verify-backend-b0-foundation.mjs` | B0 — Backend foundation gate (static, no live Supabase required). |
| `verify-n08-01-ledger.mjs` | N08-01 route/state ledger audit — verifies that every Expo route file and |
| `verify-p06-mission-engine.mjs` | P06 static verifier — Mission Engine + Mission Hub surface. |
| `verify-p07-collection.mjs` | — |
| `verify-p08-avatar.mjs` | Must not treat companion cast as equippable child cosmetics in mobile avatar screen |
| `verify-p09-worlds.mjs` | Must not replace primary path route |
| `verify-p10-batch-a-depth.mjs` | count variant content rows roughly |
| `verify-p10-batch-a.mjs` | Must NOT claim full P10 PASS |
| `verify-p10-batch-b-depth.mjs` | — |
| `verify-p10-batch-b.mjs` | — |
| `verify-p10-batch-c-depth.mjs` | — |
| `verify-p10-batch-c.mjs` | — |
| `verify-p10-batch-d-depth.mjs` | — |
| `verify-p10-batch-d.mjs` | — |
| `verify-p10-batch-e-depth.mjs` | All depth migrations present |
| `verify-p10-batch-e.mjs` | All batch migrations present |
| `verify-p11-rhythm.mjs` | — |
| `verify-phase-a-grade-experience.mjs` | Phase A deep gate — grade experience profiles + mobile wiring markers. |
| `verify-phase-b-path-focus.mjs` | Phase B — path orientation gate (where am I / what next). |
| `verify-phase-c-session-feel.mjs` | Phase C — session feel gate (static; TS imports resolved by app bundler). |
| `verify-phase-d-practice-habit.mjs` | Phase D — soft practice habit / one-tap practice gate (static). |
| `verify-phase-e-me-surface.mjs` | Phase E — Me / Parent / Avatar presentation gate (static). |
| `verify-phase-f-ux-a11y.mjs` | Phase F — UX accessibility gate (static). |
| `verify-phase1-product-lock.mjs` | --- P01 design-lock completion (decisions A–G) ------------------------------- |
| `verify-phase11-auth.mjs` | Re-baselined 2026-10-04 (P02-A): the old dev auth fallback in ContentManager was removed by P02-B. |
| `verify-phase12-postgres-runtime.mjs` | Static SQL sanity: every newly introduced function is granted only to authenticated callers. |
| `verify-phase14-deep-remediation.mjs` | — |
| `verify-phase15-deep-remediation.mjs` | Phase-2 (2026-09-29): the child-facing copy no longer exposes system jargon ("Learning Engine"). |
| `verify-phase16-deep-audit.mjs` | — |
| `verify-phase2-foundation.mjs` | — |
| `verify-phase2.mjs` | DT-41: the per-ADR files were folded into docs/DECISIONS.md, so this asserts that the merged |
| `verify-phase3-game-feel.mjs` | DT-45: AnimatedCharacter.tsx was deleted with the dead character-art chain (no route, test or entry point imported it). |
| `verify-phase3.mjs` | — |
| `verify-phase4-challenge-foundation.mjs` | — |
| `verify-phase4.mjs` | DT-45: AnimatedCharacter.tsx and SemanticAnimationDemo.tsx were deleted with the dead character-art |
| `verify-phase5.mjs` | Portability: grep(1) is not available on every host (Windows without Git usr/bin on PATH). |
| `verify-phase6.mjs` | — |
| `verify-phase7.mjs` | — |
| `verify-phase8.mjs` | Re-baselined 2026-10-04 (P02-A): teacher web pages were intentionally retired (docs/ARCHITECTURE.md); |
| `verify-phase9.mjs` | — |

## Sync, backend and data (1)

| فایل | نقش |
|---|---|
| `verify-demo-auth-isolation.mjs` | N08-15 verifier — DEMO AUTH ISOLATION. |

## Runtime and package tests (3)

| فایل | نقش |
|---|---|
| `gen-path-fixture.mjs` | fixture generator |
| `runtime-tests.mjs` | Fixed 2026-10-04 (P02-A): only clean up dist/ if this script created it. |
| `test-challenge-runtime.mjs` | P04 executable gate: runs the Signature Challenge runtime unit tests on plain Node. |

## Tools (not gates) (2)

| فایل | نقش |
|---|---|
| `dev.mjs` | local dev server |
| `run-p02-gates.mjs` | orchestrator, run by hand |

## Other (5)

| فایل | نقش |
|---|---|
| `verify-mobile-release.mjs` | Re-baselined 2026-10-04 (P02-A): since SDK 55 Expo modules share the SDK major. |
| `verify-parity-goldens-pinned.mjs` | Golden immutability: the parity goldens (pages-v1/goldens/.png + rects.json) are the reference the pixel |
| `verify-production-readiness-static.mjs` | Grade-1 executable staging seed is present, but production remains blocked until educational approval and live Supabase verification. |
| `verify-static-all.mjs` | the runner itself |
| `verify-vitest-suite.mjs` | Static vitest suite integrity (P1, 2026-11-12): every test file that exists on disk must be matched by at least one include glob in vitest.config.mjs. |

---

مجموع: **104** فایل `.mjs` در ریشهٔ `scripts/`.

اجرای همه: `npm run verify:static:all` (کشف خودکار، با فهرست استثناهای ثابت در `verify-static-all.mjs`).
