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

// ============================================
// Customer Behavior Analytics Types
// ============================================

export type CTASection = 'hero' | 'choose_path' | 'services' | 'footer_cta' | 'navigation';

export interface CTAPerformance {
  buttonText: string;
  buttonUrl: string;
  section: CTASection;
  clicks: number;
  clickRate: number; // clicks / pageviews as percentage
}

export interface ScrollFunnel {
  depth25: number;  // users reaching 25%
  depth50: number;
  depth75: number;
  depth100: number;
  totalUsers: number;
  dropoff25to50: number;  // % drop between milestones
  dropoff50to75: number;
  dropoff75to100: number;
}

export interface BehaviorMetrics {
  ctaPerformance: CTAPerformance[];
  scrollFunnel: ScrollFunnel;
  avgTimeToFirstClick: number; // seconds
  totalCTAClicks: number;
  totalPageviews: number;
  overallClickRate: number; // percentage
  topPerformingCTA: CTAPerformance | null;
}

// ============================================
// A/B Testing Types
// ============================================

export type ExperimentStatusType = 'draft' | 'active' | 'paused' | 'completed';

export interface ExperimentVariant {
  id: string;
  name: string;
  description?: string;
  isControl: boolean;
  weight: number; // traffic percentage
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  clickRate: number; // percentage
  conversionRate: number; // percentage
}

export interface ExperimentResult {
  id: string;
  name: string;
  description?: string;
  page: string;
  elementId: string;
  status: ExperimentStatusType;
  startDate: string | null;
  endDate: string | null;
  goalMetric: string;
  goalValue?: string;
  variants: ExperimentVariant[];
  winner: string | null;
  confidence: number; // 0-100 percentage
  sampleSize: number;
  daysRunning: number;
  recommendedAction: string;
  uplift: number; // percentage improvement of best variant vs control
}

export interface ABTestResults {
  experiments: ExperimentResult[];
  activeCount: number;
  completedCount: number;
  draftCount: number;
}

export interface ExperimentsByPage {
  page: string;
  pageName: string; // friendly name like "Homepage"
  activeExperiments: ExperimentResult[];
  hasActiveTests: boolean;
}

// ============================================
// Recommendations Types
// ============================================

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationCategory = 'cta' | 'engagement' | 'conversion' | 'test' | 'content';

export interface Recommendation {
  id: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  title: string;
  description: string;
  metric: string;
  currentValue: string;
  targetValue?: string;
  estimatedImpact: string;
  actionUrl?: string;
}

// ============================================
// Extended Dashboard Data
// ============================================

export interface ExtendedDashboardData extends DashboardData {
  behavior?: BehaviorMetrics;
  experiments?: ABTestResults;
  experimentsByPage?: ExperimentsByPage[];
  recommendations?: Recommendation[];
}
