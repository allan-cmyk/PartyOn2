import { NextRequest, NextResponse } from 'next/server';
import { groupOrderStore } from '@/lib/group-orders/store';
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

    return NextResponse.json({
      success: true,
      draftOrder: {
        id: draftOrder.id,
        name: draftOrder.name,
        invoiceUrl: draftOrder.invoiceUrl,
        totalPrice: draftOrder.totalPrice,
      },
      checkoutUrl: draftOrder.invoiceUrl,
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