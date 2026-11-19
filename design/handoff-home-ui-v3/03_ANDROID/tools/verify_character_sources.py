#!/usr/bin/env python3
"""Verify the approved character source files exist in the SHOMARA checkout.
Usage: python verify_character_sources.py --repo-root /path/to/SHOMARA
"""
from pathlib import Path
import argparse, hashlib, sys

FILES = {
  "Main/front": "apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_main_01.webp",
  "Main/wave": "apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_main_10.webp",
  "Number/front": "apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_number_01.webp",
  "Number/pointing": "apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_number_17.webp",
  "Fandogh/front": "docs/design-handoff-2026-10/assets/characters/Fandogh/Fandogh_01_front_app_800.webp",
}

p=argparse.ArgumentParser(); p.add_argument('--repo-root', required=True); args=p.parse_args(); root=Path(args.repo_root).resolve(); failed=False
for name, rel in FILES.items():
  f=root/rel
  if not f.is_file(): print(f'MISSING  {name}: {rel}'); failed=True; continue
  digest=hashlib.sha256(f.read_bytes()).hexdigest()
  print(f'OK       {name}: {rel} ({f.stat().st_size:,} bytes, sha256={digest[:16]}…)')
sys.exit(1 if failed else 0)
