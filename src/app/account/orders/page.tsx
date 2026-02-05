'use client';

import { useEffect, useState } from 'react';
import { useCustomerContext } from '@/contexts/CustomerContext';
import CustomerAuth from '@/components/CustomerAuth';
import AccountLayout from '@/components/account/AccountLayout';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default function OrderHistoryPage() {
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
        return 'text-green-600 bg-green-50';
      case 'pending':
      case 'unfulfilled':
        return 'text-yellow-600 bg-yellow-50';
      case 'refunded':
      case 'voided':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 pt-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 bg-gradient-to-br from-gray-50 to-gray-100">
        <CustomerAuth 
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          redirectTo="/account/orders"
        />
        <div className="text-center px-4">
          <h2 className="text-3xl font-cormorant mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-8">Please sign in to view your order history</p>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="px-8 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em]"
          >
            SIGN IN TO CONTINUE
          </button>
        </div>
      </div>
    );
  }

  // TODO: Fetch orders from /api/v1/orders with customer ID
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders: { node: any }[] = [];

  return (
    <AccountLayout title="Order History">
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-12">
          <div className="text-center max-w-md mx-auto">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="text-xl font-cormorant text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders appear here</p>
            <Link 
              href="/products"
              className="inline-block px-8 py-3 bg-gold-600 text-gray-900 text-sm tracking-[0.1em] hover:bg-gold-700 transition-colors rounded"
            >
              BROWSE PRODUCTS
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-xs text-gray-500 tracking-[0.1em]">TOTAL ORDERS</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(({ node }) => node.fulfillmentStatus === 'FULFILLED').length}
              </p>
              <p className="text-xs text-gray-500 tracking-[0.1em]">DELIVERED</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter(({ node }) => node.fulfillmentStatus === 'UNFULFILLED').length}
              </p>
              <p className="text-xs text-gray-500 tracking-[0.1em]">IN PROGRESS</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">
                ${orders.reduce((total, { node }) => total + parseFloat(node.currentTotalPrice.amount), 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 tracking-[0.1em]">TOTAL SPENT</p>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-cormorant tracking-[0.1em]">YOUR ORDERS</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {orders.map(({ node: order }) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          Order {order.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.financialStatus)}`}>
                          {order.financialStatus}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.fulfillmentStatus)}`}>
                          {order.fulfillmentStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(order.processedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-cormorant text-gray-900">
                        {formatPrice(order.currentTotalPrice.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {order.lineItems.edges.slice(0, 2).map(({ node: item }: { node: any }) => (
                      <div key={item.variant.id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
                        {item.variant.image && (
                          <img 
                            src={item.variant.image.url} 
                            alt={item.variant.image.altText || item.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          {item.variant.title !== 'Default Title' && (
                            <p className="text-xs text-gray-500">{item.variant.title}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">
                            {item.quantity} × {formatPrice(item.variant.price.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {order.lineItems.edges.length > 2 && (
                    <p className="text-sm text-gray-500 mb-4">
                      + {order.lineItems.edges.length - 2} more items
                    </p>
                  )}

                  {/* Order Actions */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                    <Link 
                      href={`/account/orders/${order.id.split('/').pop()}`}
                      className="inline-flex items-center space-x-2 text-gold-600 hover:text-gold-700 text-sm tracking-[0.1em]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>VIEW DETAILS</span>
                    </Link>
                    {order.statusUrl && (
                      <a 
                        href={order.statusUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-gold-600 hover:text-gold-700 text-sm tracking-[0.1em]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>TRACK ORDER</span>
                      </a>
                    )}
                    <button className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-700 text-sm tracking-[0.1em]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>DOWNLOAD INVOICE</span>
                    </button>
                    <button className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-700 text-sm tracking-[0.1em]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>REORDER</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}