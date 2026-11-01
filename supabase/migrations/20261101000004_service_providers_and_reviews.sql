-- ============================================================================
-- MIGRACJA: Tabele usługodawców (service_providers) oraz opinii (service_reviews)
-- ============================================================================

-- 1. TABELA USŁUGODAWCÓW
CREATE TABLE IF NOT EXISTS public.service_providers (
  id text PRIMARY KEY,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  business_name text NOT NULL,
  category_id text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  street text NOT NULL,
  city text NOT NULL DEFAULT 'Mińsk Mazowiecki',
  avatar_seed text NOT NULL,
  logo_url text,
  description text NOT NULL,
  phone text NOT NULL,
  years_experience int NOT NULL DEFAULT 1,
  verified_by_admin boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('verified', 'pending_verification', 'rejected')),
  promoted boolean NOT NULL DEFAULT false,
  portfolio jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. TABELA OPINII O USŁUGACH
CREATE TABLE IF NOT EXISTS public.service_reviews (
  id text PRIMARY KEY,
  provider_id text NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  author_street text NOT NULL,
  author_seed text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  service_tag text,
  provider_reply text,
  provider_reply_at text,
  reported boolean NOT NULL DEFAULT false,
  report_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. POLITYKI RLS
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

-- Odczyt usług: publiczny dla zweryfikowanych lub pełny dla admina
CREATE POLICY "service_providers_read"
  ON public.service_providers
  FOR SELECT
  TO anon, authenticated
  USING (status = 'verified' OR public.is_current_user_admin() = true);

-- Zgłoszenie nowego wniosku przez mieszkańca
CREATE POLICY "service_providers_insert"
  ON public.service_providers
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Pełna edycja i moderacja dla administratora
CREATE POLICY "service_providers_admin_update"
  ON public.service_providers
  FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin() = true)
  WITH CHECK (public.is_current_user_admin() = true);

CREATE POLICY "service_providers_admin_delete"
  ON public.service_providers
  FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin() = true);

-- Opinie: publiczny odczyt
CREATE POLICY "service_reviews_read"
  ON public.service_reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Dodawanie opinii
CREATE POLICY "service_reviews_insert"
  ON public.service_reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Zgłaszanie opinii do moderacji (lub odpowiedź fachowca)
CREATE POLICY "service_reviews_update"
  ON public.service_reviews
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Usuwanie opinii przez administratora
CREATE POLICY "service_reviews_admin_delete"
  ON public.service_reviews
  FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin() = true);
