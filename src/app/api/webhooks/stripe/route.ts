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
import { prisma } from '@/lib/database/client';

// Give the webhook handler 60s (instead of default 30s)
export const maxDuration = 60;

/**
 * POST /api/webhooks/stripe
 * Handle incoming Stripe webhook events
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  let stripeEventId: string | undefined;
  let eventType: string | undefined;

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

    stripeEventId = event.id;
    eventType = event.type;

    // Log the event for debugging
    console.log('[Stripe Webhook] Received event:', event.type, event.id);

    // Log RECEIVED status
    await logWebhookEvent(stripeEventId, eventType, 'RECEIVED');

    // Process the event
    await processWebhookEvent(event);

    // Log PROCESSED status
    const processingMs = Date.now() - startTime;
    await logWebhookEvent(stripeEventId, eventType, 'PROCESSED', null, processingMs);

    // Return success
    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);

    // Log FAILED status
    if (stripeEventId && eventType) {
      const processingMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await logWebhookEvent(stripeEventId, eventType, 'FAILED', errorMessage, processingMs).catch(
        (logErr) => console.error('[Stripe Webhook] Failed to log event:', logErr)
      );
    }

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

async function logWebhookEvent(
  stripeEventId: string,
  eventType: string,
  status: string,
  errorMessage?: string | null,
  processingMs?: number
): Promise<void> {
  try {
    await prisma.webhookEvent.upsert({
      where: { stripeEventId },
      create: {
        stripeEventId,
        eventType,
        status,
        errorMessage,
        processingMs,
      },
      update: {
        status,
        errorMessage,
        processingMs,
      },
    });
  } catch (err) {
    // Don't let logging failures break the webhook
    console.error('[Stripe Webhook] Failed to log webhook event:', err);
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
