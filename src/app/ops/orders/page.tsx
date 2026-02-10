'use client';

import { useState, useEffect, useCallback, ReactElement } from 'react';
import Link from 'next/link';

interface OrderCustomer {
  id: string;
  email: string;
  name: string;
}

interface GroupOrderInfo {
  id: string;
  shareCode: string;
  name: string;
  status: string;
}

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  financialStatus: string;
  fulfillmentStatus: string;
  customer: OrderCustomer;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  deliveryDate: string;
  deliveryTime: string;
  deliveryType: string;
  createdAt: string;
  groupOrderId: string | null;
  groupOrder: GroupOrderInfo | null;
}

// Grouped order type for accordion display
interface GroupedOrder {
  groupId: string;
  groupInfo: GroupOrderInfo;
  orders: Order[];
  totalAmount: number;
  totalItems: number;
}

// Type for display items (either individual order or grouped order)
type DisplayItem =
  | { type: 'individual'; order: Order }
  | { type: 'group'; group: GroupedOrder };

interface OrdersData {
  orders: Order[];
  pagination: { page: number; limit: number; total: number; pages: number };
  filters: {
    statuses: string[];
    financialStatuses: string[];
    fulfillmentStatuses: string[];
    deliveryTypes: string[];
  };
  summary: {
    total: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
    pendingFulfillment: number;
  };
}

// Stats card component for consistent styling
function StatCard({
  title,
  value,
  color = 'blue',
  icon,
  trend
}: {
  title: string;
  value: string | number;
  color?: 'blue' | 'green' | 'purple' | 'indigo' | 'yellow' | 'orange';
  icon?: ReactElement;
  trend?: 'up' | 'down' | 'neutral';
}): ReactElement {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
    yellow: 'from-amber-500 to-amber-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' && <span>↑</span>}
              {trend === 'down' && <span>↓</span>}
              <span>{trend === 'up' ? 'Trending up' : trend === 'down' ? 'Trending down' : 'Stable'}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        )}
      </div>
      <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${colors[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </div>
  );
}

// Filter button component
function FilterButton({
  active,
  onClick,
  children,
  icon
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: ReactElement;
}): ReactElement {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200 scale-[1.02]'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// Helper functions for formatting
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm';
    case 'PENDING':
      return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm';
    case 'CANCELLED':
      return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 shadow-sm';
    case 'COMPLETED':
    case 'DELIVERED':
      return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm';
    case 'PROCESSING':
    case 'OUT_FOR_DELIVERY':
      return 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 shadow-sm';
    default:
      return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm';
  }
}

function getFulfillmentColor(status: string): string {
  switch (status) {
    case 'FULFILLED':
    case 'DELIVERED':
      return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm';
    case 'UNFULFILLED':
      return 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200 shadow-sm';
    case 'PARTIAL':
    case 'IN_TRANSIT':
    case 'OUT_FOR_DELIVERY':
      return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm';
    default:
      return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm';
  }
}

function getGroupStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm';
    case 'LOCKED':
      return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm';
    case 'COMPLETED':
      return 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 shadow-sm';
    case 'CANCELLED':
      return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 shadow-sm';
    case 'CLOSED':
      return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300 shadow-sm';
    default:
      return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm';
  }
}

// Group Order Accordion Row Component
function GroupOrderRow({
  group,
  isExpanded,
  onToggle,
}: {
  group: GroupedOrder;
  isExpanded: boolean;
  onToggle: () => void;
}): ReactElement {
  return (
    <>
      {/* Main Group Row */}
      <tr
        className="bg-purple-50/50 hover:bg-purple-100/50 transition-colors cursor-pointer border-l-4 border-l-purple-500"
        onClick={onToggle}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              className="p-1 hover:bg-purple-200 rounded transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg
                className={`w-5 h-5 text-purple-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-bold text-purple-700 text-lg">
                  Group: {group.groupInfo.shareCode}
                </span>
              </div>
              <p className="text-sm text-purple-600 mt-0.5">{group.groupInfo.name}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-200 text-purple-700 rounded-full font-semibold text-sm">
              {group.orders.length}
            </span>
            <span className="text-gray-600 text-sm">orders</span>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full font-semibold text-purple-700">
            {group.totalItems}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <span className="font-bold text-purple-700 text-lg">{formatCurrency(group.totalAmount)}</span>
        </td>
        <td className="px-6 py-4 text-center">
          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getGroupStatusColor(group.groupInfo.status)}`}>
            {group.groupInfo.status}
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="text-gray-500 text-sm">—</span>
        </td>
        <td className="px-6 py-4">
          <div>
            <p className="font-medium text-gray-900">{formatDate(group.orders[0]?.deliveryDate || '')}</p>
            <p className="text-sm text-gray-500">{group.orders[0]?.deliveryTime || ''}</p>
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <Link
            href={`/ops/group-orders/${group.groupId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
          >
            View Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </td>
      </tr>

      {/* Expanded Sub-Orders */}
      {isExpanded && group.orders.map((order) => (
        <tr key={order.id} className="bg-gray-50/80 hover:bg-gray-100/80 transition-colors border-l-4 border-l-purple-300">
          <td className="px-6 py-3 pl-16">
            <Link href={`/ops/orders/${order.id}`} className="block">
              <span className="font-mono font-semibold text-blue-600 hover:text-blue-700">
                #{order.orderNumber}
              </span>
            </Link>
          </td>
          <td className="px-6 py-3">
            <div>
              <p className="font-medium text-gray-900 text-sm">{order.customerName}</p>
              <p className="text-xs text-gray-500">{order.customerEmail}</p>
            </div>
          </td>
          <td className="px-6 py-3 text-center">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full font-medium text-gray-700 text-sm">
              {order.itemCount}
            </span>
          </td>
          <td className="px-6 py-3 text-right">
            <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
          </td>
          <td className="px-6 py-3 text-center">
            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </td>
          <td className="px-6 py-3 text-center">
            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getFulfillmentColor(order.fulfillmentStatus)}`}>
              {order.fulfillmentStatus}
            </span>
          </td>
          <td className="px-6 py-3">
            <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
              {order.deliveryType}
            </span>
          </td>
          <td className="px-6 py-3 text-right">
            <span className="text-gray-500 text-xs">{formatDateTime(order.createdAt)}</span>
          </td>
        </tr>
      ))}
    </>
  );
}

