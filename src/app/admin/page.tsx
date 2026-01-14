'use client';

import { useState, useEffect, ReactElement } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingOrders: number;
  todayOrders: number;
  totalCustomers: number;
}

interface RecentOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

interface LowStockItem {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
}

export default function AdminDashboard(): ReactElement {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/v1/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data.stats);
          setRecentOrders(data.data.recentOrders || []);
          setLowStockItems(data.data.lowStockItems || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts ?? 0}
          icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          color="blue"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockItems ?? 0}
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          color="yellow"
          href="/admin/inventory?filter=low_stock"
        />
        <StatCard
          title="Out of Stock"
          value={stats?.outOfStockItems ?? 0}
          icon="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          color="red"
          href="/admin/inventory?filter=out_of_stock"
        />
        <StatCard
          title="Today&apos;s Orders"
          value={stats?.todayOrders ?? 0}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          color="green"
          href="/admin/orders"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent orders</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${Number(order.total).toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
            <Link
              href="/admin/inventory?filter=low_stock"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </Link>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-gray-500 text-sm">No low stock items</p>
          ) : (
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Threshold: {item.threshold}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.quantity === 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {item.quantity} left
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/inventory/count"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            AI Inventory Count
          </Link>
          <Link
            href="/admin/ai-assistant"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Ask AI Assistant
          </Link>
          <Link
            href="/admin/inventory/predictions"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Stock Predictions
          </Link>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'yellow' | 'red' | 'green';
  href?: string;
}

function StatCard({ title, value, icon, color, href }: StatCardProps): ReactElement {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
  };

  const content = (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={icon}
            />
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
