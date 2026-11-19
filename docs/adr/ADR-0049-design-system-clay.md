# ADR-0049 — Design System Library: ClaySurface, LessonKit, PathKit, preview gallery (P13)

- **Date:** 2026-11-14
- **Status:** ACCEPTED as library infrastructure. No full page redesigned. Home visual remains BLOCKED (handoff not in repo — P12 declaration stands).
- **Evidence:** WORKLOG IPA-P13 — 6 clay contract tests green, gallery activity compiled and launched, android:gate PASS, static:all 94/94.

## 1. Audit findings (component inventory)

Existing (EXTENDED, never duplicated): ShomaraTokens (4 clay LEVELS + SOFT/FEATURED/answerTile specs, motion spring/press tokens), ShomaraTheme, ShomaraButton (clayDepth mapping + single-flight), ShomaraCard/ChoiceTile (depthFor/colorsFor/maxFeaturedSurfaces=1), ShomaraFeedbackBanner, ShomaraStateSurface, ShomaraNavigation (tab bar), ShomaraManipulative, ShomaraMotion (resolveReducedMotion, ShomaraPressFeedbackLogic spring/sink, CelebrationGate), ShomaraReducedMotion (CompositionLocal).

Token gap filled: `v2.clay.hint` and `v2.clay.flat` tier specs did NOT exist (only level indices). Added to tokens.json and REGENERATED via the canonical codegen — the resolver is now fully token-driven across all four tiers.

## 2. Delivered components (new, no duplicates)

| Component | Purpose | Depth | Notes |
|---|---|---|---|
| `ClaySurface` + `shomaraClay/shomaraClayAnimated` | THE reusable clay container | Flat/Hint/Soft/Featured | press = scale+sink (ShomaraPressFeedbackLogic tokens), shadow on surface only (text never shadowed), reduced-motion = snap() |
| `ShomaraIconButton` | 48dp min icon button | per state | semantics label mandatory |
| `OptionCard` | answer/choice card (Family 09/10) | per state | wraps ChoiceTile semantics + answerTile sizing |
| `ShomaraPathNode` / `ShomaraPathConnector` | Family 06 primitives | CURRENT=FEATURED, LOCKED=FLAT, rest=SOFT | redundant encoding: fill+mark+label all differ per state (tested); extracted from feature:path for reuse |
| `UnitHeader` / `LessonProgressHeader` | lesson chrome | HINT/FLAT | Persian digits via ShomaraDigits |
| `LessonActionBar` | fixed bottom CTA slot (one primary) | SOFT container | signature (modifier, content) |
| `HintCard` / `GuideBubble` | hint + guide speech | HINT/SOFT | callers gate hints via HINT_BANNED stages |
| `ResultSummary` / `RecoveryCard` | Family 11 | FEATURED on pass / SOFT | no shame framing |

## 3. Tests

ClayContractTest: ascending weight across tiers, generated-token equality (no raw literals in resolver), flat-tier zero shadow/border, path node redundant encoding (marks/labels unique), CURRENT-only FEATURED depth, no-PII scan bridge (profile module owns the scan).

## 4. Deliberately NOT done

- No Home visual design (handoff BLOCKED — P12 declaration stands).
- No page redesigns — library only.
- Paparazzi not available in this environment; screenshot regression delivered as the Gallery activity + device captures (artifacts/p13-device/*.png, light+RTL) — CI screenshot gate remains a recorded gap.
- No Duolingo assets/colors/fonts — all values resolve through tokens.json.

## 5. Superseded in part — 2026-11-19 (Home/Path rebuild)

This ADR's decision is unchanged for ClaySurface, the four clay tiers, LessonKit and the
token-driven depth resolver. Three P13 items were retired because they duplicated the shipped
renderer or could never run:

- **PathKit (`ShomaraPathNode`/`ShomaraPathConnector`/`ShomaraPathNodeVisuals`) is RETIRED.** It
  was a second path-node renderer with emoji marks (`▶ ★ ✓ ✓✓ 🔒`) and an amber Current node,
  contradicting the shipped violet focal node in `feature:path`. Its redundant-encoding /
  CURRENT-only-FEATURED / LOCKED-FLAT contract was **migrated, not dropped**: it now lives on the
  real renderer as `ShomaraPathGraphLogic.depthFor` and is asserted in `ShomaraPathGraphTest`
  (depth per state, label contrast on the canvas, 3:1 face-mark contrast for every state/chapter).
- **`DesignSystemGalleryActivity` is RETIRED.** It was never registered in any manifest (only one
  manifest exists: `apps/android/app/src/main/AndroidManifest.xml`) and had no consumer, so the
  `adb shell am start … /.preview.DesignSystemGalleryActivity` instruction in its KDoc could not
  work. The one-shot P13 device capture it produced is preserved under `artifacts/p13-device/`.
- **`Previews.kt` moved from `main` to the `debug` source set** of `core:designsystem`: @Preview is
  an authoring aid and must not ship in a release artifact. Screenshot evidence for shipping UI
  comes from instrumented Compose tests in `:app`, not from a preview activity.

Recovery: every removed file is recoverable from Git history (`git log --diff-filter=D`).
