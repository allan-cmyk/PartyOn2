'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

/**
 * Invoice redirect handler
 * Redirects invoice URLs from custom domain to reliable Shopify store domain
 */
export default function InvoiceRedirect() {
  const params = useParams();
  const slug = params?.slug as string[];

  useEffect(() => {
    if (slug && slug.length > 0) {
      // Construct the correct Shopify store domain URL
      // Note: Using hardcoded domain since this needs to work on client-side
      const storeDomain = 'premier-concierge.myshopify.com';

      // Handle different URL patterns:
      // 1. /invoices/abc123 -> direct invoice ID
      // 2. /53817671858/invoices/abc123 -> store ID + invoice ID (need to extract just invoice ID)
      let invoiceId = '';

      if (slug.length === 1) {
        // Direct invoice ID: /invoices/abc123
        invoiceId = slug[0];
      } else if (slug.length === 3 && slug[1] === 'invoices') {
        // Store ID + invoices + ID: /53817671858/invoices/abc123
        invoiceId = slug[2];
      } else {
        // Fallback: join all parts
        invoiceId = slug[slug.length - 1];
      }

      const correctUrl = `https://${storeDomain}/invoices/${invoiceId}`;

      console.log('🔄 Redirecting invoice URL:', {
        from: window.location.href,
        to: correctUrl,
        extractedInvoiceId: invoiceId,
        slugParts: slug
      });

      // Redirect to the correct Shopify invoice URL
      window.location.replace(correctUrl);
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to checkout...</h2>
        <p className="text-gray-600">You&apos;ll be redirected to complete your purchase in just a moment.</p>
      </div>
    </div>
  );
}