#!/usr/bin/env bash
# Rebuild every cast v2 artifact from shomara-cast.mjs. Run from repo root: bash project-design-v2/source/rebuild.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; S="$ROOT/project-design-v2/source"
node "$S/build-all.mjs" "$ROOT"
node "$S/build-brand.mjs" "$ROOT/project-design-v2/assets/brand"
node "$S/build-preview.mjs" "$ROOT/project-design-v2/preview/index.html"
python3 "$S/export-png.py" "$ROOT"
node "$ROOT/project-design-v2/qa/validate-cast.mjs"
