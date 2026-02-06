-- PHASE 1: COUPON MANAGEMENT SCHEMA
-- Run this in your Supabase Dashboard > SQL Editor

-- 1. CREATE COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
    discount_value numeric NOT NULL,
    min_order numeric DEFAULT 0,
    max_discount numeric, -- Only for percentage type
    expiry_date timestamp with time zone,
    is_active boolean DEFAULT true,
    usage_limit integer,
    usage_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. ENABLE RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES
-- Admin: Full Access
DROP POLICY IF EXISTS "Admin Full access Coupons" ON public.coupons;
CREATE POLICY "Admin Full access Coupons" ON public.coupons
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Public: Read-only (but only if active and not expired)
-- Note: In a real app, you might want to wrap this in an RPC to prevent brute-forcing codes,
-- but for now, simple read with filters is OK for MVP.
DROP POLICY IF EXISTS "Public View Active Coupons" ON public.coupons;
CREATE POLICY "Public View Active Coupons" ON public.coupons
    FOR SELECT
    USING (is_active = true AND (expiry_date IS NULL OR expiry_date > now()));
