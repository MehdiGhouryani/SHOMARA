#!/usr/bin/env python3
"""Cross-check handoff docs, resource references, component contracts and text contrast.
Usage: python verify_handoff_contracts.py --handoff-root /path/to/SHOMARA_HOME_UI_HANDOFF_v3
"""
from pathlib import Path
import argparse, json, re, sys, xml.etree.ElementTree as ET

ap=argparse.ArgumentParser(); ap.add_argument('--handoff-root',required=True); args=ap.parse_args()
r=Path(args.handoff_root).resolve(); errors=[]; notes=[]; checks=0

def check(ok, message):
    global checks
    checks += 1
    if not ok: errors.append(message)

def read(rel):
    p=r/rel
    if not p.is_file():
        errors.append(f'Missing required file: {rel}'); return ''
    return p.read_text(encoding='utf-8')

required=[
 'README_FA.md','00_START_HERE/HARNESS_PROMPT_FA.md','00_START_HERE/IMPLEMENTATION_ORDER_FA.md',
 '01_DESIGN/IMPLEMENTATION_GUIDE_FA.md','01_DESIGN/HOME_PATH_DESIGN_SPEC_FA.md',
 '01_DESIGN/COMPONENT_CATALOG_FA.md','01_DESIGN/CODE_REFERENCE_MAP_FA.md',
 '01_DESIGN/HOME_VISUAL_TOKENS.json','01_DESIGN/PAGE_STRUCTURE.json',
 '01_DESIGN/RESPONSIVE_LAYOUT_SPEC.json','01_DESIGN/STATE_AND_INTERACTION_MATRIX.json',
 '02_ASSETS/ASSET_MANIFEST.json','03_ANDROID/kotlin/ShomaraHomeUiState.kt',
 '03_ANDROID/kotlin/ShomaraHomeComponents.kt','03_ANDROID/kotlin/ShomaraHomeBottomBar.kt',
 '04_PREVIEWS/home_path_360dp.png','04_PREVIEWS/home_path_412dp.png',
 '04_PREVIEWS/home_path_fresh_360dp.png','04_PREVIEWS/home_path_fresh_412dp.png',
 '04_PREVIEWS/component_sheet.png','05_QA/ACCEPTANCE_CHECKLIST_FA.md',
 '05_QA/TEST_CASES_FA.md','05_QA/DEVICE_TEST_MATRIX.csv'
]
for f in required: check((r/f).is_file(),f'Missing required handoff file: {f}')

# Domain state contract must stay aligned with Native Page 06.
state=read('01_DESIGN/STATE_AND_INTERACTION_MATRIX.json')
try: states=json.loads(state)['nodeStates']; ids=[x['id'] for x in states]
except Exception: ids=[]; errors.append('Invalid node state JSON while checking domain states')
check(ids==['fresh','current','completed','perfect','locked'],f'Unexpected node state sequence: {ids}')
check('upcoming' not in ids,'Synthetic Upcoming state found in domain node states')

# Every Android runtime vector must have an editable SVG source with matching stem;
# every SVG must have a corresponding Android vector resource.
svg_dir=r/'02_ASSETS/svg'; xml_dir=r/'02_ASSETS/android/drawable'
svgs={p.stem for p in svg_dir.rglob('*.svg')}; vectors={p.stem.removeprefix('shomara_') for p in xml_dir.glob('shomara_*.xml')}
# These visual primitives are intentionally Compose/layout sources, not standalone Android icons.
source_only_svg={'card_highlight','chapter_ribbon','garden_path_footer','progress_track'}
runtime_svg=svgs-source_only_svg
for stem in sorted(runtime_svg): check(stem in vectors,f'Runtime SVG missing Android VectorDrawable peer: {stem}')
for stem in sorted(vectors): check(stem in runtime_svg,f'Android VectorDrawable missing runtime SVG source: {stem}')

# Kotlin resource references must resolve to either a bundled vector or a documented
# existing Native character drawable in the target repository.
kt='\n'.join(p.read_text(encoding='utf-8') for p in (r/'03_ANDROID/kotlin').glob('*.kt'))
resource_refs=set(re.findall(r'R\.drawable\.([a-zA-Z0-9_]+)',kt))
resource_names={p.stem for p in xml_dir.glob('*.xml')}
for name in sorted(resource_refs): check(name in resource_names,f'Unresolved R.drawable reference in Kotlin reference: {name}')

