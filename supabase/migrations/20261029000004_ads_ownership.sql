-- ============================================================================
-- MIGRACJA: Przypisanie ogłoszeń do właściciela (ads.author_id) + RLS
-- ============================================================================

ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.ads
  ALTER COLUMN author_id SET DEFAULT public.current_profile_id();

CREATE INDEX IF NOT EXISTS ads_author_id_idx ON public.ads (author_id);

-- Zastąpienie otwartych polityk zapisu politykami wymagającymi bycia właścicielem
DROP POLICY IF EXISTS "Public insert ads" ON public.ads;
DROP POLICY IF EXISTS "Public update ads" ON public.ads;
DROP POLICY IF EXISTS "Public delete ads" ON public.ads;
DROP POLICY IF EXISTS "ads_insert_own" ON public.ads;
DROP POLICY IF EXISTS "ads_update_own" ON public.ads;
DROP POLICY IF EXISTS "ads_delete_own" ON public.ads;

CREATE POLICY "ads_insert_own"
  ON public.ads
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = public.current_profile_id());

CREATE POLICY "ads_update_own"
  ON public.ads
  FOR UPDATE
  TO authenticated
  USING (author_id = public.current_profile_id())
  WITH CHECK (author_id = public.current_profile_id());

CREATE POLICY "ads_delete_own"
  ON public.ads
  FOR DELETE
  TO authenticated
  USING (author_id = public.current_profile_id());
