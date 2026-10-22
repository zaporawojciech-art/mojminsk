# OFICJALNY DESIGN SYSTEM & STYLEGUIDE: mójMińsk.app

> **Plik:** `UI.md`  
> **Status:** Zatwierdzony Styleguide (Na podstawie analizy 5 benchmarków i 20 decyzji UI)  
> **Kierunek artystyczny:** *Miński Fresh Minimal (Soft-Neo Organic & Dark Capsule Nav)*  
> **Data:** Październik 2026  

---

## 1. Filozofia i Kierunek Wizualny

Aplikacja łączy rzetelny, hiperlokalny miejski minimalizm z nowoczesnym, apetycznym i dynamicznym e-commerce w stylu Glovo i Dribbble top-tier apps:
- **Podstawa:** Przestronny, czysty **Light Mode** (ciepła biel `#FFFFFF` na podkładzie jasnoszarego `#F7F8FA`).
- **Nawigacja:** Ciemna kapsuła pływająca (**Dark Floating Capsule Nav Bar**) zawieszona 16px nad dolną krawędzią ekranu.
- **Kształty:** Wybitnie nowoczesne zaokrąglenia (`rounded-3xl` / `24px - 28px` dla kart i arkuszy, `rounded-full` dla przycisków CTA).
- **Fotografia produktowa:** Efekt **„Floating Packshots”** – wycięte zdjęcia potraw, świeżych owoców i produktów z Motylek Market bez tła, unoszące się nad pastelowymi kartami.

---

## 2. Paleta Kolorów i Tokeny Stylistyczne

