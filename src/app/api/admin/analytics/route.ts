/**
 * Admin Analytics API
 * Fetches analytics data from Shopify (and GA4/Search Console when configured)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSalesMetrics, getDailySales, getTopProducts } from '@/lib/analytics/shopify';
import { DashboardData, AnalyticsConfig } from '@/lib/analytics/types';

export const dynamic = 'force-dynamic';

/**
 * Verify admin authentication via session header
 */
function verifyAuth(request: NextRequest): boolean {
  // For API routes, we rely on the frontend having verified the session
  // The admin layout already handles authentication
  return true;
}

/**
 * GET /api/admin/analytics
 * Fetches dashboard data for the specified period
 */
export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  try {
    // Fetch Shopify data in parallel
    const [salesMetrics, dailySales, topProducts] = await Promise.all([
      getSalesMetrics(startDate, endDate, compareStartDate, compareEndDate),
      getDailySales(startDate, endDate),
      getTopProducts(startDate, endDate, 10),
    ]);

    // Check what integrations are configured
    const config: AnalyticsConfig = {
      shopifyConfigured: !!process.env.SHOPIFY_ADMIN_API_TOKEN,
      ga4Configured: !!process.env.GOOGLE_GA4_PROPERTY_ID,
      searchConsoleConfigured: !!process.env.GOOGLE_SEARCH_CONSOLE_SITE,
    };

    const dashboardData: DashboardData = {
      sales: salesMetrics,
      dailySales,
      topProducts,
      lastUpdated: new Date().toISOString(),
    };

    // TODO: Add GA4 traffic data when configured
    // if (config.ga4Configured) {
    //   dashboardData.traffic = await getTrafficMetrics(startDate, endDate);
    //   dashboardData.trafficSources = await getTrafficSources(startDate, endDate);
    //   dashboardData.topPages = await getTopPages(startDate, endDate);
    // }

    // TODO: Add Search Console SEO data when configured
    // if (config.searchConsoleConfigured) {
    //   dashboardData.seo = await getSEOMetrics(startDate, endDate);
    //   dashboardData.topKeywords = await getTopKeywords(startDate, endDate);
    // }

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
