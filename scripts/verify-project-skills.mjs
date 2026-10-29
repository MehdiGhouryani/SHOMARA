#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const skillsRoot = path.join(root, 'skills');
const expected = ['shomara-android-build', 'shomara-design-system', 'shomara-learning-content', 'shomara-product-design', 'shomara-screen-execution'];
const allowedEntries = new Set(['SKILL.md', 'agents', 'assets', 'references', 'scripts']);
assert.ok(fs.existsSync(skillsRoot), 'skills directory is missing');
assert.deepEqual(fs.readdirSync(skillsRoot).sort(), expected);

for (const folder of expected) {
  assert.match(folder, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  const directory = path.join(skillsRoot, folder);
  const skillFile = path.join(directory, 'SKILL.md');
  assert.ok(fs.existsSync(skillFile), `missing ${folder}/SKILL.md`);
  const text = fs.readFileSync(skillFile, 'utf8');
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(frontmatter, `invalid frontmatter in ${folder}`);
  const lines = frontmatter[1].split('\n');
  assert.equal(lines.length, 2, `only name and description are allowed in ${folder} frontmatter`);
  assert.equal(lines[0], `name: ${folder}`);
  assert.match(lines[1], /^description: .{40,}$/);
  assert.ok(text.split('\n').length < 500, `${folder} is too large; move detail to references`);
  for (const entry of fs.readdirSync(directory)) {
    assert.ok(allowedEntries.has(entry), `unsupported skill entry: ${folder}/${entry}`);
  }
  const agentFile = path.join(directory, 'agents', 'openai.yaml');
  assert.ok(fs.existsSync(agentFile), `missing ${folder}/agents/openai.yaml`);
  const agent = fs.readFileSync(agentFile, 'utf8');
  assert.match(agent, /^interface:\n/u, `invalid agent interface in ${folder}`);
  assert.match(agent, /  display_name: "[^"]+"\n/u, `missing display_name in ${folder}`);
  assert.match(agent, /  short_description: "[^"]{20,}"\n/u, `missing short_description in ${folder}`);
  assert.ok(agent.includes(`@${folder}`), `default_prompt must invoke @${folder}`);
  for (const forbidden of ['README.md', 'CHANGELOG.md', 'INSTALLATION_GUIDE.md']) {
    assert.ok(!fs.existsSync(path.join(directory, forbidden)), `extraneous skill file: ${folder}/${forbidden}`);
  }
}

assert.ok(
  fs.existsSync(path.join(skillsRoot, 'shomara-design-system', 'references', 'review-checklist.md')),
  'design-system review reference is missing',
);
assert.ok(
  fs.readFileSync(path.join(skillsRoot, 'shomara-android-build', 'SKILL.md'), 'utf8').includes('npm run android:gate'),
  'android-build skill must route the canonical gate',
);

const found = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name === 'SKILL.md') found.push(path.relative(root, target).replaceAll(path.sep, '/'));
  }
};
walk(root);
assert.deepEqual(found.sort(), expected.map((folder) => `skills/${folder}/SKILL.md`).sort(), 'all project skills must live under skills/<name>/SKILL.md');

console.log(`PROJECT_SKILLS: PASS (${expected.length} isolated skills with validated agent metadata)`);
