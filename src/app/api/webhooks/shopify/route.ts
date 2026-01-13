import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  getWebhookHeaders,
  validateWebhookDomain
} from '@/lib/shopify/webhook-verification';
import { db } from '@/lib/group-orders/database';

// Shopify webhook topics we handle
const WEBHOOK_TOPICS = {
  ORDERS_CREATE: 'orders/create',
  ORDERS_UPDATED: 'orders/updated',
  ORDERS_PAID: 'orders/paid',
  ORDERS_FULFILLED: 'orders/fulfilled',
  ORDERS_CANCELLED: 'orders/cancelled',
  CUSTOMERS_CREATE: 'customers/create',
  CUSTOMERS_UPDATE: 'customers/update'
};

export async function POST(request: NextRequest) {
  try {
    // Get webhook headers
    const headers = getWebhookHeaders(request.headers);
    const { topic, domain, signature, webhookId } = headers;
    
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Verify webhook domain matches our store
    if (!validateWebhookDomain(domain)) {
      console.error(`Invalid webhook domain: ${domain}`);
      return NextResponse.json(
        { error: 'Invalid shop domain' },
        { status: 401 }
      );
    }
    
    // Verify webhook is from Shopify
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('SHOPIFY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }
    
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse webhook data
    const data = JSON.parse(rawBody);
    
    // Log webhook receipt
    console.log(`Received webhook: ${topic} from ${domain} (ID: ${webhookId})`);
    
    // Handle different webhook topics
    switch (topic) {
      case WEBHOOK_TOPICS.ORDERS_CREATE:
        await handleOrderCreated(data);
        break;
        
      case WEBHOOK_TOPICS.ORDERS_UPDATED:
        await handleOrderUpdated(data);
        break;
        
      case WEBHOOK_TOPICS.ORDERS_PAID:
        await handleOrderPaid(data);
        break;
        
      case WEBHOOK_TOPICS.ORDERS_FULFILLED:
        await handleOrderFulfilled(data);
        break;
        
      case WEBHOOK_TOPICS.ORDERS_CANCELLED:
        await handleOrderCancelled(data);
        break;
        
      case WEBHOOK_TOPICS.CUSTOMERS_CREATE:
        await handleCustomerCreated(data);
        break;
        
      case WEBHOOK_TOPICS.CUSTOMERS_UPDATE:
        await handleCustomerUpdated(data);
        break;
        
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }
    
    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent retries for processing errors
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

// Handler functions for each webhook type
async function handleOrderCreated(order: ShopifyOrder) {
  console.log('New order created:', order.name);

  // Extract delivery information from order attributes
  const noteAttributes = order.note_attributes || [];
  const deliveryDate = noteAttributes.find((attr) => attr.name === 'delivery_date')?.value;
  const deliveryTime = noteAttributes.find((attr) => attr.name === 'delivery_time')?.value;
  const deliveryInstructions = noteAttributes.find((attr) => attr.name === 'delivery_instructions')?.value;

  // Check if this is a group order
  const isGroupOrder = noteAttributes.find((attr) => attr.name === 'group_order')?.value === 'true';
  const shareCode = noteAttributes.find((attr) => attr.name === 'share_code')?.value;

  if (isGroupOrder && shareCode) {
    await handleGroupOrderCheckout(order, shareCode);
  }

  console.log('Order delivery details:', {
    date: deliveryDate,
    time: deliveryTime,
    instructions: deliveryInstructions,
    isGroupOrder,
    shareCode
  });
}

/**
 * Handle a group order participant's checkout completion
 * Updates participant status and stores line items for visibility
 */
async function handleGroupOrderCheckout(order: ShopifyOrder, shareCode: string) {
  try {
    console.log(`Processing group order checkout for share code: ${shareCode}`);

    // Find the participant by their cart ID (stored in cart attributes)
    // The cart_id is not directly available in Shopify order, so we find by email
    const email = order.email || order.customer?.email;
    if (!email) {
      console.warn('No email found for group order checkout');
      return;
    }

    const participant = await db.findParticipantByEmail(shareCode, email);
    if (!participant) {
      console.warn(`No participant found with email ${email} for group ${shareCode}`);
      return;
    }

    // Update participant checkout status
    await db.updateParticipantCheckoutStatus(shareCode, participant.cartId, {
      shopifyOrderId: String(order.id),
      shopifyOrderName: order.name || `#${order.order_number}`,
    });

    // Store line items for group visibility
    const lineItems = order.line_items?.map(item => ({
      shopifyLineId: String(item.id),
      title: item.title,
      variantTitle: item.variant_title || undefined,
      quantity: item.quantity,
      price: parseFloat(item.price),
      imageUrl: item.image?.src || undefined,
    })) || [];

    if (lineItems.length > 0) {
      await db.addOrderItems(shareCode, participant.id, lineItems);
    }

    console.log(`Group order checkout processed: ${participant.guestName || email} checked out ${lineItems.length} items`);

  } catch (error) {
    console.error('Error processing group order checkout:', error);
  }
}

// Shopify Order type for webhook
interface ShopifyOrder {
  id: number
  name: string
  order_number: number
  email?: string
  customer?: {
    id: number
    email: string
    first_name: string
    last_name: string
  }
  note_attributes?: Array<{ name: string; value: string }>
  line_items?: Array<{
    id: number
    title: string
    variant_title?: string
    quantity: number
    price: string
    image?: {
      src: string
    }
  }>
}

async function handleOrderUpdated(order: Record<string, unknown>) {
  console.log('Order updated:', order.name);
  // TODO: Update internal records
  // TODO: Notify customer if significant changes
}

async function handleOrderPaid(order: Record<string, unknown>) {
  console.log('Order paid:', order.name);
  // TODO: Send payment confirmation
  // TODO: Trigger fulfillment process
}

async function handleOrderFulfilled(order: Record<string, unknown>) {
  console.log('Order fulfilled:', order.name);
  // TODO: Send delivery confirmation
  // TODO: Request feedback/review
}

async function handleOrderCancelled(order: Record<string, unknown>) {
  console.log('Order cancelled:', order.name);
  // TODO: Send cancellation confirmation
  // TODO: Update delivery schedule
}

async function handleCustomerCreated(customer: Record<string, unknown>) {
  console.log('New customer created:', customer.email);
  // TODO: Send welcome email
  // TODO: Add to marketing list if opted in
}

async function handleCustomerUpdated(customer: Record<string, unknown>) {
  console.log('Customer updated:', customer.email);
  // TODO: Sync customer data
}

// GET endpoint to verify webhook endpoint is working
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Shopify webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}