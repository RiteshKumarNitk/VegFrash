-- FIX SCRIPT: Run this in Supabase SQL Editor

-- 1. Ensure the table exists and RLS is on
create table if not exists site_settings (
  key text primary key,
  value jsonb
);
alter table site_settings enable row level security;

-- 2. Drop existing policies to prevent "already exists" errors and ensure we have clean state
drop policy if exists "Public read access" on site_settings;
drop policy if exists "Admin full access" on site_settings;

-- 3. Re-create the permissions (Policies) correctly
-- Allow EVERYONE to read (so customers can see the banner)
create policy "Public read access"
  on site_settings for select
  to anon, authenticated
  using (true);

-- Allow ADMINS to edit (so you can save changes)
-- WARNING: This policy allows ANY authenticated user to edit settings.
-- For production, you should restrict this to specific user IDs or a generic 'admin' role.
create policy "Admin full access"
  on site_settings for all
  to authenticated
  using (true)
  with check (true);

-- 4. Initial Data: Create the 'theme_config' row if it is missing
insert into site_settings (key, value)
values (
  'theme_config', 
  '{
    "festival_mode": false,
    "banner_text": "GRAND FESTIVAL SALE IS LIVE!",
    "promo_code": "FEST50",
    "gradient": "from-orange-500 via-red-500 to-yellow-500"
  }'::jsonb
)
on conflict (key) do nothing;
