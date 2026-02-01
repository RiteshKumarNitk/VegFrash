-- Ensure site_settings table exists
create table if not exists site_settings (
  key text primary key,
  value jsonb
);

-- Turn on RLS
alter table site_settings enable row level security;

-- Policies
create policy "Public read access"
  on site_settings for select
  to anon, authenticated
  using (true);

create policy "Admin full access"
  on site_settings for all
  to authenticated
  using (true)
  with check (true);

-- Insert default theme config if not exists
insert into site_settings (key, value)
values (
  'theme_config', 
  '{
    "festival_mode": false,
    "banner_text": "GRAND FESTIVAL SALE IS LIVE! Get Flat 50% OFF",
    "promo_code": "FEST50",
    "gradient": "from-orange-500 via-red-500 to-yellow-500"
  }'::jsonb
)
on conflict (key) do nothing;
