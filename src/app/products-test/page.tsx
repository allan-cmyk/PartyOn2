'use client';

import { useCustomProducts } from '@/lib/cart/hooks/useCustomProducts';
import { formatPrice, getProductImageUrl } from '@/lib/shopify/utils';
import Link from 'next/link';

export default function ProductsTestPage() {
  const { products, loading, error } = useCustomProducts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <h2 className="text-red-800 font-semibold">Error loading products</h2>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mt-4">Shopify Products Test</h1>
          <p className="text-gray-600">Found {products.length} products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const price = product.priceRange.minVariantPrice;
            const imageUrl = getProductImageUrl(product);
            
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {imageUrl && (
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.vendor}</p>
                  <p className="text-gray-700 font-semibold">
                    {formatPrice(price.amount, price.currencyCode)}
                  </p>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Handle: {product.handle}</p>
                    <p className="text-xs text-gray-500">Type: {product.productType}</p>
                    {product.tags.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Tags: {product.tags.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found in your Shopify store.</p>
            <p className="text-gray-500 text-sm mt-2">
              Make sure you have products published to the online store sales channel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}