```
+-----------------------------------------------------------------------------------+
| Kategoria         | Kolor HEX   | Zastosowanie                                     |
+-----------------------------------------------------------------------------------+
| Tło Główne        | #F7F8FA     | Podkład całej aplikacji (ciepły jasnoszary)     |
| Tło Kart          | #FFFFFF     | Czysta biel kart, arkuszy i komponentów         |
| Primary Dark      | #111827     | Główny kolor CTA, przyciski akcji, pływające nav|
| Text Primary      | #0F172A     | Nagłówki, tytuły, mocne akcenty tekstowe        |
| Text Secondary    | #64748B     | Podtytuły, czas dostawy, ulica, metadane        |
+-------------------+-------------+-------------------------------------------------+
| Motylek Market    | #059669     | Głęboka szmaragdowa zieleń, e-grocery, przycisk +|
| Pastel Mięta      | #ECFDF5     | Tło kart Motylek Market, dań świeżych i wege    |
| Pastel Błękit     | #EFF6FF     | Tło kart dań włoskich/pizzy, linia M2 ZDiTM     |
| Pastel Pomarańcz  | #FFF7ED     | Tło burgerów, promocji dnia, linia M4 ZDiTM     |
| Pastel Żółty/Beż  | #FEFCE8     | Tło piekarni Gromulski, linia M3 ZDiTM          |
| Alert / Promocja  | #EF4444     | Czerwone plakietki zniżek, rabaty %, usuwanie   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Typografia (Plus Jakarta Sans / Inter)

Wszystkie ekrany korzystają z geometrycznego, czystego kroju sans-serif o wysokim kontraście wag:
- **Display Bold (24–28px, weight 800):** Główne nagłówki sekcji (np. *„Dzień dobry, Wojtek!”*, *„Motylek Market w 35 min”*).
- **Title Semibold (16–18px, weight 600):** Nazwy dań, lokali, przystanków autobusowych.
- **Body Regular (14px, weight 400):** Opisy potraw, wpisy w Strefie Rozmów, ogłoszenia.
- **Micro Medium (11–12px, weight 500):** Czas dostawy, odznaka ulicy (`ul. Spacerowa`), liczba kalorii, ocena gwiazdkowa.

---

## 4. Architektura Komponentów (Komponent po Komponencie)

```
+------------------------------------------------------------------------+
| 1. TOP BAR: [Awatar AI] Dzień dobry, Wojtek! · 📍 ul. Spacerowa ⌄  [🔔]|
+------------------------------------------------------------------------+
| 2. SEARCH:  [ 🔍 Szukaj w Mińsku (pizza, chleb, rozkład)...  | 🎛️ Filtry]|
+------------------------------------------------------------------------+
| 3. WEATHER: [ ☀️ 18°C Słonecznie · 🍃 Powietrze: Bardzo Dobre (PM2.5: 8) ]|
+------------------------------------------------------------------------+
| 4. ZDiTM:   [🔵 M2: za 4 min]   [🟢 M3: za 11 min]   [🟠 M4: za 18 min]|
+------------------------------------------------------------------------+
| 5. BĄBLE:   (🍕 Kuchnia)  (🥦 Motylek)  (🥖 Piekarnie)  (💼 Praca)      |
+------------------------------------------------------------------------+
| 6. MOTELEK: [ SZMARAGDOWY BANER: Świeże zakupy prosto do domu w 35 min]|
|             [Jabłka 4.99 zł (+)]  [Chleb 3.80 zł (+)]  [Mleko 3.49 zł(+)]|
+------------------------------------------------------------------------+
| 7. ANKIETA: [🗳️ Gdzie najlepsza pizza? Bella Ciao 44% [====] Da Grasso]|
+------------------------------------------------------------------------+
| 8. GASTRO:  [🍕 Pizzeria Bella Ciao] Floating Packshot | ⭐ 4.8 · 30 min |
+------------------------------------------------------------------------+
| 9. C2C OGL: [Kafelek: Rower dziecięcy 150 zł · ul. Spacerowa] [Czat]   |
+------------------------------------------------------------------------+
| 10. ROZMOWY:[X-Stream: Minimalistyczny strumień wpisów oddzielony linią]|
+------------------------------------------------------------------------+
| 11. NAV:    [ ⬛ (🏠 Home)  (🛒 Zamówienia)  (💬 Rozmowy)  (👤 Profil) ⬛ ]|
+------------------------------------------------------------------------+
```

### 4.1. Top Bar i Nagłówek HOME (Decyzja #7)
- **Układ:** Awatar 3D AI po lewej stronie (zaokrąglony okrąg z subtelną obwódką) + dwuwiersz:
  - Linia 1: *„Dzień dobry, Wojtek!”* (bold 16px).
  - Linia 2: *„📍 ul. Spacerowa ⌄”* (kliknięcie pozwala przełączyć widok osiedlowy).
- **Prawa strona:** Dzwonek powiadomień z czerwoną kropką alertu.

### 4.2. Pigułka Wyszukiwarki (Pill Search) (Decyzja #8)
- Zaokrąglona pełna pigułka (`rounded-full`) o wysokości 48px z białym tłem i delikatnym cieniem.
- Placeholder z rotującym tekstem: *„Szukaj w Mińsku (pizza, chleb, rozkład M2)...”*.
- Dedykowany okrągły przycisk suwaków filtrów po prawej stronie.

### 4.3. Widżet Pogody i Jakości Powietrza (Decyzja #9)
- Estetyczna karta z subtelnym, pastelowym niebiesko-zielonym gradientem (`from-sky-50 to-emerald-50`).
- Po lewej: duża temperatura (np. `18°C`) + ikona słońca/chmurki.
- Po prawej: kolorowa pigułka jakości powietrza (zielona `PM2.5: 8 µg/m³ · Bardzo dobra` lub żółta/czerwona przy smogu).

### 4.4. Moduł Autobusowy ZDiTM (Linie M2, M3, M4) (Decyzja #10)
- Trzy wyraziste, zaokrąglone kafelki z numerami linii:
  - **Linia M2 (Błękitna):** `[ M2 ]` Najbliższy: *Serbinów* -> **za 4 min**.
  - **Linia M3 (Zielona):** `[ M3 ]` Najbliższy: *Osiedlowa* -> **za 11 min**.
  - **Linia M4 (Pomarańczowa):** `[ M4 ]` Najbliższy: *Dworzec PKP* -> **za 18 min**.
- Kliknięcie w linię rozwija szybki podgląd kolejnych przystanków na trasie.

### 4.5. Górne Bąble Kategorii (Category Bubbles Glovo-Style) (Decyzja #4)
- Horyzontalny rząd przewijanych bąbli o okrągłym kształcie z wyciętymi fotografiami 3D:
  - `( 🍕 Restauracje )`
  - `( 🥦 Motylek Market )` (ze szmaragdową obwódką)
  - `( 🥖 Piekarnie & Cukiernie )`
  - `( 💼 Oferty Pracy )`
  - `( 📦 Ogłoszenia Sąsiedzkie )`
  - `( 🚗 Carpooling & Taxi )`

### 4.6. Dedykowana Strefa mGrocery: Motylek Market (Decyzja #14)
- **Szmaragdowy baner Hero:** Głęboka zieleń `#059669` z hasłem: *„Motylek Market – świeże zakupy spożywcze u Twoich drzwi w 35 min!”*.
- **Siatka produktów e-grocery:** 2-kolumnowa siatka ze świeżymi owocami, nabiałem, pieczywem.
- Każdy produkt posiada wycięte zdjęcie "floating item", nazwę, cenę i **okrągły szmaragdowy przycisk `+`** do natychmiastowego wrzucenia do koszyka.

