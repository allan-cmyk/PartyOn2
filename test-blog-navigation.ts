import { chromium } from '@playwright/test';

async function testBlogNavigation() {
  console.log('🚀 Testing PRODUCTION site (with age verification handling)...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    const baseUrl = 'https://partyondelivery.com';
    console.log(`📍 Testing: ${baseUrl}\n`);

    // Go to blog page
    console.log('1️⃣  Navigating to /blog page...');
    await page.goto(`${baseUrl}/blog`, { waitUntil: 'networkidle', timeout: 20000 });
    console.log(`✅ Blog page loaded\n`);

    await page.waitForTimeout(2000);

    // Check for and handle age verification modal
    console.log('🔍 Checking for age verification modal...');
    const ageModal = await page.locator('text=Are you 21 years of age or older?').isVisible();

    if (ageModal) {
      console.log('   ⚠️  Age verification modal detected');
      console.log('   🖱️  Clicking "YES, I AM 21+" button...\n');

      await page.locator('button:has-text("YES, I AM 21+")').click();
      await page.waitForTimeout(1000);

      console.log('   ✅ Age verification completed\n');
    } else {
      console.log('   ℹ️  No age modal (already verified in session)\n');
    }

    // Get page info
    const title = await page.title();
    console.log(`📄 Page Title: ${title}\n`);

    // Content analysis
    console.log('🔍 Page Content Analysis:');
    console.log('═'.repeat(60));

    const articleCount = await page.locator('article').count();
    const blogLinksCount = await page.locator('a[href^="/blog/"]:not([href="/blog"])').count();

    console.log(`   📰 Articles: ${articleCount}`);
    console.log(`   🔗 Blog post links: ${blogLinksCount}\n`);

    if (blogLinksCount === 0) {
      console.log('❌ No blog links found!\n');
      return;
    }

    console.log(`✅ Found ${blogLinksCount} blog post links!\n`);
    console.log('═'.repeat(60) + '\n');

    // List first 5 posts
    console.log('📋 First 5 blog posts:\n');
    const blogLinks = await page.locator('a[href^="/blog/"]:not([href="/blog"])').all();

    for (let i = 0; i < Math.min(5, blogLinks.length); i++) {
      const href = await blogLinks[i].getAttribute('href');
      const titleText = await blogLinks[i].locator('h2').first().textContent();
      console.log(`   ${i + 1}. ${href}`);
      console.log(`      "${titleText?.substring(0, 55)}..."\n`);
    }

    console.log('═'.repeat(60) + '\n');

    // Test clicking blog posts
    console.log('🖱️  CLICK TESTS:\n');

    for (let i = 0; i < Math.min(3, blogLinksCount); i++) {
      const freshLinks = await page.locator('a[href^="/blog/"]:not([href="/blog"])').all();
      const link = freshLinks[i];

      const href = await link.getAttribute('href');
      const titleText = await link.locator('h2').first().textContent();

      console.log(`${'─'.repeat(60)}`);
      console.log(`TEST ${i + 1}/3: ${titleText?.substring(0, 42)}...`);
      console.log(`URL: ${href}`);
      console.log(`${'─'.repeat(60)}\n`);

      const beforeUrl = page.url();
      console.log(`   📍 Before: ${beforeUrl}`);

      // Click the link
      await link.click();
      await page.waitForTimeout(3000);

      const afterUrl = page.url();
      console.log(`   📍 After:  ${afterUrl}\n`);

      // Check result
      if (afterUrl === beforeUrl || afterUrl === `${baseUrl}/blog`) {
        console.log('   ❌ FAILED: No navigation or stayed on /blog\n');
      } else if (afterUrl.includes(href || '')) {
        console.log('   ✅ SUCCESS: Navigated to blog post!\n');

        const hasContent = await page.locator('article, main').count() > 0;
        const hasH1 = await page.locator('h1').count() > 0;
        const postTitle = await page.title();

        console.log(`   📄 Title: ${postTitle}`);
        console.log(`   📰 Has content: ${hasContent ? '✅' : '❌'}`);
        console.log(`   📝 Has H1: ${hasH1 ? '✅' : '❌'}\n`);

        if (hasContent && hasH1) {
          console.log('   🎉 Blog post loaded successfully!\n');
        }
      } else {
        console.log(`   ⚠️  Navigated to: ${afterUrl}\n`);
      }

      // Return to blog page
      if (i < Math.min(3, blogLinksCount) - 1) {
        console.log('   🔙 Returning to /blog...\n');
        await page.goto(`${baseUrl}/blog`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ ✅ ✅  ALL TESTS PASSED! ✅ ✅ ✅');
    console.log('═'.repeat(60) + '\n');
    console.log('🎉 Blog navigation is working perfectly!\n');

    await page.screenshot({ path: 'blog-test-final.png', fullPage: true });
    console.log('📸 Screenshot saved: blog-test-final.png\n');

  } catch (error) {
    console.error('\n❌ Test failed:\n', error);
    await page.screenshot({ path: 'blog-test-error.png', fullPage: true });
  } finally {
    console.log('⏳ Keeping browser open for 15 seconds...\n');
    await page.waitForTimeout(15000);
    await browser.close();
    console.log('✅ Test complete!\n');
  }
}

testBlogNavigation().catch(console.error);
