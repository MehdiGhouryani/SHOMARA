# UI V2 migration ledger (owner decision D-021)

Tracking table for every real mobile route, its design family
(`design/playbook/pages/`), V2 status and evidence. **V1 visual rules/goldens are historical**
for migrated screens; nonvisual rules (server-authoritative learning, security, Persian/RTL,
no stars/lives/streaks, evidence discipline) stay binding (`AGENTS.md` §0).

Status values: `V2` (migrated + verified) · `V1` (historical view still on the real screen) ·
`LEGACY` (pre-V1 UI, no approved page) · `N/A` (no screen to design).

| Route | Family (pages/*.md) | Current version | Planned V2 primitive / state | Tests guarding it | Blocker / note |
|---|---|---|---|---|---|
| `(tabs)/index` (path tab) | PATH_STATION | **V2** (`PathView2`, batch 1) | Clay trail on `buildPathLayout` geometry; PathNode done/current/available/locked + gift chest; featured clay only on current; Dana cameo; grade chip; jump offer; FAB; banner2 (info/warning/story) | `flow:path` 29/29 · `verify-ui-v2-path-station` · `verify-ui-v1-path` (historical half) | Android-native visual QA open (Phase 4 device) |
| `station/[stationId]/start` | PATH_STATION (Station Start) | **V2** (`StationStartV2`, batch 1) | Featured clay hero (Number), honest bar, meta chips, one CTA with lip, loading/prepare/error notices | `flow:station` 48/48 (06 scenarios cached/uncached/error) · `verify-ui-v2-path-station` | Same device note |
| `station/[stationId]/play` → LEARN | LESSONS (teach) | **V2** (`TeachView2`) | Interactive CountTray, replay, one continue | `flow:station` 07 checks · `verify-ui-v2-foundation` | Retry-pose character polish open (batch 2) |
| `station/[stationId]/play` → question slice | LESSONS (practice/count) | **V2** (`QuestionView2`) | OptionTile + CountTray + warm FeedbackSheet; server-authoritative submit/advance untouched | `flow:station` 08–10 checks (single submit, server-redirect) | Non-single-choice encounters (pattern/review/transfer) still render the V1/legacy player |
| `station/[stationId]/play` → COMPLETE-on-pass | LESSONS (result) | **V2** (`StageResultView2`) | Celebrate hero, honest «n از ۵», achievement row | `flow:station` 11 checks | Other COMPLETE kinds keep the legacy card (by design, D-008 family) |
| `station/[stationId]/play` → SIGNATURE_CHALLENGE intro | LESSONS | **V2** (`ChallengeIntroView2`, batch 3) | Featured clay hero (Roka), honest chips (kind + real round count), one start CTA | `flow:station` 48/48 (12 checks) · `verify-ui-v2-foundation` | Player shell is V2; Native device migration remains open |
| `station/[stationId]/play` → challenge player / checks / recovery | LESSONS | **V2 chrome** (`LessonPlayerChrome` + `SignatureChallengeView` on tokens.v2, batch F 2026-10-28) | V2 header/progress/feedback card, ClaySurface cards, V2 buttons, V2 cast via the facade (role-preserving aria→main, qbo→number, jiko→roka); round/attempt/idempotency contracts byte-identical | `flow:station` 48/48 (play-pass, idempotency) · `verify-phase3` + `verify-uiux-phase6` assertions replaced with V2 equivalents (D-021) | D-008 superseded for the *player shell* by the owner's playbook contract 13 (2026-10-28); stage-body interaction semantics unchanged |
| `onboarding` (welcome/phone/code/profile) | SYSTEM_SCREENS + pages 01–04 | **V2** (`onboarding/views2/*`, batch B 2026-10-28) | TextField2 (+۹۸ prefix, LTR digits, warm near-field error), CodeInput2 (six cells, OTP autofill), V2 hero/step-bar/guide bubble; PLACEMENT/RESULT/SYNC_LOADING restyled on tokens.v2 (playbook 10/11/16) | `flow:onboarding` 28/28 on the real V2 screen · `verify-ui-v2-onboarding` (18 checks) · `verify-ui-v1-onboarding` (real-screen half → views2, specimen half historical) | captures `v2-welcome/phone/code/profile.png` |
| `(tabs)/practice` | SYSTEM_SCREENS (profile/history family) | **V2** (`PracticeView2`) | Clay rows, honest locked/empty states | `flow:tabs` 18/18 · `verify-ui-v2-tabs` | Native device migration remains open |
| `(tabs)/profile` | SYSTEM_SCREENS | **V2** (`MeView2`) | Soft identity card, real progress and S18 sheet | `flow:tabs` 18/18 · `verify-ui-v2-tabs` | Native device migration remains open |
| `(tabs)/_layout` (ChildTabBar) | SYSTEM_SCREENS (tab shell) | **V2** (`ui/v2/TabBar`, batch 4) | icon+label tabs, active pill beyond color, 48dp targets, adapter keeps expo-router emission | `flow:tabs` 18/18 (new shell scenario drives the real ChildTabBar) | Native replacement remains open |
| `unit/[unitId]/jump` | SYSTEM_SCREENS (edge/assessment) | V2 palette (batch E 2026-10-28) | tokens.v2 colors/spacing/radius; honest error card + retry kept; DS-measured type sizes pending a page contract | `flow:path` jump scenario · static gates | Type-scale tokens DEFERRED to a page contract |
| `settings` | SYSTEM_SCREENS | **V2** | Persisted accessible setting rows | static gates | Native device persistence test open |
| `avatar` | SYSTEM_SCREENS | **V2** | Existing five-character workshop with selected/owned/locked states | static gates | Native crop/device test open |
| `missions` | SYSTEM_SCREENS | LEGACY — **no visual entry point** (D-010) | Keep unreachable from child UI | `path-waivers.mjs` pins it | Owner decision (D-010) |
| `parent` (guardian) | SYSTEM_SCREENS (guardian/privacy) | V2 palette (batch E 2026-10-28) | tokens.v2 (sky informational cards, danger family only on the type-to-confirm delete); summary/reminder/relogin contracts untouched | contract tests · static gates | Same type-scale note as jump |

## Shared V2 primitives (canonical, `apps/mobile/src/ui/v2/`)

| Primitive | File | Consumers |
|---|---|---|
| TabBar (icon+label shell) | `TabBar.tsx` | ChildTabBar (all three tabs) |
| Button / Card / Chip / ProgressBar | `core.tsx` | LessonViewsV2, StationStartV2, PathView2 (Button amber for jump), onboarding views2 |
| TextField2 / CodeInput2 / SelectTile2 / GradeCell2 / TextLink2 | `forms.tsx` | onboarding views2 + container (batch B) |
| Screen2 / Body2 / Foot2 / StepBar2 / GuideBubble2 / Note2 / IconBadge2 | `shell.tsx` | onboarding views2 + container (batch B) |
| ClaySurface (soft/featured, native layered depth) | `clay.tsx` | PathView2 (FAB), StationStartV2 (hero), WelcomeView2 (hero disc), onboarding placement card |
| Character facade (5 IDs × emotion map, WebP poses) | `Character.tsx` | LessonViewsV2 (main guide/celebrate, roka celebrate), PathView2 (dana cameo), StationStartV2 (number idle) |
| PathNode (states + optional captions + glyph override) | `path.tsx` | PathView2 |
| CountTray / OptionTile / FeedbackSheet | `lesson.tsx` | LessonViewsV2 |
| CL2 clay depth numbers | `tokens.ts` ← `packages/design-system/src/tokens.json#v2.clay` | clay.tsx, path.tsx |

## Verification model (D-021)

- **V1 goldens/parity (29/29) are historical**: specimens render V1 files directly; migrating real
  screens never touches them. V1 view files stay until their last consumer (specimen included) is
  retired in a later batch with dependency checks.
- **Real-screen assertions are replaced, never deleted**: static V1 gates keep their V1-file half and
  point their real-screen half at the V2 view; behavior stays proven by the flow suite in Chromium;
  new V2-specific static rules live in `scripts/verify-ui-v2-path-station.mjs`.
- **Harness**: `scripts/parity-build.mjs` embeds the Ionicons font for flow builds so V2 captures show
  real glyphs (V2 states read through glyph + fill). Specimen builds keep the null stub (golden
  immutability). Captures: `v2-path.png`, `v2-station-start.png`, `v2-teach.png`, `v2-question.png`,
  `v2-result.png` under `apps/mobile/parity/out/`.
- **Native Android QA remains open** (Phase 4 device work, per START_HERE §3): Chromium evidence is
  browser-only and does not prove device rendering, TalkBack, or TTS.
