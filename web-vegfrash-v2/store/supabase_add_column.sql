-- Add missing column 'price_at_time' to order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS price_at_time numeric;
