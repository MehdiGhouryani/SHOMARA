-- Deep remediation: content package reads must honor assignment-scoped access for the authenticated learner.
-- Previously content_packages_read called can_access_content_package(id, NULL), which only evaluated
-- account-level entitlement and could deny a valid child assignment package.

drop policy if exists content_packages_read on public.content_packages;

create policy content_packages_read on public.content_packages
for select to authenticated
using (
  public.is_admin()
  or (
    status = 'ACTIVE'
    and (
      public.can_access_content_package(id, null)
      or exists (
        select 1
        from public.assignment_required_packages arp
        join public.assignment_instances ai on ai.assignment_id = arp.assignment_id
        join public.assignments a on a.id = arp.assignment_id
        where arp.package_id = content_packages.id
          and arp.required = true
          and a.status in ('PUBLISHED','ACTIVE')
          and (a.due_at is null or a.due_at >= now())
          and public.can_access_learning_identity(ai.learning_identity_id)
      )
    )
  )
);

comment on policy content_packages_read on public.content_packages is
'Active packages require entitlement or a currently valid assignment-instance package requirement; admin bypass is explicit.';
