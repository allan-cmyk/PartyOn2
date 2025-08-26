#!/usr/bin/env node

/**
 * Script to manage Shopify webhooks
 * 
 * Usage:
 *   node scripts/manage-webhooks.js list         - List all webhooks
 *   node scripts/manage-webhooks.js delete <id>  - Delete a webhook by ID
 *   node scripts/manage-webhooks.js clear        - Delete all webhooks
 *   node scripts/manage-webhooks.js test <topic> - Send a test webhook
 */

require('dotenv').config({ path: '.env.local' });

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = '2024-01';

if (!SHOPIFY_DOMAIN || !ADMIN_API_TOKEN) {
  console.error('❌ Missing required environment variables:');
  if (!SHOPIFY_DOMAIN) console.error('  - NEXT_PUBLIC_SHOPIFY_DOMAIN');
  if (!ADMIN_API_TOKEN) console.error('  - SHOPIFY_ADMIN_ACCESS_TOKEN');
  process.exit(1);
}

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
    const webhooks = data.webhooks || [];
    
    if (webhooks.length === 0) {
      console.log('No webhooks found.');
      return;
    }
    
    console.log(`\nFound ${webhooks.length} webhook(s):\n`);
    console.log('ID\t\t\t\tTopic\t\t\tAddress');
    console.log('-'.repeat(100));
    
    webhooks.forEach(webhook => {
      console.log(`${webhook.id}\t${webhook.topic.padEnd(20)}\t${webhook.address}`);
    });
    
    console.log('\nWebhook Details:');
    webhooks.forEach((webhook, index) => {
      console.log(`\n${index + 1}. ${webhook.topic}`);
      console.log(`   ID: ${webhook.id}`);
      console.log(`   URL: ${webhook.address}`);
      console.log(`   Format: ${webhook.format}`);
      console.log(`   Created: ${webhook.created_at}`);
      console.log(`   Updated: ${webhook.updated_at}`);
    });
    
    return webhooks;
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

    if (!response.ok) {
      throw new Error(`Failed to delete webhook: ${response.status} ${response.statusText}`);
    }

    console.log(`✅ Successfully deleted webhook ${webhookId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting webhook ${webhookId}:`, error.message);
    return false;
  }
}

async function clearAllWebhooks() {
  const webhooks = await listWebhooks();
  
  if (webhooks.length === 0) {
    console.log('No webhooks to delete.');
    return;
  }
  
  console.log(`\n⚠️  This will delete ${webhooks.length} webhook(s). Are you sure? (y/n)`);
  
  // Simple confirmation for Node.js script
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('\nDeleting webhooks...\n');
      
      for (const webhook of webhooks) {
        await deleteWebhook(webhook.id);
      }
      
      console.log('\n✨ All webhooks deleted!');
    } else {
      console.log('Cancelled.');
    }
    readline.close();
  });
}

async function sendTestWebhook(topic) {
  console.log(`\n📧 Sending test webhook for topic: ${topic}\n`);
  
  // Get webhook URL from environment or use localhost
  const webhookUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const testUrl = `${webhookUrl}/api/webhooks/shopify`;
  
  // Sample webhook payloads
  const samplePayloads = {
    'orders/create': {
      id: 12345,
      name: '#TEST-1001',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      total_price: '150.00',
      currency: 'USD',
      line_items: [
        {
          title: 'Test Product',
          quantity: 2,
          price: '75.00'
        }
      ],
      note_attributes: [
        { name: 'delivery_date', value: new Date().toISOString() },
        { name: 'delivery_time', value: '2:00 PM - 4:00 PM' },
        { name: 'delivery_instructions', value: 'Test delivery instructions' }
      ]
    },
    'customers/create': {
      id: 67890,
      email: 'newcustomer@example.com',
      first_name: 'Test',
      last_name: 'Customer',
      created_at: new Date().toISOString(),
      accepts_marketing: true
    }
  };
  
  const payload = samplePayloads[topic] || { test: true, topic };
  
  try {
    // Create test signature (won't pass verification, but good for testing)
    const crypto = require('crypto');
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET || 'test-secret';
    const rawBody = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody, 'utf8')
      .digest('base64');
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shopify-topic': topic,
        'x-shopify-shop-domain': SHOPIFY_DOMAIN,
        'x-shopify-hmac-sha256': signature,
        'x-shopify-webhook-id': 'test-webhook-id',
        'x-shopify-api-version': API_VERSION
      },
      body: rawBody
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ Test webhook sent successfully!');
      console.log('Response:', result);
    } else {
      console.log(`❌ Test webhook failed with status ${response.status}`);
      console.log('Response:', result);
    }
  } catch (error) {
    console.error('Error sending test webhook:', error.message);
  }
}

// Main command handler
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'list':
      await listWebhooks();
      break;
      
    case 'delete':
      if (!arg) {
        console.error('Please provide a webhook ID to delete');
        console.log('Usage: node scripts/manage-webhooks.js delete <webhook-id>');
        process.exit(1);
      }
      await deleteWebhook(arg);
      break;
      
    case 'clear':
      await clearAllWebhooks();
      break;
      
    case 'test':
      if (!arg) {
        console.error('Please provide a webhook topic to test');
        console.log('Usage: node scripts/manage-webhooks.js test <topic>');
        console.log('Example topics: orders/create, customers/create');
        process.exit(1);
      }
      await sendTestWebhook(arg);
      break;
      
    default:
      console.log(`
Shopify Webhook Manager

Usage:
  node scripts/manage-webhooks.js list         - List all webhooks
  node scripts/manage-webhooks.js delete <id>  - Delete a webhook by ID  
  node scripts/manage-webhooks.js clear        - Delete all webhooks
  node scripts/manage-webhooks.js test <topic> - Send a test webhook

Examples:
  node scripts/manage-webhooks.js list
  node scripts/manage-webhooks.js delete 1234567890
  node scripts/manage-webhooks.js test orders/create
      `);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}