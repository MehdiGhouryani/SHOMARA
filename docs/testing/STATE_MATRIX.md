# State matrix — every screen × every state (phase P2)

Legend: ✅ = implemented and tested (the named test proves it) · 🔶 = implemented, test gap noted (not
gate-covered) · **DEFERRED** = not implemented, with reason and open decision · **N/A** = the state cannot
occur on this surface. Tests: `flow` = `npm run flow:onboarding` (32), `flow:path` (29), `flow:station` (50),
`flow:tabs` (24), `flow:largetext` (20); unit = `npx vitest run`. Page numbers refer to the approved design
pages 01–14 (`docs/design-handoff-2026-10/pages-v1/`); page 15 is the design guide, not an app screen
(START_HERE §6.15), and has no row here.

## A. Design-page surfaces (01–14)

| Surface | default | loading | empty | error | offline | retry | returning | success |
|---|---|---|---|---|---|---|---|---|
| 01 welcome | ✅ flow `welcome: title and consent line` | N/A (no async work) | N/A | N/A (no network on this page) | N/A | N/A | N/A (first page; back from 02 tested) | N/A |
| 02 phone | ✅ flow `phone: page and progress` | 🔶 button `loading` prop exists (CodeView/Button), not asserted under delay | ✅ flow `phone: send disabled while empty` | ✅ flow `netfail: provider unavailable shows the calm retry message` (invalid format guarded client-side, `authApi` VALIDATION_ERROR) | ✅ same path as provider failure (`NETWORK_UNAVAILABLE`, flow netfail) | 🔶 stays + message re-pressable (flow `netfail … stays`); a later success after failure not scripted | N/A | ✅ transitions to 03 (flow `code: page and progress`) |
| 03 verify code | ✅ flow `code: page and progress`, masked number | ✅ flow `code: resend countdown shown` (timer) | ✅ flow `code: verify disabled until six digits` | ✅ flow `code: wrong code shows the server message and stays`; `ratelimit: the server rate-limit message shows` (expired-OTP = the same generic error line; the distinct live message is UNVERIFIED, BLOCKED live) | ✅ via `NETWORK_UNAVAILABLE` path (same line as netfail on 02) | 🔶 re-enter code after failure (flow re-fills and succeeds) | ✅ flow `change number returns to the phone page` | ✅ flow `profile: reached directly after the code` |
| 04 profile | ✅ flow `profile: page`, avatar tiles, grade cells | N/A (local only) | ✅ flow `profile: continue disabled until a name is typed` | ✅ flow `profile: locked grades are disabled` (future grades visibly unavailable) | N/A (local) | N/A | ✅ flow `back from profile goes to the code page` | ✅ flow `finish: profile saved…`, `first grade content prepared` |
| 05 path | ✅ flow:path `fresh` block + parity `path` (0.08%) | 🔶 content-checking status row implemented (`contentState` in index.tsx); the flow asserts the offline strip, not the transient loading row | N/A (G1 always has 25 stations) | 🔶 manifest-error path implemented (same `contentState` row); only the offline variant is scripted | ✅ flow:path `offline: warning strip explains the situation` + `current station is marked as being prepared` | ✅ flow:path `fresh: locked station shows the notice and does not navigate` | ✅ flow:path `mid` block (resume goes to the play page) | ✅ flow:path `jump` block (offer opens the jump assessment) |
| 06 station start | ✅ flow:station `06 cached` block (chips from contract, parity `stage-intro`) | ✅ flow:station `06 uncached: preparing downloads the package, then the button becomes start` | ✅ flow:station `06 cached: empty progress bar is announced` | ✅ flow:station `06 error: a calm alert explains that preparing did not finish` + `prepare button is disabled without a package` | ✅ same manifest/offline path as the error scenario | 🔶 re-prepare after failure (button returns; not scripted to success after failure) | ✅ resume-aware start (`mid: resuming a started station goes to its play page`) | ✅ flow:station `06 cached: start opens the lesson route` |
| 07 lesson (LEARN) | ✅ flow:station `07` block (caption, bar, beads, replay) | 🔶 busy state on continue (button disabled while advancing) | N/A | 🔶 `S.lesson.submitFailed` message path implemented; not scripted in flow | **DEFERRED** mid-lesson airplane mode (needs the central 401/offline path, START_HERE A2) | ✅ exit confirmation (✕ and Android back, flow:station `07`/`08` checks) | ✅ station resume stage (path `mid`; in-station resume via play route) | ✅ flow:station `07: continue … moves to the next section` |
| 08–10 question | ✅ flow:station 08/09/10 blocks (parity `question`/`correct`/`retry` ≤0.06%) | 🔶 busy during submit (check disabled) | ✅ flow:station `08: check is disabled until an option is selected` | 🔶 submit-failure line (same gap as 07) | **DEFERRED** as 07 | ✅ flow:station `08: the retry is a second honest attempt` + `10: a server redirect shows continue` | N/A (per-item) | ✅ flow:station `09: correct sheet` → `continue moves straight to the next section` |
| 11 stage result | ✅ flow:station `11` celebration block (parity `stage-result` 0.06%) | N/A | N/A (shown only on real pass) | N/A | N/A | N/A | N/A | ✅ flow:station `11: … achievement, ۱ از ۵ مرحله` |
| 12 challenge intro | ✅ flow:station `12` block (parity `challenge-intro` 0.31%) | N/A | N/A | N/A | N/A | ✅ close confirmation (flow:station `12: close asks before leaving`) | N/A | ✅ flow:station `starting opens the challenge player` + 3 rounds + page 11 |
| 13 practice | ✅ flow:tabs 13 block (parity `practice` body) | N/A (local contract data) | N/A (contract always lists games) | N/A (local) | N/A | ✅ locked row explains (flow:tabs `13: locked row explains when it opens`) | ✅ locked state depends on passed stations (flow:tabs tabs-practice scenario) | ✅ flow:tabs `13: start opens the recommended station start route` |
| 14 me | ✅ flow:tabs 14 block (parity `me` body) | N/A (local) | ✅ `۰ از ۲۵ ایستگاه` shown for a fresh child (flow:tabs 14) | N/A | N/A | N/A | ✅ achievements lock/unlock from real progress (flow:tabs 14) | ✅ flow:tabs `14: achievement row opens the detail sheet (S18)` |

