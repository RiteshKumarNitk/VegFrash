-- RPC SETUP SCRIPT
-- Run this in Supabase SQL Editor

-- 1. Create a secure function to save settings
-- This function runs with 'SECURITY DEFINER' meaning it uses the permissions of the creator (postgres/admin)
-- bypassing the RLS policies for the table itself.
CREATE OR REPLACE FUNCTION save_site_setting(setting_key text, setting_value jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO site_settings (key, value)
  VALUES (setting_key, setting_value)
  ON CONFLICT (key)
  DO UPDATE SET value = EXCLUDED.value;
END;
$$;

-- 2. Grant permission to authenticated users to call this function
GRANT EXECUTE ON FUNCTION save_site_setting(text, jsonb) TO authenticated;
