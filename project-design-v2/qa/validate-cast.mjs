// node project-design-v2/qa/validate-cast.mjs — structural checks for cast v2 art
import { renderCharacter, CAST, STATES, INSTANCE_UID_TOKEN } from '../source/shomara-cast.mjs';
import fs from 'node:fs';
const spec = JSON.parse(fs.readFileSync(new URL('../specs/characters-v2.json', import.meta.url), 'utf8'));
const REQUIRED = spec.layers.requiredIds;
const EXC = spec.layers.requiredIdExceptions || [];
const exempt = (id, st, r) => EXC.some((e) => e.character === id && e.states.includes(st) && e.layers.includes(r));
const BANNED = [/teeth-sharp/, /claw/, /fire/];
const css = fs.readFileSync(new URL('../source/motion.css', import.meta.url), 'utf8');
let fails = 0, n = 0;
const check = (cond, msg) => { if (!cond) { fails++; console.error('FAIL', msg); } };
const ids = (svg) => [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
check(!/#[a-z][\w-]*/.test(css.replace(/\/\*[\s\S]*?\*\//g, '')), 'motion.css must target layers by class, not #id');
const gen = fs.readFileSync(new URL('../../apps/web/lib/characterArt.generated.ts', import.meta.url), 'utf8');
const globals = fs.readFileSync(new URL('../../apps/web/app/globals.css', import.meta.url), 'utf8');
check(globals.endsWith(css), 'apps/web/app/globals.css motion block out of sync with source/motion.css');
for (const id of CAST) for (const st of [...STATES, 'bust']) {
  const opt = st === 'bust' ? { bust: true, uid: `${id}-bust` } : {};
  const svg = renderCharacter(id, st === 'bust' ? 'idle' : st, opt);
  const inl = renderCharacter(id, st === 'bust' ? 'idle' : st, { ...opt, inline: true, uid: INSTANCE_UID_TOKEN });
  n++;
  check(svg.startsWith('<svg') && svg.endsWith('</svg>'), `${id}/${st} envelope`);
  for (const r of REQUIRED) if (!exempt(id, st, r)) {
    check(svg.includes(`id="${r}"`), `${id}/${st} missing #${r}`);
    check(new RegExp(`class="[^"]*\\bsh-${r}\\b`).test(inl), `${id}/${st} inline missing .sh-${r}`);
  }
  check(!/NaN|undefined/.test(svg), `${id}/${st} has NaN/undefined`);
  check(/aria-label="[^"]+"/.test(svg), `${id}/${st} aria-label`);
  for (const b of BANNED) check(!b.test(svg), `${id}/${st} banned ${b}`);
  const opens = (svg.match(/<g[\s>]/g) || []).length, closes = (svg.match(/<\/g>/g) || []).length;
  check(opens === closes, `${id}/${st} unbalanced <g> ${opens}/${closes}`);
  check(Buffer.byteLength(svg) < 16000, `${id}/${st} > 16KB`);
  const fileIds = ids(svg); check(new Set(fileIds).size === fileIds.length, `${id}/${st} duplicate id inside one file`);
  // inline: only gradient/def ids remain, all instance-scoped
  check(ids(inl).every((x) => x.startsWith(`${INSTANCE_UID_TOKEN}-`)), `${id}/${st} inline has non-instance id`);
  check(gen.includes(JSON.stringify(inl)), `${id}/${st} characterArt.generated.ts out of sync`);
  const disk = new URL(`../assets/characters/${id}/${st}.svg`, import.meta.url);
  check(fs.existsSync(disk) && fs.readFileSync(disk, 'utf8') === svg, `${id}/${st} disk asset out of sync with source`);
}
// many characters in one DOM (page with 4 guides x 7 poses, two instances each): every id unique
const page = []; let k = 0;
for (const id of CAST) for (const st of STATES) for (let i = 0; i < 2; i++) page.push(...ids(renderCharacter(id, st, { inline: true, uid: INSTANCE_UID_TOKEN }).split(INSTANCE_UID_TOKEN).join(`i${++k}`)));
check(new Set(page).size === page.length, `multi-instance page has duplicate ids (${page.length - new Set(page).size})`);
console.log(`${n} assets checked (file + inline), multi-instance ids ${page.length} unique, ${fails} failures`);
process.exit(fails ? 1 : 0);
