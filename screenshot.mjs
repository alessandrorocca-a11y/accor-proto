import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  
  // Take screenshot of home page at mobile width (390px)
  console.log('Taking screenshot of http://localhost:5173/ at 390px width (mobile)');
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot-mobile-home.png', fullPage: true });
  console.log('✓ Screenshot saved: screenshot-mobile-home.png');
  await page.close();

  await browser.close();
  console.log('\nScreenshot complete!');
})();
