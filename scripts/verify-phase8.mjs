import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
// Re-baselined 2026-10-04 (P02-A): teacher web pages were intentionally retired (docs/reference/ADULT_SURFACE.md);
// teacher APIs are preserved for a possible separate Teacher product and remain required below.
// packages/adult-projections/dist is a post-build artifact: run `npm run build:packages` first.
const required=[
 'packages/adult-projections/src/types.ts',
 'packages/adult-projections/src/repository.ts',
 'packages/adult-projections/src/service.ts',
 'packages/adult-projections/dist/index.js',
 'apps/web/lib/adult-projections.ts',
 'apps/web/app/parent/page.tsx',
 'apps/web/app/api/v1/parent/[parentAccountId]/today/route.ts',
 'apps/web/app/api/v1/teacher/[teacherAccountId]/classes/route.ts',
 'apps/web/app/api/v1/teacher/[teacherAccountId]/classes/[classId]/route.ts',
 'apps/web/app/api/v1/teacher/[teacherAccountId]/students/[learningIdentityId]/route.ts',
 'apps/web/app/api/v1/teacher/[teacherAccountId]/needs-attention/route.ts',
 'apps/web/app/api/v1/teacher/[teacherAccountId]/recheck-queue/route.ts',
 'apps/web/app/api/v1/teacher/students/[learningIdentityId]/observations/route.ts',
 'supabase/migrations/0025_teacher_observations.sql',
 'supabase/migrations/0026_phase8_projection_views.sql',
 'docs/api/API_ADULT_PROJECTION_CONTRACT.md',
];
for(const rel of required) if(!fs.existsSync(path.join(root,rel))) throw new Error(`Missing ${rel}`);
const obs=fs.readFileSync(path.join(root,'supabase/migrations/0025_teacher_observations.sql'),'utf8');
for(const marker of ['teacher_observations','teacher_can_access_learning_identity','provenance','status']) if(!obs.includes(marker)) throw new Error(`Observation marker missing: ${marker}`);
const types=fs.readFileSync(path.join(root,'packages/adult-projections/src/types.ts'),'utf8');
for(const marker of ['ParentTodayProjection','TeacherStudentSnapshot','TeacherObservationRecord']) if(!types.includes(marker)) throw new Error(`Projection type missing: ${marker}`);
const service=fs.readFileSync(path.join(root,'packages/adult-projections/src/service.ts'),'utf8');
for(const marker of ['getParentToday','listTeacherClasses','getTeacherStudentSnapshot','getNeedsAttention','getRecheckQueue','addTeacherObservation']) if(!service.includes(`async ${marker}`)) throw new Error(`Projection method missing: ${marker}`);
const view=fs.readFileSync(path.join(root,'supabase/migrations/0026_phase8_projection_views.sql'),'utf8');
for(const marker of ['v_teacher_student_signal','v_parent_child_signal','security_invoker']) if(!view.includes(marker)) throw new Error(`Projection view marker missing: ${marker}`);
console.log('PHASE8_STATIC_VERIFICATION_PASS');
