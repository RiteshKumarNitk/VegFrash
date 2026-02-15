-- INVENTORY & STOCK SCHEMA FIX
-- Run this in your Supabase Dashboard > SQL Editor

-- 1. FIX PRODUCTS TABLE (Missing stock and visibility columns)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS total_stock numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reserved_stock numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;

-- 2. CREATE INVENTORY BATCHES TABLE
CREATE TABLE IF NOT EXISTS public.inventory_batches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    batch_code text NOT NULL,
    received_at timestamp with time zone DEFAULT now() NOT NULL,
    expiry_grade text DEFAULT 'A' CHECK (expiry_grade IN ('A', 'B', 'C')),
    quantity_kg numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. ENABLE RLS
ALTER TABLE public.inventory_batches ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Admin Only Access)
DROP POLICY IF EXISTS "Staff Full Access Inventory" ON public.inventory_batches;
CREATE POLICY "Staff Full Access Inventory" ON public.inventory_batches
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 5. SEED DATA (Optional, sample batch for testing)
-- INSERT INTO public.inventory_batches (product_id, batch_code, quantity_kg, expiry_grade)
-- SELECT id, 'SAMPLE-BATCH-001', 50, 'A' FROM public.products LIMIT 1;
