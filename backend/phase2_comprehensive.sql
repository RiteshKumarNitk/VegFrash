-- Phase 2: Comprehensive Authentication & Data Capture (Blinkit Standard)
-- Run this in Supabase SQL Editor

-- 1. ENHANCED PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('customer', 'rider', 'store_manager', 'admin')) NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT, 
  avatar_url TEXT,
  fcm_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DETAILED CUSTOMER ADDRESSES
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  lat_long GEOMETRY(Point, 4326) NOT NULL,
  full_address_text TEXT NOT NULL,
  house_flat_no TEXT NOT NULL,
  floor_number TEXT,
  apartment_road_area TEXT,
  landmark TEXT,
  address_label TEXT CHECK (address_label IN ('Home', 'Work', 'Other', 'Friends_Family')),
  receiver_name TEXT,
  receiver_phone TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMPREHENSIVE RIDER DETAILS
-- Since delivery_partners might exist from Phase 1, we ALTER it.

-- Ensure the table exists first (just in case)
CREATE TABLE IF NOT EXISTS delivery_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  current_location GEOMETRY(Point, 4326),
  is_online BOOLEAN DEFAULT FALSE,
  current_order_id UUID REFERENCES orders(id),
  earnings_today DECIMAL(10, 2) DEFAULT 0
);

-- Now ADD columns safely
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Identity
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- KYC
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS aadhar_number TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS aadhar_image_front_url TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS aadhar_image_back_url TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS pan_number TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS pan_image_url TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS driving_license_number TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS dl_image_front_url TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS dl_image_back_url TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS is_kyc_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;

-- Vehicle
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS vehicle_type TEXT; -- Phase 1 might accept any text, Phase 2 we want strictness but existing data might conflict if ENUM. Leaving as TEXT for safety or cast.
-- Note: If Phase 1 used ENUM, we can leave it. If we want new columns:
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS vehicle_plate_number TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS rc_book_image_url TEXT;

-- Banking
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS ifsc_code TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS upi_id TEXT;

-- Operational
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS battery_level INTEGER;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS app_version TEXT;
ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();


-- 4. RLS POLICIES (Drop existing to avoid conflicts/duplicates)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Manage Own Profile" ON profiles;
CREATE POLICY "Manage Own Profile" ON profiles USING (auth.uid() = id);

DROP POLICY IF EXISTS "Manage Own Addresses" ON customer_addresses;
CREATE POLICY "Manage Own Addresses" ON customer_addresses USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Rider View Self" ON delivery_partners;
CREATE POLICY "Rider View Self" ON delivery_partners USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Rider Update Self (Limited)" ON delivery_partners;
CREATE POLICY "Rider Update Self (Limited)" ON delivery_partners FOR UPDATE USING (auth.uid() = user_id);
