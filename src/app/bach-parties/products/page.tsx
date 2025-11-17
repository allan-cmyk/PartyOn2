'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import { useCart } from '@/lib/shopify/hooks/useCart';
import { useTaggedProducts } from '@/lib/shopify/hooks/useTaggedProducts';
import { ShopifyProduct } from '@/lib/shopify/types';

export default function BachPartiesProductsPage() {
  const { cart, addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});

  // Fetch products tagged with bach party related tags
  const { products, loading, error } = useTaggedProducts({
    tags: ['bach-party', 'bachelorette', 'bachelor', 'party-package'],
  });

  const handleAddToCart = async (variantId: string, productId: string) => {
    setAddingToCart({ ...addingToCart, [productId]: true });
    try {
      await addToCart(variantId, 1);
      setTimeout(() => {
        setAddingToCart({ ...addingToCart, [productId]: false });
      }, 1500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setAddingToCart({ ...addingToCart, [productId]: false });
    }
  };

  // Group products into curated collections based on tags
  const curatedCollections = useMemo(() => {
    const bacheloretteProducts = products.filter((p: ShopifyProduct) =>
      p.tags.some((tag: string) => tag.toLowerCase().includes('bachelorette') || tag.toLowerCase().includes('bach-party'))
    );

    const bachelorProducts = products.filter((p: ShopifyProduct) =>
      p.tags.some((tag: string) => tag.toLowerCase().includes('bachelor') && !tag.toLowerCase().includes('bachelorette'))
    );

    const packageProducts = products.filter((p: ShopifyProduct) =>
      p.tags.some((tag: string) => tag.toLowerCase().includes('package') || tag.toLowerCase().includes('party-package'))
    );

    return [
      {
        title: 'Bachelorette Favorites',
        description: 'Pretty drinks for the perfect party',
        products: bacheloretteProducts.slice(0, 4),
      },
      {
        title: 'Bachelor Party Essentials',
        description: 'Bold choices for the boys',
        products: bachelorProducts.slice(0, 4),
      },
      {
        title: 'Party Packages',
        description: 'Complete solutions for your celebration',
        products: packageProducts.slice(0, 4),
      },
    ].filter(collection => collection.products.length > 0);
  }, [products]);

  return (
    <div className="bg-white">
      <OldFashionedNavigation />

      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/services/bach-parties/bachelorette-champagne-tower.webp"
          alt="Bach Party Setup"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60" />

        <div className="relative text-center text-white z-10 max-w-4xl mx-auto px-8 hero-fade-in">
          <h1 className="font-serif font-light text-4xl md:text-6xl mb-4 tracking-[0.15em]">
            BACH PARTY COLLECTION
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-4" />
          <p className="text-lg font-light tracking-[0.1em] text-gray-200">
            Unforgettable celebrations start here
          </p>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/bach-parties" className="text-sm text-gray-600 hover:text-gold-600 transition-colors">
                ← Back to Bach Parties
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/products" className="text-sm text-gray-600 hover:text-gold-600 transition-colors">
                Browse All Products
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Cart ({cart?.totalQuantity || 0})</span>
              <Link href="/checkout">
                <button className="px-4 py-2 bg-gold-600 text-gray-900 text-sm hover:bg-gold-700 transition-colors">
                  CHECKOUT
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8">
              <p className="text-red-800">Failed to load products. Please try again later.</p>
            </div>
          </div>
        </section>
      )}

      {/* Curated Collections */}
      {!loading && !error && curatedCollections.map((collection, collectionIndex) => (
        <section key={collection.title} className={`py-16 ${collectionIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-8">
            <ScrollRevealCSS
              duration={800}
              y={20}
              className="text-center mb-12"
            >
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
                {collection.title}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {collection.description}
              </p>
            </ScrollRevealCSS>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {collection.products.map((product: ShopifyProduct, index: number) => {
                const firstVariant = product.variants.edges[0]?.node;
                const firstImage = product.images.edges[0]?.node;
                const price = firstVariant?.price;

                return (
                  <ScrollRevealCSS
                    key={product.id}
                    duration={500}
                    y={20}
                    delay={index * 100}
                    className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Link href={`/products/${product.handle}`}>
                      <div className="relative h-64 cursor-pointer">
                        {firstImage ? (
                          <Image
                            src={firstImage.url}
                            alt={firstImage.altText || product.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-6">
                      <h3 className="font-serif text-xl text-gray-900 mb-2">{product.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.productType || 'Premium alcohol delivery'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-2xl text-gold-600">
                          ${parseFloat(price?.amount || '0').toFixed(2)}
                        </span>
                        {firstVariant && firstVariant.availableForSale ? (
                          <button
                            onClick={() => handleAddToCart(firstVariant.id, product.id)}
                            disabled={addingToCart[product.id]}
                            className={`px-4 py-2 text-sm font-medium transition-all ${
                              addingToCart[product.id]
                                ? 'bg-green-600 text-white'
                                : 'bg-gold-600 text-gray-900 hover:bg-gold-700'
                            }`}
                          >
                            {addingToCart[product.id] ? 'ADDED!' : 'ADD TO CART'}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </ScrollRevealCSS>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* Empty State */}
      {!loading && !error && curatedCollections.length === 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center">
              <h2 className="font-serif text-3xl text-gray-900 mb-4">No Products Available</h2>
              <p className="text-gray-600 mb-8">
                Check back soon or browse all products
              </p>
              <Link href="/products">
                <button className="px-8 py-4 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors">
                  VIEW ALL PRODUCTS
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
            Make It Unforgettable
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Custom packages and party planning for your Austin celebration
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="px-8 py-4 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.15em] font-medium">
                GET PARTY QUOTE
              </button>
            </Link>
            <Link href="/bach-parties/packages/ultimate">
              <button className="px-8 py-4 bg-white text-gold-600 border-2 border-gold-600 hover:bg-gold-50 transition-colors tracking-[0.15em] font-medium">
                VIEW PACKAGES
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
