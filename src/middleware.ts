import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware:
 * 1. Enforce canonical non-www domain
 * 2. Set affiliate attribution cookie from ?ref= param
 */
export function middleware(request: NextRequest) {
  const { hostname } = request.nextUrl;

  // Redirect www to non-www (canonical domain)
  if (hostname.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.hostname = hostname.replace('www.', '');
    // 301 Permanent Redirect for SEO
    // The redirected request will re-enter middleware with the same ?ref= param
    return NextResponse.redirect(url, { status: 301 });
  }

  // Redirect unauthenticated users away from affiliate dashboard
  if (request.nextUrl.pathname.startsWith('/affiliate/dashboard')) {
    const session = request.cookies.get('affiliate_session');
    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/affiliate/login';
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  };

  // Set affiliate attribution cookie from ?ref= query param (last-touch, 30 days)
  const refCode = request.nextUrl.searchParams.get('ref');
  if (refCode) {
    response.cookies.set('ref_code', refCode.toUpperCase(), cookieOptions);
  }


  return response;
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
