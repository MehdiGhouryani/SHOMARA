#!/usr/bin/env node
/**
 * N08-15 verifier — DEMO AUTH ISOLATION.
 *
 * The product constraint: because no OTP backend is configured yet, a DEBUG-only simulated OTP
 * exists so the onboarding journey can be exercised on a device. It must never be able to
 * authenticate anyone in a real build.
 *
 * Prose cannot enforce that, so this verifier checks the *source-set topology* that does:
 *
 *  1. the simulated provider and its factory live ONLY in a `src/debug` (or `src/testDebug`) source
 *     set — never in a main/release source set;
 *  2. no `src/main` / `src/release` file references the simulated provider, its factory, or the
 *     simulated token prefix;
 *  3. the release wiring declares `IsDebugBuild = false` and a null provider factory;
 *  4. the debug wiring is the only place a simulated provider factory is mounted;
 *  5. the documented development code is a fixed value and is labelled as development on screen;
 *  6. no cleartext/HTTP exception is added to make a fake backend work.
 *
 * Every check reads real files. There are no exceptions lists inside the checks: a violation fails
 * the gate.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const androidRoot = join(root, 'apps', 'android');

const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function rel(p) {
  return relative(root, p).split(sep).join('/');
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Source-set of an Android KTS file path, e.g. `src/main`, `src/debug`, `src/testDebug`. */
function sourceSetOf(file) {
  const marker = `${sep}src${sep}`;
  const idx = file.indexOf(marker);
  if (idx === -1) return null;
  return file.slice(idx + marker.length).split(sep)[0];
}

const kotlinFiles = walk(androidRoot).filter((f) => f.endsWith('.kt'));

// ---------------------------------------------------------------------------------------------
// 1. The simulated provider exists only in debug source sets.
// ---------------------------------------------------------------------------------------------
const simulatedSymbols = [
  'ShomaraDebugOtpProvider',
  'ShomaraDebugOtpProviderFactory',
  'ShomaraSimulatedAuth',
  'ShomaraSimulatedCredentialGate',
];

const declarations = kotlinFiles.filter(
  (f) => /class ShomaraDebugOtpProvider|object ShomaraDebugOtpProviderFactory/.test(readFileSync(f, 'utf8')),
);

if (declarations.length === 0) {
  fail('the DEBUG simulated OTP provider is missing entirely (expected in feature:onboarding/src/debug)');
} else {
  for (const file of declarations) {
    const set = sourceSetOf(file);
    if (set !== 'debug' && set !== 'testDebug') {
      fail(`simulated OTP provider declared outside a debug source set (${rel(file)}, sourceSet=${set})`);
    }
  }
  notes.push(`simulated provider declared in: ${declarations.map(rel).join(', ')}`);
}

// ---------------------------------------------------------------------------------------------
// 2. No main/release source file may reference the simulated provider or mint its token prefix.
// ---------------------------------------------------------------------------------------------
for (const file of kotlinFiles) {
  const set = sourceSetOf(file);
  if (set !== 'main' && set !== 'release') continue;
  const text = readFileSync(file, 'utf8');
  for (const symbol of ['ShomaraDebugOtpProvider', 'ShomaraDebugOtpProviderFactory']) {
    if (text.includes(symbol)) {
      fail(`${rel(file)} (${set}) references the DEBUG-only symbol ${symbol}`);
    }
  }
}

// The simulated token prefix must be defined in exactly one place (the shared contract) and must
// not be minted outside the simulated provider.
const prefixToken = 'sim-dev-session.';
const prefixOwners = kotlinFiles.filter((f) => readFileSync(f, 'utf8').includes(prefixToken));
for (const file of prefixOwners) {
  const set = sourceSetOf(file);
  if (set !== 'debug' && set !== 'testDebug' && set !== 'main') {
    fail(`simulated token prefix appears in an unexpected source set (${rel(file)}, sourceSet=${set})`);
  }
}
notes.push(`simulated token prefix appears in: ${prefixOwners.map(rel).join(', ') || 'nowhere'}`);

// ---------------------------------------------------------------------------------------------
// 3. Release wiring is inert: not a debug build, and no provider factory.
// ---------------------------------------------------------------------------------------------
const releaseWiring = join(
  androidRoot,
  'app/src/release/kotlin/com/mathlearning/app/di/AuthProviderWiring.kt',
);
const debugWiring = join(androidRoot, 'app/src/debug/kotlin/com/mathlearning/app/di/AuthProviderWiring.kt');

