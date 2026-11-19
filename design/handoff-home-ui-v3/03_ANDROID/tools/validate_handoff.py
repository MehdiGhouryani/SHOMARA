#!/usr/bin/env python3
"""Validate handoff asset syntax and generate a package asset manifest.
Usage: python validate_handoff.py --handoff-root /path/to/SHOMARA_HOME_UI_HANDOFF_v3
"""
from pathlib import Path
import argparse, csv, hashlib, json, mimetypes, sys, xml.etree.ElementTree as ET

parser = argparse.ArgumentParser()
parser.add_argument('--handoff-root', required=True)
args = parser.parse_args()
root = Path(args.handoff_root).resolve()
errors, warnings = [], []
if not root.is_dir():
    raise SystemExit(f'ERROR: folder missing: {root}')

# JSON validation
json_files = list(root.rglob('*.json'))
for path in json_files:
    try: json.loads(path.read_text(encoding='utf-8'))
    except Exception as e: errors.append(f'Invalid JSON {path.relative_to(root)}: {e}')

# XML and SVG validation
svg_files = list(root.rglob('*.svg'))
vector_files = list((root/'02_ASSETS/android/drawable').glob('*.xml'))
for path in svg_files + vector_files:
    try:
        tree = ET.parse(path)
        tag = tree.getroot().tag.split('}')[-1]
        expected = 'svg' if path.suffix == '.svg' else 'vector'
        if tag != expected: errors.append(f'Unexpected root <{tag}> in {path.relative_to(root)}')
    except Exception as e: errors.append(f'Invalid XML/SVG {path.relative_to(root)}: {e}')

# File hygiene
all_files = [p for p in root.rglob('*') if p.is_file()]
for path in all_files:
    if path.stat().st_size == 0: errors.append(f'Empty file: {path.relative_to(root)}')
    if path.suffix.lower() in {'.ttf','.otf','.woff','.woff2'}:
        errors.append(f'Font must not be duplicated in the pack: {path.relative_to(root)}')

# Optional bitmap checks
image_info = {}
try:
    from PIL import Image
    for path in root.rglob('*'):
        if path.suffix.lower() not in {'.png','.webp','.jpg','.jpeg'}: continue
        with Image.open(path) as im:
            im.verify()
        with Image.open(path) as im:
            image_info[str(path.relative_to(root))] = {
                'width': im.width, 'height': im.height,
                'mode': im.mode,
                'hasAlpha': ('A' in im.getbands()) or ('transparency' in im.info),
                'format': im.format,
            }
except ImportError:
    warnings.append('Pillow unavailable: image dimensions/alpha checks skipped')
except Exception as e:
    errors.append(f'Image validation failed: {e}')

# Build manifest for every shipped vector/raster file
# Only product/design assets belong in the asset manifest. Preview PNGs are evidence,
# not runtime/design assets, and must not inflate the production asset inventory.
raster_assets = [p for p in (root/'02_ASSETS').rglob('*')
                 if p.is_file() and p.suffix.lower() in {'.png','.webp','.jpg','.jpeg'}]
assets=[]
for path in sorted([*svg_files,*vector_files,*raster_assets]):
    rel = str(path.relative_to(root)).replace('\\','/')
    rec = {
        'path': rel,
        'format': path.suffix.lower().lstrip('.').upper(),
        'mimeType': mimetypes.guess_type(path.name)[0] or 'application/octet-stream',
        'bytes': path.stat().st_size,
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'bundled': True,
    }
    if rel in image_info: rec.update(image_info[rel])
    if '/svg/navigation/' in rel or '/android/drawable/shomara_nav_' in rel: rec['category']='navigation'
    elif '/svg/nodes/' in rel or '/android/drawable/shomara_node_' in rel: rec['category']='path-node-state'
    elif '/svg/lessons/' in rel or '/android/drawable/shomara_lesson_' in rel: rec['category']='lesson-topic'
    elif '/svg/states/' in rel or '/android/drawable/shomara_state_' in rel: rec['category']='empty-error-success-offline-state'
    elif '/backgrounds/' in rel: rec['category']='decorative-background-optional'
    else: rec['category']='ui-icon'
    assets.append(rec)

character_refs = [
 {'id':'main-front','path':'apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_main_01.webp','bundled':False,'reason':'already shipped in project Native resources'},
 {'id':'main-wave','path':'apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_main_10.webp','bundled':False,'reason':'already shipped in project Native resources'},
 {'id':'number-front','path':'apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_number_01.webp','bundled':False,'reason':'already shipped in project Native resources'},
 {'id':'number-pointing','path':'apps/android/core/designsystem/src/main/res/drawable-nodpi/shomara_char_number_17.webp','bundled':False,'reason':'already shipped in project Native resources'},
 {'id':'fandogh-front','path':'docs/design-handoff-2026-10/assets/characters/Fandogh/Fandogh_01_front_app_800.webp','bundled':False,'reason':'official project handoff source; install_fandogh_native.py copies if absent'},
]
manifest={
 'schemaVersion':'1.0.0',
 'package':'SHOMARA_HOME_UI_HANDOFF_v3',
 'assetCount':len(assets),
 'runtimeFormats':{'android':'VectorDrawable XML + optional WebP','designSource':'SVG'},
 'policy':'SVG is the editable source; Android VectorDrawable is the runtime resource. Character art stays at its official project source to preserve provenance and avoid duplicate binaries.',
 'assets':assets,
 'projectCharacterReferences':character_refs,
}
(root/'02_ASSETS/ASSET_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Report payload count excludes the report/index/checksum metadata itself.
excluded_meta = {'PACKAGE_VALIDATION_REPORT.md', 'PACKAGE_FILE_INDEX.csv', 'CHECKSUMS.sha256'}
payload_files = [p for p in root.rglob('*') if p.is_file() and p.name not in excluded_meta]
report = [
 '# گزارش اعتبارسنجی بسته',
 '',
 f'- تعداد فایل‌های محتوایی (بدون audit metadata): {len(payload_files)}',
 f'- SVG معتبر: {len(svg_files)}',
 f'- Android VectorDrawable معتبر از نظر XML: {len(vector_files)}',
 f'- JSON معتبر: {len(json_files)}',
 f'- assetهای برداری/تصویری ثبت‌شده در manifest: {len(assets)}',
 f'- تصاویر raster که با Pillow بررسی شدند: {len(image_info)}',
 f'- خطا: {len(errors)}',
 f'- هشدار: {len(warnings)}',
 '',
 'این گزارش syntax/structure/file integrity را می‌سنجد؛ compile واقعی AAPT، Gradle، rendering در Compose، عملکرد و screenshot دستگاه را اثبات نمی‌کند.',
]
if warnings: report += ['', '## هشدارها', *[f'- {x}' for x in warnings]]
if errors: report += ['', '## خطاها', *[f'- {x}' for x in errors]]
(root/'PACKAGE_VALIDATION_REPORT.md').write_text('\n'.join(report)+'\n',encoding='utf-8')

# File index is generated last so it includes the manifest and validation report.
index_path = root/'PACKAGE_FILE_INDEX.csv'
with index_path.open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f); w.writerow(['relative_path','extension','bytes','sha256'])
    for path in sorted(p for p in root.rglob('*') if p.is_file() and p != index_path and p.name != 'CHECKSUMS.sha256'):
        w.writerow([str(path.relative_to(root)).replace('\\\\','/'),path.suffix.lower(),path.stat().st_size,hashlib.sha256(path.read_bytes()).hexdigest()])

print('\n'.join(report))
if errors: sys.exit(1)
