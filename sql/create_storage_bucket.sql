-- Create storage bucket for newsletter images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'newsletter-images',
    'newsletter-images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access on newsletter-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'newsletter-images');

-- Allow authenticated and anon users to upload
CREATE POLICY "Allow uploads to newsletter-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'newsletter-images');

-- Allow updates
CREATE POLICY "Allow updates on newsletter-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'newsletter-images');

-- Allow deletes
CREATE POLICY "Allow deletes on newsletter-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'newsletter-images');
