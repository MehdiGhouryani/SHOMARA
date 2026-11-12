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

/**
 * Pinned compile platform (P1 hardening, 2026-11-12): the exact upstream package ID, verified
 * live via `sdkmanager --list --channel=0` — the bare `platforms;android-37` package no longer
 * exists in the stable index; API 37 is published as `android-37.0` (rev 2 at the baseline date).
 * The installed Package ID must be EXACTLY this everywhere; `compileSdk` stays the integer 37.
 */
export const PINNED_PLATFORM_PACKAGE = 'platforms;android-37.0';

function dirDeclaresPinnedPackage(dir, pinnedPackage) {
  // package.xml is written by sdkmanager and declares the real installed package ID — the
  // authoritative identity check. A directory named like the platform but containing a
  // different (or missing) package manifest is rejected.
  const manifest = path.join(dir, 'package.xml');
  if (!fs.existsSync(manifest) || !fs.statSync(manifest).isFile()) return false;
  return fs.readFileSync(manifest, 'utf8').includes(`path="${pinnedPackage}"`);
}

/**
 * android.jar candidates that provably install the PINNED package. `sdkmanager` warns about
 * "inconsistent location" when a package lives under the legacy bare dir (`android-37` instead
 * of `android-37.0`); the dir name alone is NOT the identity — package.xml is. Canonical dir
 * first, legacy bare dir second; both must declare the pinned package ID.
 */
export function pinnedPlatformJars(platformsRoot, pinnedPackage = PINNED_PLATFORM_PACKAGE) {
  if (!platformsRoot || !fs.existsSync(platformsRoot) || !fs.statSync(platformsRoot).isDirectory()) return [];
  const canonicalDir = pinnedPackage.replace('platforms;', '');
  const legacyDir = canonicalDir.replace(/\.\d+$/, '');
  const present = fs.readdirSync(platformsRoot);
  return [canonicalDir, legacyDir]
    .filter((name) => present.includes(name))
    .map((name) => path.join(platformsRoot, name))
    .filter((dir) => dirDeclaresPinnedPackage(dir, pinnedPackage))
    .map((dir) => path.join(dir, 'android.jar'))
    .filter(validPlatformJar);
}

export function resolveSdk(candidates) {
  const existing = candidates.filter((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory());
  return existing.find((candidate) => pinnedPlatformJars(path.join(candidate, 'platforms')).length > 0)
    ?? existing[0] ?? null;
}

function main() {
const java = run(javaCommand(), ['-version']);
const javaText = java.output;
const javaMajor = Number(javaText.match(/version "(\d+)/)?.[1] ?? Number.NaN);
const candidates = sdkCandidates();
const sdkRoot = resolveSdk(candidates);
const platformJar = sdkRoot ? (pinnedPlatformJars(path.join(sdkRoot, 'platforms'))[0] ?? null) : null;
const platformReady = platformJar != null;

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
    detail: platformReady ? `${platformJar} (package.xml must declare ${PINNED_PLATFORM_PACKAGE})` : `pinned package ${PINNED_PLATFORM_PACKAGE} not installed: no platforms/android-37.0/android.jar whose package.xml declares it`,
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
