'use client';

import { useState, useEffect, ReactElement, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  sku?: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  locationName: string;
  lastCountedAt?: string;
}

export default function InventoryPage(): ReactElement {
  const searchParams = useSearchParams();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('filter', filter);
      if (search) params.set('search', search);

      const response = await fetch(`/api/v1/inventory?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInventory(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleUpdateQuantity = async (itemId: string) => {
    try {
      const response = await fetch(`/api/v1/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: editQuantity }),
      });

      if (response.ok) {
        await fetchInventory();
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (filter === 'low_stock') {
      return item.quantity <= item.lowStockThreshold && item.quantity > 0;
    }
    if (filter === 'out_of_stock') {
      return item.quantity === 0;
    }
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <div className="flex gap-4">
          <Link
            href="/admin/inventory/count"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            AI Count
          </Link>
          <Link
            href="/admin/inventory/predictions"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Predictions
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All
            </FilterButton>
            <FilterButton
              active={filter === 'low_stock'}
              onClick={() => setFilter('low_stock')}
            >
              Low Stock
            </FilterButton>
            <FilterButton
              active={filter === 'out_of_stock'}
              onClick={() => setFilter('out_of_stock')}
            >
              Out of Stock
            </FilterButton>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No inventory items found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reserved
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.productName}
                      </p>
                      {item.variantName && (
                        <p className="text-sm text-gray-500">{item.variantName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.sku || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.locationName}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingItem === item.id ? (
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        min={0}
                      />
                    ) : (
                      <span className="font-medium text-gray-900">
                        {item.quantity}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    {item.reservedQuantity}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StockStatus
                      quantity={item.quantity}
                      threshold={item.lowStockThreshold}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingItem === item.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id)}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingItem(item.id);
                          setEditQuantity(item.quantity);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
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

interface FilterButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function FilterButton({ children, active, onClick }: FilterButtonProps): ReactElement {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

interface StockStatusProps {
  quantity: number;
  threshold: number;
}

function StockStatus({ quantity, threshold }: StockStatusProps): ReactElement {
  if (quantity === 0) {
    return (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
        Out of Stock
      </span>
    );
  }
  if (quantity <= threshold) {
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
        Low Stock
      </span>
    );
  }
  return (
    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
      In Stock
    </span>
  );
}
