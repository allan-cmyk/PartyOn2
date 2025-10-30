/**
 * IndexNow API - Instant Search Engine Notification
 *
 * Notifies search engines (Bing, Yandex, etc.) about updated pages
 * for faster indexing. Google doesn't support IndexNow yet, but Bing
 * indexing often correlates with faster Google indexing.
 *
 * Usage: npx tsx scripts/notify-indexnow.ts
 */

const INDEXNOW_KEY = '4f8b3c2e1d9a7b6c5e8f0a1b2c3d4e5f'; // Generate your own at indexnow.org
const HOST = 'partyondelivery.com';

// Priority URLs to notify search engines about
const PRIORITY_URLS = [
  // P0 Critical
  'https://partyondelivery.com/',
  'https://partyondelivery.com/products',
  'https://partyondelivery.com/about',
  'https://partyondelivery.com/contact',
  'https://partyondelivery.com/services',
  'https://partyondelivery.com/weddings',
  'https://partyondelivery.com/boat-parties',
  'https://partyondelivery.com/bach-parties',

  // P1 High-Priority
  'https://partyondelivery.com/corporate',
  'https://partyondelivery.com/partner',
  'https://partyondelivery.com/testimonials',

  // P2 Key Landing Pages
  'https://partyondelivery.com/checkout',
  'https://partyondelivery.com/collections',
  'https://partyondelivery.com/delivery-areas',
  'https://partyondelivery.com/blog',
  'https://partyondelivery.com/partners/mobile-bartenders',
  'https://partyondelivery.com/aperol-spritz',
  'https://partyondelivery.com/negroni',
  'https://partyondelivery.com/old-fashioned',
  'https://partyondelivery.com/gin-martini',
];

async function notifyIndexNow() {
  console.log('🔔 Notifying search engines via IndexNow API...\n');

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: PRIORITY_URLS
  };

  try {
    // Notify Bing/Microsoft
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ Successfully notified search engines about', PRIORITY_URLS.length, 'URLs');
      console.log('📊 Status:', response.status, response.statusText);
      console.log('\nSearch engines notified:');
      console.log('  - Bing');
      console.log('  - Yandex');
      console.log('  - Seznam');
      console.log('  - Naver');
      console.log('\n⏱️  Expected indexing: 24-72 hours');
    } else {
      console.error('❌ Error:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response:', text);
    }
  } catch (error) {
    console.error('❌ Failed to notify search engines:', error);
    console.log('\n💡 Tip: Verify your IndexNow key is valid at https://www.indexnow.org/');
  }
}

// Setup instructions
console.log('🚀 IndexNow Setup Instructions:\n');
console.log('1. Generate a key at https://www.indexnow.org/');
console.log('2. Create file: public/' + INDEXNOW_KEY + '.txt with the key as content');
console.log('3. Update INDEXNOW_KEY constant in this script');
console.log('4. Run: npx tsx scripts/notify-indexnow.ts\n');
console.log('─'.repeat(60) + '\n');

notifyIndexNow();
