import { NextRequest, NextResponse } from 'next/server';
import { type SharedCartData } from '@/lib/cart/shareCart';
import { storeCart } from '@/lib/cart/shortUrlStorage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variants } = body;

    // Validate input
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: 'Cart must contain at least one item' },
        { status: 400 }
      );
    }

    // Validate each variant
    for (const variant of variants) {
      if (!variant.id || typeof variant.id !== 'string') {
        return NextResponse.json(
          { error: 'Invalid variant ID' },
          { status: 400 }
        );
      }
      if (!variant.quantity || typeof variant.quantity !== 'number' || variant.quantity <= 0) {
        return NextResponse.json(
          { error: 'Invalid quantity' },
          { status: 400 }
        );
      }
    }

    // Create shared cart data
    const cartData: SharedCartData = {
      variants,
      timestamp: Date.now(),
      expiresAt: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days from now
    };

    // Store cart data and get short ID
    const shortId = storeCart(cartData);

    // Get base URL from request
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Generate short shareable URL
    const shareUrl = `${baseUrl}/cart/s/${shortId}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      shortId,
      expiresAt: cartData.expiresAt,
    });

  } catch (error) {
    console.error('Error creating shared cart:', error);
    return NextResponse.json(
      { error: 'Failed to create shared cart' },
      { status: 500 }
    );
  }
}