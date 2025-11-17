import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to enforce canonical non-www domain
 * Redirects www.partyondelivery.com -> partyondelivery.com
 */
export function middleware(request: NextRequest) {
  const { hostname } = request.nextUrl;

  // Redirect www to non-www (canonical domain)
  if (hostname.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.hostname = hostname.replace('www.', '');

    // 301 Permanent Redirect for SEO
    return NextResponse.redirect(url, { status: 301 });
  }

  return NextResponse.next();
}

/**
 * Configure which routes should run this middleware
 * Match all paths except Next.js internal files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
