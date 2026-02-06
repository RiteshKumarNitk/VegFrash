-- ==========================================
-- VEGFRASH LEAN MASTER SCHEMA RESET SCRIPT
-- ==========================================
-- This version contains ONLY fields used in the codebase.
-- It is idempotent (safe to run multiple times).

-- 0. DROP EXISTING TABLES (CAUTION: DATA LOSS)
-- This section wipes out everything for a truly clean slate.
DROP TABLE IF EXISTS public.inventory_batches CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.customer_addresses CASCADE;
DROP TABLE IF EXISTS public.delivery_partners CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;

-- Additional unused tables from your screenshot
DROP TABLE IF EXISTS public.active_themes CASCADE;
DROP TABLE IF EXISTS public.festival_calendar CASCADE;
DROP TABLE IF EXISTS public.inventory_logs CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;

-- Reset sequences
DROP SEQUENCE IF EXISTS orders_order_number_seq;

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SEQUENCES
CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq;

-- 2. CORE TABLES

-- 2.1 Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'rider', 'store_manager', 'admin')),
  phone TEXT UNIQUE NOT NULL,
  email TEXT, 
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image TEXT, -- Can be emoji or URL
  color TEXT DEFAULT '#f3e8ff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  old_price DECIMAL(10, 2),
  weight TEXT, -- e.g. "500g", "1 unit"
  image TEXT,
  images TEXT[], -- Array of extra images
  total_stock INTEGER DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  service_availability JSONB DEFAULT '["today", "tomorrow"]'::JSONB,
  discount_config JSONB, -- {type, value, label}
  tags TEXT[],
  customer_rating DECIMAL(2,1) DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Locations
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- 2.5 Inventory Batches (Used in web-store inventory page)
CREATE TABLE IF NOT EXISTS public.inventory_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id),
  batch_code TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  expiry_grade TEXT CHECK (expiry_grade IN ('A', 'B', 'C')) DEFAULT 'A',
  quantity_kg DECIMAL(10, 3) DEFAULT 0
);

-- 2.6 Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  order_number INTEGER NOT NULL DEFAULT nextval('orders_order_number_seq'),
  customer_name TEXT, -- Fallback
  status TEXT DEFAULT 'pending', -- pending, picking, packed, out_for_delivery, delivered, cancelled
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_address_snapshot JSONB, -- Stores full address at time of order
  items JSONB, -- Redundant but used in some UI views for speed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  product_id UUID REFERENCES public.products(id),
  quantity DECIMAL(10, 3) DEFAULT 1,
  unit TEXT, -- 'kg' or 'unit'
  price DECIMAL(10, 2), -- Price at time of order
  price_at_time DECIMAL(10, 2) -- Alternate field name compatibility
);

-- 2.8 Customer Addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  full_address_text TEXT NOT NULL,
  address_label TEXT CHECK (address_label IN ('Home', 'Work', 'Other', 'Friends_Family')),
  receiver_name TEXT,
  receiver_phone TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 Delivery Partners
CREATE TABLE IF NOT EXISTS public.delivery_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT,
  phone TEXT UNIQUE NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  current_order_id UUID REFERENCES public.orders(id),
  earnings_today DECIMAL(10, 2) DEFAULT 0,
  -- Registration Fields
  dob TEXT,
  blood_group TEXT,
  vehicle_type TEXT,
  vehicle_model TEXT,
  vehicle_plate_number TEXT,
  aadhar_number TEXT,
  pan_number TEXT,
  driving_license_number TEXT,
  bank_account_number TEXT,
  ifsc_code TEXT,
  is_kyc_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3.1 Public Read
CREATE POLICY "Public select" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public select" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public select" ON public.site_settings FOR SELECT USING (true);

-- 3.2 User Access
CREATE POLICY "Own account" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own addresses" ON public.customer_addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Rider self" ON public.delivery_partners FOR ALL USING (auth.uid() = user_id);

-- 3.3 Admin Access (Simplified)
CREATE POLICY "Admin manage" ON public.products FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage" ON public.categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage" ON public.orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage" ON public.site_settings FOR ALL TO authenticated USING (true);

-- 4. RPC FUNCTIONS

-- Save Single Setting
CREATE OR REPLACE FUNCTION save_site_setting(setting_key text, setting_value jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.site_settings (key, value)
  VALUES (setting_key, setting_value)
  ON CONFLICT (key)
  DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
END;
$$;

-- Save Settings Bulk
CREATE OR REPLACE FUNCTION save_site_settings_bulk(settings jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  setting_item jsonb;
BEGIN
  FOR setting_item IN SELECT * FROM jsonb_array_elements(settings)
  LOOP
    INSERT INTO public.site_settings (key, value)
    VALUES (setting_item->>'key', setting_item->'value')
    ON CONFLICT (key)
    DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
  END LOOP;
END;
$$;

-- 5. GRANTS
GRANT EXECUTE ON FUNCTION save_site_setting(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION save_site_settings_bulk(jsonb) TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 6. SEED DATA
INSERT INTO public.categories (name, slug, image, color) VALUES
('Paan Corner', 'paan-corner', '🍃', '#dcfce7'),
('Dairy, Bread & Eggs', 'dairy-bread-eggs', '🥛', '#f3e8ff'),
('Vegetables', 'vegetables', '🥦', '#dcfce7'),
('Fruits', 'fruits', '🍎', '#fee2e2'),
('Cold Drinks & Juices', 'cold-drinks-juices', '🥤', '#e0f2fe'),
('Snacks & Munchies', 'snacks-munchies', '🍟', '#fef3c7')
ON CONFLICT (slug) DO NOTHING;
