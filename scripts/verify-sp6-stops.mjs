import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  // 1. Timetable Screen for Line M3
  console.log('Navigating to /zditm...');
  await page.goto('http://localhost:5173/zditm', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Click M3 line pill
  console.log('Selecting Line M3...');
  await page.locator('section[aria-label="Wybór linii miejskiej"] button:has-text("M3")').click({ force: true });
  await page.waitForTimeout(600);

  // Check if "Szkoła Podstawowa nr 6 20" exists in timetable
  const sp6Elements = page.locator('text="Szkoła Podstawowa nr 6 20"');
  const count = await sp6Elements.count();
  console.log(`Found "Szkoła Podstawowa nr 6 20" count: ${count}`);

  if (count > 0) {
    // Click on it in the stop sequence
    await sp6Elements.first().scrollIntoViewIfNeeded();
    await sp6Elements.first().click({ force: true });
    await page.waitForTimeout(600);
  }

  await page.screenshot({
    path: '/Users/wojtekzapora/.gemini/antigravity/brain/2125e731-7522-4bd6-aac0-c04156f9a0dd/zditm-timetable-m3-sp6.png',
    fullPage: false,
  });
  console.log('Saved zditm-timetable-m3-sp6.png');

  // 2. Map Screen for Line M3
  console.log('Navigating to /zditm/mapa/m3...');
  await page.goto('http://localhost:5173/zditm/mapa/m3', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click marker for Szkoła Podstawowa nr 6 20
  const marker = page.locator('[data-stop="Szkoła Podstawowa nr 6 20"]');
  const markerExists = await marker.count();
  console.log(`Found [data-stop="Szkoła Podstawowa nr 6 20"] marker count: ${markerExists}`);

  if (markerExists > 0) {
    await marker.first().click({ force: true });
    await page.waitForTimeout(800);
  }

  await page.screenshot({
    path: '/Users/wojtekzapora/.gemini/antigravity/brain/2125e731-7522-4bd6-aac0-c04156f9a0dd/zditm-map-m3-sp6.png',
    fullPage: false,
  });
  console.log('Saved zditm-map-m3-sp6.png');

  await browser.close();
  console.log('All SP6 checks completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
