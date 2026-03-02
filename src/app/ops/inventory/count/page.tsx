'use client';

import { useState, useRef, ReactElement } from 'react';
import Link from 'next/link';

interface ProductCount {
  productName: string;
  estimatedQuantity: number;
  confidence: number;
  notes?: string;
}

interface CountResult {
  products: ProductCount[];
  totalItemsCounted: number;
  imageQuality: string;
  suggestions?: string[];
  processingTime: number;
  aiCountId?: string;
}

export default function AIInventoryCountPage(): ReactElement {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CountResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        newImages.push(base64);
        if (newImages.length === files.length) {
          setSelectedImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const processImages = async () => {
    if (selectedImages.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/v1/ai/inventory/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: selectedImages,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to process images');
        return;
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyResults = async () => {
    if (!result?.aiCountId) return;

    try {
      const response = await fetch(
        `/api/v1/ai/inventory/count/${result.aiCountId}/apply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`Successfully updated ${data.data.totalItemsUpdated} inventory items`);
        setResult(null);
        setSelectedImages([]);
      } else {
        setError(data.error || 'Failed to apply results');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Inventory Count</h1>
          <p className="text-gray-600 mt-1">
            Upload photos of your inventory and let AI count the products
          </p>
        </div>
        <Link
          href="/ops/inventory"
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Inventory
        </Link>
      </div>

      {/* Image Upload Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upload Images
        </h2>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, WEBP up to 10MB each
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Selected Images Preview */}
        {selectedImages.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Selected ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Process Button */}
        {selectedImages.length > 0 && (
          <button
            onClick={processImages}
            disabled={isProcessing}
            className="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
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
                Processing with AI...
              </span>
            ) : (
              `Process ${selectedImages.length} Image${selectedImages.length > 1 ? 's' : ''}`
            )}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Count Results
              </h2>
              <p className="text-sm text-gray-500">
                Processed in {(result.processingTime / 1000).toFixed(1)}s |
                Image quality: {result.imageQuality}
              </p>
            </div>
            <button
              onClick={applyResults}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Apply to Inventory
            </button>
          </div>

          {result.suggestions && result.suggestions.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">Suggestions:</p>
              <ul className="text-sm text-yellow-700 list-disc list-inside">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Total items counted: {result.totalItemsCounted}
            </p>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Confidence
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.products.map((product, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {product.productName}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {product.estimatedQuantity}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.confidence >= 0.8
                            ? 'bg-green-100 text-green-800'
                            : product.confidence >= 0.6
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {(product.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {product.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
