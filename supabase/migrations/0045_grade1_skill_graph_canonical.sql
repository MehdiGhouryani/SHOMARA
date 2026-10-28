-- Migration 0045: Promote Grade 1 Skill Graph to Canonical Active Version
-- Formal educational review completed for all 64 skills and 25 stations.

-- 1. Promote skill graph version
insert into public.skill_graph_versions(id, grade_id, version, status, source_ref)
select '25000000-0000-4000-8000-000000000001', g.id, 'g1-canonical-v1.0', 'ACTIVE', 'math_learning_product_grade1_skill_graph_v0_27.md'
from public.grades g where g.code='G1'
on conflict (id) do update set version = 'g1-canonical-v1.0', status = 'ACTIVE';

-- 2. Promote all 64 skills to ACTIVE
update public.skills
set status = 'ACTIVE'
where code like 'G1-SK%';

-- 3. Promote all Grade 1 stations to ACTIVE
update public.stations
set status = 'ACTIVE'
where code like 'G1-ST%';
