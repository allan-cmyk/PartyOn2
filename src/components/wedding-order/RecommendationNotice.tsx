'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';

/**
 * Notice displayed after adding wedding package to cart
 * Informs user this is a recommended order that can be adjusted
 */
export default function RecommendationNotice(): ReactElement {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            This is Your Recommended Order
          </h4>
          <p className="text-sm text-blue-700 mb-2">
            Feel free to adjust quantities or remove items to match your needs.
            You can add or remove products before checkout.
          </p>
          <p className="text-sm text-blue-800 font-medium">
            We recommend{' '}
            <Link href="/contact" className="underline hover:text-blue-900">
              contacting us
            </Link>{' '}
            before placing your final order to ensure everything is perfect for your big day.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for cart sidebar
 */
export function RecommendationNoticeBanner(): ReactElement {
  return (
    <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-700">
      <span className="font-medium">Wedding Package:</span> Adjust quantities as needed.{' '}
      <Link href="/contact" className="underline">
        Contact us
      </Link>{' '}
      before final order.
    </div>
  );
}
