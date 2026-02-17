/**
 * Cron: Reconcile Stripe payments with orders
 *
 * Runs every 15 minutes. Finds Stripe checkout sessions that completed
 * but have no matching order in the database, and creates the missing orders.
 *
 * This is a safety net for when the checkout.session.completed webhook
 * fails or times out.
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCheckoutSession } from '@/lib/stripe/checkout';
import { prisma } from '@/lib/database/client';
import {
  createOrderFromCheckout,
  getOrderByCheckoutSession,
} from '@/lib/inventory/services/order-service';
import { getCartById } from '@/lib/inventory/services/cart-service';
import { notifyNewOrder, buildGhlPayload } from '@/lib/webhooks/ghl';
import {
  sendOrderConfirmationEmail,
} from '@/lib/email';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const recovered: string[] = [];
  const errors: string[] = [];

  try {
    // List completed checkout sessions from the last 2 hours
    const twoHoursAgo = Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000);

    const sessions = await stripe.checkout.sessions.list({
      status: 'complete',
      created: { gte: twoHoursAgo },
      limit: 100,
      expand: ['data.line_items'],
    });

    console.log(`[Reconcile] Checking ${sessions.data.length} completed sessions`);

    for (const session of sessions.data) {
      try {
        // Skip non-standard checkouts (group v2, draft orders, etc.)
        const sessionType = session.metadata?.type;
        if (sessionType && sessionType !== 'standard') {
          continue;
        }

        // Must have a cartId in metadata
        const cartId = session.metadata?.cartId;
        if (!cartId) continue;

        // Check if an order already exists
        const existingOrder = await getOrderByCheckoutSession(session.id);
        if (existingOrder) continue;

        // No order exists — this is a missed webhook. Recover it.
        console.log(`[Reconcile] Missing order for session ${session.id}, cart ${cartId}`);

        const cart = await getCartById(cartId);
        if (!cart) {
          errors.push(`Cart ${cartId} not found for session ${session.id}`);
          continue;
        }

        // Retrieve the full session with expanded data
        const fullSession = await getCheckoutSession(session.id);
        if (!fullSession) {
          errors.push(`Failed to retrieve full session ${session.id}`);
          continue;
        }

        // Create the order
        const order = await createOrderFromCheckout(fullSession, cart);
        console.log(`[Reconcile] Recovered order ${order.orderNumber} from session ${session.id}`);
        recovered.push(String(order.orderNumber));

        // Notify GHL webhook
        try {
          await notifyNewOrder(buildGhlPayload(order, 'standard'));
        } catch (ghlErr) {
          console.error(`[Reconcile] GHL notify failed for ${order.orderNumber}:`, ghlErr);
        }

        // Create delivery task
        try {
          await prisma.deliveryTask.create({
            data: {
              orderId: order.id,
              scheduledDate: order.deliveryDate,
              scheduledTime: order.deliveryTime,
              status: 'PENDING',
            },
          });
        } catch (deliveryErr) {
          console.error(`[Reconcile] Delivery task failed for ${order.orderNumber}:`, deliveryErr);
        }

        // Send confirmation email
        try {
          const deliveryAddress = order.deliveryAddress as {
            address1?: string;
            address2?: string;
            city?: string;
            province?: string;
            zip?: string;
          } || {};

          await sendOrderConfirmationEmail({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            items: order.items.map((item) => ({
              title: item.title,
              variantTitle: item.variantTitle,
              quantity: item.quantity,
              price: Number(item.price),
              totalPrice: Number(item.totalPrice),
            })),
            subtotal: Number(order.subtotal),
            deliveryFee: Number(order.deliveryFee),
            taxAmount: Number(order.taxAmount),
            discountAmount: Number(order.discountAmount),
            discountCode: order.discountCode || undefined,
            total: Number(order.total),
            deliveryDate: order.deliveryDate,
            deliveryTime: order.deliveryTime,
            deliveryAddress: {
              address1: deliveryAddress.address1 || '',
              address2: deliveryAddress.address2,
              city: deliveryAddress.city || 'Austin',
              province: deliveryAddress.province || 'TX',
              zip: deliveryAddress.zip || '',
            },
            deliveryInstructions: order.deliveryInstructions || undefined,
          });
        } catch (emailErr) {
          console.error(`[Reconcile] Email failed for ${order.orderNumber}:`, emailErr);
        }
      } catch (sessionErr) {
        const msg = sessionErr instanceof Error ? sessionErr.message : String(sessionErr);
        errors.push(`Session ${session.id}: ${msg}`);
        console.error(`[Reconcile] Error processing session ${session.id}:`, sessionErr);
      }
    }

    const summary = {
      checked: sessions.data.length,
      recovered: recovered.length,
      recoveredOrders: recovered,
      errors: errors.length,
      errorDetails: errors,
    };

    console.log('[Reconcile] Complete:', JSON.stringify(summary));

    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    console.error('[Reconcile] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Reconciliation failed',
      },
      { status: 500 }
    );
  }
}
