import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/group-orders/database';
import { createDraftOrder, calculateDraftOrderAmounts } from '@/lib/draft-orders';
import type { DraftOrderItem } from '@/lib/draft-orders/types';
import { getCartById } from '@/lib/inventory/services/cart-service';
import { sendEmail } from '@/lib/email';
import { EmailType } from '@prisma/client';
import { calculateDeliveryFee } from '@/lib/delivery';
import type { GroupOrderWithParticipants } from '@/lib/group-orders/types';

// Feature flag for custom cart
const USE_CUSTOM_CART = process.env.NEXT_PUBLIC_USE_CUSTOM_CART === 'true';

// Shopify fallback imports (only used when custom cart is disabled)
import { createGroupDraftOrder, sendDraftOrderInvoice } from '@/lib/shopify/draft-orders';
import { shopifyFetch } from '@/lib/shopify/client';

const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      lines(first: 250) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product {
                  title
                }
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
      }
    }
  }
`;

/**
 * Additional invoice URL fix for API responses (Shopify fallback only)
 * Ensures invoice URLs are always using the reliable Shopify domain
 */
function ensureReliableInvoiceUrl(invoiceUrl: string | null | undefined): string | null {
  if (!invoiceUrl) return null;

  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'premier-concierge.myshopify.com';

  // List of custom domains that might cause issues
  const customDomains = [
    'partyondelivery.com',
    'party-on-delivery.com',
    'www.partyondelivery.com',
    'www.party-on-delivery.com'
  ];

  let fixedUrl = invoiceUrl;

  // Replace any custom domain with the reliable store domain
  for (const customDomain of customDomains) {
    fixedUrl = fixedUrl.replace(new RegExp(`https?://${customDomain.replace('.', '\\.')}`, 'gi'), `https://${storeDomain}`);
  }

  // Ensure the URL uses HTTPS
  if (fixedUrl.startsWith('http://')) {
    fixedUrl = fixedUrl.replace('http://', 'https://');
  }

  return fixedUrl;
}

/**
 * Create checkout for a group order using local Draft Order system
 */
