#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const android = path.join(root, 'apps/android');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const required = [
  'apps/android/settings.gradle.kts',
  'apps/android/build.gradle.kts',
  'apps/android/gradle/libs.versions.toml',
  'apps/android/gradle/wrapper/gradle-wrapper.jar',
  'apps/android/gradle/wrapper/gradle-wrapper.properties',
  'apps/android/gradlew',
  'apps/android/gradlew.bat',
  'apps/android/app/build.gradle.kts',
  'apps/android/app/src/main/AndroidManifest.xml',
  'apps/android/core/common/build.gradle.kts',
  'apps/android/core/model/build.gradle.kts',
  'apps/android/core/testing/build.gradle.kts',
  'docs/adr/ADR-0036-android-native-foundation.md',
  'docs/architecture/ANDROID_MODULE_GRAPH.md',
  'docs/architecture/ANDROID_BUILD_ENVIRONMENT.md',
  '.github/workflows/android-native.yml',
  'scripts/verify-android-environment.mjs',
  'scripts/android-build.mjs',
  'scripts/verify-android-build-harness.mjs',
  'skills/shomara-android-build/SKILL.md',
];

for (const file of required) assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);

const settings = read('apps/android/settings.gradle.kts');
for (const module of [':app', ':core:common', ':core:model', ':core:testing']) {
  assert.ok(settings.includes(`include("${module}")`), `module not included: ${module}`);
}
assert.match(settings, /RepositoriesMode\.FAIL_ON_PROJECT_REPOS/);

const catalog = read('apps/android/gradle/libs.versions.toml');
assert.match(catalog, /agp = "9\.4\.0"/);
assert.match(catalog, /kotlin = "2\.4\.10"/);
assert.ok(!catalog.includes('org.jetbrains.kotlin.android'), 'AGP 9 built-in Kotlin must be used');

const appBuild = read('apps/android/app/build.gradle.kts');
assert.match(appBuild, /applicationId = "com\.mathlearning\.app"/);
assert.match(appBuild, /compileSdk = 37/);
assert.match(appBuild, /minSdk = 24/);
assert.match(appBuild, /targetSdk = 36/);
assert.ok(!/project\(":(?:data|feature):/.test(appBuild), 'app must not depend on feature/data implementation in N02');

const wrapper = read('apps/android/gradle/wrapper/gradle-wrapper.properties');
assert.match(wrapper, /gradle-9\.6\.0-bin\.zip/);
assert.match(wrapper, /distributionSha256Sum=bbaeb2fef8710818cf0e261201dab964c572f92b942812df0c3620d62a529a01/);
const wrapperJar = fs.readFileSync(path.join(android, 'gradle/wrapper/gradle-wrapper.jar'));
assert.equal(crypto.createHash('sha256').update(wrapperJar).digest('hex'), '497c8c2a7e5031f6aa847f88104aa80a93532ec32ee17bdb8d1d2f67a194a9c7');

const sourceRoots = ['apps/android/app/src/main/kotlin', 'apps/android/core'];
const forbidden = [/answerKey/i, /correctAnswer/i, /google-services\.json/i, /signingConfig\s*=/];
const walk = (target) => {
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(kt|kts|xml)$/.test(entry.name)) {
      const text = fs.readFileSync(full, 'utf8');
      for (const pattern of forbidden) assert.ok(!pattern.test(text), `forbidden client content ${pattern} in ${path.relative(root, full)}`);
    }
  }
};
for (const sourceRoot of sourceRoots) walk(path.join(root, sourceRoot));

const workflow = read('.github/workflows/android-native.yml');
assert.ok(!/sign|keystore|artifact/i.test(workflow), 'N02 CI must not sign or publish artifacts');
assert.match(workflow, /npm run android:gate/);
assert.match(workflow, /runs-on: ubuntu-24\.04/);
assert.match(workflow, /node-version-file: "\.nvmrc"/);
assert.match(workflow, /platforms;android-37/);
assert.match(workflow, /verify-android-environment\.mjs/);
assert.equal((workflow.match(/"scripts\/verify-android-environment\.mjs"/g) ?? []).length, 2, 'preflight changes must trigger pull_request and push CI');
assert.equal((workflow.match(/"scripts\/android-build\.mjs"/g) ?? []).length, 2, 'build harness changes must trigger pull_request and push CI');

const preflight = read('scripts/verify-android-environment.mjs');
assert.match(preflight, /status: ready \? 'READY' : 'BLOCKED_ENV'/);
assert.match(preflight, /platforms', 'android-37', 'android\.jar'/);
assert.match(preflight, /javaMajor === 17/);

const buildHarness = read('scripts/android-build.mjs');
assert.match(buildHarness, /':app:compileDebugKotlin'/);
assert.match(buildHarness, /':app:assembleDebug'/);
assert.match(buildHarness, /signedForRelease: false/);

const staticOrchestrator = read('scripts/verify-static-all.mjs');
assert.match(staticOrchestrator, /'verify-android-environment\.mjs'/, 'host preflight must not be misreported as a static verifier');
assert.match(staticOrchestrator, /'android-build\.mjs'/, 'host build harness must not be misreported as a static verifier');

console.log('ANDROID_FOUNDATION: PASS (4 modules, pinned wrapper/toolchain, no signing or answer-key content)');
