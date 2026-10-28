insert into public.grades(code, grade_number, display_name, status)
values
  ('G1',1,'Grade 1','ACTIVE'),
  ('G2',2,'Grade 2','REGISTERED'),
  ('G3',3,'Grade 3','REGISTERED'),
  ('G4',4,'Grade 4','REGISTERED'),
  ('G5',5,'Grade 5','REGISTERED'),
  ('G6',6,'Grade 6','REGISTERED')
on conflict (code) do nothing;

insert into public.relationship_contexts(context_type, name)
select 'PLATFORM', 'Platform Context'
where not exists (select 1 from public.relationship_contexts where context_type='PLATFORM' and name='Platform Context');

insert into public.curriculum_versions(grade_id, version, status)
select g.id, 'g1-build-001', 'ACTIVE'
from public.grades g
where g.code='G1'
  and not exists (select 1 from public.curriculum_versions cv where cv.grade_id=g.id and cv.version='g1-build-001');

insert into public.skill_graph_versions(grade_id, version, status, source_ref)
select g.id, 'g1-provisional-001', 'PROVISIONAL', 'math_learning_product_grade1_skill_graph_v0_27.md'
from public.grades g
where g.code='G1'
  and not exists (select 1 from public.skill_graph_versions sgv where sgv.grade_id=g.id and sgv.version='g1-provisional-001');
