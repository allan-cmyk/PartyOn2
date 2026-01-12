/**
 * AI-Powered Recommendations Generator
 * Analyzes behavior, experiments, and sales data to generate actionable insights
 */

import type {
  BehaviorMetrics,
  ABTestResults,
  SalesMetrics,
  Recommendation,
  RecommendationPriority,
} from './types';

/**
 * Generate recommendations based on analytics data
 */
export function generateRecommendations(
  behavior: BehaviorMetrics | null,
  experiments: ABTestResults | null,
  sales: SalesMetrics | null
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Analyze behavior metrics
  if (behavior) {
    recommendations.push(...analyzeBehavior(behavior));
  }

  // Analyze A/B test results
  if (experiments) {
    recommendations.push(...analyzeExperiments(experiments));
  }

  // Analyze sales data
  if (sales) {
    recommendations.push(...analyzeSales(sales, behavior));
  }

  // Sort by priority (high > medium > low)
  const priorityOrder: Record<RecommendationPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return recommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

/**
 * Analyze behavior metrics for recommendations
 */
function analyzeBehavior(behavior: BehaviorMetrics): Recommendation[] {
  const recs: Recommendation[] = [];

  // Check scroll dropoff rates
  const { scrollFunnel } = behavior;

  if (scrollFunnel.dropoff25to50 > 50) {
    recs.push({
      id: 'scroll-dropoff-high',
      priority: 'high',
      category: 'engagement',
      title: 'High early page dropoff detected',
      description: `${scrollFunnel.dropoff25to50}% of users leave before reaching 50% of the page. Consider shortening the hero section or adding a scroll indicator to encourage further exploration.`,
      metric: 'Scroll Dropoff (25%→50%)',
      currentValue: `${scrollFunnel.dropoff25to50}%`,
      targetValue: '<30%',
      estimatedImpact: '+15-20% engagement',
    });
  } else if (scrollFunnel.dropoff25to50 > 35) {
    recs.push({
      id: 'scroll-dropoff-medium',
      priority: 'medium',
      category: 'engagement',
      title: 'Moderate scroll dropoff at hero section',
      description: `${scrollFunnel.dropoff25to50}% users drop off early. Consider testing a more compelling value proposition or adding visual cues to scroll.`,
      metric: 'Scroll Dropoff (25%→50%)',
      currentValue: `${scrollFunnel.dropoff25to50}%`,
      targetValue: '<30%',
      estimatedImpact: '+10% engagement',
    });
  }

  // Check overall CTA performance
  if (behavior.overallClickRate < 2) {
    recs.push({
      id: 'low-cta-rate',
      priority: 'high',
      category: 'cta',
      title: 'Low overall CTA click rate',
      description: `Only ${behavior.overallClickRate}% of visitors click any CTA. Consider testing more prominent buttons, clearer value propositions, or better CTA placement.`,
      metric: 'Overall CTA Click Rate',
      currentValue: `${behavior.overallClickRate}%`,
      targetValue: '>4%',
      estimatedImpact: '+50% more leads',
    });
  }

  // Analyze section performance
  const sectionClicks: Record<string, number> = {};
  for (const cta of behavior.ctaPerformance) {
    sectionClicks[cta.section] = (sectionClicks[cta.section] || 0) + cta.clicks;
  }

  const totalClicks = behavior.totalCTAClicks;
  const footerShare = (sectionClicks['footer_cta'] || 0) / totalClicks * 100;

  if (footerShare < 10 && totalClicks > 100) {
    recs.push({
      id: 'footer-underperforming',
      priority: 'medium',
      category: 'cta',
      title: 'Footer CTAs underperforming',
      description: `Only ${footerShare.toFixed(1)}% of CTA clicks come from the footer. Consider adding a sticky CTA bar or more prominent footer call-to-action.`,
      metric: 'Footer CTA Share',
      currentValue: `${footerShare.toFixed(1)}%`,
      targetValue: '>15%',
      estimatedImpact: '+$500/month potential',
    });
  }

  // Identify top performing CTA patterns
  if (behavior.topPerformingCTA) {
    const topCTA = behavior.topPerformingCTA;
    const avgRate = behavior.overallClickRate;

    if (topCTA.clickRate > avgRate * 2) {
      recs.push({
        id: 'replicate-top-cta',
        priority: 'low',
        category: 'cta',
        title: `Top CTA outperforming by ${Math.round((topCTA.clickRate / avgRate - 1) * 100)}%`,
        description: `"${topCTA.buttonText}" has ${topCTA.clickRate.toFixed(1)}% click rate vs ${avgRate.toFixed(1)}% average. Consider applying this style/copy pattern to other CTAs.`,
        metric: 'Top CTA Click Rate',
        currentValue: `${topCTA.clickRate.toFixed(1)}%`,
        estimatedImpact: 'Apply learnings to other CTAs',
      });
    }
  }

  return recs;
}

/**
 * Analyze A/B test results for recommendations
 */
function analyzeExperiments(experiments: ABTestResults): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const exp of experiments.experiments) {
    // Check for tests approaching significance
    if (exp.status === 'active' && exp.confidence >= 90 && exp.confidence < 95) {
      recs.push({
        id: `exp-approaching-${exp.id}`,
        priority: 'low',
        category: 'test',
        title: `"${exp.name}" approaching significance`,
        description: `Test is at ${exp.confidence}% confidence. Continue running for statistical significance at 95%.`,
        metric: 'Confidence Level',
        currentValue: `${exp.confidence}%`,
        targetValue: '95%',
        estimatedImpact: `${Math.abs(exp.daysRunning)} more days estimated`,
      });
    }

    // Check for tests that reached significance
    if (exp.status === 'active' && exp.confidence >= 95 && exp.winner) {
      const winningVariant = exp.variants.find((v) => v.id === exp.winner);
      recs.push({
        id: `exp-winner-${exp.id}`,
        priority: 'high',
        category: 'test',
        title: `Implement winning variant for "${exp.name}"`,
        description: `"${winningVariant?.name || 'Variant'}" won with ${exp.confidence}% confidence and ${exp.uplift > 0 ? '+' : ''}${exp.uplift}% improvement. Ready to implement in production.`,
        metric: 'Test Result',
        currentValue: `+${exp.uplift}% uplift`,
        estimatedImpact: 'Permanent conversion improvement',
        actionUrl: `/admin/experiments/${exp.id}`,
      });
    }

    // Check for tests running too long without significance
    if (exp.status === 'active' && exp.daysRunning > 30 && exp.confidence < 80) {
      recs.push({
        id: `exp-stalled-${exp.id}`,
        priority: 'medium',
        category: 'test',
        title: `Consider ending "${exp.name}"`,
        description: `Test has been running for ${exp.daysRunning} days with only ${exp.confidence}% confidence. Consider ending or redesigning the test.`,
        metric: 'Days Running',
        currentValue: `${exp.daysRunning} days`,
        targetValue: '<21 days',
        estimatedImpact: 'Free up testing resources',
        actionUrl: `/admin/experiments/${exp.id}`,
      });
    }
  }

  // Suggest new tests if none are active
  if (experiments.activeCount === 0) {
    recs.push({
      id: 'no-active-tests',
      priority: 'medium',
      category: 'test',
      title: 'No A/B tests currently running',
      description: 'Consider starting a new A/B test to continuously optimize conversion rates. Hero headlines and CTAs are good starting points.',
      metric: 'Active Tests',
      currentValue: '0',
      targetValue: '1-2 active',
      estimatedImpact: 'Continuous improvement',
      actionUrl: '/admin/experiments',
    });
  }

  return recs;
}