## B. App surfaces with no approved design page (kept per D-008/D-009/U-Q5)

| Surface | default | loading | empty | error | offline | retry | returning | success |
|---|---|---|---|---|---|---|---|---|
| Placement (onboarding S06) | ✅ flow `placement: first question is shown` | N/A | N/A | N/A | N/A | ✅ answer both or skip (flow A/B) | N/A | ✅ flow `result: shown after both answers` / `skip: finishes without placement` |
| Settings | ✅ flow:tabs `settings` block (switches, ADULT_SURFACE scope = 6 switches) | N/A | N/A | N/A | N/A | ✅ toggles record preferences (flow:tabs `settings: toggling records…`) | ✅ persisted per device (appState preferences) | ✅ large-text/reduced-motion/haptics/sound all reachable (unit: `touchTargets`, `haptics`, `feedback`) |
| Avatar workshop | ✅ flow:tabs `avatar` block (header, ownership labels) | 🔶 workshop fetch pending state (items render with starter set) | ✅ starter cosmetics when nothing owned (flow:tabs `avatar: item grid announces ownership`) | ✅ offline fallback line (`حالت آفلاین…`) + `ذخیره نشد` on save failure | ✅ flow:tabs remote vs offline lines both implemented; offline asserted by code path | 🔶 re-save after failure | ✅ preset kept from profile (initialPreset from state) | ✅ flow:tabs `avatar: saving posts the appearance exactly once (remote path)` |
| Parent report | 🔶 implemented (`parent.tsx`, sections + empty texts); content not flow-tested | 🔶 | ✅ `summary.emptyFa` empty states | 🔶 err style exists | N/A (uses app state) | N/A | N/A | N/A — **DEFERRED (test)**: adult surface, owner review pending (D6/O-3); no design page |
| Missions | 🔶 implemented; **no visual entry by design** (D-010/U-Q8 waivers) — **DEFERRED (test)** until the owner picks a home for missions | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Unit detail + jump assessment | 🔶 unit detail implemented, **DEFERRED (test)** (D-009 redesign pending); the jump offer that opens the assessment IS tested at route level (flow:path `jump: offer opens the jump assessment of that unit`) | | | | | | | |
| Challenge player (post-intro) | ✅ flow:station challenge rounds + chrome fallback (U6) | N/A | N/A | 🔶 (same submit-failure gap) | DEFERRED as 07 | ✅ round retry per challenge contract (unit: challenge-runtime) | N/A | ✅ flow:station full run to celebration |
| Legacy lesson stages (E03 pattern, E07/E08 checks, E09 recovery, E10 recheck, E11 transfer) | ✅ flow:station play-pass covers each (48-check path; D-008 keeps legacy rendering) | 🔶 | N/A | 🔶 submit-failure gap as 07 | DEFERRED as 07 | ✅ recovery/recheck redirects followed (flow:station) | N/A | ✅ station pass → 11 → 12 |

