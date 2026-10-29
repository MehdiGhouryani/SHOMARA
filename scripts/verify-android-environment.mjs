#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = new Set(process.argv.slice(2));
const jsonOutput = args.has('--json');
const allowBlocked = args.has('--allow-blocked');

function run(command, commandArgs = []) {
  const result = spawnSync(command, commandArgs, { encoding: 'utf8' });
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`.trim();
  return {
    ok: result.status === 0 && !result.error,
    output: output || result.error?.message || 'command produced no output',
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => path.resolve(value)))];
}

export function sdkCandidates() {
  // Explicit SDK configuration is authoritative; do not silently use another installation.
  if (process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME) {
    return unique([process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME]);
  }
  return unique([
    process.env.ANDROID_SDK_ROOT,
    process.env.ANDROID_HOME,
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk'),
    path.join(os.homedir(), 'Android', 'Sdk'),
    '/usr/local/lib/android/sdk',
    '/opt/android-sdk',
  ]);
}

export function javaCommand(env = process.env) {
  return env.JAVA_HOME
    ? path.join(env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java')
    : 'java';
}

export function validPlatformJar(platformJar) {
  if (!platformJar || !fs.existsSync(platformJar) || !fs.statSync(platformJar).isFile() || fs.statSync(platformJar).size < 4) return false;
  const descriptor = fs.openSync(platformJar, 'r');
  try {
    const signature = Buffer.alloc(4);
    fs.readSync(descriptor, signature, 0, 4, 0);
    return signature.equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  } finally {
    fs.closeSync(descriptor);
  }
}

export function resolveSdk(candidates) {
  const existing = candidates.filter((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory());
  return existing.find((candidate) => validPlatformJar(path.join(candidate, 'platforms', 'android-37', 'android.jar')))
    ?? existing[0] ?? null;
}

function main() {
const java = run(javaCommand(), ['-version']);
const javaText = java.output;
const javaMajor = Number(javaText.match(/version "(\d+)/)?.[1] ?? Number.NaN);
const candidates = sdkCandidates();
const sdkRoot = resolveSdk(candidates);
const platformJar = sdkRoot ? path.join(sdkRoot, 'platforms', 'android-37', 'android.jar') : null;
const platformReady = validPlatformJar(platformJar);

const checks = [
  {
    id: 'jdk-17',
    required: true,
    status: java.ok && javaMajor === 17 ? 'PASS' : 'FAIL',
    detail: java.ok ? `detected Java ${Number.isNaN(javaMajor) ? 'unknown' : javaMajor}` : 'java command unavailable',
  },
  {
    id: 'android-sdk-root',
    required: true,
    status: sdkRoot ? 'PASS' : 'FAIL',
    detail: sdkRoot ?? `not found; checked ${candidates.join(', ')}`,
  },
  {
    id: 'compile-sdk-37',
    required: true,
    status: platformReady ? 'PASS' : 'FAIL',
    detail: platformReady ? platformJar : 'platforms/android-37/android.jar is absent or not a valid ZIP/JAR',
  },
];

const ready = checks.filter(({ required }) => required).every(({ status }) => status === 'PASS');
const report = {
  schemaVersion: 1,
  status: ready ? 'READY' : 'BLOCKED_ENV',
  sdkRoot,
  javaCommand: javaCommand(),
  requirements: { javaMajor: 17, compileSdk: 37 },
  checks,
  nextCommand: ready
    ? 'npm run android:gate'
    : 'Install JDK 17 and Android platform 37, then rerun npm run android:doctor.',
};

if (jsonOutput) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`ANDROID_ENVIRONMENT: ${report.status}`);
  for (const check of checks) console.log(`${check.status.padEnd(4)} ${check.id}: ${check.detail}`);
  console.log(`NEXT: ${report.nextCommand}`);
}

if (!ready && !allowBlocked) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
