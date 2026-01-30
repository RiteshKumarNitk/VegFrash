-- Enable Storage Extension (usually enabled by default)
-- Create Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('themes', 'themes', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('delivery_proofs', 'delivery_proofs', false); -- Private

-- Policy: Public Read Access for Products & Themes
CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );
CREATE POLICY "Public Access Themes" ON storage.objects FOR SELECT USING ( bucket_id = 'themes' );

-- Policy: Authenticated Uploads (Admins/Staff only ideally, but widely open for MVP Phase 1)
CREATE POLICY "Authenticated Uploads" ON storage.objects FOR INSERT WITH CHECK ( auth.role() = 'authenticated' );

-- Update RLS for Users Table (missing piece from user feedback)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
