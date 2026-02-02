-- OPTIMIZED SAVE FUNCTION TO PREVENT TIMEOUTS
-- This combines multiple updates into a single database transaction

-- 1. Create the bulk save function
CREATE OR REPLACE FUNCTION save_site_settings_bulk(settings jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Expects a JSON array of objects: [{"key": "...", "value": {...}}, ...]
  INSERT INTO site_settings (key, value)
  SELECT 
    (elem->>'key')::text, 
    (elem->'value')::jsonb
  FROM jsonb_array_elements(settings) AS elem
  ON CONFLICT (key)
  DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW(); -- updated_at exists in some versions of the schema
EXCEPTION WHEN OTHERS THEN
  -- Fallback for if updated_at doesn't exist
  INSERT INTO site_settings (key, value)
  SELECT 
    (elem->>'key')::text, 
    (elem->'value')::jsonb
  FROM jsonb_array_elements(settings) AS elem
  ON CONFLICT (key)
  DO UPDATE SET 
    value = EXCLUDED.value;
END;
$$;

-- 2. Grant access
GRANT EXECUTE ON FUNCTION save_site_settings_bulk(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION save_site_settings_bulk(jsonb) TO service_role;

-- 3. Also ensure site_settings has an index on key (though it should as it is Unique/PK)
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
