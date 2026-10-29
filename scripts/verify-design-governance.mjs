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

const guardrails = read('design/INSPIRATION_GUARDRAILS.md');
for (const source of ['Duolingo', 'AVA', 'UI/UX Pro Max', 'Claymorphism']) {
  assert.ok(guardrails.includes(source), `inspiration policy missing ${source}`);
}
for (const rule of ['adopt / adapt / reject', 'design dials', 'anti-pattern', 'RTL', 'TalkBack']) {
  assert.ok(guardrails.includes(rule), `inspiration policy missing ${rule}`);
}
assert.ok(guardrails.includes('منبع حقیقت بصری'), 'canonical precedence must be explicit');
assert.ok(guardrails.includes('dependency'), 'external dependency boundary must be explicit');

const readiness = read('design/playbook/COMPONENT_READINESS.md');
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

const master = read('design/MASTER.md');
assert.ok(master.includes('design/INSPIRATION_GUARDRAILS.md'), 'design master must route inspiration decisions');
assert.ok(master.includes('design/playbook/COMPONENT_READINESS.md'), 'design master must route component readiness');

const blueprint = read('design/playbook/PAGE_UIUX_BLUEPRINT.md');
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
assert.ok(backlogRows.slice(1).every((row) => row.includes('NATIVE_PENDING')), 'unimplemented UI backlog rows must remain NATIVE_PENDING');

const routeRegistry = read('design/playbook/ROUTE_REGISTRY.md');
assert.ok(routeRegistry.includes('PAGE_UIUX_BLUEPRINT.md'), 'route registry must route the page UI/UX blueprint');
assert.ok(routeRegistry.includes('NATIVE_IMPLEMENTATION_BACKLOG.csv'), 'route registry must route the Native implementation backlog');

const designSkill = read('skills/shomara-design-system/SKILL.md');
for (const route of [
  'design/INSPIRATION_GUARDRAILS.md',
  'design/playbook/COMPONENT_READINESS.md',
  'references/review-checklist.md',
]) {
  assert.ok(designSkill.includes(route), `design-system skill missing route: ${route}`);
}

const productSkill = read('skills/shomara-product-design/SKILL.md');
const screenSkill = read('skills/shomara-screen-execution/SKILL.md');
assert.ok(productSkill.includes('skills/shomara-design-system/SKILL.md'), 'product-design skill must route shared UI work');
assert.ok(screenSkill.includes('skills/shomara-design-system/SKILL.md'), 'screen-execution skill must route shared UI work');

console.log('DESIGN_GOVERNANCE: PASS (17 page families, 20 Native UI work items, 4 inspiration sources, 9 component families, 4 Clay depth tiers)');
