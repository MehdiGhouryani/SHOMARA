-- Phase 10 remediation: harden relationship writes and encode runtime invariants.
-- This migration intentionally does not create client-side authority over Learning Truth.

-- Relationships are provisioned by trusted server/admin flows until an invitation/consent workflow exists.
drop policy if exists relationships_admin_write on public.relationships;
create policy relationships_admin_write on public.relationships
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Raw teacher observations remain teacher/admin evidence, not a general child/parent feed.
drop policy if exists teacher_observations_select on public.teacher_observations;
create policy teacher_observations_select on public.teacher_observations
for select to authenticated
using (
  public.is_admin()
  or teacher_account_id = auth.uid()
  or public.teacher_can_access_learning_identity(learning_identity_id)
);

-- Rechecks are append-only requests from the teacher boundary; completion is server-authoritative.
drop policy if exists assignment_rechecks_teacher_update on public.assignment_rechecks;
drop policy if exists assignment_rechecks_teacher_delete on public.assignment_rechecks;

-- Make assignment target references visible to assignment participants only through the assignment boundary.
create index if not exists assignment_targets_assignment_idx on public.assignment_targets(assignment_id);

-- Runtime pass records cannot be client-written.
revoke insert, update, delete on public.station_check_results from authenticated;

-- Assignment target rows and package requirements must be created by the trusted assignment/content writer.
revoke insert, update, delete on public.assignment_targets from authenticated;
revoke insert, update, delete on public.assignment_required_packages from authenticated;

comment on table public.relationships is 'Write authority is trusted/admin-only until an invitation/consent flow exists.';
comment on table public.station_check_results is 'Server-authoritative operational Station Pass evidence; client cannot write directly.';
