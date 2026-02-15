-- Ensure Rider Columns in Orders Table
-- This script adds the necessary columns for assigning riders to orders.

-- 1. Create Staff Profiles table if for some reason it doesn't exist (it should)
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name text NOT NULL,
    role text NOT NULL, -- 'admin', 'packer', 'delivery'
    phone text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Add columns to Orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rider_id uuid REFERENCES public.staff_profiles(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rider_assigned_at timestamp with time zone;

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON public.orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_role_active ON public.staff_profiles(role, is_active);

-- 4. Enable RLS on staff_profiles if not already active
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Admin/Staff only)
DROP POLICY IF EXISTS "Staff Full Access" ON public.staff_profiles;
CREATE POLICY "Staff Full Access" ON public.staff_profiles
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
