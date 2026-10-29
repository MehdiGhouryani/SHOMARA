# کشف و آموزش — binding page-family UX contract

**Coverage candidates:** instruction playback, teaching stage. **Do not invent route IDs**: discover actual routes, state machine and entry points first. This file overrides only *page layout/UX*, not canonical DESIGN tokens or domain/security requirements.

**Native V3 lock:** ردیف 08 در `../PAGE_UIUX_BLUEPRINT.md` composition/CTA/depth/state را قفل می‌کند؛ وضعیت اجرا فقط در `../quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` تغییر می‌کند.

## Per-page mandatory actions
1. Locate exact route/view, owner data source, entry/exit, loading and error states; record actual file paths in `SCREEN_LEDGER.csv`.
2. Observe existing screen in running app at 360/390/412dp. Capture before screenshot; list top UX defects and priority.
3. Compare `design/MASTER.md`, `MASTER_EXECUTION.md`, and this matching page-family contract.
4. Implement real design + behavior changes, using shared V2 components and five existing WebP character assets where relevant. Do not merely wrap V1 in ClaySurface.
5. Exercise actual user flow, verify navigation/state/a11y/offline/RTL/touch and capture after screenshot.
6. Mark TESTED_WEB only with behavioral evidence; TESTED_NATIVE only after real native test. Update ledger and exact failing checks.

## Specific visual assignment
One concept per scene; mathematical manipulative is hero; small character guide when allowed; explanatory copy succinct; no infinite character animation during concentration.

## Specific UX / system assignment
Play/replay/pause audio via verified availability; avoid claiming narration exists; allow early interaction if contract permits; preserve teaching (not graded) semantics.

## Acceptance examples (verify with code and rendered evidence)
With and without audio, reduced motion, correct visuals and expression direction, move next only when proper condition met.

## Required universal gates
- CTA obvious; no redundant click, dead end, inaccessible tap or accidental duplicate submit.
- Soft tactile pressed/spring behavior with reduced-motion; clay elevations consistent; no excessive shadow/glow.
- Persian/Vazirmatn, correct LTR numbers/math, no truncated text, safe-area and font scale.
- Actual behavior preserved; screenshots plus meaningful test(s). Never mark unverified gates as passed.
