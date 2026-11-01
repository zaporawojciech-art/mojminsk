-- ============================================================================
-- MIGRACJA: Rola administratora (RBAC) w public.profiles
-- ============================================================================

-- 1. Dodanie kolumny is_admin do tabeli profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2. Nadanie uprawnień administratora dla konta właściciela
UPDATE public.profiles
SET is_admin = true
WHERE email = 'zaporawojciech@gmail.com' OR email = 'admin@mojminsk.app';

-- 3. Funkcja pomocnicza sprawdzająca czy bieżący zalogowany użytkownik to admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce((SELECT is_admin FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1), false);
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO anon, authenticated;
