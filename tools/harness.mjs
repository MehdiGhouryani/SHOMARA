#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ROADMAP_PATH = path.join(ROOT, 'harness', 'roadmap.json');

export function loadRoadmap() {
  return JSON.parse(fs.readFileSync(ROADMAP_PATH, 'utf8'));
}

const doneStatuses = new Set(['DONE', 'DONE_WITH_BLOCKER']);
const knownStatuses = new Set(['TODO', 'READY', 'IN_PROGRESS', 'BLOCKED', 'DEFERRED', 'DONE', 'DONE_WITH_BLOCKER']);

export function validateRoadmap(roadmap = loadRoadmap()) {
  const errors = [];
  const warnings = [];
  if (roadmap.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (roadmap.project !== 'SHOMARA') errors.push('project must be SHOMARA');
  if (!Array.isArray(roadmap.phases) || roadmap.phases.length === 0) errors.push('phases must be non-empty');
  const phaseIds = new Set();
  const tasks = new Map();
  for (const phase of roadmap.phases ?? []) {
    if (phaseIds.has(phase.id)) errors.push(`duplicate phase: ${phase.id}`);
    phaseIds.add(phase.id);
    if (!knownStatuses.has(phase.status)) errors.push(`invalid phase status: ${phase.id}:${phase.status}`);
    if (!Array.isArray(phase.allowedPaths) || phase.allowedPaths.length === 0) errors.push(`missing allowedPaths: ${phase.id}`);
    for (const command of phase.gates ?? []) {
      if (!(roadmap.commandAllowlist ?? []).some((prefix) => command.startsWith(prefix))) {
        errors.push(`command not allowlisted: ${phase.id}:${command}`);
      }
      if (/\b(rm\s+-rf|reset\s+--hard|force-push|clean\s+-fd)\b/.test(command)) {
        errors.push(`destructive command forbidden: ${phase.id}:${command}`);
      }
    }
    for (const task of phase.tasks ?? []) {
      if (tasks.has(task.id)) errors.push(`duplicate task: ${task.id}`);
      tasks.set(task.id, { ...task, phaseId: phase.id });
      if (!task.id.startsWith(`${phase.id}-`)) errors.push(`task outside phase namespace: ${task.id}`);
      if (!knownStatuses.has(task.status)) errors.push(`invalid task status: ${task.id}:${task.status}`);
      if (!Array.isArray(task.acceptance) || task.acceptance.length === 0) errors.push(`missing acceptance: ${task.id}`);
      if (task.status === 'BLOCKED' && !task.blocker) errors.push(`blocked task missing blocker: ${task.id}`);
      if (doneStatuses.has(task.status) && (!task.evidence || task.evidence.length === 0)) warnings.push(`done task has no evidence: ${task.id}`);
    }
  }
  if (!phaseIds.has(roadmap.currentPhase)) errors.push(`currentPhase not found: ${roadmap.currentPhase}`);
  if (!tasks.has(roadmap.currentTask)) errors.push(`currentTask not found: ${roadmap.currentTask}`);
  else if (tasks.get(roadmap.currentTask).phaseId !== roadmap.currentPhase) errors.push('currentTask is not in currentPhase');

  for (const task of tasks.values()) {
    for (const dep of task.dependsOn ?? []) {
      if (!tasks.has(dep)) errors.push(`unknown dependency: ${task.id}->${dep}`);
      if (dep === task.id) errors.push(`self dependency: ${task.id}`);
    }
  }

  const visiting = new Set();
  const visited = new Set();
  const visit = (id, trail = []) => {
    if (visiting.has(id)) {
      errors.push(`dependency cycle: ${[...trail, id].join(' -> ')}`);
      return;
    }
    if (visited.has(id) || !tasks.has(id)) return;
    visiting.add(id);
    for (const dep of tasks.get(id).dependsOn ?? []) visit(dep, [...trail, id]);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of tasks.keys()) visit(id);

  for (const file of roadmap.canonicalDocs ?? []) {
    if (!fs.existsSync(path.join(ROOT, file))) errors.push(`canonical file missing: ${file}`);
  }
  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)], tasks };
}