// Regular Order Row Component
function OrderRow({ order }: { order: Order }): ReactElement {
  return (
    <tr className="hover:bg-blue-50/50 transition-colors group">
      <td className="px-6 py-4">
        <Link href={`/ops/orders/${order.id}`} className="block">
          <span className="font-mono font-bold text-blue-600 group-hover:text-blue-700 text-lg">
            #{order.orderNumber}
          </span>
        </Link>
        {order.groupOrder && (
          <Link
            href={`/ops/group-orders/${order.groupOrder.id}`}
            className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
            title={`Part of "${order.groupOrder.name}"`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {order.groupOrder.shareCode}
          </Link>
        )}
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-gray-900">{order.customerName}</p>
          <p className="text-sm text-gray-500">{order.customerEmail}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full font-semibold text-gray-700">
          {order.itemCount}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <span className="font-bold text-gray-900 text-lg">{formatCurrency(order.total)}</span>
        {order.discountCode && (
          <p className="text-xs text-green-600 font-medium">-{formatCurrency(order.discountAmount)} ({order.discountCode})</p>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getFulfillmentColor(order.fulfillmentStatus)}`}>
          {order.fulfillmentStatus}
        </span>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-gray-900">{formatDate(order.deliveryDate)}</p>
          <p className="text-sm text-gray-500">{order.deliveryTime}</p>
          <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded mt-1">
            {order.deliveryType}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <span className="text-gray-500 text-sm">{formatDateTime(order.createdAt)}</span>
      </td>
    </tr>
  );
}

// Helper function to process orders into display items (grouped or individual)
function processOrdersForDisplay(orders: Order[]): DisplayItem[] {
  const groupMap = new Map<string, Order[]>();
  const individualOrders: Order[] = [];

  // Separate orders into groups and individuals
  for (const order of orders) {
    if (order.groupOrderId && order.groupOrder) {
      const existing = groupMap.get(order.groupOrderId) || [];
      existing.push(order);
      groupMap.set(order.groupOrderId, existing);
    } else {
      individualOrders.push(order);
    }
  }

  // Build display items
  const displayItems: DisplayItem[] = [];

  // Add grouped orders
  for (const [groupId, groupOrders] of groupMap) {
    const firstOrder = groupOrders[0];
    if (firstOrder.groupOrder) {
      displayItems.push({
        type: 'group',
        group: {
          groupId,
          groupInfo: firstOrder.groupOrder,
          orders: groupOrders.sort((a, b) => a.orderNumber - b.orderNumber),
          totalAmount: groupOrders.reduce((sum, o) => sum + o.total, 0),
          totalItems: groupOrders.reduce((sum, o) => sum + o.itemCount, 0),
        },
      });
    }
  }

  // Add individual orders
  for (const order of individualOrders) {
    displayItems.push({ type: 'individual', order });
  }

  // Sort by most recent first (using the first order's createdAt for groups)
  displayItems.sort((a, b) => {
    const dateA = a.type === 'group' ? new Date(a.group.orders[0].createdAt) : new Date(a.order.createdAt);
    const dateB = b.type === 'group' ? new Date(b.group.orders[0].createdAt) : new Date(b.order.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  return displayItems;
}

export default function OrdersPage(): ReactElement {
  const [data, setData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string>('');
  const [groupTypeFilter, setGroupTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Toggle group expansion
  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (fulfillmentFilter) params.set('fulfillmentStatus', fulfillmentFilter);
      if (deliveryTypeFilter) params.set('deliveryType', deliveryTypeFilter);
      if (groupTypeFilter) params.set('groupType', groupTypeFilter);
      params.set('page', page.toString());
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('limit', '20');

      const response = await fetch(`/api/v1/admin/orders?${params}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, fulfillmentFilter, deliveryTypeFilter, groupTypeFilter, page, sortBy, sortOrder]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchOrders]);

  const exportOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (fulfillmentFilter) params.set('fulfillmentStatus', fulfillmentFilter);
      if (deliveryTypeFilter) params.set('deliveryType', deliveryTypeFilter);
      params.set('limit', '1000');

      const response = await fetch(`/api/v1/admin/orders?${params}`);
      const result = await response.json();

      if (!result.success) return;

      const headers = ['Order #', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Fulfillment', 'Delivery Date', 'Created'];
      const rows = result.data.orders.map((o: Order) => [
        o.orderNumber,
        o.customerName,
        o.customerEmail,
        o.itemCount,
        o.total.toFixed(2),
        o.status,
        o.fulfillmentStatus,
        formatDate(o.deliveryDate),
        formatDateTime(o.createdAt),
      ]);

      const csv = [headers.join(','), ...rows.map((r: (string | number)[]) => r.join(','))].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-500 mt-0.5">
                Manage and track all customer orders
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ops/orders/create"
            className="group px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Invoice
          </Link>
          <button
            onClick={() => fetchOrders()}
            className="group px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={exportOrders}
            className="group px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md shadow-green-200 hover:shadow-lg hover:shadow-green-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Orders"
            value={data.summary.total.toLocaleString()}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data.summary.totalRevenue)}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Today's Orders"
            value={data.summary.todayOrders}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(data.summary.todayRevenue)}
            color="indigo"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <StatCard
            title="Pending Fulfillment"
            value={data.summary.pendingFulfillment}
            color="orange"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative group">
              <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by order #, customer name, or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white cursor-pointer transition-all duration-200 hover:border-gray-300"
          >
            <option value="">All Statuses</option>
            {data?.filters.statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={fulfillmentFilter}
            onChange={(e) => { setFulfillmentFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white cursor-pointer transition-all duration-200 hover:border-gray-300"
          >
            <option value="">All Fulfillment</option>
            {data?.filters.fulfillmentStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={deliveryTypeFilter}
            onChange={(e) => { setDeliveryTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white cursor-pointer transition-all duration-200 hover:border-gray-300"
          >
            <option value="">All Delivery Types</option>
            {data?.filters.deliveryTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Group Order Filter */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">Order type:</span>
          <div className="flex gap-2">
            <FilterButton active={groupTypeFilter === ''} onClick={() => { setGroupTypeFilter(''); setPage(1); }}>
              All
            </FilterButton>
            <FilterButton active={groupTypeFilter === 'regular'} onClick={() => { setGroupTypeFilter('regular'); setPage(1); }}>
              Regular
            </FilterButton>
            <FilterButton active={groupTypeFilter === 'group'} onClick={() => { setGroupTypeFilter('group'); setPage(1); }}>
              Group Orders
            </FilterButton>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">Sort by:</span>
          <div className="flex gap-2">
            <FilterButton active={sortBy === 'createdAt'} onClick={() => setSortBy('createdAt')}>
              Date
            </FilterButton>
            <FilterButton active={sortBy === 'orderNumber'} onClick={() => setSortBy('orderNumber')}>
              Order #
            </FilterButton>
            <FilterButton active={sortBy === 'total'} onClick={() => setSortBy('total')}>
              Amount
            </FilterButton>
            <FilterButton active={sortBy === 'deliveryDate'} onClick={() => setSortBy('deliveryDate')}>
              Delivery
            </FilterButton>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            {sortOrder === 'asc' ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Ascending
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Descending
              </>
            )}
          </button>
          {data && (
            <span className="ml-auto text-sm text-gray-500">
              {data.pagination.total} order{data.pagination.total !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                  <div className="w-24 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/4" />
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3" />
                  </div>
                  <div className="w-24 h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
                  <div className="w-20 h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
                  <div className="w-28 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ) : data?.orders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-700 text-xl font-semibold">No orders found</p>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">Try adjusting your filters or search term to find what you&apos;re looking for</p>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setFulfillmentFilter('');
                setDeliveryTypeFilter('');
                setGroupTypeFilter('');
                setPage(1);
              }}
              className="mt-6 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Order</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Items</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Fulfillment</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Delivery</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processOrdersForDisplay(data?.orders || []).map((item) =>
                item.type === 'group' ? (
                  <GroupOrderRow
                    key={`group-${item.group.groupId}`}
                    group={item.group}
                    isExpanded={expandedGroups.has(item.group.groupId)}
                    onToggle={() => toggleGroupExpansion(item.group.groupId)}
                  />
                ) : (
                  <OrderRow key={item.order.id} order={item.order} />
                )
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="group px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                let pageNum = i + 1;
                if (data.pagination.pages > 5) {
                  if (page <= 3) pageNum = i + 1;
                  else if (page >= data.pagination.pages - 2) pageNum = data.pagination.pages - 4 + i;
                  else pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      page === pageNum
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200 scale-105'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(Math.min(data.pagination.pages, page + 1))}
              disabled={page === data.pagination.pages}
              className="group px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              Next
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
