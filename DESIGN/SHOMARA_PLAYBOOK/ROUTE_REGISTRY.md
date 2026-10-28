# Live screen registry policy — mandatory discovery

The exact current Expo Router tree and current `ui/shomara-v2-foundation` HEAD **were not available in this package's authoring environment**. Do not infer a route filename from a UX category. Existing GLM reports mention about 15 migration entries, but those are *not a verified live route inventory*.

## Actual extraction tasks in ZCode
1. Enumerate `apps/mobile/app/**/{_layout,index,...}*.tsx` (or actual route location) including route groups, dynamic segments, modals; enumerate `router.push`, `replace`, `Link`, navigation handlers, conditionally mounted views, legacy fallbacks, and server-driven screens.
2. Traverse reachable states from cold start, signed-in and signed-out children; identify nested screen modes not corresponding to files.
3. Reconcile to `docs/ui-v2-migration-ledger.md`. Create/update `SCREEN_LEDGER.csv` from exact route IDs and file paths.
4. Match each actual route/state to the closest `pages/*.md` contract. One contract can cover several source files, but no active route can be unaccounted.
5. Where an unknown screen appears, create a concise page override referencing the existing DESIGN master; avoid arbitrary new design systems.
6. Do not call parity 29/29 proof of a current V2 visual pass; old goldens are historical.

## Suggested coverage mapping — verify all paths
| Page contract | Route category / state |
|---|---|
| 01 | cold launch / welcome / splash |
| 02 | child or guardian onboarding |
| 03 | phone/auth/OTP |
| 04 | profile setup/name/avatar |
| 05 | grade / placement choice |
| 06 | path and chapter navigation |
| 07 | station start / entitlement / resume |
| 08 | teach / discover / listening |
| 09 | guided practice / math manipulatives |
| 10 | assessment / self-practice / recheck |
| 11 | recovery / supportive feedback / lesson result |
| 12 | practice tab / practice history |
| 13 | challenge intro/player/round/result |
| 14 | profile/me |
| 15 | avatar/settings/adult controls |
| 16 | loading/offline/empty/error/permission states |
| 17 | tab shell/navigation/modal/system |

The page contracts contain *conditional instructions*: do not invent app features or expose unsupported data.
