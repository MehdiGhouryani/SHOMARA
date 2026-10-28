create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid references public.learning_identities(id) on delete restrict,
  account_id uuid references public.accounts(id) on delete restrict,
  source_type text not null check (source_type in ('SUBSCRIPTION','CLASS_ACCESS','DEV_GRANT','OTHER')),
  scope jsonb not null default '{}'::jsonb,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','EXPIRED','REVOKED')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  check (learning_identity_id is not null or account_id is not null)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete restrict,
  author_account_id uuid not null references public.accounts(id) on delete restrict,
  shared_objective text not null,
  shared_outcome text,
  boundary jsonb not null default '{}'::jsonb,
  starts_at timestamptz not null,
  due_at timestamptz,
  status text not null default 'DRAFT' check (status in ('DRAFT','PUBLISHED','ACTIVE','COMPLETED','EXPIRED','CANCELLED')),
  revision int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_instances (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete restrict,
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  execution_state text not null default 'PENDING' check (execution_state in ('PENDING','ACTIVE','COMPLETED','NEEDS_RECHECK','EXPIRED','CANCELLED')),
  personalized_plan_ref uuid references public.learning_plans(id) on delete restrict,
  completion_payload jsonb not null default '{}'::jsonb,
  instance_revision int not null default 1,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(assignment_id, learning_identity_id)
);

alter table public.entitlements enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_instances enable row level security;

create policy entitlements_access on public.entitlements for select to authenticated
using (public.is_admin() or account_id = auth.uid() or (learning_identity_id is not null and public.can_access_learning_identity(learning_identity_id)));

create policy assignments_teacher_select on public.assignments for select to authenticated
using (public.is_admin() or author_account_id = auth.uid() or exists (
  select 1 from public.classes c where c.id=assignments.class_id and (c.owner_account_id=auth.uid() or exists (
    select 1 from public.class_memberships cm where cm.class_id=c.id and cm.account_id=auth.uid() and cm.member_role='TEACHER' and cm.status='ACTIVE'
  ))
));

create policy assignments_teacher_write on public.assignments for all to authenticated
using (public.is_admin() or author_account_id = auth.uid())
with check (
  public.is_admin()
  or (
    author_account_id = auth.uid()
    and exists (
      select 1 from public.classes c
      left join public.class_memberships cm on cm.class_id = c.id
        and cm.account_id = auth.uid()
        and cm.member_role = 'TEACHER'
        and cm.status = 'ACTIVE'
      where c.id = assignments.class_id
        and (c.owner_account_id = auth.uid() or cm.id is not null)
    )
  )
);

create policy assignment_instances_access on public.assignment_instances for select to authenticated
using (public.is_admin() or public.can_access_learning_identity(learning_identity_id) or exists (
  select 1 from public.assignments a where a.id=assignment_instances.assignment_id and a.author_account_id=auth.uid()
));

create policy assignment_instances_admin_write on public.assignment_instances for all to authenticated
using (public.is_admin()) with check (public.is_admin());
