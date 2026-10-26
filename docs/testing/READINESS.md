# Readiness — Shomara grade-1 child app (autonomous run, closing 2026-10-25)

Scope of this document: everything that can be **proven without the owner's device, owner decisions, or
station content authoring**. Device readiness stays PENDING until the owner runs
`docs/testing/DEVICE_TEST_CHECKLIST.md`. Gate evidence for every DONE row:
`docs/archive/evidence/2026-10-25/` (`p0-…` to `p8-…` logs), final numbers in START_HERE §3.

## 1. Product and UI

| Requirement | Status | Evidence / next action |
|---|---|---|
| All 14 approved design pages (01–14) on UI v1 with pixel parity | **DONE** | parity 29/29 (≤0.5% per specimen); page 15 = design guide (U8) |
| Question interaction per D-001..D-003 (select→check→sheet→continue) | **DONE** | flow:station 57 checks (submit-once, retry semantics, server-decision following) |
| Learning truth stays server-authoritative | **DONE** | D-002 contract check (`docs/archive/review/D-002-contract-check.md`); submit path byte-identical; no client correctness |
| Milestone celebrations (pages 11/12), no currency | **DONE** | flow:station play-pass; confetti motion **DEFERRED** (static goldens; owner animation sign-off) |
| Sound (TTS on demand) | **DONE (TTS)** | `expo-speech` fa-IR, replay button only; recorded audio **DEFERRED** (licence, R-05) |
| Haptics with settings gate | **DONE** | flow:station `play-haptics` (patterns recorded) + settings-off zero; device feel **PENDING** (checklist §8) |
| Calm idle line after 30s (stage-5 §5.1 subset) | **DONE (visual only)** | D-017; full hint ladder **DEFERRED** (server content field) |
| Settings = learning/accessibility only | **DONE** | flow:tabs settings block (6 switches, ADULT_SURFACE) |
| Large text 130%/200% | **DONE (harness)** | flow:largetext 20/20; device font scaling **PENDING** (checklist §6) |
| Reduced motion | **DONE (code+harness)** | all animated components gate; flows run `reducedMotion:'reduce'`; device check **PENDING** |
| Hardware back in lesson | **DONE (harness)** | real BackHandler registry stub, 2 checks; device check **PENDING** (checklist §4) |
| RTL/Persian-first, no English child UI, toFa digits | **DONE** | verifiers + flow tests; device RTL **PENDING** (checklist §5) |
| No stars/hearts/streak/XP/gems anywhere child-facing | **DONE** | verifiers lock copy and assets; STREAK_IN_GOAL guard intact |
| TalkBack | **BLOCKED device** | checklist §1 (owner) |

## 2. Toolchain and repository

| Requirement | Status | Evidence / next action |
|---|---|---|
| Node 22.18+ toolchain | **DONE (pin) / BLOCKED (install)** | `.nvmrc` 22.18.0, `engines.node >=22.18`; owner installs (`nvm install 22.18.0; nvm use`) — until then static-all runs marked-provisional with `--experimental-strip-types` |
| Windows PowerShell run order | **DONE** | `docs/testing/GATE_RUN_ORDER.md`; PS 5.1 proven; **PS 7 absent on this machine** (gap recorded, commands are PS-agnostic) |
| Review closure (R-1..R-5) | **DONE** | `chore/p0-review-close`; main ff-merged to c4a19f5, tag `v1-candidate-ui`; report in `docs/archive/review/` |
| Golden immutability | **DONE** | `verify-parity-goldens-pinned` PASS (20 files); no golden regenerated |
| Bundle secrets scan | **DONE** | 18 patterns → 0 hits (4.6 MB Hermes bundle) |
| Minimal production config | **DONE** | app.json: INTERNET+ACCESS_NETWORK_STATE only; no cleartext/debuggable; eas production = store app-bundle |
| CI wiring | **DONE (files)** | `.github/workflows/ci.yml` reads `.nvmrc`; **BLOCKED owner** (O-2: CI host decision, no push target) |

## 3. Content pipeline

| Requirement | Status | Evidence / next action |
|---|---|---|
| Validator reproducing stage-6 §5's 11 rules | **DONE** | `scripts/verify-content-spec.mjs`; ST07 = 0 errors/0 warnings; 11 negative fixtures self-test; in static-all (76/76) |
| Author's «0 errors» claim | **DONE (reproduced)** | `docs/content-spec/VALIDATION_FINDINGS.md` |
| ST07 ingestion → dev pack | **DONE (behind flag)** | `CONTENT_ST07_DEVPACK=1` only (D-018); production export scan: 0 dev-pack markers |
| R-01..R-09 reconciliation | **DONE (recorded)** | content-spec README §3b; R-03 number mismatch (3-of-4 vs 4-of-5) = owner |
| Station authoring ST01–ST25 | **BLOCKED (P6)** | 4 unblock conditions in START_HERE §6.21 — all four are owner actions |
| Recorded audio path | **DEFERRED** | licence check → contract field → storage/cache → admin panel (R-05) |

## 4. Owner's next actions (in order)

1. Install Node ≥ 22.18 on the build machines; re-run the gates without the provisional flag.
2. Review and confirm/reverse D-001..D-018 (START_HERE §4) — especially D-002 (retry semantics), D-011
   (one tab bar), D-016 (haptics default on), D-017 (30s idle line), D-018 (ST07 dev pack mappings).
3. Run `docs/testing/DEVICE_TEST_CHECKLIST.md` on a physical Android device (sections 1–11) and file results.
4. Answer the content-spec owner set: 13 project-summary decisions, R-01 taxonomy, R-03 flow numbers,
   R-06 names → then P6 unblocks.
5. Decide CI host (O-2) and provide the push remote; nothing has been pushed.

## 5. Honest not-verified list (nothing here is claimed)

- Any real-device behaviour: TalkBack, Persian TTS voice quality, haptics feel, font scaling, RTL rendering,
  hardware back, cold start, scroll performance (checklist §1–11).
- Any live server behaviour: Supabase, OTP provider, RLS execution, token lifetime, the real stationPass
  policy over the wire (the flow harness mock implements a simplified policy; production route uses the
  real learning-runtime engine).
- Distinct expired-OTP / save-failure server messages (generic calm lines are implemented and tested).
- PS 7 execution (not installed here); CI execution (no host).
- Confetti motion, SFX files, hint ladder h1–h3, tray-less redesigns, missions/song placement — all
  DEFERRED with reasons in START_HERE §6.21.
