import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const failures=[];
const check=(name, ok, detail='')=>{ if(ok) console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`); else failures.push(`${name}${detail ? ` — ${detail}` : ''}`); };

const adult=read('packages/contracts/src/adult.ts');
const index=read('packages/contracts/src/index.ts');
const parent=read('apps/web/app/parent/page.tsx');
const parentCss=read('apps/web/components/ParentReportView.module.css');
const parentApi=read('apps/web/app/api/v1/parent/today/route.ts');
const shell=read('apps/web/components/AdultRouteShell.tsx');
const settings=read('apps/web/app/settings/page.tsx');
const settingsMobile=read('apps/mobile/app/settings.tsx');
const mobileParent=read('apps/mobile/app/parent.tsx');
const surface=read('packages/contracts/src/product-surface.ts');

check('adult-contract-exported', exists('packages/contracts/src/adult.ts') && index.includes("export * from './adult';"));
check('adult-scope-parent-settings', adult.includes("'PARENT'") && adult.includes("'SETTINGS'") && adult.includes('ADULT_REMOVED_FROM_PARENT_REPORT'));
check('parent-report-five-sections', adult.includes("PARENT_REPORT_SECTIONS") && parent.includes('خلاصه امروز') && parent.includes('تمرکز فعلی') && parent.includes('مهارت‌ها') && parent.includes('چند اتفاق اخیر') && parent.includes('در خانه'));
check('parent-no-assignments-ui', !parent.includes('assignments') && !parent.includes('تکلیف‌های مدرسه') && !parent.includes('Parent Lite'));
check('parent-route-no-hardcoded-id', parent.includes("/api/v1/parent/today") && !parent.includes('parent-dev-01'));
check('parent-api-principal-derived', parentApi.includes("requireRequestAccountPrincipal(request, 'PARENT')") && parentApi.includes('principal.accountId') && !parentApi.includes('parent-dev-01'));
check('parent-api-minimal-report', parentApi.includes('getParentToday') && parentApi.includes('assignments: _internalAssignments'));
check('adult-shell-present', exists('apps/web/components/AdultRouteShell.tsx') && shell.includes('بازگشت به مسیر کودک'));
check('settings-two-sections', settings.includes('تجربه یادگیری') && settings.includes('دسترس‌پذیری') && settingsMobile.includes('تجربه یادگیری') && settingsMobile.includes('دسترس‌پذیری'));
check('settings-no-unrelated', !/(معلم|Teacher|leaderboard|Leaderboard|جواهر|XP|اشتراک|Subscription|فروشگاه|Shop)/i.test(settings+settingsMobile));
check('parent-mobile-no-teacher-assignment', !/(معلم|Teacher|تکلیف|assignment|leaderboard|رتبه‌بندی|XP|جواهر)/i.test(mobileParent));
check('no-client-parent-auth-gate', !parent.includes('ParentGate') && !mobileParent.includes('ParentGate') && !read('apps/web/components/AuthFlowScreen.tsx').includes('ParentGate') && !read('apps/mobile/app/onboarding.tsx').includes('ParentGate'));
check('parent-session-api-boundary', parentApi.includes('requireRequestAccountPrincipal'));
check('teacher-stays-out-of-child', surface.includes("'TEACHER_LOGIN'") && read('packages/contracts/src/path2.ts').includes('teacherInChildShell: false'));
check('adult-contract', exists('docs/reference/ADULT_SURFACE.md'));
check('old-adult-global-shell-removed', !read('apps/web/app/globals.css').includes('Adult & Teacher Shell Styles'));

if(failures.length){console.error(`\nFAIL ${failures.length} checks`); failures.forEach(f=>console.error(` - ${f}`)); process.exit(1);}
console.log('\nUX-P09 verifier: PASS');
