import { chromium, devices } from 'playwright';

const BASE_URL = process.env.TARGET_URL || 'http://localhost:5173';
const ARTIFACT_DIR = '/Users/wojtekzapora/.gemini/antigravity/brain/2125e731-7522-4bd6-aac0-c04156f9a0dd';

async function verifyStreetRoute() {
  console.log('Verifying street-following route polyline at:', BASE_URL);
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      ...devices['iPhone 14'],
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    // 1. Otwórz mapę dla linii M2
    await page.goto(`${BASE_URL}/zditm/mapa/m2`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const mapContainer = page.locator('#zditm-leaflet-map');
    await mapContainer.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Map loaded on /zditm/mapa/m2');

    // 2. Całościowy zrzut ekranu trasy M2 po ulicach
    await page.screenshot({ path: `${ARTIFACT_DIR}/zditm-map-street-overview.png` });
    console.log('✓ Saved overview screenshot');

    // 3. Przybliż widok dokładnie na rejon Cmentarz Żydowski -> Rondo -> Serbinów (obszar ze zrzutu usera)
    await page.evaluate(() => {
      const mapEl = document.querySelector('#zditm-leaflet-map');
      // Wywołujemy panTo/setView na instancji mapy
      if (window.__zditmMapInstance) {
        window.__zditmMapInstance.setView([52.1755, 21.5860], 16, { animate: false });
      }
    });

    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${ARTIFACT_DIR}/zditm-map-street-serbinow.png` });
    console.log('✓ Saved detailed Serbinów segment screenshot');

    console.log('🎉 VERIFICATION SCRIPT FINISHED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

verifyStreetRoute().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
