'use client';

import { ReactElement } from 'react';

export default function DashboardSkeleton(): ReactElement {
  return (
    <div className="pt-24 min-h-screen bg-whiteSoft animate-pulse">
      {/* Header skeleton - light gradient hero */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-yellow-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 py-5 px-4 md:py-6 md:px-6">
          {/* Left column */}
          <div className="flex flex-col gap-2">
            <div className="h-8 w-56 bg-gray-200/50 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-gray-200/50 rounded-full" />
              <div className="h-5 w-12 bg-gray-200/50 rounded-full" />
            </div>
            <div className="h-4 w-40 bg-gray-200/50 rounded mt-0.5" />
            <div className="h-9 w-24 bg-gray-200/50 rounded-lg mt-1" />
          </div>

          {/* Right column - timer card placeholders */}
          <div className="flex flex-col sm:flex-row gap-3 md:justify-end md:items-start">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 min-w-[160px]">
              <div className="h-3 w-24 bg-gray-200/50 rounded mb-2" />
              <div className="h-7 w-32 bg-gray-200/50 rounded" />
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 min-w-[160px]">
              <div className="h-3 w-24 bg-gray-200/50 rounded mb-2" />
              <div className="h-7 w-32 bg-gray-200/50 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar skeleton - segmented control */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="bg-whiteSoft rounded-lg p-1 flex gap-0.5 w-fit">
            <div className="h-9 w-28 bg-gray-200/50 rounded-md" />
            <div className="h-9 w-24 bg-whiteSoft rounded-md" />
            <div className="h-9 w-20 bg-whiteSoft rounded-md" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-whiteSoft rounded-lg p-4 h-20" />
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between mb-3">
                <div className="h-4 w-28 bg-gray-200/50 rounded" />
                <div className="h-4 w-16 bg-gray-200/50 rounded" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-200 last:border-0">
                  <div className="w-12 h-12 bg-gray-200/50 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200/50 rounded" />
                    <div className="h-3 w-20 bg-whiteSoft rounded mt-1" />
                  </div>
                  <div className="h-4 w-14 bg-gray-200/50 rounded" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="h-4 w-32 bg-gray-200/50 rounded mb-3" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-whiteSoft rounded-lg h-36" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="h-4 w-24 bg-gray-200/50 rounded mb-3" />
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2 py-2">
                  <div className="w-8 h-8 bg-gray-200/50 rounded-full" />
                  <div className="h-4 w-20 bg-whiteSoft rounded" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="h-4 w-24 bg-gray-200/50 rounded mb-3" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-whiteSoft rounded" />
                <div className="h-4 w-full bg-whiteSoft rounded" />
                <div className="h-4 w-full bg-whiteSoft rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
