'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerContext } from '@/contexts/CustomerContext';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import CustomerAuth from '@/components/CustomerAuth';
import Link from 'next/link';
import { formatPrice } from '@/lib/shopify/utils';

export default function OrderHistoryPage() {
  const router = useRouter();
  const { customer, isAuthenticated, loading } = useCustomerContext();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setIsAuthOpen(true);
    }
  }, [loading, isAuthenticated]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'fulfilled':
        return 'text-green-600';
      case 'pending':
      case 'unfulfilled':
        return 'text-yellow-600';
      case 'refunded':
      case 'voided':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <>
        <OldFashionedNavigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <OldFashionedNavigation />
        <div className="min-h-screen pt-32">
          <CustomerAuth 
            isOpen={isAuthOpen}
            onClose={() => {
              setIsAuthOpen(false);
              router.push('/');
            }}
            redirectTo="/account/orders"
          />
        </div>
      </>
    );
  }

  const orders = customer?.orders?.edges || [];

  return (
    <>
      <OldFashionedNavigation />
      
      <main className="min-h-screen pt-32">
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-12">
          <h1 className="font-cormorant text-4xl tracking-[0.15em] text-center mb-12">
            MY ACCOUNT
          </h1>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <nav className="space-y-4">
                <Link 
                  href="/account"
                  className="block py-2 px-4 text-sm tracking-[0.1em] text-gray-700 hover:text-gold transition-colors"
                >
                  ACCOUNT DETAILS
                </Link>
                <Link 
                  href="/account/orders"
                  className="block py-2 px-4 text-sm tracking-[0.1em] bg-gold text-white"
                >
                  ORDER HISTORY
                </Link>
                <Link 
                  href="/account/addresses"
                  className="block py-2 px-4 text-sm tracking-[0.1em] text-gray-700 hover:text-gold transition-colors"
                >
                  ADDRESSES
                </Link>
              </nav>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              <div className="bg-white p-8 border border-gray-200">
                <h2 className="font-cormorant text-2xl tracking-[0.1em] mb-6">
                  Order History
                </h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">You haven&apos;t placed any orders yet.</p>
                    <Link 
                      href="/products"
                      className="inline-block px-6 py-2 bg-gold text-white text-sm tracking-[0.1em] hover:bg-gold/90 transition-colors"
                    >
                      START SHOPPING
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map(({ node: order }) => (
                      <div 
                        key={order.id} 
                        className="border border-gray-200 p-6 hover:border-gold transition-colors"
                      >
                        <div className="flex flex-wrap justify-between items-start mb-4">
                          <div>
                            <h3 className="font-cormorant text-xl">
                              Order {order.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Placed on {formatDate(order.processedAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-cormorant text-xl">
                              {formatPrice(order.currentTotalPrice.amount)}
                            </p>
                            <div className="mt-1 space-x-4 text-sm">
                              <span className={getStatusColor(order.financialStatus)}>
                                {order.financialStatus}
                              </span>
                              <span className={getStatusColor(order.fulfillmentStatus)}>
                                {order.fulfillmentStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="space-y-3">
                            {order.lineItems.edges.slice(0, 3).map(({ node: item }) => (
                              <div key={item.variant.id} className="flex items-center gap-4">
                                {item.variant.image && (
                                  <img 
                                    src={item.variant.image.url} 
                                    alt={item.variant.image.altText || item.title}
                                    className="w-16 h-16 object-cover"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm">{item.title}</p>
                                  {item.variant.title !== 'Default Title' && (
                                    <p className="text-xs text-gray-600">{item.variant.title}</p>
                                  )}
                                </div>
                                <p className="text-sm">
                                  {item.quantity} x {formatPrice(item.variant.price.amount)}
                                </p>
                              </div>
                            ))}
                            {order.lineItems.edges.length > 3 && (
                              <p className="text-sm text-gray-600">
                                + {order.lineItems.edges.length - 3} more items
                              </p>
                            )}
                          </div>

                          <div className="flex gap-4 mt-4 pt-4 border-t">
                            <Link 
                              href={`/account/orders/${order.id.split('/').pop()}`}
                              className="text-sm tracking-[0.1em] text-gold hover:underline"
                            >
                              VIEW DETAILS
                            </Link>
                            {order.statusUrl && (
                              <a 
                                href={order.statusUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm tracking-[0.1em] text-gold hover:underline"
                              >
                                TRACK ORDER
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}