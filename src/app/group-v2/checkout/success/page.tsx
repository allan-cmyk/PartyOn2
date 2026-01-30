'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, ReactElement } from 'react';

function CheckoutSuccessContent(): ReactElement {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  return (
    <div className="pt-32 pb-16 px-4 min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful
        </h1>
        <p className="text-gray-600 mb-6">
          Your items have been purchased and will be included in the group delivery.
          You can view your purchased items on the group dashboard.
        </p>

        {code ? (
          <Link
            href={`/group-v2/${code}/dashboard`}
            className="inline-block px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800"
          >
            Return to Dashboard
          </Link>
        ) : (
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800"
          >
            Return Home
          </Link>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage(): ReactElement {
  return (
    <Suspense fallback={
      <div className="pt-32 pb-16 px-4 min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full" />
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
          </div>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
