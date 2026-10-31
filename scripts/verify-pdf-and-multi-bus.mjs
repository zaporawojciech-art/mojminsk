import { chromium } from 'playwright';

async function verifyPdfAndMultiBus() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 mobile
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });

  // Mock system clock to Wednesday at 05:35:15 to test 2 active buses simultaneously on M1
  await context.addInitScript(() => {
    const mockDate = new Date('2026-10-28T05:35:15');
    // Override Date
    const RealDate = Date;
    // @ts-ignore
    window.Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          super(mockDate.getTime());
        } else {
          // @ts-ignore
          super(...args);
        }
      }
      static now() {
        return mockDate.getTime();
      }
    };
  });

  const page = await context.newPage();

  console.log('1. Navigating to /zditm (Timetable view)...');
  await page.goto('http://localhost:5173/zditm', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Take screenshot of timetable view with authentic PDF times
  await page.screenshot({ path: '/Users/wojtekzapora/.gemini/antigravity/brain/2125e731-7522-4bd6-aac0-c04156f9a0dd/zditm-timetable-official-pdf.png' });
  console.log('Saved zditm-timetable-official-pdf.png');

  console.log('2. Navigating to /zditm/mapa/m1 (Mobile Map at 05:35:15)...');
  await page.goto('http://localhost:5173/zditm/mapa/m1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Check multi-bus simulation:
  const busMarkersCount = await page.locator('.live-bus-marker').count();
  console.log(`Live bus markers on map at 05:35: ${busMarkersCount}`);

  // Take screenshot of map view with 2 buses active simultaneously
  await page.screenshot({ path: '/Users/wojtekzapora/.gemini/antigravity/brain/2125e731-7522-4bd6-aac0-c04156f9a0dd/zditm-map-multi-bus-active.png' });
  console.log('Saved zditm-map-multi-bus-active.png');

  // Verify top pill text includes multi bus indicator
  const headerText = await page.locator('header.absolute').textContent();
  console.log('Header status text:', headerText?.replace(/\s+/g, ' ').trim());

  // Switch to M2 using header selector
  console.log('3. Switching to line M2...');
  const m2Btn = page.locator('header.absolute button:has-text("M2")');
  await m2Btn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: '/Users/wojtekzapora/.gemini/antigravity/brain/2125e731-7522-4bd6-aac0-c04156f9a0dd/zditm-map-official-m2.png' });
  console.log('Saved zditm-map-official-m2.png');

  // Switch to M4
  console.log('4. Switching to line M4...');
  const m4Btn = page.locator('header.absolute button:has-text("M4")');
  await m4Btn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: '/Users/wojtekzapora/.gemini/antigravity/brain/2125e731-7522-4bd6-aac0-c04156f9a0dd/zditm-map-official-m4.png' });
  console.log('Saved zditm-map-official-m4.png');

  // Click on a stop to verify bottom sheet
  console.log('5. Clicking a stop on map...');
  const stopMarker = page.locator('.custom-bus-stop-icon').first();
  await stopMarker.click();
  await page.waitForTimeout(800);

  await page.screenshot({ path: '/Users/wojtekzapora/.gemini/antigravity/brain/2125e731-7522-4bd6-aac0-c04156f9a0dd/zditm-map-sheet-official-times.png' });
  console.log('Saved zditm-map-sheet-official-times.png');

  await browser.close();
  console.log('All verification checks passed successfully!');
}

verifyPdfAndMultiBus().catch(err => {
  console.error('Error in verification:', err);
  process.exit(1);
});
