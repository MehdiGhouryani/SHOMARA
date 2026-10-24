import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const failures=[];
const check=(name, ok, detail='')=>{ if(ok) console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`); else failures.push(`${name}${detail ? ` — ${detail}` : ''}`); };

const contract=read('packages/contracts/src/profile.ts');
const web=read('apps/web/components/ProfileView.tsx');
const mobile=read('apps/mobile/app/(tabs)/profile.tsx');
const mobileAvatar=read('apps/mobile/app/avatar.tsx');
const webAvatar=read('apps/web/components/AvatarWorkshopView.tsx');
const state=read('apps/mobile/src/state/AppStateContext.tsx');
const core=read('apps/mobile/src/state/appStateCore.ts');
const nav=read('packages/contracts/src/navigation.ts');
const surface=read('packages/contracts/src/product-surface.ts');

check('profile-contract-present', exists('packages/contracts/src/profile.ts'));
check('profile-four-groups', ['IDENTITY','PROGRESS','ACHIEVEMENTS','ACTIONS'].every(x=>contract.includes(`'${x}'`)));
check('profile-actions', (contract.match(/id: '(AVATAR|SETTINGS|PARENT)'/g)??[]).length===3 && contract.includes("maxSecondaryActions: 3"));
check('achievements-on-profile', web.includes('CHILD_ACHIEVEMENTS.map') && mobile.includes('CHILD_ACHIEVEMENTS.map'));
check('achievement-detail-secondary', web.includes('role="dialog"') && mobile.includes('accessibilityViewIsModal'));
check('no-teacher-or-social', !/معلم|Teacher|leaderboard|leader|دوستان|companion|assignment/i.test(web+mobile));
check('no-currency', !/(>\s*XP\s*<|['\"]XP['\"]|جواهر|لیگ|رتبه‌بندی|استریک|\b gems? \b|\bstreak\b)/i.test(web+mobile));
check('vector-achievement-icons', web.includes('achievementIconKind') && mobile.includes('Ionicons'));
check('avatar-workshop-web', exists('apps/web/app/profile/avatar/page.tsx') && webAvatar.includes('onSaved') && read('apps/web/app/profile/avatar/page.tsx').includes('localStorage.setItem'));
check('avatar-workshop-mobile', exists('apps/mobile/app/avatar.tsx') && mobileAvatar.includes('updateAvatarPreset'));
check('avatar-persistence-web', read('apps/web/app/profile/avatar/page.tsx').includes('localStorage.setItem'));
check('avatar-persistence-mobile', state.includes('updateAvatarPreset') && core.includes('updateChildAvatarPreset'));
check('child-nav-still-three', (nav.match(/id: '(PATH|PRACTICE|PROFILE)'/g)??[]).length===3);
check('removed-surfaces-still-enforced', ['TEACHER_LOGIN','LEADERBOARD','ASSIGNMENTS','FRIENDS_FEED'].every(x=>surface.includes(`'${x}'`)));
check('p08-contract', exists('docs/reference/PROFILE_ACHIEVEMENT_AVATAR_CONTRACT.md'));

if(failures.length){console.error(`\nFAIL ${failures.length} checks`); failures.forEach(f=>console.error(` - ${f}`)); process.exit(1);}
console.log(`\nUX-P08 verifier: PASS`);
