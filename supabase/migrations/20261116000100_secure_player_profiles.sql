create sequence if not exists public.player_id_seq
  as bigint
  start with 1
  increment by 1
  no minvalue
  no maxvalue
  cache 1;

revoke all on sequence public.player_id_seq from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  player_id text not null unique,
  display_name text not null check (char_length(trim(display_name)) between 2 and 32),
  avatar text not null default 'AI',
  suit text not null default 'Neon Pulse',
  xp integer not null default 0 check (xp >= 0),
  completed_missions text[] not null default '{}',
  unlocked_worlds text[] not null default '{logic-land}',
  achievements text[] not null default '{First Steps}',
  collectibles text[] not null default '{}',
  settings jsonb not null default '{"sound":true,"music":true,"graphics":"medium"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (
  display_name,
  avatar,
  suit,
  xp,
  completed_missions,
  unlocked_worlds,
  achievements,
  collectibles,
  settings
) on table public.profiles to authenticated;

create policy "Players can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Players can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.create_player_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  player_name text;
begin
  select left(candidate, 32)
  into player_name
  from (
    values
      (nullif(trim(new.raw_user_meta_data ->> 'display_name'), '')),
      (nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')),
      (nullif(trim(new.raw_user_meta_data ->> 'name'), '')),
      (nullif(split_part(coalesce(new.email, 'Engineer'), '@', 1), ''))
  ) as candidates(candidate)
  where char_length(candidate) >= 2
  limit 1;
  player_name := coalesce(player_name, 'Engineer');

  insert into public.profiles (id, player_id, display_name)
  values (
    new.id,
    'CV-MK-' || lpad(nextval('public.player_id_seq')::text, 6, '0'),
    player_name
  );

  return new;
end;
$$;

create trigger on_auth_user_created_create_player_profile
  after insert on auth.users
  for each row execute procedure public.create_player_profile();

insert into public.profiles (id, player_id, display_name)
select
  users.id,
  'CV-MK-' || lpad(nextval('public.player_id_seq')::text, 6, '0'),
  coalesce((
    select left(candidate, 32)
    from (
      values
        (nullif(trim(users.raw_user_meta_data ->> 'display_name'), '')),
        (nullif(trim(users.raw_user_meta_data ->> 'full_name'), '')),
        (nullif(trim(users.raw_user_meta_data ->> 'name'), '')),
        (nullif(split_part(coalesce(users.email, 'Engineer'), '@', 1), ''))
    ) as candidates(candidate)
    where char_length(candidate) >= 2
    limit 1
  ), 'Engineer')
from auth.users as users
left join public.profiles as profiles on profiles.id = users.id
where profiles.id is null;

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_profile_updated_at();
