# B0 — Staging apply checklist (human)

Do this once per staging project. Do **not** commit secrets.

## Preconditions
- [ ] Supabase project created (staging)
- [ ] `supabase` CLI logged in or CI role available
- [ ] OTP provider configured for staging only

## Apply
```bash
# from repo root
supabase db push
# or: supabase migration up
```

Expected: migrations **0001 → 0073** apply cleanly.

## Smoke RPCs (SQL editor or service role)

1. **Progression** (replace identity as appropriate)
```sql
-- expect jsonb with completedStationIds / jumpUnlockedStationIds keys
select public.runtime_get_progression_snapshot(/* params per 0054 signature */);
```

2. **Challenge start** (after a valid learning session exists)
```sql
-- exercise runtime_start_challenge with ST02 definition id from seeds
```

3. **Presentation**
```sql
-- challenge_run_view must return presentation title/options without expectedAnswers
```

## Record
- [ ] Date / operator  
- [ ] Last migration version on staging = 0073  
- [ ] PASS/FAIL notes for ST01 session + ST02 challenge  

## Gate
B0 is **fully closed** only when:
1. `node scripts/verify-backend-b0-foundation.mjs` → PASS (repo)
2. This checklist smoke → PASS (staging)
