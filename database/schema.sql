-- =============================================================
-- NEXORA MART — Supabase schema
-- Run this in the Supabase SQL Editor (once).
-- =============================================================

-- Extensions ------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================
-- PROFILES
-- =============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  address     jsonb,
  role        text not null default 'customer'
              check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- PRODUCTS
-- =============================================================
create table if not exists public.products (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  description       text,
  price             numeric(10, 2) not null check (price >= 0),
  compare_at_price  numeric(10, 2) check (compare_at_price >= 0),
  category          text,
  image_url         text,
  stock             integer not null default 0 check (stock >= 0),
  rating            numeric(2, 1) not null default 4.5
                    check (rating >= 0 and rating <= 5),
  featured          boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_featured_idx on public.products (featured);
create index if not exists products_created_at_idx on public.products (created_at desc);

-- =============================================================
-- ORDERS
-- =============================================================
create table if not exists public.orders (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  status            text not null default 'pending'
                    check (status in ('pending','processing','shipped','delivered','cancelled')),
  payment_method    text not null default 'cod',
  notes             text,
  subtotal          numeric(10, 2) not null default 0,
  shipping          numeric(10, 2) not null default 0,
  tax               numeric(10, 2) not null default 0,
  total             numeric(10, 2) not null default 0,
  shipping_address  jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- =============================================================
-- ORDER ITEMS
-- =============================================================
create table if not exists public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  name        text not null,
  price       numeric(10, 2) not null,
  quantity    integer not null check (quantity > 0),
  created_at  timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- =============================================================
-- WISHLISTS
-- =============================================================
create table if not exists public.wishlists (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists wishlists_user_id_idx on public.wishlists (user_id);

-- =============================================================
-- updated_at helper trigger
-- =============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- =============================================================
-- Stock decrement RPC (used by the server after placing an order)
-- =============================================================
create or replace function public.decrement_stock(p_id uuid, p_qty integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
     set stock = greatest(0, stock - p_qty)
   where id = p_id;
end;
$$;

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlists   enable row level security;

-- ---------- PROFILES ----------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ---------- PRODUCTS ----------
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ---------- ORDERS ----------
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);

-- ---------- ORDER ITEMS ----------
drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- ---------- WISHLISTS ----------
drop policy if exists "wishlists_select_own" on public.wishlists;
create policy "wishlists_select_own" on public.wishlists
  for select using (auth.uid() = user_id);

drop policy if exists "wishlists_insert_own" on public.wishlists;
create policy "wishlists_insert_own" on public.wishlists
  for insert with check (auth.uid() = user_id);

drop policy if exists "wishlists_delete_own" on public.wishlists;
create policy "wishlists_delete_own" on public.wishlists
  for delete using (auth.uid() = user_id);

-- =============================================================
-- SEED DATA (optional — delete if you don't want it)
-- =============================================================
insert into public.products
  (name, description, price, compare_at_price, category, image_url, stock, rating, featured)
values
  ('Aurora Wireless Headphones',
   'Immersive over-ear sound with active noise cancellation and 40-hour battery.',
   149.99, 199.99, 'Electronics',
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
   40, 4.8, true),

  ('Nova Smart Watch',
   'Fitness tracking, heart-rate monitoring and AMOLED display in a slim case.',
   199.00, 249.00, 'Electronics',
   'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
   30, 4.6, true),

  ('Lumen Desk Lamp',
   'Minimal aluminium desk lamp with 5 colour temperatures and USB-C charging.',
   69.00, null, 'Home',
   'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
   60, 4.4, false),

  ('Trail Running Sneakers',
   'Lightweight mesh upper with responsive foam midsole — built for the long run.',
   119.00, 139.00, 'Fashion',
   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
   25, 4.7, true),

  ('Everyday Leather Backpack',
   'Full-grain leather backpack with padded laptop sleeve and lifetime warranty.',
   179.00, 219.00, 'Fashion',
   'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
   18, 4.9, true),

  ('Ceramic Pour-Over Set',
   'Hand-glazed ceramic dripper, carafe and reusable filter for the perfect brew.',
   54.00, null, 'Home',
   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
   45, 4.5, false),

  ('Vitamin C Glow Serum',
   'Brightening 15% vitamin C serum with hyaluronic acid and ferulic acid.',
   39.99, 49.99, 'Beauty',
   'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
   80, 4.7, false),

  ('Yoga Mat Pro',
   'Extra-thick non-slip yoga mat with alignment lines, 6mm cushioning.',
   49.00, null, 'Sports',
   'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80',
   70, 4.4, false)
on conflict do nothing;