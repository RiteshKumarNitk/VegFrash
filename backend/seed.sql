-- Seed Festival Calendar
INSERT INTO festival_calendar (name, slug, start_date, end_date, config_json) VALUES
(
  'Diwali 2026', 
  'diwali_2026', 
  '2026-11-01 00:00:00+00', 
  '2026-11-05 23:59:59+00',
  '{
    "colors": {
      "primary": "#FF6F00",
      "secondary": "#FFD700",
      "accent": "#E65100",
      "gradient": "linear-gradient(135deg, #FF6F00, #FFD700)",
      "background": "#FFF3E0",
      "cardBackground": "#FFFFFF"
    },
    "assets": {
      "home_banner": "https://example.com/diwali_banner.webp",
      "category_icons": {},
      "font_family": "Poppins",
      "loading_animation": "diya_glow"
    },
    "headline": "Happy Diwali! Fresh Feast Awaits",
    "cta_button": "Shop Festive Specials"
  }'::jsonb
);

-- Seed Products
INSERT INTO products (name, pricing_type, base_price, shelf_life_hours, is_festival_special) VALUES
('Fresh Spinach (Palak)', 'per_kg', 40.00, 72, true),
('Red Tomato', 'per_kg', 30.00, 120, false),
('Coconut', 'per_piece', 25.00, 168, true),
('Coriander Bunch', 'per_piece', 10.00, 48, true);

-- Seed Locations
INSERT INTO locations (name, address, store_type) VALUES
('Koramangala Dark Store', '123, 4th Block, Koramangala', 'dark_store');
