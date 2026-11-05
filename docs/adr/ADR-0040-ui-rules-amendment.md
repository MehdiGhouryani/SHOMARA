# ADR-0040 — UI rule amendments from Duolingo screenshot evidence

- **Date:** 2026-11-05
- **Status:** Accepted (the owner granted freedom to amend project rules where they block the best UI/UX, 2026-11-05; the child-safety economy rules are explicitly NOT amended — see §5)
- **Decision owner:** project owner
- **Supersedes (in part):** the Phase A path rule "Clay shadow only Current" (in `PHASE_A_PATH_IMPLEMENTATION_NOTE.md` and the `ShomaraPathGraph.kt` comments); the progress-announcement contract "پیشرفت X درصد" (in `ShomaraFeedback.kt` and `ShomaraPrimitives04Test.kt`); the open × conflict recorded in `design/playbook/CANONICAL_TEXTS_DRAFT_FA.md` §5 and `design/playbook/COPY_CHECKLIST_APPLICATION_NOTE.md` (option B adopted here).
- **Related:** ADR-0039 (fully-offline content + Duolingo-copy UI model), `design/playbook/DUOLINGO_COPY_CHECKLIST_FA.md` (276 items at the time of writing), `design/playbook/CANONICAL_TEXTS_DRAFT_FA.md` (DRAFT canonical texts, owner approval still pending), `design/playbook/COPY_CHECKLIST_APPLICATION_NOTE.md`.
- **Evidence (read by eye, not downloaded or copied):** 4 new Duolingo screenshots from the owner, `~/workspace/user/files/1000088588_10_di2y.jpg` (welcome), `1000088587_11_w27z.jpg` (5 phones: splash, language list, path, lesson "Excellent!", streak), `1000088586_12_tm40.jpg` (icon sheet), `1000088592_13_nqf1.jpg` (goals/quests page); plus the 7 earlier home/path screenshots analysed in the checklist section "شواهد تصویری کاربر — صفحه اصلی". No Duolingo asset (owl, icons, brand colours, font, text) was downloaded or copied — only structure and behaviour, adapted to Persian RTL and SHOMARA v2 tokens.

## Context

The owner supplied 4 more Duolingo screenshots and explicitly allowed amending project rules wherever they block the best UI/UX — but only for components the app actually needs. Four open design decisions from the copy-checklist work collided with the screenshot evidence:

1. **3D bottom edge on all nodes** — the screenshots show a darker bottom edge on EVERY green circle and every primary button, while the Phase A rule said "Clay shadow only Current".
2. **Progress TalkBack with %** — `announcementFor` says "پیشرفت X درصد" and `ShomaraPrimitives04Test` locks it, while the "no %, no score" rule was written for the child-visible UI and TalkBack is heard by the child too.
3. **The × conflict** — the copy plan says "× icon" for wrong feedback, the content-library bans red/×; `CANONICAL_TEXTS_DRAFT_FA.md` §5 proposed option B (no ×) without deciding it.
4. **Gentle pulse on the current node** — the screenshots show a static ring, no pulse; the "no pulse" rule and the screenshots agree, so this one needs confirming, not changing.

## Decisions

### R1 — Clay depth is rendered on every tactile surface (never logic-only)

- **Old rule:** path nodes — "Clay shadow only Current, every other node stays flat"; buttons — `ShomaraButtonLogic.clayDepth()` computed a depth (Soft default, Hint pressed, Flat disabled/loading/ghost) that was never rendered.
- **New rule:** every tactile surface renders its clay depth as a token shadow. Path nodes: Soft elevation for every node, Featured elevation for the Current node. Primary/Secondary buttons: Soft by default, Hint when pressed, Flat (0 elevation, no shadow) when disabled/loading; Ghost stays Flat by design.
- **Why:** the icon sheet (`1000088586_12_tm40.jpg`) shows the bottom edge on all five green circles (✓ and book), and the welcome screenshot (`1000088588_10_di2y.jpg`) shows it on the full-width GET STARTED button. Depth is the tactile signal that a circle/button can be pressed; a flat node reads as a picture, not a control.
- **What does NOT change:** at most one Featured surface per decision viewport (the Current node is still the only Featured surface; Soft is not Featured). No new token, no raw size: elevations come only from `ShomaraClay.specFor(depth).elevation` and the existing `ClaySoftElevation` / `ClayFeaturedElevation` tokens.
- **Code effect:** `ShomaraPathGraph.kt` (`ShomaraPathNodeCircle` — shadow for all states) and `ShomaraButton.kt` (shadow from the computed depth). No test asserted the old rendering (JVM tests only cover the logic functions, which are unchanged).

### R2 — TalkBack progress is announced in words, never as a percentage or a score

- **Old rule:** `ShomaraProgressLogic.announcementFor` for a determinate state returned "پیشرفت X درصد", locked by `ShomaraPrimitives04Test`.
- **New rule:** a determinate fraction is announced as the last completed quarter, in words: 0 → "هنوز شروع نشده"; (0, 0.25) → "در ابتدای راه"; [0.25, 0.5) → "یک‌چهارم راه"; [0.5, 0.75) → "نصف راه"; [0.75, 1) → "سه‌چهارم راه"; 1 → "کامل شد". Indeterminate / Paused / Offline announcements are unchanged.
- **Why:** TalkBack is heard by the child, so the "no %, no score" rule covers it too — a percentage spoken aloud is still a score. Quarter bands name only what is honestly complete; they never claim precision the bar does not have. The exact remaining-work count is still announced separately where it exists (path: "ایستگاه‌های باقی‌مانده: N" in words).
- **Code effect:** `ShomaraFeedback.kt` (`announcementFor` + new `progressWords`) and `ShomaraPrimitives04Test.kt` (the test is updated to the new contract, including an assertion that no determinate announcement contains "درصد"). This is a contract change recorded here, not a weakening: the test still asserts exact strings for every band and every other state.

