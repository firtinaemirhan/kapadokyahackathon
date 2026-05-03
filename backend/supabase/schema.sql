create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company_name text not null,
  email text not null unique,
  role text not null default 'both' check (role in ('producer', 'buyer', 'both')),
  city text not null default 'Nevşehir',
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.product_types (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  byproducts text[] not null default '{}',
  is_agricultural boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  listing_type text not null default 'sell' check (listing_type in ('sell', 'buy')),
  title text not null,
  category text not null,
  city text not null,
  district text,
  seller text not null,
  tonnage numeric not null check (tonnage > 0),
  price_per_ton_try numeric not null check (price_per_ton_try >= 0),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  description text not null,
  image text not null default 'ceramic',
  vehicle text not null default 'truck' check (vehicle in ('truck', 'van', 'rail', 'sea', 'buyer')),
  is_user_created boolean not null default true,
  contact_email text,
  contact_phone text,
  created_by text,
  created_at timestamptz not null default now()
);

-- Mevcut tabloya kolon eklemek için (schema zaten çalıştırılmışsa)
alter table public.listings add column if not exists listing_type text not null default 'sell' check (listing_type in ('sell', 'buy'));
alter table public.listings drop constraint if exists listings_vehicle_check;
alter table public.listings add constraint listings_vehicle_check check (vehicle in ('truck', 'van', 'rail', 'sea', 'buyer'));

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null,
  listing_title text not null,
  seller text not null,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text,
  quantity_ton numeric not null check (quantity_ton > 0),
  note text not null,
  buyer_location_label text,
  distance_km numeric,
  co2_kg numeric,
  offer_unit_price_try numeric,
  material_total_try numeric,
  transport_cost_try numeric,
  total_cost_try numeric,
  vehicle text,
  created_at timestamptz not null default now()
);

alter table public.contact_requests add column if not exists buyer_location_label text;
alter table public.contact_requests add column if not exists distance_km numeric;
alter table public.contact_requests add column if not exists co2_kg numeric;
alter table public.contact_requests add column if not exists offer_unit_price_try numeric;
alter table public.contact_requests add column if not exists material_total_try numeric;
alter table public.contact_requests add column if not exists transport_cost_try numeric;
alter table public.contact_requests add column if not exists total_cost_try numeric;
alter table public.contact_requests add column if not exists vehicle text;

create index if not exists idx_product_types_agricultural on public.product_types(is_agricultural);
create index if not exists idx_product_types_name on public.product_types(product_name);
create index if not exists idx_listings_created_at on public.listings(created_at desc);
create index if not exists idx_listings_category on public.listings(category);
create index if not exists idx_listings_city on public.listings(city);
create index if not exists idx_contact_requests_listing_id on public.contact_requests(listing_id);

alter table public.profiles enable row level security;
alter table public.product_types enable row level security;
alter table public.listings enable row level security;
alter table public.contact_requests enable row level security;

drop policy if exists "profiles_demo_public_read" on public.profiles;
create policy "profiles_demo_public_read" on public.profiles for select using (true);

drop policy if exists "profiles_demo_public_insert" on public.profiles;
create policy "profiles_demo_public_insert" on public.profiles for insert with check (true);

drop policy if exists "profiles_demo_public_update" on public.profiles;
create policy "profiles_demo_public_update" on public.profiles for update using (true) with check (true);

drop policy if exists "product_types_demo_public_read" on public.product_types;
create policy "product_types_demo_public_read" on public.product_types for select using (is_agricultural = true);

drop policy if exists "product_types_demo_public_insert" on public.product_types;
create policy "product_types_demo_public_insert" on public.product_types for insert with check (is_agricultural = true);

drop policy if exists "listings_demo_public_read" on public.listings;
create policy "listings_demo_public_read" on public.listings for select using (true);

drop policy if exists "listings_demo_public_insert" on public.listings;
create policy "listings_demo_public_insert" on public.listings for insert with check (is_user_created = true);

drop policy if exists "listings_demo_public_delete" on public.listings;
create policy "listings_demo_public_delete" on public.listings for delete using (is_user_created = true);

drop policy if exists "contact_requests_demo_public_read" on public.contact_requests;
create policy "contact_requests_demo_public_read" on public.contact_requests for select using (true);

drop policy if exists "contact_requests_demo_public_insert" on public.contact_requests;
create policy "contact_requests_demo_public_insert" on public.contact_requests for insert with check (true);
