'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

/**
 * Invoice redirect handler
 * Redirects invoice URLs from custom domain to reliable Shopify store domain
 */
export default function InvoiceRedirect() {
  const params = useParams();
  const slug = params.slug as string[];

  useEffect(() => {
    if (slug && slug.length > 0) {
      // Construct the correct Shopify store domain URL
      const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'premier-concierge.myshopify.com';
      const invoicePath = slug.join('/');
      const correctUrl = `https://${storeDomain}/invoices/${invoicePath}`;

      console.log('🔄 Redirecting invoice URL:', {
        from: window.location.href,
        to: correctUrl
      });

      // Redirect to the correct Shopify invoice URL
      window.location.replace(correctUrl);
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to checkout...</h2>
        <p className="text-gray-600">You'll be redirected to complete your purchase in just a moment.</p>
      </div>
    </div>
  );
}