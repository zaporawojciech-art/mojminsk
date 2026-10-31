#!/usr/bin/env node
import { chromium, devices } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = process.env.TARGET_URL || process.argv.find((a) => a.startsWith('--url='))?.split('=')[1] || 'http://localhost:5173';
const SCREENSHOT_DIR = resolve(process.cwd(), '.test-results/screenshots');

if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

console.log(`\n======================================================`);
console.log(`🚀 [mójMińsk.app] Automatyczny Runner QA & UX Reviewer`);
console.log(`🎯 Cel: ${BASE_URL}`);
console.log(`📁 Zrzuty ekranu: ${SCREENSHOT_DIR}`);
console.log(`======================================================\n`);

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

function pass(name, detail = '') {
  results.passed.push({ name, detail });
  console.log(`  ✅ [PASS] ${name} ${detail ? `(${detail})` : ''}`);
}

function fail(name, error) {
  results.failed.push({ name, error: String(error) });
  console.log(`  ❌ [FAIL] ${name} -> ${error}`);
}

function warn(name, note) {
  results.warnings.push({ name, note });
  console.log(`  ⚠️  [WARN] ${name} -> ${note}`);
}

async function checkHorizontalOverflow(page, routeName) {
  try {
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
      const clientWidth = window.innerWidth;
      return {
        hasOverflow: scrollWidth > clientWidth + 1.5,
        scrollWidth,
        clientWidth,
      };
    });

    if (overflow.hasOverflow) {
      fail(`Overflow w ${routeName}`, `scrollWidth (${overflow.scrollWidth}px) > viewport (${overflow.clientWidth}px)`);
    } else {
      pass(`Brak poziomego scrolla: ${routeName}`);
    }
  } catch (err) {
    if (err.message.includes('Execution context was destroyed')) {
      await page.waitForTimeout(800);
      const overflow = await page.evaluate(() => ({
        hasOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > window.innerWidth + 1.5,
        scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        clientWidth: window.innerWidth,
      }));
      if (overflow.hasOverflow) {
        fail(`Overflow w ${routeName}`, `scrollWidth (${overflow.scrollWidth}px) > viewport (${overflow.clientWidth}px)`);
      } else {
        pass(`Brak poziomego scrolla: ${routeName}`);
      }
    } else {
      throw err;
    }
  }
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // -------------------------------------------------------------------------
    // 1. PROFIL DESKTOP (1440x900)
    // -------------------------------------------------------------------------
    console.log(`\n🖥️  [FAZA 1] Testy Responsywności & Funkcjonalne DESKTOP (1440x900)...`);
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const desktopPage = await desktopContext.newPage();

    // 1.1 Home Screen
    try {
      await desktopPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await desktopPage.waitForTimeout(500);
      await checkHorizontalOverflow(desktopPage, 'Desktop HOME');
      await desktopPage.screenshot({ path: `${SCREENSHOT_DIR}/desktop-home.png`, fullPage: false });
      pass('Desktop HOME załadowany i zrzut zapisany');
    } catch (e) {
      fail('Desktop HOME', e.message);
    }

    // 1.2 Ogłoszenia jako Gość (Guest)
    let cardAvatarSeed = null;
    let clickedAdTitle = null;

    try {
      await desktopPage.goto(`${BASE_URL}/ogloszenia`, { waitUntil: 'domcontentloaded' });
      await desktopPage.waitForTimeout(800);
      await checkHorizontalOverflow(desktopPage, 'Desktop Ogłoszenia');
      await desktopPage.screenshot({ path: `${SCREENSHOT_DIR}/desktop-ads.png` });

      // Szukamy pierwszej karty ogłoszenia (widocznej)
      const firstCard = desktopPage.locator('article:visible').first();
      await firstCard.waitFor({ timeout: 5000 });

      // Sprawdzamy awatar autora na karcie
      const cardAvatarImg = firstCard.locator('img[src*="dicebear"]').first();
      if (await cardAvatarImg.count() > 0) {
        const src = await cardAvatarImg.getAttribute('src');
        const match = src?.match(/seed=([^&]+)/);
        cardAvatarSeed = match ? decodeURIComponent(match[1]) : null;
        pass('Awatar na karcie ogłoszenia odczytany', `seed: ${cardAvatarSeed}`);
      } else {
        warn('Awatar na karcie ogłoszenia', 'Brak elementu DiceBear img na pierwszej karcie');
      }

      // Klikamy w ogłoszenie
      const cardLink = firstCard.locator('a').first();
      clickedAdTitle = (await firstCard.innerText()).split('\n')[0];
      await cardLink.click();
      await desktopPage.waitForTimeout(600);

      const currentUrl = desktopPage.url();
      if (currentUrl.includes('/ogloszenia/')) {
        pass('Przejście do URL ogłoszenia', currentUrl);
      } else {
        fail('Przejście do URL ogłoszenia', `Oczekiwano URL z /ogloszenia/, otrzymano: ${currentUrl}`);
      }

      // Weryfikacja czy AdDetailModal się wyrenderował dla GOŚCIA
      const detailContainer = desktopPage.locator('[class*="AdDetailModal"], div:has(h1, h2, h3):has-text("Sprzedający sąsiad"), div:has-text("Szczegóły ogłoszenia")').first();
      const modalExists = (await desktopPage.locator('text=Sprzedający sąsiad').count()) > 0 || (await desktopPage.locator('button:has-text("Obserwuj")').count()) > 0;

      if (modalExists) {
        pass('Szczegóły ogłoszenia (AdDetailModal) otwarte dla gościa');
        await desktopPage.screenshot({ path: `${SCREENSHOT_DIR}/desktop-ad-detail.png` });

        // Sprawdzenie spójności awatara sprzedawcy w modalu
        const modalAvatarImg = desktopPage.locator('text=Sprzedający sąsiad').locator('..').locator('..').locator('img[src*="dicebear"]').first();
        if (await modalAvatarImg.count() > 0) {
          const modalSrc = await modalAvatarImg.getAttribute('src');
          const modalMatch = modalSrc?.match(/seed=([^&]+)/);
          const modalAvatarSeed = modalMatch ? decodeURIComponent(modalMatch[1]) : null;

          if (cardAvatarSeed && modalAvatarSeed && cardAvatarSeed === modalAvatarSeed) {
            pass('Spójność awatarów', `Awatar na karcie (${cardAvatarSeed}) odpowiada awatarowi w modalu (${modalAvatarSeed})`);
          } else {
            fail('Spójność awatarów', `Niezgodność! Karta: ${cardAvatarSeed} vs Modal: ${modalAvatarSeed}`);
          }
        }
      } else {
        fail('Szczegóły ogłoszenia dla gościa', 'Modal ze szczegółami ogłoszenia nie wyrenderował się po kliknięciu!');
      }

    } catch (e) {
      fail('Test Ogłoszeń Desktop', e.message);
    }

    // -------------------------------------------------------------------------
    // 2. PROFIL MOBILE PWA (iPhone 14 / Safari - 390x844)
    // -------------------------------------------------------------------------
    console.log(`\n📱 [FAZA 2] Testy Responsywności & PWA MOBILE (390x844 Touch)...`);
    const mobileContext = await browser.newContext({
      ...devices['iPhone 14'],
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobileContext.newPage();

    // 2.1 PWA Home Screen
    try {
      await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await mobilePage.waitForTimeout(500);
      await checkHorizontalOverflow(mobilePage, 'Mobile PWA HOME');
      await mobilePage.screenshot({ path: `${SCREENSHOT_DIR}/mobile-home.png` });
      pass('Mobile PWA HOME załadowany');
    } catch (e) {
      fail('Mobile PWA HOME', e.message);
    }

    // 2.2 PWA Ogłoszenia
    try {
      await mobilePage.waitForTimeout(600);
      await mobilePage.goto(`${BASE_URL}/ogloszenia`, { waitUntil: 'domcontentloaded' });
      await mobilePage.waitForTimeout(600);
      await checkHorizontalOverflow(mobilePage, 'Mobile PWA Ogłoszenia');
      await mobilePage.screenshot({ path: `${SCREENSHOT_DIR}/mobile-ads.png` });

      // Sprawdzenie czy dolna nawigacja nie przesłania zawartości
      const bottomNav = mobilePage.locator('nav').last();
      if (await bottomNav.count() > 0) {
        pass('Pływająca dolna nawigacja obecna na mobile');
      }

      // Test otwarcia ogłoszenia na mobile (widocznego)
      const firstMobileCard = mobilePage.locator('article:visible').first();
      await firstMobileCard.waitFor({ timeout: 5000 });
      await firstMobileCard.locator('a').first().click();
      await mobilePage.waitForTimeout(500);

      const mobileModalShown = (await mobilePage.locator('text=Sprzedający sąsiad').count()) > 0 || (await mobilePage.locator('button:has-text("Czat")').count()) > 0;
      if (mobileModalShown) {
        pass('Mobile PWA: Szczegóły ogłoszenia otwarte');
        await mobilePage.screenshot({ path: `${SCREENSHOT_DIR}/mobile-ad-detail.png` });

        // Kliknięcie w "Czat" jako gość -> oczekiwany AuthRequiredModal
        const chatButton = mobilePage.locator('button:has-text("Czat")').first();
        if (await chatButton.count() > 0) {
          await chatButton.click();
          await mobilePage.waitForTimeout(400);

          const authModalShown = (await mobilePage.locator('text=Aby wysłać wiadomość').count()) > 0 || (await mobilePage.locator('text=Zaloguj się').count()) > 0;
          if (authModalShown) {
            pass('Mobile PWA: Ochrona akcji gościa (AuthRequiredModal pokazał się poprawnie)');
          } else {
            warn('Mobile PWA: Ochrona akcji', 'Nie wykryto modalu AuthRequiredModal po kliknięciu Czat');
          }
        }
      } else {
        fail('Mobile PWA: Otwarcie ogłoszenia', 'Szczegóły nie otworzyły się na ekranie 390x844');
      }

    } catch (e) {
      fail('Mobile PWA Ogłoszenia', e.message);
    }

    // -------------------------------------------------------------------------
    // 3. AUDYT UX ŚCIEŻKI /dolacz i /logowanie
    // -------------------------------------------------------------------------
    console.log(`\n🔑 [FAZA 3] Audyt UX Ścieżki /dolacz, /logowanie oraz Powracający Użytkownik...`);
    try {
      // 3.1 Bezpośrednie wejście na /dolacz
      await mobilePage.goto(`${BASE_URL}/dolacz`, { waitUntil: 'domcontentloaded' });
      await mobilePage.waitForTimeout(500);
      await mobilePage.screenshot({ path: `${SCREENSHOT_DIR}/mobile-dolacz.png` });

      const hasLoginForm = (await mobilePage.locator('input[type="email"], input[type="password"], button:has-text("Zaloguj")').count()) > 0;
      const hasRegisterWizard = (await mobilePage.locator('text=Krok 1 z 4, text=Wybierz swoją ulicę').count()) > 0;

      if (hasLoginForm) {
        pass('UX /dolacz: Przyjazny ekran powitalny/logowania jako domyślny');
      } else if (hasRegisterWizard) {
        warn('UX /dolacz: Wymusza 4-krokowy kreator rejestracji', 'Dla powracającego usera logowanie powinno być łatwo dostępne lub domyślne');
      }

      // 3.2 Sprawdzenie /logowanie
      await mobilePage.goto(`${BASE_URL}/logowanie`, { waitUntil: 'domcontentloaded' });
      await mobilePage.waitForTimeout(400);
      const isLoginMode = (await mobilePage.locator('button:has-text("Zaloguj"), button:has-text("Wejdź")').count()) > 0;
      if (isLoginMode) {
        pass('Ścieżka /logowanie otwiera dedykowany ekran logowania');
      } else {
        fail('Ścieżka /logowanie', 'Nie znaleziono formularza logowania');
      }

    } catch (e) {
      fail('Audyt UX /dolacz', e.message);
    }

    // -------------------------------------------------------------------------
    // 4. TESTY MODUŁU ROZKŁADU ZDITM & MAPY MOBILNEJ (/zditm/mapa)
    // -------------------------------------------------------------------------
    console.log(`\n🗺️  [FAZA 4] Testy Modułu Mapy ZDiTM & Mobile-First UX...`);
    try {
      await mobilePage.waitForTimeout(400);
      await mobilePage.goto(`${BASE_URL}/zditm/mapa`, { waitUntil: 'domcontentloaded' });
      await mobilePage.waitForTimeout(1000);

      const mapContainer = mobilePage.locator('#zditm-leaflet-map');
      await mapContainer.waitFor({ state: 'visible', timeout: 5000 });
      pass('Kontener mapy Leaflet (#zditm-leaflet-map) zainicjalizowany');

      const m1Btn = mobilePage.locator('header button:has-text("M1")').first();
      const m2Btn = mobilePage.locator('header button:has-text("M2")').first();
      const m3Btn = mobilePage.locator('header button:has-text("M3")').first();
      const m4Btn = mobilePage.locator('header button:has-text("M4")').first();

      if (await m1Btn.count() > 0 && await m2Btn.count() > 0 && await m3Btn.count() > 0 && await m4Btn.count() > 0) {
        pass('Przyciski wyboru linii [M1] [M2] [M3] [M4] obecne w nagłówku');
      } else {
        fail('Przyciski wyboru linii', 'Brak jednego z przycisków linii M1-M4');
      }

      await checkHorizontalOverflow(mobilePage, 'Mobile PWA Mapa ZDiTM');
      await mobilePage.screenshot({ path: `${SCREENSHOT_DIR}/mobile-zditm-map.png` });

      // Wybór przystanku i bottom sheet
      await mobilePage.evaluate(() => {
        if (typeof window !== 'undefined' && window.__selectZditmStop) {
          window.__selectZditmStop('Plac Dworcowy');
        }
      });
      await mobilePage.waitForTimeout(600);

      const departureSheet = mobilePage.locator('text=Najbliższy planowany odjazd').first();
      if (await departureSheet.isVisible()) {
        pass('Bottom Sheet z najbliższymi odjazdami przystanku wyrenderowany');
      } else {
        fail('Bottom Sheet przystanku', 'Brak widoku odjazdów po wybraniu przystanku');
      }
    } catch (e) {
      fail('Test Mapy ZDiTM', e.message);
    }

  } finally {
    await browser.close();
  }

  // ---------------------------------------------------------------------------
  // PODSUMOWANIE
  // ---------------------------------------------------------------------------
  console.log(`\n======================================================`);
  console.log(`📊 PODSUMOWANIE TESTÓW REGRESYJNYCH & UX:`);
  console.log(`   ✅ PASSED:   ${results.passed.length}`);
  console.log(`   ❌ FAILED:   ${results.failed.length}`);
  console.log(`   ⚠️  WARNINGS: ${results.warnings.length}`);
  console.log(`======================================================\n`);

  if (results.failed.length > 0) {
    console.error(`🚨 Zidentyfikowano błędy krytyczne wymagające poprawy!`);
    process.exit(1);
  } else {
    console.log(`🎉 Wszystkie testy regresyjne i weryfikacja UX zakończone sukcesem!`);
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
