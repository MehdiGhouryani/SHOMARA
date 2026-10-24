# Ready-to-paste prompts for coding agents (ZCode / GLM, Claude, Codex)

How to use: open the repo root in the agent, paste **one** prompt, replace `<...>`. Always start a new task with **Prompt 0**
(baseline) in a fresh session; then give the phase prompt. Every prompt repeats the context because agents forget between sessions.
Models/tools change names often: pick the strongest coding model your plan offers and the largest effort setting.

Suggested split of work (from the audit, see the hand-off notes):
- Pixel-parity UI phases with a clear design page (U6 result/challenge, U7 practice/me, U8 closing): good fit for GLM via ZCode, one phase per branch, reviewed before merge.
- Anything that touches the learning engine (`answerContent`, `submitAttempt`, recovery/recheck, contracts, migrations, U5b): keep with a stronger reviewer or do it yourself; always require the owner decision first.
- After each agent PR: run **Prompt 4** (independent review) with another model.

---------------------------------------------------------------------------------------------------

## Prompt 0: baseline check (run first in every new session; no code changes)

```text
You are joining the project "Shomara" (شمارا): a Persian (RTL), Android-first, server-authoritative math app for children.
Do NOT write or change any code in this task.

1) Read, in order: AGENTS.md, START_HERE.md (sections 0, 3, 5 and the newest 6.x block). Do not read ROADMAP_PHASES.md in full.
2) Run exactly: `nvm use && npm ci && npm run build:packages`, then `npm run typecheck:all`, `npx vitest run`,
   `npm run verify:static:all`, `npm run parity`, `npm run flow:onboarding`, `npm run flow:path`, `npm run flow:station`.
   Browser gates need Chromium (`npx playwright install chromium`). Wait for each command to finish; never run them in the background and forget them.
3) Compare every number with START_HERE section 3. Report a table: command | expected | actual | PASS/FAIL.
4) If anything differs, STOP and report the exact output. Do not fix, do not edit verifiers, do not regenerate goldens.
5) End with: the current phase, the next task according to START_HERE, and the open questions (U-Q*) that block it.
```

---------------------------------------------------------------------------------------------------

## Prompt 1: a UI phase (template; used for U6, U7, U8)

```text
CONTEXT: Project "Shomara" (شمارا), Persian RTL, Android-first children's math app. Rules are in AGENTS.md (binding) and status is in
START_HERE.md (the only status source). Baseline was verified in this session (Prompt 0). Work on branch `ui/<phase>-<name>`.

TASK: Implement phase <U6 | U7 | U8> exactly as in START_HERE section 5: design pages <11 and 12 | 13 and 14 | closing> in
docs/design-handoff-2026-10/pages-v1/. Replace the current screens for those pages with UI v1; keep all existing logic and navigation unchanged.

METHOD (AGENTS.md section 5), in this order:
A. Study. For each page read pages-v1/NN-*.html, goldens/NN.png (view the image) and goldens/rects.json. The HTML stores its markup in a
   <script type="__bundler/template"> JSON string. Extract it with:
     python3 - <<'PY'
     import re, json
     s = open('docs/design-handoff-2026-10/pages-v1/NN-name.html', encoding='utf-8').read()
     t = json.loads(re.search(r'<script type="__bundler/template">\s*(.*?)\s*</script>', s, re.S).group(1))
     i = t.find('<div class="scr"'); print(re.sub(r'src="[0-9a-f-]{36}"', 'src="ASSET"', t[i:t.find('</x-dc>')]))
     PY
   Never print the raw HTML (it contains huge base64). Read the CSS from the same template (`<style>:root ...`).
   Then read the code that renders these screens today and every verifier that mentions those files (grep scripts/*.mjs).
B. Plan. Write a short plan (10 lines): tokens to add, components, views, specimens, container changes, risks. Then execute it.
C. Tokens first: add measured values (from rects.json, not guesses) to packages/design-system/src/tokens.json. Add selectors you need to
   scripts/parity-goldens.mjs SELECTORS, run `npm run parity:goldens`, and check `git diff --stat` shows only expected golden/rects changes.
D. Components in apps/mobile/src/ui/v1/ (reuse existing: Button, Chip, Card, GuideBubble, TopBar, ProgressBar, LessonTopBar, LessonCaption, FeedbackSheet,
   OptionButton, BeadTray...). Then pure views in apps/mobile/src/<area>/views/ (no router, no state, no network, no audio).
E. Parity: add a specimen in apps/mobile/parity/specimens/ and an entry in parity/manifest.json (maxDiffPercent <= 0.5, prefer tighter). Run `npm run parity`.
   If a diff is high, open parity/out/<id>.actual.png and <id>.diff.png (view them) and fix the code; never raise the threshold.
F. Wire containers with logic unchanged. Extend scripts/flow-station-run.mjs (or add a flow script) so the REAL screen is driven in Chromium:
   every button, every state, close/confirm, no runtime errors.
G. Add scripts/verify-ui-v1-<area>.mjs (pattern: scripts/verify-ui-v1-station.mjs). Run all gates from AGENTS.md section 4 and save logs to
   docs/archive/evidence/<today>/.
H. Update START_HERE.md exactly like the previous phases (header, section 3, section 5, a new 6.x block, changelog, next-chat prompt).

HARD RULES (repeat): match the page exactly; no stars/lives/streak; wrong answers never red; no raw colors/sizes in components (tokens only);
UI text only in apps/mobile/src/ui/strings.fa.ts (Persian, Persian digits via toFa); never weaken or edit a verifier to pass (use a named, pinned waiver
with a reason only if the approved design deliberately removed the feature); learning truth stays server-side.

WHEN THE PAGE AND THE APP DISAGREE (copy, data, behaviour, missing state, conflict with the engine): do NOT guess. Keep the app's real data, make the
smallest safe choice, and record a new open question U-Q<next number> in START_HERE section 5 with options and a recommended default. Ask me only if the
choice blocks the work.

DONE MEANS: every gate in AGENTS.md section 4 is green with saved logs; START_HERE updated; a short "not verified" list; a PR description using
.github/pull_request_template.md. Do not merge. Do not touch other phases.
```

