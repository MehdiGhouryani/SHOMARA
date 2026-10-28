# تب من و وضعیت یادگیری — binding page-family UX contract

**Coverage candidates:** profile summary, child progress, account. **Do not invent route IDs**: discover actual routes, state machine and entry points first. This file overrides only *page layout/UX*, not canonical DESIGN tokens or domain/security requirements.

## Per-page mandatory actions
1. Locate exact route/view, owner data source, entry/exit, loading and error states; record actual file paths in `SCREEN_LEDGER.csv`.
2. Observe existing screen in running app at 360/390/412dp. Capture before screenshot; list top UX defects and priority.
3. Compare `DESIGN/MASTER.md`, local `DESIGN/pages` instructions, `MASTER_EXECUTION.md`, and this contract.
4. Implement real design + behavior changes, using shared V2 components and five existing WebP character assets where relevant. Do not merely wrap V1 in ClaySurface.
5. Exercise actual user flow, verify navigation/state/a11y/offline/RTL/touch and capture after screenshot.
6. Mark TESTED_WEB only with behavioral evidence; TESTED_NATIVE only after real native test. Update ledger and exact failing checks.

## Specific visual assignment
Use warm personal header, one real WebP character if useful, clear factual progress data. Avoid dark analytics dashboard or fabricated badges, stars and streaks.

## Specific UX / system assignment
Preserve privacy of child details, edit/exit navigation, data loading, access levels, empty profile, controlled layout at 360dp.

## Acceptance examples (verify with code and rendered evidence)
Tab->profile->edit/back; empty/loading/offline; identity data not logged.

## Required universal gates
- CTA obvious; no redundant click, dead end, inaccessible tap or accidental duplicate submit.
- Soft tactile pressed/spring behavior with reduced-motion; clay elevations consistent; no excessive shadow/glow.
- Persian/Vazirmatn, correct LTR numbers/math, no truncated text, safe-area and font scale.
- Actual behavior preserved; screenshots plus meaningful test(s). Never mark unverified gates as passed.
