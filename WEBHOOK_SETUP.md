# Shopify Webhook Setup Guide

## Prerequisites

You need these environment variables in your `.env.local`:

```env
# Existing (you already have these)
NEXT_PUBLIC_SHOPIFY_DOMAIN=premier-concierge.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=[your-storefront-token]

# New - Add these now
SHOPIFY_ADMIN_API_TOKEN=[paste-your-admin-api-token-here]
SHOPIFY_WEBHOOK_SECRET=[generate-random-string-see-below]
NEXT_PUBLIC_APP_URL=https://your-deployed-url.vercel.app
```

## Step 1: Generate Webhook Secret

Run this command to generate a secure webhook secret:

```bash
# macOS/Linux
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add it as `SHOPIFY_WEBHOOK_SECRET` in your `.env.local`

## Step 2: Add Admin API Token

1. Get the Admin API token from Shopify (as discussed)
2. Add it as `SHOPIFY_ADMIN_API_TOKEN` in your `.env.local`

## Step 3: Register Webhooks

Once you have both tokens configured:

```bash
# Register all webhooks
node scripts/register-webhooks.js
```

This will register webhooks for:
- orders/create
- orders/updated
- orders/fulfilled
- orders/cancelled
- customers/create
- customers/update

## Step 4: Verify Webhooks

```bash
# List all registered webhooks
node scripts/manage-webhooks.js list

# Test a webhook locally (development)
node scripts/manage-webhooks.js test orders/create
```

## Webhook Management Commands

```bash
# List all webhooks
node scripts/manage-webhooks.js list

# Delete a specific webhook
node scripts/manage-webhooks.js delete <webhook-id>

# Delete all webhooks (careful!)
node scripts/manage-webhooks.js clear

# Send test webhook (for local testing)
node scripts/manage-webhooks.js test orders/create
```

## Testing Webhooks Locally

For local development, you can use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose port 3000
ngrok http 3000

# Update NEXT_PUBLIC_APP_URL in .env.local with ngrok URL
# Then register webhooks
```

## Webhook Handler Location

The webhook handler is at: `/api/webhooks/shopify`

Current functionality:
- ✅ Signature verification
- ✅ Domain validation
- ✅ Order processing handlers
- ✅ Customer update handlers
- 📋 TODO: Email notifications
- 📋 TODO: SMS notifications
- 📋 TODO: Loyalty points updates

## Troubleshooting

### Webhooks not being received
1. Check webhook registration: `node scripts/manage-webhooks.js list`
2. Verify your app URL is correct in `.env.local`
3. Check Shopify notification settings

### Signature verification failing
1. Ensure `SHOPIFY_WEBHOOK_SECRET` matches what you used during registration
2. Make sure you're using the raw request body for verification

### Testing webhook locally
1. Use the test command: `node scripts/manage-webhooks.js test orders/create`
2. Check your server logs for output

## Production Deployment

Before deploying to production:

1. **Update environment variables on Vercel:**
   ```
   SHOPIFY_ADMIN_API_TOKEN=[your-token]
   SHOPIFY_WEBHOOK_SECRET=[your-secret]
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

2. **Re-register webhooks with production URL:**
   ```bash
   # After deployment, run this locally with production env vars
   node scripts/register-webhooks.js
   ```

3. **Verify webhooks are working:**
   - Place a test order
   - Check Vercel logs for webhook processing

## Security Notes

- **Never commit** `.env.local` to git
- **Admin API token** should only be used server-side
- **Webhook secret** is used for HMAC verification
- Always verify webhook signatures before processing