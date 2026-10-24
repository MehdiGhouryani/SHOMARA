-- Phase 7: canonical teacher assignment execution boundary.
-- Keeps relational targets out of the boundary JSON while preserving shared intent + per-learner execution.

alter table public.assignments
  add column if not exists adaptation_mode text not null default 'BOUNDED_ADAPTIVE'
    check (adaptation_mode in ('OPEN_ADAPTIVE','BOUNDED_ADAPTIVE','PINNED')),
  add column if not exists completion_rule text not null default 'STATION_PASS'
    check (completion_rule in ('STATION_PASS','OBJECTIVE_MET','RECHECK_PASSED'));

create table if not exists public.assignment_targets (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete restrict,
  skill_id uuid references public.skills(id) on delete restrict,
  station_id uuid references public.stations(id) on delete restrict,
  created_at timestamptz not null default now(),
  check ((skill_id is not null) <> (station_id is not null)
),
  unique (assignment_id, skill_id),
  unique (assignment_id, station_id)
);

create table if not exists public.assignment_rechecks (
  id uuid primary key default gen_random_uuid(),
  assignment_instance_id uuid not null references public.assignment_instances(id) on delete restrict,
  requested_by_account_id uuid not null references public.accounts(id) on delete restrict,
  reason text,
  status text not null default 'REQUESTED' check (status in ('REQUESTED','COMPLETED','CANCELLED')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.assignment_instances
  add column if not exists started_at timestamptz,
  add column if not exists recheck_requested_at timestamptz,
  add column if not exists last_activity_at timestamptz;

alter table public.assignment_targets enable row level security;
alter table public.assignment_rechecks enable row level security;

create policy assignment_targets_access on public.assignment_targets
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.assignments a
    join public.classes c on c.id = a.class_id
    where a.id = assignment_targets.assignment_id
      and (
        a.author_account_id = auth.uid()
        or c.owner_account_id = auth.uid()
        or exists (
          select 1
          from public.class_memberships cm
          where cm.class_id = c.id
            and cm.account_id = auth.uid()
            and cm.member_role = 'TEACHER'
            and cm.status = 'ACTIVE'
        )
      )
  )
);

create policy assignment_rechecks_access on public.assignment_rechecks
for select to authenticated
using (
  public.is_admin()
  or requested_by_account_id = auth.uid()
  or exists (
    select 1
    from public.assignment_instances ai
    join public.assignments a on a.id = ai.assignment_id
    where ai.id = assignment_rechecks.assignment_instance_id
      and public.can_access_learning_identity(ai.learning_identity_id)
  )
  or exists (
    select 1
    from public.assignment_instances ai
    join public.assignments a on a.id = ai.assignment_id
    join public.classes c on c.id = a.class_id
    where ai.id = assignment_rechecks.assignment_instance_id
      and (
        a.author_account_id = auth.uid()
        or c.owner_account_id = auth.uid()
        or exists (
          select 1
          from public.class_memberships cm
          where cm.class_id = c.id
            and cm.account_id = auth.uid()
            and cm.member_role = 'TEACHER'
            and cm.status = 'ACTIVE'
        )
      )
  )
);

create policy assignment_rechecks_teacher_write on public.assignment_rechecks
for insert to authenticated
with check (
  public.is_admin()
  or exists (
    select 1
    from public.assignment_instances ai
    join public.assignments a on a.id = ai.assignment_id
    join public.classes c on c.id = a.class_id
    where ai.id = assignment_rechecks.assignment_instance_id
      and requested_by_account_id = auth.uid()
      and (
        a.author_account_id = auth.uid()
        or c.owner_account_id = auth.uid()
        or exists (
          select 1
          from public.class_memberships cm
          where cm.class_id = c.id
            and cm.account_id = auth.uid()
            and cm.member_role = 'TEACHER'
            and cm.status = 'ACTIVE'
        )
      )
  )
);
