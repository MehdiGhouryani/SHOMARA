# ADR-0037 — Installable beta track and locked Phase-0 decisions

- Status: Accepted (owner instruction, 2026-10-30: proceed with the suggested path and principles, and lock the chosen path and choices)
- Date: 2026-10-30
- Decision owner: project owner
- Supersedes: none
- Related: ADR-0003 (server-authoritative runtime), ADR-0033 (Android-first runtime foundation), ADR-0036 (Android Native foundation)
- Branch: `docs/phase0-lock-beta-track` (not merged; review before merge as required for `docs/adr/`)

## Context

1. Native status: none of the 15 Expo routes has a Native equivalent, all 20 backlog rows in `design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv` are `NATIVE_PENDING`, and the only Native screen is a placeholder (`apps/android/app/src/main/kotlin/com/mathlearning/app/ui/FoundationScreen.kt`). The harness next task `N02-07` is `BLOCKED_ENV` because the audit environment has no Android SDK 37.
2. The only installable build defined in the repository is the Expo `preview` profile. Its runbook (`docs/release/APK_PREVIEW.md` §1–§2) says it runs local content only: no server contact, no phone-OTP step, and no station can be passed. A functional installable app therefore needs an HTTPS API base (`EXPO_PUBLIC_API_BASE_URL`) and a Supabase project. Neither is in the repository.
3. Repository lines, verified on 2026-10-30:
   - `main` has 2 commits: `7395cb1` ("Replace entire repo with new project files", 2026-10-28) and `6063c55` ("last-codex", 2026-10-29).
   - 17 remote feature branches exist. `git merge-base origin/main <branch>` returns nothing and exits 1, so the histories are unrelated.
   - The START_HERE `file_version` is 35 on `main`, 22 on `ui/shomara-v2-foundation`, 24 on `chore/p8-closing` and 18 on `chore/apk-preview`.
   - The `baseline_commit` recorded in `main`'s START_HERE (`ef35ce2`) is not present in the repository.
   - `apps/android` exists only on `main`.
   - `chore/apk-preview` lacks V2 UI files that `main` has, for example `apps/mobile/src/ui/v2/shell.tsx`, `apps/mobile/src/ui/v2/tokens.ts` and `apps/mobile/src/path/PathView2.tsx`. `main` already has the preview profile in `apps/mobile/eas.json` and passes `verify-apk-preview` (21 checks).
   - `docs/testing/DEVICE_TEST_CHECKLIST.md` exists on `chore/p7-device-checklist` and `chore/p8-closing`, not on `main`.
4. Baseline checks on `main` are listed under Evidence. Install, typecheck, unit tests and the preview and release verifiers pass. `verify:static:all` fails (86 of 87). A production web build contains answer-index values in a client chunk.
5. Not verified: GitHub Actions run history and branch protection (the GitHub API returned 403 in this session), device behaviour, the Gradle/Android build, the Supabase deployment, and the content of unmerged branches beyond file listings.

## Decision

Locked. A change to any item needs a new ADR that supersedes it.

