import { NextRequest, NextResponse } from 'next/server';
import { groupOrderStore } from '@/lib/group-orders/store';
import { createGroupDraftOrder, sendDraftOrderInvoice } from '@/lib/shopify/draft-orders';

/**
 * Additional invoice URL fix for API responses
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const { hostCustomerId, hostEmail, hostPhone } = await request.json();

    if (!hostCustomerId || !hostEmail) {
      return NextResponse.json(
        { error: 'Host information required' },
        { status: 400 }
      );
    }

    // Get the group order
    const groupOrder = groupOrderStore.getOrderByCode(code);
    if (!groupOrder) {
      return NextResponse.json(
        { error: 'Group order not found' },
        { status: 404 }
      );
    }

    // Verify the requester is the host
    if (groupOrder.hostCustomerId !== hostCustomerId) {
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

    // Get all participant carts from Shopify
    const participantCarts = [];
    const activeParticipants = groupOrder.participants.filter(p => p.status === 'active');
    
    for (const participant of activeParticipants) {
      if (!participant.cartId || participant.cartTotal === 0) continue;
      
      try {
        const cartResponse = await shopifyFetch<{ cart: {
          id: string;
          lines: { edges: Array<{ node: { id: string; quantity: number; merchandise: { id: string } } }> };
        } }>({
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
        console.error(`Failed to fetch cart ${participant.cartId}:`, error);
      }
    }

    if (participantCarts.length === 0) {
      return NextResponse.json(
        { error: 'No valid carts found for group order' },
        { status: 400 }
      );
    }

    // Create the draft order
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

    // Send the invoice to the host
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

    // Update group order status to completed
    groupOrderStore.updateOrder(code, {
      status: 'completed' as const,
    });

    // Ensure invoice URLs are reliable for customer access
    const reliableInvoiceUrl = ensureReliableInvoiceUrl(draftOrder.invoiceUrl);

    return NextResponse.json({
      success: true,
      draftOrder: {
        id: draftOrder.id,
        name: draftOrder.name,
        invoiceUrl: reliableInvoiceUrl,
        totalPrice: draftOrder.totalPrice,
      },
      checkoutUrl: reliableInvoiceUrl,
    });
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