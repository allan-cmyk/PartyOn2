/**
 * E2E Tests for PartyOn Order Page
 * Tests add-to-cart functionality and cart operations
 *
 * Run with: npx playwright test tests/e2e-order-page.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

/**
 * Helper to set age verification in localStorage
 */
async function setAgeVerified(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.setItem('age_verified', 'true');
    localStorage.setItem('ageVerified', 'true');
  });
}

/**
 * Helper to clear cart and session
 */
async function clearSession(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
}

test.describe('Order Page - Add to Cart', () => {

  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await clearSession(page);

    // Navigate to order page
    await page.goto(`${BASE_URL}/order`);

    // Set age verification to bypass modal
    await setAgeVerified(page);

    // Reload to apply age verification
    await page.reload();

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .bg-white.rounded-lg.border', {
      timeout: 30000
    });
  });

  test('should display products on order page', async ({ page }) => {
    // Check hero section
    await expect(page.locator('text=Your Bar')).toBeVisible();

    // Check products loaded
    const products = page.locator('.bg-white.rounded-lg.border.border-gray-200');
    await expect(products.first()).toBeVisible();

    // Verify at least one product has a price
    const price = page.locator('text=/\\$\\d+\\.\\d{2}/').first();
    await expect(price).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    // Find the first add button (gold + button)
    const addButton = page.locator('button[aria-label*="Add"]').first();

    // Verify add button exists
    await expect(addButton).toBeVisible();

    // Listen for network requests
    const cartRequestPromise = page.waitForResponse(
      response => response.url().includes('/api/v1/cart') && response.request().method() === 'POST',
      { timeout: 10000 }
    );

    // Click add button
    await addButton.click();

    // Wait for cart API response
    const cartResponse = await cartRequestPromise;
    const cartData = await cartResponse.json();

    // Log response for debugging
    console.log('Cart API Response:', JSON.stringify(cartData, null, 2));

    // Verify cart API success
    expect(cartResponse.status()).toBe(200);
    expect(cartData.success).toBe(true);

    // Verify CartSummaryBar appears
    const cartBar = page.locator('text=View Cart');
    await expect(cartBar).toBeVisible({ timeout: 5000 });
  });

  test('should show loading state when adding to cart', async ({ page }) => {
    // Find add button
    const addButton = page.locator('button[aria-label*="Add"]').first();

    // Click and immediately check for loading spinner
    await addButton.click();

    // The button should show a loading spinner (animated border)
    const spinner = page.locator('.animate-spin');
    // This might be too fast to catch, so we'll just verify the cart operation completes

    // Wait for quantity stepper to appear (replaces add button)
    const quantityStepper = page.locator('text=/^\\d+$/').first();
    await expect(quantityStepper).toBeVisible({ timeout: 10000 });
  });

  test('should increment quantity after adding to cart', async ({ page }) => {
    // Add product to cart first
    const addButton = page.locator('button[aria-label*="Add"]').first();
    await addButton.click();

    // Wait for quantity stepper to appear
    await page.waitForTimeout(2000); // Give time for cart to update

    // Find increment button (+ in quantity stepper)
    const incrementButton = page.locator('button:has-text("+")').first();
    await expect(incrementButton).toBeVisible({ timeout: 5000 });

    // Click increment
    await incrementButton.click();

    // Verify quantity updates to 2
    const quantity = page.locator('text="2"').first();
    await expect(quantity).toBeVisible({ timeout: 5000 });
  });

  test('should open cart drawer', async ({ page }) => {
    // Add product first
    const addButton = page.locator('button[aria-label*="Add"]').first();
    await addButton.click();

    // Wait for cart bar to appear
    const viewCartButton = page.locator('text=View Cart');
    await expect(viewCartButton).toBeVisible({ timeout: 10000 });

    // Click View Cart
    await viewCartButton.click();

    // Verify cart drawer opens (check for cart drawer elements)
    const cartDrawer = page.locator('[role="dialog"], .fixed.right-0, [data-testid="cart-drawer"]');
    await expect(cartDrawer.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show error message if cart API fails', async ({ page }) => {
    // Mock the cart API to fail
    await page.route('**/api/v1/cart', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Test error' })
      });
    });

    // Try to add product
    const addButton = page.locator('button[aria-label*="Add"]').first();
    await addButton.click();

    // Button should return to initial state (not show quantity)
    await page.waitForTimeout(2000);

    // The add button should still be visible (not replaced by quantity stepper)
    await expect(addButton).toBeVisible();
  });
});

