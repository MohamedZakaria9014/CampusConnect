-- ========================================================
-- SUPABASE STORAGE BUCKETS & PUBLIC POLICIES MIGRATION
-- ========================================================

-- Create Avatars Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create Posts Images Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('posts', 'posts', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create Chat Messages Images Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('messages', 'messages', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies for Avatars
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Authenticated Update Avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');

-- Storage RLS Policies for Posts
CREATE POLICY "Public Read Posts" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Authenticated Upload Posts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts');

-- Storage RLS Policies for Messages
CREATE POLICY "Public Read Messages" ON storage.objects FOR SELECT USING (bucket_id = 'messages');
CREATE POLICY "Authenticated Upload Messages" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'messages');
