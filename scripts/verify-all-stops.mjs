import { chromium } from 'playwright';

async function verifyAllStops() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 / mobile
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  console.log('1. Navigating to /zditm/mapa/m2...');
  await page.goto('http://localhost:5173/zditm/mapa/m2', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Take screenshot of initial map view
  await page.screenshot({ path: '/Users/wojtekzapora/.gemini/antigravity/brain/2125e731-7522-4bd6-aac0-c04156f9a0dd/zditm-map-with-search-btn.png' });
  console.log('Saved zditm-map-with-search-btn.png');

  // Click search button
  console.log('2. Clicking search button...');
  const searchBtn = page.locator('button[aria-label="Wyszukaj przystanek"]');
  await searchBtn.click();
  await page.waitForTimeout(500);

  // Type in search query "Szpital"
  console.log('3. Searching for "Szpital"...');
  const searchInput = page.locator('input[placeholder*="przystanek"]');
  await searchInput.fill('Szpital');
  await page.waitForTimeout(500);

  // Take screenshot of search results
  await page.screenshot({ path: '/Users/wojtekzapora/.gemini/antigravity/brain/2125e731-7522-4bd6-aac0-c04156f9a0dd/zditm-map-search-dropdown.png' });
  console.log('Saved zditm-map-search-dropdown.png');

  // Click first result from dropdown
  console.log('4. Selecting first result from search dropdown...');
  const firstResult = page.locator('div.max-h-60 button').first();
  await firstResult.click();
  await page.waitForTimeout(1000);

  // Take screenshot of bottom sheet with rich parameters
  await page.screenshot({ path: '/Users/wojtekzapora/.gemini/antigravity/brain/2125e731-7522-4bd6-aac0-c04156f9a0dd/zditm-map-stop-parameters.png' });
  console.log('Saved zditm-map-stop-parameters.png');

  // Verify parameters visible in bottom sheet
  const bodyText = await page.textContent('body');
  const hasGps = bodyText.includes('GPS') || bodyText.includes('52.');
  const hasZone = bodyText.includes('Strefa') || bodyText.includes('Centrum') || bodyText.includes('Szpital');
  const hasRef = bodyText.includes('Słupek');
  console.log('Checks: hasGps =', hasGps, ', hasZone =', hasZone, ', hasRef =', hasRef);

  // Check /zditm timetable search
  console.log('5. Navigating to /zditm (Timetable view)...');
  await page.goto('http://localhost:5173/zditm', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const searchBtnTimetable = page.locator('button[aria-label="Wyszukaj przystanek"]').first();
  await searchBtnTimetable.click();
  await page.waitForTimeout(300);

  const timetableSearch = page.locator('input[placeholder*="przystanku"]').first();
  await timetableSearch.fill('Sosnkowskiego');
  await page.waitForTimeout(500);

  await page.screenshot({ path: '/Users/wojtekzapora/.gemini/antigravity/brain/2125e731-7522-4bd6-aac0-c04156f9a0dd/zditm-timetable-search-244stops.png' });
  console.log('Saved zditm-timetable-search-244stops.png');

  await browser.close();
  console.log('All verification steps completed successfully!');
}

verifyAllStops().catch(err => {
  console.error('Error in verification:', err);
  process.exit(1);
});
