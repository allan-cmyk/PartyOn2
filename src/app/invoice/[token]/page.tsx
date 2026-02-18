'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { ReactElement } from 'react';
import { DraftOrderWithTotal, DraftOrderItem } from '@/lib/draft-orders/types';

interface InvoiceData extends DraftOrderWithTotal {
  invoiceUrl: string;
}

export default function InvoicePage(): ReactElement {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Fetch invoice data
  useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await fetch(`/api/v1/invoice/${token}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Invoice not found');
          return;
        }

        setInvoice(data.data);
      } catch {
        setError('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchInvoice();
    }
  }, [token]);

  // Handle pay now click
  const handlePayNow = async () => {
    if (!invoice) return;

    setPaymentLoading(true);
    try {
      const response = await fetch(`/api/v1/invoice/${token}/checkout`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to create checkout session');
        setPaymentLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setError('Failed to process payment');
      setPaymentLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  // Error state
  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This invoice may have expired or been cancelled.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Format date
  const deliveryDate = new Date(invoice.deliveryDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Check if paid
  const isPaid = invoice.status === 'PAID' || invoice.status === 'CONVERTED';
  const isCancelled = invoice.status === 'CANCELLED';
  const isExpired = invoice.status === 'EXPIRED' || (invoice.expiresAt && new Date(invoice.expiresAt) < new Date());

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-[#1a1a1a] rounded-t-xl text-center py-8 px-6">
          <Image
            src="/images/pod-logo-2025.png"
            alt="Party On Delivery"
            width={180}
            height={60}
            className="mx-auto mb-3"
          />
          <p className="text-white text-sm tracking-widest">PREMIUM ALCOHOL DELIVERY</p>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
          {/* Status Banner */}
          {isPaid && (
            <div className="bg-green-500 text-white px-6 py-3 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Payment Complete</span>
            </div>
          )}
          {isCancelled && (
            <div className="bg-red-500 text-white px-6 py-3 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-medium">Invoice Cancelled</span>
            </div>
          )}
          {isExpired && !isPaid && !isCancelled && (
            <div className="bg-yellow-500 text-white px-6 py-3 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Invoice Expired</span>
            </div>
          )}

          {/* Customer Info */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Hi {invoice.customerName},
            </h2>
            <p className="text-gray-600">
              {isPaid
                ? 'Thank you for your payment! Your order is confirmed.'
                : 'Here\'s your invoice. Complete your payment to confirm your order.'}
            </p>
          </div>

          {/* Delivery Info */}
          <div className="p-6 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Delivery Details
            </h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Date:</span> {deliveryDate}</p>
              <p><span className="font-medium">Time:</span> {invoice.deliveryTime}</p>
              <p>
                <span className="font-medium">Address:</span>{' '}
                {invoice.deliveryAddress}, {invoice.deliveryCity}, {invoice.deliveryState} {invoice.deliveryZip}
              </p>
              {invoice.deliveryNotes && (
                <p><span className="font-medium">Notes:</span> {invoice.deliveryNotes}</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Order Items
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-sm text-gray-500">
                    <th className="text-left py-3 px-4 font-medium">Item</th>
                    <th className="text-center py-3 px-4 font-medium">Qty</th>
                    <th className="text-right py-3 px-4 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item: DraftOrderItem, index: number) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        {item.variantTitle && (
                          <p className="text-sm text-gray-500">{item.variantTitle}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">
                        <p className="font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">${item.price.toFixed(2)} each</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Total */}
          <div className="p-6 border-b border-gray-100 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            {Number(invoice.discountAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount{invoice.discountCode ? ` (${invoice.discountCode})` : ''}</span>
                <span>-${Number(invoice.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Sales Tax</span>
              <span>${Number(invoice.taxAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>${Number(invoice.deliveryFee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-semibold text-gray-900 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>${Number(invoice.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Pay Button */}
          {!isPaid && !isCancelled && !isExpired && (
            <div className="p-6">
              <button
                onClick={handlePayNow}
                disabled={paymentLoading}
                className="w-full py-4 bg-brand-yellow hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paymentLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Pay ${Number(invoice.total).toFixed(2)}</span>
                  </>
                )}
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                Secure payment powered by Stripe
              </p>
            </div>
          )}

          {/* Paid confirmation */}
          {isPaid && (
            <div className="p-6 text-center">
              <p className="text-green-600 font-medium">
                Thank you! Your payment has been received.
              </p>
              <p className="text-gray-500 mt-1">
                We&apos;ll send you a confirmation email with your order details.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm">
          <p className="text-[#D4AF37]">Questions? Contact us at orders@partyondelivery.com</p>
          <p className="mt-2 text-gray-400">&copy; {new Date().getFullYear()} Party On Delivery. Austin, Texas.</p>
        </div>
      </div>
    </div>
  );
}
