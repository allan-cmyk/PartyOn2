/**
 * GA4 Behavior Analytics
 * Query GA4 Data API for custom events (CTA clicks, scroll depth, experiments)
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import type {
  BehaviorMetrics,
  CTAPerformance,
  CTASection,
  ScrollFunnel,
} from './types';

// Initialize GA4 Data API client
let analyticsClient: BetaAnalyticsDataClient | null = null;

function getAnalyticsClient(): BetaAnalyticsDataClient | null {
  if (analyticsClient) return analyticsClient;

  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentials) {
    console.warn('GA4 credentials not configured');
    return null;
  }

  try {
    const parsedCredentials = JSON.parse(credentials);
    analyticsClient = new BetaAnalyticsDataClient({
      credentials: parsedCredentials,
    });
    return analyticsClient;
  } catch (error) {
    console.error('Failed to parse GA4 credentials:', error);
    return null;
  }
}

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '';

/**
 * Get CTA click metrics from GA4
 */
export async function getCTAClickMetrics(
  startDate: string,
  endDate: string
): Promise<CTAPerformance[]> {
  const client = getAnalyticsClient();
  if (!client || !GA4_PROPERTY_ID) {
    return getMockCTAData();
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'customEvent:button_text' },
        { name: 'customEvent:button_url' },
        { name: 'customEvent:section' },
      ],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { value: 'cta_click' },
        },
      },
      orderBys: [
        { metric: { metricName: 'eventCount' }, desc: true },
      ],
      limit: 20,
    });

    if (!response.rows) return [];

    // Get total pageviews for click rate calculation
    const pageviews = await getTotalPageviews(startDate, endDate);

    return response.rows.map((row) => ({
      buttonText: row.dimensionValues?.[0]?.value || 'Unknown',
      buttonUrl: row.dimensionValues?.[1]?.value || '/',
      section: (row.dimensionValues?.[2]?.value || 'hero') as CTASection,
      clicks: parseInt(row.metricValues?.[0]?.value || '0', 10),
      clickRate: pageviews > 0
        ? (parseInt(row.metricValues?.[0]?.value || '0', 10) / pageviews) * 100
        : 0,
    }));
  } catch (error) {
    console.error('Error fetching CTA metrics:', error);
    return getMockCTAData();
  }
}

/**
 * Get scroll depth funnel from GA4
 */
export async function getScrollDepthMetrics(
  startDate: string,
  endDate: string
): Promise<ScrollFunnel> {
  const client = getAnalyticsClient();
  if (!client || !GA4_PROPERTY_ID) {
    return getMockScrollData();
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'customEvent:percent_scrolled' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { value: 'scroll_depth' },
        },
      },
    });

    const scrollData: Record<number, number> = { 25: 0, 50: 0, 75: 0, 100: 0 };

    if (response.rows) {
      for (const row of response.rows) {
        const percent = parseInt(row.dimensionValues?.[0]?.value || '0', 10);
        const count = parseInt(row.metricValues?.[0]?.value || '0', 10);
        if ([25, 50, 75, 100].includes(percent)) {
          scrollData[percent] = count;
        }
      }
    }

    const totalUsers = scrollData[25] || 1;

    return {
      depth25: scrollData[25],
      depth50: scrollData[50],
      depth75: scrollData[75],
      depth100: scrollData[100],
      totalUsers,
      dropoff25to50: totalUsers > 0
        ? Math.round((1 - scrollData[50] / totalUsers) * 100)
        : 0,
      dropoff50to75: scrollData[50] > 0
        ? Math.round((1 - scrollData[75] / scrollData[50]) * 100)
        : 0,
      dropoff75to100: scrollData[75] > 0
        ? Math.round((1 - scrollData[100] / scrollData[75]) * 100)
        : 0,
    };
  } catch (error) {
    console.error('Error fetching scroll metrics:', error);
    return getMockScrollData();
  }
}

/**
 * Get total pageviews for rate calculations
 */
async function getTotalPageviews(
  startDate: string,
  endDate: string
): Promise<number> {
  const client = getAnalyticsClient();
  if (!client || !GA4_PROPERTY_ID) return 10000;

  try {
    const [response] = await client.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'screenPageViews' }],
    });

    return parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
  } catch {
    return 10000;
  }
}

/**
 * Get experiment impression and conversion data from GA4
 */
