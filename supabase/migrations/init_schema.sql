-- Extensions
create extension if not exists pgcrypto;

-- Profiles: link to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamp with time zone default now()
);

-- Preferences
create table if not exists public.preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  theme text not null default 'light' check (theme in ('light','dark')),
  notifications boolean not null default true,
  time_window text not null default '06:00-18:00',
  updated_at timestamp with time zone default now()
);

-- Locations
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text,
  latitude numeric not null,
  longitude numeric not null,
  is_default boolean not null default false,
  created_at timestamp with time zone default now(),
  constraint one_default_per_user unique (user_id, is_default)
);

-- Push subscriptions
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default now(),
  constraint unique_subscription_per_user unique (user_id, endpoint)
);

-- Weather snapshots
create table if not exists public.weather_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  latitude numeric not null,
  longitude numeric not null,
  snapshot_at timestamp with time zone not null,
  data jsonb not null,
  created_at timestamp with time zone default now()
);

-- Alerts log
create table if not exists public.alerts_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  alert_type text not null,
  message text,
  sent_at timestamp with time zone default now()
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.preferences enable row level security;
alter table public.locations enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.weather_snapshots enable row level security;
alter table public.alerts_log enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Generic own-row policies
create policy "preferences_all_own" on public.preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "locations_all_own" on public.locations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push_subscriptions_all_own" on public.push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weather_snapshots_all_own" on public.weather_snapshots for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "alerts_log_all_own" on public.alerts_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

