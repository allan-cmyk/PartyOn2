/**
 * Shopify Analytics
 * Fetches sales and product data from Shopify Admin API
 */

import { SalesMetrics, DailySales, TopProduct } from './types';

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

interface ShopifyOrder {
  id: string;
  created_at: string;
  total_price: string;
  line_items: Array<{
    product_id: number;
    title: string;
    quantity: number;
    price: string;
  }>;
}

/**
 * Fetch orders from Shopify Admin API
 */
async function fetchShopifyOrders(
  startDate: Date,
  endDate: Date
): Promise<ShopifyOrder[]> {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
    throw new Error('Shopify Admin API not configured');
  }

  const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/orders.json?status=any&created_at_min=${startDate.toISOString()}&created_at_max=${endDate.toISOString()}&limit=250`;

  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const data = await response.json();
  return data.orders || [];
}

/**
 * Calculate sales metrics from orders
 */
export async function getSalesMetrics(
  startDate: Date,
  endDate: Date,
  compareStartDate?: Date,
  compareEndDate?: Date
): Promise<SalesMetrics> {
  const orders = await fetchShopifyOrders(startDate, endDate);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseFloat(order.total_price || '0'),
    0
  );
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate change if comparison period provided
  let revenueChange = 0;
  let ordersChange = 0;

  if (compareStartDate && compareEndDate) {
    const compareOrders = await fetchShopifyOrders(compareStartDate, compareEndDate);
    const compareRevenue = compareOrders.reduce(
      (sum, order) => sum + parseFloat(order.total_price || '0'),
      0
    );
    const compareOrderCount = compareOrders.length;

    if (compareRevenue > 0) {
      revenueChange = ((totalRevenue - compareRevenue) / compareRevenue) * 100;
    }
    if (compareOrderCount > 0) {
      ordersChange = ((totalOrders - compareOrderCount) / compareOrderCount) * 100;
    }
  }

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    revenueChange: Math.round(revenueChange * 10) / 10,
    ordersChange: Math.round(ordersChange * 10) / 10,
  };
}

/**
 * Get daily sales breakdown
 */
export async function getDailySales(
  startDate: Date,
  endDate: Date
): Promise<DailySales[]> {
  const orders = await fetchShopifyOrders(startDate, endDate);

  // Group by date
  const dailyMap = new Map<string, { revenue: number; orders: number }>();

  // Initialize all dates in range
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    dailyMap.set(dateStr, { revenue: 0, orders: 0 });
    current.setDate(current.getDate() + 1);
  }

  // Aggregate orders
  orders.forEach((order) => {
    const dateStr = new Date(order.created_at).toISOString().split('T')[0];
    const existing = dailyMap.get(dateStr);
    if (existing) {
      existing.revenue += parseFloat(order.total_price || '0');
      existing.orders += 1;
    }
  });

  // Convert to array
  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue * 100) / 100,
      orders: data.orders,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get top selling products
 */
export async function getTopProducts(
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<TopProduct[]> {
  const orders = await fetchShopifyOrders(startDate, endDate);

  // Aggregate by product
  const productMap = new Map<
    string,
    { title: string; revenue: number; quantity: number }
  >();

  orders.forEach((order) => {
    order.line_items.forEach((item) => {
      const productId = String(item.product_id);
      const existing = productMap.get(productId);
      const itemRevenue = parseFloat(item.price || '0') * item.quantity;

      if (existing) {
        existing.revenue += itemRevenue;
        existing.quantity += item.quantity;
      } else {
        productMap.set(productId, {
          title: item.title,
          revenue: itemRevenue,
          quantity: item.quantity,
        });
      }
    });
  });

  // Sort by revenue and take top N
  return Array.from(productMap.entries())
    .map(([id, data]) => ({
      id,
      title: data.title,
      revenue: Math.round(data.revenue * 100) / 100,
      quantity: data.quantity,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
