-- Phase 2: Authentication & Profiles
-- Run this in Supabase SQL Editor

-- 1. Create Profiles Table (Public Profile for all users)
-- This links to Supabase Auth.users via id
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('customer', 'rider', 'store_manager', 'admin')),
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customer Specific Fields (Address)
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT DEFAULT 'Bangalore',
  pincode TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  lat_long GEOMETRY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Update Delivery Partners (Rider Specifics)
-- We link existing delivery_partners table to auth.users
ALTER TABLE delivery_partners 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
ADD COLUMN IF NOT EXISTS license_url TEXT;

-- 4. Triggers to auto-create profile on signup (Optional but recommended)
-- This assumes you use Supabase Auth triggers, but for now we'll handle creation in App code for simplicity.

-- 5. Helper Policies (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can manage own profile" ON profiles
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Public can read basic profile info (optional, restrict if needed)
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);


-- QUERIES YOU WILL USE IN APP:

-- A. Register New Customer
-- 1. SignUp (Auth) -> Get ID
-- 2. INSERT INTO profiles (id, full_name, role, phone) VALUES (...)
-- 3. INSERT INTO customer_addresses (user_id, address_line1...) VALUES (...)

-- B. Register New Rider
-- 1. SignUp (Auth) -> Get ID
-- 2. INSERT INTO profiles (id, full_name, role='rider') VALUES (...)
-- 3. INSERT INTO delivery_partners (user_id, phone, vehicle_number...) VALUES (...)

-- C. Store Login
-- 1. Admin manually creates a user in Supabase Dashboard with role='store_manager'
-- 2. Web Store app checks: SELECT role FROM profiles WHERE id = auth.uid()
