# mójMińsk.app 🏙️

> **Hiperlokalna, bezpieczna aplikacja mobilna (PWA) wyłącznie dla zweryfikowanych mieszkańców Mińska Mazowieckiego (*„Imię z ulicy...”*).**

![mójMińsk](https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80)

---

## 🎨 Paleta Barw i Wytyczne Wizualne (WCAG 4.5:1)

Interfejs aplikacji bazuje na unikalnej, nowoczesnej palecie barw:

| Token | Hex | Rola w Systemie UI |
|---|---|---|
| **Mist** | `#F0EFF4` | Neutralne tło aplikacji, subtelne obrysy, karty |
| **Sand** | `#EBC999` | Ciepłe akcenty informacyjne (ZDiTM, odznaki, pogoda) |
| **Sky** | `#8CA9D3` | Tagi C2C, wskaźniki jakości powietrza, transport |
| **Coral** | `#F26659` | **Główny kolor CTA** (przyciski, koszyk, alerty drogowe) |
| **Ink** | `#1F1D2B` | **Głęboki antracyt** (typografia, ciemny dok dolnej nawigacji) |

---

## 🚀 Zaimplementowane Moduły i Funkcjonalności

### 1. Weryfikacja Listowa i Onboarding (2-etapowy)
- Wybór imienia oraz ulicy (skróty do najpopularniejszych: *ul. Warszawska*, *Kazikowska*, *Konstytucji 3 Maja*).
- Generowanie unikalnego awatara z opcją 3-krotnego losowania (dice reroll).
- Formularz zamówienia fizycznego listu z **6-cyfrowym kodem PIN** oraz pakietem **5 kuponów zniżkowych na start (2 500 zł wartości bootstrapu)**.
- 14-dniowy bezpłatny okres próbny z licznikiem w profilu.
- Szybki tryb demonstracyjny `Pomiń (demo)` dla natychmiastowego testowania.

### 2. Ekran Główny (Home Dashboard)
- **Karta Pogody & Jakości Powietrza:** Łuk słoneczny, wiatr, wilgotność, indeks UV, ciśnienie, dane stacji GIOŚ Mińsk Mazowiecki.
- **Live Alert DK92:** Ostrzeżenia o utrudnieniach i wypadkach na trasie tranzytowej na żywo.
- **Odjazdy ZDiTM na żywo:** Podgląd linii M2, M3, M4 z najbliższymi minutami do odjazdu.
- **Sonda Tygodnia:** Interaktywne głosowanie w czasie rzeczywistym z animowanymi słupkami poparcia (np. *„Gdzie najlepsza pizza w Mińsku?”*).
- **Strefa Sponsora Nova Taxi:** Szybki kontakt telefoniczny z rabatem dla mieszkańców.
- **Szybkie wsparcie BLIK:** Mikrodotacja na utrzymanie niezależnego medium miejskiego.

### 3. Dedykowany Ekran Motylek Market
- **Wyłączność mGrocery:** Lokalna sieć sklepów **Motylek Market** (ul. Siennicka 14).
- **Cyfrowa Gazetka Promocyjna:** Horyzontalny slider z hitami cenowymi tygodnia (rabaty do -30%).
- **Alejki sklepowe:** *Pieczywo, Nabiał i jaja, Warzywa i owoce, Wędliny i mięso, Napoje i kawa, Dom i chemia*.
- **Pasek darmowej dostawy:** Dynamiczny licznik brakującej kwoty do progu 120 zł.
- **Interaktywny koszyk:** Natychmiastowe steppery ilości zintegrowane z globalnym koszykiem.

### 4. Gastronomia i Spiżarnia (Model Glovo / Wolt)
- Lokalne restauracje (m.in. **Pizzeria Bella Ciao**, Burger Stacja, Sushi Kōen, Piekarnia Gromulski).
- Pływające packshoty potraw bez tła (*Floating Packshots*).
- Dolny arkusz produktu (**Vaul Bottom Sheet**) z wyborem składników i gramatury.
- Śledzenie aktywnego kuriera rowerowego.

### 5. Pełny Proces Kasy, BLIK i Śledzenie Zamówienia
- Wybór metody dostawy: *Kurier mójMińsk (35 min)* vs *Odbiór osobisty w Motylku (0 zł)*.
- Adres dostawy i instrukcje dla kuriera (kod domofonu, piętro, telefon).
- Obsługa kuponu powitalnego **`MINSK15`** (-15 zł rabatu).
- **Płatność BLIK z 6-cyfrowym kodem i odliczaniem 120 sekund** na autoryzację w banku.
- **Live Order Tracking:** Oś czasu zamówienia (*Opłacone -> Skompletowane -> Kurier w drodze -> Doręczone*) z kartą kuriera rowerowego.

### 6. Pełny Rozkład ZDiTM z Interaktywną Mapą
- Linie **M2**, **M3**, **M4** z podziałem na dni powszednie, soboty i niedziele.
- Zmiana relacji i kierunku trasy.
- **Interaktywna mapa wektorowa SVG** ze wszystkimi przystankami i animowaną pinezką autobusu na żywo (LIVE GPS).
- Tabliczki przystankowe z estymacją minutową i pełną siatką godzinową odjazdów.
- Taryfa: 100% bezpłatna komunikacja miejska.

### 7. Ogłoszenia Sąsiedzkie C2C & Praca B2C
- Formularz dodawania ogłoszenia (*Sprzedam, Oddam, Zgubione*) ze zdjęciem i znacznikiem ulicy.
- Publikacja ofert pracy dla mińskich firm (10 zł BLIK).
- **Bezpieczny czat sąsiedzki 1:1:** Prywatne wiadomości bez ujawniania numeru telefonu z symulacją inteligentnej odpowiedzi sąsiada.

### 8. Transport i Podwózki (Carpooling)
- Tablica podwózek do Warszawy, Halinowa i Sulejówka z ocenami kierowców i wolnymi miejscami.
- Szybkie zamówienie Nova Taxi.

### 9. Strefa Rozmów (Sąsiedzki Mikroblog)
- Mikroblog w stylu X/Twittera do 280 znaków.
- Kanały tematyczne i hashtagi (`#DK92`, `#ZDiTM`, `#Zgubiono`, `#Kultura`).

---

## 🛠️ Stack Technologiczny

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + PostCSS (dedykowana paleta kolorystyczna)
- **Komponenty & Gestures:** Vaul Drawer, Radix UI primitives, Lucide React Icons
- **PWA:** Vite PWA Plugin, Web App Manifest, Service Worker
- **Architektura:** Mobile-first PWA z responsywną ramką podglądu smartfona na desktopie

---

## 💻 Instalacja i Uruchomienie

```bash
# 1. Klonowanie repozytorium
git clone https://github.com/zaporawojciech-art/mojminsk.git
cd mojminsk

# 2. Instalacja zależności
npm install

# 3. Uruchomienie serwera deweloperskiego
npm run dev

# 4. Kompilacja produkcyjna
npm run build
```

Aplikacja domyślnie uruchamia się pod adresem: `http://localhost:5173/`

---

## 📄 Dokumentacja Projektowa

- **[DOKUMENTACJA_PRODUKTOWA_MOJMINSK.md](DOKUMENTACJA_PRODUKTOWA_MOJMINSK.md)** – Pełna dokumentacja biznesowa, PRD, schemat bazy PostgreSQL, model finansowy i analiza strategiczna.
- **[UI.md](UI.md)** – Specyfikacja design systemu, tokeny kolorystyczne, typografia i zasady UX.
