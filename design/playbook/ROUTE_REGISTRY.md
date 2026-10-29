# Live route and state registry

Verified against `apps/mobile/app/**` at N02 preflight. This table is the migration source for Native route families; the CSV ledger retains state-level evidence. Re-run discovery whenever route files or navigation calls change.

The composition, CTA, depth and complete state contract for all page families is canonical in `PAGE_UIUX_BLUEPRINT.md`. Execution status and dependency order are machine-readable in `quality/NATIVE_IMPLEMENTATION_BACKLOG.csv`; neither file is Native implementation evidence.

| Expo route | Current surface | Page contract | Native destination family |
|---|---|---|---|
| `_layout` | root/session/loading/error | 01, 16, 17 | `RootRoute` / app state coordinator |
| `onboarding` | welcome, phone, OTP, profile, grade | 01–05 | `feature:onboarding` + `feature:auth` |
| `(tabs)/_layout` | child three-tab shell | 17 | `feature:child-shell` |
| `(tabs)/index` | learning path | 06 | `feature:path` |
| `(tabs)/practice` | practice list/empty/history | 12 | `feature:practice` |
| `(tabs)/profile` | child profile/me | 14 | `feature:profile` |
| `station/[stationId]/index` | redirect/entry | 07, 16 | typed station entry destination |
| `station/[stationId]/start` | station intro/prepare/resume | 07 | `feature:learning-player` start |
| `station/[stationId]/play` | teach, guided, assessment, recovery, result, challenge | 08–11, 13 | `feature:learning-player` state machine |
| `unit/[unitId]` | unit summary | 06 | `feature:path` unit detail |
| `unit/[unitId]/jump` | placement/jump assessment | 05, 10 | `feature:placement` |
| `avatar` | avatar workshop | 15 | `feature:profile` avatar |
| `settings` | child preferences | 15 | `feature:settings` |
| `parent` | guardian surface/re-auth | 15, 16 | `feature:guardian` outside child shell |
| `missions` | legacy unreachable | 12 | no Native route until owner decision |

## Mandatory discovery on every migration batch

1. Enumerate route files plus `router.push`, `replace`, `Link`, deep links and conditionally mounted modes.
2. Traverse fresh/returning/offline/error paths and server-driven learning slices.
3. Reconcile `quality/SCREEN_LEDGER.csv` and `docs/ui-v2-migration-ledger.md`.
4. Map the real route to a Native destination and page contract; never invent functionality.
5. Add a concise page override only when no existing family fits.
6. Keep browser parity historical; Native evidence requires Compose/device gates.

## Known migration constraints

- `missions` remains unreachable by product decision; do not surface it accidentally.
- `station/play` is one file with multiple behaviorally distinct states and must not be treated as one screenshot-only screen.
- Guardian routes remain outside the child tab shell.
- V1/V2 files stay until dependency map proves zero consumers and Native replacement tests exist.