### 4.7. Karty Gastronomiczne i Karta Szczegółów (Bottom Sheet) (Decyzje #5, #6, #15)
- **Karty dań:** Wycięte zdjęcia potraw unoszące się nad pastelową kartą (np. Burger z chrupiącą sałatą unoszący się nad miętowym tłem).
- **Bottom Sheet:** Kliknięcie w potrawę nie przeładowuje strony – od dołu płynnie wysuwa się biały, zaokrąglony arkusz z dużym zdjęciem, selektorem dodatków/sosów, licznikiem ilości (`- 01 +`) oraz czarnym przyciskiem `[ Dodaj do koszyka · 24,00 zł ]`.

### 4.8. Karta Śledzenia Zamówienia & Kuriera mójMińsk (Decyzja #16)
- Estetyczna karta w toku dostawy:
  - Zdjęcie i imię kuriera: *„Kamil · Twój Kurier mójMińsk”*.
  - Status: *„W drodze do ul. Spacerowej (dostawa za ok. 14 min)”*.
  - Dwa okrągłe przyciski szybkiej akcji: **Czat z kurierem** oraz **Zadzwoń do kuriera**.

### 4.9. Karty Ogłoszeń C2C i Ofert Pracy B2C (Decyzje #12, #13)
- **Ogłoszenia C2C:** 2-kolumnowa siatka kafelków ze zdjęciem, pogrubioną ceną, szarą pigułką ulicy (np. `ul. Spacerowa`) i przyciskiem szybkiego czatu.
- **Płatna Oferta Pracy (B2C):** Wyróżniony boks ze złotym/grafitowym akcentem, nazwą firmy, widełkami (np. *„6 000 – 8 000 zł brutto”*) oraz czarną pigułką **„Szybka Aplikacja (1-Click)”**.

### 4.10. Strefa Rozmów (X / Twitter dla Mińska) (Decyzja #18)
- Zgodnie z Twoim wyborem: **minimalistyczny, ciągły strumień wpisów bez grubych obramowań kart, oddzielony wyłącznie subtelną poziomą linią** (dokładnie jak na X/Twitterze).
- Przy każdym poście:
  - Awatar 3D AI autora.
  - Podpis: **Imię ze Spacerowej** (np. `Wojtek ze Spacerowej · 18 min temu`).
  - Treść do 280 znaków + opcjonalne zdjęcie.
  - Pasek akcji: Serduszko polubienia (z licznikiem) + dymek odpowiedzi + hasztag uliczny (np. `#Spacerowa`).

### 4.11. Pływający Bąbel Koszyka (Floating Cart Pill) (Decyzja #19)
- Gdy w koszyku znajduje się minimum 1 produkt, nad dolnym menu pojawia się zaokrąglona czarna pigułka koszyka:
  - Po lewej: `🛒 3 artykuły · 68,00 zł`.
  - W środku/pod spodem pasek postępu: *„Dodaj jeszcze 52 zł do darmowej dostawy z Motylek Market!”*.
  - Po prawej: Przycisk `[ Zobacz koszyk -> ]`.

### 4.12. Pływające Menu Dolne (Dark Floating Capsule) (Decyzja #2)
- Nowoczesna czarna wyspa zawieszona 16px nad dołem ekranu (`#111827`, zaokrąglenie `rounded-full`, padding 8px 16px).
- Ikony z białym stanem aktywnym:
  - `[ 🏠 Home ]` (aktywna biała pigułka z czarnym tekstem)
  - `[ 🛍️ Zakupy & Kuchnia ]`
  - `[ 📦 Ogłoszenia ]`
  - `[ 💬 Rozmowy ]`
  - `[ 👤 Profil ]`

