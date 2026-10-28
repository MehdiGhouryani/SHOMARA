import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`);
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

const V1 = 'docs/design-handoff-2026-10/pages-v1';
const manifest = JSON.parse(read(`${V1}/manifest.json`));
check('v1-manifest-version', manifest.version === 'v1');
check('v1-page-count', manifest.pages.length === 15, `${manifest.pages.length} entries`);

for (const page of manifest.pages) {
  const file = `${V1}/${page.file}`;
  const present = exists(file);
  check(`v1-file-present:${page.file}`, present);
  if (!present) continue;
  const sha = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, file))).digest('hex');
  check(`v1-sha256:${page.file}`, sha === page.sha256, sha === page.sha256 ? '' : 'hash drift');
}

const path5 = read(`${V1}/05-path.html`);
check('v1-path-no-streak-fire', !/class="stat fire"/.test(path5));
check('v1-path-no-star-stat', !/class="stat star"/.test(path5));
check('v1-path-no-heart-stat', !/class="stat heart"/.test(path5));
check('v1-path-no-node-stars', !/class="stars"/.test(path5));
check('v1-path-no-star-glyph', !/\bSTAR\b/.test(path5));
check('v1-path-grade-chip-kept', path5.includes('<span class="grade">'));

check('adr-0035-exists', exists('docs/adr/ADR-0035-ui-v1-from-2026-10-pages.md'));
check('archive-original-path-exists', exists('docs/archive/design-2026-10/05-path-NEW-original.html'));

if (failures.length) {
  console.error(`FAIL ${failures.length} check(s):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('UI_V1_SCOPE: PASS');
