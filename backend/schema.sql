-- Enable PostGIS for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Festival & Theming System
CREATE TABLE festival_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  config_json JSONB NOT NULL, -- Full theme config (colors, assets, logic)
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE active_themes (
  id TEXT PRIMARY KEY DEFAULT 'current', -- Singleton row
  theme_id UUID REFERENCES festival_calendar(id),
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT FALSE,
  target_cities TEXT[], -- NULL means all
  rollout_percentage INTEGER DEFAULT 100
);

-- 2. Core Commerce: Locations & Products
CREATE TYPE store_type_enum AS ENUM ('dark_store', 'micro_warehouse');

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  polygon_coords GEOMETRY(Polygon, 4326),
  address TEXT,
  operating_hours JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  store_type store_type_enum DEFAULT 'dark_store'
);

CREATE TYPE pricing_type_enum AS ENUM ('per_kg', 'per_piece');

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID, -- Foreign key to a categories table if added later
  pricing_type pricing_type_enum NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  shelf_life_hours INTEGER,
  replacement_hierarchy JSONB, -- Array of product_ids or slugs
  images TEXT[],
  is_festival_special BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inventory & Batches (TTL System)
CREATE TYPE expiry_grade_enum AS ENUM ('A', 'B', 'C');
CREATE TYPE batch_status_enum AS ENUM ('available', 'reserved', 'expired');

CREATE TABLE inventory_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id),
  product_id UUID REFERENCES products(id),
  batch_code TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  expiry_grade expiry_grade_enum DEFAULT 'A',
  quantity_kg DECIMAL(10, 3) DEFAULT 0,
  reserved_quantity DECIMAL(10, 3) DEFAULT 0,
  price_modifier DECIMAL(3, 2) DEFAULT 1.0,
  status batch_status_enum DEFAULT 'available'
);

-- 4. Orders & Fulfillment
CREATE TYPE order_status_enum AS ENUM ('placed', 'picking', 'packed', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE slot_enum AS ENUM ('morning', 'express');

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Links to auth.users
  location_id UUID REFERENCES locations(id),
  status order_status_enum DEFAULT 'placed',
  scheduled_slot slot_enum DEFAULT 'express',
  estimated_delivery TIMESTAMPTZ,
  weight_adjustment_total DECIMAL(10, 2) DEFAULT 0,
  replacement_approved BOOLEAN DEFAULT FALSE,
  theme_applied TEXT, -- Slug of the theme active at order time
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  requested_qty_kg DECIMAL(10, 3),
  requested_qty_unit INTEGER,
  actual_qty_kg DECIMAL(10, 3),
  price_per_kg_at_time DECIMAL(10, 2),
  final_line_price DECIMAL(10, 2),
  is_replacement BOOLEAN DEFAULT FALSE,
  original_product_id UUID -- If this item is a substitute
);

-- 5. Delivery Partners
CREATE TYPE vehicle_type_enum AS ENUM ('bike', 'cycle', 'scooter');

CREATE TABLE delivery_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE,
  current_location GEOMETRY(Point, 4326),
  is_online BOOLEAN DEFAULT FALSE,
  vehicle_type vehicle_type_enum,
  current_order_id UUID REFERENCES orders(id),
  earnings_today DECIMAL(10, 2) DEFAULT 0
);

-- Indexes for frequent queries
CREATE INDEX idx_inventory_product_location ON inventory_batches(product_id, location_id) WHERE status = 'available';
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_locations_geom ON locations USING GIST (polygon_coords);
CREATE INDEX idx_partners_loc ON delivery_partners USING GIST (current_location);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE festival_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;

-- POLICIES (Placeholders - to be refined)
-- Public read access for active themes and products
CREATE POLICY "Public themes read" ON active_themes FOR SELECT USING (true);
CREATE POLICY "Public products read" ON products FOR SELECT USING (true);

-- Users can see their own orders
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view logic order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
