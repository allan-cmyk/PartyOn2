'use client';

import React from 'react';

// Product card skeleton loader
export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-gray-200" />
      <div className="p-6">
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="space-y-2">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// Products grid skeleton
export function ProductsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Page section skeleton
export function PageSectionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4" />
      <div className="h-px bg-gray-200 w-16 mx-auto mb-8" />
      <div className="space-y-3 max-w-3xl mx-auto">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

// Spinner loader
export function Spinner({ size = 'md', color = 'gold' }: { size?: 'sm' | 'md' | 'lg'; color?: 'gold' | 'white' | 'gray' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  const colorClasses = {
    gold: 'border-brand-yellow',
    white: 'border-white',
    gray: 'border-gray-600',
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`} />
  );
}

// Loading overlay
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 tracking-[0.1em]">{message.toUpperCase()}</p>
      </div>
    </div>
  );
}

// Full page loader
export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 tracking-[0.08em] text-sm">LOADING...</p>
      </div>
    </div>
  );
}

// Inline loader
export function InlineLoader({ text = 'Loading' }: { text?: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <Spinner size="sm" />
      <span className="text-sm text-gray-600 tracking-[0.1em]">{text.toUpperCase()}</span>
    </div>
  );
}