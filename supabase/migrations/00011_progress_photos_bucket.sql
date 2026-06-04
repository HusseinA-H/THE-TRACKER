-- ============================================================
-- THE TRACKER — Storage Bucket Setup for Progress Photos
-- Migration: 00011_progress_photos_bucket.sql
-- ============================================================

-- 1. Create progress_photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress_photos', 'progress_photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects (if not already enabled)
-- Note: storage.objects has RLS enabled by default in Supabase

-- 3. SELECT Policy: Allow authenticated users to view progress photos
DROP POLICY IF EXISTS "Allow authenticated read on progress photos" ON storage.objects;
CREATE POLICY "Allow authenticated read on progress photos" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'progress_photos');

-- 4. INSERT Policy: Allow users to upload progress photos under their own user id folder
DROP POLICY IF EXISTS "Allow users to upload progress photos" ON storage.objects;
CREATE POLICY "Allow users to upload progress photos" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'progress_photos' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- 5. UPDATE Policy: Allow users to update their own progress photos
DROP POLICY IF EXISTS "Allow users to update own progress photos" ON storage.objects;
CREATE POLICY "Allow users to update own progress photos" ON storage.objects
    FOR UPDATE TO authenticated USING (
        bucket_id = 'progress_photos' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- 6. DELETE Policy: Allow users to delete their own progress photos
DROP POLICY IF EXISTS "Allow users to delete own progress photos" ON storage.objects;
CREATE POLICY "Allow users to delete own progress photos" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'progress_photos' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );
