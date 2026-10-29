-- ============================================================================
-- MIGRACJA: Subskrypcje Web Push + trigger wysyłający powiadomienia o wiadomościach
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT public.current_profile_id(),
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_profile_idx ON public.push_subscriptions (profile_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_sub_select_own" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_sub_insert_own" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_sub_delete_own" ON public.push_subscriptions;

CREATE POLICY "push_sub_select_own"
  ON public.push_subscriptions
  FOR SELECT
  TO authenticated
  USING (profile_id = public.current_profile_id());

CREATE POLICY "push_sub_insert_own"
  ON public.push_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY "push_sub_delete_own"
  ON public.push_subscriptions
  FOR DELETE
  TO authenticated
  USING (profile_id = public.current_profile_id());

-- RPC do bezpiecznego zapisu/aktualizacji subskrypcji Push na urządzeniu
CREATE OR REPLACE FUNCTION public.upsert_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid := public.current_profile_id();
  v_sub_id uuid;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Musisz być zalogowany, aby włączyć powiadomienia.';
  END IF;

  INSERT INTO public.push_subscriptions (profile_id, endpoint, p256dh, auth, user_agent)
  VALUES (v_me, p_endpoint, p_p256dh, p_auth, p_user_agent)
  ON CONFLICT (endpoint) DO UPDATE
    SET profile_id = EXCLUDED.profile_id,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        user_agent = EXCLUDED.user_agent
  RETURNING id INTO v_sub_id;

  RETURN v_sub_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_push_subscription(text, text, text, text) TO authenticated;

-- Trigger wywołujący Edge Function send-chat-push (tylko gdy odbiorca ma aktywną subskrypcję)
CREATE OR REPLACE FUNCTION public.notify_push_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_recipient_id uuid;
  v_has_sub boolean;
  v_secret text := '';
BEGIN
  SELECT
    CASE WHEN c.buyer_id = NEW.sender_id THEN c.seller_id ELSE c.buyer_id END
  INTO v_recipient_id
  FROM public.conversations c
  WHERE c.id = NEW.conversation_id;

  IF v_recipient_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.push_subscriptions WHERE profile_id = v_recipient_id
  ) INTO v_has_sub;

  IF NOT v_has_sub THEN
    RETURN NEW;
  END IF;

  BEGIN
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets
    WHERE name = 'push_webhook_secret'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_secret := '';
  END;

  BEGIN
    PERFORM net.http_post(
      url := 'https://jqortivwlvsjuiiexvro.supabase.co/functions/v1/send-chat-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-push-secret', coalesce(v_secret, '')
      ),
      body := jsonb_build_object(
        'message_id', NEW.id,
        'conversation_id', NEW.conversation_id,
        'sender_id', NEW.sender_id,
        'recipient_id', v_recipient_id,
        'body', left(NEW.body, 160)
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Błąd sieciowy powiadomienia nie może blokować wysłania wiadomości w czacie
    NULL;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_push_on_new_message ON public.messages;
CREATE TRIGGER trg_notify_push_on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_push_on_new_message();

-- Funkcja dla service_role pobierająca klucze VAPID z Supabase Vault
CREATE OR REPLACE FUNCTION public.get_push_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_pub text;
  v_priv text;
  v_sec text;
BEGIN
  SELECT decrypted_secret INTO v_pub FROM vault.decrypted_secrets WHERE name = 'vapid_public_key' LIMIT 1;
  SELECT decrypted_secret INTO v_priv FROM vault.decrypted_secrets WHERE name = 'vapid_private_key' LIMIT 1;
  SELECT decrypted_secret INTO v_sec FROM vault.decrypted_secrets WHERE name = 'push_webhook_secret' LIMIT 1;
  RETURN jsonb_build_object(
    'vapid_public_key', v_pub,
    'vapid_private_key', v_priv,
    'push_webhook_secret', v_sec
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_push_config() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_push_config() TO service_role;

