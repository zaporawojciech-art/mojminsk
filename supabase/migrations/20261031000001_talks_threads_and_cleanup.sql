-- ============================================================================
-- MIGRACJA: Wątkowanie w Strefie Rozmów, trwałe polubienia, raporty i czyszczenie
-- ============================================================================

-- 1. Dodanie kolumny author_profile_id do tabeli posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS author_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Tabela komentarzy i odpowiedzi w Strefie Rozmów
CREATE TABLE IF NOT EXISTS public.post_comments (
  id text PRIMARY KEY,
  post_id text NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author text NOT NULL,
  author_as text NOT NULL,
  author_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  content text NOT NULL CHECK (char_length(content) <= 280),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger do automatycznego zliczania liczby odpowiedzi w tabeli posts
CREATE OR REPLACE FUNCTION public.sync_post_replies_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET replies = replies + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET replies = GREATEST(0, replies - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_comment_change ON public.post_comments;
CREATE TRIGGER on_post_comment_change
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_replies_count();

-- 3. Tabela trwałych polubień użytkowników
CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id text NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, profile_id)
);

-- Funkcja atomowego przełączania polubienia per profil
CREATE OR REPLACE FUNCTION public.toggle_post_user_like(
  p_post_id text,
  p_profile_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.post_likes
    WHERE post_id = p_post_id AND profile_id = p_profile_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.post_likes
    WHERE post_id = p_post_id AND profile_id = p_profile_id;

    UPDATE public.posts
    SET likes = GREATEST(0, likes - 1)
    WHERE id = p_post_id;

    RETURN false;
  ELSE
    INSERT INTO public.post_likes (post_id, profile_id)
    VALUES (p_post_id, p_profile_id);

    UPDATE public.posts
    SET likes = likes + 1
    WHERE id = p_post_id;

    RETURN true;
  END IF;
END;
$$;

-- 4. Funkcja inkrementacji liczby wyświetleń
CREATE OR REPLACE FUNCTION public.increment_post_views(
  p_post_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.posts
  SET views = views + 1
  WHERE id = p_post_id;
END;
$$;

-- 5. Tabela zgłoszeń wpisów do moderacji
CREATE TABLE IF NOT EXISTS public.post_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reporter_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. RLS i polityki dostępowe
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read post_comments" ON public.post_comments;
CREATE POLICY "Public read post_comments" ON public.post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert post_comments" ON public.post_comments;
CREATE POLICY "Public insert post_comments" ON public.post_comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete post_comments" ON public.post_comments;
CREATE POLICY "Public delete post_comments" ON public.post_comments FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read post_likes" ON public.post_likes;
CREATE POLICY "Public read post_likes" ON public.post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert post_likes" ON public.post_likes;
CREATE POLICY "Public insert post_likes" ON public.post_likes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete post_likes" ON public.post_likes;
CREATE POLICY "Public delete post_likes" ON public.post_likes FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public insert post_reports" ON public.post_reports;
CREATE POLICY "Public insert post_reports" ON public.post_reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete posts" ON public.posts;
CREATE POLICY "Public delete posts" ON public.posts FOR DELETE USING (true);

-- 7. Usunięcie demonstracyjnych wpisów testowych przed startem produkcyjnym
DELETE FROM public.posts WHERE id IN ('p1', 'p2', 'p3', 'p4', 'p_1793262859106');
