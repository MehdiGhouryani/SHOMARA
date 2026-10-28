-- Deep security remediation: runtime facts and Learning Truth are server-authoritative.
-- The mobile/web clients use Learning Runtime APIs; they do not write runtime tables directly.

revoke insert, update, delete on public.mission_instances from authenticated;
revoke insert, update, delete on public.sessions from authenticated;
revoke insert, update, delete on public.encounters from authenticated;
revoke insert, update, delete on public.attempts from authenticated;
revoke insert, update, delete on public.answers from authenticated;
revoke insert, update, delete on public.evidence from authenticated;
revoke insert, update, delete on public.learning_states from authenticated;
revoke insert, update, delete on public.learning_decisions from authenticated;
revoke insert, update, delete on public.learning_plans from authenticated;
revoke insert, update, delete on public.station_check_results from authenticated;

comment on table public.attempts is 'Client-readable runtime fact; writes are server-authoritative through Learning Runtime.';
comment on table public.answers is 'Client-readable runtime fact; writes are server-authoritative through Learning Runtime.';
comment on table public.learning_states is 'Canonical Learning Truth; client writes are forbidden.';
