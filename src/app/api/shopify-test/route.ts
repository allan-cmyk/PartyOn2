import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if environment variables are set
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
    const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    
    if (!domain || !token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing environment variables',
        hasToken: !!token,
        hasDomain: !!domain
      });
    }

    // Test Shopify Storefront API connection
    const shopifyUrl = `https://${domain}/api/2024-01/graphql.json`;
    
    const query = `
      {
        shop {
          name
          primaryDomain {
            url
          }
        }
      }
    `;

    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json({ 
        success: false, 
        message: 'Shopify API error',
        errors: data.errors 
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully connected to Shopify!',
      shopName: data.data?.shop?.name,
      domain: data.data?.shop?.primaryDomain?.url,
      // Don't expose the actual token
      tokenLength: token.length,
      domainConfigured: domain
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Connection error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}