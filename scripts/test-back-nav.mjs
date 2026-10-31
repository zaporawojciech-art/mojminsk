import { chromium, devices } from 'playwright';

const BASE_URL = process.env.TARGET_URL || 'http://localhost:5173';

async function testBackNav() {
  console.log('Testing back navigation from Timetable to Map at:', BASE_URL);
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      ...devices['iPhone 14'],
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    // 1. Go to /zditm/mapa/m2
    await page.goto(`${BASE_URL}/zditm/mapa/m2`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const mapContainer = page.locator('#zditm-leaflet-map');
    await mapContainer.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Initial map loaded on /zditm/mapa/m2');

    // 2. Select stop "Plac Dworcowy"
    await page.evaluate(() => {
      if (typeof window !== 'undefined' && window.__selectZditmStop) {
        window.__selectZditmStop('Plac Dworcowy');
      }
    });
    await page.waitForTimeout(600);

    // 3. Click CTA to open full timetable
    const ctaBtn = page.locator('button:has-text("Zobacz pełną tablicę godzinową")').first();
    await ctaBtn.waitFor({ state: 'visible', timeout: 3000 });
    await ctaBtn.click();
    await page.waitForTimeout(600);

    // 4. Verify we are on /zditm/m2/plac-dworcowy
    const urlAfterCTA = page.url();
    console.log('URL after clicking timetable CTA:', urlAfterCTA);
    if (!urlAfterCTA.includes('/zditm/m2/plac-dworcowy')) {
      throw new Error(`Expected URL to include /zditm/m2/plac-dworcowy, got ${urlAfterCTA}`);
    }

    const timetableHeading = page.locator('text=Rozkład jazdy ZDiTM').first();
    await timetableHeading.waitFor({ state: 'visible', timeout: 3000 });
    console.log('✓ Timetable screen opened');

    // 5. Click the back button on ZditmScreen
    const backBtn = page.locator('header button[aria-label="Wróć"]').first();
    await backBtn.click();
    await page.waitForTimeout(800);

    // 6. Verify URL is back to /zditm/mapa/m2 and map is displayed (NOT home page '/')
    const urlAfterBack = page.url();
    console.log('URL after clicking back button:', urlAfterBack);

    if (urlAfterBack.includes('/zditm/mapa')) {
      console.log('✓ Back button successfully returned to map URL:', urlAfterBack);
    } else {
      throw new Error(`Expected URL to return to /zditm/mapa/m2, but got: ${urlAfterBack}`);
    }

    const mapAfterBack = page.locator('#zditm-leaflet-map');
    if (await mapAfterBack.isVisible()) {
      console.log('✓ Leaflet map is visible after navigating back!');
    } else {
      throw new Error('Map container is not visible after navigating back!');
    }

    console.log('🎉 ALL BACK NAVIGATION TESTS PASSED!');
  } finally {
    await browser.close();
  }
}

testBackNav().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
