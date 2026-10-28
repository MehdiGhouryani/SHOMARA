import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const failures = [];
const pass = [];
const expect = (condition, message) => condition ? pass.push(message) : failures.push(message);

const roadmap = read('ROADMAP_PHASES.md');
const principal = read('apps/web/lib/request-principal.ts');
const gates = read('apps/web/lib/runtime-gates.ts');
const contentDelivery = read('apps/web/lib/content-delivery.ts');
const entitlementRoute = read('apps/web/app/api/v1/content/entitlements/[packageId]/route.ts');
const sessionRoute = read('apps/web/app/api/v1/learning/sessions/[sessionId]/route.ts');
const jumpRoute = read('apps/web/app/api/v1/progression/jump/route.ts');
const mobileRuntime = read('apps/mobile/src/station/runtimeApi.ts');
const stationFlow = read('apps/mobile/src/station/StationFlow.tsx');
const installation = read('apps/mobile/src/auth/ClientInstallation.ts');
const layout = read('apps/mobile/app/_layout.tsx');
const logout = read('apps/mobile/app/parent.tsx');
const contentManager = read('apps/mobile/src/content/ContentManager.ts');
const migration = read('supabase/migrations/0053_android_runtime_foundation.sql');
const progressionMigration = read('supabase/migrations/0054_authoritative_progression_snapshot.sql');
const goldenTests = read('packages/learning-runtime/src/__tests__/p02-golden.test.ts');
const contracts = read('packages/contracts/src/content.ts');

