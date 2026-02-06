-- ==========================================
-- VEGFRASH STORAGE SETUP SCRIPT
-- ==========================================
-- This script sets up the necessary storage buckets and RLS policies.

-- 1. CREATE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('categories', 'categories', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. ENABLE RLS ON STORAGE
-- (Already enabled by default in Supabase, but good to be explicit for policies)

-- 3. STORAGE POLICIES FOR 'products'
DROP POLICY IF EXISTS "Public Read Products" ON storage.objects;
CREATE POLICY "Public Read Products"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Admin Upload Products" ON storage.objects;
CREATE POLICY "Admin Upload Products"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Admin Delete Products" ON storage.objects;
CREATE POLICY "Admin Delete Products"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- 4. STORAGE POLICIES FOR 'profiles'
DROP POLICY IF EXISTS "Public Read Profiles" ON storage.objects;
CREATE POLICY "Public Read Profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

DROP POLICY IF EXISTS "User Upload Profiles" ON storage.objects;
CREATE POLICY "User Upload Profiles"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles');

-- 5. STORAGE POLICIES FOR 'categories'
DROP POLICY IF EXISTS "Public Read Categories" ON storage.objects;
CREATE POLICY "Public Read Categories"
ON storage.objects FOR SELECT
USING (bucket_id = 'categories');

DROP POLICY IF EXISTS "Admin Upload Categories" ON storage.objects;
CREATE POLICY "Admin Upload Categories"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'categories');
