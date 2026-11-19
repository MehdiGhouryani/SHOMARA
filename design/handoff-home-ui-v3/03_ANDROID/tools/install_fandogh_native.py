#!/usr/bin/env python3
"""Copy the approved Fandogh pose into Android drawable-nodpi if it is absent.
Run from any folder: python install_fandogh_native.py --repo-root /path/to/SHOMARA
Pass --overwrite only when intentionally refreshing the native copy.
"""
from pathlib import Path
import argparse, hashlib, shutil, sys

SOURCE = Path('docs/design-handoff-2026-10/assets/characters/Fandogh/Fandogh_01_front_app_800.webp')
TARGET = Path('apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_fandogh_01.webp')
parser = argparse.ArgumentParser()
parser.add_argument('--repo-root', required=True)
parser.add_argument('--overwrite', action='store_true')
args = parser.parse_args()
root = Path(args.repo_root).resolve()
src, dst = root / SOURCE, root / TARGET
if not src.is_file():
    print(f'ERROR: approved Fandogh source not found: {src}', file=sys.stderr)
    sys.exit(2)
if dst.exists() and not args.overwrite:
    print(f'UNCHANGED: {dst} already exists; use --overwrite only after review')
    sys.exit(0)
dst.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(src, dst)
digest = hashlib.sha256(dst.read_bytes()).hexdigest()
print(f'COPIED: {SOURCE} -> {TARGET}')
print(f'bytes={dst.stat().st_size} sha256={digest}')
