create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  category text not null default 'منتجات عامة',
  sku text not null unique,
  price numeric(12, 2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  weight_kg numeric(8, 2) not null default 0.25 check (weight_kg > 0),
  shipping_profile text not null default 'شحن عادي',
  image_url text not null default '/products/shipping-box.svg',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists image_url text not null default '/products/shipping-box.svg';

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  city text not null,
  district text,
  address text,
  product_id text not null,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  payment_method text not null,
  payment_status text not null default 'pending',
  fulfillment_status text not null default 'new',
  carrier text not null,
  tracking_number text not null,
  subtotal numeric(12, 2) not null default 0,
  shipping_amount numeric(12, 2) not null default 0,
  cod_fee numeric(12, 2) not null default 0,
  vat_amount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists fulfillment_status text not null default 'new';

create table if not exists public.app_settings (
  id text primary key default 'packora-ksa',
  language text not null default 'ar-SA',
  country text not null default 'SA',
  currency text not null default 'SAR',
  vat_rate numeric(5, 4) not null default 0.15,
  control_panel_path text not null default '/merchant',
  customer_path text not null default '/customer',
  updated_at timestamptz not null default now()
);

insert into public.app_settings (
  id,
  language,
  country,
  currency,
  vat_rate,
  control_panel_path,
  customer_path
) values (
  'packora-ksa',
  'ar-SA',
  'SA',
  'SAR',
  0.15,
  '/merchant',
  '/customer'
)
on conflict (id) do update set
  language = excluded.language,
  country = excluded.country,
  currency = excluded.currency,
  vat_rate = excluded.vat_rate,
  control_panel_path = excluded.control_panel_path,
  customer_path = excluded.customer_path,
  updated_at = now();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "Public product read" on public.products;
create policy "Public product read"
  on public.products for select
  using (true);

drop policy if exists "Public app settings read" on public.app_settings;
create policy "Public app settings read"
  on public.app_settings for select
  using (true);

drop policy if exists "Public product insert for dashboard" on public.products;
drop policy if exists "Public order insert for checkout" on public.orders;
drop policy if exists "Public order read for dashboard" on public.orders;
drop policy if exists "Public app settings update for dashboard" on public.app_settings;

-- Product and order writes are performed by Next.js route handlers using
-- SUPABASE_SERVICE_ROLE_KEY. Do not expose the service role key to browsers.
