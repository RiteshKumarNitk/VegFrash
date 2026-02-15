-- RUN THIS IN SUPABASE DASHBOARD -> SQL EDITOR
-- This ensures the relational tables support the checkout process
-- even if you are using the simplified JSONB storage.

-- 1. Ensure order_items has necessary columns
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS quantity numeric;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS price_at_time numeric;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS unit text;

-- 2. Ensure orders table has items JSONB for backup
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items jsonb;
