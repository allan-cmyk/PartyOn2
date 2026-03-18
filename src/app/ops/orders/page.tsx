'use client';

import React, { useState, useEffect, useCallback, useRef, ReactElement } from 'react';
import Link from 'next/link';
import DraftOrdersTable from '@/components/ops/DraftOrdersTable';

// --- In Stock / Packed localStorage helpers ---
interface ItemChecks {
  [itemTitle: string]: { inStock: boolean; packed: boolean };
}

function loadChecks(orderId: string): ItemChecks {
  try {
    const raw = localStorage.getItem(`ops_order_checks_${orderId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecks(orderId: string, data: ItemChecks): void {
  localStorage.setItem(`ops_order_checks_${orderId}`, JSON.stringify(data));
}


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
  deliveryAddress: Record<string, string> | string | null;
  items: { quantity: number; title: string; productId?: string; bundleComponents?: { title: string; variantTitle: string | null; quantity: number }[] }[];
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
  selectedOrders,
  onToggleOrder,
}: {
  group: GroupedOrder;
  isExpanded: boolean;
  onToggle: () => void;
  selectedOrders: Set<string>;
  onToggleOrder: (id: string) => void;
}): ReactElement {
  const allGroupSelected = group.orders.every((o) => selectedOrders.has(o.id));
  const someGroupSelected = group.orders.some((o) => selectedOrders.has(o.id));

  const toggleAllInGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    for (const o of group.orders) {
      if (allGroupSelected) {
        if (selectedOrders.has(o.id)) onToggleOrder(o.id);
      } else {
        if (!selectedOrders.has(o.id)) onToggleOrder(o.id);
      }
    }
  };

  return (
    <>
      {/* Main Group Row */}
      <tr
        className="bg-purple-50/50 hover:bg-purple-100/50 transition-colors cursor-pointer border-l-4 border-l-purple-500"
        onClick={onToggle}
      >
        <td className="w-8 pl-2 pr-0 py-4"></td>
        <td className="w-12 px-2 py-4">
          <input
            type="checkbox"
            checked={allGroupSelected}
            ref={(el) => { if (el) el.indeterminate = someGroupSelected && !allGroupSelected; }}
            onClick={toggleAllInGroup}
            onChange={() => {}}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
          />
        </td>
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
        <tr key={order.id} className={`bg-gray-50/80 hover:bg-gray-100/80 transition-colors border-l-4 border-l-purple-300 ${selectedOrders.has(order.id) ? 'bg-blue-50/30' : ''}`}>
          <td className="w-8 pl-2 pr-0 py-3"></td>
          <td className="w-12 px-2 py-3">
            <input
              type="checkbox"
              checked={selectedOrders.has(order.id)}
              onChange={() => onToggleOrder(order.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
          </td>
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
function OrderRow({ order, selected, onToggle, onPrint }: { order: Order; selected: boolean; onToggle: () => void; onPrint?: (orderId: string) => void }): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const [checks, setChecks] = useState<ItemChecks>(() => loadChecks(order.id));
  const isPacked = order.items.length > 0 && order.items.every((item) => checks[item.title]?.packed);

  const toggleCheck = (title: string, field: 'inStock' | 'packed') => {
    setChecks((prev) => {
      const updated = { ...prev, [title]: { ...prev[title], [field]: !prev[title]?.[field] } };
      saveChecks(order.id, updated);
      return updated;
    });
  };

  return (
    <>
      <tr className={`hover:bg-blue-50/50 transition-colors group ${selected ? 'bg-blue-50/30' : ''}`}>
        <td className="w-8 pl-2 pr-0 py-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            aria-label={expanded ? 'Collapse items' : 'Expand items'}
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </td>
        <td className="w-12 px-2 py-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
        </td>
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
              title={`Part of "${order.groupOrder.name}" (${order.groupOrder.shareCode})`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {order.groupOrder.name || order.groupOrder.shareCode}
            </Link>
          )}
        </td>
        <td className="px-6 py-4">
          <Link href={`/ops/orders/${order.id}`} className="block hover:text-blue-600 transition-colors">
            <p className="font-medium text-gray-900 group-hover:text-blue-600">{order.customerName}</p>
            <p className="text-sm text-gray-500">{order.customerEmail}</p>
          </Link>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full font-semibold text-gray-700">
              {order.itemCount}
            </span>
            {isPacked && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="All items packed">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
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
            {order.deliveryAddress && (
              <p className="text-xs text-gray-400 mt-1">{formatAddress(order.deliveryAddress)}</p>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <span className="text-gray-500 text-sm">{formatDateTime(order.createdAt)}</span>
        </td>
      </tr>
      {expanded && order.items.length > 0 && (
        <tr className="bg-gray-50/80">
          <td colSpan={10} className="px-6 py-3">
            <div className="pl-10">
              <div className="flex gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">
                <span className="w-16 text-center">In Stock</span>
                <span className="w-16 text-center">Packed</span>
                <span>Item</span>
              </div>
              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-4">
                      <label className="w-16 flex justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checks[item.title]?.inStock}
                          onChange={() => toggleCheck(item.title, 'inStock')}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        />
                      </label>
                      <label className="w-16 flex justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checks[item.title]?.packed}
                          onChange={() => toggleCheck(item.title, 'packed')}
                          className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                        />
                      </label>
                      <div className="flex gap-2 text-sm">
                        <span className="text-gray-500 font-medium whitespace-nowrap">{item.quantity}x</span>
                        <span className="text-gray-700">{item.title}</span>
                      </div>
                    </div>
                    {item.bundleComponents && item.bundleComponents.length > 0 && item.bundleComponents.map((bc, bcIdx) => {
                      const bcKey = `${item.title}::${bc.title}`;
                      return (
                        <div key={`bc-${bcIdx}`} className="flex items-center gap-4 pl-4">
                          <label className="w-16 flex justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!checks[bcKey]?.inStock}
                              onChange={() => toggleCheck(bcKey, 'inStock')}
                              className="w-3.5 h-3.5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                            />
                          </label>
                          <label className="w-16 flex justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!checks[bcKey]?.packed}
                              onChange={() => toggleCheck(bcKey, 'packed')}
                              className="w-3.5 h-3.5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                            />
                          </label>
                          <div className="flex gap-2 text-xs text-gray-400">
                            <span className="whitespace-nowrap">|- {item.quantity * bc.quantity}x</span>
                            <span>{bc.title}{bc.variantTitle && bc.variantTitle !== 'Default Title' ? ` (${bc.variantTitle})` : ''}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              {onPrint && (
                <button
                  onClick={() => onPrint(order.id)}
                  className="mt-3 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Pick Sheet
                </button>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
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

  return displayItems;
}

// Format delivery address from JSON object or plain string
function formatAddress(addr: Record<string, string> | string | null): string {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  const parts = [addr.address1, addr.address2, addr.city, addr.state || addr.province, addr.zip].filter(Boolean);
  return parts.join(', ');
}

// Mobile Order Card
function MobileOrderCard({ order, selected, onToggle }: { order: Order; selected: boolean; onToggle: () => void }): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const [checks, setChecks] = useState<ItemChecks>(() => loadChecks(order.id));
  const address = formatAddress(order.deliveryAddress);

  const toggleCheck = (title: string, field: 'inStock' | 'packed') => {
    setChecks((prev) => {
      const updated = { ...prev, [title]: { ...prev[title], [field]: !prev[title]?.[field] } };
      saveChecks(order.id, updated);
      return updated;
    });
  };

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${selected ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'}`}>
      <div className="p-4">
        {/* Row 1: Checkbox + Name + Total */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/ops/orders/${order.id}`} className="font-semibold text-gray-900 hover:text-blue-600 block truncate">
                  {order.customerName}
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">
                  {formatDate(order.deliveryDate)} - {order.deliveryTime}
                </p>
              </div>
              <span className="font-bold text-gray-900 whitespace-nowrap">{formatCurrency(order.total)}</span>
            </div>

            {/* Address */}
            {address && (
              <p className="text-sm text-gray-500 mt-1 truncate">{address}</p>
            )}

            {/* Row 3: Badges + item count + chevron */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getFulfillmentColor(order.fulfillmentStatus)}`}>
                {order.fulfillmentStatus}
              </span>
              <span className="text-xs text-gray-500">{order.itemCount} items</span>
              {order.groupOrder && (
                <Link
                  href={`/ops/group-orders/${order.groupOrder.id}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full"
                >
                  {order.groupOrder.name || order.groupOrder.shareCode}
                </Link>
              )}
              <button
                onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
                className="ml-auto p-1 text-gray-400 hover:text-gray-600"
                aria-label={expanded ? 'Collapse items' : 'Expand items'}
              >
                <svg className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded items */}
      {expanded && order.items.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
          <div className="pl-7">
            <div className="flex gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              <span className="w-10 text-center">Stock</span>
              <span className="w-10 text-center">Pack</span>
              <span>Item</span>
            </div>
            <div className="space-y-1.5">
              {order.items.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-3">
                    <label className="w-10 flex justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!checks[item.title]?.inStock}
                        onChange={() => toggleCheck(item.title, 'inStock')}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      />
                    </label>
                    <label className="w-10 flex justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!checks[item.title]?.packed}
                        onChange={() => toggleCheck(item.title, 'packed')}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                      />
                    </label>
                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-500 font-medium whitespace-nowrap">{item.quantity}x</span>
                      <span className="text-gray-700">{item.title}</span>
                    </div>
                  </div>
                  {item.bundleComponents && item.bundleComponents.length > 0 && item.bundleComponents.map((bc, bcIdx) => {
                    const bcKey = `${item.title}::${bc.title}`;
                    return (
                      <div key={`bc-${bcIdx}`} className="flex items-center gap-3 pl-4">
                        <label className="w-10 flex justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!checks[bcKey]?.inStock}
                            onChange={() => toggleCheck(bcKey, 'inStock')}
                            className="w-3.5 h-3.5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                          />
                        </label>
                        <label className="w-10 flex justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!checks[bcKey]?.packed}
                            onChange={() => toggleCheck(bcKey, 'packed')}
                            className="w-3.5 h-3.5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                          />
                        </label>
                        <div className="flex gap-2 text-xs text-gray-400">
                          <span className="whitespace-nowrap">|- {item.quantity * bc.quantity}x</span>
                          <span>{bc.title}{bc.variantTitle && bc.variantTitle !== 'Default Title' ? ` (${bc.variantTitle})` : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile Group Card
function MobileGroupCard({
  group,
  isExpanded,
  onToggle,
  selectedOrders,
  onToggleOrder,
}: {
  group: GroupedOrder;
  isExpanded: boolean;
  onToggle: () => void;
  selectedOrders: Set<string>;
  onToggleOrder: (id: string) => void;
}): ReactElement {
  const allGroupSelected = group.orders.every((o) => selectedOrders.has(o.id));
  const someGroupSelected = group.orders.some((o) => selectedOrders.has(o.id));

  const toggleAllInGroup = () => {
    for (const o of group.orders) {
      if (allGroupSelected) {
        if (selectedOrders.has(o.id)) onToggleOrder(o.id);
      } else {
        if (!selectedOrders.has(o.id)) onToggleOrder(o.id);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden">
      {/* Group header */}
      <div className="p-4 bg-purple-50/50 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={allGroupSelected}
            ref={(el) => { if (el) el.indeterminate = someGroupSelected && !allGroupSelected; }}
            onClick={(e) => { e.stopPropagation(); toggleAllInGroup(); }}
            onChange={() => {}}
            className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-bold text-purple-700">{group.groupInfo.shareCode}</span>
                </div>
                <p className="text-sm text-purple-600 mt-0.5">{group.groupInfo.name}</p>
              </div>
              <span className="font-bold text-purple-700 whitespace-nowrap">{formatCurrency(group.totalAmount)}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getGroupStatusColor(group.groupInfo.status)}`}>
                {group.groupInfo.status}
              </span>
              <span className="text-xs text-gray-500">{group.orders.length} orders - {group.totalItems} items</span>
              <svg className={`w-5 h-5 ml-auto text-purple-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded sub-orders */}
      {isExpanded && (
        <div className="border-t border-purple-100 divide-y divide-gray-100">
          {group.orders.map((order) => (
            <MobileOrderCard
              key={order.id}
              order={order}
              selected={selectedOrders.has(order.id)}
              onToggle={() => onToggleOrder(order.id)}
            />
          ))}
          <div className="p-3 bg-purple-50/30">
            <Link
              href={`/ops/group-orders/${group.groupId}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
            >
              View Group Details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage(): ReactElement {
  const [view, setView] = useState<'orders' | 'invoices'>('orders');
  const [data, setData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('UNFULFILLED');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string>('');
  const [groupTypeFilter, setGroupTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('deliveryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [fulfilling, setFulfilling] = useState(false);
  const [printOrderIds, setPrintOrderIds] = useState<string[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  // Selection helpers
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const allOrderIds = (data?.orders || []).map((o) => o.id);
  const allSelected = allOrderIds.length > 0 && allOrderIds.every((id) => selectedOrders.has(id));
  const someSelected = selectedOrders.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(allOrderIds));
    }
  };

  const handleBulkFulfill = async () => {
    if (selectedOrders.size === 0) return;
    const count = selectedOrders.size;
    if (!confirm(`Mark ${count} order${count !== 1 ? 's' : ''} as fulfilled?`)) return;

    setFulfilling(true);
    try {
      const response = await fetch('/api/v1/admin/orders/bulk-fulfill', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: Array.from(selectedOrders) }),
      });
      const result = await response.json();
      if (result.success) {
        setSelectedOrders(new Set());
        fetchOrders();
      } else {
        alert('Failed to fulfill orders: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Bulk fulfill failed:', error);
      alert('Failed to fulfill orders');
    } finally {
      setFulfilling(false);
    }
  };

  // Print pick sheets
  const handlePrintOrders = (orderIds: string[]) => {
    setPrintOrderIds(orderIds);
    // Wait for state to render, then print
    setTimeout(() => window.print(), 100);
  };

  const handlePrintSelected = () => {
    if (selectedOrders.size > 0) {
      handlePrintOrders(Array.from(selectedOrders));
    } else if (data?.orders) {
      handlePrintOrders(data.orders.map((o) => o.id));
    }
  };

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
        setSelectedOrders(new Set());
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
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen print:p-0 print:bg-white">
      <div className="print:hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Link
            href="/ops/orders/create"
            className="group px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Invoice
          </Link>
          {view === 'orders' && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setView('orders')}
          className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
            view === 'orders'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Orders
        </button>
        <button
          onClick={() => setView('invoices')}
          className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
            view === 'invoices'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Invoices
        </button>
      </div>

      {/* Invoices View */}
      {view === 'invoices' && <DraftOrdersTable />}

      {/* Orders View */}
      {view === 'orders' && <>
      {/* Summary Stats */}
      {data && (
        <div className="hidden md:grid md:grid-cols-5 gap-4 mb-8">
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
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
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

        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
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

      {/* Bulk Action Bar */}
      {someSelected && (
        <div className="mb-4 flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-xl px-6 py-3 shadow-sm">
          <span className="text-sm font-semibold text-blue-800">
            {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleBulkFulfill}
            disabled={fulfilling}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {fulfilling ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Fulfilling...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark as Fulfilled
              </>
            )}
          </button>
          <button
            onClick={handlePrintSelected}
            className="px-4 py-2 bg-white border border-blue-200 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Pick Sheets
          </button>
          <button
            onClick={() => setSelectedOrders(new Set())}
            className="px-3 py-2 text-sm font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-5 bg-gray-200 rounded w-1/3" />
                      <div className="h-5 bg-gray-200 rounded w-1/5" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="flex gap-2">
                      <div className="h-5 bg-gray-200 rounded-full w-20" />
                      <div className="h-5 bg-gray-200 rounded-full w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.orders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
            <p className="text-gray-700 text-lg font-semibold">No orders found</p>
            <p className="text-gray-500 mt-1 text-sm">Try adjusting your filters</p>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setFulfillmentFilter('');
                setDeliveryTypeFilter('');
                setGroupTypeFilter('');
                setPage(1);
              }}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          processOrdersForDisplay(data?.orders || []).map((item) =>
            item.type === 'group' ? (
              <MobileGroupCard
                key={`group-${item.group.groupId}`}
                group={item.group}
                isExpanded={expandedGroups.has(item.group.groupId)}
                onToggle={() => toggleGroupExpansion(item.group.groupId)}
                selectedOrders={selectedOrders}
                onToggleOrder={toggleOrderSelection}
              />
            ) : (
              <MobileOrderCard
                key={item.order.id}
                order={item.order}
                selected={selectedOrders.has(item.order.id)}
                onToggle={() => toggleOrderSelection(item.order.id)}
              />
            )
          )
        )}
      </div>

      {/* Orders Table (Desktop) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                <th className="w-8 pl-2 pr-0 py-4"></th>
                <th className="w-12 px-2 py-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </th>
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
                    selectedOrders={selectedOrders}
                    onToggleOrder={toggleOrderSelection}
                  />
                ) : (
                  <OrderRow
                    key={item.order.id}
                    order={item.order}
                    selected={selectedOrders.has(item.order.id)}
                    onToggle={() => toggleOrderSelection(item.order.id)}
                    onPrint={(id) => handlePrintOrders([id])}
                  />
                )
              )}
            </tbody>
          </table>
        )}

      </div>

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="mt-4 px-4 md:px-6 py-4 bg-white rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="group px-3 md:px-4 py-2 md:py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-1 md:gap-2 shadow-sm"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>
          <div className="flex items-center gap-1 md:gap-2">
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
                  className={`w-9 h-9 md:w-10 md:h-10 text-sm font-semibold rounded-xl transition-all duration-200 ${
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
            className="group px-3 md:px-4 py-2 md:py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-1 md:gap-2 shadow-sm"
          >
            <span className="hidden sm:inline">Next</span>
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      </>}
      </div>{/* end print:hidden */}

      {/* Print Pick Sheets (hidden on screen, shown on print) */}
      <div ref={printRef} className="hidden print:block">
        {printOrderIds.length > 0 && data?.orders && printOrderIds.map((orderId, pageIdx) => {
          const order = data.orders.find((o) => o.id === orderId);
          if (!order) return null;
          const addr = order.deliveryAddress;
          const addrStr = addr ? formatAddress(addr) : '';
          return (
            <div key={orderId} className={`order-sheet ${pageIdx > 0 ? 'break-before-page' : ''}`} style={pageIdx > 0 ? { pageBreakBefore: 'always' } : undefined}>
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className="bg-black text-white text-lg font-bold px-3 py-1 rounded">
                    #{order.orderNumber}
                  </span>
                  <span className="text-lg font-bold">Party On Delivery</span>
                </div>
                <span className="text-xs text-gray-500">
                  Printed {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="flex gap-4 mb-3">
                <div className="flex-1 border border-gray-400 rounded p-2">
                  <div className="font-bold text-xs uppercase tracking-wide border-b border-gray-300 pb-1 mb-1">Delivery</div>
                  <div className="font-bold text-sm">
                    {new Date(order.deliveryDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                    {' '}&middot;{' '}{order.deliveryTime}
                  </div>
                  {addrStr && <div className="text-sm mt-1">{addrStr}</div>}
                </div>
                <div className="w-52 border border-gray-400 rounded p-2">
                  <div className="font-bold text-xs uppercase tracking-wide border-b border-gray-300 pb-1 mb-1">Customer</div>
                  <div className="font-bold text-sm">{order.customerName}</div>
                  <div className="text-sm">{order.customerEmail}</div>
                </div>
              </div>

              {(() => {
                const printChecks = loadChecks(order.id);
                return (
                  <table className="w-full mb-3 border-collapse text-sm">
                    <thead>
                      <tr className="border-b-2 border-black">
                        <th className="text-left py-1 px-2 font-bold">Item</th>
                        <th className="text-center py-1 px-2 w-12 font-bold">Qty</th>
                        <th className="text-center py-1 w-16 font-bold">In Stock?</th>
                        <th className="text-center py-1 w-16 font-bold">Packed?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <React.Fragment key={idx}>
                          <tr className="border-b border-gray-300">
                            <td className="py-1 px-2">
                              <span className="font-medium">{item.title}</span>
                            </td>
                            <td className="text-center py-1 px-2 font-bold text-base">{item.quantity}</td>
                            <td className="text-center py-1">
                              <span className={`inline-block w-4 h-4 border-2 border-black rounded-sm ${printChecks[item.title]?.inStock ? 'bg-black' : ''}`}>
                                {printChecks[item.title]?.inStock && (
                                  <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                            </td>
                            <td className="text-center py-1">
                              <span className={`inline-block w-4 h-4 border-2 border-black rounded-sm ${printChecks[item.title]?.packed ? 'bg-black' : ''}`}>
                                {printChecks[item.title]?.packed && (
                                  <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                            </td>
                          </tr>
                          {item.bundleComponents && item.bundleComponents.length > 0 && item.bundleComponents.map((bc, bcIdx) => {
                            const bcKey = `${item.title}::${bc.title}`;
                            return (
                              <tr key={`${idx}-bc-${bcIdx}`} className="border-b border-gray-200">
                                <td className="py-0.5 pl-6 pr-2 text-gray-500 text-xs">
                                  |- {item.quantity * bc.quantity}x {bc.title}
                                  {bc.variantTitle && bc.variantTitle !== 'Default Title' && ` (${bc.variantTitle})`}
                                </td>
                                <td></td>
                                <td className="text-center py-0.5">
                                  <span className={`inline-block w-3.5 h-3.5 border-2 border-black rounded-sm ${printChecks[bcKey]?.inStock ? 'bg-black' : ''}`}>
                                    {printChecks[bcKey]?.inStock && (
                                      <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </span>
                                </td>
                                <td className="text-center py-0.5">
                                  <span className={`inline-block w-3.5 h-3.5 border-2 border-black rounded-sm ${printChecks[bcKey]?.packed ? 'bg-black' : ''}`}>
                                    {printChecks[bcKey]?.packed && (
                                      <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                );
              })()}

              <div className="w-48 border border-gray-400 rounded overflow-hidden text-sm ml-auto">
                <div className="flex justify-between py-0.5 px-2 border-b border-gray-200">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between py-0.5 px-2 border-b border-gray-200">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-0.5 px-2 border-b border-gray-200">
                  <span>Delivery</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between py-0.5 px-2 border-b border-gray-200">
                  <span>Tax</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between py-1 px-2 bg-gray-100 font-bold text-base">
                  <span>TOTAL</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
