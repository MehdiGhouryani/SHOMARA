# Gate run order on Windows (PowerShell 5.1 and PowerShell 7)

The full gate list and its meaning live in `AGENTS.md` §4. This page only fixes **how to type them on Windows**,
because PowerShell 5.1 does not support `&&` and the user folder name contains a space.

Rules that hold in both shells:

1. Always `cd` with the repo path quoted: `cd "C:\Users\VISION LAPTOP\Desktop\Projects\shomara_math_app"`.
2. One npm command per line. Never chain gates with `&&` (works in PS 7 but not in PS 5.1 — keep one convention).
3. Set environment variables with `$env:NAME = "value"` (per shell process), not `NAME=value` (that is POSIX syntax).
4. Node must be ≥ 22.18 (`node -v`). On older 22.x, `verify:static:all` still runs every verifier by adding
   `--experimental-strip-types` itself and prints a note; treat that as a provisional run and upgrade Node
   (nvm-windows: `nvm install 22.18.0; nvm use 22.18.0` — or the Node 22 LTS installer).

## Setup (once per shell)

```powershell
cd "C:\Users\VISION LAPTOP\Desktop\Projects\shomara_math_app"
node -v          # must print v22.18.0 or newer
npm ci
npm run build:packages
```

## The gates, in order (identical for PS 5.1 and PS 7)

```powershell
npm run typecheck:all
npx vitest run
npm run verify:static:all
npm run parity
npm run flow:onboarding
npm run flow:path
npm run flow:station
npm run flow:tabs
npm --workspace @math/web run build
```

Expo Android bundle (its own step; minutes):

```powershell
cd apps/mobile
$env:CI = "1"
$env:EXPO_OFFLINE = "1"
npx expo export --platform android --output-dir ..\..\parity-out-expo
cd ..
```

Browser gates need Chromium once: `npx playwright install chromium`. Offline machines set
`$env:PARITY_CHROMIUM_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"` (or the Edge path — the
harness auto-detects installed Chrome/Edge since H1).

## What was actually verified here (2026-10-25)

- **PowerShell 5.1 (5.1.22621.2506):** `npm run build:packages` executed from a quoted repo path, exit 0
  (`$LASTEXITCODE`). The whole P0/P1 gate suites of this run were driven from Git Bash with the same commands.
- **PowerShell 7:** **not installed on this machine** — recorded as an environment gap, not a product gap. The
  commands are plain npm/node invocations with no PS-version-specific syntax; PS 7 is a superset of PS 5.1 for
  them, and CI (`.github/workflows/ci.yml`) runs the same gates on bash/Linux.
- Forbidden in this repo (either shell): `npm run parity:goldens` without `--write` intent — see
  `scripts/parity-goldens.mjs`; regenerating goldens is deliberate-only and never part of a gate run.