export async function getExperimentMetrics(
  startDate: string,
  endDate: string,
  experimentId?: string
): Promise<Record<string, { impressions: number; clicks: number; conversions: number }>> {
  const client = getAnalyticsClient();
  if (!client || !GA4_PROPERTY_ID) {
    return {};
  }

  try {
    const dimensionFilter = experimentId
      ? {
          andGroup: {
            expressions: [
              {
                filter: {
                  fieldName: 'eventName',
                  stringFilter: { value: 'experiment_impression' },
                },
              },
              {
                filter: {
                  fieldName: 'customEvent:experiment_id',
                  stringFilter: { value: experimentId },
                },
              },
            ],
          },
        }
      : {
          filter: {
            fieldName: 'eventName',
            stringFilter: { value: 'experiment_impression' },
          },
        };

    const [response] = await client.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'customEvent:experiment_id' },
        { name: 'customEvent:variant_id' },
      ],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter,
    });

    const metrics: Record<string, { impressions: number; clicks: number; conversions: number }> = {};

    if (response.rows) {
      for (const row of response.rows) {
        const variantId = row.dimensionValues?.[1]?.value || '';
        const count = parseInt(row.metricValues?.[0]?.value || '0', 10);

        if (variantId) {
          metrics[variantId] = {
            impressions: count,
            clicks: 0,
            conversions: 0,
          };
        }
      }
    }

    return metrics;
  } catch (error) {
    console.error('Error fetching experiment metrics:', error);
    return {};
  }
}

/**
 * Aggregate behavior metrics for dashboard
 */
export async function getBehaviorMetrics(
  startDate: string,
  endDate: string
): Promise<BehaviorMetrics> {
  const [ctaPerformance, scrollFunnel] = await Promise.all([
    getCTAClickMetrics(startDate, endDate),
    getScrollDepthMetrics(startDate, endDate),
  ]);

  const totalCTAClicks = ctaPerformance.reduce((sum, cta) => sum + cta.clicks, 0);
  const totalPageviews = scrollFunnel.totalUsers;
  const overallClickRate = totalPageviews > 0 ? (totalCTAClicks / totalPageviews) * 100 : 0;

  const topPerformingCTA = ctaPerformance.length > 0
    ? ctaPerformance.reduce((best, cta) =>
        cta.clickRate > best.clickRate ? cta : best
      )
    : null;

  return {
    ctaPerformance,
    scrollFunnel,
    avgTimeToFirstClick: 8.3, // Placeholder - requires more complex GA4 query
    totalCTAClicks,
    totalPageviews,
    overallClickRate: Math.round(overallClickRate * 100) / 100,
    topPerformingCTA,
  };
}

// ============================================
// Mock Data for Development/Demo
// ============================================

function getMockCTAData(): CTAPerformance[] {
  return [
    { buttonText: 'ORDER NOW', buttonUrl: '/products', section: 'hero', clicks: 523, clickRate: 5.2 },
    { buttonText: 'START ORDERING', buttonUrl: '/products', section: 'hero', clicks: 312, clickRate: 4.1 },
    { buttonText: 'EXPLORE PACKAGES', buttonUrl: '/order', section: 'hero', clicks: 189, clickRate: 3.8 },
    { buttonText: 'WEDDINGS', buttonUrl: '/weddings', section: 'choose_path', clicks: 145, clickRate: 2.9 },
    { buttonText: 'BOAT PARTIES', buttonUrl: '/boat-parties', section: 'choose_path', clicks: 134, clickRate: 2.7 },
    { buttonText: 'BACH PARTIES', buttonUrl: '/bach-parties', section: 'choose_path', clicks: 128, clickRate: 2.6 },
    { buttonText: 'EXPLORE SERVICES', buttonUrl: '/services', section: 'services', clicks: 89, clickRate: 1.8 },
    { buttonText: 'CONTACT US', buttonUrl: '/contact', section: 'footer_cta', clicks: 45, clickRate: 0.9 },
  ];
}

function getMockScrollData(): ScrollFunnel {
  return {
    depth25: 8000,
    depth50: 5200,
    depth75: 3100,
    depth100: 2300,
    totalUsers: 10000,
    dropoff25to50: 35,
    dropoff50to75: 40,
    dropoff75to100: 26,
  };
}