/**
 * Analyze sales data for recommendations
 */
function analyzeSales(
  sales: SalesMetrics,
  behavior: BehaviorMetrics | null
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Check for declining revenue
  if (sales.revenueChange < -10) {
    recs.push({
      id: 'revenue-decline',
      priority: 'high',
      category: 'conversion',
      title: 'Revenue declining significantly',
      description: `Revenue is down ${Math.abs(sales.revenueChange)}% compared to the previous period. Investigate traffic sources, pricing, and checkout abandonment.`,
      metric: 'Revenue Change',
      currentValue: `${sales.revenueChange}%`,
      targetValue: '>0%',
      estimatedImpact: 'Prevent further decline',
    });
  }

  // Check AOV opportunities
  if (sales.averageOrderValue < 150 && sales.totalOrders > 10) {
    recs.push({
      id: 'low-aov',
      priority: 'medium',
      category: 'conversion',
      title: 'Opportunity to increase average order value',
      description: `Current AOV is $${sales.averageOrderValue.toFixed(0)}. Consider upsell/cross-sell strategies, bundle offers, or minimum order incentives.`,
      metric: 'Average Order Value',
      currentValue: `$${sales.averageOrderValue.toFixed(0)}`,
      targetValue: '>$175',
      estimatedImpact: '+$25/order increase potential',
    });
  }

  // Connect behavior to sales
  if (behavior && sales.totalOrders > 0) {
    const conversionRate = (sales.totalOrders / behavior.totalPageviews) * 100;

    if (conversionRate < 1) {
      recs.push({
        id: 'low-conversion',
        priority: 'high',
        category: 'conversion',
        title: 'Low traffic-to-order conversion rate',
        description: `Only ${conversionRate.toFixed(2)}% of visitors become customers. Focus on reducing friction in the checkout process and improving product presentation.`,
        metric: 'Conversion Rate',
        currentValue: `${conversionRate.toFixed(2)}%`,
        targetValue: '>2%',
        estimatedImpact: 'Double customer acquisition',
      });
    }
  }

  return recs;
}

/**
 * Get page-specific recommendations
 */
export function getPageRecommendations(
  page: string,
  behavior: BehaviorMetrics | null
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (!behavior) return recs;

  // Filter CTAs for this page
  const pageCTAs = behavior.ctaPerformance.filter((cta) => {
    const pagePatterns: Record<string, string[]> = {
      '/': ['hero', 'choose_path', 'services', 'footer_cta'],
      '/weddings': ['hero', 'services', 'footer_cta'],
      '/boat-parties': ['hero', 'services', 'footer_cta'],
      '/bach-parties': ['hero', 'services', 'footer_cta'],
      '/order': ['hero', 'services'],
    };
    return pagePatterns[page]?.includes(cta.section);
  });

  if (pageCTAs.length > 0) {
    const avgClickRate = pageCTAs.reduce((sum, c) => sum + c.clickRate, 0) / pageCTAs.length;

    if (avgClickRate < 2) {
      recs.push({
        id: `${page}-low-engagement`,
        priority: 'medium',
        category: 'cta',
        title: `Low CTA engagement on ${page}`,
        description: `Average CTA click rate is ${avgClickRate.toFixed(1)}%. Consider A/B testing new headlines or CTA copy.`,
        metric: 'Page CTA Rate',
        currentValue: `${avgClickRate.toFixed(1)}%`,
        targetValue: '>3%',
        estimatedImpact: 'Improved page conversions',
      });
    }
  }

  return recs;
}
