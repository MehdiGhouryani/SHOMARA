// Static gate for UI v1 foundation (Stage U1, ADR-0035): dependencies, fonts, tokens, primitives rules,
// character assets and the visual-parity manifest. The pixel comparison itself is `npm run parity`
// (needs Chromium) and is a separate, recorded gate.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`);
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

// 1) SDK-matched dependencies
const mobile = JSON.parse(read('apps/mobile/package.json'));
const dep = (n) => mobile.dependencies?.[n] ?? mobile.devDependencies?.[n];
const expected = { 'react-native-svg': '15.15.4', 'expo-linear-gradient': '~57.0.2', 'expo-speech': '~57.0.3', 'react-native-web': '~0.21.0', 'react-dom': '19.2.3' };
for (const [name, version] of Object.entries(expected)) check(`dep:${name}`, dep(name) === version, `${dep(name)} (want ${version})`);
check('dep:react-native-web-is-dev-only', !mobile.dependencies?.['react-native-web'] && !mobile.dependencies?.['react-dom'], 'parity harness only');

// 2) Fonts: exactly two weights
const layout = read('apps/mobile/app/_layout.tsx');
check('fonts-400-600-loaded', /Vazirmatn_400Regular/.test(layout) && /Vazirmatn_600SemiBold/.test(layout));
check('fonts-no-700-900', !/Vazirmatn_700|Vazirmatn_900/.test(layout));

// 3) Tokens
const tokens = JSON.parse(read('packages/design-system/src/tokens.json'));
check('tokens-ui-groups', ['screen', 'onColor', 'gradient', 'type', 'button', 'control', 'surface', 'portrait', 'bead', 'highlight'].every((k) => tokens.ui?.[k]));
check('tokens-ui-weights-400-600', [...new Set(Object.values(tokens.ui.type).map((t) => t.weight))].sort().join() === '400,600');
check('tokens-button-matches-page-css', tokens.ui.button.minHeight === 58 && tokens.ui.button.edge === 6 && tokens.ui.button.radius === 20, 'page CSS: 58px, 6px edge, 20px radius');
check('tokens-palette-adr-0035', tokens.color.brand.primary === '#2B5C7A' && tokens.color.brand.secondary === '#E3A33B' && tokens.color.bg.canvas === '#F5F7F8');

// 4) Primitive source rules
const v1dir = 'apps/mobile/src/ui/v1';
const files = fs.readdirSync(path.join(ROOT, v1dir)).filter((f) => /\.(ts|tsx)$/.test(f) && !f.endsWith('.test.ts'));
const colorLiteral = /#[0-9A-Fa-f]{3,8}\b|rgba?\(/;
const physical = /\b(left|right|marginLeft|marginRight|paddingLeft|paddingRight|borderLeftWidth|borderRightWidth)\s*:/;
const offenders = { color: [], physical: [] };
for (const f of files) {
  const lines = read(`${v1dir}/${f}`).split('\n');
  lines.forEach((l, i) => {
    const code = l.trim();
    if (code.startsWith('//') || code.startsWith('*') || code.startsWith('/*')) return;
    if (!['tokens.ts', 'icons.ts'].includes(f) && colorLiteral.test(code)) offenders.color.push(`${f}:${i + 1}`);
    if (physical.test(code)) offenders.physical.push(`${f}:${i + 1}`);
  });
}
check('v1-no-color-literals', offenders.color.length === 0, offenders.color.join(', ') || `${files.length} files`);
check('v1-logical-props-only', offenders.physical.length === 0, offenders.physical.join(', ') || 'start/end only (RTL-safe)');
check('v1-button-accessible', /accessibilityRole="button"/.test(read(`${v1dir}/Button.tsx`)) && /accessibilityState/.test(read(`${v1dir}/Button.tsx`)));
check('v1-iconbutton-requires-label', /label: string;/.test(read(`${v1dir}/IconButton.tsx`)) && /accessibilityLabel=\{label\}/.test(read(`${v1dir}/IconButton.tsx`)));
check('v1-progress-semantics', /accessibilityRole="progressbar"/.test(read(`${v1dir}/TopBar.tsx`)));
check('v1-icons-decorative', /accessibilityElementsHidden/.test(read(`${v1dir}/Icon.tsx`)));

// 5) Character assets: every file has provenance and a size entry
const artDir = 'apps/mobile/assets/characters-v1';
const webps = fs.readdirSync(path.join(ROOT, artDir)).filter((f) => f.endsWith('.webp')).map((f) => f.replace('.webp', ''));
const prov = JSON.parse(read(`${artDir}/PROVENANCE.json`));
const sizes = read(`${v1dir}/characterSizes.ts`);
check('assets-9-images', webps.length === 9, `${webps.length} files`);
check('assets-provenance', webps.every((n) => prov.files?.[n]), 'every image has a recorded source');
check('assets-sizes', webps.every((n) => sizes.includes(`'${n}'`)));

// 6) Parity manifest is consistent with goldens, rectangles and the specimen registry
const manifest = JSON.parse(read('apps/mobile/parity/manifest.json'));
const rects = JSON.parse(read('docs/design-handoff-2026-10/pages-v1/goldens/rects.json'));
const registry = read('apps/mobile/parity/specimens/index.tsx');
let manifestOk = true;
for (const s of manifest) {
  const ok = exists(`docs/design-handoff-2026-10/pages-v1/goldens/${s.page}.png`) && Boolean(rects[s.page]?.[s.selector]?.[s.index]) && (registry.includes(`'${s.id}'`) || registry.includes(`${s.id}:`));
  if (!ok) { manifestOk = false; failures.push(`parity-specimen:${s.id} is missing its golden, rectangle or registry entry`); }
}
check('parity-manifest-consistent', manifestOk, `${manifest.length} specimens`);
check('parity-thresholds-strict', manifest.every((s) => s.maxDiffPercent <= 0.5), 'every specimen allows at most 0.5% differing pixels');

if (failures.length) {
  console.error(`FAIL ${failures.length} check(s):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('UI_V1_FOUNDATION: PASS');
