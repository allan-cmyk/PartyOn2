'use client';

interface ProfitDisplayProps {
  price: number;
  cost: number | null;
  compareAtPrice?: number | null;
  currencyCode?: string;
}

/**
 * Displays cost, profit, and margin calculations for a product
 */
export function ProfitDisplay({
  price,
  cost,
  compareAtPrice,
  currencyCode = 'USD',
}: ProfitDisplayProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);

  if (cost === null || cost === undefined) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-sm text-gray-400 italic">Cost not set - add cost to see profit margin</p>
      </div>
    );
  }

  const profit = price - cost;
  const margin = price > 0 ? (profit / price) * 100 : 0;

  // Calculate savings if there's a compare-at price
  const savings = compareAtPrice && compareAtPrice > price ? compareAtPrice - price : null;
  const savingsPercent = savings && compareAtPrice ? (savings / compareAtPrice) * 100 : null;

  const isPositiveMargin = profit > 0;
  const isLowMargin = margin > 0 && margin < 20;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      {/* Cost Row */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Cost</span>
        <span className="text-gray-700 font-medium">{formatCurrency(cost)}</span>
      </div>

      {/* Profit Row */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Profit</span>
        <span
          className={`font-medium ${
            isPositiveMargin
              ? isLowMargin
                ? 'text-yellow-600'
                : 'text-green-600'
              : 'text-red-600'
          }`}
        >
          {formatCurrency(profit)}
        </span>
      </div>

      {/* Margin Row */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Margin</span>
        <span
          className={`font-medium ${
            isPositiveMargin
              ? isLowMargin
                ? 'text-yellow-600'
                : 'text-green-600'
              : 'text-red-600'
          }`}
        >
          {margin.toFixed(1)}%
          {isLowMargin && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
              Low
            </span>
          )}
        </span>
      </div>

      {/* Savings Badge (if on sale) */}
      {savings && savingsPercent && (
        <div className="flex justify-between text-sm pt-1">
          <span className="text-gray-500">Customer Savings</span>
          <span className="text-blue-600 font-medium">
            {formatCurrency(savings)} ({savingsPercent.toFixed(0)}% off)
          </span>
        </div>
      )}
    </div>
  );
}
