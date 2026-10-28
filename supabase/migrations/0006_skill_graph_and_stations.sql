create table if not exists public.skill_graph_versions (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete restrict,
  version text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED','PROVISIONAL')),
  source_ref text,
  created_at timestamptz not null default now(),
  unique (grade_id, version)
);

create table if not exists public.skill_families (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','RETIRED'))
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  family_id uuid references public.skill_families(id) on delete restrict,
  status text not null default 'PROVISIONAL' check (status in ('PROVISIONAL','ACTIVE','RETIRED'))
);

create table if not exists public.skill_graph_nodes (
  skill_graph_version_id uuid not null references public.skill_graph_versions(id) on delete restrict,
  skill_id uuid not null references public.skills(id) on delete restrict,
  sequence int,
  is_active boolean not null default true,
  primary key (skill_graph_version_id, skill_id)
);

create table if not exists public.skill_relations (
  id uuid primary key default gen_random_uuid(),
  skill_graph_version_id uuid not null references public.skill_graph_versions(id) on delete restrict,
  from_skill_id uuid not null references public.skills(id) on delete restrict,
  to_skill_id uuid not null references public.skills(id) on delete restrict,
  relation_type text not null check (relation_type in ('PREREQUISITE','SUPPORTING','RELATED')),
  unique (skill_graph_version_id, from_skill_id, to_skill_id, relation_type),
  check (from_skill_id <> to_skill_id)
);

create table if not exists public.stations (
  id uuid primary key default gen_random_uuid(),
  curriculum_version_id uuid not null references public.curriculum_versions(id) on delete restrict,
  code text not null,
  sequence int not null,
  title text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED')),
  unique (curriculum_version_id, code),
  unique (curriculum_version_id, sequence)
);

create table if not exists public.station_skills (
  station_id uuid not null references public.stations(id) on delete restrict,
  skill_id uuid not null references public.skills(id) on delete restrict,
  mapping_role text not null check (mapping_role in ('PRIMARY','SUPPORTING')),
  primary key (station_id, skill_id)
);

alter table public.skill_graph_versions enable row level security;
alter table public.skill_families enable row level security;
alter table public.skills enable row level security;
alter table public.skill_graph_nodes enable row level security;
alter table public.skill_relations enable row level security;
alter table public.stations enable row level security;
alter table public.station_skills enable row level security;

create policy graph_read_authenticated on public.skill_graph_versions for select to authenticated using (true);
create policy graph_family_read on public.skill_families for select to authenticated using (true);
create policy skills_read on public.skills for select to authenticated using (true);
create policy graph_nodes_read on public.skill_graph_nodes for select to authenticated using (true);
create policy graph_relations_read on public.skill_relations for select to authenticated using (true);
create policy stations_read on public.stations for select to authenticated using (true);
create policy station_skills_read on public.station_skills for select to authenticated using (true);

create policy graph_admin_write on public.skill_graph_versions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy graph_family_admin_write on public.skill_families for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy skills_admin_write on public.skills for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy graph_nodes_admin_write on public.skill_graph_nodes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy graph_relations_admin_write on public.skill_relations for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy stations_admin_write on public.stations for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy station_skills_admin_write on public.station_skills for all to authenticated using (public.is_admin()) with check (public.is_admin());
