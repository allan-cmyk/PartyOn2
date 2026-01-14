'use client';

import { useState, useEffect } from 'react';

interface SyncHistory {
  id: string;
  entityType: string;
  entityId: string;
  direction: string;
  status: string;
  errorMessage: string | null;
  syncedAt: string | null;
  createdAt: string;
}

interface SyncStatus {
  lastProductSync: string | null;
  history: SyncHistory[];
}

interface SyncResult {
  synced: number;
  failed: number;
  total: number;
  errors: string[];
}

/**
 * Admin Sync Page
 * Trigger and monitor Shopify data synchronization
 */
export default function SyncPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/v1/admin/sync');
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const triggerSync = async () => {
    setSyncing(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/v1/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: 'products' }),
      });
      const data = await response.json();

      if (data.success || data.data) {
        setLastResult(data.data);
        fetchStatus(); // Refresh status
      } else {
        alert(`Sync failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to trigger sync');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-black mb-6">Data Synchronization</h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-64" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-black mb-6">Data Synchronization</h1>

      {/* Sync Controls */}
      <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">Shopify Sync</h2>

        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {syncing ? 'Syncing...' : 'Sync Products from Shopify'}
          </button>

          {status?.lastProductSync && (
            <span className="text-black">
              Last sync: {new Date(status.lastProductSync).toLocaleString()}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-700">
          This will fetch all products from Shopify and sync them to the local database.
          Existing products will be updated, new products will be created.
        </p>
      </div>

      {/* Sync Result */}
      {lastResult && (
        <div
          className={`rounded-lg border-2 p-6 mb-6 ${
            lastResult.failed === 0 ? 'bg-green-100 border-green-400' : 'bg-yellow-100 border-yellow-400'
          }`}
        >
          <h2 className="text-lg font-semibold text-black mb-4">Sync Result</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-2xl font-bold text-green-600">{lastResult.synced}</p>
              <p className="text-sm text-black">Products Synced</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{lastResult.failed}</p>
              <p className="text-sm text-black">Failed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-black">{lastResult.total}</p>
              <p className="text-sm text-black">Total Products</p>
            </div>
          </div>

          {lastResult.errors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
              <ul className="text-sm text-black space-y-1">
                {lastResult.errors.map((error, i) => (
                  <li key={i} className="text-red-700">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Sync History */}
      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Recent Sync History</h2>

        {status?.history && status.history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 text-black font-semibold">Type</th>
                  <th className="text-left py-2 text-black font-semibold">Direction</th>
                  <th className="text-left py-2 text-black font-semibold">Status</th>
                  <th className="text-left py-2 text-black font-semibold">Time</th>
                  <th className="text-left py-2 text-black font-semibold">Error</th>
                </tr>
              </thead>
              <tbody>
                {status.history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-2 capitalize text-black">{item.entityType}</td>
                    <td className="py-2 text-black">{item.direction.replace(/_/g, ' ')}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'COMPLETED'
                            ? 'bg-green-600 text-white'
                            : item.status === 'FAILED'
                              ? 'bg-red-600 text-white'
                              : 'bg-yellow-500 text-white'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-700">
                      {item.syncedAt
                        ? new Date(item.syncedAt).toLocaleString()
                        : new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 text-red-600 max-w-xs truncate">
                      {item.errorMessage || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-700">No sync history yet</p>
        )}
      </div>

      {/* Feature Flags Section */}
      <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold text-black mb-4">Migration Controls</h2>
        <p className="text-sm text-gray-700 mb-4">
          Feature flags control which system handles each feature. Enable flags gradually to migrate
          traffic from Shopify to the custom system.
        </p>
        <a
          href="/admin/features"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Manage Feature Flags &rarr;
        </a>
      </div>
    </div>
  );
}
