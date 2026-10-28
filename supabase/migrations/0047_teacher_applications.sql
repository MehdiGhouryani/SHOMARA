-- Migration 0047: Teacher Applications Standard Ingestion and State Model
-- Implements the initial PENDING / APPROVED / REJECTED workflow for educator verification.

create table if not exists public.teacher_applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone_number text not null,
  school_name text not null,
  city text not null,
  notes text,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_account_id uuid references public.accounts(id) on delete set null,
  rejection_reason text,
  updated_at timestamptz not null default now()
);

-- Index for querying by status and phone lookup
create index if not exists idx_teacher_applications_status on public.teacher_applications (status);
create index if not exists idx_teacher_applications_phone on public.teacher_applications (phone_number);
create index if not exists idx_teacher_applications_submitted on public.teacher_applications (submitted_at desc);

-- Automatic timestamp updater
create trigger teacher_applications_touch_updated_at
before update on public.teacher_applications
for each row execute function public.touch_updated_at();

-- Enable RLS
alter table public.teacher_applications enable row level security;

-- Ingestion Policy: Anonymous and authenticated users can insert with strict PENDING initial state
create policy teacher_applications_insert on public.teacher_applications
for insert
with check (
  status = 'PENDING'
  and reviewed_at is null
  and reviewer_account_id is null
  and rejection_reason is null
  and length(trim(first_name)) > 0
  and length(trim(last_name)) > 0
  and length(trim(phone_number)) >= 10
  and length(trim(school_name)) > 0
  and length(trim(city)) > 0
);

-- Read Policy: Admin can read all; direct public select is restricted
create policy teacher_applications_admin_select on public.teacher_applications
for select to authenticated
using (public.is_admin());

-- Write/Review Policy: Strictly restricted to Admin accounts
create policy teacher_applications_admin_update on public.teacher_applications
for update to authenticated
using (public.is_admin())
with check (public.is_admin());
