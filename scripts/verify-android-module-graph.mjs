#!/usr/bin/env node
/**
 * Static Android architecture guard (P3, ADR-0041) — enforces the module dependency rules of
 * docs/architecture/ANDROID_MODULE_GRAPH.md against the actual Kotlin sources:
 *
 *  R1  GlobalScope is forbidden in every main source set (no unowned global mutable state).
 *  R2  Dispatchers.Main is forbidden in main sources of every module except :app — dispatchers
 *      are injected (testability, cancellation discipline).
 *  R3  feature/* main sources must not import third-party infra or the storage/sync
 *      implementations: okhttp3, androidx.datastore, com.mathlearning.core.database,
 *      com.mathlearning.sync.
 *  R4  com.mathlearning.sync may be imported only by :app main sources (composition root) and
 *      by :sync itself.
 *  R5  No feature-to-feature imports (feature/A must not import com.mathlearning.feature.B, A≠B).
 *  R6  feature/* imports of the data/network modules (core:network, core:datastore) are limited
 *      to the dated allowlist below — new violations fail the verifier, so the boundary can only
 *      shrink, never grow silently.
 *  R7  Persistence fail-closed (O4/ADR-0042): fallbackToDestructiveMigration is forbidden
 *      anywhere in apps/android, and Room.databaseBuilder may appear only inside
 *      :core:database's single ShomaraLearningDatabase factory.
 *  R8  Package engine (P5/ADR-0043): :core:contentpackage is network-free (no java.net/okhttp/
 *      javax.net imports — airplane mode is the normal state) and only :app may import it until
 *      the wiring phase lands.
 *
 * Existing boundary exceptions are an explicit ALLOWLIST with a reason and a review date; the
 * list may only shrink. Any violation not in the allowlist exits 1.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const androidRoot = path.join(root, 'apps', 'android');

const ALLOWLIST = [
  {
    rule: 'R6-feature-imports-data-network',
    file: 'feature/lesson/src/main/kotlin/com/mathlearning/feature/lesson/ShomaraLessonHost.kt',
    reason: 'lesson orchestrator receives LessonGateway/LessonCheckpointStore via DI; interface extraction is recorded debt (ADR-0041)',
    added: '2026-11-13',
  },
  {
    rule: 'R6-feature-imports-data-network',
    file: 'feature/lesson/src/main/kotlin/com/mathlearning/feature/lesson/ShomaraLessonJourney.kt',
    reason: 'lesson journey orchestration over gateway/checkpoint types (same debt as the host)',
    added: '2026-11-13',
  },
  {
    rule: 'R6-feature-imports-data-network',
    file: 'feature/onboarding/src/main/kotlin/com/mathlearning/feature/onboarding/ShomaraAuthSession.kt',
    reason: 'documented session orchestration over the OTP API (module graph responsibility table)',
    added: '2026-11-13',
  },
  {
    rule: 'R6-feature-imports-data-network',
    file: 'feature/onboarding/src/main/kotlin/com/mathlearning/feature/onboarding/ShomaraSimulatedAuth.kt',
    reason: 'session-orchestration helper over OTP provider types (same documented responsibility)',
    added: '2026-11-13',
  },
  {
    rule: 'R6-feature-imports-data-network',
    file: 'feature/onboarding/src/debug/kotlin/com/mathlearning/feature/onboarding/ShomaraDebugOtpProvider.kt',
    reason: 'DEBUG-variant-only provider wiring over ShomaraOtpApi; release has no reference to this type (compile-time guarantee, N08-15)',
    added: '2026-11-13',
  },
];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'build' || entry.name === 'node_modules') continue;
      walk(full, acc);
    } else if (entry.name.endsWith('.kt')) {
      acc.push(full);
    }
  }
  return acc;
}

const violations = [];
const files = walk(androidRoot);
const rel = (file) => path.relative(androidRoot, file).split(path.sep).join('/');
const isTest = (relPath) => relPath.includes('/test/') || relPath.includes('/androidTest/') || relPath.includes('/testDebug/');
const moduleOf = (relPath) => relPath.split('/')[0] === 'app' || relPath.split('/')[0] === 'sync' || relPath.split('/')[0].startsWith('core:')
  ? relPath.split('/')[0]
  : relPath.split('/').slice(0, 2).join('/');

/** Strip comments so KDoc prose never trips a code rule (docs are not violations). */
function codeOnly(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
}

