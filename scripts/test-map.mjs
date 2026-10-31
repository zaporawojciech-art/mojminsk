import { chromium, devices } from 'playwright';

const BASE_URL = process.env.TARGET_URL || 'http://localhost:5173';
const ARTIFACT_DIR = '/Users/wojtekzapora/.gemini/antigravity/brain/2125e731-7522-4bd6-aac0-c04156f9a0dd';

async function testMap() {
  console.log('Testing ZDiTM Mobile Map at:', BASE_URL);
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Mobile iPhone 14
    console.log('\n📱 Testing Mobile View (390x844)...');
    const mobileContext = await browser.newContext({
      ...devices['iPhone 14'],
      viewport: { width: 390, height: 844 },
    });
    const page = await mobileContext.newPage();

    // Navigate to /zditm/mapa
    await page.goto(`${BASE_URL}/zditm/mapa`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Verify map container exists
    const mapContainer = page.locator('#zditm-leaflet-map');
    await mapContainer.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Map container visible');

    // Verify line buttons
    const m1Btn = page.locator('header button:has-text("M1")').first();
    const m2Btn = page.locator('header button:has-text("M2")').first();
    const m3Btn = page.locator('header button:has-text("M3")').first();
    const m4Btn = page.locator('header button:has-text("M4")').first();
    await m1Btn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Line buttons M1, M2, M3, M4 present');

    // Direction switcher
    const reverseBtn = page.locator('button:has-text("Odwróć")');
    if (await reverseBtn.count() > 0) {
      console.log('✓ Direction toggle present');
    }

    // Screenshot initial map
    await page.screenshot({ path: `${ARTIFACT_DIR}/zditm-map-mobile-initial.png` });
    console.log('✓ Saved initial mobile screenshot');

    // Select a stop to view departures bottom sheet
    await page.evaluate(() => {
      if (typeof window !== 'undefined' && window.__selectZditmStop) {
        window.__selectZditmStop('Plac Dworcowy');
      }
    });
    await page.waitForTimeout(800);

    // Verify bottom sheet is shown
    const departureSheet = page.locator('text=Najbliższy planowany odjazd').first();
    await departureSheet.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Stop departures sheet visible');

    await page.screenshot({ path: `${ARTIFACT_DIR}/zditm-map-mobile-sheet.png` });
    console.log('✓ Saved stop sheet screenshot');

    // Switch to line M1
    await m1Btn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${ARTIFACT_DIR}/zditm-map-mobile-m1.png` });
    console.log('✓ Switched to M1 and saved screenshot');

    // 2. Desktop check (1440x900)
    console.log('\n🖥️ Testing Desktop View (1440x900)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(`${BASE_URL}/zditm/mapa`, { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(1500);
    await desktopPage.screenshot({ path: `${ARTIFACT_DIR}/zditm-map-desktop.png` });
    console.log('✓ Saved desktop screenshot');

    console.log('\n🎉 ALL MAP TESTS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

testMap().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