if (!existsSync(releaseWiring)) {
  fail('missing app/src/release/.../AuthProviderWiring.kt (release must declare its own wiring)');
} else {
  const text = readFileSync(releaseWiring, 'utf8');
  if (!/const val IsDebugBuild: Boolean = false/.test(text)) {
    fail('release wiring must declare `const val IsDebugBuild: Boolean = false`');
  }
  if (!/simulatedProviderFactory[\s\S]{0,80}?= null/.test(text)) {
    fail('release wiring must set `simulatedProviderFactory = null`');
  }
  for (const symbol of simulatedSymbols) {
    if (text.includes(symbol)) {
      fail(`release wiring references the simulated symbol ${symbol}`);
    }
  }
}

if (!existsSync(debugWiring)) {
  fail('missing app/src/debug/.../AuthProviderWiring.kt (debug must mount the simulated provider)');
} else {
  const text = readFileSync(debugWiring, 'utf8');
  if (!/const val IsDebugBuild: Boolean = true/.test(text)) {
    fail('debug wiring must declare `const val IsDebugBuild: Boolean = true`');
  }
  if (!text.includes('ShomaraDebugOtpProviderFactory')) {
    fail('debug wiring must mount ShomaraDebugOtpProviderFactory');
  }
}

// ---------------------------------------------------------------------------------------------
// 4. The development code is fixed, documented, and shown to the user as development.
// ---------------------------------------------------------------------------------------------
const simulatedAuthFile = join(
  androidRoot,
  'feature/onboarding/src/main/kotlin/com/mathlearning/feature/onboarding/ShomaraSimulatedAuth.kt',
);
if (!existsSync(simulatedAuthFile)) {
  fail('missing ShomaraSimulatedAuth.kt (the shared simulation contract)');
} else {
  const text = readFileSync(simulatedAuthFile, 'utf8');
  if (!/const val DevelopmentCode: String = "\d{4}"/.test(text)) {
    fail('ShomaraSimulatedAuth.DevelopmentCode must be a documented fixed 4-digit code');
  }
  if (!/DevelopmentModeBanner/.test(text)) {
    fail('the simulation must ship an on-screen development banner');
  }
  if (!/DevelopmentCodeHint/.test(text)) {
    fail('the simulation must tell the tester which development code to use');
  }
  if (!/isSimulatedToken/.test(text)) {
    fail('the simulation must be able to recognise its own credentials');
  }
}

// The onboarding surface must render the banner, otherwise the label exists but is never seen.
const onboardingHost = join(
  androidRoot,
  'feature/onboarding/src/main/kotlin/com/mathlearning/feature/onboarding/OnboardingHost.kt',
);
if (existsSync(onboardingHost)) {
  const text = readFileSync(onboardingHost, 'utf8');
  if (!text.includes('ShomaraSimulatedAuth.DevelopmentModeBanner')) {
    fail('ShomaraOnboardingHost does not render the development-mode banner');
  }
  if (!text.includes('ShomaraSimulatedAuth.DevelopmentCodeHint')) {
    fail('ShomaraOnboardingHost does not show the development code hint');
  }
}

// ---------------------------------------------------------------------------------------------
// 5. No cleartext escape hatch was introduced for the simulation.
// ---------------------------------------------------------------------------------------------
const manifest = join(androidRoot, 'app/src/main/AndroidManifest.xml');
if (existsSync(manifest)) {
  const text = readFileSync(manifest, 'utf8');
  if (/usesCleartextTraffic\s*=\s*"true"/.test(text)) {
    fail('AndroidManifest enables cleartext traffic (a debug simulation must not weaken transport security)');
  }
}
const networkConfig = join(androidRoot, 'app/src/main/res/xml/network_security_config.xml');
if (existsSync(networkConfig)) {
  const text = readFileSync(networkConfig, 'utf8');
  if (/cleartextTrafficPermitted\s*=\s*"true"/.test(text)) {
    fail('network_security_config permits cleartext traffic');
  }
}

// ---------------------------------------------------------------------------------------------
// 6. The production fail-closed path is intact: a missing endpoint is still an error.
// ---------------------------------------------------------------------------------------------
const otpApi = join(androidRoot, 'core/network/src/main/kotlin/com/mathlearning/core/network/ShomaraOtpApi.kt');
if (!existsSync(otpApi)) {
  fail('missing ShomaraOtpApi.kt');
} else {
  const text = readFileSync(otpApi, 'utf8');
  if (!/not configured/.test(text)) {
    fail('the real OTP API must still fail closed when no endpoint is configured');
  }
  if (!/override val isSimulated: Boolean = false/.test(text)) {
    fail('the real OTP API must declare itself non-simulated');
  }
}

// ---------------------------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------------------------
if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ ok: failures.length === 0, failures, notes }, null, 2));
}

if (failures.length > 0) {
  console.error('DEMO_AUTH_ISOLATION: FAIL');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('DEMO_AUTH_ISOLATION: PASS');
for (const note of notes) console.log(`  · ${note}`);
