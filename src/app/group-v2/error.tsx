'use client';

import Link from 'next/link';
import { ReactElement } from 'react';

/**
 * Error boundary for /group-v2/* routes.
 * Catches client-side errors within the group ordering pages
 * while keeping the root layout (nav, providers) intact.
 */
export default function GroupV2Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): ReactElement {
  return (
    <div className="pt-32 pb-16 px-4 min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          We hit an unexpected error loading this page. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && error?.message && (
          <pre className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 text-left overflow-auto max-h-40">
            {error.message}
          </pre>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium text-sm"
          >
            Try Again
          </button>
          <Link
            href="/group-v2/create"
            className="px-6 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
          >
            Create New Group
          </Link>
        </div>
      </div>
    </div>
  );
}
