# UI v1 primitives (ADR-0035)

Reproduces the approved pages in `docs/design-handoff-2026-10/pages-v1/`. Screens compose these;
they never write colors, sizes or fonts of their own. Legacy components in `../design-system/`
stay until every screen is migrated (removed in Stage U8).

| Component | Page CSS it reproduces |
|---|---|
| `Button` (`amber` / `primary` / `secondary`, `disabled`, `compact`) | `.btn`, `.btn.pri`, `.btn.sec`, `.btn.off` |
| `IconButton`, `TopBar`, `ProgressBar` | `.ibtn`, `.top`, `.bar` |
| `Card`, `Chip`, `TextField`, `GuideBubble`, `Portrait`, `Character`, `TabBar`, `Note` | `.card`, `.chip`, `.field/.inp/.pre`, `.guide/.bub`, `.por`, `.hero`, `.tabs`, info strip |
| `TextButton`, `Tile`, `GradeCell`, `CodeInput`, `IconBadge` | `.tbtn`, `.tile`, `.gr`, the six-cell code row, the code page badge |
| `Screen`, `Body`, `Foot`, `H1`, `Sub`, `Cap` | `.scr`, `.body`, `.foot`, `.h1`, `.sub`, `.cap` |
| `EdgeBox` | `box-shadow: 0 Npx 0 color` (solid bottom edge, no layout space) |

## Rules
- Colors come from `C` (names used by the pages), sizes from `UI`; text styles from `typeStyle()`.
- RTL is forced on Android: use `start`/`end`/`paddingStart`, never `left`/`right`.
- Two font weights only (400 and 600). `Icon` is decorative; the control around it carries the label.
- New primitives get a specimen in `apps/mobile/parity/` and must match the page pixel-for-pixel.

## Quirks of the approved pages (reproduced on purpose)
- Button size follows the page CSS (58px, 6px edge), not the guide's prose (56px, 4px).
- Browser buttons use `line-height: normal`, so small button text has a 25px line box (`compact`).
- Portrait: image width = circle inner width, height follows aspect, anchored at the top; tall characters
  are clipped, which shows head and shoulders.
- Characters are trimmed to their alpha box; heroes are sized by height with width following the aspect.

## States the pages do not draw (derived, kept minimal)
Field and code-cell error (error token border and caption), button `loading` (spinner), press feedback on
tiles and grade cells (face sinks into its edge, like the button). Radios report `checked` (not `selected`).

## Path and tabs
`src/path/*` (PathView, PathNode, NodeFace, ChapterBand, GoBubble, layout, pathModel) draws the path page; `src/navigation/ChildTabBar.tsx` connects the outlined `TabBar` to expo-router. Geometry is verified against the page's own algorithm (`scripts/gen-path-fixture.mjs`). Measure sizes from the page DOM: its CSS is content-box in places.

## Interaction gate
`npm run flow:path` does the same for the path tab (four scenarios). `npm run flow:onboarding` renders the real onboarding screen with recording stubs for the router, storage
and network, then clicks and types through the whole flow. It found a blank-placement-page bug that no
static check could see.

## Visual parity gate
`npm run parity:goldens` renders the approved pages (390x844) into `pages-v1/goldens/`.
`npm run parity` renders each specimen with react-native-web and diffs it against the same region of
the golden (pixelmatch). Needs Chromium. Static checks: `node scripts/verify-ui-v1-foundation.mjs`.
