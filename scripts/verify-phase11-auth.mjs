import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const principal = read('apps/web/lib/request-principal.ts');
assert.match(principal, /getSupabaseAuthUser/);
assert.match(principal, /supabaseRestSelect/);
assert.match(principal, /AUTH_BEARER_REQUIRED/);
assert.match(principal, /request\.headers\.get\('authorization'\)/);
assert.match(principal, /LEARNING_IDENTITY_NOT_UNIQUE/);
assert.match(principal, /ROLE_REQUIRED/);

for (const file of [
  'apps/web/app/api/v1/learning/sessions/route.ts',
  'apps/web/app/api/v1/learning/attempts/submit/route.ts',
  'apps/web/app/api/v1/sync/batch/route.ts',
]) {
  const source = read(file);
  assert.doesNotMatch(source, /requireDevPrincipal/);
  assert.match(source, /requireRequestPrincipal/);
}

for (const file of [
  'apps/web/app/api/v1/assignments/route.ts',
  'apps/web/app/api/v1/assignments/[assignmentId]/route.ts',
  'apps/web/app/api/v1/assignment-instances/[instanceId]/recheck/route.ts',
]) {
  const source = read(file);
  assert.match(source, /requireRequestAccountPrincipal\(request, 'TEACHER'\)/);
}

const mobileAuth = read('apps/mobile/src/auth/AuthSession.ts');
assert.match(mobileAuth, /Authorization/);
const mobileRuntime = read('apps/mobile/src/station/runtimeApi.ts');
assert.match(mobileRuntime, /__DEV__ && !getAuthHeaders\(\)\.Authorization/);
assert.match(mobileRuntime, /activeLearningIdentityId/);
assert.match(mobileRuntime, /session\.learningIdentityId/);
const mobileSync = read('apps/mobile/src/sync/MobileSyncManager.ts');
assert.match(mobileSync, /getAuthHeaders/);
assert.match(mobileSync, /__DEV__/);
assert.match(mobileSync, /Authorization/);
const contentManager = read('apps/mobile/src/content/ContentManager.ts');
assert.match(contentManager, /getAuthHeaders/);
// Re-baselined 2026-10-04 (P02-A): the old dev auth fallback in ContentManager was removed by P02-B.
// Production cache reads must be integrity-verified; the only __DEV__ branch is a local-cache shortcut.
assert.doesNotMatch(contentManager, /__DEV__ && !authHeaders\.Authorization/);
assert.match(contentManager, /expected\.checksum !== await sha256\(bytes\)/);
assert.match(contentManager, /value\.environment !== 'PRODUCTION'/);

const roadmap = read('ROADMAP_PHASES.md');
assert.match(roadmap, /Phone OTP is the current production onboarding authentication path/);
// Re-baselined 2026-10-04 (P02-A) to the current canonical roadmap wording.
assert.match(roadmap, /fail-closed Auth/);
assert.match(roadmap, /Learning Truth/);

console.log('[PASS] Production auth/RLS regression suite: server principal boundary verified.');
