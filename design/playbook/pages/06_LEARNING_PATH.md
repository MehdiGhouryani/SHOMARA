# مسیر یادگیری — binding page-family UX contract

**Coverage candidates:** path screen, chapter ribbons, nodes, tooltips. **Do not invent route IDs**: discover actual routes, state machine and entry points first. This file overrides only *page layout/UX*, not canonical DESIGN tokens or domain/security requirements.

**Native V3 lock:** ردیف 06 در `../PAGE_UIUX_BLUEPRINT.md` composition/CTA/depth/state را قفل می‌کند؛ وضعیت اجرا فقط در `../quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` تغییر می‌کند.

## Per-page mandatory actions
1. Locate exact route/view, owner data source, entry/exit, loading and error states; record actual file paths in `SCREEN_LEDGER.csv`.
2. Observe existing screen in running app at 360/390/412dp. Capture before screenshot; list top UX defects and priority.
3. Compare `design/MASTER.md`, `MASTER_EXECUTION.md`, and this matching page-family contract.
4. Implement real design + behavior changes, using shared V2 components and five existing WebP character assets where relevant. Do not merely wrap V1 in ClaySurface.
5. Exercise actual user flow, verify navigation/state/a11y/offline/RTL/touch and capture after screenshot.
6. Mark TESTED_WEB only with behavioral evidence; TESTED_NATIVE only after real native test. Update ledger and exact failing checks.

## Specific visual assignment
Keep path model + buildPathLayout geometry; warm cream, gently raised current node, subtle tactile chapter ribbons, one selected hero, static character cameos; no visual overload from every node glowing.

## Specific UX / system assignment
Locked nodes: if tappable to show guide, do NOT mark accessibility disabled; preserve lock data, correct progress, chapter boundary responsive, path scroll memory.

## Acceptance examples (verify with code and rendered evidence)
0 off-screen/overlap at 360/390/412, current/completed/perfect/locked a11y and navigation, flow:path meaningful tests.

## Required universal gates
- CTA obvious; no redundant click, dead end, inaccessible tap or accidental duplicate submit.
- Soft tactile pressed/spring behavior with reduced-motion; clay elevations consistent; no excessive shadow/glow.
- Persian/Vazirmatn, correct LTR numbers/math, no truncated text, safe-area and font scale.
- Actual behavior preserved; screenshots plus meaningful test(s). Never mark unverified gates as passed.
