-- ============================================================================
-- MIGRACJA: Terminowość ogłoszeń 14 dni (expires_at, status expired, odnawianie)
-- ============================================================================

-- 1. Dodanie kolumny expires_at do public.ads (domyślnie 14 dni od momentu publikacji)
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '14 days');

-- 2. Aktualizacja istniejących ogłoszeń w bazie
UPDATE public.ads
SET expires_at = created_at + interval '14 days'
WHERE expires_at IS NULL;

-- 3. Rozszerzenie dopuszczalnych statusów ogłoszenia o 'expired'
ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_status_check;
ALTER TABLE public.ads ADD CONSTRAINT ads_status_check
  CHECK (status = ANY (ARRAY['active'::text, 'reserved'::text, 'sold'::text, 'expired'::text]));

-- 4. Funkcja do odnowienia / przedłużenia ogłoszenia o kolejne 14 dni
CREATE OR REPLACE FUNCTION public.renew_ad_14_days(p_ad_id text)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_expires timestamptz;
BEGIN
  UPDATE public.ads
  SET expires_at = now() + interval '14 days',
      status = CASE WHEN status = 'expired' THEN 'active' ELSE status END
  WHERE id = p_ad_id
  RETURNING expires_at INTO v_new_expires;

  RETURN v_new_expires;
END;
$$;
