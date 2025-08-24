'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ShopifyTestPage() {
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    shopName?: string;
    domain?: string;
    tokenLength?: number;
    domainConfigured?: string;
    errors?: Record<string, unknown> | Array<unknown> | string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shopify-test');
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ success: false, message: 'Failed to connect' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Shopify Connection Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4">Click the button below to test your Shopify API connection:</p>
          
          <button
            onClick={testConnection}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>

          {result && (
            <div className={`mt-6 p-4 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ Success!' : '❌ Connection Failed'}
              </h3>
              
              <div className="space-y-1 text-sm">
                <p><strong>Message:</strong> {result.message}</p>
                {result.shopName && <p><strong>Shop Name:</strong> {result.shopName}</p>}
                {result.domain && <p><strong>Domain:</strong> {result.domain}</p>}
                {result.tokenLength && <p><strong>Token Length:</strong> {result.tokenLength} characters</p>}
                {result.domainConfigured && <p><strong>Domain Configured:</strong> {result.domainConfigured}</p>}
                {result.errors && (
                  <div className="mt-2">
                    <strong>Errors:</strong>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                      {JSON.stringify(result.errors, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Configuration Status:</h3>
            <ul className="text-sm space-y-1">
              <li>• Environment file: .env.local</li>
              <li>• API credentials are hidden from client</li>
              <li>• Using Shopify Storefront API (public)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}