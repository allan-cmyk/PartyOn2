import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route for Shopify app proxies (e.g., recomsale affiliate program)
 * Forwards /community/* requests to Shopify's app proxy system
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;

  if (!shopifyDomain) {
    return NextResponse.json(
      { error: 'Shopify domain not configured' },
      { status: 500 }
    );
  }

  // Construct the full path
  const path = params.path?.join('/') || '';
  const searchParams = request.nextUrl.searchParams.toString();
  const fullPath = `/community/${path}${searchParams ? `?${searchParams}` : ''}`;

  // Forward to Shopify
  const shopifyUrl = `https://${shopifyDomain}${fullPath}`;

  try {
    const response = await fetch(shopifyUrl, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('user-agent') || '',
        'Accept': request.headers.get('accept') || 'text/html',
        'Accept-Language': request.headers.get('accept-language') || 'en',
      },
    });

    // Get the response body
    const body = await response.text();

    // Forward the response
    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html',
        'Cache-Control': response.headers.get('cache-control') || 'no-cache',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Shopify' },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;

  if (!shopifyDomain) {
    return NextResponse.json(
      { error: 'Shopify domain not configured' },
      { status: 500 }
    );
  }

  // Construct the full path
  const path = params.path?.join('/') || '';
  const searchParams = request.nextUrl.searchParams.toString();
  const fullPath = `/community/${path}${searchParams ? `?${searchParams}` : ''}`;

  // Get request body
  const body = await request.text();

  // Forward to Shopify
  const shopifyUrl = `https://${shopifyDomain}${fullPath}`;

  try {
    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'User-Agent': request.headers.get('user-agent') || '',
        'Content-Type': request.headers.get('content-type') || 'application/x-www-form-urlencoded',
        'Accept': request.headers.get('accept') || 'text/html',
      },
      body,
    });

    // Get the response body
    const responseBody = await response.text();

    // Forward the response
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html',
        'Cache-Control': response.headers.get('cache-control') || 'no-cache',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Shopify' },
      { status: 502 }
    );
  }
}
