import { NextRequest, NextResponse } from 'next/server';
import { saveSharedCart } from '@/lib/cart/shareCart.server';
import { generateShareUrl, type SharedCartData } from '@/lib/cart/shareCart';

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
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
    };

    // Save cart and get short ID
    const shortId = await saveSharedCart(cartData);

    // Generate shareable URL
    const shareUrl = generateShareUrl(shortId);

    return NextResponse.json({
      success: true,
      shortId,
      shareUrl,
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