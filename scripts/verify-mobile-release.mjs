import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const mobile = path.join(root, 'apps/mobile');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];

const app = JSON.parse(read('apps/mobile/app.json'));
const expo = app.expo;
const android = expo.android;
const eas = JSON.parse(read('apps/mobile/eas.json'));
const mobilePackage = JSON.parse(read('apps/mobile/package.json'));

if (android.package !== 'com.mathlearning.app') failures.push(`ANDROID_PACKAGE_UNEXPECTED:${android.package}`);
if (expo.userInterfaceStyle !== 'light') failures.push('SYSTEM_DARK_MODE_NOT_LOCKED');
if (android.versionCode !== 1) failures.push(`VERSION_CODE_EXPECTED_1:${android.versionCode}`);
if (!expo.plugins.some((item) => Array.isArray(item) && item[0] === 'expo-secure-store')) failures.push('SECURE_STORE_PLUGIN_MISSING');
if (android.adaptiveIcon?.backgroundColor !== '#F5F7F8' /* canvas, ADR-0035 */) failures.push('ADAPTIVE_ICON_BACKGROUND_NOT_CANONICAL');
const build = eas.build ?? {};
if (build.production?.android?.buildType !== 'app-bundle') failures.push('PRODUCTION_NOT_AAB');
if (build.preview?.android?.buildType !== 'apk') failures.push('PREVIEW_NOT_APK');
if (build['market-apk']?.android?.buildType !== 'apk') failures.push('MARKET_APK_NOT_APK');
// Re-baselined 2026-10-04 (P02-A): since SDK 55 Expo modules share the SDK major. The old '~15.0.7' pin
// was the SDK 54 release and drifted from expo ~57. Require SDK-aligned majors for Expo-owned modules.
const sdkMajor = String(mobilePackage.dependencies?.expo ?? '').replace(/^[~^]/, '').split('.')[0];
for (const mod of ['expo-secure-store', 'expo-build-properties', 'expo-crypto', 'expo-file-system', 'expo-router', 'expo-splash-screen', 'expo-localization', 'expo-linking', 'expo-font']) {
  const major = String(mobilePackage.dependencies?.[mod] ?? '').replace(/^[~^]/, '').split('.')[0];
  if (major !== sdkMajor) failures.push(`EXPO_SDK_VERSION_DRIFT:${mod}`);
}

const allowedProdEnvKeys = new Set(['EXPO_PUBLIC_API_BASE_URL','EXPO_PUBLIC_SUPABASE_URL','EXPO_PUBLIC_SUPABASE_ANON_KEY','MOBILE_RELEASE_CHANNEL']);
const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.expo') continue;
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx|ts|json|js)$/.test(entry.name)) sourceFiles.push(full);
  }
}
walk(mobile);
for (const file of sourceFiles) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, 'utf8');
  if (rel !== 'apps/mobile/src/config/runtime.ts' && /http:\/\/localhost(?::\d+)?/.test(text)) failures.push(`LOCALHOST_OUTSIDE_RUNTIME_CONFIG:${rel}`);
  if (rel.endsWith('.tsx') && /[\u{1F300}-\u{1FAFF}]/u.test(text)) failures.push(`EMOJI_IN_UI_SOURCE:${rel}`);
}

const runtimeConfig = read('apps/mobile/src/config/runtime.ts');
assert.match(runtimeConfig, /__DEV__ \? 'http:\/\/localhost:3000' : ''/);
assert.match(runtimeConfig, /https:/);

// App boot must route a fresh/corrupt local install to onboarding before child content.
const rootLayout = read('apps/mobile/app/_layout.tsx');
assert.match(rootLayout, /Redirect, Stack.*from 'expo-router'/);
assert.match(rootLayout, /entry\.kind === 'NEW' \|\| entry\.kind === 'RECOVER'/);
assert.match(rootLayout, /href=\"\/onboarding\"/);

// Production station runtime must fail closed; local/demo runtime is development-only.
const stationFlow = read('apps/mobile/src/station/StationFlow.tsx');
assert.match(stationFlow, /productionConfigError\(\)/);
assert.match(stationFlow, /REMOTE_RUNTIME_UNAVAILABLE/);

// Settings must be persisted, not reset on each mount.
const settings = read('apps/mobile/app/settings.tsx');
assert.match(settings, /useAppState\(\)/);
assert.doesNotMatch(settings, /useState<SettingsState>/);
const appState = read('apps/mobile/src/state/appStateCore.ts');
// Local-state schema must be explicit and >= 3 (v3 introduced the release-ready shape); older versions are migrated, newer rejected.
{
  const m = appState.match(/SCHEMA_VERSION = (\d+)/);
  assert.ok(m && Number(m[1]) >= 3, 'mobile local-state SCHEMA_VERSION must be declared and >= 3');
  assert.match(appState, /schemaVersion > SCHEMA_VERSION\) return \{ ok: false, reason: 'NEWER_VERSION' \}/);
}
assert.match(appState, /preferences/);
const animation = read('apps/mobile/src/components/AnimatedCharacter.tsx');
// P03 centralized the motion gate: characters must use the shared hook, which honors the in-app preference.
assert.match(animation, /useReducedMotionPreference/);
assert.match(read('apps/mobile/src/game-feel/motionPreferences.ts'), /preferences\.motion/);

// Production-facing auth must persist a token through SecureStore.
const auth = read('apps/mobile/src/auth/AuthSession.ts');
assert.match(auth, /expo-secure-store/);
assert.match(auth, /setItemAsync/);
assert.match(auth, /getItemAsync/);

// The release journey is phone-only: no guest/demo/alternate auth path is exposed.
const onboarding = read('apps/mobile/app/onboarding.tsx');
assert.match(onboarding, /requestOtp\(/);
assert.match(onboarding, /verifyOtp\(/);
assert.doesNotMatch(onboarding, /ParentGate|PARENT_GATE|chooseGuest|GUEST|GOOGLE|Google/);
assert.doesNotMatch(onboarding, /if \(!__DEV__\) return;/);

// Core child surface must stay exactly 3 tabs.
const tabs = read("apps/mobile/app/(tabs)/_layout.tsx");
for (const name of ['index', 'practice', 'profile']) assert.match(tabs, new RegExp(`name=\"${name}\"`));
assert.doesNotMatch(tabs, /name="teacher|leaderboard|treasure|skills"/);

if (failures.length) {
  console.error('MOBILE_RELEASE_GATE: BLOCKED');
  console.error(failures.join('\n'));
  process.exit(2);
}

console.log('MOBILE_RELEASE_GATE: PASS');
console.log(JSON.stringify({
  package: android.package,
  version: expo.version,
  androidVersionCode: android.versionCode,
  targetSdk: 36,
  productionArtifact: 'AAB',
  previewArtifact: 'APK',
  secureAuthStorage: true,
  childPrimaryTabs: ['مسیر','تمرین','من'],
}, null, 2));
