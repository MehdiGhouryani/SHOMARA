#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ok = (m) => console.log(`PASS  ${m}`);
const fail = (m) => {
  console.error(`FAIL  ${m}`);
  process.exitCode = 1;
};

const must = [
  'packages/contracts/src/avatar-customization.ts',
  'packages/contracts/src/avatar-customization.test.ts',
  'supabase/migrations/0060_avatar_customization.sql',
  'apps/web/app/api/v1/avatar/route.ts',
  'apps/mobile/app/avatar.tsx',
];

for (const rel of must) {
  if (!fs.existsSync(path.join(root, rel))) fail(`MISSING ${rel}`);
  else ok(`exists ${rel}`);
}

const contract = fs.readFileSync(path.join(root, 'packages/contracts/src/avatar-customization.ts'), 'utf8');
for (const m of [
  'AVATAR_CUSTOMIZATION_VERSION',
  'G1_COSMETIC_CATALOG',
  'sanitizeAppearance',
  'buildAvatarWorkshopProjection',
  'companionCastExcluded',
  'setsMastery: false',
]) {
  if (!contract.includes(m)) fail(`contract missing ${m}`);
  else ok(`contract ${m}`);
}

const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0060_avatar_customization.sql'), 'utf8');
for (const m of [
  'avatar_appearance_p08',
  'avatar_workshop_projection',
  'avatar_save_appearance',
  'COSMETIC_NOT_OWNED',
  'revoke insert, update, delete on public.avatar_appearance_p08',
]) {
  if (!mig.includes(m)) fail(`0060 missing ${m}`);
  else ok(`0060 ${m}`);
}

const ui = fs.readFileSync(path.join(root, 'apps/mobile/app/avatar.tsx'), 'utf8');
for (const m of ['COSMETIC_CATEGORIES', 'lockedLabelFa', 'sanitizeAppearance', 'ذخیره', 'لغو']) {
  if (!ui.includes(m)) fail(`avatar UI missing ${m}`);
  else ok(`UI ${m}`);
}

// Must not treat companion cast as equippable child cosmetics in mobile avatar screen
if (/\b(aria|qbo|dana|jiko)\b/i.test(ui) && ui.includes('equip')) {
  fail('avatar UI must not equip companion cast');
} else ok('avatar UI separates child identity from companion cast');

const roadmap = fs.readFileSync(path.join(root, 'ROADMAP_PHASES.md'), 'utf8');
if (!/P08 \| Character.*IMPLEMENTED/.test(roadmap)) fail('ROADMAP P08 must be IMPLEMENTED');
else ok('roadmap P08 IMPLEMENTED');
const next = (roadmap.match(/next_eligible_phase:\s*(P\d+)/) || [])[1];
if (!next || Number(next.slice(1)) < 9) fail('next_eligible_phase must be P09+');
else ok(`next_eligible_phase ${next}`);
if (!roadmap.includes('VD-011')) fail('VD-011 required');
else ok('VD-011 present');

if (process.exitCode) {
  console.error('\nP08 static verification: FAIL');
  process.exit(1);
}
console.log('\nP08 static verification: PASS');