export function nextTask(roadmap = loadRoadmap()) {
  const { errors, tasks } = validateRoadmap(roadmap);
  if (errors.length) return { error: 'roadmap invalid', errors };
  const current = tasks.get(roadmap.currentTask);
  if (current && ['READY', 'IN_PROGRESS', 'BLOCKED'].includes(current.status)) return current;
  for (const phase of roadmap.phases) {
    for (const task of phase.tasks) {
      if (!['READY', 'TODO'].includes(task.status)) continue;
      if ((task.dependsOn ?? []).every((id) => doneStatuses.has(tasks.get(id)?.status))) return { ...task, phaseId: phase.id };
    }
  }
  return null;
}

function statusReport(roadmap) {
  const lines = [`SHOMARA ${roadmap.updatedAt}`, `current: ${roadmap.currentPhase} / ${roadmap.currentTask}`, ''];
  for (const phase of roadmap.phases) {
    const counts = {};
    for (const task of phase.tasks) counts[task.status] = (counts[task.status] ?? 0) + 1;
    const finished = phase.tasks.filter((t) => doneStatuses.has(t.status)).length;
    lines.push(`${phase.id} ${phase.status.padEnd(17)} ${finished}/${phase.tasks.length}  ${phase.title}`);
    lines.push(`  ${Object.entries(counts).map(([key, value]) => `${key}=${value}`).join(' ')}`);
  }
  return lines.join('\n');
}

function printTask(task) {
  if (!task) return 'No executable task remains.';
  if (task.error) return `${task.error}\n${task.errors.join('\n')}`;
  return [
    `${task.id} [${task.status}] ${task.title}`,
    `phase: ${task.phaseId}`,
    `dependsOn: ${(task.dependsOn ?? []).join(', ') || '-'}`,
    'acceptance:',
    ...(task.acceptance ?? []).map((item) => `  - ${item}`),
    ...(task.blocker ? [`blocker: ${task.blocker}`] : []),
  ].join('\n');
}

function resumeReport(roadmap) {
  const result = validateRoadmap(roadmap);
  if (result.errors.length) return `roadmap invalid\n${result.errors.join('\n')}`;
  const task = result.tasks.get(roadmap.currentTask);
  const phase = roadmap.phases.find(({ id }) => id === roadmap.currentPhase);
  return [
    `project: ${roadmap.project}`,
    `branch: ${phase.branch}`,
    `phase: ${phase.id} — ${phase.title} [${phase.status}]`,
    `task: ${task.id} — ${task.title} [${task.status}]`,
    ...(task.blocker ? [`blocker: ${task.blocker}`] : []),
    '',
    'read:',
    '  1. AGENTS.md',
    '  2. START_HERE.md',
    '  3. docs/delivery/SHOMARA_FINAL_CHAT_HANDOFF.md',
    '',
    'allowed paths:',
    ...phase.allowedPaths.map((item) => `  - ${item}`),
    '',
    'phase gates:',
    ...phase.gates.map((item) => `  - ${item}`),
  ].join('\n');
}

function main() {
  const roadmap = loadRoadmap();
  const [command = 'status', arg] = process.argv.slice(2);
  if (command === 'validate') {
    const result = validateRoadmap(roadmap);
    for (const warning of result.warnings) console.warn(`WARN ${warning}`);
    if (result.errors.length) {
      for (const error of result.errors) console.error(`ERROR ${error}`);
      process.exitCode = 1;
      return;
    }
    console.log(`HARNESS_VALID (${result.tasks.size} tasks, ${roadmap.phases.length} phases)`);
    return;
  }
  if (command === 'status') {
    console.log(statusReport(roadmap));
    return;
  }
  if (command === 'next') {
    console.log(printTask(nextTask(roadmap)));
    return;
  }
  if (command === 'task') {
    const result = validateRoadmap(roadmap);
    const task = result.tasks.get(arg);
    if (!task) {
      console.error(`Unknown task: ${arg ?? '<missing>'}`);
      process.exitCode = 2;
      return;
    }
    console.log(printTask(task));
    return;
  }
  if (command === 'resume') {
    console.log(resumeReport(roadmap));
    return;
  }
  console.error('Usage: node tools/harness.mjs <validate|status|next|resume|task TASK-ID>');
  process.exitCode = 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