| ID | Decision | Basis |
|---|---|---|
| L1 | Two tracks run in parallel. **Track A**: Expo beta with a backend, limited to P0/P1 fixes and parity, with no new features. **Track B**: Native per roadmap, the target client. | AGENTS §1 |
| L2 | The canonical base line is `main` at `6063c55`. Remote feature branches are reference sources only. Do not `merge` or `rebase` onto them. | Context 3 |
| L3 | Porting from a branch is evidence-first. A fix is ported only when the defect is reproduced on `main` or the feature is missing there. Port the minimal change with its own test and diff. Do not copy whole files. | AGENTS §3.3, §3.4 |
| L4 | Child-facing UI follows AGENTS rule 8, which takes precedence over MASTER §5. Star copy and stars as rewards are removed from child UI (Phase 1.7). | AGENTS §3 rule 8; `design/MASTER.md` §5 |
| L5 | `apps/web` is treated as child-facing until Phase 1.1 passes. Do not deploy `apps/web` publicly before then. | `docs/architecture/REPOSITORY_MAP_FA.md` (`apps/web` row); `apps/web/app/station/[stationId]/play` |
| L6 | The canonical palette is design-system v2 (`packages/design-system/src/tokens.json`, v2 block). v1 consumers migrate route by route, then v1 is retired. | AGENTS §4 |
| L7 | ParentGate: the protected decision in START_HERE §7 stays in force until the owner re-reviews it before M3. | START_HERE §7 |
| L8 | The `missions` route is removed only after a zero-consumer proof. | AGENTS §4 |
| L9 | Upgrade to React Native ≥ 0.86.2 and Expo ≥ 57.0.9 is a separate change (Phase 2.2) with a full gate re-run. | `docs/release/APK_PREVIEW.md` §4b; `apps/mobile/package.json` |
| L10 | No API URL, Supabase key, keystore, EAS credential or service-role key is committed. The API base URL is injected at build time as an EAS secret. | AGENTS rule 12; `docs/release/APK_PREVIEW.md` §5; `apps/mobile/src/config/runtime.ts` |
| L11 | An APK build runs only under a phase task that explicitly authorises it. The owner runs the EAS commands. The agent holds no Expo credentials. | AGENTS §7; `docs/release/APK_PREVIEW.md` §1 |
| L12 | Distribution is internal (the owner's device, then closed testers) until M3. The `production` and `market-apk` EAS profiles are out of scope. | `docs/release/APK_PREVIEW.md` §2; `apps/mobile/eas.json` |
| L13 | No Native release APK or AAB before N10 and HG-05. | `scripts/verify-android-build-harness.mjs:28` |
| L14 | Each phase uses its own branch. PASS requires an executed command, its exit code and evidence. Verifiers, thresholds and goldens are not weakened to turn a check green. | AGENTS §3.1, §3.3, §3.4 |
| L15 | No code change starts without the owner's explicit approval for that phase. Phase 0 changes are documentation only. | Owner instruction, 2026-10-30 |
| L16 | The device checklist is copied after review from `chore/p8-closing` to `main` in Phase 2.5. It is not rewritten. | Context 3 |
| L17 | Track A is not yet registered in `harness/roadmap.json`. Registration is reviewed before merge (AGENTS §8 and rule 11). Until then `harness next` stays `N02-07`. | AGENTS §8; `node tools/harness.mjs next` |

## Pending inputs (not locked)

| ID | Input | Needed for |
|---|---|---|
| I1 | GitHub Actions run history for `ci.yml` and `android-native.yml` on `main`, and branch protection status | Phase 0.2 |
| I2 | Production backend: HTTPS host, Supabase project, OTP provider, secret handling | Phase 0.5 (D7), Phase 2.1 |
| I3 | The owner runs the EAS preview build | Phase 2.3 |
| I4 | Test device model and Android version | Phase 2.5 |
| I5 | Content approval for the staging seed `supabase/migrations/0035_grade1_staging_seed.sql` | Phase 1.8 |
| I6 | A correct `baseline_commit` in START_HERE (`ef35ce2` is absent from the repository) | Phase 0 close |

## Milestones

| Milestone | Meaning | Gate |
|---|---|---|
| M1 | Installable APK, connected to the backend, on the owner's device. Known issues are logged. | 0.5, 1.1, 1.6, 2.1–2.4 PASS |
| M2 | Stable beta for family or team testing | Phase 1 complete; 2.5 PASS; 3.1–3.4, 3.9, 3.10 PASS; I1 evidence recorded |
| M3 | Ready for real children | Phases 4 and 6 complete; L7 re-review; owner approval |

The phase checklist, with IDs, lives in START_HERE §11. Effort estimates are not part of this decision.

## Consequences

- Track A adds Expo maintenance until cutover (N09). It must stay within P0/P1 and parity.
- Track B is unaffected and remains the release target.
- Track A work follows this ADR and START_HERE §11 until L17 is done.

## Evidence (2026-10-30, this session)

| Command | Result |
|---|---|
| `git fetch origin '+refs/heads/*:refs/remotes/origin/*'` | exit 0; 17 feature branches fetched |
| `git merge-base origin/main origin/sec/wave-a-security` | no output, exit 1 |
| `npm ci --no-audit --no-fund` | exit 0; 648 packages |
| `npm run build:packages` | exit 0 |
| `npm run typecheck:all` | exit 0 across workspaces |
| `npx vitest run` | exit 0; 65 files, 502 tests |
| `node tools/harness.mjs validate` | `HARNESS_VALID (99 tasks, 11 phases)` |
| `node tools/harness.mjs next` | `N02-07 [BLOCKED]`, `BLOCKED_ENV` |
| `node scripts/verify-repository-harness.mjs` | exit 0; `REPOSITORY_HARNESS: PASS (99 tasks, 59 ledger entries, 1813 dependency edges)` |
| `node scripts/verify-ui-v2-foundation.mjs` | PASS |
| `node scripts/verify-design-governance.mjs` | PASS |
| `node scripts/verify-apk-preview.mjs` | PASS (21 checks) |
| `node scripts/verify-mobile-release.mjs` | exit 0 |
| `npm run verify:static:all` | exit 1; 86 of 87; `parity-run.mjs` FAIL (1 of 29); the failing row is not printed |
| `npm run build:web` | exit 0; `expectedIndex:1` values present in `apps/web/.next/static/chunks/1422lu09jb4ob.js` |
| `git status` after the runs | clean (build output is ignored) |

Logs: `/tmp/claude-0/-home-claude/ca88fe50-e2b3-55d5-8964-e85625560c06/scratchpad/logs/`

## References

- `AGENTS.md` §1, §3, §4, §7, §8
- `docs/release/APK_PREVIEW.md` §1–§5
- `docs/architecture/REPOSITORY_MAP_FA.md`
- `START_HERE.md` §7 and §11
- `design/MASTER.md` §5–§6
- `docs/adr/ADR-0036-android-native-foundation.md`
