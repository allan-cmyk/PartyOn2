'use client';

import { type ReactElement } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardSuccessPage(): ReactElement {
  const params = useParams() ?? {};
  const code = (params.code as string) || '';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        <Link href="/" className="inline-block mb-6">
          <Image
            src="/images/partyon-logo.png"
            alt="Party On"
            width={120}
            height={38}
            className="h-10 w-auto mx-auto"
          />
        </Link>

        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Confirmed
        </h1>
        <p className="text-gray-600 mb-6">
          Your order has been placed. We will be in touch with delivery details.
        </p>

        <Link
          href={`/dashboard/${code}`}
          className="inline-block px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
