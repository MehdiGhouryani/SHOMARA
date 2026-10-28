# آنبوردینگ کودک و همراه — binding page-family UX contract

**Coverage candidates:** intro steps, optional adult guidance, first run. **Do not invent route IDs**: discover actual routes, state machine and entry points first. This file overrides only *page layout/UX*, not canonical DESIGN tokens or domain/security requirements.

## Per-page mandatory actions
1. Locate exact route/view, owner data source, entry/exit, loading and error states; record actual file paths in `SCREEN_LEDGER.csv`.
2. Observe existing screen in running app at 360/390/412dp. Capture before screenshot; list top UX defects and priority.
3. Compare `DESIGN/MASTER.md`, local `DESIGN/pages` instructions, `MASTER_EXECUTION.md`, and this contract.
4. Implement real design + behavior changes, using shared V2 components and five existing WebP character assets where relevant. Do not merely wrap V1 in ClaySurface.
5. Exercise actual user flow, verify navigation/state/a11y/offline/RTL/touch and capture after screenshot.
6. Mark TESTED_WEB only with behavioral evidence; TESTED_NATIVE only after real native test. Update ledger and exact failing checks.

## Specific visual assignment
One idea per step; large character/illustration; visible progression and back/skip **only when product permits**; child copy concise; not a carousel with tiny arrows.

## Specific UX / system assignment
Preserve onboarding completion flags, adult consent/permissions where applicable, return to correct point, handle resume/restart, avoid dark patterns.

## Acceptance examples (verify with code and rendered evidence)
Complete and restart onboarding; early exit; no duplicated step; readable text at 360dp.

## Required universal gates
- CTA obvious; no redundant click, dead end, inaccessible tap or accidental duplicate submit.
- Soft tactile pressed/spring behavior with reduced-motion; clay elevations consistent; no excessive shadow/glow.
- Persian/Vazirmatn, correct LTR numbers/math, no truncated text, safe-area and font scale.
- Actual behavior preserved; screenshots plus meaningful test(s). Never mark unverified gates as passed.
