# requires: pip install cairosvg
import cairosvg, os, sys
P = sys.argv[1]
src = f'{P}/project-design-v2/assets/characters'
for cid in ['aria', 'qbo', 'dana', 'jiko']:
    od = f'{P}/apps/mobile/assets/characters/{cid}'; os.makedirs(od, exist_ok=True)
    pd = f'{P}/project-design-v2/assets/png/{cid}'; os.makedirs(pd, exist_ok=True)
    for st in ['idle', 'think', 'encourage', 'correct', 'celebrate', 'recovery', 'bust']:
        f = f'{src}/{cid}/{st}.svg'; base = 64 if st == 'bust' else 112
        for sc, suf in [(1, ''), (2, '@2x'), (3, '@3x')]:
            cairosvg.svg2png(url=f, write_to=f'{od}/{st}{suf}.png', output_width=base * sc)
        cairosvg.svg2png(url=f, write_to=f'{pd}/{st}-512.png', output_width=512)
s = open(f'{src}/family-lineup.svg').read()
for fa, en in [('آریا', 'Aria'), ('کیوبو', 'Qbo'), ('دانا', 'Dana'), ('جیکو', 'Jiko')]: s = s.replace('>' + fa + '<', '>' + en + '<')  # cairo has no Persian shaping
cairosvg.svg2png(bytestring=s.encode(), write_to=f'{P}/project-design-v2/assets/png/family-lineup.png', output_width=1600)
b = f'{P}/project-design-v2/assets/brand'
for n, w in [('launcher-master', 1024), ('launcher-512', 512), ('launcher-128', 128), ('launcher-60', 60), ('launcher-40', 40)]:
    cairosvg.svg2png(url=f'{b}/launcher-master.svg', write_to=f'{b}/{n}.png', output_width=w)
for n in ['adaptive-foreground', 'adaptive-background', 'splash']:
    cairosvg.svg2png(url=f'{b}/{n}.svg', write_to=f'{b}/{n}.png', output_width=1024)
import shutil
shutil.copy(f'{b}/launcher-master.png', f'{P}/apps/mobile/assets/icon.png')
shutil.copy(f'{b}/adaptive-foreground.png', f'{P}/apps/mobile/assets/adaptive-icon.png')
shutil.copy(f'{b}/splash.png', f'{P}/apps/mobile/assets/splash-icon.png')
print('png ok')
