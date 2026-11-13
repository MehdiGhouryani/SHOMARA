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
