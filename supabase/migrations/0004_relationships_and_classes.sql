create table if not exists public.relationship_contexts (
  id uuid primary key default gen_random_uuid(),
  context_type text not null check (context_type in ('PLATFORM','HOME','CLASS')),
  name text not null,
  owner_account_id uuid references public.accounts(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  learning_identity_id uuid not null references public.learning_identities(id) on delete restrict,
  related_account_id uuid not null references public.accounts(id) on delete restrict,
  relationship_role text not null check (relationship_role in ('PARENT','TEACHER','TUTOR','CENTER')),
  context_id uuid references public.relationship_contexts(id) on delete restrict,
  lifecycle_status text not null default 'PENDING' check (lifecycle_status in ('PENDING','ACTIVE','SUSPENDED','EXPIRED','REMOVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (learning_identity_id, related_account_id, relationship_role, context_id)
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_account_id uuid not null references public.accounts(id) on delete restrict,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_memberships (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete restrict,
  learning_identity_id uuid references public.learning_identities(id) on delete restrict,
  account_id uuid references public.accounts(id) on delete restrict,
  member_role text not null check (member_role in ('TEACHER','LEARNER')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','REMOVED')),
  joined_at timestamptz not null default now(),
  removed_at timestamptz,
  check ((member_role = 'LEARNER' and learning_identity_id is not null and account_id is null)
      or (member_role = 'TEACHER' and account_id is not null and learning_identity_id is null))
);

create unique index if not exists class_memberships_learner_uq
on public.class_memberships(class_id, learning_identity_id)
where member_role = 'LEARNER' and status = 'ACTIVE';

create unique index if not exists class_memberships_teacher_uq
on public.class_memberships(class_id, account_id)
where member_role = 'TEACHER' and status = 'ACTIVE';

create trigger relationships_touch_updated_at
before update on public.relationships
for each row execute function public.touch_updated_at();
create trigger classes_touch_updated_at
before update on public.classes
for each row execute function public.touch_updated_at();

create or replace function public.can_access_learning_identity(p_learning_identity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select public.is_admin()
  or exists (
    select 1 from public.learning_identities li
    where li.id = p_learning_identity_id and li.account_id = auth.uid()
  )
  or exists (
    select 1 from public.relationships r
    where r.learning_identity_id = p_learning_identity_id
      and r.related_account_id = auth.uid()
      and r.lifecycle_status = 'ACTIVE'
  )
  or exists (
    select 1
    from public.class_memberships cm
    join public.classes c on c.id = cm.class_id
    where cm.learning_identity_id = p_learning_identity_id
      and cm.member_role = 'LEARNER'
      and cm.status = 'ACTIVE'
      and c.owner_account_id = auth.uid()
  );
$$;

create or replace function public.teacher_can_access_learning_identity(p_learning_identity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select public.is_admin()
  or exists (
    select 1
    from public.class_memberships teacher_cm
    join public.classes c on c.id = teacher_cm.class_id
    join public.class_memberships learner_cm on learner_cm.class_id = c.id
    where teacher_cm.account_id = auth.uid()
      and teacher_cm.member_role = 'TEACHER'
      and teacher_cm.status = 'ACTIVE'
      and learner_cm.learning_identity_id = p_learning_identity_id
      and learner_cm.member_role = 'LEARNER'
      and learner_cm.status = 'ACTIVE'
  )
  or exists (
    select 1 from public.relationships r
    where r.learning_identity_id = p_learning_identity_id
      and r.related_account_id = auth.uid()
      and r.relationship_role = 'TEACHER'
      and r.lifecycle_status = 'ACTIVE'
  );
$$;

alter table public.relationship_contexts enable row level security;
alter table public.relationships enable row level security;
alter table public.classes enable row level security;
alter table public.class_memberships enable row level security;

create policy relationship_contexts_access on public.relationship_contexts
for select to authenticated
using (owner_account_id = auth.uid() or public.is_admin() or exists (
  select 1 from public.relationships r
  where r.context_id = relationship_contexts.id
    and r.related_account_id = auth.uid()
    and r.lifecycle_status = 'ACTIVE'
));

create policy relationships_participant_select on public.relationships
for select to authenticated
using (related_account_id = auth.uid() or public.can_access_learning_identity(learning_identity_id));

create policy relationships_admin_write on public.relationships
for all to authenticated
using (public.is_admin() or related_account_id = auth.uid())
with check (public.is_admin() or related_account_id = auth.uid());

create policy classes_owner_or_teacher_select on public.classes
for select to authenticated
using (owner_account_id = auth.uid() or public.is_admin() or exists (
  select 1 from public.class_memberships cm
  where cm.class_id = classes.id and cm.account_id = auth.uid() and cm.member_role = 'TEACHER' and cm.status = 'ACTIVE'
));

create policy classes_owner_write on public.classes
for all to authenticated
using (owner_account_id = auth.uid() or public.is_admin())
with check (owner_account_id = auth.uid() or public.is_admin());

create policy class_memberships_scope on public.class_memberships
for select to authenticated
using (
  public.is_admin()
  or account_id = auth.uid()
  or exists (select 1 from public.classes c where c.id = class_memberships.class_id and c.owner_account_id = auth.uid())
);

create policy class_memberships_owner_write on public.class_memberships
for all to authenticated
using (public.is_admin() or exists (select 1 from public.classes c where c.id = class_memberships.class_id and c.owner_account_id = auth.uid()))
with check (public.is_admin() or exists (select 1 from public.classes c where c.id = class_memberships.class_id and c.owner_account_id = auth.uid()));
