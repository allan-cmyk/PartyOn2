/**
 * Admin Analytics API
 * Fetches analytics data from Shopify, GA4, and Search Console
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSalesMetrics, getDailySales, getTopProducts } from '@/lib/analytics/shopify';
import { getTrafficMetrics, getTrafficSources, getTopPages } from '@/lib/analytics/google-analytics';
import { getSEOMetrics, getTopKeywords } from '@/lib/analytics/search-console';
import { isGoogleConfigured } from '@/lib/analytics/google-auth';
import { DashboardData, AnalyticsConfig } from '@/lib/analytics/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics
 * Fetches dashboard data for the specified period
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || '30d';

  // Calculate date ranges based on period
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  let startDate: Date;
  let compareStartDate: Date;
  let compareEndDate: Date;

  switch (period) {
    case '7d':
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);
      compareEndDate = new Date(startDate);
      compareStartDate = new Date(compareEndDate);
      compareStartDate.setDate(compareStartDate.getDate() - 7);
      break;
    case '30d':
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 30);
      compareEndDate = new Date(startDate);
      compareStartDate = new Date(compareEndDate);
      compareStartDate.setDate(compareStartDate.getDate() - 30);
      break;
    case '90d':
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 90);
      compareEndDate = new Date(startDate);
      compareStartDate = new Date(compareEndDate);
      compareStartDate.setDate(compareStartDate.getDate() - 90);
      break;
    default:
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 30);
      compareEndDate = new Date(startDate);
      compareStartDate = new Date(compareEndDate);
      compareStartDate.setDate(compareStartDate.getDate() - 30);
  }

  startDate.setHours(0, 0, 0, 0);

  // Check what integrations are configured
  const googleConfig = isGoogleConfigured();
  const config: AnalyticsConfig = {
    shopifyConfigured: !!process.env.SHOPIFY_ADMIN_API_TOKEN,
    ga4Configured: googleConfig.ga4,
    searchConsoleConfigured: googleConfig.searchConsole,
  };

  try {
    // Start with empty dashboard data
    const dashboardData: DashboardData = {
      sales: {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        revenueChange: 0,
        ordersChange: 0,
      },
      dailySales: [],
      topProducts: [],
      lastUpdated: new Date().toISOString(),
    };

    // Fetch all data in parallel
    const promises: Promise<void>[] = [];

    // Shopify data
    if (config.shopifyConfigured) {
      promises.push(
        (async () => {
          const [salesMetrics, dailySales, topProducts] = await Promise.all([
            getSalesMetrics(startDate, endDate, compareStartDate, compareEndDate),
            getDailySales(startDate, endDate),
            getTopProducts(startDate, endDate, 10),
          ]);
          dashboardData.sales = salesMetrics;
          dashboardData.dailySales = dailySales;
          dashboardData.topProducts = topProducts;
        })()
      );
    }

    // GA4 data
    if (config.ga4Configured) {
      promises.push(
        (async () => {
          const [trafficMetrics, trafficSources, topPages] = await Promise.all([
            getTrafficMetrics(startDate, endDate, compareStartDate, compareEndDate),
            getTrafficSources(startDate, endDate),
            getTopPages(startDate, endDate, 10),
          ]);
          if (trafficMetrics) dashboardData.traffic = trafficMetrics;
          if (trafficSources.length > 0) dashboardData.trafficSources = trafficSources;
          if (topPages.length > 0) dashboardData.topPages = topPages;
        })()
      );
    }

    // Search Console data
    if (config.searchConsoleConfigured) {
      promises.push(
        (async () => {
          const [seoMetrics, topKeywords] = await Promise.all([
            getSEOMetrics(startDate, endDate, compareStartDate, compareEndDate),
            getTopKeywords(startDate, endDate, 20),
          ]);
          if (seoMetrics) dashboardData.seo = seoMetrics;
          if (topKeywords.length > 0) dashboardData.topKeywords = topKeywords;
        })()
      );
    }

    // Wait for all data to be fetched
    await Promise.all(promises);

    return NextResponse.json({
      success: true,
      data: dashboardData,
      config,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      },
      { status: 500 }
    );
  }
}
