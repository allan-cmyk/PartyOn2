import { NextRequest, NextResponse } from 'next/server';
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
      expiresAt: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days from now
    };

    // Generate shareable URL with encoded data (no storage needed)
    const shareUrl = generateShareUrl(cartData);

    return NextResponse.json({
      success: true,
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