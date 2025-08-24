/**
 * Shopify Admin API Webhook Management
 * 
 * This module handles webhook registration with Shopify.
 * Run this script to register webhooks with your Shopify store.
 * 
 * Usage: Add to package.json scripts:
 * "webhooks:register": "tsx src/lib/shopify/admin/webhooks.ts"
 */

interface WebhookConfig {
  topic: string;
  address: string;
  format: 'json' | 'xml';
}

const WEBHOOK_CONFIGS: WebhookConfig[] = [
  {
    topic: 'orders/create',
    address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify`,
    format: 'json'
  },
  {
    topic: 'orders/updated',
    address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify`,
    format: 'json'
  },
  {
    topic: 'orders/paid',
    address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify`,
    format: 'json'
  },
  {
    topic: 'orders/fulfilled',
    address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify`,
    format: 'json'
  },
  {
    topic: 'orders/cancelled',
    address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify`,
    format: 'json'
  },
  {
    topic: 'customers/create',
    address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify`,
    format: 'json'
  },
  {
    topic: 'customers/update',
    address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify`,
    format: 'json'
  }
];

export async function registerWebhooks() {
  const shop = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  
  if (!shop || !accessToken) {
    throw new Error('Missing required environment variables for webhook registration');
  }
  
  console.log('Registering webhooks for shop:', shop);
  
  // First, list existing webhooks
  const existingWebhooksResponse = await fetch(
    `https://${shop}/admin/api/2024-01/webhooks.json`,
    {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!existingWebhooksResponse.ok) {
    throw new Error(`Failed to fetch existing webhooks: ${existingWebhooksResponse.statusText}`);
  }
  
  const { webhooks: existingWebhooks } = await existingWebhooksResponse.json();
  console.log(`Found ${existingWebhooks.length} existing webhooks`);
  
  // Register new webhooks
  for (const config of WEBHOOK_CONFIGS) {
    // Check if webhook already exists
    const exists = existingWebhooks.some(
      (webhook: any) => webhook.topic === config.topic && webhook.address === config.address
    );
    
    if (exists) {
      console.log(`Webhook already exists for ${config.topic}`);
      continue;
    }
    
    console.log(`Registering webhook for ${config.topic}...`);
    
    const response = await fetch(
      `https://${shop}/admin/api/2024-01/webhooks.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          webhook: config
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to register webhook for ${config.topic}:`, error);
    } else {
      console.log(`Successfully registered webhook for ${config.topic}`);
    }
  }
  
  console.log('Webhook registration complete');
}

// List all registered webhooks
export async function listWebhooks() {
  const shop = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  
  if (!shop || !accessToken) {
    throw new Error('Missing required environment variables');
  }
  
  const response = await fetch(
    `https://${shop}/admin/api/2024-01/webhooks.json`,
    {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch webhooks: ${response.statusText}`);
  }
  
  const { webhooks } = await response.json();
  return webhooks;
}

// Delete a webhook by ID
export async function deleteWebhook(webhookId: string) {
  const shop = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  
  if (!shop || !accessToken) {
    throw new Error('Missing required environment variables');
  }
  
  const response = await fetch(
    `https://${shop}/admin/api/2024-01/webhooks/${webhookId}.json`,
    {
      method: 'DELETE',
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to delete webhook: ${response.statusText}`);
  }
  
  console.log(`Deleted webhook ${webhookId}`);
}

// If running directly (not imported)
if (require.main === module) {
  registerWebhooks()
    .then(() => console.log('Done'))
    .catch(console.error);
}