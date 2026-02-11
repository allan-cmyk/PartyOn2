/**
 * @fileoverview Grid of Welcome to Austin packages for Premier Party Cruises
 * @module components/partners/WelcomePackageGrid
 */

'use client';

import { useState, useEffect, type ReactElement } from 'react';
import type { Product } from '@/lib/types';
import WelcomePackageCard from './WelcomePackageCard';

interface WelcomePackageGridProps {
  /** Discount code to show on cards */
  discountCode?: string;
}

/**
 * Fetches and displays Welcome to Austin packages in a responsive grid
 */
export default function WelcomePackageGrid({
  discountCode = 'PREMIERPARTYCRUISES',
}: WelcomePackageGridProps): ReactElement {
  const [packages, setPackages] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWelcomePackages(): Promise<void> {
      try {
        setLoading(true);
        // Fetch products with "Welcome to Austin" tag
        const response = await fetch(
          '/api/products?search=Welcome%20to%20Austin&first=10'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }

        const data = await response.json();

        // Unwrap edges/node structure from API response
        const allProducts: Product[] = (data.products?.edges || data.products || [])
          .map((e: { node: Product }) => e.node || e)
          .filter(Boolean);

        // Filter to only Welcome Package product type
        const welcomeProducts = allProducts.filter(
          (p: Product) =>
            p.productType === 'Welcome Package' ||
            p.title.startsWith('Welcome to Austin:')
        );

        setPackages(welcomeProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching welcome packages:', err);
        setError('Unable to load packages');
      } finally {
        setLoading(false);
      }
    }

    fetchWelcomePackages();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-xl overflow-hidden animate-pulse"
          >
            <div className="h-8 bg-gray-700" />
            <div className="aspect-[4/3] bg-gray-700" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-700 rounded w-full" />
              <div className="h-12 bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || packages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">
          {error || 'No packages available at this time.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <WelcomePackageCard
          key={pkg.id}
          product={pkg}
          discountCode={discountCode}
        />
      ))}
    </div>
  );
}