for (const file of files) {
  const relPath = rel(file);
  const moduleDir = relPath.split('/')[0];
  const featureMatch = relPath.startsWith('feature/');
  const featureName = featureMatch ? relPath.split(path.sep).slice(0, 2).join('/') : null;
  const text = codeOnly(fs.readFileSync(file, 'utf8'));

  if (!isTest(relPath) && /\bGlobalScope\b/.test(text)) {
    violations.push({ rule: 'R1-no-globalscope', file: relPath, detail: 'GlobalScope reference' });
  }
  if (!isTest(relPath) && moduleDir !== 'app' && /Dispatchers\.Main\b/.test(text)) {
    violations.push({ rule: 'R2-no-main-discovery', file: relPath, detail: 'Dispatchers.Main must be injected' });
  }
  if (!isTest(relPath) && featureMatch) {
    for (const pattern of ['import okhttp3', 'import androidx.datastore', 'import com.mathlearning.core.database', 'import com.mathlearning.sync']) {
      if (text.includes(pattern)) {
        const rule = pattern.includes('core.database') ? 'R3-feature-imports-database'
          : pattern.includes('com.mathlearning.sync') ? 'R3-feature-imports-sync' : 'R3-feature-imports-infra';
        violations.push({ rule, file: relPath, detail: pattern });
      }
    }
    const crossFeature = [...text.matchAll(/import\s+com\.mathlearning\.feature\.([a-z]+)/g)]
      .filter((m) => `feature/${m[1]}` !== featureName)
      .map((m) => `feature/${m[1]}`);
    if (crossFeature.length) {
      violations.push({ rule: 'R5-no-feature-to-feature', file: relPath, detail: crossFeature.join(', ') });
    }
    for (const pkg of ['com.mathlearning.core.network', 'com.mathlearning.core.datastore']) {
      if (text.includes(`import ${pkg}`) && moduleOf(relPath).startsWith('feature/')) {
        violations.push({ rule: 'R6-feature-imports-data-network', file: relPath, detail: pkg });
      }
    }
  }
  if (!isTest(relPath) && text.includes('import com.mathlearning.sync') && moduleDir !== 'app' && moduleDir !== 'sync') {
    violations.push({ rule: 'R4-sync-only-in-app', file: relPath, detail: 'sync import outside :app/:sync' });
  }
  if (!isTest(relPath) && /fallbackToDestructiveMigration/.test(text)) {
    violations.push({ rule: 'R7-no-destructive-fallback', file: relPath, detail: 'fallbackToDestructiveMigration is forbidden (ADR-0042)' });
  }
  if (!isTest(relPath) && /Room.databaseBuilder/.test(text) && relPath !== 'core/database/src/main/kotlin/com/mathlearning/core/database/ShomaraLearningDatabase.kt') {
    violations.push({ rule: 'R7-single-room-builder', file: relPath, detail: 'Room.databaseBuilder outside the single factory is forbidden' });
  }
  if (!isTest(relPath) && relPath.startsWith('core/contentpackage/') && /import (java.net|okhttp3|javax.net|retrofit2)/.test(text)) {
    violations.push({ rule: 'R8-contentpackage-network-free', file: relPath, detail: 'network import inside the package engine (airplane-mode contract)' });
  }
  if (!isTest(relPath) && text.includes('import com.mathlearning.core.contentpackage') && !relPath.startsWith('core/contentpackage/') && moduleDir !== 'app') {
    violations.push({ rule: 'R8-contentpackage-imports', file: relPath, detail: 'contentpackage import outside :app/:core:contentpackage' });
  }
}

const allowed = (violation) => ALLOWLIST.some((entry) => entry.rule === violation.rule && relPathMatches(entry.file, violation.file));
function relPathMatches(entryFile, actual) {
  return entryFile.split('/').join(path.sep) === actual.split('/').join(path.sep);
}

const unexpected = violations.filter((v) => !allowed(v));
const stale = ALLOWLIST.filter((entry) => !violations.some((v) => v.rule === entry.rule && relPathMatches(entry.file, v.file)));

for (const v of unexpected) console.log(`VIOLATION ${v.rule}: ${v.file} (${v.detail})`);
for (const s of stale) console.log(`STALE-ALLOWLIST ${s.rule}: ${s.file} — remove the entry`);

if (unexpected.length > 0) {
  console.log(`ANDROID_MODULE_GRAPH: FAIL (${unexpected.length} unexpected violation(s), ${ALLOWLIST.length} allowlisted)`);
  process.exitCode = 1;
} else {
  console.log(`ANDROID_MODULE_GRAPH: PASS (${files.length} kotlin files scanned, ${ALLOWLIST.length} dated allowlist entries${stale.length > 0 ? `, ${stale.length} stale` : ''})`);
}
