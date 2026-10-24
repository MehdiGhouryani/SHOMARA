import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(); const required=['apps/mobile/app/station/[stationId]/index.tsx','apps/mobile/app/station/[stationId]/play.tsx','apps/mobile/src/station/StationFlow.tsx','apps/mobile/src/station/runtimeApi.ts','content/dev-packs/g1-st01-v1/content.json','docs/source/math_learning_product_station01_vertical_slice_v0_30_completed_v0_31.md'];
for(const f of required) if(!fs.existsSync(path.join(root,f))) throw new Error(`MISSING_CURRENT:${f}`);
const source=fs.readFileSync(path.join(root,'apps/mobile/src/station/StationFlow.tsx'),'utf8'); for(const marker of ['PatternGame','CountGame','RECOVERY','RECHECK','stationPass','beginFreshCheckEncounter']) if(!source.includes(marker)) throw new Error(`MISSING_MARKER:${marker}`);
if(/\bUnity\b/.test(source)) throw new Error('UNITY_REFERENCE_IN_STATION_UI'); console.log('Current ST01 runtime verification: PASS');
