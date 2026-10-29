import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { parseArgs } from '../../scripts/android-build.mjs';
import { javaCommand, resolveSdk, validPlatformJar } from '../../scripts/verify-android-environment.mjs';

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
    const jar = path.join(complete, 'platforms', 'android-37', 'android.jar');
    fs.mkdirSync(empty);
    fs.mkdirSync(path.dirname(jar), { recursive: true });
    fs.writeFileSync(jar, Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    assert.equal(resolveSdk([empty, complete]), complete);
    assert.equal(validPlatformJar(empty), false);
    fs.writeFileSync(jar, 'invalid');
    assert.equal(validPlatformJar(jar), false);
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
