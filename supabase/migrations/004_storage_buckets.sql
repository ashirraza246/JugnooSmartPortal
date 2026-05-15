-- ============================================
-- JUGNOO SMART PORTAL - STORAGE BUCKET SETUP
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================

-- 1. Create the 'order-files' storage bucket (public, for uploaded work files)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('order-files', 'order-files', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- 2. Create the 'documents' storage bucket as backup (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- 3. Allow public read access to order-files bucket (so customers can view/download files)
CREATE POLICY "Public read access for order-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'order-files');

-- 4. Allow authenticated uploads to order-files bucket
CREATE POLICY "Authenticated uploads to order-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'order-files' AND auth.role() = 'authenticated');

-- 5. Allow anon uploads to order-files bucket (needed for API-based uploads)
CREATE POLICY "Allow anon uploads to order-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'order-files');

-- 6. Allow public read access to documents bucket
CREATE POLICY "Public read access for documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- 7. Allow anon uploads to documents bucket
CREATE POLICY "Allow anon uploads to documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents');

-- 8. Make sure result_document_url column exists in service_applications
ALTER TABLE service_applications
ADD COLUMN IF NOT EXISTS result_document_url TEXT DEFAULT '';

-- ============================================
-- DONE! After running this SQL:
-- 1. Go to Supabase Dashboard > Storage
-- 2. You should see 'order-files' and 'documents' buckets
-- 3. File uploads from admin panel should now work
-- 4. Customers will be able to download their completed documents
-- ============================================
