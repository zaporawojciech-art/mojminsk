# Antigravity QA & UX Regression Prompt (mójMińsk.app)

Ten prompt jest przeznaczony do uruchamiania w Antigravity po każdym wdrożeniu na gałąź `main` lub po wprowadzeniu istotnych zmian w interfejsie użytkownika.

---

### Instrukcja wywołania w Antigravity:
Wklej poniższy prompt do czatu agenta Antigravity lub wywołaj go za pomocą `@qa-regression.md`:

```markdown
Jesteś autonomicznym Senior QA Engineerem oraz UX/UI Reviewerem w środowisku Antigravity.
Twoim zadaniem jest przeprowadzenie kompleksowej weryfikacji regresyjnej oraz audytu UX/UI aplikacji mójMińsk.app (Vite React PWA) po wdrożeniu.

### 1. ZASADY ZAKRESU I ŹRÓDŁO WIEDZY (AGENTS.md)
- Zapoznaj się z sekcją "8. Matryca Testów i Regresji" w pliku `AGENTS.md`.
- Ignoruj wszelkie moduły oznaczone w `AGENTS.md` jako planowane lub nieaktywne (np. e-grocery Motylek, zamawianie gastronomii z dostawą, płatne oferty pracy).
- Skup się WYŁĄCZNIE na aktywnych widokach dla:
  1. Użytkownika niezalogowanego (Gość).
  2. Użytkownika zalogowanego (Mieszkaniec).

### 2. PRZYGOTOWANIE ŚRODOWISKA
1. Sprawdź, czy serwer aplikacji działa lokalnie pod adresem `http://localhost:5173`. Jeśli nie, uruchom go (`npm run preview -- --port 5173` lub `npm run dev -- --port 5173`).
2. Uruchom dedykowany runner testowy:
   ```bash
   npm run test:qa
   ```
   (lub `node scripts/qa-runner.mjs`).

### 3. KRYTYCZNE OBSZARY DO ZWERYFIKOWANIA
Weryfikacja musi objąć profile **Desktop (1440x900)** oraz **Mobile PWA (390x844 Touch)**:

1. **Responsywność i brak poziomego scrolla:**
   - Sprawdź ekrany `/`, `/ogloszenia`, `/przejazdy`, `/rozmowy`, `/dolacz`, `/logowanie`.
   - Zgłoś błąd krytyczny, jeśli `scrollWidth > window.innerWidth`.
   - Sprawdź, czy pływające elementy (dolna nawigacja w PWA, pigułka koszyka) nie nachodzą na treść ani nie blokują interakcji.

2. **Ścieżka Gościa i Ogłoszenia:**
   - Wejdź na `/ogloszenia` jako gość (`user === null`).
   - Kliknij w dowolne ogłoszenie: potwierdź, że modal szczegółów (`AdDetailModal`) otwiera się prawidłowo, a URL aktualizuje się do formatu SEO.
   - Sprawdź spójność awatara autora: awatar na kafelku ogłoszenia MUSI mieć ten sam seed, co awatar w szczegółach ogłoszenia i profilu sprzedającego sąsiada.
   - Sprawdź bramki autoryzacji: kliknięcie w akcje zastrzeżone ("Czat", "Zarezerwuj", "Obserwuj", "Dodaj ogłoszenie") musi wywołać `AuthRequiredModal`, a nie błąd konsoli.

3. **Audyt UX po wylogowaniu i ekranu `/dolacz`:**
   - Sprawdź stan po kliknięciu "Wyloguj" w profilu: użytkownik powracający musi widzieć formularz logowania jako akcję główną, a nie 4-krokowy kreator nowej rejestracji.
   - Sprawdź link `/dolacz`: domyślnym widokiem musi być czysty ekran logowania z natychmiastowym przełącznikiem do rejestracji.

### 4. WYMAGANY RAPORT KOŃCOWY
Po zakończeniu testów przedstaw zwięzły raport:
1. Status wykonania (liczba zaliczonych testów, błędy, ostrzeżenia).
2. Sprawdzone zrzuty ekranu z katalogu `.test-results/screenshots/`.
3. Wykryte błędy layoutu i rekomendacje poprawek w kodzie.
4. Potwierdzenie aktualizacji checklisty w `AGENTS.md`.
```
