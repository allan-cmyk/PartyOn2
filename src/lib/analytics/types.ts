/**
 * Analytics Types
 * TypeScript interfaces for the analytics dashboard
 */

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueChange: number;
  ordersChange: number;
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  title: string;
  revenue: number;
  quantity: number;
  imageUrl?: string;
}

export interface TrafficMetrics {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  sessionsChange: number;
  usersChange: number;
}

export interface TrafficSource {
  source: string;
  sessions: number;
  percentage: number;
}

export interface TopPage {
  path: string;
  pageviews: number;
  avgTimeOnPage?: number;
}

export interface SEOMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  impressionsChange: number;
  clicksChange: number;
}

export interface TopKeyword {
  keyword: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

export interface DashboardData {
  sales: SalesMetrics;
  dailySales: DailySales[];
  topProducts: TopProduct[];
  traffic?: TrafficMetrics;
  trafficSources?: TrafficSource[];
  topPages?: TopPage[];
  seo?: SEOMetrics;
  topKeywords?: TopKeyword[];
  lastUpdated: string;
}

export interface AnalyticsConfig {
  ga4Configured: boolean;
  searchConsoleConfigured: boolean;
  shopifyConfigured: boolean;
}
