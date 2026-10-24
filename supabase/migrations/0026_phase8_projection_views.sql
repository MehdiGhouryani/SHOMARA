-- Phase 8 projection views: no independent Parent/Teacher Learning Truth is introduced.
-- SECURITY INVOKER keeps underlying RLS/authorization semantics authoritative.

create or replace view public.v_teacher_student_signal
with (security_invoker = true)
as
select
  c.id as class_id,
  c.name as class_name,
  cm.learning_identity_id,
  coalesce(su.strength_count, 0) as strength_count,
  coalesce(su.building_count, 0) as building_count,
  coalesce(su.review_count, 0) as needs_review_count,
  case when coalesce(su.review_count,0) > 0 then true else false end as needs_review,
  coalesce(ev.recent_evidence_count, 0) as recent_evidence_count,
  coalesce(ev.last_evidence_at, null) as last_evidence_at
from public.classes c
join public.class_memberships cm
  on cm.class_id = c.id
 and cm.member_role = 'LEARNER'
 and cm.status = 'ACTIVE'
left join lateral (
  select
    count(*) filter (where ls.state = 'STRONG') as strength_count,
    count(*) filter (where ls.state = 'BUILDING') as building_count,
    count(*) filter (where ls.state = 'NEEDS_REVIEW' or ls.retention_state in ('REVIEW_DUE','AT_RISK')) as review_count
  from public.learning_states ls
  where ls.learning_identity_id = cm.learning_identity_id
) su on true
left join lateral (
  select count(*) as recent_evidence_count, max(e.occurred_at) as last_evidence_at
  from public.evidence e
  where e.learning_identity_id = cm.learning_identity_id
    and e.occurred_at >= now() - interval '14 days'
) ev on true;

create or replace view public.v_parent_child_signal
with (security_invoker = true)
as
select
  r.related_account_id as parent_account_id,
  r.learning_identity_id,
  coalesce(ls.review_count,0) as needs_review_count,
  coalesce(ev.recent_evidence_count,0) as recent_evidence_count,
  ev.last_evidence_at
from public.relationships r
left join lateral (
  select count(*) as review_count
  from public.learning_states s
  where s.learning_identity_id = r.learning_identity_id
    and (s.state = 'NEEDS_REVIEW' or s.retention_state in ('REVIEW_DUE','AT_RISK'))
) ls on true
left join lateral (
  select count(*) as recent_evidence_count, max(e.occurred_at) as last_evidence_at
  from public.evidence e
  where e.learning_identity_id = r.learning_identity_id
    and e.occurred_at >= now() - interval '14 days'
) ev on true
where r.relationship_role = 'PARENT'
  and r.lifecycle_status = 'ACTIVE';
