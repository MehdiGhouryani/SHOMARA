import { renderCharacter, CAST, STATES, NAMES_FA, INSTANCE_UID_TOKEN } from './shomara-cast.mjs';
import fs from 'node:fs';
const P = process.argv[2];
const D = `${P}/project-design-v2`;
const all = {}; // inline markup for the web module (class layers, per-instance gradient ids)
for (const id of CAST) {
  fs.mkdirSync(`${D}/assets/characters/${id}`, { recursive: true });
  all[id] = {};
  for (const st of STATES) { fs.writeFileSync(`${D}/assets/characters/${id}/${st}.svg`, renderCharacter(id, st)); all[id][st] = renderCharacter(id, st, { inline: true, uid: INSTANCE_UID_TOKEN }); }
  fs.writeFileSync(`${D}/assets/characters/${id}/bust.svg`, renderCharacter(id, 'idle', { bust: true, uid: `${id}-bust` })); all[id].bust = renderCharacter(id, 'idle', { bust: true, inline: true, uid: INSTANCE_UID_TOKEN });
}
// family lineup with canonical relative heights
const H = { qbo: 1.1, aria: 1.0, dana: 0.95, jiko: 0.62 };
const order = ['aria', 'qbo', 'dana', 'jiko'];
let x = 10, parts = '';
for (const id of order) { const s = H[id], w = 224 * s * 0.92, h = 256 * s * 0.92;
  const inner = renderCharacter(id, 'idle', { uid: `fam-${id}`, title: false, inline: true }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  parts += `<svg x="${x}" y="${300 - h}" width="${w}" height="${h}" viewBox="0 0 224 256">${inner}</svg><text x="${x + w / 2}" y="330" text-anchor="middle" font-family="Vazirmatn, Tahoma, sans-serif" font-size="20" font-weight="700" fill="#23373D">${NAMES_FA[id]}</text>`;
  x += w + 14; }
fs.writeFileSync(`${D}/assets/characters/family-lineup.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(x)} 350" role="img" aria-label="خانوادهٔ شخصیت‌های شمارا"><rect width="100%" height="100%" fill="#F3F8F6"/>${parts}</svg>`);
// web generated module
const esc = (s) => JSON.stringify(s);
let ts = `// AUTO-GENERATED from project-design-v2/source/shomara-cast.mjs — do not edit by hand.\n// Regenerate: node project-design-v2/source/build-all.mjs .\n\nexport type CastId = 'aria' | 'qbo' | 'dana' | 'jiko';\nexport type CastState = 'idle' | 'think' | 'encourage' | 'correct' | 'celebrate' | 'recovery';\n\nexport const CAST_IDS: readonly CastId[] = ${JSON.stringify(CAST)};\nexport const CAST_STATES: readonly CastState[] = ${JSON.stringify(STATES)};\n\n/** Gradient ids inside every markup string start with this token; replace it with a unique per-instance prefix. */\nexport const INSTANCE_UID_TOKEN = ${JSON.stringify(INSTANCE_UID_TOKEN)};\n\nexport const CHARACTER_SVGS: Readonly<Record<CastId, Readonly<Record<CastState | 'bust', string>>>> = {\n`;
for (const id of CAST) { ts += `  ${id}: {\n`; for (const k of [...STATES, 'bust']) ts += `    ${k}: ${esc(all[id][k])},\n`; ts += `  },\n`; }
ts += `};\n`;
fs.writeFileSync(`${P}/apps/web/lib/characterArt.generated.ts`, ts);
fs.writeFileSync(`${P}/project-design-v2/manifest.json`, JSON.stringify({ schemaVersion: '2.0.0', generatedFrom: 'source/shomara-cast.mjs', viewBox: '0 0 224 256', cast: Object.fromEntries(CAST.map((id) => [id, { states: STATES.map((s) => `assets/characters/${id}/${s}.svg`), bust: `assets/characters/${id}/bust.svg`, bytes: Object.fromEntries([...STATES, 'bust'].map((s) => [s, Buffer.byteLength(all[id][s])])) }])) }, null, 2));
// keep the web copy of the motion layer in sync (no manual copy drift)
const MARK = '/* ===== Shomara cast v2 motion (source: project-design-v2/source/motion.css) ===== */';
const gp = `${P}/apps/web/app/globals.css`;
if (fs.existsSync(gp)) { const g = fs.readFileSync(gp, 'utf8'); const i = g.indexOf(MARK); const motion = fs.readFileSync(new URL('./motion.css', import.meta.url), 'utf8');
  fs.writeFileSync(gp, (i >= 0 ? g.slice(0, i) : g.replace(/\n*$/, '\n\n')) + MARK + '\n' + motion); }
console.log('built');