## C. Cross-cutting states

| Concern | Status | Evidence |
|---|---|---|
| Persian a11y labels on interactive elements | ✅ on UI-v1 pages (flow tests address every button by Persian accessible name); settings rows got explicit labels in P2 | flow scripts overall; `verify-ui-v1-*` |
| Touch targets ≥ 48dp | ✅ app-wide | unit `touchTargets.test.ts` (vitest) |
| Large text 130% / 200% | ✅ no new overlaps or clipped text on 05/07-08/13/settings | `flow:largetext` (20 checks) — RNW does not implement RN font scaling; the harness multiplies computed font sizes from a stored baseline, the same failure mode as Android |
| Reduced motion | ✅ every animated component gates on the preference (GoBubble, ChapterBand, AnimatedCharacter, FeedbackBurst, ProgressFill, DraggableToken, TactileChoice, RevealPrimitives); Confetti is static by design (U6: motion DEFERRED) | code refs in `apps/mobile/src/{path,components,game-feel}`; all flow pages open with `reducedMotion: 'reduce'` |
| Onboarding contract network states (`docs/reference/ONBOARDING_CONTRACT.md`) | default ✅, loading ✅ (countdown/disabled), invalid ✅, provider-unavailable ✅, rate-limit ✅, offline ✅ (same line), retry 🔶 (stay+message tested; later-success not scripted), empty ✅ (disabled buttons), save-failure 🔶 (`AUTH_SESSION_SAVE_FAILED` implemented in `authApi`, not scripted), returning ✅, expired-OTP 🔶 (generic error line; distinct live message BLOCKED live), recover ✅ (change-number/back paths) | flow:onboarding 32 checks |
| Submit/network failure inside the player | 🔶 implemented (`S.lesson.submitFailed`, offline queue on 401-family per A2-part-1); a scripted mid-lesson failure is **DEFERRED** until the central 401 listener (A2 remainder) lands — mocking it now would test the mock | START_HERE A2 |

## Honest gaps carried out of this matrix

1. `save failure` / `expired OTP` distinct-server-message variants: BLOCKED live (need a real OTP provider; owner).
2. Mid-lesson offline/airplane: DEFERRED with A2 (central re-auth state) — the queue behavior itself is unit-tested in `offline-sync`.
3. Parent report and missions screens: implemented but content-untested (adult surface / owner decision D-010).
4. Submit-failure line in the player: implemented, not scripted (see C above).
