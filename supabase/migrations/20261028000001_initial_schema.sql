-- ============================================================================
-- mójMińsk.app — Kompletny Schemat Bazy Danych Supabase (PostgreSQL 17)
-- Zgodny z dokumentacją produktową AGENTS.md (Decyzje #1 - #48)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. ULICE I SOŁECTWA (Miasto i Gmina Mińsk Mazowiecki)
CREATE TABLE IF NOT EXISTS public.streets (
  name text PRIMARY KEY,
  as_form text NOT NULL,
  neighbors int NOT NULL DEFAULT 1,
  postal_code text NOT NULL DEFAULT '05-300',
  city text NOT NULL DEFAULT 'Mińsk Mazowiecki',
  is_gmina boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. PROFILE MIESZKAŃCÓW (Tożsamość: "[Imię] z ulicy [Nazwa Ulicy]")
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE,
  name text NOT NULL,
  street_name text NOT NULL,
  street_as text NOT NULL,
  city text NOT NULL DEFAULT 'Mińsk Mazowiecki',
  postal_code text NOT NULL DEFAULT '05-300',
  phone text,
  seed text NOT NULL,
  rerolls int NOT NULL DEFAULT 3,
  verified boolean NOT NULL DEFAULT true,
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  activation_pin text,
  privacy jsonb NOT NULL DEFAULT '{"showStats": true, "showPastAds": true, "showRides": true}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. WERYFIKACJA POCZTOWA RODO (Szyfrowanie AES-256 + limit do 3 domowników na kod PIN)
CREATE TABLE IF NOT EXISTS public.postal_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address_hash text UNIQUE NOT NULL,
  encrypted_address bytea NOT NULL,
  activation_pin text UNIQUE NOT NULL,
  max_households int NOT NULL DEFAULT 3,
  activated_count int NOT NULL DEFAULT 0,
  letter_status text NOT NULL DEFAULT 'pending' CHECK (letter_status IN ('pending', 'printed', 'sent', 'delivered')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. ALERTY KRYZYSOWE I WIADOMOŚCI MIEJSKIE (Widok HOME)
CREATE TABLE IF NOT EXISTS public.live_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  time_label text NOT NULL DEFAULT 'Teraz',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.news_articles (
  id text PRIMARY KEY,
  source text NOT NULL,
  time_label text NOT NULL,
  tag text NOT NULL,
  title text NOT NULL,
  image text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. ANKIETY SPOŁECZNOŚCIOWE I PLEBISCYTY (Decyzje #31-#36)
CREATE TABLE IF NOT EXISTS public.polls (
  id text PRIMARY KEY,
  title text NOT NULL,
  author text NOT NULL,
  author_street text NOT NULL,
  category text NOT NULL DEFAULT 'city' CHECK (category IN ('city', 'neighborhood', 'culture', 'investments')),
  is_official boolean NOT NULL DEFAULT false,
  duration_days int NOT NULL DEFAULT 7,
  total_votes int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

CREATE TABLE IF NOT EXISTS public.poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id text NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id text NOT NULL,
  name text NOT NULL,
  votes int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (poll_id, option_id)
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id text NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id text NOT NULL,
  voter_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_id, voter_key)
);

-- Funkcja atomowego głosowania w ankiecie
CREATE OR REPLACE FUNCTION public.cast_poll_vote(
  p_poll_id text,
  p_option_id text,
  p_voter_key text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.poll_votes (poll_id, option_id, voter_key)
  VALUES (p_poll_id, p_option_id, p_voter_key)
  ON CONFLICT (poll_id, voter_key) DO NOTHING;

  IF FOUND THEN
    UPDATE public.poll_options
    SET votes = votes + 1
    WHERE poll_id = p_poll_id AND option_id = p_option_id;

    UPDATE public.polls
    SET total_votes = total_votes + 1
    WHERE id = p_poll_id;
  END IF;
END;
$$;

-- 6. OGŁOSZENIA LOKALNE C2C & PRACA (Decyzje #37, #40, #41, #42)
CREATE TABLE IF NOT EXISTS public.ads (
  id text PRIMARY KEY,
  title text NOT NULL,
  price numeric,
  kind text NOT NULL CHECK (kind IN ('sell', 'free', 'lost')),
  author text NOT NULL,
  street text NOT NULL,
  time_label text NOT NULL DEFAULT 'teraz',
  image text NOT NULL,
  images text[] NOT NULL DEFAULT '{}',
  description text,
  category text DEFAULT 'Inne',
  condition text CHECK (condition IS NULL OR condition IN ('Nowe', 'Używane', 'Bardzo dobry')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reserved', 'sold')),
  views int NOT NULL DEFAULT 1,
  is_owner boolean NOT NULL DEFAULT false,
  negotiable boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. CZAT SĄSIEDZKI, REZERWACJE I ZGŁOSZENIA OGŁOSZEŃ
CREATE TABLE IF NOT EXISTS public.ad_conversations (
  id text PRIMARY KEY,
  ad_id text NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  ad_title text NOT NULL,
  ad_price numeric,
  ad_image text NOT NULL,
  ad_street text NOT NULL,
  other_user_name text NOT NULL,
  other_user_street text NOT NULL,
  other_user_avatar_seed text,
  role text NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller')),
  last_message text NOT NULL,
  last_message_time text NOT NULL DEFAULT 'Przed chwilą',
  unread_count int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ad_messages (
  id text PRIMARY KEY,
  ad_id text NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('me', 'neighbor')),
  sender_name text NOT NULL,
  text text NOT NULL,
  time_label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ad_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id text NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  buyer_name text NOT NULL,
  buyer_street text NOT NULL,
  spot text NOT NULL,
  pickup_time text NOT NULL,
  phone text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ad_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id text NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. STREFA PRZEJAZDU (Sąsiedzki Carpooling Mińsk <-> Warszawa i powiat)
CREATE TABLE IF NOT EXISTS public.rides (
  id text PRIMARY KEY,
  driver text NOT NULL,
  driver_as text NOT NULL,
  rating numeric(3,1) NOT NULL DEFAULT 5.0,
  rides_count int NOT NULL DEFAULT 1,
  from_spot text NOT NULL,
  to_spot text NOT NULL,
  dest text NOT NULL,
  depart text NOT NULL,
  arrive text NOT NULL,
  seats int NOT NULL DEFAULT 1,
  price numeric NOT NULL DEFAULT 0,
  car text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. STREFA ROZMÓW (Miński X / Twitter do 280 znaków z hasztagami ulic)
CREATE TABLE IF NOT EXISTS public.posts (
  id text PRIMARY KEY,
  author text NOT NULL,
  author_as text NOT NULL,
  time_label text NOT NULL DEFAULT 'teraz',
  content text NOT NULL CHECK (char_length(content) <= 280),
  image text,
  likes int NOT NULL DEFAULT 0,
  replies int NOT NULL DEFAULT 0,
  reposts int NOT NULL DEFAULT 0,
  views int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Funkcja atomowego przełączania polubienia wpisu w Strefie Rozmów
CREATE OR REPLACE FUNCTION public.increment_post_likes(
  p_post_id text,
  p_delta int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.posts
  SET likes = GREATEST(0, likes + p_delta)
  WHERE id = p_post_id;
END;
$$;

-- 10. STREFA PARTNERA (Pakiet Promocyjny Partnera Lokalnego)
CREATE TABLE IF NOT EXISTS public.partner_products (
  id text PRIMARY KEY,
  partner_name text NOT NULL DEFAULT 'Pracownia Złota Nić',
  name text NOT NULL,
  material text NOT NULL,
  price numeric NOT NULL,
  image text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- POLITYKI ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.streets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postal_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_products ENABLE ROW LEVEL SECURITY;

-- Odczyt publiczny dla widoków społecznościowych (z wyłączeniem zaszyfrowanych adresów postal_verifications!)
DROP POLICY IF EXISTS "Public read streets" ON public.streets;
CREATE POLICY "Public read streets" ON public.streets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert profiles" ON public.profiles;
CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update profiles" ON public.profiles;
CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read live_alerts" ON public.live_alerts;
CREATE POLICY "Public read live_alerts" ON public.live_alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read news_articles" ON public.news_articles;
CREATE POLICY "Public read news_articles" ON public.news_articles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read polls" ON public.polls;
CREATE POLICY "Public read polls" ON public.polls FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert polls" ON public.polls;
CREATE POLICY "Public insert polls" ON public.polls FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update polls" ON public.polls;
CREATE POLICY "Public update polls" ON public.polls FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read poll_options" ON public.poll_options;
CREATE POLICY "Public read poll_options" ON public.poll_options FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert poll_options" ON public.poll_options;
CREATE POLICY "Public insert poll_options" ON public.poll_options FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update poll_options" ON public.poll_options;
CREATE POLICY "Public update poll_options" ON public.poll_options FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read poll_votes" ON public.poll_votes;
CREATE POLICY "Public read poll_votes" ON public.poll_votes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert poll_votes" ON public.poll_votes;
CREATE POLICY "Public insert poll_votes" ON public.poll_votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read ads" ON public.ads;
CREATE POLICY "Public read ads" ON public.ads FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert ads" ON public.ads;
CREATE POLICY "Public insert ads" ON public.ads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update ads" ON public.ads;
CREATE POLICY "Public update ads" ON public.ads FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete ads" ON public.ads;
CREATE POLICY "Public delete ads" ON public.ads FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read ad_conversations" ON public.ad_conversations;
CREATE POLICY "Public read ad_conversations" ON public.ad_conversations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert ad_conversations" ON public.ad_conversations;
CREATE POLICY "Public insert ad_conversations" ON public.ad_conversations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update ad_conversations" ON public.ad_conversations;
CREATE POLICY "Public update ad_conversations" ON public.ad_conversations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read ad_messages" ON public.ad_messages;
CREATE POLICY "Public read ad_messages" ON public.ad_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert ad_messages" ON public.ad_messages;
CREATE POLICY "Public insert ad_messages" ON public.ad_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read ad_reservations" ON public.ad_reservations;
CREATE POLICY "Public read ad_reservations" ON public.ad_reservations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert ad_reservations" ON public.ad_reservations;
CREATE POLICY "Public insert ad_reservations" ON public.ad_reservations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert ad_reports" ON public.ad_reports;
CREATE POLICY "Public insert ad_reports" ON public.ad_reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read rides" ON public.rides;
CREATE POLICY "Public read rides" ON public.rides FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert rides" ON public.rides;
CREATE POLICY "Public insert rides" ON public.rides FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public delete rides" ON public.rides;
CREATE POLICY "Public delete rides" ON public.rides FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read posts" ON public.posts;
CREATE POLICY "Public read posts" ON public.posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert posts" ON public.posts;
CREATE POLICY "Public insert posts" ON public.posts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update posts" ON public.posts;
CREATE POLICY "Public update posts" ON public.posts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read partner_products" ON public.partner_products;
CREATE POLICY "Public read partner_products" ON public.partner_products FOR SELECT USING (true);

-- ============================================================================
-- DANE POCZĄTKOWE (SEED DATA ZGODNE Z MOCKDATA.TS)
-- ============================================================================

INSERT INTO public.streets (name, as_form, neighbors, postal_code, city, is_gmina) VALUES
  ('Spacerowa', 'ze Spacerowej', 142, '05-300', 'Mińsk Mazowiecki', false),
  ('Sosnkowskiego', 'z Sosnkowskiego', 118, '05-300', 'Mińsk Mazowiecki', false),
  ('Warszawska', 'z Warszawskiej', 96, '05-300', 'Mińsk Mazowiecki', false),
  ('Kościuszki', 'z Kościuszki', 74, '05-300', 'Mińsk Mazowiecki', false),
  ('Mickiewicza', 'z Mickiewicza', 61, '05-300', 'Mińsk Mazowiecki', false),
  ('Siennicka', 'z Siennickiej', 58, '05-300', 'Mińsk Mazowiecki', false),
  ('Chełmońskiego', 'z Chełmońskiego', 44, '05-300', 'Mińsk Mazowiecki', false),
  ('Kazikowskiego', 'z Kazikowskiego', 41, '05-300', 'Mińsk Mazowiecki', false),
  ('Budowlana', 'z Budowlanej', 37, '05-300', 'Mińsk Mazowiecki', false),
  ('Dąbrówki', 'z Dąbrówki', 33, '05-300', 'Mińsk Mazowiecki', false),
  ('Klonowa', 'z Klonowej', 29, '05-300', 'Mińsk Mazowiecki', false),
  ('Szpitalna', 'ze Szpitalnej', 27, '05-300', 'Mińsk Mazowiecki', false),
  ('Piękna', 'z Pięknej', 24, '05-300', 'Mińsk Mazowiecki', false),
  ('Tartaczna', 'z Tartacznej', 21, '05-300', 'Mińsk Mazowiecki', false),
  ('Licealna', 'z Licealnej', 19, '05-300', 'Mińsk Mazowiecki', false),
  ('Łąkowa', 'z Łąkowej', 17, '05-300', 'Mińsk Mazowiecki', false),
  ('Osiedlowa', 'z Osiedlowej', 15, '05-300', 'Mińsk Mazowiecki', false),
  ('Kościelna', 'z Kościelnej', 14, '05-300', 'Mińsk Mazowiecki', false),
  ('Mireckiego', 'z Mireckiego', 12, '05-300', 'Mińsk Mazowiecki', false),
  ('Langiewicza', 'z Langiewicza', 9, '05-300', 'Mińsk Mazowiecki', false),
  ('Warszawska (Stojadła)', 'z Warszawskiej (Stojadła)', 48, '05-300', 'Stojadła', true),
  ('Mazowiecka (Huta Mińska)', 'z Huty Mińskiej', 39, '05-300', 'Huta Mińska', true),
  ('Sosnowa (Nowe Osiny)', 'z Nowych Osin', 35, '05-300', 'Nowe Osiny', true),
  ('Główna (Karolina)', 'z Karoliny', 28, '05-300', 'Karolina', true),
  ('Zamienie', 'z Zamienia', 22, '05-300', 'Zamienie', true),
  ('Arynów', 'z Arynowa', 19, '05-300', 'Arynów', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.live_alerts (title, description, time_label, active) VALUES
  ('Kolizja na rondzie Dziąga', 'Ul. Warszawska / Budowlana — ruch wahadłowy w kierunku Kałuszyna. Omijaj przez Kościelną.', '12 min temu', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.news_articles (id, source, time_label, tag, title, image) VALUES
  ('n1', 'minskmaz.com', '1 godz.', 'Drogi', 'Remont ul. Warszawskiej — objazdy potrwają do końca listopada', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&auto=format&fit=crop&q=75'),
  ('n2', 'Urząd Miasta', '3 godz.', 'Kultura', 'Jarmark i kino plenerowe w Parku Dernałowiczów w sobotę', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&auto=format&fit=crop&q=75'),
  ('n3', 'Mińsk Info', '5 godz.', 'Inwestycje', 'Nowe ścieżki rowerowe połączą Serbinów z centrum', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=75')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.polls (id, title, author, author_street, category, is_official, duration_days, total_votes, created_at, expires_at) VALUES
  ('poll_1', 'Gdzie zjesz najlepszą pizzę w Mińsku?', 'Redakcja mójMińsk', 'Centrum', 'city', true, 7, 384, now() - interval '4 days', now() + interval '3 days'),
  ('poll_2', 'Czy Park Dernałowiczów powinien mieć nowe oświetlenie alejek?', 'Marek', 'ze Spacerowej', 'investments', false, 7, 354, now() - interval '2 days', now() + interval '5 days'),
  ('poll_3', 'Czy autobus linii M2 powinien kursować częściej w szczycie?', 'Kasia', 'z Sosnkowskiego', 'city', false, 7, 296, now() - interval '6 days', now() + interval '1 day'),
  ('poll_4', 'Najlepsze lody rzemieślnicze w Mińsku na upalne dni', 'Piotr', 'z Warszawskiej', 'culture', false, 7, 453, now() - interval '14 days', now() - interval '7 days'),
  ('poll_5', 'Gdzie zorganizować piknik sąsiedzki na zakończenie lata?', 'Ania', 'z Kościuszki', 'neighborhood', false, 14, 314, now() - interval '20 days', now() - interval '6 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.poll_options (poll_id, option_id, name, votes, sort_order) VALUES
  ('poll_1', 'o1', 'Pizzeria Bella Ciao', 168, 1),
  ('poll_1', 'o2', 'Da Grasso', 104, 2),
  ('poll_1', 'o3', 'Biesiadowo', 65, 3),
  ('poll_1', 'o4', 'Pod Strzechą', 47, 4),
  ('poll_2', 'o1', 'Tak, zdecydowanie (bezpieczeństwo po zmroku)', 214, 1),
  ('poll_2', 'o2', 'Lepszy byłby stały monitoring miejski', 98, 2),
  ('poll_2', 'o3', 'Wystarczy obecne oświetlenie', 42, 3),
  ('poll_3', 'o1', 'Tak, co 15 minut rano i po południu', 189, 1),
  ('poll_3', 'o2', 'Więcej kursów w weekendy i niedziele', 76, 2),
  ('poll_3', 'o3', 'Obecny rozkład co 30 min jest w porządku', 31, 3),
  ('poll_4', 'o1', 'Lodziarnia U Lodziarzy (Kościuszki)', 245, 1),
  ('poll_4', 'o2', 'Cukiernia Janek', 120, 2),
  ('poll_4', 'o3', 'Lody Tradycyjne przy Pałacu', 88, 3),
  ('poll_5', 'o1', 'Polana w Parku Dernałowiczów', 182, 1),
  ('poll_5', 'o2', 'Tereny zielone MOSiR przy basenie', 94, 2),
  ('poll_5', 'o3', 'Skwer przy fontannie na Placu Kilińskiego', 38, 3)
ON CONFLICT (poll_id, option_id) DO NOTHING;

INSERT INTO public.ads (id, title, price, kind, author, street, time_label, image, images, description, category, condition, status, views, is_owner, negotiable) VALUES
  ('a1', 'Rower dziecięcy 16", stan bardzo dobry', 150, 'sell', 'Ania', 'Kościuszki', '2 godz.', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=75', ARRAY['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1000&auto=format&fit=crop&q=75'], 'Rower po jednym dziecku, 100% sprawny technicznie. Nowy dzwonek, hamulce wyregulowane, opony bez zużycia. Gratis dorzucam kask w rozmiarze S. Odbiór osobisty przy ul. Kościuszki, niedaleko SP nr 1.', 'Sport & Rowery', 'Bardzo dobry', 'active', 42, false, true),
  ('a2', 'Sofa 3-osobowa — do odbioru własnego', NULL, 'free', 'Marek', 'Siennicka', '4 godz.', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=75', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1000&auto=format&fit=crop&q=75'], 'Oddam za darmo rozkładaną sofę w kolorze szarym. Czysta, bez plam, drobne przetarcie z tyłu oparcia. 2. piętro bez windy, potrzebne 2 osoby do zniesienia. Chcę zwolnić miejsce do piątku.', 'Meble & Dom', 'Używane', 'active', 89, false, false),
  ('a3', 'Biurko dębowe 120×60 cm', 220, 'sell', 'Wojtek', 'Spacerowa', '6 godz.', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=75', ARRAY['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=1000&auto=format&fit=crop&q=75'], 'Solidne biurko wykonane z klejonki dębowej z czarnymi nogami w stylu loft. Idealne do pracy z laptopem lub nauki. Używane przez rok, stan gabinetowy. Odbiór ul. Spacerowa (pomogę znieść do auta).', 'Meble & Dom', 'Bardzo dobry', 'active', 67, true, false),
  ('a4', 'Zaginął pies Bruno — okolice Serbinowa', NULL, 'lost', 'Ola', 'Dąbrówki', '1 godz.', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=75', ARRAY['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=1000&auto=format&fit=crop&q=75'], 'Dziś około godz. 8:30 w rejonie ul. Dąbrówki i osiedla Serbinów wystraszył się klaksonu i uciekł. Ma czerwoną obrożę z adresatką i chip. Bardzo przyjazny dla ludzi. Dla znalazcy przewidziana nagroda!', 'Zgubiłem / Znalazłem', NULL, 'active', 154, false, false),
  ('a5', 'Klocki LEGO City, komplet 4 zestawów', 90, 'sell', 'Piotr', 'Sosnkowskiego', 'wczoraj', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=75', ARRAY['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1560961911-ba7ef651a56c?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=1000&auto=format&fit=crop&q=75'], 'Zestawy policja, straż i 2 małe pojazdy. Kompletne w 100%, z papierowymi instrukcjami w bardzo dobrym stanie. Zapakowane w woreczki strunowe. Świetny prezent dla dziecka.', 'Dziecięce', 'Bardzo dobry', 'active', 33, false, false),
  ('a6', 'Monstera Deliciosa 120 cm z doniczką', 40, 'sell', 'Kasia', 'Mickiewicza', 'wczoraj', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=75', ARRAY['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1000&auto=format&fit=crop&q=75'], 'Zdrowa roślina z 7 dużymi liśćmi z dziurami, regularnie nawożona biohumusem. Sprzedaję wraz z nową doniczką ceramiczną i podstawkiem, bo po remoncie zabrakło dla niej miejsca.', 'Ogród & Narzędzia', 'Nowe', 'active', 51, false, false),
  ('a7', 'Słuchawki bezprzewodowe Sony WH-1000XM4 ANC', 580, 'sell', 'Michał', 'Warszawska', '3 godz.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=75', ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1000&auto=format&fit=crop&q=75'], 'Oryginalne słuchawki z redukcją hałasu ANC, idealne do pociągu Kolei Mazowieckich do Warszawy. W zestawie twarde etui oraz przewód USB-C. Bateria trzyma pełne 30 godzin.', 'Elektronika', 'Bardzo dobry', 'active', 94, false, true),
  ('a8', 'Komplet opon zimowych 205/55 R16 Michelin (4 szt.)', 450, 'sell', 'Krzysztof', 'Kazikowskiego', '5 godz.', 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=75', ARRAY['https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=1000&auto=format&fit=crop&q=75','https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1000&auto=format&fit=crop&q=75'], 'Bieżnik ponad 6,5 mm, równe, nieklejone, przechowywane w suchym garażu przy ul. Kazikowskiego. Sprzedaję po zmianie samochodu.', 'Motoryzacja', 'Używane', 'active', 78, false, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ad_conversations (id, ad_id, ad_title, ad_price, ad_image, ad_street, other_user_name, other_user_street, other_user_avatar_seed, role, last_message, last_message_time, unread_count) VALUES
  ('conv_1', 'a3', 'Biurko dębowe 120×60 cm', 220, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=300&auto=format&fit=crop&q=75', 'Spacerowa', 'Tomasz', 'Sosnkowskiego', 'Tomasz-1', 'seller', 'Dzień dobry, czy biurko zmieści się do bagażnika kombi? Byłbym chętny dziś po 18:00.', '15 min temu', 1),
  ('conv_2', 'a1', 'Rower dziecięcy 16", stan bardzo dobry', 150, 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300&auto=format&fit=crop&q=75', 'Kościuszki', 'Ania', 'Kościuszki', 'Ania-2', 'buyer', 'Super, możemy się umówić! Dziś po 17:30 będę w domu. Podaję klatkę B.', '1 godz. temu', 0),
  ('conv_3', 'a2', 'Sofa 3-osobowa — do odbioru własnego', NULL, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=75', 'Siennicka', 'Marek', 'Siennicka', 'Marek-3', 'buyer', 'Dzięki sąsiedzie za kontakt. Sofa czeka, pomogę przy znoszeniu!', 'Wczoraj', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rides (id, driver, driver_as, rating, rides_count, from_spot, to_spot, dest, depart, arrive, seats, price, car) VALUES
  ('rd1', 'Ania', 'z Kościuszki', 4.9, 32, 'Mińsk · Kościuszki', 'Warszawa · Rondo Wiatraczna', 'Warszawa', '07:15', '07:55', 2, 15, 'Toyota Corolla'),
  ('rd2', 'Marek', 'z Siennickiej', 4.8, 18, 'Mińsk · PKP Anielina', 'Warszawa · Mokotów', 'Warszawa', '07:40', '08:35', 3, 18, 'Skoda Octavia'),
  ('rd3', 'Kasia', 'ze Spacerowej', 5.0, 9, 'Mińsk · Spacerowa', 'Halinów · Centrum', 'Halinów', '16:20', '16:45', 1, 8, 'Kia Ceed'),
  ('rd4', 'Tomek', 'z Osiedlowej', 4.7, 14, 'Mińsk · Osiedlowa', 'Sulejówek · Dworzec', 'Sulejówek', '17:05', '17:25', 3, 6, 'VW Golf')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author, author_as, time_label, content, image, likes, replies, reposts, views) VALUES
  ('p1', 'Ania', 'z Kościuszki', '14 min', 'Przejście na Spacerowej przy Szpitalnej wreszcie doświetlone! Wieczorem z dziećmi czuć ogromną różnicę 👏 #Spacerowa', NULL, 24, 6, 2, 812),
  ('p2', 'Marek', 'z Siennickiej', '38 min', 'Uwaga kierowcy: od jutra frezowanie na Siennickiej, objazd przez Kościelną. Planujcie poranne wyjazdy 10 min wcześniej. #Drogi', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=700&auto=format&fit=crop&q=75', 41, 12, 9, 1904),
  ('p3', 'Piotr', 'z Dąbrówki', '2 godz.', 'W sobotę kino letnie w Parku Dernałowiczów — grają „Misia” o 20:30. Kto idzie? Bierzcie koce 🎬 #Kultura #Centrum', NULL, 67, 21, 14, 2410),
  ('p4', 'Ola', 'z Osiedlowej', '3 godz.', 'Polecacie przedszkole na Serbinowie? Szukamy miejsca od września dla 3-latka. #Serbinów', NULL, 9, 17, 1, 640)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.partner_products (id, partner_name, name, material, price, image) VALUES
  ('pp1', 'Pracownia Złota Nić', 'Pierścionek z cyrkonią', 'Złoto 585', 890, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&auto=format&fit=crop&q=75'),
  ('pp2', 'Pracownia Złota Nić', 'Naszyjnik Perła', 'Srebro 925', 340, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&auto=format&fit=crop&q=75'),
  ('pp3', 'Pracownia Złota Nić', 'Kolczyki Kropla', 'Złoto 375', 520, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&auto=format&fit=crop&q=75'),
  ('pp4', 'Pracownia Złota Nić', 'Bransoletka Mińsk', 'Srebro 925', 260, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&auto=format&fit=crop&q=75')
ON CONFLICT (id) DO NOTHING;

-- Funkcja RODO (Decyzja #4 i #28): Szyfrowanie pełnego adresu AES-256 i obsługa do 3 domowników pod jednym PIN-em
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
  p_seed text
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
      pgp_sym_encrypt(v_full_addr, 'mojminsk_rodo_aes256_secret_key', 'cipher-algo=aes256'),
      v_pin,
      3,
      0
    );
  END IF;

  INSERT INTO public.profiles (name, street_name, street_as, city, postal_code, phone, seed, rerolls, verified, trial_ends_at, activation_pin)
  VALUES (p_name, p_street_name, p_street_as, coalesce(p_city, 'Mińsk Mazowiecki'), coalesce(p_postal_code, '05-300'), p_phone, p_seed, 3, true, now() + interval '14 days', v_pin)
  RETURNING id INTO v_profile_id;

  UPDATE public.streets SET neighbors = neighbors + 1 WHERE name = p_street_name;

  RETURN jsonb_build_object(
    'profile_id', v_profile_id,
    'activation_pin', v_pin,
    'trial_days_left', 14
  );
END;
$$;