---

## 5. Analiza Drugiej Paczki Benchmarków (Pogoda 3D, Smart City, AI E-Commerce)

Druga paczka screenów przynosi inspiracje w 4 strategicznych obszarach aplikacji mójMińsk:

```
+---------------------------------------------------------------------------------+
|                         NOWE WZORCE Z DRUGIEJ PACZKI                            |
+---------------------------------------------------------------------------------+
| 1. Pogoda & Smog          | Błyszczące ikony 3D aury, siatka 2x3 metryk, łuk     |
|                           | trajektorii wschodu/zachodu słońca, oś godzinowa     |
| 2. Smart City & Ekologia  | Karty wydarzeń miejskich w Parku Miejskim w Mińsku,  |
|                           | czujniki środowiskowe (hałas, zieleń, czyste rzeki)  |
| 3. Inteligentny Koszyk    | Dynamiczny boks oszczędności ("Brakuje Ci 12 zł do   |
|                           | darmowej dostawy"), inteligentne zestawy dań z rabatem|
| 4. Asystent / AI Helper   | Maskotka pomocnika miejskiego/kulinarnego z szybkimi |
|                           | promptami ("Co zjeść?", "Kiedy autobus M3?")        |
+---------------------------------------------------------------------------------+
```

### 5.1. Zaawansowany Widżet Pogody i Smogu (Inspiracja Monterey / California)
- **Warstwa Wizualna:** Duża, błyszcząca trójwymiarowa chmura 3D ze słońcem lub deszczem, temperatura z dokładnością do stopni odczuwalnych (`Real feel`).
- **Siatka Parametrów Środowiskowych (2x3):**
  - Jakość powietrza (ikona liścia + AQI z normą GIOŚ).
  - Ciśnienie atmosferyczne (hPa).
  - Indeks UV oraz ryzyko opadów (mm).
  - Prędkość i kierunek wiatru (km/h).
  - Widoczność miejska (km).
- **Łuk Słońca (Sunrise / Sunset Arc):** Wizualny wykres trajektorii słońca z godziną wschodu i zachodu nad Mińskiem Mazowieckim.
- **Pozioma Oś Czasu:** Przewijana prognoza na najbliższe 6 godzin.

### 5.2. Inteligentny Koszyk & Smart Bundling w Strefie Kuchni i Motylek Market
- **Pasek Dynamicznych Oszczędności:** *„Brakuje Ci tylko 8 zł do darmowej dostawy z Motylek Market – dodaj pączka z Piekarni Gromulski!”*.
- **AI Bundle Deals:** Połączenie dania z napojem w promocyjnym zestawie (np. *„Zestaw Obiad + Kompot -15%”*).

### 5.3. Moduł Parku Miejskiego i Życia Miasta (Inspiracja GreenPark)
- Prezentacja wydarzeń w Parku Miejskim im. Dernałowiczów w Mińsku Mazowieckim (np. joga na trawie, piknik historyczny, kino letnie).
- Czyste karty wydarzeń ze statusem otwarcia i odległością w kilometrach.

---

## 6. Zatwierdzona Specyfikacja Komponentów z Paczki 2 (Decyzje #49–#68)

Poniżej zestawiono finalne wytyczne UX/UI wynikające z Twoich 20 odpowiedzi:

### 6.1. Ekran Pogody i Smogu (Decyzje #49, #50, #51, #52, #55)
- **Ikony Aury 3D:** Błyszczące, trójwymiarowe ikony słońca, chmur z kroplami deszczu i błyskawicami (dokładnie jak na benchmarku Monterey).
- **Struktura na HOME:**
  - W stanie spoczynku: elegancka, kompaktowa karta z temperaturą (`18°C`), temperaturą odczuwalną (`Real feel 16°C`) i kolorową pigułką jakości powietrza (`PM2.5: 8 µg/m³ · Bardzo dobra`).
  - Po tapnięciu: płynne rozwinięcie arkusza z **pełną siatką 2x3 parametrów**: wiatr (km/h), wilgotność (%), indeks UV, ciśnienie (hPa), opady (mm) i widoczność (km).
  - **Łuk Słońca (Sunrise / Sunset Arc):** Wizualny wykres trajektorii słońca z godziną wschodu (np. `05:36`) i zachodu (`18:24`) nad Mińskiem Mazowieckim.
  - **Prognoza Godzinowa:** Poziomy, przewijany horyzontalnie pasek z ikonami pogody i temperaturami na najbliższe 6–8 godzin.
