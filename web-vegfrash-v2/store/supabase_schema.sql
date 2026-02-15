-- Enable RLS (Skipped for auth.users as it is system managed)

-- 1. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  image text, -- Emoji or URL
  color text default '#f3e8ff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.categories enable row level security;

-- Policies for Categories
drop policy if exists "Public Read Categories" on public.categories;
create policy "Public Read Categories" on public.categories for select using (true);

drop policy if exists "Admin All Categories" on public.categories;
create policy "Admin All Categories" on public.categories for all using (auth.role() = 'authenticated');

-- 2. PRODUCTS TABLE
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  weight text not null,
  price numeric not null,
  old_price numeric,
  image text,
  category_id uuid references public.categories(id),
  in_stock boolean default true,
  is_ad boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.products enable row level security;

-- Policies for Products
drop policy if exists "Public Read Products" on public.products;
create policy "Public Read Products" on public.products for select using (true);

drop policy if exists "Admin All Products" on public.products;
create policy "Admin All Products" on public.products for all using (auth.role() = 'authenticated');

-- 3. SITE SETTINGS (Themes & Banners)
create table if not exists public.site_settings (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  value text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.site_settings enable row level security;

-- Policies for Settings
drop policy if exists "Public Read Settings" on public.site_settings;
create policy "Public Read Settings" on public.site_settings for select using (true);

drop policy if exists "Admin All Settings" on public.site_settings;
create policy "Admin All Settings" on public.site_settings for all using (auth.role() = 'authenticated');

-- 4. ORDERS (Simplified)
create table if not exists public.orders (
  id text primary key, -- Custom ID like ORD-123
  customer_name text,
  status text default 'pending', -- pending, packed, out_for_delivery, delivered
  total numeric not null,
  items jsonb, -- Storing items as JSON for simplicity in MVP
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.orders enable row level security;

-- Policies for Orders
drop policy if exists "Admin All Orders" on public.orders;
create policy "Admin All Orders" on public.orders for all using (auth.role() = 'authenticated');

-- Insert default categories (Safe insert using ON CONFLICT)
insert into public.categories (name, slug, image, color) values
('Fruits & Vegetables', 'fruits-vegetables', '🥕', '#dcfce7'),
('Dairy, Bread & Eggs', 'dairy-bread-eggs', '🥛', '#f3e8ff'),
('Snacks & Munchies', 'snacks-munchies', '🍟', '#fef3c7')
on conflict (slug) do nothing;

-- 5. STORAGE BUCKETS
insert into storage.buckets (id, name, public) 
values ('products', 'products', true)
on conflict (id) do nothing;

-- Policies for Storage (Drop first to avoid errors)
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'products' );

drop policy if exists "Admin Upload" on storage.objects;
create policy "Admin Upload" on storage.objects for insert with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

drop policy if exists "Admin Update" on storage.objects;
create policy "Admin Update" on storage.objects for update using ( bucket_id = 'products' and auth.role() = 'authenticated' );

drop policy if exists "Admin Delete" on storage.objects;
create policy "Admin Delete" on storage.objects for delete using ( bucket_id = 'products' and auth.role() = 'authenticated' );
