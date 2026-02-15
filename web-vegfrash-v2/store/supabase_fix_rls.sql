-- RLS FIX SCRIPT (SECURE MODE)
-- Run this to RESTRICT access to Logged-in Users only.

-- 1. ORDERS TABLE
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Remove the public/permissive policies
DROP POLICY IF EXISTS "Public View Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Update Orders" ON public.orders;
DROP POLICY IF EXISTS "Staff View All Orders" ON public.orders;
DROP POLICY IF EXISTS "Staff Update Orders" ON public.orders;
DROP POLICY IF EXISTS "Customers Insert Orders" ON public.orders;

-- Add Permissions for Authenticated Users (Staff)
-- 1. View ALL orders (needed for dashboard)
CREATE POLICY "Staff View All Orders" ON public.orders
FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Update status of orders
CREATE POLICY "Staff Update Orders" ON public.orders
FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. Insert new orders (for customers)
CREATE POLICY "Customers Insert Orders" ON public.orders
FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- 2. ORDER ITEMS TABLE
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public View Items" ON public.order_items;
DROP POLICY IF EXISTS "Public Insert Items" ON public.order_items;
DROP POLICY IF EXISTS "Staff View All Items" ON public.order_items;
DROP POLICY IF EXISTS "User View Own Order Items" ON public.order_items;

-- Allow Staff to see all items
DROP POLICY IF EXISTS "Staff View All Items" ON public.order_items;
CREATE POLICY "Staff View All Items" ON public.order_items
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow Authenticated Users (Staff & Customers) to view ALL items for now
-- This matches the current permissions on the 'orders' table to prevent partial data loading
DROP POLICY IF EXISTS "User View Own Order Items" ON public.order_items;
CREATE POLICY "User View Own Order Items" ON public.order_items
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow Customers to add items
DROP POLICY IF EXISTS "Customers Insert Items" ON public.order_items;
CREATE POLICY "Customers Insert Items" ON public.order_items
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. PRODUCTS
-- Public can view, Admin can edit
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
