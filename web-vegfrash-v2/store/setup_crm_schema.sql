-- CUSTOMER CRM SCHEMA SETUP
-- Run this in your Supabase Dashboard > SQL Editor

-- 1. CREATE CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    phone text UNIQUE,
    email text UNIQUE,
    total_orders integer DEFAULT 0,
    total_spent numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. LINK ORDERS TO CUSTOMERS
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id);

-- 3. ENABLE RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Admin Only Access)
DROP POLICY IF EXISTS "Staff Full Access Customers" ON public.customers;
CREATE POLICY "Staff Full Access Customers" ON public.customers
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 5. FUNCTION TO UPDATE CUSTOMER STATS ON ORDER
-- (Optional, for real-time CRM updates)
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.customer_id IS NOT NULL) THEN
    UPDATE public.customers
    SET total_orders = total_orders + 1,
        total_spent = total_spent + NEW.total
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_customer_stats ON public.orders;
CREATE TRIGGER tr_update_customer_stats
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION update_customer_stats();
