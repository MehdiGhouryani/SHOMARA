-- Phase 9 — Offline sync receipt ledger.
-- This table records transport-level idempotency only; it never becomes Learning Truth.
create table if not exists public.sync_operation_receipts (
  id uuid primary key default gen_random_uuid(),
  client_installation_id uuid not null references public.client_installations(id) on delete restrict,
  learning_identity_id uuid references public.learning_identities(id) on delete restrict,
  operation_type text not null check (operation_type in ('SUBMIT_ATTEMPT','SESSION_RESUME','SESSION_UPDATE','EVENT_INGEST')),
  idempotency_key text not null,
  status text not null check (status in ('RECEIVED','ACKED','RETRY','REJECTED')),
  response_payload jsonb not null default '{}'::jsonb,
  error_code text,
  attempt_count int not null default 1 check (attempt_count > 0),
  first_received_at timestamptz not null default now(),
  last_received_at timestamptz not null default now(),
  unique(client_installation_id, operation_type, idempotency_key)
);

create index if not exists sync_operation_receipts_identity_idx
  on public.sync_operation_receipts(learning_identity_id, last_received_at desc);

alter table public.sync_operation_receipts enable row level security;

create policy sync_receipts_select on public.sync_operation_receipts
for select to authenticated
using (learning_identity_id is null or public.can_access_learning_identity(learning_identity_id) or public.is_admin());

create policy sync_receipts_admin_write on public.sync_operation_receipts
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Clients do not get direct mutation rights; the server/domain layer records receipts.
revoke insert, update, delete on public.sync_operation_receipts from authenticated;
