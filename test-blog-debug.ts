import { chromium } from '@playwright/test';

async function debugBlogNavigation() {
  console.log('🔍 DEBUGGING: Blog navigation with network logging...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Log all network responses
  const redirects: { from: string; to: string; status: number }[] = [];
  page.on('response', async (response) => {
    const status = response.status();
    const url = response.url();

    if (status >= 300 && status < 400) {
      const location = response.headers()['location'] || 'unknown';
      redirects.push({ from: url, to: location, status });
      console.log(`   🔀 REDIRECT ${status}: ${url} → ${location}`);
    }
  });

  // Log console messages from the page
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`   🔴 Console Error: ${msg.text()}`);
    }
  });

  try {
    const baseUrl = 'https://partyondelivery.com';

    console.log('1️⃣  Navigating to /blog...');
    await page.goto(`${baseUrl}/blog`, { waitUntil: 'networkidle', timeout: 20000 });
    console.log('✅ Blog page loaded\n');

    // Handle age modal
    const ageModal = await page.locator('text=Are you 21 years of age or older?').isVisible();
    if (ageModal) {
      console.log('🔒 Dismissing age modal...');
      await page.locator('button:has-text("YES, I AM 21+")').click();
      await page.waitForTimeout(1000);
      console.log('✅ Age modal dismissed\n');
    }

    // Get first blog link
    console.log('2️⃣  Inspecting first blog link...');
    const firstLink = page.locator('a[href^="/blog/"]:not([href="/blog"])').first();

    const href = await firstLink.getAttribute('href');
    const linkText = await firstLink.locator('h2').first().textContent();

    console.log(`   📝 Link text: ${linkText}`);
    console.log(`   🔗 href attribute: ${href}`);
    console.log(`   📍 Current URL: ${page.url()}\n`);

    // Clear redirects array before click
    redirects.length = 0;

    console.log('3️⃣  Clicking the link...\n');
    await firstLink.click();

    // Wait a bit for any redirects to happen
    await page.waitForTimeout(3000);

    console.log(`\n4️⃣  After click:`);
    console.log(`   📍 Final URL: ${page.url()}`);
    console.log(`   📊 Redirects detected: ${redirects.length}\n`);

    if (redirects.length > 0) {
      console.log('🔀 REDIRECT CHAIN:');
      redirects.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.status} ${r.from} → ${r.to}`);
      });
      console.log();
    }

    // Check what page we're on
    const title = await page.title();
    const h1 = await page.locator('h1').first().textContent();

    console.log('📄 Page State:');
    console.log(`   Title: ${title}`);
    console.log(`   H1: ${h1}`);

    // Check if we're still on /blog
    if (page.url() === `${baseUrl}/blog`) {
      console.log('\n❌ PROBLEM: Still on /blog page - navigation failed!\n');

      // Check if there are any JavaScript errors
      const errors = await page.evaluate(() => {
        // @ts-ignore
        return window.__errors || [];
      });

      if (errors.length > 0) {
        console.log('JavaScript Errors:', errors);
      }

      // Check network tab for the clicked URL
      console.log(`\n🔍 Testing direct navigation to: ${href}`);
      redirects.length = 0;

      await page.goto(`${baseUrl}${href}`, { waitUntil: 'networkidle' });
      console.log(`   📍 Direct navigation result: ${page.url()}`);

      if (redirects.length > 0) {
        console.log('\n🔀 DIRECT NAVIGATION REDIRECTS:');
        redirects.forEach((r, i) => {
          console.log(`   ${i + 1}. ${r.status} ${r.from} → ${r.to}`);
        });
      }
    } else {
      console.log('\n✅ SUCCESS: Navigated to blog post!\n');
    }

    await page.screenshot({ path: 'blog-debug-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved: blog-debug-screenshot.png\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    console.log('⏳ Keeping browser open for 10 seconds...\n');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

debugBlogNavigation().catch(console.error);
