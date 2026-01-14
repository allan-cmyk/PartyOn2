/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe - Receive Stripe webhook events
 *
 * Events handled:
 * - checkout.session.completed - Create order from successful payment
 * - checkout.session.expired - Mark cart as abandoned
 * - payment_intent.succeeded - Backup order creation
 * - payment_intent.payment_failed - Log failed payments
 * - charge.refunded - Process refunds
 */

import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, processWebhookEvent } from '@/lib/stripe';

/**
 * POST /api/webhooks/stripe
 * Handle incoming Stripe webhook events
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the raw body as text for signature verification
    const body = await request.text();

    // Get the Stripe signature header
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing stripe-signature header');
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify signature and construct event
    const event = await constructWebhookEvent(body, signature);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Log the event for debugging
    console.log('[Stripe Webhook] Received event:', event.type, event.id);

    // Process the event
    await processWebhookEvent(event);

    // Return success
    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);

    // Return 500 to trigger Stripe retry
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 500 }
    );
  }
}

/**
 * Disable body parsing for webhook route
 * Required for Stripe signature verification
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
