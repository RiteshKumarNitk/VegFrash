-- PHASE 4: STAFF & ROLE-BASED ACCESS
-- Run this in your Supabase Dashboard > SQL Editor

-- 1. CREATE STAFF PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'packer', 'delivery')),
    phone text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. ENABLE RLS
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES
-- Admin: Full Access
DROP POLICY IF EXISTS "Admin Full access Staff" ON public.staff_profiles;
CREATE POLICY "Admin Full access Staff" ON public.staff_profiles
    FOR ALL
    USING (auth.role() = 'authenticated');

-- 4. HELPER FUNCTION TO GET ROLE
-- This can be used in RLS of other tables later
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text AS $$
    SELECT role FROM public.staff_profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
