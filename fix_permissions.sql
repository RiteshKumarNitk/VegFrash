-- FIX PERMISSIONS SCRIPT
-- Run this in Supabase SQL Editor

-- 1. Grant explicit permissions to the tables
GRANT ALL ON TABLE site_settings TO postgres;
GRANT ALL ON TABLE site_settings TO service_role;
GRANT ALL ON TABLE site_settings TO authenticated;
GRANT SELECT ON TABLE site_settings TO anon;

-- 2. Ensure RLS is enabled but policies are correct
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Re-affirm the Admin Policy (drop and recreate to be safe)
DROP POLICY IF EXISTS "Admin full access" ON site_settings;
CREATE POLICY "Admin full access"
  ON site_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Re-affirm Public Read Policy
DROP POLICY IF EXISTS "Public read access" ON site_settings;
CREATE POLICY "Public read access"
  ON site_settings
  FOR SELECT
  TO anon
  USING (true);

-- 5. Force Verify - Upsert the row to ensure it's writable
INSERT INTO site_settings (key, value)
VALUES (
  'theme_config', 
  '{
    "festival_mode": false,
    "banner_text": "GRAND FESTIVAL SALE IS LIVE! Get Flat 50% OFF",
    "promo_code": "FEST50",
    "gradient": "from-orange-500 via-red-500 to-yellow-500"
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;
