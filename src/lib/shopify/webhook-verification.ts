import crypto from 'crypto';

/**
 * Verify Shopify webhook signature
 * Shopify sends webhooks with HMAC signature for security
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.error('Missing signature or secret for webhook verification');
    return false;
  }

  try {
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    // Shopify sends the signature as base64
    return hmac === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Extract and verify webhook headers
 */
export function getWebhookHeaders(headers: Headers) {
  return {
    topic: headers.get('x-shopify-topic'),
    domain: headers.get('x-shopify-shop-domain'),
    signature: headers.get('x-shopify-hmac-sha256'),
    webhookId: headers.get('x-shopify-webhook-id'),
    apiVersion: headers.get('x-shopify-api-version'),
  };
}

/**
 * Validate webhook domain matches our store
 */
export function validateWebhookDomain(domain: string | null): boolean {
  const expectedDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  
  if (!domain || !expectedDomain) {
    return false;
  }

  // Remove protocol if present and compare
  const cleanDomain = domain.replace(/^https?:\/\//, '');
  const cleanExpected = expectedDomain.replace(/^https?:\/\//, '');
  
  return cleanDomain === cleanExpected;
}