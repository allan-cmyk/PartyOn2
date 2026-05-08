/**
 * Short-link redirect for shared carts.
 *
 *   GET /s/<slug>  →  302  →  /cart/shared?c=<cartData>&t=<token>
 *
 * The /cart/shared page handles the existing parse + add-to-cart flow.
 * We only persist the encoded c + t pair on the POST side; this route just
 * recovers them and bumps the view count.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Slug is 7 chars from [a-zA-Z0-9]; reject anything else without hitting DB.
  if (!slug || !/^[A-Za-z0-9]{4,16}$/.test(slug)) {
    return NextResponse.redirect(new URL('/?cart-share-invalid=1', request.url), 302);
  }

  const link = await prisma.cartShareLink.findUnique({ where: { slug } });

  if (!link) {
    return NextResponse.redirect(new URL('/?cart-share-not-found=1', request.url), 302);
  }

  if (link.expiresAt.getTime() < Date.now()) {
    return NextResponse.redirect(new URL('/?cart-share-expired=1', request.url), 302);
  }

  // Bump view count, fire-and-forget — don't block the redirect on it.
  prisma.cartShareLink
    .update({ where: { slug }, data: { viewCount: { increment: 1 } } })
    .catch((err) => console.error('Failed to increment cart-share view count:', err));

  const target = new URL('/cart/shared', request.url);
  target.searchParams.set('c', link.cartData);
  target.searchParams.set('t', link.token);

  return NextResponse.redirect(target, 302);
}
