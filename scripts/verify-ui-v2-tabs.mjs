#!/usr/bin/env node
/**
 * UI V2 gate for the tab content screens (owner decision D-021; playbook pages 12/14/15).
 * Practice tab (batch C 2026-10-28) + me tab, avatar and settings (batch D 2026-10-28).
 * Locks, statically:
 *   1. tokens: the V2 views read ONLY tokens.v2 — no raw hex, no V1/DS token usage; the profile,
 *      avatar and settings containers no longer import the legacy DS theme.
 *   2. purity: views render; containers own state, contracts and navigation.
 *   3. content truth: rows come from the contracts (achievements, actions, cosmetics); honest
 *      locked states and the progress-not-purchase copy stay.
 *   4. a11y: roles on Pressables; switch rows report checked; the row height uses v2.component.rowH.
 *   5. behavior: flow:tabs keeps driving the real tabs end to end.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (ok, message) => { if (!ok) throw new Error(message); console.log(`[PASS] ${message}`); };

const viewFile = 'apps/mobile/src/practice/views2/PracticeView2.tsx';
const meFile = 'apps/mobile/src/profile/views2/MeView2.tsx';
const shellFile = 'apps/mobile/src/ui/v2/shell.tsx';
for (const f of [viewFile, meFile, shellFile]) if (!fs.existsSync(path.join(root, f))) throw new Error(`missing V2 tabs file: ${f}`);
must(true, 'V2 tab sources exist');

// 1. tokens-only
for (const f of [viewFile, meFile, shellFile]) {
  const src = read(f);
  const hex = [...src.matchAll(/#([0-9a-fA-F]{3,8})\b/g)].map((m) => m[0]);
  if (hex.length) throw new Error(`raw hex in ${f}: ${hex.join(', ')}`);
  const v1 = [...src.matchAll(/\b(?:DS\.color|C\.|UI\.)[\w.]*/g)];
  if (v1.length) throw new Error(`V1 token usage in ${f}: ${v1.map((m) => m[0]).join(', ')}`);
}
must(true, 'V2 tab sources use only tokens.v2 (no raw hex, no V1 tokens)');
const profile = read('apps/mobile/app/(tabs)/profile.tsx');
const avatar = read('apps/mobile/app/avatar.tsx');
const settings = read('apps/mobile/app/settings.tsx');
for (const [name, src] of [['profile.tsx', profile], ['avatar.tsx', avatar], ['settings.tsx', settings]]) {
  if (/from '.*design-system'|DS\./.test(src)) throw new Error(`${name} still uses the legacy DS theme`);
}
must(true, 'me/avatar/settings containers are off the legacy DS theme');

// 2. purity + wiring
const view = read(viewFile);
must(!/expo-router|useAppState|runtimeApi|fetch\(|PRACTICE_GAMES/.test(view), 'PracticeView2 is a pure view (no router/state/network/contract data)');
const hub = read('apps/mobile/src/ui/PracticeHubScreen.tsx');
must(hub.includes('<PracticeView2') && hub.includes('views2/PracticeView2'), 'the real tab renders PracticeView2');
must(['pickRecommendedPractice', 'softDailyHabitForGrade', 'practiceListLimit', 'practiceStartLabelFa', 'canOpenPracticeStation', "openStation(recommended.stationId)", '/station/${stationId}/'].every((m) => hub.includes(m)), 'practice contract logic stays wired in the container');
must(view.includes('characterId="fandogh"') && view.includes('fit="cover"'), 'the guide bubble uses the real Fandogh portrait through the character facade');

// 3. a11y + measured row height
const shell = read(shellFile);
must(shell.includes('K2.rowH') && shell.includes('accessibilityRole="button"'), 'ListRow2 keeps its press role and the measured row height (v2.component.rowH)');
for (const m of view.matchAll(/<Pressable\b/g)) {
  const tag = view.slice(m.index, view.indexOf('>', m.index));
  if (!/accessibilityRole/.test(tag)) throw new Error('Pressable without accessibilityRole in PracticeView2');
}
must(true, 'every Pressable in PracticeView2 declares accessibilityRole');

// 4. child-safety
for (const f of [viewFile]) {
  const src = read(f);
  const banned = [/ستاره/u, /\bstar\b/i, /\bجان\b/u, /\blives\b/i, /\bstreak\b/i];
  for (const rx of banned) if (rx.test(src)) throw new Error(`banned gamification term ${rx} in ${f}`);
}
must(true, 'no stars/lives/streak wording in the V2 practice view');

// 5. me tab (playbook 14): identity card, honest progress, real achievements, contract actions
must(profile.includes('<MeView2') && profile.includes('views2/MeView2'), 'the me tab renders MeView2');
must(['CHILD_ACHIEVEMENTS.map', 'isAchievementUnlocked', 'G1_STATIONS', 'accessibilityViewIsModal', 'sessionLengthHintFa', 'ONBOARDING_GRADE_OPTIONS', 'profileActionDensity'].every((m) => profile.includes(m)), 'me contract logic stays wired in the container');
must(profile.includes("router.push('/avatar')") && profile.includes("router.push('/parent')") && profile.includes("router.push('/settings')"), 'avatar/parent/settings entries stay reachable (profile contract Actions)');
must(!/دوستان|companion|assignments|animation/.test(profile), 'me tab keeps no friends/dev surfaces');
const meView = read(meFile);
must(meView.includes('TOKENS.ui.me') && meView.includes('<ClaySurface'), 'MeView2 keeps the measured page-14 values through the single token source and the shared clay card');
must(meView.includes('accessibilityRole="button"') && meView.includes('off={!item.unlocked}'), 'me rows press or rest honestly locked');

// 6. avatar (playbook 15): progress-not-purchase, owned/equipped/locked states, workshop contracts
for (const m of ['COSMETIC_CATEGORIES', 'lockedLabelFa', 'sanitizeAppearance', 'ذخیره', 'لغو', 'خریدنی نیست']) {
  if (!avatar.includes(m)) throw new Error(`avatar V2 lost: ${m}`);
}
must(avatar.includes('accessibilityState={{ selected: item.equipped, disabled: !item.owned }}'), 'avatar choices report selected/disabled states');
must(!/\b(aria|qbo|dana|jiko)\b/i.test(avatar) || !avatar.includes('equip'), 'avatar UI separates child identity from companion cast');

// 7. settings (playbook 15): real persisted toggles
must(settings.includes('accessibilityRole="switch"') && settings.includes('accessibilityState={{ checked: value }}'), 'settings rows are real switches with checked state');
must(settings.includes('setPreference') && settings.includes('جریمه'), 'settings keep the persisted preference wiring and the no-punishment copy');

// 8. behavior stays proven
const pkg = JSON.parse(read('package.json'));
must(pkg.scripts['flow:tabs'] === 'node scripts/flow-tabs-run.mjs', 'flow:tabs still drives the real tabs');
must(read('scripts/flow-tabs-run.mjs').includes("open('tabs-practice')") && read('scripts/flow-tabs-run.mjs').includes("open('tabs-me')"), 'the practice and me scenarios keep their copy/route assertions');

console.log('UI_V2_TABS: PASS');
