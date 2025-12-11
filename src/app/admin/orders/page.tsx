'use client';

import { useState, ReactElement } from 'react';

export default function AdminOrdersPage(): ReactElement {
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const orderNum = orderNumber.trim().replace(/^#/, '');

    if (!orderNum || isNaN(parseInt(orderNum, 10))) {
      setError('Please enter a valid order number');
      return;
    }

    setIsLoading(true);

    try {
      // Verify the order exists before opening the print page
      const response = await fetch(`/api/orders/${orderNum}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Order not found');
      }

      // Open order sheet in new tab
      window.open(`/admin/order-sheet/${orderNum}`, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Order Sheet Printer
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Enter a Shopify order number to generate a printable order sheet
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="orderNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Order Number
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="e.g., 3903 or #3903"
                autoFocus
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !orderNumber.trim()}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : 'Print Order Sheet'}
            </button>
          </form>

          {/* Color Legend */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Color Legend
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: '#FCD34D' }}
                />
                <span className="text-gray-600">House Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: '#87CEEB' }}
                />
                <span className="text-gray-600">Boat Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: '#D2B48C' }}
                />
                <span className="text-gray-600">Marina (Friday)</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: '#FFB6C1' }}
                />
                <span className="text-gray-600">Marina (Sat AM)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-gray-500 text-sm mt-4">
          The order sheet will open in a new tab ready for printing
        </p>
      </div>
    </div>
  );
}
