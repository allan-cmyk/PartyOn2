'use client';

import { useState, type ReactElement, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OrderType } from '@/lib/partners/types';

interface OrderTypeSelectorProps {
  orderTypes: OrderType[];
  partnerId: string;
}

/** Icon component for order type buttons */
function OrderTypeIcon({ icon }: { icon?: string }): ReactElement {
  const iconClass = 'w-8 h-8';

  switch (icon) {
    case 'anchor':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9 9 9 0 01-9 9zm0-18v18m0-18a3 3 0 100 6 3 3 0 000-6zm-9 9h3m12 0h3" />
        </svg>
      );
    case 'home':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
  }
}

/**
 * Order type selection section for partner pages
 * Displays order type buttons and creation form
 */
export default function OrderTypeSelector({
  orderTypes,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  partnerId, // Will be used when API integration is complete
}: OrderTypeSelectorProps): ReactElement {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [orderName, setOrderName] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ code: string; url: string } | null>(null);

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    setError('');
    setSuccess(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!orderName.trim()) {
      setError('Please enter an order name');
      return;
    }

    if (!hostEmail.trim()) {
      setError('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(hostEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create URL-safe share code from order name
      const shareCode = orderName.trim().toLowerCase().replace(/\s+/g, '-');

      // TODO: Create actual group order via API
      // For now, we'll simulate the order creation
      const orderUrl = `${window.location.origin}/group/${shareCode}`;

      // Show success and open in new tab
      setSuccess({ code: shareCode, url: orderUrl });

      // Open the order in a new tab after a brief delay
      setTimeout(() => {
        window.open(orderUrl, '_blank');
      }, 500);
    } catch {
      setError('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedType(null);
    setOrderName('');
    setHostEmail('');
    setError('');
    setSuccess(null);
  };

  return (
    <section id="start-order" className="py-16 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl text-gray-900 mb-4 tracking-wide">
            Start Your Order
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose your order type and create a shareable link for your group
          </p>
        </div>

        {/* Order Type Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {orderTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSelectType(type.id)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                selectedType === type.id
                  ? 'border-yellow-500 bg-yellow-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-brand-yellow hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  selectedType === type.id ? 'bg-yellow-500 text-gray-900' : 'bg-gray-100 text-gray-600'
                }`}>
                  <OrderTypeIcon icon={type.icon} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {type.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {type.description}
                  </p>
                </div>
                {selectedType === type.id && (
                  <svg className="w-6 h-6 text-brand-yellow" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Order Creation Form */}
        <AnimatePresence mode="wait">
          {selectedType && !success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Order Name */}
                  <div>
                    <label htmlFor="orderName" className="block text-sm font-medium text-gray-700 mb-2">
                      Order Name
                    </label>
                    <input
                      type="text"
                      id="orderName"
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="e.g., Sarah's Boat Party"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-gray-900 placeholder:text-gray-400"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      This will be the name that you send to people for them to join
                    </p>
                  </div>

                  {/* Host Email */}
                  <div>
                    <label htmlFor="hostEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="hostEmail"
                      value={hostEmail}
                      onChange={(e) => setHostEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-gray-900 placeholder:text-gray-400"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      We&apos;ll send you order updates and the checkout link
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-yellow-500 hover:bg-brand-yellow disabled:bg-brand-yellow text-gray-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Creating Order...</span>
                      </>
                    ) : (
                      'Create Order'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Order Created!
              </h3>
              <p className="text-gray-600 mb-4">
                Your order is opening in a new tab. Share this link with your group:
              </p>
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Share Code</p>
                <p className="font-mono text-lg text-gray-900 font-semibold">{success.code}</p>
              </div>
              <button
                onClick={handleReset}
                className="text-brand-yellow hover:text-yellow-600 font-medium"
              >
                Create Another Order
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
