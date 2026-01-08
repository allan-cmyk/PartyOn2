/**
 * Google Search Console API Integration
 * Fetches SEO metrics and keyword data
 */

import { google } from 'googleapis';
import { getGoogleAuth } from './google-auth';
import { SEOMetrics, TopKeyword } from './types';

const SITE_URL = process.env.GOOGLE_SEARCH_CONSOLE_SITE;

/**
 * Format date as YYYY-MM-DD for Search Console API
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get SEO metrics from Search Console
 */
export async function getSEOMetrics(
  startDate: Date,
  endDate: Date,
  compareStartDate?: Date,
  compareEndDate?: Date
): Promise<SEOMetrics | null> {
  const auth = getGoogleAuth();
  if (!auth || !SITE_URL) return null;

  try {
    const searchconsole = google.searchconsole({ version: 'v1', auth });

    // Fetch current period
    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: [],
      },
    });

    const row = response.data.rows?.[0];
    if (!row) {
      return {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        avgPosition: 0,
        impressionsChange: 0,
        clicksChange: 0,
      };
    }

    const impressions = row.impressions || 0;
    const clicks = row.clicks || 0;
    const ctr = (row.ctr || 0) * 100;
    const avgPosition = row.position || 0;

    // Calculate change if comparison period provided
    let impressionsChange = 0;
    let clicksChange = 0;

    if (compareStartDate && compareEndDate) {
      const compareResponse = await searchconsole.searchanalytics.query({
        siteUrl: SITE_URL,
        requestBody: {
          startDate: formatDate(compareStartDate),
          endDate: formatDate(compareEndDate),
          dimensions: [],
        },
      });

      const compareRow = compareResponse.data.rows?.[0];
      if (compareRow) {
        const compareImpressions = compareRow.impressions || 0;
        const compareClicks = compareRow.clicks || 0;

        if (compareImpressions > 0) {
          impressionsChange =
            ((impressions - compareImpressions) / compareImpressions) * 100;
        }
        if (compareClicks > 0) {
          clicksChange = ((clicks - compareClicks) / compareClicks) * 100;
        }
      }
    }

    return {
      impressions,
      clicks,
      ctr: Math.round(ctr * 100) / 100,
      avgPosition: Math.round(avgPosition * 10) / 10,
      impressionsChange: Math.round(impressionsChange * 10) / 10,
      clicksChange: Math.round(clicksChange * 10) / 10,
    };
  } catch (error) {
    console.error('Search Console API error:', error);
    return null;
  }
}

/**
 * Get top keywords from Search Console
 */
export async function getTopKeywords(
  startDate: Date,
  endDate: Date,
  limit: number = 20
): Promise<TopKeyword[]> {
  const auth = getGoogleAuth();
  if (!auth || !SITE_URL) return [];

  try {
    const searchconsole = google.searchconsole({ version: 'v1', auth });

    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit: limit,
      },
    });

    return (response.data.rows || []).map((row) => ({
      keyword: row.keys?.[0] || '',
      impressions: row.impressions || 0,
      clicks: row.clicks || 0,
      ctr: Math.round((row.ctr || 0) * 10000) / 100,
      position: Math.round((row.position || 0) * 10) / 10,
    }));
  } catch (error) {
    console.error('Search Console keywords error:', error);
    return [];
  }
}

/**
 * Get top pages from Search Console (by clicks)
 */
export async function getTopSEOPages(
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>> {
  const auth = getGoogleAuth();
  if (!auth || !SITE_URL) return [];

  try {
    const searchconsole = google.searchconsole({ version: 'v1', auth });

    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['page'],
        rowLimit: limit,
      },
    });

    return (response.data.rows || []).map((row) => ({
      page: row.keys?.[0]?.replace('https://partyondelivery.com', '') || '/',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: Math.round((row.ctr || 0) * 10000) / 100,
      position: Math.round((row.position || 0) * 10) / 10,
    }));
  } catch (error) {
    console.error('Search Console pages error:', error);
    return [];
  }
}
