create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  grade_number int not null unique check (grade_number between 1 and 6),
  display_name text not null,
  status text not null default 'REGISTERED' check (status in ('REGISTERED','ACTIVE','RETIRED')),
  created_at timestamptz not null default now()
);

create table if not exists public.curriculum_versions (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete restrict,
  version text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (grade_id, version)
);

alter table public.grades enable row level security;
alter table public.curriculum_versions enable row level security;

create policy grades_authenticated_read on public.grades
for select to authenticated using (true);
create policy curriculum_authenticated_read on public.curriculum_versions
for select to authenticated using (true);
create policy grades_admin_write on public.grades
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy curriculum_admin_write on public.curriculum_versions
for all to authenticated using (public.is_admin()) with check (public.is_admin());
