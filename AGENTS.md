# AGENTS.md — rules for any coding agent working on «شمارا» (Shomara)

Applies to every agent (Claude, GLM via ZCode, Codex, ...). Read this file first, then `START_HERE.md`.
`START_HERE.md` (Persian) is the **only** source of project status, open questions and the next task.
This file is the stable operating manual; if the two ever disagree about *status*, START_HERE wins.

## 1. What this repo is
Persian (RTL), Android-first, server-authoritative math-learning app for children (grade 1 first).
Monorepo: `apps/mobile` (Expo / React Native), `apps/web` (Next.js, demo + API), `packages/*` (contracts, runtimes, design system), `supabase/` (migrations), `docs/`, `scripts/` (verifiers and the visual-parity harness).

## 2. Read order (do not skip)
1. `AGENTS.md` (this file)
2. `START_HERE.md`: §0 protocol, §3 baseline numbers, §5 "Stage U" (current UI work + open questions U-Q*), the newest §6.x evidence block
3. Only the docs START_HERE points to for your task (`docs/adr/ADR-0035-*`, `docs/design-handoff-2026-10/`, `docs/reference/*`). `ROADMAP_PHASES.md` is a 110 KB ledger: read only the sections you need.

## 3. Hard rules (violating any of these is a failed task)
1. **Match the design pages exactly.** The 15 pages are in `docs/design-handoff-2026-10/pages-v1/` (HTML + `goldens/*.png` + `goldens/rects.json`). Measure sizes from the page DOM (`npm run parity:goldens` writes `rects.json`); never eyeball.
2. **Do not guess.** If a page does not define something, or it conflicts with a project rule or the learning engine, write it down as a new open question `U-Qn` in START_HERE §5 (with options and a recommended default) and ask the owner. Do not silently pick.
3. **Never show stars, lives, or streaks** in child-facing UI. A wrong answer is never red or alarming (warm neutral look only).
4. **No raw colors or sizes in components.** Values come from `packages/design-system/src/tokens.json` → `apps/mobile/src/ui/v1/tokens.ts`. New measured values become new tokens first.
5. **All user-facing text lives in `apps/mobile/src/ui/strings.fa.ts`** (or arrives from server content). Persian only, Persian digits through `toFa`. No English UI strings.
6. **Never weaken a gate to make it pass.** Fix the code. If a verifier asserts something the approved design deliberately removed, add a *named, pinned waiver* (pattern: `scripts/lib/path-waivers.mjs`, `scripts/lib/station-waivers.mjs`) with: verifier, feature, what is still verified, and how/when it returns. Never edit a verifier just to turn it green, never lower a parity threshold.
7. **Learning truth is server-authoritative.** The client never decides correctness or the next learning step. Do not change `answerContent` / `submitAttempt` / `selectedStep` semantics without an owner decision (see U-Q20 to U-Q22).
8. **Protected decisions** in START_HERE §2.3 do not change.
9. **Evidence or it did not happen.** Never write "passes" without running the command and saving the log.
10. No new native dependency, contract change or migration without an owner decision.

### 3.1 Escalate (stop and ask) when
- design page vs engine/contract/project rule conflict; - content text contradicts the page (e.g. stars vs beads);
- you want to edit or delete a verifier; - you need a new native module, a migration or a shared-contract change.

## 4. Setup and the gates
```bash
nvm use            # Node 22 (.nvmrc)
npm ci             # NOT `npm install` (keeps package-lock.json stable)
npm run build:packages
```
Run *all* of these before claiming a phase done (current expected numbers are in START_HERE §3; they only go up):
```bash
npm run typecheck:all                 # all 9 workspaces. NOTE: plain `npm run typecheck` checks only contracts + web, NOT mobile
npx vitest run
npm run verify:static:all             # runs EVERY scripts/*.mjs, including parity and the browser flows (takes minutes)
npm run parity                        # pixel comparison against the design goldens
npm run flow:onboarding && npm run flow:path && npm run flow:station   # real screens in Chromium
npm --workspace @math/web run build
cd apps/mobile && CI=1 EXPO_OFFLINE=1 npx expo export --platform android --output-dir /tmp/expo-out   # real Metro/Hermes bundle
```
Browser gates need Chromium: `npx playwright install chromium`. Offline machines: set `PARITY_CHROMIUM_PATH=<path to chrome>`.
Do not run `npm run parity:goldens` unless you intentionally change the golden generation; it rewrites every golden and `rects.json` (review the diff: only expected files may change).

## 5. How a UI phase is done (the method; repeat for every page group)
1. Read the design pages (`pages-v1/NN-*.html`, `goldens/NN.png`, `rects.json`) and the screens/flow code they replace.
2. Add measured tokens, then components in `apps/mobile/src/ui/v1/`, then a **pure view** (no router/state/network/audio) in `apps/mobile/src/<area>/views/`.
3. Add a parity specimen (`apps/mobile/parity/specimens/*.tsx`, register in `specimens/index.tsx`) and an entry in `apps/mobile/parity/manifest.json` (threshold ≤ 0.5%). Run `npm run parity`.
4. Wire the real container with the existing logic unchanged. Extend the real-screen flow test (`scripts/flow-station-run.mjs`, harness in `apps/mobile/parity/flow/`, build switch `FLOW_STATION=1`).
5. Add/extend a static verifier `scripts/verify-ui-v1-<area>.mjs` (tokens only, pure views, no reward counters, wiring, parity entries, pinned waivers).
6. Run every gate in §4. Save logs to `docs/archive/evidence/<YYYY-MM-DD>/`.
7. Update START_HERE (header `file_version`/`last_updated`/`snapshot_id`, §3 baseline, §5 status + new U-Q*, a new §6.x evidence block, changelog row, next-chat prompt). Deliver.

## 6. Environment gotchas (learned the hard way)
- In sandboxes, background processes die when the tool call ends: start a job and poll for its `EXIT=` marker inside the **same** command.
- `verify-static-all` auto-discovers every `scripts/*.mjs`: adding a script adds a check; its runtime counts toward the total.
- Many verifiers `grep` source text. When a refactor breaks one, first ask whether the intent is still met and adjust the *code*; only then consider a documented waiver (rule 6).
- `react-native-web` does not forward `accessibilityValue` to `aria-valuenow`; assert the real fill width in browser tests.
- The flow harness stubs only native/network edges (`apps/mobile/parity/flow/stubs/`): reanimated, rive, expo-speech, content manager, config. Everything else is the real code.
- Persian text in shell: use Python/Node for slicing (`cut -c` breaks UTF-8).

## 7. Git workflow
- One branch per phase: `ui/u6-result-challenge`, `ui/u5b-question-wiring`, ... Never commit to `main` directly; never force-push.
- Small commits with clear messages. Never commit `.env*` (except `.env.example`), `node_modules`, `dist`, `.next`, `parity/out`.
- The PR description must paste the gate results (use `.github/pull_request_template.md`).

## 8. Definition of done (every phase)
All gates in §4 green with logs saved · START_HERE updated with evidence · new open questions recorded · no waiver without a reason · a short list of "unverified" items stated honestly (device, TalkBack, remote path, ...).
