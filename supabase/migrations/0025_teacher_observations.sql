create table if not exists public.teacher_observations (
  id uuid primary key default gen_random_uuid(),
  teacher_account_id uuid not null references public.accounts(id) on delete restrict,
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  class_id uuid references public.classes(id) on delete restrict,
  observation text not null check (length(trim(observation)) > 0),
  provenance jsonb not null default '{}'::jsonb,
  status text not null default 'RECORDED' check (status in ('RECORDED','CONVERTED','RETRACTED')),
  created_at timestamptz not null default now()
);

create index if not exists teacher_observations_learning_idx
on public.teacher_observations(learning_identity_id, created_at desc);

alter table public.teacher_observations enable row level security;

create policy teacher_observations_select on public.teacher_observations
for select to authenticated
using (
  public.is_admin()
  or teacher_account_id = auth.uid()
  or public.teacher_can_access_learning_identity(learning_identity_id)
  or public.can_access_learning_identity(learning_identity_id)
);

create policy teacher_observations_insert on public.teacher_observations
for insert to authenticated
with check (
  public.is_admin()
  or (
    teacher_account_id = auth.uid()
    and public.teacher_can_access_learning_identity(learning_identity_id)
  )
);

create policy teacher_observations_no_update on public.teacher_observations
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy teacher_observations_no_delete on public.teacher_observations
for delete to authenticated
using (public.is_admin());
