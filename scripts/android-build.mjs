#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID_ROOT = path.join(ROOT, 'apps', 'android');
const REPORT_ROOT = path.join(ROOT, 'build-reports', 'android');
const MODES = new Set(['doctor', 'gate', 'assemble-debug']);

export function parseArgs(argv) {
  const mode = argv[0] ?? 'doctor';
  if (!MODES.has(mode)) throw new Error(`unknown mode: ${mode}`);
  for (let index = 1; index < argv.length; index += 1) {
    if (argv[index] === '--report') { index += 1; continue; }
    if (argv[index] !== '--allow-blocked') throw new Error(`unknown option: ${argv[index]}`);
  }
  const allowBlocked = argv.includes('--allow-blocked');
  if (allowBlocked && mode !== 'doctor') throw new Error('--allow-blocked is permitted only for doctor mode');
  const reportIndex = argv.indexOf('--report');
  const reportName = reportIndex >= 0 ? argv[reportIndex + 1] : `${mode}.json`;
  if (!reportName || reportName.startsWith('--') || path.isAbsolute(reportName) || reportName.includes('..')) {
    throw new Error('--report must be a relative filename inside build-reports/android');
  }
  return { mode, allowBlocked, reportPath: path.join(REPORT_ROOT, reportName) };
}

function run(command, args, cwd = ROOT, environment = process.env) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...environment, CI: environment.CI ?? 'true' },
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    command: [command, ...args].join(' '),
    exitCode: result.status ?? 1,
    signal: result.signal ?? null,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? result.error?.message ?? '',
  };
}

function readJsonOutput(step, label) {
  try {
    return JSON.parse(step.stdout);
  } catch {
    throw new Error(`${label} did not return valid JSON`);
  }
}

function gitCommit() {
  const step = run('git', ['rev-parse', 'HEAD']);
  return step.exitCode === 0 ? step.stdout.trim() : null;
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function writeReport(reportPath, report) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  const temporary = `${reportPath}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(report, null, 2)}\n`);
  fs.renameSync(temporary, reportPath);
}

function printStep(step) {
  if (step.stdout) process.stdout.write(step.stdout);
  if (step.stderr) process.stderr.write(step.stderr);
}

function finish(reportPath, report, exitCode) {
  report.finishedAt = new Date().toISOString();
  writeReport(reportPath, report);
  console.log(`ANDROID_BUILD: ${report.status}`);
  console.log(`MODE: ${report.mode}`);
  console.log(`REPORT: ${path.relative(ROOT, reportPath).replaceAll(path.sep, '/')}`);
  if (report.apk) {
    console.log(`APK: ${report.apk.path}`);
    console.log(`SHA256: ${report.apk.sha256}`);
  }
  process.exitCode = exitCode;
}

export function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = {
    schemaVersion: 1,
    mode: options.mode,
    status: 'RUNNING',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    commit: gitCommit(),
    environment: null,
    steps: [],
    apk: null,
  };

  // Replace any earlier PASS before a subprocess can fail or be interrupted.
  writeReport(options.reportPath, report);
  try {

  const preflight = run(process.execPath, [
    path.join(ROOT, 'scripts', 'verify-android-environment.mjs'),
    '--json',
    '--allow-blocked',
  ]);
  report.steps.push({ id: 'preflight', command: preflight.command, exitCode: preflight.exitCode });
  report.environment = readJsonOutput(preflight, 'Android preflight');
  if (preflight.exitCode !== 0 || !['READY', 'BLOCKED_ENV'].includes(report.environment.status)) {
    throw new Error('Android preflight failed or returned an invalid status');
  }

  if (report.environment.status !== 'READY') {
    report.status = 'BLOCKED_ENV';
    finish(options.reportPath, report, options.allowBlocked ? 0 : 1);
    return;
  }

  if (options.mode === 'doctor') {
    report.status = 'READY';
    finish(options.reportPath, report, 0);
    return;
  }

  const gradleTasks = ['test', 'lint', ':app:compileDebugKotlin'];
  if (options.mode === 'assemble-debug') gradleTasks.push(':app:assembleDebug');
  const gradleArgs = [...gradleTasks, '--stacktrace', '--no-daemon'];
  const gradleEnvironment = {
    ...process.env,
    ANDROID_HOME: report.environment.sdkRoot,
    ANDROID_SDK_ROOT: report.environment.sdkRoot,
  };
  const gradle = process.platform === 'win32'
    ? run('cmd.exe', ['/d', '/s', '/c', 'gradlew.bat', ...gradleArgs], ANDROID_ROOT, gradleEnvironment)
    : run('./gradlew', gradleArgs, ANDROID_ROOT, gradleEnvironment);
  report.steps.push({
    id: 'gradle',
    command: gradle.command,
    exitCode: gradle.exitCode,
    signal: gradle.signal,
    stdoutTail: gradle.stdout.slice(-8000),
    stderrTail: gradle.stderr.slice(-8000),
  });
  printStep(gradle);

  if (gradle.exitCode !== 0) {
    report.status = 'FAILED';
    finish(options.reportPath, report, gradle.exitCode || 1);
    return;
  }

  if (options.mode === 'assemble-debug') {
    const apkPath = path.join(ANDROID_ROOT, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
    if (!fs.existsSync(apkPath) || fs.statSync(apkPath).size === 0) {
      report.status = 'FAILED';
      report.steps.push({ id: 'apk-verification', exitCode: 1, detail: 'expected non-empty debug APK is missing' });
      finish(options.reportPath, report, 1);
      return;
    }
    report.apk = {
      path: path.relative(ROOT, apkPath).replaceAll(path.sep, '/'),
      sizeBytes: fs.statSync(apkPath).size,
      sha256: sha256(apkPath),
      signedForRelease: false,
    };
  }

  report.status = 'PASS';
  finish(options.reportPath, report, 0);
  } catch (error) {
    report.status = 'FAILED';
    report.error = error instanceof Error ? error.message : String(error);
    finish(options.reportPath, report, 2);
    console.error(report.error);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
try {
  main();
} catch (error) {
  console.error(`ANDROID_BUILD: FAILED\n${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 2;
}
}
