#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => {
  const file = path.join(root, relative);
  assert.ok(fs.existsSync(file), `missing design-governance file: ${relative}`);
  return fs.readFileSync(file, 'utf8');
};

const guardrails = read('docs/DESIGN_RULES.md');
for (const source of ['Duolingo', 'AVA', 'UI/UX Pro Max', 'Claymorphism']) {
  assert.ok(guardrails.includes(source), `inspiration policy missing ${source}`);
}
for (const rule of ['adopt / adapt / reject', 'design dials', 'anti-pattern', 'RTL', 'TalkBack']) {
  assert.ok(guardrails.includes(rule), `inspiration policy missing ${rule}`);
}
assert.ok(guardrails.includes('منبع حقیقت بصری'), 'canonical precedence must be explicit');
assert.ok(guardrails.includes('dependency'), 'external dependency boundary must be explicit');

const readiness = read('docs/DESIGN_RULES.md');
for (const family of [
  'Button', 'TextField/OTP', 'Card/Choice', 'Feedback', 'Progress',
  'TopBar/TabBar', 'Dialog/Sheet', 'AudioControl', 'Manipulative',
]) {
  assert.ok(readiness.includes(`| ${family} |`), `component matrix missing ${family}`);
}
for (const state of ['pressed', 'disabled', 'loading', 'offline', 'failed', 'retry']) {
  assert.ok(readiness.includes(state), `component readiness missing ${state} state`);
}
for (const tier of ['flat', 'hint', 'soft', 'featured']) {
  assert.ok(readiness.includes(`| ${tier} |`), `Clay depth contract missing ${tier}`);
}
assert.ok(readiness.includes('NATIVE_PENDING'), 'Native evidence boundary is missing');

const master = read('docs/DESIGN_RULES.md');
assert.ok(master.includes('design/INSPIRATION_GUARDRAILS.md'), 'design master must route inspiration decisions');
assert.ok(master.includes('design/playbook/COMPONENT_READINESS.md'), 'design master must route component readiness');

const blueprint = read('docs/DESIGN_RULES.md');
for (let id = 1; id <= 17; id += 1) {
  const pageId = String(id).padStart(2, '0');
  assert.ok(blueprint.includes(`| ${pageId} |`), `page UI/UX blueprint missing family ${pageId}`);
}
for (const invariant of ['360/390/412', '200% font', 'TalkBack', 'NATIVE_PENDING', 'Definition of Ready', 'Definition of Done']) {
  assert.ok(blueprint.includes(invariant), `page UI/UX blueprint missing invariant: ${invariant}`);
}

const backlog = read('design/playbook/quality/NATIVE_IMPLEMENTATION_BACKLOG.csv');
const backlogRows = backlog.trim().split(/\r?\n/);
assert.equal(backlogRows.length, 21, 'Native implementation backlog must contain header + 20 work items');
for (const id of ['UI-001', 'UI-020']) {
  assert.ok(backlog.includes(id), `Native implementation backlog missing ${id}`);
}
// DT-59: two rows describe surfaces the owner removed on purpose (the guardian area, ADR-0050, and the avatar
// workshop, ADR-0051). They stay as rows so the work id sequence and the count stay stable, but they must be marked
// retired rather than pretending to be pending native work. The retired set is pinned, so it cannot quietly grow:
// retiring more UI work requires editing this list on purpose, not editing a cell.
const RETIRED_BY_DECISION = new Map([
  ['UI-016', 'RETIRED_AVATAR_REMOVED'],
  ['UI-018', 'RETIRED_GUARDIAN_REMOVED'],
]);
assert.ok(
  backlogRows.slice(1).every(
    (row) => row.includes('NATIVE_PENDING') || [...RETIRED_BY_DECISION.values()].some((status) => row.includes(status)),
  ),
  'unimplemented UI backlog rows must remain NATIVE_PENDING (only ADR-0050/ADR-0051 surfaces may be retired)',
);


// DT-59: two rows describe surfaces the owner removed on purpose (the guardian area, ADR-0050, and the avatar
// workshop, ADR-0051). They stay as rows so the work id sequence and the count stay stable, but they must be marked
// retired rather than pretending to be pending native work. The retired set is pinned, so it cannot quietly grow:
// retiring more UI work requires editing this list on purpose, not editing a cell.
const dataRows = backlogRows.slice(1).map((row) => row.split(','));
const STATUS_COLUMN = 7;
const MODULE_COLUMN = 4;
for (const row of dataRows) {
  const id = row[0];
  if (!RETIRED_BY_DECISION.has(id)) continue;
  assert.equal(
    row[STATUS_COLUMN],
    RETIRED_BY_DECISION.get(id),
    `${id} must stay marked as retired by its ADR, not as pending work`,
  );
}
const retiredSeen = dataRows
  .filter((row) => (row[STATUS_COLUMN] ?? '').startsWith('RETIRED_'))
  .map((row) => row[0]);
assert.deepEqual(
  retiredSeen.sort(),
  [...RETIRED_BY_DECISION.keys()].sort(),
  'only the surfaces removed by ADR-0050/ADR-0051 may be retired in the backlog',
);

// DT-59: the backlog used to name ten modules that do not exist (feature:auth, feature:placement,
// feature:child-shell, feature:learning-player x6, feature:guardian). A planning document that resolves to no code
// is worse than no document: it makes an unimplemented surface look scheduled. Every named module must exist.
const moduleExists = (moduleId) => {
  const segments = moduleId.split(':');
  const file = segments.length === 1
    ? `apps/android/${segments[0]}/build.gradle.kts`
    : `apps/android/${segments[0]}/${segments[1]}/build.gradle.kts`;
  return fs.existsSync(path.join(root, file));
};
for (const row of dataRows) {
  const moduleId = row[MODULE_COLUMN];
  // A retired row is a historical record: its module may legitimately be gone (feature:guardian was deleted with
  // the guardian surface itself). Live rows must resolve to a module that exists today.
  if (RETIRED_BY_DECISION.has(row[0])) continue;
  assert.ok(
    moduleExists(moduleId),
    `backlog names module "${moduleId}" but it has no build.gradle.kts under apps/android`,
  );
}

const routeRegistry = read('docs/DESIGN_RULES.md');
assert.ok(routeRegistry.includes('PAGE_UIUX_BLUEPRINT.md'), 'route registry must route the page UI/UX blueprint');
assert.ok(routeRegistry.includes('NATIVE_IMPLEMENTATION_BACKLOG.csv'), 'route registry must route the Native implementation backlog');

const designSkill = read('docs/DESIGN_RULES.md');
for (const route of [
  'design/INSPIRATION_GUARDRAILS.md',
  'design/playbook/COMPONENT_READINESS.md',
  'references/review-checklist.md',
]) {
  assert.ok(designSkill.includes(route), `design-system skill missing route: ${route}`);
}

const productSkill = read('docs/DESIGN_RULES.md');
const screenSkill = read('docs/DESIGN_RULES.md');
assert.ok(productSkill.includes('docs/DESIGN_RULES.md § design system/SKILL.md'), 'product-design skill must route shared UI work');
assert.ok(screenSkill.includes('docs/DESIGN_RULES.md § design system/SKILL.md'), 'screen-execution skill must route shared UI work');

console.log('DESIGN_GOVERNANCE: PASS (17 page families, 20 Native UI work items, 4 inspiration sources, 9 component families, 4 Clay depth tiers)');
