create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- feeding_schedule
create table if not exists public.feeding_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  time timestamptz not null,
  portion integer not null check (portion > 0 and portion <= 10),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- feeding_history
create table if not exists public.feeding_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feeding_time timestamptz not null,
  portion integer not null check (portion > 0 and portion <= 10),
  method text not null check (method in ('manual','automatic')),
  created_at timestamptz not null default now()
);

-- device_status
create table if not exists public.device_status (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('online','offline')),
  last_fed timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- RLS
alter table public.feeding_schedule enable row level security;
alter table public.feeding_history enable row level security;
alter table public.device_status enable row level security;

drop policy if exists "own_feeding_schedule_all" on public.feeding_schedule;
create policy "own_feeding_schedule_all" on public.feeding_schedule
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_feeding_history_all" on public.feeding_history;
create policy "own_feeding_history_all" on public.feeding_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_device_status_all" on public.device_status;
create policy "own_device_status_all" on public.device_status
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- indexes
create index if not exists idx_feeding_schedule_user_id on public.feeding_schedule(user_id);
create index if not exists idx_feeding_schedule_time on public.feeding_schedule(time);
create index if not exists idx_feeding_history_user_id on public.feeding_history(user_id);
create index if not exists idx_feeding_history_time on public.feeding_history(feeding_time);
create index if not exists idx_device_status_user_id on public.device_status(user_id);

-- updated_at triggers
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_feeding_schedule_updated on public.feeding_schedule;
create trigger trg_feeding_schedule_updated before update on public.feeding_schedule
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_device_status_updated on public.device_status;
create trigger trg_device_status_updated before update on public.device_status
for each row execute procedure public.set_updated_at();
