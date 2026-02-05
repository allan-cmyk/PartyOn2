'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

/**
 * Store-specific invoice redirect handler
 * Handles URLs like /53817671858/invoices/abc123
 */
export default function StoreInvoiceRedirect() {
  const params = useParams();
  const storeId = params.storeId as string;
  const slug = params.slug as string[];

  useEffect(() => {
    if (slug && slug.length > 0) {
      // Construct the correct Shopify store domain URL
      // Note: Using hardcoded domain since this needs to work on client-side
      const storeDomain = 'premier-concierge.myshopify.com';
      const invoiceId = slug[0]; // First slug part is the invoice ID
      const correctUrl = `https://${storeDomain}/invoices/${invoiceId}`;

      console.log('🔄 Redirecting store-specific invoice URL:', {
        from: window.location.href,
        to: correctUrl,
        storeId,
        invoiceId,
        slugParts: slug
      });

      // Redirect to the correct Shopify invoice URL
      window.location.replace(correctUrl);
    }
  }, [storeId, slug]);

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