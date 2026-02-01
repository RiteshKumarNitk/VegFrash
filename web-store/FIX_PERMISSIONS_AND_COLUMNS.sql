-- CRITICAL PERMISSIONS FIX
-- Run this in Supabase Dashboard > SQL Editor to fix "Failed to update status" errors.

-- 1. Grant Full Access to Authenticated Users (Admins/Staff) for ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff Full Access Orders" ON public.orders;
CREATE POLICY "Staff Full Access Orders" ON public.orders
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 2. Grant Full Access to Authenticated Users for ORDER ITEMS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff Full Access Items" ON public.order_items;
CREATE POLICY "Staff Full Access Items" ON public.order_items
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 3. Fix Missing Columns (Just in case)
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS quantity numeric;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS price_at_time numeric;