- **Pasek Eko-Mińsk:** Dyskretny pasek pod pogodą: `🍃 Powietrze: Czyste · 🌳 Tereny zielone Mińska: 42% · 💧 Rzeka Srebrna: Czysta`.

### 6.2. Życie Miasta & Park Dernałowiczów (Decyzje #53, #54, #67)
- **Karta HOME „Co dzieje się w Parku Miejskim?”:**
  - Prezentacja wydarzeń kulturalnych, sportowych i rekreacyjnych w Parku Miejskim im. Dernałowiczów (np. kino plenerowe, poranny bieg, warsztaty).
  - Czyste karty wydarzeń: zdjęcie w tle, data, godzina, odległość w km i przycisk `[ Dołącz / Zapisz ]`.
- **Interaktywna Mapa Mińska:** Subtelna integracja z mapą (Leaflet / OpenStreetMap) pokazująca przystanki M2/M3/M4, sklepy Motylek Market oraz punkty rekreacyjne.

### 6.3. Inteligentny E-Commerce, Koszyk i Motylek Market (Decyzje #56, #57, #59, #60, #63, #65)
- **Smart Cart Upsell:** Ciemny boks oszczędności w koszyku:  
  *„Brakuje Ci 14 zł do darmowej dostawy z Motylek Market – dodaj pieczywo Gromulski!”*.
- **Pozycje Menu i Tagi:** Klasyczne pozycje restauracji z dwiema podstawowymi, czytelnymi odznakami: **`[🌱 Wege]`** oraz **`[🥩 Mięsne]`**.
- **Składniki Dania (Bottom Sheet):** Horyzontalny rząd okrągłych kafelków ze zdjęciami składników, ich gramaturą i nazwą (np. *Sos pomidorowy*, *Mozzarella 150g*, *Bazylia*).
- **Ceny Promocyjne:** Przekreślona stara cena na szaro + nowa cena pogrubiona na czarno/zielono + czerwona pigułka rabatu (`-20%`).
- **Wskaźnik Śledzenia Zamówienia:** Animowany pasek postępu z 4 etapami i odliczaniem minut:  
  `[ 1. Zamówione ] -> [ 2. Przygotowywane ] -> [ 3. Kurier odebrał ] -> [ 4. U Ciebie ]`.

### 6.4. Wyszukiwarka, Pomocnik AI i Alerty Live (Decyzje #58, #61, #62, #64)
- **Czipy Sugestii (Search Chips):** Przewijany rząd pod wyszukiwarką:  
  `[ 🚌 Rozkład M2 ]` `[ 🍕 Najlepsza pizza ]` `[ 🥦 Motylek gazetka ]` `[ 💼 Praca Mińsk ]` `[ 🚕 Nova Taxi ]`.
- **„Miński Pomocnik AI”:** Przyjazny wirtualny asystent miejski dostępny pod ikoną bąbla, który odpowiada na pytania mieszkańców o rozkłady ZDiTM, poleca dania z restauracji i podpowiada godziny otwarcia sklepów.
- **Alert Kryzysowy / Wypadek LIVE:** Wyrazisty czerwono-pomarańczowy pasek z wykrzyknikiem i pulsującą czerwoną kropką `● LIVE` na samej górze ekranu HOME.

### 6.5. Onboarding i Kupony Powitalne (Decyzje #66, #68)
- **Onboarding Walkthrough:** 3 krótkie, eleganckie slajdy powitalne ze zdjęciami Mińska Mazowieckiego przed formularzem rejestracji:
  1. *Zweryfikowani sąsiedzi z Twojej ulicy – 100% bez spamu i trolli.*
  2. *Rozkłady autobusów M2/M3/M4, jedzenie i zakupy z Motylek Market w 35 min.*
  3. *Odbierz fizyczny list z kodem i 5 kuponami rabatowymi od lokalnych firm!*
- **Kupony Rabatowe:** Zgodnie z decyzją biznesową kupony funkcjonują **wyłącznie w formie tradycyjnych voucherów papierowych w liście weryfikacyjnym**, co gwarantuje fizyczne otwarcie przesyłki i realne odwiedzenie mińskich sklepów stacjonarnych.


