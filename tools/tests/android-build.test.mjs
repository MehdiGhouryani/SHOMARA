import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { parseArgs } from '../../scripts/android-build.mjs';
import { javaCommand, resolveSdk, validPlatformJar, pinnedPlatformJars, PINNED_PLATFORM_PACKAGE } from '../../scripts/verify-android-environment.mjs';

function writePlatform(root, platformDir, packageId, jarBytes = Buffer.from([0x50, 0x4b, 0x03, 0x04])) {
  const dir = path.join(root, 'platforms', platformDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'android.jar'), jarBytes);
  fs.writeFileSync(path.join(dir, 'package.xml'), `<?xml version="1.0" encoding="utf-8"?><localPackage path="${packageId}" version="2"/>`);
  return dir;
}

test('rejects unknown flags and blocker bypass for gate/APK', () => {
  for (const mode of ['gate', 'assemble-debug']) {
    assert.throws(() => parseArgs([mode, '--allow-blocked']));
    assert.throws(() => parseArgs([mode, '--skip-tests']));
  }
  assert.equal(parseArgs(['doctor', '--allow-blocked']).allowBlocked, true);
});

test('report cannot escape generated report directory', () => {
  for (const name of ['../PASS.json', '/tmp/PASS.json', '--allow-blocked', '']) {
    assert.throws(() => parseArgs(['gate', '--report', name]));
  }
  assert.match(parseArgs(['gate', '--report', 'gate.json']).reportPath, /build-reports.*android.*gate.json$/);
});

test('JAVA_HOME selection matches the Gradle wrapper', () => {
  assert.equal(javaCommand({}), 'java');
  assert.equal(javaCommand({ JAVA_HOME: '/jdk-17' }), path.join('/jdk-17', 'bin', process.platform === 'win32' ? 'java.exe' : 'java'));
});

test('SDK discovery skips incomplete fallback installations and rejects directories as jars', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'shomara-sdk-test-'));
  try {
    const empty = path.join(temporary, 'empty');
    const complete = path.join(temporary, 'complete');
    fs.mkdirSync(empty);
    // sdkmanager's inconsistent-location case: package 37.0 living under the legacy bare dir.
    writePlatform(complete, 'android-37', PINNED_PLATFORM_PACKAGE);
    assert.equal(resolveSdk([empty, complete]), complete);
    assert.equal(validPlatformJar(empty), false);
    const jar = path.join(complete, 'platforms', 'android-37', 'android.jar');
    fs.writeFileSync(jar, 'invalid');
    assert.equal(validPlatformJar(jar), false);
  } finally { fs.rmSync(temporary, { recursive: true }); }
});

// P1 hardening (2026-11-12): platform identity is the Package ID in package.xml, verified live
// via `sdkmanager --list --channel=0` — bare `platforms;android-37` no longer exists upstream;
// `platforms;android-37.0` is the pinned package. Dir names alone are NOT accepted.
test('platform pin requires package.xml to declare platforms;android-37.0 exactly', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'shomara-sdk-pin-test-'));
  try {
    const canonical = path.join(temporary, 'canonical');
    const jar37_0 = path.join(writePlatform(canonical, 'android-37.0', PINNED_PLATFORM_PACKAGE), 'android.jar');
    assert.deepEqual(pinnedPlatformJars(path.join(canonical, 'platforms')), [jar37_0]);
    assert.equal(resolveSdk([canonical]), canonical);

    // Wrong minor version installed under the canonical dir name: rejected.
    const wrongMinor = path.join(temporary, 'wrongMinor');
    writePlatform(wrongMinor, 'android-37.0', 'platforms;android-37.1');
    assert.deepEqual(pinnedPlatformJars(path.join(wrongMinor, 'platforms')), [], 'package platforms;android-37.1 must never satisfy the 37.0 pin');

    // Legacy bare dir WITH the pinned package declared: accepted (inconsistent-location case).
    const legacy = path.join(temporary, 'legacy');
    writePlatform(legacy, 'android-37', PINNED_PLATFORM_PACKAGE);
    assert.equal(pinnedPlatformJars(path.join(legacy, 'platforms')).length, 1);

    // Wrong API level under the legacy dir: rejected.
    const wrongApi = path.join(temporary, 'wrongApi');
    writePlatform(wrongApi, 'android-37', 'platforms;android-36');
    assert.deepEqual(pinnedPlatformJars(path.join(wrongApi, 'platforms')), [], 'android-36 must never satisfy compileSdk 37');

    // Hand-copied dir without a package manifest: rejected.
    const noManifest = path.join(temporary, 'noManifest');
    const bare = path.join(noManifest, 'platforms', 'android-37.0');
    fs.mkdirSync(bare, { recursive: true });
    fs.writeFileSync(path.join(bare, 'android.jar'), Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    assert.deepEqual(pinnedPlatformJars(path.join(noManifest, 'platforms')), [], 'a dir without package.xml must not count as READY');
  } finally { fs.rmSync(temporary, { recursive: true }); }
});

test('invalid explicit JAVA_HOME blocks CLI even if PATH Java is valid', () => {
  const result = spawnSync(process.execPath, ['scripts/verify-android-environment.mjs', '--json'], {
    cwd: new URL('../..', import.meta.url),
    env: { ...process.env, JAVA_HOME: '/nonexistent-shomara-jdk' },
    encoding: 'utf8',
  });
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'BLOCKED_ENV');
  assert.equal(report.checks.find(({ id }) => id === 'jdk-17').status, 'FAIL');
});

test('preflight crash replaces a stale PASS with a FAILED report', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'shomara-build-test-'));
  try {
    fs.mkdirSync(path.join(temporary, 'scripts'));
    fs.cpSync(new URL('../../scripts/android-build.mjs', import.meta.url), path.join(temporary, 'scripts/android-build.mjs'));
    fs.writeFileSync(path.join(temporary, 'scripts/verify-android-environment.mjs'), 'process.exitCode = 1;');
    const report = path.join(temporary, 'build-reports/android/gate.json');
    fs.mkdirSync(path.dirname(report), { recursive: true });
    fs.writeFileSync(report, JSON.stringify({ status: 'PASS' }));
    const result = spawnSync(process.execPath, ['scripts/android-build.mjs', 'gate'], { cwd: temporary, encoding: 'utf8' });
    assert.equal(result.status, 2);
    const failure = JSON.parse(fs.readFileSync(report, 'utf8'));
    assert.equal(failure.status, 'FAILED');
    assert.match(failure.error, /valid JSON/);
    assert.equal(failure.apk, null);
  } finally { fs.rmSync(temporary, { recursive: true }); }
});
