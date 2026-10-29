import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const playbook = path.resolve(here,'..');
const root = path.resolve(playbook,'..','..');
const design = path.join(root,'design');
const library = path.join(root,'content-library');
const skills = path.join(root,'skills');
function assert(ok,msg){if(!ok)throw new Error('PACK FAIL: '+msg);}
function read(file){assert(fs.existsSync(file),'missing '+path.relative(root,file));return fs.readFileSync(file,'utf8');}
function jread(file){return JSON.parse(read(file));}
const sha=jread(path.join(library,'derived/source-sha256.json')).sha256;
for(const [name,expected] of Object.entries(sha)){
 const file=path.join(library,'originals',name);
 assert(fs.existsSync(file),`missing original ${name}`);
 const actual=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 assert(actual===expected,`original changed: ${name}`);
}
const templates=jread(path.join(library,'derived/game-patterns-index.json')).patterns;
const stations=jread(path.join(library,'derived/stations-index.json')).stations;
assert(templates.length===15,'expect 15 template IDs');
assert(stations.length===25,'expect 25 station IDs');
assert(new Set(templates.map(t=>t.id)).size===15,'duplicate template ID');
assert(new Set(stations.map(s=>s.id)).size===25,'duplicate station ID');
const audio=jread(path.join(library,'derived/audio-index.json'));
assert(audio.uniqueAcrossFiles===true,'audio duplicate IDs');
for(const [file,meta] of Object.entries(audio.manifests)){
 assert(meta.count===meta.recordIds.length,'audio count invalid '+file);
 assert(meta.headers.join(',')==='id,kind,text_display,text_tts,voice,rate,status,used_by,notes','unexpected CSV headers '+file);
 const csv=read(path.join(library,'originals',file)).replace(/^\uFEFF/, '');
 const lines=csv.trim().split(/\r?\n/);
 // These specific source manifests contain no embedded line breaks or quoted commas.
 // If that changes, use a proper CSV parser and update this validator instead of
 // silently accepting a malformed import.
 assert(lines[0]===meta.headers.join(','),'CSV header changed '+file);
 const rows=lines.slice(1);
 assert(rows.length===meta.count,`CSV actual row count mismatch in ${file}`);
 const actualIds=rows.map((line)=>line.split(',')[0]);
 assert(actualIds.every((id,i)=>id===meta.recordIds[i]),'CSV row order/id mismatch '+file);
 assert(new Set(actualIds).size===actualIds.length,'CSV repeated record IDs '+file);
 for(const line of rows){
   const parts=line.split(',');
   assert(parts.length===meta.headers.length,`CSV quoted/extra comma; use full parser: ${file}`);
   assert(parts[6]==='draft','non-draft status needs explicit approval '+file);
   assert(!/[0-9٠-٩۰-۹A-Za-z]/u.test(parts[3]),'non-spoken numerals/Latin in TTS text: '+parts[0]);
   assert(!/(غلط|اشتباه)/u.test(parts[2]+' '+parts[3]),'punitive phrase in audio line: '+parts[0]);
 }
 assert(meta.count>0,'empty manifest '+file);
}
for(const name of ['MASTER_EXECUTION.md','UX_REVIEW_RUBRIC.md','ROUTE_REGISTRY.md','ZCODE_MASTER_PROMPT.md','NATIVE_IMPLEMENTATION.md','COMPONENT_READINESS.md'])read(path.join(playbook,name));
read(path.join(design,'MASTER.md'));
read(path.join(design,'INSPIRATION_GUARDRAILS.md'));
for(const file of [path.join(skills,'shomara-product-design','SKILL.md'),path.join(skills,'shomara-design-system','SKILL.md'),path.join(skills,'shomara-screen-execution','SKILL.md'),path.join(skills,'shomara-learning-content','SKILL.md')]){
 const text=read(file);
 assert(/^---\nname: [a-z0-9-]+\ndescription: .+\n---/u.test(text),'invalid skill frontmatter '+path.relative(root,file));
}
const pages=fs.readdirSync(path.join(playbook,'pages')).filter(s=>s.endsWith('.md'));
assert(pages.length===17,`expect 17 page contracts, found ${pages.length}`);
for(const p of pages)assert(read(path.join(playbook,'pages',p)).includes('mandatory actions'),'bad page contract '+p);
const registry=read(path.join(playbook,'ROUTE_REGISTRY.md'));
const appRoot=path.join(root,'apps','mobile','app');
const routes=[];
function walkRoutes(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walkRoutes(full);else if(entry.name.endsWith('.tsx'))routes.push(path.relative(appRoot,full).replaceAll(path.sep,'/').replace(/\.tsx$/,''));}}
walkRoutes(appRoot);
for(const route of routes)assert(registry.includes('`'+route+'`'),'route missing from registry: '+route);
const masterPrompt=read(path.join(playbook,'ZCODE_MASTER_PROMPT.md'));
assert(!masterPrompt.includes('D:\\Projects'),'machine-specific path in master prompt');
console.log(`PACK PASS: ${Object.keys(sha).length} original sources checksum OK; ${stations.length} stations; ${templates.length} patterns; ${Object.values(audio.manifests).map(m=>m.count).join('+')} audio metadata rows; ${pages.length} page families; ${routes.length} live routes`);
console.log('NOTE: pack validation is NOT application tests or curriculum approval.');
