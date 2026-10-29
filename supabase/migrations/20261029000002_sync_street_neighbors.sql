-- ============================================================================
-- MIGRACJA: Dynamiczna synchronizacja liczby sąsiadów z tabeli profiles
-- ============================================================================

-- 1. Dodaj kolumnę email do profiles (dla standardowej rejestracji)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. Funkcja i trigger do automatycznego przeliczania liczby sąsiadów
CREATE OR REPLACE FUNCTION public.sync_street_neighbors()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.streets 
    SET neighbors = (SELECT count(*) FROM public.profiles WHERE street_name = NEW.street_name)
    WHERE name = NEW.street_name;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.streets 
    SET neighbors = (SELECT count(*) FROM public.profiles WHERE street_name = OLD.street_name)
    WHERE name = OLD.street_name;
  ELSIF TG_OP = 'UPDATE' AND OLD.street_name <> NEW.street_name THEN
    UPDATE public.streets 
    SET neighbors = (SELECT count(*) FROM public.profiles WHERE street_name = OLD.street_name)
    WHERE name = OLD.street_name;
    UPDATE public.streets 
    SET neighbors = (SELECT count(*) FROM public.profiles WHERE street_name = NEW.street_name)
    WHERE name = NEW.street_name;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_street_neighbors ON public.profiles;
CREATE TRIGGER trg_sync_street_neighbors
AFTER INSERT OR UPDATE OF street_name OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_street_neighbors();

-- 3. Przeliczenie początkowe dla wszystkich ulic w oparciu o realne dane
UPDATE public.streets s
SET neighbors = (
  SELECT count(*)
  FROM public.profiles p
  WHERE p.street_name = s.name
);

-- 4. Aktualizacja procedury rejestracji o pole email
CREATE OR REPLACE FUNCTION public.register_neighbor_postal(
  p_name text,
  p_surname text,
  p_street_name text,
  p_street_as text,
  p_house_number text,
  p_flat_number text,
  p_postal_code text,
  p_city text,
  p_phone text,
  p_seed text,
  p_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_norm_addr text;
  v_addr_hash text;
  v_full_addr text;
  v_pin text;
  v_profile_id uuid;
  v_existing public.postal_verifications%ROWTYPE;
BEGIN
  v_norm_addr := lower(trim(coalesce(p_city, 'Mińsk Mazowiecki')) || '|' || trim(coalesce(p_postal_code, '05-300')) || '|' || trim(p_street_name) || '|' || trim(coalesce(p_house_number, '')) || '|' || trim(coalesce(p_flat_number, '')));
  v_addr_hash := encode(digest(v_norm_addr, 'sha256'), 'hex');
  v_full_addr := coalesce(p_name, '') || ' ' || coalesce(p_surname, '') || ', ul. ' || p_street_name || ' ' || coalesce(p_house_number, '') || CASE WHEN coalesce(p_flat_number, '') <> '' THEN '/' || p_flat_number ELSE '' END || ', ' || coalesce(p_postal_code, '05-300') || ' ' || coalesce(p_city, 'Mińsk Mazowiecki');

  SELECT * INTO v_existing FROM public.postal_verifications WHERE address_hash = v_addr_hash;

  IF FOUND THEN
    v_pin := v_existing.activation_pin;
  ELSE
    v_pin := lpad((floor(random() * 900000) + 100000)::text, 6, '0');
    INSERT INTO public.postal_verifications (address_hash, encrypted_address, activation_pin, max_households, activated_count)
    VALUES (
      v_addr_hash,
      pgp_sym_encrypt(v_full_addr, 'mojminsk-postal-aes256-secret-key-2026'),
      v_pin,
      3,
      1
    );
  END IF;

  INSERT INTO public.profiles (name, email, street_name, street_as, city, postal_code, phone, seed, rerolls, verified, trial_ends_at, activation_pin)
  VALUES (p_name, p_email, p_street_name, p_street_as, coalesce(p_city, 'Mińsk Mazowiecki'), coalesce(p_postal_code, '05-300'), p_phone, p_seed, 3, true, now() + interval '14 days', v_pin)
  RETURNING id INTO v_profile_id;

  RETURN jsonb_build_object(
    'profile_id', v_profile_id,
    'activation_pin', v_pin,
    'trial_days_left', 14
  );
END;
$$;
