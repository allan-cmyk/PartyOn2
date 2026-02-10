'use client';

import { useState, useEffect, ReactElement } from 'react';
import Link from 'next/link';

interface StockPrediction {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDaysUntilStockout: number | null;
  predictedStockoutDate: string | null;
  averageDailySales: number;
  salesTrend: 'increasing' | 'stable' | 'decreasing';
  confidence: number;
  urgency: 'critical' | 'high' | 'medium' | 'low' | 'none';
  recommendation: {
    recommendedQuantity: number;
    recommendedOrderDate: string;
    estimatedCost?: number;
    reasoning: string;
  } | null;
}

interface PredictionResult {
  predictions: StockPrediction[];
  criticalItems: StockPrediction[];
  upcomingStockouts: StockPrediction[];
  totalReorderCost?: number;
  generatedAt: string;
  method: string;
}

export default function PredictionsPage(): ReactElement {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async (useAI = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (!useAI) params.set('quick', 'true');

      const response = await fetch(`/api/v1/ai/inventory/predictions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResult(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPredictions = result?.predictions.filter((p) => {
    if (urgencyFilter === 'all') return true;
    return p.urgency === urgencyFilter;
  }) || [];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '↑';
      case 'decreasing':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Predictions</h1>
          <p className="text-gray-600 mt-1">
            AI-powered predictions for inventory management
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => fetchPredictions(false)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Quick Update
          </button>
          <button
            onClick={() => fetchPredictions(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Full AI Analysis
          </button>
          <Link
            href="/ops/inventory"
            className="px-4 py-2 text-blue-600 hover:text-blue-800"
          >
            Back to Inventory
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Critical Items</p>
            <p className="text-2xl font-bold text-red-600">
              {result.criticalItems.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Upcoming Stockouts (14d)</p>
            <p className="text-2xl font-bold text-orange-600">
              {result.upcomingStockouts.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Est. Reorder Cost</p>
            <p className="text-2xl font-bold text-gray-900">
              ${(result.totalReorderCost || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Analysis Method</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {result.method}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-2">
          {['all', 'critical', 'high', 'medium', 'low', 'none'].map((filter) => (
            <button
              key={filter}
              onClick={() => setUrgencyFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                urgencyFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Predictions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Generating predictions...
          </div>
        ) : filteredPredictions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No predictions match the filter
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Sales/Day
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Left
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recommendation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPredictions.map((prediction) => (
                <tr key={prediction.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {prediction.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Confidence: {(prediction.confidence * 100).toFixed(0)}%
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-gray-900">
                    {prediction.currentStock}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {prediction.averageDailySales.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-lg ${
                        prediction.salesTrend === 'increasing'
                          ? 'text-green-600'
                          : prediction.salesTrend === 'decreasing'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {getTrendIcon(prediction.salesTrend)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {prediction.predictedDaysUntilStockout !== null ? (
                      <span className="font-medium">
                        {prediction.predictedDaysUntilStockout}
                      </span>
                    ) : (
                      <span className="text-gray-400">90+</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                        prediction.urgency
                      )}`}
                    >
                      {prediction.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {prediction.recommendation ? (
                      <div className="text-sm">
                        <p className="text-gray-900">
                          Order {prediction.recommendation.recommendedQuantity} units
                        </p>
                        <p className="text-gray-500 text-xs">
                          {prediction.recommendation.reasoning}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
