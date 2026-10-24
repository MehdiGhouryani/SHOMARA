-- P08 Avatar customization. Appearance is authoritative; ownership comes from collection grants (P07).
-- Child avatar ≠ companion cast. Client cannot invent owned cosmetics.

insert into public.reward_catalog(code, reward_type, payload, status) values
  ('G1-R-COS-OUTFIT-STAR','CHARACTER_COSMETIC','{"cosmeticId":"cosmetic-outfit-star","assetRef":"avatar/outfit/star"}','ACTIVE'),
  ('G1-R-COS-HAT-EXPLORER','CHARACTER_COSMETIC','{"cosmeticId":"cosmetic-hat-explorer","assetRef":"avatar/hat/explorer"}','ACTIVE')
on conflict(code) do update set reward_type=excluded.reward_type, payload=excluded.payload, status='ACTIVE';

-- End-to-end unlock path (no rewrite of ST01 sticker):
-- complete ST01 challenge → G1-R-ST01-CH grant → cosmetic-bg-pattern owned in workshop.
-- Milestone badge → G1-R-BADGE-MILESTONE → cosmetic-acc-badge.
-- Explicit cosmetic rewards G1-R-COS-* available for future grants / admin seeds.

create table if not exists public.avatar_appearance_p08 (
  learning_identity_id uuid primary key references public.learning_identities(id) on delete restrict,
  base_preset_id text not null default 'sun' check (base_preset_id in ('sun','leaf','cloud','moon')),
  outfit_id text,
  hat_id text,
  accessory_id text,
  background_id text,
  updated_at timestamptz not null default now()
);

alter table public.avatar_appearance_p08 enable row level security;
create policy avatar_appearance_p08_read on public.avatar_appearance_p08
  for select to authenticated using (public.can_access_learning_identity(learning_identity_id));
revoke insert, update, delete on public.avatar_appearance_p08 from authenticated;

create or replace function public.avatar_owned_reward_codes(p_identity uuid)
returns text[]
language sql stable security definer set search_path = public, pg_catalog as $$
  select coalesce(array_agg(distinct reward_code), '{}')
  from public.collection_grant_presentations_p07
  where learning_identity_id = p_identity;
$$;

create or replace function public.avatar_workshop_projection()
returns jsonb
language plpgsql stable security definer set search_path = public, pg_catalog as $$
declare
  v_identity public.learning_identities;
  v_app public.avatar_appearance_p08;
  v_owned text[];
begin
  v_identity := public.collection_current_identity();
  select * into v_app from public.avatar_appearance_p08 where learning_identity_id = v_identity.id;
  v_owned := public.avatar_owned_reward_codes(v_identity.id);

  return jsonb_build_object(
    'engineVersion', '2026-10-05-p08-v1',
    'appearance', jsonb_build_object(
      'basePresetId', coalesce(v_app.base_preset_id, 'sun'),
      'outfitId', v_app.outfit_id,
      'hatId', v_app.hat_id,
      'accessoryId', v_app.accessory_id,
      'backgroundId', v_app.background_id,
      'updatedAt', v_app.updated_at
    ),
    'ownedRewardCodes', to_jsonb(v_owned),
    'companionCastExcluded', true,
    'setsMastery', false,
    'impliesMoneyValue', false
  );
end $$;

create or replace function public.avatar_save_appearance(
  p_base_preset_id text,
  p_outfit_id text default null,
  p_hat_id text default null,
  p_accessory_id text default null,
  p_background_id text default null,
  p_now timestamptz default now()
)
returns jsonb
language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  v_identity public.learning_identities;
  v_owned text[];
  v_ok boolean;
begin
  v_identity := public.collection_current_identity();
  v_owned := public.avatar_owned_reward_codes(v_identity.id);

  if p_base_preset_id is null or p_base_preset_id not in ('sun','leaf','cloud','moon') then
    raise exception using errcode = 'P0001', message = 'INVALID_BASE_PRESET';
  end if;

  -- Ownership checks for non-null equip slots (starter items allowed without grant)
  if p_outfit_id is not null and p_outfit_id not in ('cosmetic-outfit-default')
     and not ('G1-R-COS-OUTFIT-STAR' = any (v_owned) and p_outfit_id = 'cosmetic-outfit-star') then
    raise exception using errcode = 'P0001', message = 'COSMETIC_NOT_OWNED:outfit';
  end if;
  if p_hat_id is not null and p_hat_id not in ('cosmetic-hat-none')
     and not ('G1-R-COS-HAT-EXPLORER' = any (v_owned) and p_hat_id = 'cosmetic-hat-explorer') then
    raise exception using errcode = 'P0001', message = 'COSMETIC_NOT_OWNED:hat';
  end if;
  if p_accessory_id is not null and p_accessory_id not in ('cosmetic-acc-none')
     and not ('G1-R-BADGE-MILESTONE' = any (v_owned) and p_accessory_id = 'cosmetic-acc-badge') then
    raise exception using errcode = 'P0001', message = 'COSMETIC_NOT_OWNED:accessory';
  end if;
  if p_background_id is not null and p_background_id not in ('cosmetic-bg-default')
     and not ('G1-R-ST01-CH' = any (v_owned) and p_background_id = 'cosmetic-bg-pattern') then
    raise exception using errcode = 'P0001', message = 'COSMETIC_NOT_OWNED:background';
  end if;

  insert into public.avatar_appearance_p08 as a
    (learning_identity_id, base_preset_id, outfit_id, hat_id, accessory_id, background_id, updated_at)
  values (v_identity.id, p_base_preset_id, p_outfit_id, p_hat_id, p_accessory_id, p_background_id, p_now)
  on conflict (learning_identity_id) do update set
    base_preset_id = excluded.base_preset_id,
    outfit_id = excluded.outfit_id,
    hat_id = excluded.hat_id,
    accessory_id = excluded.accessory_id,
    background_id = excluded.background_id,
    updated_at = excluded.updated_at;

  return public.avatar_workshop_projection();
end $$;

revoke all on function public.avatar_owned_reward_codes(uuid) from public;
revoke all on function public.avatar_workshop_projection() from public;
revoke all on function public.avatar_save_appearance(text, text, text, text, text, timestamptz) from public;
grant execute on function public.avatar_workshop_projection() to authenticated;
grant execute on function public.avatar_save_appearance(text, text, text, text, text, timestamptz) to authenticated;
