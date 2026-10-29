# ورود، شماره و کد تأیید — binding page-family UX contract

**Coverage candidates:** phone entry, OTP, verification errors. **Do not invent route IDs**: discover actual routes, state machine and entry points first. This file overrides only *page layout/UX*, not canonical DESIGN tokens or domain/security requirements.

**Native V3 lock:** ردیف 03 در `../PAGE_UIUX_BLUEPRINT.md` composition/CTA/depth/state را قفل می‌کند؛ وضعیت اجرا فقط در `../quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` تغییر می‌کند.

## Per-page mandatory actions
1. Locate exact route/view, owner data source, entry/exit, loading and error states; record actual file paths in `SCREEN_LEDGER.csv`.
2. Observe existing screen in running app at 360/390/412dp. Capture before screenshot; list top UX defects and priority.
3. Compare `design/MASTER.md`, `MASTER_EXECUTION.md`, and this matching page-family contract.
4. Implement real design + behavior changes, using shared V2 components and five existing WebP character assets where relevant. Do not merely wrap V1 in ClaySurface.
5. Exercise actual user flow, verify navigation/state/a11y/offline/RTL/touch and capture after screenshot.
6. Mark TESTED_WEB only with behavioral evidence; TESTED_NATIVE only after real native test. Update ledger and exact failing checks.

## Specific visual assignment
One calm form action; field labels above, examples in Persian, prefix and phone/OTP LTR as appropriate; errors near field, not screaming red; 6-cell OTP only if backend truly requires six digits.

## Specific UX / system assignment
Implement reusable TextField2 and CodeInput2 after inspecting auth contracts. Test paste whole code, SMS autofill when feasible, selection/deletion, resend cooldown, keyboard obscuring CTA, focus order, network timeout, wrong/expired code; never log secret code.

## Acceptance examples (verify with code and rendered evidence)
Positive/negative flows, screenreader reads code correctly, paste/resend/back, no duplicate request.

## Required universal gates
- CTA obvious; no redundant click, dead end, inaccessible tap or accidental duplicate submit.
- Soft tactile pressed/spring behavior with reduced-motion; clay elevations consistent; no excessive shadow/glow.
- Persian/Vazirmatn, correct LTR numbers/math, no truncated text, safe-area and font scale.
- Actual behavior preserved; screenshots plus meaningful test(s). Never mark unverified gates as passed.