async function createLocalCheckout(
  groupOrder: GroupOrderWithParticipants,
  hostEmail: string,
  hostPhone: string | undefined
): Promise<{
  success: true;
  draftOrder: {
    id: string;
    token: string;
    invoiceUrl: string;
    totalPrice: string;
  };
  checkoutUrl: string;
}> {
  if (!groupOrder) {
    throw new Error('Group order not found');
  }

  const activeParticipants = groupOrder.participants.filter(p => p.status === 'active');
  const allItems: DraftOrderItem[] = [];

  // Fetch carts from local database
  for (const participant of activeParticipants) {
    if (!participant.cartId || participant.cartTotal === 0) continue;

    try {
      const cart = await getCartById(participant.cartId);
      if (!cart || cart.items.length === 0) continue;

      // Convert cart items to draft order items with participant name as prefix
      for (const item of cart.items) {
        allItems.push({
          productId: item.productId,
          variantId: item.variantId,
          title: `${item.product.title}${participant.guestName ? ` (${participant.guestName})` : ''}`,
          variantTitle: item.variant.title || undefined,
          quantity: item.quantity,
          price: Number(item.variant.price),
        });
      }
    } catch (error) {
      console.error(`Failed to fetch local cart ${participant.cartId}:`, error);
    }
  }

  if (allItems.length === 0) {
    throw new Error('No valid carts found for group order');
  }

  // Calculate subtotal for delivery fee calculation
  const subtotal = allItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate delivery fee based on zone
  const deliveryResult = calculateDeliveryFee(
    groupOrder.deliveryAddress.zip,
    subtotal,
    false // not express
  );
  const deliveryFee = deliveryResult.fee;

  // Calculate totals
  const amounts = calculateDraftOrderAmounts(
    allItems,
    groupOrder.deliveryAddress.zip,
    deliveryFee,
    0 // discount amount
  );

  // Parse delivery date
  const deliveryDate = new Date(groupOrder.deliveryDate);

  // Create local draft order
  const draftOrder = await createDraftOrder({
    customerEmail: hostEmail,
    customerName: groupOrder.hostName || 'Group Order Host',
    customerPhone: hostPhone,
    deliveryAddress: groupOrder.deliveryAddress.address1,
    deliveryCity: groupOrder.deliveryAddress.city,
    deliveryState: groupOrder.deliveryAddress.province || 'TX',
    deliveryZip: groupOrder.deliveryAddress.zip,
    deliveryDate,
    deliveryTime: groupOrder.deliveryTime,
    deliveryNotes: `Group Order: ${groupOrder.name}\nParticipants: ${activeParticipants.length}\nShare Code: ${groupOrder.shareCode}`,
    items: allItems,
    subtotal: amounts.subtotal,
    taxAmount: amounts.taxAmount,
    deliveryFee: amounts.deliveryFee,
    discountAmount: 0,
    groupOrderId: groupOrder.id,
    createdBy: 'group-order-system',
    adminNotes: `Auto-created from group order ${groupOrder.shareCode}`,
  });

  // Generate invoice URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://party-on-delivery.vercel.app';
  const invoiceUrl = `${baseUrl}/invoice/${draftOrder.token}`;

  // Send invoice email
  const participantList = activeParticipants
    .map(p => `• ${p.guestName || 'Guest'}: $${(p.cartTotal || 0).toFixed(2)}`)
    .join('\n');

  await sendEmail({
    to: hostEmail,
    subject: `Your Party On Delivery Group Order - ${groupOrder.name}`,
    type: EmailType.GROUP_ORDER_INVOICE,
    metadata: {
      groupOrderId: groupOrder.id,
      shareCode: groupOrder.shareCode,
      draftOrderId: draftOrder.id,
    },
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">Party On Delivery</h1>
    <p style="margin: 10px 0 0; opacity: 0.9;">Group Order Invoice</p>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef; border-top: none;">
    <h2 style="color: #1a1a2e; margin: 0 0 20px;">Hello!</h2>
    <p style="color: #495057; line-height: 1.6;">
      Your group order <strong>"${groupOrder.name}"</strong> is ready for payment.
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
      <h3 style="color: #1a1a2e; margin: 0 0 15px; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Order Summary</h3>
      <p style="margin: 8px 0; color: #495057;"><strong>Participants:</strong> ${activeParticipants.length}</p>
      <p style="margin: 8px 0; color: #495057;"><strong>Delivery Date:</strong> ${deliveryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      <p style="margin: 8px 0; color: #495057;"><strong>Delivery Time:</strong> ${groupOrder.deliveryTime}</p>
      <p style="margin: 8px 0; color: #495057;"><strong>Address:</strong> ${groupOrder.deliveryAddress.address1}, ${groupOrder.deliveryAddress.city}, ${groupOrder.deliveryAddress.province} ${groupOrder.deliveryAddress.zip}</p>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
      <h3 style="color: #1a1a2e; margin: 0 0 15px;">Participant Contributions</h3>
      <pre style="white-space: pre-wrap; font-family: inherit; margin: 0; color: #495057;">${participantList}</pre>
    </div>

    <div style="background: #1a1a2e; color: white; padding: 15px 20px; border-radius: 8px; margin: 20px 0; text-align: right;">
      <p style="margin: 5px 0; font-size: 14px;">Subtotal: $${amounts.subtotal.toFixed(2)}</p>
      <p style="margin: 5px 0; font-size: 14px;">Delivery Fee: $${amounts.deliveryFee.toFixed(2)}</p>
      <p style="margin: 5px 0; font-size: 14px;">Tax: $${amounts.taxAmount.toFixed(2)}</p>
      <p style="margin: 15px 0 0; font-size: 20px; color: #D4AF37; font-weight: bold;">Total: $${amounts.total.toFixed(2)}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${invoiceUrl}" style="display: inline-block; background: #D4AF37; color: #1a1a2e; padding: 16px 40px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 18px;">Pay Now</a>
    </div>

    <p style="color: #6c757d; font-size: 14px; text-align: center; margin-top: 30px;">
      If you have any questions, reply to this email or contact us at info@partyondelivery.com
    </p>
  </div>
</body>
</html>
    `,
  });

  return {
    success: true,
    draftOrder: {
      id: draftOrder.id,
      token: draftOrder.token,
      invoiceUrl,
      totalPrice: amounts.total.toFixed(2),
    },
    checkoutUrl: invoiceUrl,
  };
}

/**
 * Create checkout for a group order using Shopify Draft Orders (legacy)
 */
async function createShopifyCheckout(
  groupOrder: GroupOrderWithParticipants,
  hostCustomerId: string,
  hostEmail: string,
  hostPhone: string | undefined
): Promise<{
  success: true;
  draftOrder: {
    id: string;
    name: string;
    invoiceUrl: string | null;
    totalPrice: string;
  };
  checkoutUrl: string | null;
}> {
  if (!groupOrder) {
    throw new Error('Group order not found');
  }

  const activeParticipants = groupOrder.participants.filter(p => p.status === 'active');
  const participantCarts = [];

  // Fetch carts from Shopify
  for (const participant of activeParticipants) {
    if (!participant.cartId || participant.cartTotal === 0) continue;

    try {
      const cartResponse = await shopifyFetch<{
        cart: {
          id: string;
          lines: { edges: Array<{ node: { id: string; quantity: number; merchandise: { id: string } } }> };
        };
      }>({
        query: GET_CART_QUERY,
        variables: { cartId: participant.cartId },
      });

      if (cartResponse.cart) {
        participantCarts.push({
          id: participant.cartId,
          lines: cartResponse.cart.lines.edges.map((e) => e.node),
          participantName: participant.guestName || 'Guest',
        });
      }
    } catch (error) {
      console.error(`Failed to fetch Shopify cart ${participant.cartId}:`, error);
    }
  }

  if (participantCarts.length === 0) {
    throw new Error('No valid carts found for group order');
  }

  // Create Shopify draft order
  const draftOrder = await createGroupDraftOrder(participantCarts, {
    hostEmail,
    hostPhone,
    hostCustomerId,
    deliveryAddress: groupOrder.deliveryAddress,
    deliveryDate: groupOrder.deliveryDate,
    deliveryTime: groupOrder.deliveryTime,
    groupName: groupOrder.name,
    shareCode: groupOrder.shareCode,
  });

  // Send the invoice via Shopify
  if (draftOrder.id) {
    await sendDraftOrderInvoice(
      draftOrder.id,
      hostEmail,
      `Your Party On Delivery Group Order - ${groupOrder.name}`,
      `Hello! Your group order "${groupOrder.name}" is ready for payment.

Total participants: ${activeParticipants.length}
Delivery date: ${new Date(groupOrder.deliveryDate).toLocaleDateString()}
Delivery time: ${groupOrder.deliveryTime}

Click the link below to complete your order.`
    );
  }

  const reliableInvoiceUrl = ensureReliableInvoiceUrl(draftOrder.invoiceUrl);

  return {
    success: true,
    draftOrder: {
      id: draftOrder.id,
      name: draftOrder.name,
      invoiceUrl: reliableInvoiceUrl,
      totalPrice: draftOrder.totalPrice,
    },
    checkoutUrl: reliableInvoiceUrl,
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const { hostCustomerId, hostEmail, hostPhone } = await request.json();

    if (!hostEmail) {
      return NextResponse.json(
        { error: 'Host email is required' },
        { status: 400 }
      );
    }

    // Get the group order from database
    const groupOrder = await db.getOrderByCode(code);
    if (!groupOrder) {
      return NextResponse.json(
        { error: 'Group order not found' },
        { status: 404 }
      );
    }

    // Verify the requester is the host (if customerId is provided)
    if (hostCustomerId && groupOrder.hostCustomerId && groupOrder.hostCustomerId !== hostCustomerId) {
      return NextResponse.json(
        { error: 'Only the host can create checkout' },
        { status: 403 }
      );
    }

    // Check if order is locked
    if (groupOrder.status !== 'locked') {
      return NextResponse.json(
        { error: 'Order must be locked before checkout' },
        { status: 400 }
      );
    }

    let result;

    // Use local checkout when custom cart is enabled
    if (USE_CUSTOM_CART) {
      console.log('[Group Checkout] Using local Draft Order system');
      result = await createLocalCheckout(groupOrder, hostEmail, hostPhone);
    } else {
      // Fall back to Shopify for legacy cart system
      console.log('[Group Checkout] Using Shopify Draft Orders (legacy)');
      if (!hostCustomerId) {
        return NextResponse.json(
          { error: 'Host customer ID required for Shopify checkout' },
          { status: 400 }
        );
      }
      result = await createShopifyCheckout(groupOrder, hostCustomerId, hostEmail, hostPhone);
    }

    // Update group order status to completed
    await db.updateOrderStatus(code, 'completed');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating group checkout:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
