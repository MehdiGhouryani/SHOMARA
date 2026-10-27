// Bundles apps/mobile/parity/entry.tsx for the browser with react-native-web (no Metro, no app routes).
import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';

const ROOT = process.cwd();
const P = path.join(ROOT, 'apps/mobile/parity');
// `--flow` builds the interaction harness (real onboarding screen + recording stubs) instead of the specimens.
const FLOW = process.argv.includes('--flow');
const DIST = path.join(P, FLOW ? 'dist-flow' : 'dist');
const FONT_DIR = path.join(ROOT, 'node_modules/@expo-google-fonts/vazirmatn');

// AppText reads user preferences from React context; the harness has no provider and AppText already
// falls back to defaults when the hook throws, so the real context module (storage, router) is stubbed.
const stubAppState = {
  name: 'stub-app-state',
  setup(build) {
    build.onResolve({ filter: /state\/AppStateContext$/ }, () => ({ path: 'app-state-stub', namespace: 'stub' }));
    build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
      contents: 'export function useAppState(){ throw new Error("no provider in parity harness"); }',
      loader: 'js',
    }));
  },
};
// react-native-web accepts { uri } image sources, which is what a data URL module must export.
const webpAsUri = {
  name: 'webp-as-uri',
  setup(build) {
    build.onLoad({ filter: /\.(webp|png)$/ }, (args) => ({
      contents: `module.exports = { uri: "data:image/${args.path.endsWith('.png') ? 'png' : 'webp'};base64,${fs.readFileSync(args.path).toString('base64')}" };`,
      loader: 'js',
    }));
  },
};

const STUBS = path.join(P, 'flow/stubs');
const flowStubs = {
  name: 'flow-stubs',
  setup(build) {
    // FLOW_STATION runs the real lesson player and start screen: only native and network edges are stubbed, so the
    // pure state module and the local-content runtime stay real.
    const STATION = Boolean(process.env.FLOW_STATION);
    const map = [
      [/^expo-router$/, 'expo-router.tsx'],
      [/state\/AppStateContext$/, 'appState.ts'],
      ...(STATION
        ? [
            [/config\/runtime$/, 'config-runtime.ts'],
            [/auth\/AuthSession$/, 'auth-session.ts'],
            [/auth\/ClientInstallation$/, 'client-installation.ts'],
            [/sync\/MobileSyncManager$/, 'sync-manager.ts'],
            [/content\/ContentManager$/, 'content-manager.ts'],
            [/^expo-speech$/, 'expo-speech.ts'],
            [/^react-native-reanimated$/, 'reanimated.ts'],
            [/^@rive-app\/react-native$/, 'rive.tsx'],
          ]
        : [
            [/state\/appStateCore$/, 'appStateCore.ts'],
            [/station\/runtimeApi$/, 'runtimeApi.ts'],
          ]),
      [/auth\/authApi$/, 'authApi.ts'],
      [/content\/bootstrap$/, 'bootstrap.ts'],
      [/^react-native-safe-area-context$/, 'safe-area.tsx'],
      // Flow builds render the real Ionicons (the harness embeds its font, and V2 states read
      // through glyph + fill). Pixel-parity specimen builds keep the null stub for golden immutability.
      ...(FLOW ? [[/^expo-font$/, 'expo-font.ts']] : []),
      ...(FLOW ? [] : [[/^@expo\/vector-icons\/Ionicons$/, 'ionicons.tsx']]),
    ];
    for (const [filter, file] of map) build.onResolve({ filter }, () => ({ path: path.join(STUBS, file) }));
    // The screen under test (override with FLOW_TARGET to probe another copy of the screen).
    build.onResolve({ filter: /^onboarding-under-test$/ }, () => ({
      path: path.resolve(ROOT, process.env.FLOW_TARGET ?? 'apps/mobile/app/onboarding.tsx'),
    }));
  },
};

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
await esbuild.build({
  entryPoints: [path.join(P, FLOW ? 'flow/entry.tsx' : 'entry.tsx')],
  outfile: path.join(DIST, 'bundle.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  tsconfig: path.join(ROOT, 'apps/mobile/tsconfig.json'),
  alias: { 'react-native': 'react-native-web' },
  resolveExtensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
  // Flow builds bundle the real @expo/vector-icons (JSX inside its .js files, and its font asset).
  loader: { '.js': FLOW ? 'jsx' : 'js', '.ttf': 'dataurl' },
  mainFields: ['browser', 'module', 'main'],
  define: { __DEV__: 'false', 'process.env.NODE_ENV': '"production"', 'process.env.EXPO_OS': '"web"', ...(FLOW ? { 'process.env': '{}' } : {}), global: 'globalThis' },
  plugins: FLOW ? [flowStubs, webpAsUri] : [stubAppState, webpAsUri],
  logLevel: 'warning',
});

const font = (file) => fs.readFileSync(path.join(FONT_DIR, file)).toString('base64');
// The icon font must render in the browser harness too: V2 states read through glyph + fill
// (DESIGN COMPONENTS.md), so blank Ionicons in captures would hide real semantics.
const ICON_FONT = path.join(ROOT, 'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf');
const iconFont = fs.readFileSync(ICON_FONT).toString('base64');
fs.writeFileSync(
  path.join(DIST, 'index.html'),
  `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8">
<style>
@font-face{font-family:'Vazirmatn_400Regular';src:url(data:font/ttf;base64,${font('400Regular/Vazirmatn_400Regular.ttf')}) format('truetype')}
@font-face{font-family:'Vazirmatn_600SemiBold';src:url(data:font/ttf;base64,${font('600SemiBold/Vazirmatn_600SemiBold.ttf')}) format('truetype')}
@font-face{font-family:'Ionicons';src:url(data:font/ttf;base64,${iconFont}) format('truetype')}
html,body{margin:0;background:#F5F7F8}#root{width:390px;height:844px;position:relative;overflow:hidden}
*{caret-color:transparent}
</style></head><body><div id="root"></div><script src="bundle.js"></script></body></html>`,
);
console.log('parity bundle built:', path.relative(ROOT, DIST));
