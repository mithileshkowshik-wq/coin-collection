-- Coin Collection Tracker — database schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query → paste → Run).

create table if not exists public.coins (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  year integer,
  denomination text,          -- e.g. "1 Dollar"
  currency_name text,         -- e.g. "US Dollar"
  mint_mark text,
  material text,              -- e.g. "Silver .900"
  weight_g numeric(10, 3),
  diameter_mm numeric(10, 2),
  grade text,                 -- e.g. "MS-63", "VF", "AU"
  quantity integer not null default 1,
  estimated_value numeric(12, 2),
  value_currency text default 'USD',
  acquired_date date,
  acquired_place text,
  acquired_price numeric(12, 2),
  notes text,
  numista_id integer,         -- matched Numista catalog entry (Phase 3)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coin_photos (
  id uuid primary key default gen_random_uuid(),
  coin_id uuid not null references public.coins (id) on delete cascade,
  photo_url text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists coin_photos_coin_id_idx on public.coin_photos (coin_id);

-- Keep updated_at current on edits
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists coins_set_updated_at on public.coins;
create trigger coins_set_updated_at
  before update on public.coins
  for each row execute function public.set_updated_at();

-- Row Level Security: any signed-in user has full access (single-family app).
alter table public.coins enable row level security;
alter table public.coin_photos enable row level security;

drop policy if exists "authenticated full access" on public.coins;
create policy "authenticated full access" on public.coins
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated full access" on public.coin_photos;
create policy "authenticated full access" on public.coin_photos
  for all to authenticated using (true) with check (true);

-- Storage bucket for coin photos (Phase 2). Public read so <img> tags work;
-- writes require a signed-in user.
insert into storage.buckets (id, name, public)
values ('coin-photos', 'coin-photos', true)
on conflict (id) do nothing;

drop policy if exists "authenticated upload coin photos" on storage.objects;
create policy "authenticated upload coin photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'coin-photos');

drop policy if exists "authenticated update coin photos" on storage.objects;
create policy "authenticated update coin photos" on storage.objects
  for update to authenticated using (bucket_id = 'coin-photos');

drop policy if exists "authenticated delete coin photos" on storage.objects;
create policy "authenticated delete coin photos" on storage.objects
  for delete to authenticated using (bucket_id = 'coin-photos');

drop policy if exists "public read coin photos" on storage.objects;
create policy "public read coin photos" on storage.objects
  for select using (bucket_id = 'coin-photos');
