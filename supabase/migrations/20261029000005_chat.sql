-- ============================================================================
-- MIGRACJA: Prawdziwy czat 1:1 (conversations + messages + RLS + RPC + Realtime)
-- ============================================================================

-- 1. Usunięcie prototypowych tabel czatu (zawierały wyłącznie dane testowe)
DROP TABLE IF EXISTS public.ad_messages CASCADE;
DROP TABLE IF EXISTS public.ad_conversations CASCADE;

-- 2. Tabela rozmów 1:1 (unikalna para: ogłoszenie + kupujący)
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id text NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message text,
  last_message_at timestamptz DEFAULT now(),
  buyer_unread int NOT NULL DEFAULT 0,
  seller_unread int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ad_id, buyer_id),
  CHECK (buyer_id <> seller_id)
);

CREATE INDEX conversations_buyer_idx ON public.conversations (buyer_id, last_message_at DESC);
CREATE INDEX conversations_seller_idx ON public.conversations (seller_id, last_message_at DESC);

-- 3. Tabela wiadomości
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 1 AND 2000),
  kind text NOT NULL DEFAULT 'text' CHECK (kind IN ('text', 'system')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_conversation_created_idx ON public.messages (conversation_id, created_at ASC);

-- 4. Row Level Security (RLS) — dostęp wyłącznie dla uczestników rozmowy
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

CREATE POLICY "conv_select_participants"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (public.current_profile_id() IN (buyer_id, seller_id));

CREATE POLICY "msg_select_participants"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND public.current_profile_id() IN (c.buyer_id, c.seller_id)
    )
  );

CREATE POLICY "msg_insert_participants"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = public.current_profile_id()
    AND kind = 'text'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND public.current_profile_id() IN (c.buyer_id, c.seller_id)
    )
  );

-- 5. Trigger aktualizujący podgląd ostatniej wiadomości i liczniki nieprzeczytanych
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message = left(NEW.body, 200),
    last_message_at = NEW.created_at,
    buyer_unread = CASE WHEN buyer_id <> NEW.sender_id THEN buyer_unread + 1 ELSE buyer_unread END,
    seller_unread = CASE WHEN seller_id <> NEW.sender_id THEN seller_unread + 1 ELSE seller_unread END
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_handle_new_message ON public.messages;
CREATE TRIGGER trg_handle_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- 6. RPC: Rozpoczęcie (lub pobranie istniejącej) rozmowy w sprawie ogłoszenia
CREATE OR REPLACE FUNCTION public.start_conversation(p_ad_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid := public.current_profile_id();
  v_seller uuid;
  v_conv_id uuid;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Musisz być zalogowany, aby rozpocząć rozmowę.';
  END IF;

  SELECT author_id INTO v_seller FROM public.ads WHERE id = p_ad_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ogłoszenie nie istnieje.';
  END IF;

  IF v_seller IS NULL THEN
    RAISE EXCEPTION 'Ogłoszenie demonstracyjne — brak przypisanego właściciela.';
  END IF;

  IF v_seller = v_me THEN
    RAISE EXCEPTION 'Nie możesz rozpocząć rozmowy we własnym ogłoszeniu.';
  END IF;

  INSERT INTO public.conversations (ad_id, buyer_id, seller_id, last_message_at)
  VALUES (p_ad_id, v_me, v_seller, now())
  ON CONFLICT (ad_id, buyer_id) DO UPDATE
    SET ad_id = EXCLUDED.ad_id
  RETURNING id INTO v_conv_id;

  RETURN v_conv_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_conversation(text) TO authenticated;

-- 7. RPC: Oznaczenie rozmowy jako przeczytanej przez bieżącego uczestnika
CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid := public.current_profile_id();
BEGIN
  IF v_me IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.conversations
  SET
    buyer_unread = CASE WHEN buyer_id = v_me THEN 0 ELSE buyer_unread END,
    seller_unread = CASE WHEN seller_id = v_me THEN 0 ELSE seller_unread END
  WHERE id = p_conversation_id
    AND v_me IN (buyer_id, seller_id)
    AND ((buyer_id = v_me AND buyer_unread > 0) OR (seller_id = v_me AND seller_unread > 0));
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_conversation_read(uuid) TO authenticated;

-- 8. RPC: Wysłanie wiadomości systemowej (np. potwierdzenie rezerwacji) oraz rezerwacja ogłoszenia
CREATE OR REPLACE FUNCTION public.send_system_message(p_conversation_id uuid, p_body text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid := public.current_profile_id();
  v_msg_id uuid;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Wymagane logowanie.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = p_conversation_id AND v_me IN (buyer_id, seller_id)
  ) THEN
    RAISE EXCEPTION 'Brak dostępu do tej rozmowy.';
  END IF;

  INSERT INTO public.messages (conversation_id, sender_id, body, kind)
  VALUES (p_conversation_id, v_me, trim(p_body), 'system')
  RETURNING id INTO v_msg_id;

  RETURN v_msg_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_system_message(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.reserve_ad_with_message(
  p_ad_id text,
  p_spot text,
  p_pickup_time text,
  p_phone text DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid := public.current_profile_id();
  v_me_profile public.profiles%ROWTYPE;
  v_seller uuid;
  v_conv_id uuid := NULL;
  v_sys_body text;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Musisz być zalogowany, aby zarezerwować ogłoszenie.';
  END IF;

  SELECT * INTO v_me_profile FROM public.profiles WHERE id = v_me;
  SELECT author_id INTO v_seller FROM public.ads WHERE id = p_ad_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ogłoszenie nie istnieje.';
  END IF;

  IF v_seller = v_me THEN
    RAISE EXCEPTION 'Nie możesz zarezerwować własnego ogłoszenia.';
  END IF;

  UPDATE public.ads
  SET status = 'reserved'
  WHERE id = p_ad_id AND status = 'active';

  INSERT INTO public.ad_reservations (ad_id, buyer_name, buyer_street, spot, pickup_time, phone, note)
  VALUES (
    p_ad_id,
    v_me_profile.name,
    v_me_profile.street_name,
    p_spot,
    p_pickup_time,
    nullif(trim(coalesce(p_phone, '')), ''),
    nullif(trim(coalesce(p_note, '')), '')
  );

  IF v_seller IS NOT NULL THEN
    v_conv_id := public.start_conversation(p_ad_id);
    v_sys_body := 'Rezerwacja: odbiór ' || p_spot || ', termin: ' || p_pickup_time
      || CASE WHEN coalesce(trim(p_note), '') <> '' THEN ' · Notatka: ' || trim(p_note) ELSE '' END;
    PERFORM public.send_system_message(v_conv_id, v_sys_body);
  END IF;

  RETURN v_conv_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reserve_ad_with_message(text, text, text, text, text) TO authenticated;

-- 9. Publikacja Realtime dla rozmów i wiadomości
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END;
$$;