---------------------------------------------------------------------------------------------------

## Prompt 2: U5b, wire QuestionView into the lesson player (ONLY after the owner answered U-Q20 to U-Q22)

```text
CONTEXT: as in Prompt 1. Phase U5a delivered the pure views (QuestionView, OptionButton, FeedbackSheet; pages 08, 09, 10).
OWNER DECISIONS (do not change them, do not reinterpret them):
  U-Q20 (interaction model): <paste the owner's answer>
  U-Q21 (wrong answer / retry vs RECOVERY): <paste>
  U-Q22 (feedback copy and star-vs-bead content): <paste>

TASK: wire QuestionView into apps/mobile/src/station/StationFlow.tsx for the single-choice encounters (E02, E04, E05, E11) according to those decisions.
CONSTRAINTS:
- The server stays authoritative: correctness and the next step come only from submitAttempt's outcome (selectedStep / correct). Idempotency and attemptNumber
  behaviour must not change. Do not touch runtimeApi.ts semantics or contracts unless the decisions say so.
- Nine verifiers grep StationFlow.tsx. First read them (grep -l StationFlow scripts/*.mjs), list what each asserts, and keep every assertion true by
  adapting the code, not the verifier. Report any assertion you could not keep before changing it.
- Extend scripts/flow-station-run.mjs: choose -> check -> correct sheet -> continue; choose wrong -> warm sheet -> the behaviour decided in U-Q21;
  options locked after checking; replay speech; close confirmation; no runtime errors.
- Same gates, evidence and START_HERE update as Prompt 1 (steps G and H).
```

---------------------------------------------------------------------------------------------------

## Prompt 3: a gate is red (recovery)

```text
A gate failed. Do not edit verifiers, thresholds or goldens, and do not use --force or skip flags.
1) Re-run only the failing command and save the full output. 2) Find the first real error (not the summary). 3) Identify whether YOUR change caused it
(git stash / git diff). 4) Fix the code so the original intent of the check still holds. 5) If you believe the check itself is outdated because the approved
design removed a feature, STOP and write a proposed waiver (id, verifier, feature, what is still verified, how it returns) for my approval instead of applying it.
6) Re-run ALL gates from AGENTS.md section 4 at the end and report the table.
```

---------------------------------------------------------------------------------------------------

## Prompt 4: independent review of another agent's PR (use a different model than the author)

```text
You are a strict reviewer for the "Shomara" repo. Read AGENTS.md first. Review the diff of branch <branch> against main (`git diff main...<branch>`).
Do not fix anything; only report. Check and answer each with evidence (file:line):
1. Were any scripts/verify-*.mjs, scripts/lib/*waivers*.mjs, parity thresholds (apps/mobile/parity/manifest.json) or goldens changed? If yes: justified, named, pinned?
2. Raw hex/rgba or magic numbers in components or views? Are new sizes tokens measured from rects.json?
3. Strings: any user-facing text outside apps/mobile/src/ui/strings.fa.ts? English? Western digits?
4. Stars / lives / streak anywhere child-facing? Any red or alarming wrong-answer styling?
5. Does any view import the router, state, network, audio? (views must be pure)
6. Did learning logic change (answerContent, submitAttempt, selectedStep, attemptNumber, contracts, migrations)? Without an owner decision this is a blocker.
7. Is START_HERE updated honestly (numbers match the logs in docs/archive/evidence/<date>/)? Are unverified items listed? Are new U-Q recorded instead of guessed?
8. Re-run: npm ci && npm run build:packages && npm run typecheck:all && npx vitest run && npm run verify:static:all and compare with the PR description.
Output: BLOCKERS / MAJOR / MINOR lists, then a verdict MERGE / FIX FIRST.
```