### R3 — The wrong-feedback mark is ↺ (retry), never ×

- **Old state:** open conflict; the copy plan said "× icon", the content-library bans red/×; `CANONICAL_TEXTS_DRAFT_FA.md` §5 proposed option B.
- **New rule (option B adopted):** the wrong-feedback panel carries no ×. It carries the neutral retry mark ↺ — the same mark the card system already uses for Retry — rendered decoratively for TalkBack (the banner's stateDescription already announces the kind once). The mark is never red and never carries meaning alone: it always sits beside a full sentence ("این یکی نشد؛ دوباره تلاش کن").
- **Why:** the content-library rule ("neutral and encouraging, no red") is child-education-specific and older than the visual; × is a Duolingo visual, not lesson structure. What is copied from Duolingo is the structure — immediate panel + the correct answer shown + a try-again action — and all of that survives intact in option B. Keeping × free for its "close/cancel" meaning also avoids the child confusing the feedback panel with a close button.
- **Code effect:** `ShomaraFeedback.kt` (`ShomaraFeedbackBanner` renders ↺ for Retry). The checklist component-4 item stays open for one reason only: showing the correct answer still needs O1 (answer-key model).

### R4 — No pulse: confirmed, not changed

- The screenshots show a static segmented ring around the current node — no pulse, no breathing animation anywhere on the path. The existing "no pulse" rule stands, and the open checklist item is closed as "confirmed by evidence". The ring stays static (and therefore needs no reduced-motion gate). No code change.

## §5 — What this ADR does NOT amend (economy stays rejected)

The owner's freedom to amend rules covers execution/design rules that block the best UI/UX. It does **not** silently lift child-safety rules. The following stay rejected and are NOT built, even though the new screenshots show them:

- Lives/hearts/energy, streak flame and day counters ("2 day streak"), gems/currency, shop, chest, quests, child badges, daily-goal rings, leaderboards/social comparison ("You" vs "Anna"), NUDGE/GIFT actions, expiring countdowns ("26 DAYS"), and reskinned versions of any of these. The quests page (`1000088592_13_nqf1.jpg`) was reviewed only as a structural pattern for a goal card (white rounded card + title + progress bar + "X از Y" in words) — its content (quests, friends, NUDGE, badges) is not copied. A goal-card pattern may be used later for practice/Me only with real local progress data (Phase 1/2) and no quest/friend/economy content.
- Brand assets: the owl, Duolingo brand colours/font/text, the green splash screen, the trophy/laurel, the owl-with-pom-poms celebration. Only structure and behaviour are copied, with SHOMARA v2 tokens and Persian RTL.

Any of these would need a separate, explicit owner decision per item, with its own ADR and a child-safe version — this ADR grants none of that.

## Consequences

- **Files changed in this batch:** `docs/adr/ADR-0040-ui-rules-amendment.md` (this file); `design/playbook/DUOLINGO_COPY_CHECKLIST_FA.md` (new evidence section + 10 new items, 8 ticked; rules R1–R4 applied to the old items); `design/playbook/COPY_CHECKLIST_APPLICATION_NOTE.md` (batch verdicts); `apps/android/feature/path/.../ShomaraPathGraph.kt` (R1 + a latent verifier fix, below); `apps/android/feature/onboarding/.../WelcomePhone.kt` (welcome breathing zone); `apps/android/feature/onboarding/.../ProfileScreens.kt` (avatar presets as full-width rows); `apps/android/core/designsystem/.../ShomaraButton.kt` (R1); `apps/android/core/designsystem/.../ShomaraCard.kt` (visible ✓ on the selected choice tile); `apps/android/core/designsystem/.../ShomaraFeedback.kt` (R2 + R3); `apps/android/core/designsystem/src/test/.../ShomaraPrimitives04Test.kt` (R2 contract update).
- **Latent verifier fix (same batch, not a rule change):** the segmented ring added in commit `255578d0` used raw literals `14.dp` / `8.dp`, which the design-system guard (`verify-design-system-native.mjs`) rejects. They are replaced by spacing tokens (`Space12` / `Space8`) with no visual intent change beyond the dash length. This would have failed `verify:static:all` at the next local gate; it is fixed here and must be confirmed by that gate.
- **No ledger change, no `TESTED_NATIVE` row.** No build/harness/gate was run for this batch; no PASS is claimed. The local gate must re-run `verify:static:all` (expected 90/90) and `android:gate` (including the updated `ShomaraPrimitives04Test` and the 2 ring/banner tests from the previous batch), plus device screenshots for the welcome layout, the avatar rows, the 3D edges, and TalkBack announcements.
- **Still open (not decided here):** O1/O2 (answer-key model, package format — block Phase 1 and Phase B); the canonical texts (welcome options A/B, guardian/PIN details, offline/error texts — `CANONICAL_TEXTS_DRAFT_FA.md` is DRAFT only, nothing from it entered code); the inter-unit jump bubble (Duolingo jump is cross-chapter, SHOMARA jump is intra-chapter only — wiring is Phase B); the section-start card (needs CONTENT-004 section names + a canonical description); sheet/modal focus management (sheets are inline columns, not Dialog/BottomSheet — needs an infrastructure decision + a device gate).
