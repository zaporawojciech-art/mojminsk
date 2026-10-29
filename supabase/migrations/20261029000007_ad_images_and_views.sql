-- ============================================================================
-- MIGRACJA: Supabase Storage Bucket 'ad-images' + increment_ad_views
-- ============================================================================

-- 1. UTWORZENIE PUBLICZNEGO BUCKETU STORAGE DLA ZDJĘĆ OGŁOSZEŃ
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ad-images',
  'ad-images',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];

-- 2. POLITYKI RLS DLA storage.objects
DROP POLICY IF EXISTS "Public select ad-images" ON storage.objects;
CREATE POLICY "Public select ad-images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'ad-images');

DROP POLICY IF EXISTS "Authenticated insert ad-images" ON storage.objects;
CREATE POLICY "Authenticated insert ad-images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ad-images');

DROP POLICY IF EXISTS "Authenticated delete own ad-images" ON storage.objects;
CREATE POLICY "Authenticated delete own ad-images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'ad-images' AND
    (storage.foldername(name))[1] = public.current_profile_id()::text
  );

-- 3. ATOMOWY LICZNIK WYŚWIETLEŃ OGŁOSZENIA
CREATE OR REPLACE FUNCTION public.increment_ad_views(p_ad_id text)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_views int;
BEGIN
  UPDATE public.ads
  SET views = COALESCE(views, 0) + 1
  WHERE id = p_ad_id
  RETURNING views INTO v_views;

  RETURN COALESCE(v_views, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_ad_views(text) TO anon, authenticated;
