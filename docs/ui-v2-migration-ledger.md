# UI V2 migration ledger (owner decision D-021)

Tracking table required by `DESIGN/guides/MIGRATION.md` §G: every real mobile route, its design
family (`DESIGN/pages/INDEX.md`), V2 status and evidence. **V1 visual rules/goldens are historical**
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
| `station/[stationId]/play` → SIGNATURE_CHALLENGE intro | LESSONS | **V2** (`ChallengeIntroView2`, batch 3) | Featured clay hero (Roka), honest chips (kind + real round count), one start CTA | `flow:station` 48/48 (12 checks) · `verify-ui-v2-foundation` | The player behind «شروع چالش» stays legacy (no approved page, D-008) |
| `station/[stationId]/play` → challenge player / checks / recovery | LESSONS | LEGACY player (`LessonPlayerChrome`) | Needs the no-approved-page decision (D-008/D-009 family) | `flow:station` play-pass scenario | Design decision, not a code migration |
| `onboarding` (welcome/phone/code/profile) | SYSTEM_SCREENS | V1 (`onboarding/views/*`) | V2 shells per screen | `flow:onboarding` 28/28 (behavior) | Batch 3 |
| `(tabs)/practice` | SYSTEM_SCREENS (profile/history family) | V1 (`PracticeView`) | Clay rows, honest locked rows | `flow:tabs` 14/14 | Batch 3 |
| `(tabs)/profile` | SYSTEM_SCREENS | V1 (`MeView`) | Soft identity card, real progress | `flow:tabs` 14/14 | Batch 3 |
| `(tabs)/_layout` (ChildTabBar) | SYSTEM_SCREENS (tab shell) | **V2** (`ui/v2/TabBar`, batch 4) | icon+label tabs, active pill beyond color, 48dp targets, adapter keeps expo-router emission | `flow:tabs` 18/18 (new shell scenario drives the real ChildTabBar) | Content screens of تمرین/من remain V1 (next batch) |
| `unit/[unitId]/jump` | SYSTEM_SCREENS (edge/assessment) | LEGACY (no approved page; D-008/D-009) | Error/empty states already honest | `flow:path` jump scenario | Needs owner design decision |
| `settings` | SYSTEM_SCREENS | LEGACY (no approved page; D-009) | Flat rows when redesigned | — | Batch 3/owner decision |
| `avatar` | SYSTEM_SCREENS | LEGACY (no approved page; D-009) | — | — | Owner decision |
| `missions` | SYSTEM_SCREENS | LEGACY — **no visual entry point** (D-010) | Keep unreachable from child UI | `path-waivers.mjs` pins it | Owner decision (D-010) |
| `parent` (guardian) | SYSTEM_SCREENS (guardian/privacy) | LEGACY (post-D6) | Reduce clay; privacy clarity | contract tests | Batch 3 |

## Shared V2 primitives (canonical, `apps/mobile/src/ui/v2/`)

| Primitive | File | Consumers |
|---|---|---|
| TabBar (icon+label shell) | `TabBar.tsx` | ChildTabBar (all three tabs) |
| Button / Card / Chip / ProgressBar | `core.tsx` | LessonViewsV2, StationStartV2, PathView2 (Button amber for jump) |
| ClaySurface (soft/featured, native layered depth) | `clay.tsx` | PathView2 (FAB), StationStartV2 (hero) |
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
