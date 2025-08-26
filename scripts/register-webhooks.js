#!/usr/bin/env node

/**
 * Script to register Shopify webhooks
 * Run with: node scripts/register-webhooks.js
 */

require('dotenv').config({ path: '.env.local' });

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
const API_VERSION = '2024-01';

if (!SHOPIFY_DOMAIN || !ADMIN_API_TOKEN) {
  console.error('❌ Missing required environment variables:');
  if (!SHOPIFY_DOMAIN) console.error('  - NEXT_PUBLIC_SHOPIFY_DOMAIN');
  if (!ADMIN_API_TOKEN) console.error('  - SHOPIFY_ADMIN_ACCESS_TOKEN');
  process.exit(1);
}

// Webhook topics we want to register
const WEBHOOK_TOPICS = [
  'orders/create',
  'orders/updated', 
  'orders/fulfilled',
  'orders/cancelled',
  'customers/create',
  'customers/update',
];

async function listWebhooks() {
  try {
    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/webhooks.json`,
      {
        headers: {
          'X-Shopify-Access-Token': ADMIN_API_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list webhooks: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.webhooks || [];
  } catch (error) {
    console.error('Error listing webhooks:', error);
    return [];
  }
}

async function deleteWebhook(webhookId) {
  try {
    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/webhooks/${webhookId}.json`,
      {
        method: 'DELETE',
        headers: {
          'X-Shopify-Access-Token': ADMIN_API_TOKEN,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error(`Error deleting webhook ${webhookId}:`, error);
    return false;
  }
}

async function createWebhook(topic) {
  try {
    const webhookData = {
      webhook: {
        topic: topic,
        address: `${WEBHOOK_URL}/api/webhooks/shopify`,
        format: 'json',
      },
    };

    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/webhooks.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': ADMIN_API_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create webhook: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.webhook;
  } catch (error) {
    console.error(`Error creating webhook for ${topic}:`, error);
    return null;
  }
}

async function registerWebhooks() {
  console.log('🔄 Starting webhook registration...');
  console.log(`📍 Webhook URL: ${WEBHOOK_URL}/api/webhooks/shopify`);
  console.log(`🏪 Shopify Domain: ${SHOPIFY_DOMAIN}\n`);

  // List existing webhooks
  console.log('📋 Fetching existing webhooks...');
  const existingWebhooks = await listWebhooks();
  console.log(`Found ${existingWebhooks.length} existing webhooks\n`);

  // Display existing webhooks
  if (existingWebhooks.length > 0) {
    console.log('Existing webhooks:');
    existingWebhooks.forEach(webhook => {
      console.log(`  - ${webhook.topic} → ${webhook.address}`);
    });
    console.log('');
  }

  // Optional: Clean up old webhooks pointing to different URLs
  const oldWebhooks = existingWebhooks.filter(
    w => !w.address.startsWith(WEBHOOK_URL)
  );
  
  if (oldWebhooks.length > 0) {
    console.log(`🗑️  Found ${oldWebhooks.length} webhooks pointing to old URLs. Cleaning up...`);
    for (const webhook of oldWebhooks) {
      const deleted = await deleteWebhook(webhook.id);
      if (deleted) {
        console.log(`  ✅ Deleted webhook for ${webhook.topic}`);
      }
    }
    console.log('');
  }

  // Register new webhooks
  console.log('📝 Registering webhooks...\n');
  
  for (const topic of WEBHOOK_TOPICS) {
    // Check if webhook already exists for this topic
    const existing = existingWebhooks.find(
      w => w.topic === topic && w.address === `${WEBHOOK_URL}/api/webhooks/shopify`
    );

    if (existing) {
      console.log(`  ✓ ${topic} - already registered`);
      continue;
    }

    // Create new webhook
    console.log(`  🔄 Registering ${topic}...`);
    const webhook = await createWebhook(topic);
    
    if (webhook) {
      console.log(`  ✅ ${topic} - registered successfully`);
    } else {
      console.log(`  ❌ ${topic} - failed to register`);
    }
  }

  console.log('\n✨ Webhook registration complete!');
  
  // List final webhooks
  console.log('\n📋 Final webhook configuration:');
  const finalWebhooks = await listWebhooks();
  finalWebhooks.forEach(webhook => {
    console.log(`  - ${webhook.topic} → ${webhook.address}`);
  });
}

// Run the script
registerWebhooks().catch(console.error);