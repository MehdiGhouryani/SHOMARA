-- Phase 14 content delivery RLS hardening.
-- Entitlement is checked before download; the underlying REST reads must honor the same learner scope.

drop policy if exists content_packages_read on public.content_packages;
create policy content_packages_read on public.content_packages
for select to authenticated
using (
  public.is_admin()
  or (
    status = 'ACTIVE'
    and exists (
      select 1 from public.learning_identities li
      where li.account_id = auth.uid()
        and li.status = 'ACTIVE'
        and public.can_access_content_package(content_packages.id, li.id)
    )
  )
);

drop policy if exists content_package_items_read on public.content_package_items;
create policy content_package_items_read on public.content_package_items
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.content_packages cp
    join public.learning_identities li on li.account_id = auth.uid() and li.status='ACTIVE'
    where cp.id = content_package_items.package_id
      and cp.status = 'ACTIVE'
      and public.can_access_content_package(cp.id, li.id)
  )
);

comment on policy content_packages_read on public.content_packages is
'Content package metadata is learner-scoped through the canonical entitlement/assignment resolver; admin is the only explicit bypass.';
