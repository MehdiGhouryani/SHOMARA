import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'packages/contracts/src/progression.ts',
  'apps/web/lib/progression.ts',
  'apps/web/components/ChildRouteShell.tsx',
  'apps/web/app/unit/[unitId]/page.tsx',
  'apps/web/app/unit/[unitId]/jump/page.tsx',
  'apps/web/app/station/[stationId]/start/page.tsx',
  'apps/web/app/station/[stationId]/play/page.tsx',
  'apps/mobile/app/unit/[unitId].tsx',
  'apps/mobile/app/unit/[unitId]/jump.tsx',
  'apps/mobile/app/station/[stationId]/start.tsx',
  'apps/mobile/app/station/[stationId]/play.tsx',
  'apps/mobile/app/station/[stationId]/index.tsx',
  'docs/reference/PROGRESSION_CONTRACT.md',
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
const contract = fs.readFileSync(path.join(root, 'packages/contracts/src/progression.ts'), 'utf8');
const pathWeb = fs.readFileSync(path.join(root, 'apps/web/components/DuolingoPath.tsx'), 'utf8');
const pathMobile = fs.readFileSync(path.join(root, 'apps/mobile/app/(tabs)/index.tsx'), 'utf8');
const rootPage = fs.readFileSync(path.join(root, 'apps/web/app/page.tsx'), 'utf8');
const webUnit = fs.readFileSync(path.join(root, 'apps/web/app/unit/[unitId]/page.tsx'), 'utf8');
const webStart = fs.readFileSync(path.join(root, 'apps/web/app/station/[stationId]/start/page.tsx'), 'utf8');
const webJump = fs.readFileSync(path.join(root, 'apps/web/app/unit/[unitId]/jump/page.tsx'), 'utf8');
const jumpContract = fs.readFileSync(path.join(root, 'packages/contracts/src/jump.ts'), 'utf8');
const mobileUnit = fs.readFileSync(path.join(root, 'apps/mobile/app/unit/[unitId].tsx'), 'utf8');
const mobileStart = fs.readFileSync(path.join(root, 'apps/mobile/app/station/[stationId]/start.tsx'), 'utf8');
const mobileJump = fs.readFileSync(path.join(root, 'apps/mobile/app/unit/[unitId]/jump.tsx'), 'utf8');
const jumpApi = fs.readFileSync(path.join(root, 'apps/web/app/api/v1/progression/jump/route.ts'), 'utf8');
const p5NewFiles = required.filter((f) => f.endsWith('.tsx') || f.endsWith('.ts')).map((f) => path.join(root, f));
const emoji = /[\u{1F300}-\u{1FAFF}]/u;
const checks = {
  requiredFiles: missing.length === 0,
  sixStateContract: ['COMPLETED','CURRENT','AVAILABLE','LOCKED','NOT_DOWNLOADED','SYNC_PENDING'].every((x) => contract.includes(`'${x}'`)),
  unitHasStationFlow: webUnit.includes('/station/') && mobileUnit.includes('/station/'),
  stationStartHasManifest: webStart.includes('/api/v1/content/manifest?gradeId=G1') && mobileStart.includes('/api/v1/content/manifest?gradeId=G1'),
  stationStartHasChecksum: webStart.includes('crypto.subtle.digest') && mobileStart.includes('downloadPackage'),
  jumpDoesNotFakeUnlock: jumpContract.includes('JUMP_PASS_THRESHOLD') && fs.readFileSync(path.join(root, 'apps/web/components/JumpAssessmentView.tsx'), 'utf8').includes('payload.passed') && mobileJump.includes('payload.passed') && mobileJump.includes('grantJumpUnlock(payload.targetStationId)') && jumpApi.includes('evaluateJumpAssessment(') && jumpApi.includes('requireRequestPrincipal(request)'),
  lockedExplainsPrerequisiteWeb: pathWeb.includes('اول ایستگاه‌های قبل را جلو ببر.') && pathWeb.includes("node.status === 'LOCKED'"),
  lockedExplainsPrerequisiteMobile: pathMobile.includes("nodeState === 'lock'") && pathMobile.includes('ایستگاه‌های قبل را جلو ببر.') && fs.readFileSync(path.join(root, 'apps/mobile/src/path/PathNode.tsx'), 'utf8').includes("icon: 'lock'") && fs.readFileSync(path.join(root, 'apps/mobile/src/path/pathModel.ts'), 'utf8').includes('PATH_NODE_LABELS[status]'), 
  directNodeToStart: rootPage.includes('router.push(node.stationId ? `/station/${node.stationId}/start`'),
  noPathEmoji: !emoji.test(pathWeb) && !emoji.test(pathMobile),
  mobileThreeDestinations: fs.readFileSync(path.join(root, 'apps/mobile/app/(tabs)/_layout.tsx'), 'utf8').includes("title: 'مسیر'") && fs.readFileSync(path.join(root, 'apps/mobile/app/(tabs)/_layout.tsx'), 'utf8').includes("title: 'تمرین'") && fs.readFileSync(path.join(root, 'apps/mobile/app/(tabs)/_layout.tsx'), 'utf8').includes("title: 'من'") && !fs.readFileSync(path.join(root, 'apps/mobile/app/(tabs)/_layout.tsx'), 'utf8').includes("name=\"treasure\""),
};
for (const [key, ok] of Object.entries(checks)) if (!ok) missing.push(`check:${key}`);
const result = { phase: 'UX-P05', generatedAt: new Date().toISOString(), status: missing.length ? 'FAIL' : 'PASS', checks, failures: missing };
if (result.failures.length) { console.error(JSON.stringify(result, null, 2)); process.exit(1); }
console.log(JSON.stringify(result, null, 2));
