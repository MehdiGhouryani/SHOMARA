import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(); const required=['packages/contracts/src/animation.ts','packages/contracts/src/game-feel.ts','apps/mobile/src/components/AnimatedCharacter.tsx','apps/mobile/src/components/SemanticAnimationDemo.tsx','apps/mobile/src/game-feel/GameFeelController.ts','docs/adr/ADR-0002-semantic-animation-events.md','docs/adr/ADR-0034-shared-game-feel-feedback.md'];
for(const f of required) if(!fs.existsSync(path.join(root,f))) throw new Error(`Missing current P03 surface: ${f}`);
const src=fs.readFileSync(path.join(root,'packages/contracts/src/animation.ts'),'utf8'); for(const m of ["'STATION_PASS'","'REWARD_GRANTED'"]) if(!src.includes(m)) throw new Error(`Semantic event missing: ${m}`);
const gf=fs.readFileSync(path.join(root,'packages/contracts/src/game-feel.ts'),'utf8'); for(const m of ['reducedMotion','blocksInput','NEAR_MISS']) if(!gf.includes(m)) throw new Error(`Game-feel guard missing: ${m}`);
console.log('[PASS] Current P03 game-feel static verification');
