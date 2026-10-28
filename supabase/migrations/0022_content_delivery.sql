create table if not exists public.content_packages (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete restrict,
  station_id uuid references public.stations(id) on delete restrict,
  package_code text not null,
  version text not null,
  checksum text not null,
  bytes bigint not null check (bytes >= 0),
  storage_path text not null,
  min_app_version text,
  release_channel text not null default 'STABLE' check (release_channel in ('STABLE','BETA','DEV')),
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED')),
  created_at timestamptz not null default now(),
  unique (package_code, version)
);

create table if not exists public.content_package_items (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.content_packages(id) on delete restrict,
  content_version_id uuid not null references public.content_versions(id) on delete restrict,
  required boolean not null default true,
  ordinal int not null default 0,
  unique(package_id, content_version_id)
);

create table if not exists public.content_manifests (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete restrict,
  curriculum_version_id uuid references public.curriculum_versions(id) on delete restrict,
  version text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','RETIRED')),
  generated_at timestamptz not null default now(),
  unique(grade_id, version)
);

create table if not exists public.content_manifest_items (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null references public.content_manifests(id) on delete restrict,
  package_id uuid not null references public.content_packages(id) on delete restrict,
  cache_class text not null check (cache_class in ('CURRENT','NEXT','RECENT','FUTURE')),
  sequence int not null default 0,
  prefetch_rank int,
  unique(manifest_id, package_id)
);

create table if not exists public.assignment_required_packages (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete restrict,
  package_id uuid not null references public.content_packages(id) on delete restrict,
  required boolean not null default true,
  created_at timestamptz not null default now(),
  unique(assignment_id, package_id)
);

create index if not exists content_packages_grade_station_idx on public.content_packages(grade_id, station_id, status);
create index if not exists content_package_items_package_idx on public.content_package_items(package_id, ordinal);
create index if not exists content_manifest_items_manifest_cache_idx on public.content_manifest_items(manifest_id, cache_class, sequence);
create index if not exists assignment_required_packages_assignment_idx on public.assignment_required_packages(assignment_id);

create or replace function public.can_access_content_package(p_package_id uuid, p_learning_identity_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select public.is_admin()
  or exists (
    select 1
    from public.content_packages cp
    where cp.id = p_package_id
      and exists (
        select 1
        from public.entitlements e
        where e.status = 'ACTIVE'
          and (e.expires_at is null or e.expires_at > now())
          and (
            (p_learning_identity_id is not null and e.learning_identity_id = p_learning_identity_id)
            or e.account_id = auth.uid()
          )
          and (
            coalesce(e.scope->'packageIds', '[]'::jsonb) ? cp.id::text
            or coalesce(e.scope->'gradeIds', '[]'::jsonb) ? cp.grade_id::text
            or (cp.station_id is not null and coalesce(e.scope->'stationIds', '[]'::jsonb) ? cp.station_id::text)
          )
      )
  )
  or exists (
    select 1
    from public.assignment_required_packages arp
    join public.assignment_instances ai on ai.assignment_id = arp.assignment_id
    join public.assignments a on a.id = arp.assignment_id
    where arp.package_id = p_package_id
      and arp.required = true
      and ai.learning_identity_id = p_learning_identity_id
      and a.status in ('PUBLISHED','ACTIVE')
      and (a.due_at is null or a.due_at >= now())
      and public.can_access_learning_identity(ai.learning_identity_id)
  );
$$;

alter table public.content_packages enable row level security;
alter table public.content_package_items enable row level security;
alter table public.content_manifests enable row level security;
alter table public.content_manifest_items enable row level security;
alter table public.assignment_required_packages enable row level security;

create policy content_packages_read on public.content_packages for select to authenticated
using (status = 'ACTIVE' and public.can_access_content_package(id, null) or public.is_admin());

create policy content_package_items_read on public.content_package_items for select to authenticated
using (exists (select 1 from public.content_packages cp where cp.id = content_package_items.package_id and (cp.status = 'ACTIVE' or public.is_admin())));

create policy content_manifests_read on public.content_manifests for select to authenticated
using (status = 'ACTIVE' or public.is_admin());

create policy content_manifest_items_read on public.content_manifest_items for select to authenticated
using (exists (select 1 from public.content_manifests cm where cm.id = content_manifest_items.manifest_id and (cm.status = 'ACTIVE' or public.is_admin())));

create policy assignment_required_packages_access on public.assignment_required_packages for select to authenticated
using (
  public.is_admin()
  or exists (select 1 from public.assignments a where a.id = assignment_required_packages.assignment_id and a.author_account_id = auth.uid())
  or exists (
    select 1 from public.assignment_instances ai
    where ai.assignment_id = assignment_required_packages.assignment_id
      and ai.learning_identity_id is not null
      and public.can_access_learning_identity(ai.learning_identity_id)
  )
);

create policy content_packages_admin_write on public.content_packages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy content_package_items_admin_write on public.content_package_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy content_manifests_admin_write on public.content_manifests for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy content_manifest_items_admin_write on public.content_manifest_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy assignment_required_packages_teacher_write on public.assignment_required_packages for all to authenticated
using (public.is_admin() or exists (select 1 from public.assignments a where a.id = assignment_required_packages.assignment_id and a.author_account_id = auth.uid()))
with check (public.is_admin() or exists (select 1 from public.assignments a where a.id = assignment_required_packages.assignment_id and a.author_account_id = auth.uid()));