expect(/\| P02 \| Technical foundation verification \+ stabilization \| P00 \| `IN_PROGRESS`/.test(roadmap), 'P02 lifecycle is IN_PROGRESS');
expect(/P01.*`IN_PROGRESS`/.test(roadmap), 'P01 remains explicitly IN_PROGRESS until human/product/learning review');
expect(/process\.env\.NODE_ENV !== 'production' && process\.env\.ALLOW_DEV_PRINCIPAL === '1'/.test(principal), 'dev principal requires NODE_ENV != production AND explicit ALLOW_DEV_PRINCIPAL=1 (never backend availability)');
expect(/if \(devPrincipalAllowed\(\)\) return devLearningIdentity\(request\);/.test(principal) && !/if \(!isProduction\) return devLearningIdentity/.test(principal), 'dev principal fallback is confined to explicit non-production opt-in and never overrides a Bearer token');
expect(/if \(!isSupabaseConfigured\(\)\) throw new Error\('SUPABASE_CONFIG_MISSING'\);/.test(principal), 'auth fails closed when Supabase auth config is missing');
expect(/if \(!bearerToken\(request\)\) \{\s*if \(devPrincipalAllowed\(\)\) return devLearningIdentity\(request\);\s*throw new Error\('AUTH_BEARER_REQUIRED'\);/.test(principal), 'learning routes require a bearer token unless the explicit dev opt-in is active');
expect(/process\.env\.NODE_ENV === 'production'/.test(gates), 'runtime gates use explicit production mode');
expect(/release_channel: 'eq\.STABLE'/.test(contentDelivery), 'production package delivery filters to STABLE packages');
expect(/CONTENT_PRESENTATION_MISSING/.test(contentDelivery), 'production package serialization rejects missing presentation metadata');
expect(/checkEntitlement\(packageId, principal\.learningIdentityId, principal\.accessToken\)/.test(entitlementRoute), 'content entitlement forwards the authenticated token');
expect(/runtime_resume_session/.test(sessionRoute) && !sessionRoute.includes('SESSION_STATUS_UNAVAILABLE'), 'session GET is backed by authoritative resume RPC');
expect(/progression_get_jump_assessment/.test(jumpRoute) && /progression_submit_jump_assessment/.test(jumpRoute), 'production Jump Assessment uses server RPCs');
expect(/X-Client-Installation-Id/.test(sessionRoute), 'resume carries installation provenance');
expect(!/expected\s*:/.test(mobileRuntime), 'Android runtime source contains no evaluator answer keys');
expect(/prepareGradeContent\('G1'\)/.test(mobileRuntime), 'production Android session start verifies/caches canonical Grade 1 content first');
expect(/ensureClientInstallationId/.test(mobileRuntime), 'runtime uses a persisted per-installation identifier');
expect(/REMOTE_CONTENT_MISSING/.test(stationFlow) && !/if \(created\.encounter\.content\) \{[\s\S]*setAuthoritativeContent\(normalizeAuthoritativeContent\(created\.encounter\.content\)\);[\s\S]*setAuthoritativeContent\(null\)/.test(stationFlow), 'remote StationFlow requires server content rather than silently rendering a local fallback');
expect(/crypto|Crypto/.test(installation) && /SecureStore/.test(installation), 'installation identity is stored with SecureStore and generated with cryptographic UUID');
expect(/Promise\.all\(\[hydrateAccessToken\(\), ensureClientInstallationId\(\)\]\)/.test(layout), 'Android startup hydrates auth and installation state before the shell becomes ready');
expect(/clearClientInstallationId/.test(logout), 'logout rotates the account-bound installation identity');
expect(/value\.schema !== 'math-content-package\/v1'/.test(contentManager), 'cached content verifies the package schema');
expect(/value\.environment !== 'PRODUCTION'/.test(contentManager), 'release APK rejects non-production cached content');
expect(/expected\.checksum !== await sha256\(bytes\)/.test(contentManager), 'release APK re-checks cached package checksum against the manifest');
expect(/existingEntry\?\.checksum === pkg\.checksum/.test(contentManager), 'package preparation reuses only integrity-verified cache hits');
expect(/ContentPackagePresentation/.test(contracts) && /child-safe/i.test(contracts), 'content package contract exposes child-safe presentation without evaluator keys');
expect(/create table if not exists public\.progression_jump_assessments/.test(migration), 'jump assessment catalog is persisted server-side');
expect(/answer_key jsonb/.test(migration), 'jump answer keys are stored server-side');
expect(/unique\(learning_identity_id, client_idempotency_key\)/.test(migration), 'jump assessment attempts have identity-scoped idempotency');
expect(/distinct scr\.session_id/.test(migration), 'jump unlock prerequisite requires distinct sessions');
expect(/insert into public\.unlocks/.test(migration) && /'JUMP_STATION'/.test(migration), 'passed jump assessments atomically grant a server-side unlock');
expect(/create or replace function public\.runtime_resume_session/.test(migration), 'authoritative session resume RPC exists');
expect(/create or replace function public\.runtime_register_client_installation/.test(migration), 'authenticated installation registration RPC exists');
expect(/revoke insert, update, delete on public\.client_installations from authenticated/.test(migration), 'direct client installation writes are revoked');
expect(/CONTENT_NOT_PRODUCTION_APPROVED/.test(migration), 'encounter creation enforces production content approval');
expect(/CONTENT_PRESENTATION_MISSING/.test(migration), 'encounter creation/resume requires a child-safe presentation object');
expect(/evaluatorConfig/.test(migration) === false, 'runtime encounter RPC does not return evaluatorConfig');
expect(/create or replace function public\.runtime_get_progression_snapshot/.test(progressionMigration), 'authoritative progression snapshot RPC exists');
expect(/completedStationIds/.test(progressionMigration) && /jumpUnlockedStationIds/.test(progressionMigration), 'progression snapshot returns server-derived completion and jump projections');
expect(/distinct_sessions >= 2/.test(progressionMigration) && /STATION_PASS/.test(progressionMigration), 'progression snapshot derives pass from the same two-session gate');
expect(/lastResumedByClientInstallationId/.test(progressionMigration), 'progression snapshot exposes active-session installation provenance');
expect(/P02 golden learning runtime vectors/.test(goldenTests) && /two distinct qualifying sessions/.test(goldenTests), 'golden evaluator and station-pass regression vectors exist');
expect(/getAuthoritativeProgression/.test(read('apps/mobile/src/station/runtimeApi.ts')), 'Android client has an authoritative progression API');
expect(/reconcileAuthoritativeProgression/.test(read('apps/mobile/src/state/appStateCore.ts')), 'Android local state has an explicit server reconciliation boundary');

const fixturePath = 'docs/qa/fixtures/p02-g1-st01-package.expected.json';
expect(exists(fixturePath), 'P02 ST01 canonical package fixture exists');
if (exists(fixturePath)) {
  const bytes = Buffer.from(`${JSON.stringify(JSON.parse(read(fixturePath)), null, 2)}\n`, 'utf8');
  const checksum = crypto.createHash('sha256').update(bytes).digest('hex');
  expect(bytes.length === 20186, `ST01 canonical package fixture is 20186 bytes (actual ${bytes.length})`);
  expect(checksum === 'bc684964f275808fd87a07880979aba0435a7909a74826e73e996d1a4adc1c94', `ST01 canonical package fixture SHA-256 is stable (${checksum})`);
  const pkg = JSON.parse(bytes.toString('utf8'));
  expect(pkg.environment === 'PRODUCTION', 'ST01 package fixture is production-only');
  expect(pkg.packageVersion === '1.2.0-android', 'ST01 Android package version is canonicalized');
  expect(pkg.items.length === 20, 'ST01 canonical package contains all 20 content versions');
  expect(pkg.items.every((item, index) => item.ordinal === index + 1), 'ST01 package ordinals are contiguous 1..20');
  expect(pkg.items.every((item) => item.required === (item.ordinal <= 12)), 'ST01 required/recovery package flags are preserved');
  expect(pkg.items.every((item) => item.presentation && !JSON.stringify(item.presentation).includes('expectedAnswers')), 'ST01 child-safe presentations contain no answer key');
}

const mobileExpectedHits = mobileRuntime.match(/\b(expected|expectedAnswers)\b/g) ?? [];
expect(mobileExpectedHits.length === 0, 'Android runtime has zero expected/expectedAnswers literals');

if (failures.length) {
  console.error(`P02_FOUNDATION_GUARD: BLOCKED (${failures.length} failures)`);
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  console.error(`PASS: ${pass.length}`);
  process.exit(2);
}
console.log(`P02_FOUNDATION_GUARD: PASS (${pass.length} checks)`);
