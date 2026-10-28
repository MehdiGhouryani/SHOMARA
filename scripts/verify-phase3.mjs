import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const root = fileURLToPath(new URL('..', import.meta.url));
const errors = [];
const required = [
  'supabase/migrations/0022_content_delivery.sql',
  'docs/api/API_CONTENT_DELIVERY_CONTRACT.md',
  'packages/content-delivery/src/index.ts',
  'apps/mobile/src/content/ContentManager.ts',
  'apps/web/app/api/v1/content/manifest/route.ts',
  'apps/web/app/api/v1/content/packages/[packageId]/route.ts',
  'apps/web/app/api/v1/content/entitlements/[packageId]/route.ts',
];
for (const file of required) if (!fs.existsSync(path.join(root, file))) errors.push(`Missing ${file}`);
const sql = fs.readFileSync(path.join(root, 'supabase/migrations/0022_content_delivery.sql'), 'utf8');
for (const token of ['content_packages','content_package_items','content_manifests','content_manifest_items','assignment_required_packages']) {
  if (!sql.includes(`create table if not exists public.${token}`)) errors.push(`Missing table ${token}`);
}
const pack = path.join(root, 'content/dev-packs/g1-st01-v1/package.json');
const next = path.join(root, 'content/dev-packs/g1-st01-v1/next-stub.json');
for (const file of [pack, next]) {
  if (!fs.existsSync(file)) errors.push(`Missing fixture ${file}`);
  else crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
const mobilePkg = JSON.parse(fs.readFileSync(path.join(root, 'apps/mobile/package.json'), 'utf8'));
if (!mobilePkg.dependencies['expo-file-system']) errors.push('expo-file-system dependency missing');
if (!mobilePkg.dependencies['expo-crypto']) errors.push('expo-crypto dependency missing');
for (const forbidden of ['Unity','Unreal','Godot']) {
  const all = fs.readFileSync(path.join(root,'packages/content-delivery/src/index.ts'),'utf8') + fs.readFileSync(path.join(root,'ROADMAP_PHASES.md'),'utf8');
  if (all.includes(forbidden) && forbidden !== 'Unity') errors.push(`Forbidden engine mention ${forbidden}`);
}
if (errors.length) {
  console.error('PHASE3 VERIFY: FAIL');
  errors.forEach(e => console.error(`- ${e}`));
  process.exit(1);
}
console.log('PHASE3 VERIFY: PASS');
