create table if not exists public.learning_objectives (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete restrict,
  skill_id uuid references public.skills(id) on delete restrict,
  station_id uuid references public.stations(id) on delete restrict,
  code text not null unique,
  title text not null,
  objective_context text,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED')),
  created_at timestamptz not null default now()
);

alter table public.learning_objectives enable row level security;
create policy objectives_authenticated_read on public.learning_objectives for select to authenticated using (true);
create policy objectives_admin_write on public.learning_objectives for all to authenticated using (public.is_admin()) with check (public.is_admin());