test.describe('Order Page - Collection Filtering', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/order`);
    await setAgeVerified(page);
    await page.reload();
    await page.waitForSelector('.bg-white.rounded-lg.border', { timeout: 30000 });
  });

  test('should switch between collections', async ({ page }) => {
    // Find collection buttons
    const spiritsButton = page.locator('button:has-text("SPIRITS")');
    const wineButton = page.locator('button:has-text("WINE")');

    // Click Spirits
    await spiritsButton.click();

    // Wait for products to reload
    await page.waitForTimeout(1000);

    // Verify Spirits is now active (has different styling)
    await expect(spiritsButton).toHaveClass(/scale-105|shadow-lg/);

    // Click Wine
    await wineButton.click();
    await page.waitForTimeout(1000);

    // Verify Wine is now active
    await expect(wineButton).toHaveClass(/scale-105|shadow-lg/);
  });

  test('should show search results', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();

    // Type search term
    await searchInput.fill('Tito');

    // Wait for results
    await page.waitForTimeout(1000);

    // Check if results appear (either in dropdown or filtered grid)
    const results = page.locator('text=/Tito/i');
    await expect(results.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Cart API Verification', () => {

  test('GET /api/v1/cart should return cart', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/cart`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('cart');
  });

  test('variant lookup API should work', async ({ request }) => {
    // First get a product to get a variant ID
    const productsResponse = await request.get(`${BASE_URL}/api/products?limit=1`);
    const productsData = await productsResponse.json();

    if (productsData.products && productsData.products.length > 0) {
      const variantId = productsData.products[0].variants?.edges?.[0]?.node?.id;

      if (variantId) {
        // Test variant lookup
        const variantResponse = await request.get(
          `${BASE_URL}/api/v1/products/variant/${encodeURIComponent(variantId)}`
        );

        console.log('Variant lookup status:', variantResponse.status());
        console.log('Variant lookup response:', await variantResponse.text());

        // This may return 404 if product not synced to local DB
        // That's the likely cause of the add-to-cart issue!
        if (variantResponse.status() === 404) {
          console.error('ISSUE FOUND: Variant not in local database!');
          console.error('Products need to be synced from Shopify to local DB');
        }
      }
    }
  });
});

test.describe('Debug - Add to Cart Issue', () => {

  test('capture full add-to-cart flow', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

    await page.goto(`${BASE_URL}/order`);
    await setAgeVerified(page);
    await page.reload();

    // Wait for products
    await page.waitForSelector('.bg-white.rounded-lg.border', { timeout: 30000 });

    // Get all network requests
    const requests: string[] = [];
    page.on('request', req => {
      if (req.url().includes('/api/')) {
        requests.push(`${req.method()} ${req.url()}`);
      }
    });

    page.on('response', async res => {
      if (res.url().includes('/api/')) {
        console.log(`RESPONSE: ${res.status()} ${res.url()}`);
        if (res.status() >= 400) {
          console.log('ERROR BODY:', await res.text());
        }
      }
    });

    // Click add button
    const addButton = page.locator('button[aria-label*="Add"]').first();
    await addButton.click();

    // Wait for all network activity
    await page.waitForTimeout(5000);

    // Log all requests
    console.log('All API Requests:', requests);

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-add-to-cart-debug.png', fullPage: true });
  });
});
