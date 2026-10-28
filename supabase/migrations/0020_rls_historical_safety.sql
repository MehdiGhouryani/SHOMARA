-- Explicitly deny client DELETE on historical records by providing no DELETE policies.
-- Admin may perform controlled maintenance through the server/service role and audited workflows.

revoke delete on public.evidence from authenticated;
revoke delete on public.evidence_validity_records from authenticated;
revoke delete on public.interpretations from authenticated;
revoke delete on public.sessions from authenticated;
revoke delete on public.encounters from authenticated;
revoke delete on public.attempts from authenticated;
revoke delete on public.answers from authenticated;