# Ensure the reference component contains the corrected resume/fresh copy and RTL slot order.
components=read('03_ANDROID/kotlin/ShomaraHomeComponents.kt')
check('eyebrow: String' in components,'ContinueStationCard must receive state-aware eyebrow text')
check('tapGuard.beginLatched()' in components,'Continue action is missing the shared tap guard')
check('settingsContentDescription' in components,'Header settings action needs an accessible label')
check(components.find('Column(' , components.find('fun ShomaraContinueStationCard')) < components.find('if (leadingContent != null)', components.find('fun ShomaraContinueStationCard')),
      'Continue card RTL composition must place the text column before left-side art slot')

# Bottom navigation must remain the three canonical child routes only.
bottom=read('03_ANDROID/kotlin/ShomaraHomeBottomBar.kt')
for label in ['Path("مسیر")','Practice("تمرین")','Me("من")']:
    check(label in bottom,f'Missing canonical child tab: {label}')
check(len(re.findall(r'^\s{4}(Path|Practice|Me)\("',bottom,re.M))==3,'Bottom navigation must contain exactly three child tabs')

# Check WCAG AA normal-text pairings used by this screen-local palette.
tokens=json.loads(read('01_DESIGN/HOME_VISUAL_TOKENS.json'))['color']
def luminance(hexv):
    vals=[int(hexv[i:i+2],16)/255 for i in (1,3,5)]
    def f(v): return v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4
    rr,gg,bb=map(f,vals); return 0.2126*rr+0.7152*gg+0.0722*bb
def contrast(a,b):
    x,y=luminance(a),luminance(b); return (max(x,y)+0.05)/(min(x,y)+0.05)
pairs=[
 ('ink on canvas',tokens['ink'],tokens['canvas']),
 ('muted on canvas',tokens['muted'],tokens['canvas']),
 ('violetDark on violetSoft',tokens['violetDark'],tokens['violetSoft']),
 ('onViolet on violet',tokens['onViolet'],tokens['violet']),
 ('onVioletMuted on violet',tokens['onVioletMuted'],tokens['violet']),
 ('amberInk on surface',tokens['amberInk'],tokens['surface']),
 ('green on surface',tokens['green'],tokens['surface']),
]
for name,fg,bg in pairs:
    ratio=contrast(fg,bg)
    check(ratio>=4.5,f'WCAG AA contrast below 4.5:1 for {name}: {ratio:.2f}:1')
    notes.append(f'{name}: {ratio:.2f}:1')

# Runtime/design manifest must not accidentally include preview evidence as app assets.
manifest=json.loads(read('02_ASSETS/ASSET_MANIFEST.json'))
check(all(item.get('path','').startswith('02_ASSETS/') for item in manifest.get('assets',[])),
      'Asset manifest contains files outside 02_ASSETS (preview evidence must be excluded)')
check(len([p for p in (r/'04_PREVIEWS').glob('home_path_*.png')])==4,
      'Expected exactly four Fresh/Resume screen previews (360dp and 412dp)')
characters=read('03_ANDROID/kotlin/CHARACTER_ASSET_INTEGRATION_FA.md')
check('ShomaraCharacter.Main' in characters and 'ShomaraCharacterSlot.Inline' in characters,
      'Native Main character renderer usage example is missing')
check('ShomaraCharacter.Number' in characters and 'poseId = 17' in characters,
      'Native Number pointing pose guidance is missing')
check('shomara_char_fandogh_01' in characters,
      'Fandogh native resource guidance is missing')

# Count the documented component inventory.
catalog=read('01_DESIGN/COMPONENT_CATALOG_FA.md')
component_ids=re.findall(r'^\| C(\d{2}) \|',catalog,re.M)
check(component_ids==[f'{i:02d}' for i in range(1,27)],f'Component catalog should contain C01..C26; found {component_ids}')

report=['# گزارش ممیزی قراردادها — SHOMARA Home UI','',f'- تعداد کنترل‌ها: {checks}',f'- خطا: {len(errors)}','', '## کنتراست متن (WCAG AA)',*['- '+x for x in notes]]
if errors: report += ['', '## خطاها',*['- '+x for x in errors]]
else: report += ['', 'همهٔ کنترل‌های ایستای تعریف‌شده موفق شدند. این بررسی جایگزین Compose compile یا تست واقعی TalkBack نیست.']
(r/'PACKAGE_CONTRACT_AUDIT.md').write_text('\n'.join(report)+'\n',encoding='utf-8')
print('\n'.join(report))
sys.exit(1 if errors else 0)
