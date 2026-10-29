#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

for (const file of [
  'scripts/android-build.mjs',
  'scripts/verify-android-environment.mjs',
  'docs/architecture/ANDROID_BUILD_ENVIRONMENT.md',
  'skills/shomara-android-build/SKILL.md',
]) {
  assert.ok(fs.existsSync(path.join(root, file)), `missing Android build harness file: ${file}`);
}

const build = read('scripts/android-build.mjs');
for (const mode of ['doctor', 'gate', 'assemble-debug']) assert.ok(build.includes(`'${mode}'`), `missing mode ${mode}`);
for (const task of ['test', 'lint', ':app:compileDebugKotlin', ':app:assembleDebug']) {
  assert.ok(build.includes(`'${task}'`), `missing Gradle task ${task}`);
}
for (const contract of ['BLOCKED_ENV', 'sha256', 'signedForRelease: false', '--no-daemon']) {
  assert.ok(build.includes(contract), `missing build contract ${contract}`);
}
assert.ok(build.includes("run('cmd.exe'"), 'Windows must invoke gradlew.bat through cmd.exe');
assert.ok(build.includes("mode !== 'doctor'"), 'only doctor may tolerate an environment blocker');
assert.ok(!build.includes('assembleRelease'), 'release assembly is forbidden before N10/HG-05');
assert.ok(!build.includes('bundleRelease'), 'release bundle is forbidden before N10/HG-05');

const pkg = JSON.parse(read('package.json'));
assert.equal(pkg.scripts['android:doctor'], 'node scripts/android-build.mjs doctor');
assert.equal(pkg.scripts['android:gate'], 'node scripts/android-build.mjs gate');
assert.equal(pkg.scripts['android:assemble:debug'], 'node scripts/android-build.mjs assemble-debug');

const ignore = read('.gitignore');
assert.match(ignore, /^build-reports\/$/m, 'generated build reports must be ignored');

const workflow = read('.github/workflows/android-native.yml');
assert.match(workflow, /npm run android:gate/);
assert.match(workflow, /node-version-file: "\.nvmrc"/);
assert.ok(!/assemble-debug|assembleRelease|bundleRelease/.test(workflow), 'N02 CI must verify without publishing a package');

console.log('ANDROID_BUILD_HARNESS: PASS (doctor/gate/debug APK, fail-closed preflight, hash report, unsigned CI)');
