import { NextRequest, NextResponse } from 'next/server';
import { getSharedCart } from '@/lib/cart/shareCart.server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format (6 characters, alphanumeric)
    if (!id || !/^[A-Z0-9]{6}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid cart ID format' },
        { status: 400 }
      );
    }

    // Retrieve shared cart data
    const cartData = await getSharedCart(id);

    if (!cartData) {
      return NextResponse.json(
        { error: 'Cart not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      cartData,
    });

  } catch (error) {
    console.error('Error retrieving shared cart:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve shared cart' },
      { status: 500 }
    );
  }
}