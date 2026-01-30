'use client';

import { ReactElement } from 'react';

/**
 * Loading skeleton for the group order dashboard.
 * Shows placeholder shapes while data loads.
 */
export default function DashboardSkeleton(): ReactElement {
  return (
    <div className="pt-24 min-h-screen bg-gray-50 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
            <div className="h-4 w-32 bg-gray-100 rounded mt-1.5" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-24 bg-gray-100 rounded" />
            <div className="h-9 w-20 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-2">
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 bg-gray-200 rounded-full" />
          <div className="h-9 w-24 bg-gray-100 rounded-full" />
          <div className="h-9 w-20 bg-gray-100 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery info */}
            <div className="bg-gray-100 rounded-lg p-4 h-20" />

            {/* Draft cart */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between mb-3">
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-100 rounded mt-1" />
                  </div>
                  <div className="h-4 w-14 bg-gray-200 rounded" />
                </div>
              ))}
            </div>

            {/* Product catalog placeholder */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-lg h-36" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2 py-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-4 w-full bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
