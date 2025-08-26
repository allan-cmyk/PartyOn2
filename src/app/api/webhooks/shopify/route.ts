import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyWebhookSignature, 
  getWebhookHeaders, 
  validateWebhookDomain 
} from '@/lib/shopify/webhook-verification';

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
async function handleOrderCreated(order: Record<string, unknown>) {
  console.log('New order created:', order.name);
  
  // Extract delivery information from order attributes
  const noteAttributes = order.note_attributes as Array<{ name: string; value: string }> | undefined;
  const deliveryDate = noteAttributes?.find((attr) => attr.name === 'delivery_date')?.value;
  const deliveryTime = noteAttributes?.find((attr) => attr.name === 'delivery_time')?.value;
  const deliveryInstructions = noteAttributes?.find((attr) => attr.name === 'delivery_instructions')?.value;
  
  // TODO: Send order confirmation email
  // TODO: Create internal delivery task
  // TODO: Update inventory if needed
  
  console.log('Order delivery details:', {
    date: deliveryDate,
    time: deliveryTime,
    instructions: deliveryInstructions
  });
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