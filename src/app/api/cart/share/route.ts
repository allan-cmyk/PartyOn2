import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { generateShareUrl, type SharedCartData } from '@/lib/cart/shareCart';

const SLUG_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const SLUG_LENGTH = 7;

function generateSlug(): string {
  let result = '';
  for (let i = 0; i < SLUG_LENGTH; i++) {
    result += SLUG_ALPHABET.charAt(Math.floor(Math.random() * SLUG_ALPHABET.length));
  }
  return result;
}

/**
 * Generate a unique slug, retrying on collision.
 * 62^7 = 3.5T combinations — collisions are essentially impossible at our scale.
 */
async function generateUniqueSlug(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    const existing = await prisma.cartShareLink.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  throw new Error('Failed to generate unique slug after 5 attempts');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variants } = body;

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: 'Cart must contain at least one item' },
        { status: 400 }
      );
    }

    for (const variant of variants) {
      if (!variant.id || typeof variant.id !== 'string') {
        return NextResponse.json({ error: 'Invalid variant ID' }, { status: 400 });
      }
      if (!variant.quantity || typeof variant.quantity !== 'number' || variant.quantity <= 0) {
        return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
      }
    }

    const cartData: SharedCartData = {
      variants,
      timestamp: Date.now(),
      expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days
    };

    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Generate the long URL once so we can extract the encoded c + t params,
    // then persist them under a short slug.
    const longUrl = generateShareUrl(cartData, baseUrl);
    const longParams = new URL(longUrl).searchParams;
    const c = longParams.get('c');
    const t = longParams.get('t');

    if (!c || !t) {
      // Should never happen, but fall back to the long URL rather than crash.
      return NextResponse.json({ success: true, shareUrl: longUrl, expiresAt: cartData.expiresAt });
    }

    const slug = await generateUniqueSlug();

    await prisma.cartShareLink.create({
      data: {
        slug,
        cartData: c,
        token: t,
        expiresAt: new Date(cartData.expiresAt!),
      },
    });

    const shareUrl = `${baseUrl}/s/${slug}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      expiresAt: cartData.expiresAt,
    });
  } catch (error) {
    console.error('Error creating shared cart:', error);
    return NextResponse.json({ error: 'Failed to create shared cart' }, { status: 500 });
  }
}
