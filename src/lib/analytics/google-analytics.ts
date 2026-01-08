/**
 * Google Analytics 4 Data API Integration
 * Fetches traffic metrics from GA4
 */

import { google } from 'googleapis';
import { getGoogleAuth } from './google-auth';
import { TrafficMetrics, TrafficSource, TopPage } from './types';

const PROPERTY_ID = process.env.GOOGLE_GA4_PROPERTY_ID;

/**
 * Format date as YYYY-MM-DD for GA4 API
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get traffic metrics from GA4
 */
export async function getTrafficMetrics(
  startDate: Date,
  endDate: Date,
  compareStartDate?: Date,
  compareEndDate?: Date
): Promise<TrafficMetrics | null> {
  const auth = getGoogleAuth();
  if (!auth || !PROPERTY_ID) return null;

  try {
    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

    // Fetch current period
    const response = await analyticsData.properties.runReport({
      property: `properties/${PROPERTY_ID}`,
      requestBody: {
        dateRanges: [
          { startDate: formatDate(startDate), endDate: formatDate(endDate) },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
      },
    });

    const row = response.data.rows?.[0];
    if (!row?.metricValues) return null;

    const sessions = parseInt(row.metricValues[0].value || '0', 10);
    const users = parseInt(row.metricValues[1].value || '0', 10);
    const pageviews = parseInt(row.metricValues[2].value || '0', 10);
    const bounceRate = parseFloat(row.metricValues[3].value || '0') * 100;
    const avgSessionDuration = parseFloat(row.metricValues[4].value || '0');

    // Calculate change if comparison period provided
    let sessionsChange = 0;
    let usersChange = 0;

    if (compareStartDate && compareEndDate) {
      const compareResponse = await analyticsData.properties.runReport({
        property: `properties/${PROPERTY_ID}`,
        requestBody: {
          dateRanges: [
            {
              startDate: formatDate(compareStartDate),
              endDate: formatDate(compareEndDate),
            },
          ],
          metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
        },
      });

      const compareRow = compareResponse.data.rows?.[0];
      if (compareRow?.metricValues) {
        const compareSessions = parseInt(
          compareRow.metricValues[0].value || '0',
          10
        );
        const compareUsers = parseInt(
          compareRow.metricValues[1].value || '0',
          10
        );

        if (compareSessions > 0) {
          sessionsChange =
            ((sessions - compareSessions) / compareSessions) * 100;
        }
        if (compareUsers > 0) {
          usersChange = ((users - compareUsers) / compareUsers) * 100;
        }
      }
    }

    return {
      sessions,
      users,
      pageviews,
      bounceRate: Math.round(bounceRate * 10) / 10,
      avgSessionDuration: Math.round(avgSessionDuration),
      sessionsChange: Math.round(sessionsChange * 10) / 10,
      usersChange: Math.round(usersChange * 10) / 10,
    };
  } catch (error) {
    console.error('GA4 API error:', error);
    return null;
  }
}

/**
 * Get traffic sources breakdown
 */
export async function getTrafficSources(
  startDate: Date,
  endDate: Date
): Promise<TrafficSource[]> {
  const auth = getGoogleAuth();
  if (!auth || !PROPERTY_ID) return [];

  try {
    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

    const response = await analyticsData.properties.runReport({
      property: `properties/${PROPERTY_ID}`,
      requestBody: {
        dateRanges: [
          { startDate: formatDate(startDate), endDate: formatDate(endDate) },
        ],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: '10',
      },
    });

    const rows = response.data.rows || [];
    const totalSessions = rows.reduce(
      (sum, row) => sum + parseInt(row.metricValues?.[0].value || '0', 10),
      0
    );

    return rows.map((row) => {
      const sessions = parseInt(row.metricValues?.[0].value || '0', 10);
      return {
        source: row.dimensionValues?.[0].value || 'Unknown',
        sessions,
        percentage:
          totalSessions > 0
            ? Math.round((sessions / totalSessions) * 1000) / 10
            : 0,
      };
    });
  } catch (error) {
    console.error('GA4 traffic sources error:', error);
    return [];
  }
}

/**
 * Get top pages by pageviews
 */
export async function getTopPages(
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<TopPage[]> {
  const auth = getGoogleAuth();
  if (!auth || !PROPERTY_ID) return [];

  try {
    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

    const response = await analyticsData.properties.runReport({
      property: `properties/${PROPERTY_ID}`,
      requestBody: {
        dateRanges: [
          { startDate: formatDate(startDate), endDate: formatDate(endDate) },
        ],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: String(limit),
      },
    });

    return (response.data.rows || []).map((row) => ({
      path: row.dimensionValues?.[0].value || '/',
      pageviews: parseInt(row.metricValues?.[0].value || '0', 10),
      avgTimeOnPage: Math.round(
        parseFloat(row.metricValues?.[1].value || '0')
      ),
    }));
  } catch (error) {
    console.error('GA4 top pages error:', error);
    return [];
  }
}
