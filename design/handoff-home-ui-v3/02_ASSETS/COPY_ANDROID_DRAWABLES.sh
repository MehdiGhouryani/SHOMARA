#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-$(pwd)}"
SRC="$(cd "$(dirname "$0")" && pwd)/android/drawable"
DST="$ROOT/apps/android/core/designsystem/src/main/res/drawable"
if [[ ! -d "$ROOT/apps/android/core/designsystem" ]]; then
  echo "ERROR: SHOMARA repo root not found: $ROOT" >&2; exit 2
fi
mkdir -p "$DST"
for file in "$SRC"/*.xml; do
  name="$(basename "$file")"
  target="$DST/$name"
  if [[ -e "$target" ]]; then
    if cmp -s "$file" "$target"; then echo "UNCHANGED $name"; else echo "CONFLICT $target exists with different content; inspect and merge manually" >&2; exit 3; fi
  else cp "$file" "$target"; echo "COPIED $name"; fi
done
echo "Done. Run the design-system resource/Gradle checks before use."
