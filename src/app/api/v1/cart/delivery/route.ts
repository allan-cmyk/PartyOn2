/**
 * Cart Delivery API
 *
 * GET /api/v1/cart/delivery - Get delivery info
 * POST /api/v1/cart/delivery - Set delivery info
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getCartById,
  setDeliveryInfo,
  hasDeliveryInfo,
} from '@/lib/inventory/services/cart-service';

const CART_ID_COOKIE = 'cart_id';

/**
 * GET /api/v1/cart/delivery
 * Get current delivery info for cart
 */
export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'No cart found' },
        { status: 404 }
      );
    }

    const cart = await getCartById(cartId);
    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    const hasDelivery = hasDeliveryInfo(cart);

    return NextResponse.json({
      success: true,
      data: {
        hasDeliveryInfo: hasDelivery,
        delivery: hasDelivery
          ? {
              date: cart.deliveryDate,
              time: cart.deliveryTime,
              address: cart.deliveryAddress,
              phone: cart.deliveryPhone,
              instructions: cart.deliveryInstructions,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('[Cart Delivery API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get delivery info',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/cart/delivery
 * Set delivery info for cart
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'No cart found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.date || !body.time || !body.address || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: date, time, address, phone' },
        { status: 400 }
      );
    }

    // Validate address object
    if (!body.address.address1 || !body.address.city || !body.address.zip) {
      return NextResponse.json(
        { success: false, error: 'Address must include: address1, city, zip' },
        { status: 400 }
      );
    }

    // Validate delivery date is in the future
    const deliveryDate = new Date(body.date);
    deliveryDate.setUTCHours(12, 0, 0, 0);
    const now = new Date();
    if (deliveryDate < now) {
      return NextResponse.json(
        { success: false, error: 'Delivery date must be in the future' },
        { status: 400 }
      );
    }

    // Validate 72-hour advance booking (unless express)
    const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilDelivery < 72 && !body.isExpress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Orders require 72-hour advance booking. Use express delivery for shorter notice.',
        },
        { status: 400 }
      );
    }

    const cart = await setDeliveryInfo(cartId, {
      date: deliveryDate,
      time: body.time,
      address: {
        address1: body.address.address1,
        address2: body.address.address2,
        city: body.address.city,
        province: body.address.province || 'TX',
        zip: body.address.zip,
        country: body.address.country || 'US',
      },
      phone: body.phone,
      instructions: body.instructions,
    });

    return NextResponse.json({
      success: true,
      data: {
        cart,
        delivery: {
          date: cart.deliveryDate,
          time: cart.deliveryTime,
          address: cart.deliveryAddress,
          phone: cart.deliveryPhone,
          instructions: cart.deliveryInstructions,
        },
      },
    });
  } catch (error) {
    console.error('[Cart Delivery API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set delivery info',
      },
      { status: 500 }
    );
  }
}
