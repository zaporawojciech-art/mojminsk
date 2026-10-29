-- ============================================================================
-- MIGRACJA: Supabase Auth + bezpieczne profile i widok public_profiles
-- ============================================================================

-- 1. Pomocnicza funkcja zwracająca id profilu aktualnie zalogowanego użytkownika
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.current_profile_id() TO anon, authenticated;

-- 2. Funkcja tworząca profil sąsiada oraz (opcjonalnie) zaszyfrowany rekord weryfikacji pocztowej
CREATE OR REPLACE FUNCTION public.create_neighbor_from_signup(
  p_auth_user_id uuid,
  p_email text,
  p_meta jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_name text;
  v_surname text;
  v_street_name text;
  v_street_as text;
  v_house_number text;
  v_flat_number text;
  v_postal_code text;
  v_city text;
  v_phone text;
  v_seed text;
  v_norm_addr text;
  v_addr_hash text;
  v_full_addr text;
  v_pin text := NULL;
  v_profile_id uuid;
  v_existing public.postal_verifications%ROWTYPE;
BEGIN
  v_name := coalesce(nullif(trim(p_meta->>'name'), ''), nullif(split_part(coalesce(p_email, ''), '@', 1), ''), 'Sąsiad');
  v_surname := coalesce(trim(p_meta->>'surname'), '');
  v_street_name := coalesce(nullif(trim(p_meta->>'street_name'), ''), 'Warszawska');
  v_street_as := coalesce(nullif(trim(p_meta->>'street_as'), ''), 'z ' || v_street_name);
  v_house_number := coalesce(trim(p_meta->>'house_number'), '');
  v_flat_number := coalesce(trim(p_meta->>'flat_number'), '');
  v_postal_code := coalesce(nullif(trim(p_meta->>'postal_code'), ''), '05-300');
  v_city := coalesce(nullif(trim(p_meta->>'city'), ''), 'Mińsk Mazowiecki');
  v_phone := nullif(trim(p_meta->>'phone'), '');
  v_seed := coalesce(nullif(trim(p_meta->>'seed'), ''), 'neighbor-' || substr(p_auth_user_id::text, 1, 8));

  IF v_house_number <> '' THEN
    v_norm_addr := lower(v_city || '|' || v_postal_code || '|' || v_street_name || '|' || v_house_number || '|' || v_flat_number);
    v_addr_hash := encode(digest(v_norm_addr, 'sha256'), 'hex');
    v_full_addr := v_name || ' ' || v_surname || ', ul. ' || v_street_name || ' ' || v_house_number
      || CASE WHEN v_flat_number <> '' THEN '/' || v_flat_number ELSE '' END
      || ', ' || v_postal_code || ' ' || v_city;

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
  END IF;

  INSERT INTO public.profiles (
    auth_user_id,
    name,
    email,
    street_name,
    street_as,
    city,
    postal_code,
    phone,
    seed,
    rerolls,
    verified,
    trial_ends_at,
    activation_pin
  )
  VALUES (
    p_auth_user_id,
    v_name,
    p_email,
    v_street_name,
    v_street_as,
    v_city,
    v_postal_code,
    v_phone,
    v_seed,
    3,
    true,
    now() + interval '14 days',
    v_pin
  )
  ON CONFLICT (auth_user_id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now()
  RETURNING id INTO v_profile_id;

  RETURN v_profile_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_neighbor_from_signup(uuid, text, jsonb) FROM PUBLIC, anon, authenticated;

-- 3. Trigger BEFORE INSERT na auth.users: tworzy profil i czyści wrażliwy adres z raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_meta jsonb := coalesce(NEW.raw_user_meta_data, '{}'::jsonb);
BEGIN
  PERFORM public.create_neighbor_from_signup(NEW.id, NEW.email, v_meta);
  NEW.raw_user_meta_data := v_meta - 'surname' - 'house_number' - 'flat_number' - 'postal_code' - 'phone';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_before_insert ON auth.users;
CREATE TRIGGER on_auth_user_before_insert
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Trigger usuwający profil po usunięciu konta auth.users
CREATE OR REPLACE FUNCTION public.handle_deleted_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.profiles WHERE auth_user_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_after_delete ON auth.users;
CREATE TRIGGER on_auth_user_after_delete
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_deleted_auth_user();

-- 4. Zablokowanie starego niezabezpieczonego RPC dla anon
REVOKE EXECUTE ON FUNCTION public.register_neighbor_postal(text, text, text, text, text, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.register_neighbor_postal(text, text, text, text, text, text, text, text, text, text, text) FROM PUBLIC, anon, authenticated;

-- 5. Zamknięcie wycieku danych w tabeli profiles (RLS tylko dla właściciela)
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- 6. Bezpieczny widok publiczny profili sąsiadów (bez PIN-u, telefonu i e-maila)
CREATE OR REPLACE VIEW public.public_profiles WITH (security_invoker = false) AS
SELECT
  id,
  name,
  street_name,
  street_as,
  city,
  seed,
  verified,
  privacy,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
