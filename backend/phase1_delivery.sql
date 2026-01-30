-- Phase 1: Delivery App Infrastructure Migration
-- Run this in Supabase SQL Editor

-- 1. Enable PostGIS for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Delivery Partners Table
-- Stores rider info, location, and status
CREATE TABLE IF NOT EXISTS delivery_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE,
  is_online BOOLEAN DEFAULT FALSE,
  current_location GEOMETRY(Point, 4326),
  vehicle_type TEXT CHECK (vehicle_type IN ('bike', 'cycle', 'scooter')),
  current_order_id UUID REFERENCES orders(id),
  earnings_today DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for geospatial queries (finding nearest rider)
CREATE INDEX IF NOT EXISTS idx_partners_loc ON delivery_partners USING GIST (current_location);

-- 3. Update Orders for Delivery Flow
-- Ensure status enum has all necessary steps
ALTER TYPE order_status_enum ADD VALUE IF NOT EXISTS 'picking';
ALTER TYPE order_status_enum ADD VALUE IF NOT EXISTS 'packed';
ALTER TYPE order_status_enum ADD VALUE IF NOT EXISTS 'out_for_delivery';
ALTER TYPE order_status_enum ADD VALUE IF NOT EXISTS 'delivered';

-- 4. Update Order Items for Weighted Products
-- Add columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'requested_qty_kg') THEN
        ALTER TABLE order_items ADD COLUMN requested_qty_kg DECIMAL(10, 3);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'actual_qty_kg') THEN
        ALTER TABLE order_items ADD COLUMN actual_qty_kg DECIMAL(10, 3);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'price_per_kg_at_time') THEN
        ALTER TABLE order_items ADD COLUMN price_per_kg_at_time DECIMAL(10, 2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'final_line_price') THEN
        ALTER TABLE order_items ADD COLUMN final_line_price DECIMAL(10, 2);
    END IF;
END $$;

-- 5. Helper Function for Nearest Rider (Optional but recommended)
CREATE OR REPLACE FUNCTION get_nearest_riders(
  lat float,
  long float,
  radius_meters float DEFAULT 2000
)
RETURNS TABLE (
  id UUID,
  phone TEXT,
  dist_meters float
)
LANGUAGE sql
AS $$
  SELECT 
    id, 
    phone, 
    ST_Distance(
      current_location, 
      ST_SetSRID(ST_MakePoint(long, lat), 4326)
    ) as dist_meters
  FROM delivery_partners
  WHERE ST_DWithin(
    current_location, 
    ST_SetSRID(ST_MakePoint(long, lat), 4326), 
    radius_meters
  )
  AND is_online = true
  AND current_order_id IS NULL -- Only free riders
  ORDER BY dist_meters ASC;
$$;
